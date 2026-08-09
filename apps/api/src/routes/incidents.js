import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prismaClient.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { publishIncidentCreated } from "../queue.js";

const router = Router();

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(["NEAR_MISS", "INJURY", "HAZARD"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  location: z.string().optional(),
});

// Create an incident report (any authenticated user)
router.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const incident = await prisma.incident.create({
    data: { ...parsed.data, reporterId: req.user.sub },
  });

  // Fire-and-forget: the worker service decides what, if anything, to notify on.
  publishIncidentCreated(incident).catch((err) =>
    console.error("Failed to publish incident.created event:", err)
  );

  res.status(201).json(incident);
});

// List incidents, optionally filtered by status/severity/category.
// Capped and paginated — without this, response size grows unbounded
// with the table (see load-test/README.md for the load test that caught it).
router.get("/", requireAuth, async (req, res) => {
  const { status, severity, category } = req.query;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  const incidents = await prisma.incident.findMany({
    where: {
      ...(status && { status }),
      ...(severity && { severity }),
      ...(category && { category }),
    },
    include: { reporter: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
  res.json(incidents);
});

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const TIMELINE_DAYS = 14;

// Aggregate counts computed in the database — never by shipping the
// full table to the client. Must stay above /:id so Express doesn't
// treat "stats" as an id param.
router.get("/stats", requireAuth, requireRole("MANAGER"), async (req, res) => {
  const [total, byStatusRaw, bySeverityRaw, timelineRaw] = await Promise.all([
    prisma.incident.count(),
    prisma.incident.groupBy({ by: ["status"], _count: true }),
    prisma.incident.groupBy({ by: ["severity"], _count: true }),
    prisma.$queryRaw`
      SELECT DATE_TRUNC('day', "createdAt")::date AS day, severity, COUNT(*)::int AS count
      FROM "Incident"
      WHERE "createdAt" >= NOW() - (${TIMELINE_DAYS} || ' days')::interval
      GROUP BY day, severity
      ORDER BY day ASC
    `,
  ]);

  const byStatus = Object.fromEntries(byStatusRaw.map((r) => [r.status, r._count]));
  const bySeverity = Object.fromEntries(bySeverityRaw.map((r) => [r.severity, r._count]));

  // Zero-fill every day in the window so the chart doesn't skip gaps.
  const byDay = new Map();
  for (let i = TIMELINE_DAYS - 1; i >= 0; i--) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    const key = date.toISOString().slice(0, 10);
    byDay.set(key, { date: key, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 });
  }
  for (const row of timelineRaw) {
    const key = row.day.toISOString().slice(0, 10);
    if (byDay.has(key) && SEVERITIES.includes(row.severity)) {
      byDay.get(key)[row.severity] = row.count;
    }
  }

  res.json({ total, byStatus, bySeverity, timeline: [...byDay.values()] });
});

router.get("/:id", requireAuth, async (req, res) => {
  const incident = await prisma.incident.findUnique({
    where: { id: req.params.id },
    include: { reporter: { select: { id: true, name: true, email: true } } },
  });
  if (!incident) return res.status(404).json({ error: "Not found" });
  res.json(incident);
});

const updateStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED"]),
});

// Only managers can change status
router.patch("/:id/status", requireAuth, requireRole("MANAGER"), async (req, res) => {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const incident = await prisma.incident.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status },
  });

  res.json(incident);
});

export default router;
