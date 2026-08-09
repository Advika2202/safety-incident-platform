import { Router } from "express";
import { prisma } from "../prismaClient.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// Alerts written by the worker service after processing incident.created events.
router.get("/", requireAuth, requireRole("MANAGER"), async (req, res) => {
  const notifications = await prisma.notification.findMany({
    include: { incident: { select: { id: true, title: true, status: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  res.json(notifications);
});

export default router;
