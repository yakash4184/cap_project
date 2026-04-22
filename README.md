# Civic Issue Reporting and Management System

Production-style full-stack civic issue platform with citizen reporting, admin workflows, geolocation, image uploads, notifications, and optional realtime updates.

## Stack

- Frontend: Next.js App Router, React, Tailwind CSS
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT with citizen/admin roles
- Uploads: Cloudinary-ready upload pipeline
- Maps: Google Maps JavaScript API
- Realtime: Socket.IO
- Automation: Daily cron hook for auto-resolving stale pending issues

## Project Structure

```text
civic-issue-management-system/
  client/    Next.js frontend
  server/    Express API
```

## Quick Start

1. Install dependencies:

```bash
npm install
npm install --workspace client
npm install --workspace server
```

2. Copy env files:

```bash
cp client/.env.example client/.env.local
cp server/.env.example server/.env
```

3. Fill MongoDB, JWT, Cloudinary, and Google Maps keys.

4. Run backend and frontend in separate terminals:

```bash
npm run dev:server
npm run dev:client
```

## API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Issues

- `POST /api/issues/create`
- `GET /api/issues/all`
- `GET /api/issues/:id`
- `PUT /api/issues/update/:id`
- `DELETE /api/issues/:id`

### Admin

- `GET /api/admin/filter`
- `GET /api/admin/stats`
- `PUT /api/admin/bulk-update`

### Notifications

- `GET /api/notifications`
- `PUT /api/notifications/:id/read`

## Deployment

- Frontend: Vercel
- Backend: Render or Railway
- Database: MongoDB Atlas
- Uploads: Cloudinary

### Vercel Notes

- Import this repository into Vercel.
- Set the Vercel Root Directory to `client`.
- Add `NEXT_PUBLIC_API_BASE_URL` in Vercel project environment variables.
- Deploy the Express backend separately on Render or Railway, then point the frontend env var to that backend URL.

## Notes

- `AUTO_RESOLVE_OLD_ISSUES=true` enables the daily cron job.
- `AUTO_RESOLVE_DAYS=15` controls the stale issue threshold.
- Without Cloudinary credentials, the API accepts a direct `imageUrl` in the request body for development.

# Capstone_Project-
