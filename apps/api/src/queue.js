import { Queue } from "bullmq";
import IORedis from "ioredis";

// BullMQ requires this to be null on the underlying ioredis connection.
const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const incidentEvents = new Queue("incident-events", { connection });

export async function publishIncidentCreated(incident) {
  await incidentEvents.add("incident.created", {
    incidentId: incident.id,
    title: incident.title,
    severity: incident.severity,
    category: incident.category,
    location: incident.location,
  });
}
