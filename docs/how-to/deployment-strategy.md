# Deployment Strategy & Infrastructure Guide

This document outlines the recommended production infrastructure for the wedding invitation application, optimized for the Cloudflare Workers free tier and Neon PostgreSQL.

## 1. Backend (API)
**Provider**: Cloudflare Workers
**Framework**: Hono

### CPU Time Management (The 10ms Limit)
Cloudflare's free tier allows **10ms of CPU time** per request. 
*   **CPU Time vs. Duration**: The timer only ticks when the Worker is processing code. It **stops** while waiting for the database (I/O).
*   **Neon Cold Starts**: If Neon is waking up, the "Wall-clock" time might be high (2-3s), but the CPU time used will remain near 0ms.

### Connection Optimization (Critical)
To stay under the 10ms limit, direct TCP connections to Postgres should be avoided due to the SSL handshake overhead.

**Option A: Cloudflare Hyperdrive (Recommended)**
*   Hyperdrive maintains a warm pool of connections.
*   Offloads SSL/TCP handshakes to Cloudflare's infrastructure.
*   Reduces Worker CPU usage for connections from ~15ms to **< 1ms**.

**Option B: Neon Serverless Driver (HTTP)**
*   Uses `@neondatabase/serverless` to query via HTTP fetch.
*   Eliminates TCP overhead entirely.

---

## 2. Database (DB)
**Provider**: Neon (PostgreSQL)

### Setup Steps:
1.  Create a project in [Neon.tech](https://neon.tech).
2.  Execute migrations in `src/server/db/` (001 to 004).
3.  Configure **Hyperdrive** in the Cloudflare Dashboard using the Neon connection string.
4.  Add the Hyperdrive binding to `wrangler.jsonc`.

---

## 3. Frontend (UI)
**Provider**: Cloudflare Pages (or Vercel/Netlify)

### Configuration:
*   **Build Command**: `npm run build`
*   **Output Directory**: `dist`
*   **Environment Variables**:
    *   `VITE_API_URL`: URL of your deployed Worker.
    *   `VITE_INVITATION_UID`: `shaun-manon-2027`

---

## 4. Environment Variables Checklist
| Variable | Value | Location |
|----------|-------|----------|
| `DATABASE_URL` | Postgres Connection String | Worker Secrets |
| `ADMIN_SECRET` | Your private dashboard key | Worker Secrets |
| `VITE_API_URL` | Worker production URL | Pages Env |
| `VITE_INVITATION_UID` | `shaun-manon-2027` | Pages Env |

## 5. Deployment Workflow
1.  **DB**: Provision Neon and run SQL migrations.
2.  **BE**: Deploy Worker with `wrangler deploy`.
3.  **FE**: Deploy UI via Pages integration with GitHub.
4.  **Verification**: Access `/health` on the backend and `/admin` on the frontend.
