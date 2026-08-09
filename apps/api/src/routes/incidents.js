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

// List incidents, optionally filtered by status/severity/category
router.get("/", requireAuth, async (req, res) => {
  const { status, severity, category } = req.query;
  const incidents = await prisma.incident.findMany({
    where: {
      ...(status && { status }),
      ...(severity && { severity }),
      ...(category && { category }),
    },
    include: { reporter: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(incidents);
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
