# SiteGuard — Site Incident & Safety Reporting Platform

A full-stack safety incident reporting system for high-risk work sites (construction, oil & gas). Frontline workers report hazards, near-misses, and injuries; safety managers triage and track them on a live dashboard, with automatic alerts on high-severity reports.

## Architecture

Three independently deployable services, containerized and orchestrated with Docker Compose:

```
┌──────────┐      ┌─────────────┐      ┌──────────────┐
│  React   │ ───▶ │  Express    │ ───▶ │  PostgreSQL  │
│ frontend │      │  API        │      │              │
│ (nginx)  │ ◀─── │             │ ◀─── │              │
└──────────┘      └──────┬──────┘      └──────────────┘
                          │ publishes
                          │ incident.created
                          ▼
                   ┌─────────────┐      ┌──────────────┐
                   │    Redis    │ ───▶ │   Worker     │
                   │  (BullMQ)   │      │  service     │
                   └─────────────┘      └──────┬───────┘
                                                │ writes alert
                                                ▼
                                          PostgreSQL
```

The API and worker are separate services with independent deploy lifecycles, communicating asynchronously over a Redis-backed queue — not a shared in-process function call. The worker decides notification policy (which severities trigger an alert) independently of the API.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS, Recharts |
| API | Node.js, Express, Prisma, JWT auth, Zod validation |
| Worker | Node.js, BullMQ, Prisma |
| Database | PostgreSQL |
| Queue | Redis (BullMQ) |
| Containerization | Docker, Docker Compose (multi-stage builds, nginx for static serving) |

## Features

- JWT authentication with two roles: **Worker** (reports incidents) and **Safety Manager** (triages, updates status, sees analytics)
- Incident reporting: category, severity, location, description
- Manager dashboard: live stats, severity breakdown chart, filterable incident table, inline status updates
- Async alerting: high/critical-severity incidents automatically generate a notification via the worker service, surfaced as a live-polling alerts bell in the UI
- Role-based access control enforced server-side (not just hidden in the UI)

## Running locally

Requires Docker Desktop.

```bash
docker compose up --build
```

This brings up Postgres, Redis, the API, the worker, and the frontend. Migrations run automatically on API/worker startup.

- Frontend: http://localhost:8080
- API: http://localhost:4000

Sign up as either a Worker or a Safety Manager from the app's signup screen.

## Project structure

```
apps/
  api/      Express REST API (auth, incidents, notifications)
  worker/   Standalone service consuming incident events off Redis
  web/      React frontend
docker-compose.yml
```
