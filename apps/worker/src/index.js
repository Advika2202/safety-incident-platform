import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "./prismaClient.js";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const NOTIFY_SEVERITIES = new Set(["HIGH", "CRITICAL"]);

const worker = new Worker(
  "incident-events",
  async (job) => {
    if (job.name !== "incident.created") return;

    const { incidentId, title, severity, location } = job.data;
    console.log(`[worker] received incident.created: ${title} (${severity})`);

    if (!NOTIFY_SEVERITIES.has(severity)) {
      console.log(`[worker] severity ${severity} below alert threshold, skipping`);
      return;
    }

    const message = `${severity} severity ${job.data.category?.replace("_", " ").toLowerCase() ?? "incident"} reported: "${title}"${location ? ` at ${location}` : ""}`;

    await prisma.notification.create({
      data: { incidentId, message, severity },
    });

    console.log(`[worker] alert created: ${message}`);
  },
  { connection }
);

worker.on("failed", (job, err) => {
  console.error(`[worker] job ${job?.id} failed:`, err);
});

console.log("[worker] listening on queue 'incident-events'");
