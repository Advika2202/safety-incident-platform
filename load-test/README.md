# Load testing

`incident-load-test.js` uses [k6](https://k6.io) to simulate 50 concurrent users hitting the two hottest paths — a worker filing an incident report, a manager pulling the live incident feed — ramping up over 20s, holding at 50 VUs for 40s, then ramping down.

## Running it

```bash
docker compose up -d
k6 run load-test/incident-load-test.js
```

Point it elsewhere with `BASE_URL=https://your-api k6 run load-test/incident-load-test.js`.

## What it caught

The first run against `GET /api/incidents` failed its own latency threshold:

| Metric | Result |
|---|---|
| p95 latency | 2.47s (threshold: <500ms) ❌ |
| Error rate | 0% |
| Data transferred | 267 MB over ~1,000 requests |

0% errors, but latency blew up as the run progressed. The cause: the endpoint had no pagination, so it returned the *entire* incidents table on every single request — and the table was growing in real time as the same test created incidents. Every manager polling the dashboard was re-downloading a linearly growing payload.

**Fix:** capped the endpoint at 50 results per request (`take`/`skip` in Prisma) and added indexes on `createdAt`, `status`, `severity`, and `category` to support the sort and filter patterns the API actually uses.

Re-run against a *larger* table (~1,000 pre-existing rows, growing to ~3,000+ during the run):

| Metric | Before | After |
|---|---|---|
| p95 latency | 2.47s | **15.47ms** |
| Threshold | failed | passed |
| Throughput | 25.7 req/s | 51.5 req/s |
| Data transferred | 267 MB | 53 MB |

A ~160x drop in p95 latency, handling roughly double the throughput, on a bigger dataset.
