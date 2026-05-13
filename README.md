# Civic Issue Reporting and Management System

A full-stack capstone project for reporting, tracking, and resolving day-to-day civic issues such as potholes, garbage overflow, drainage problems, water complaints, and broken streetlights.

## Project Summary

Local governments often struggle to identify and resolve civic complaints quickly because citizens do not always have a simple, transparent reporting system. This project addresses that problem with a citizen-facing reporting platform and an admin-facing operations dashboard.

Citizens can submit issues with text, coordinates, address details, and image evidence. Municipal staff can view those reports, filter them, assign departments, update statuses, and monitor resolution activity from a centralized interface.

## Problem Background

Many civic issues remain unresolved because reporting is fragmented, manual, or difficult to track. Residents may repeatedly encounter the same issue without any visibility into whether it has been acknowledged, assigned, or resolved.

This project is designed to improve:

- citizen participation
- issue visibility
- municipal workflow tracking
- accountability through status updates and notifications

## Objective

The objective of this system is to create a practical digital workflow where:

- citizens can report issues easily
- location and evidence can be attached to reports
- administrators can manage incoming civic complaints efficiently
- issues can move through a visible resolution pipeline
- notifications and status tracking improve transparency

## Current Project Type

This is currently a responsive web platform, not a dedicated mobile app. It supports cross-device browser use and provides separate citizen and admin experiences.

## Tech Stack

- Frontend: Next.js 15, React 18, Tailwind CSS
- Backend: Next.js Route Handlers (single app backend)
- Database: MongoDB Atlas with Mongoose
- Authentication: JWT
- Uploads: Multer + Cloudinary-ready upload service
- Maps: Google Maps JavaScript API
- Realtime Sync: Fast polling + backend event hooks
- Automation: Vercel Cron route (`/api/cron/auto-resolve`)
- Deployment: Single Vercel project (client)

## Folder Structure

```text
cap_project/
  client/   Next.js app (UI + API route handlers)
```

## Current Implemented Features

### Citizen Features

- User registration
- User login
- Citizen dashboard
- Submit issue with title, description, category, address, latitude, longitude, and image
- Upload image file or provide image URL
- Browser GPS support to fill coordinates
- Track submitted issues
- Filter own issues by status
- Edit issue when allowed by workflow rules
- Delete issue
- Receive issue notifications
- Mark notifications as read
- View issue locations on a map

### Admin Features

- Admin registration
- Admin login
- Admin dashboard with issue statistics
- Filter issues by date range
- Filter issues by category
- Filter issues by status
- Bulk status update
- Bulk department assignment
- Edit individual issue details
- Delete issues
- Monitor stale pending issues
- View issue metadata and geolocation

### Backend Features

- JWT-based authentication
- Role-based access for `user` and `admin`
- Protected issue APIs
- Issue CRUD operations
- Admin APIs for filter, stats, and bulk update
- Notification APIs
- MongoDB persistence with Mongoose models
- Issue status timeline
- Notification generation on status changes
- Socket.IO issue update hooks
- Auto-resolve job for old pending issues
- Vercel-compatible serverless API entry

## Supported Categories

- garbage
- road
- electricity
- water
- drainage
- streetlight
- sanitation
- other

## Supported Departments

- Sanitation
- Road Works
- Electricity Board
- Water Department
- Urban Services
- Zonal Response Team

## Current Workflow

1. A citizen signs up or logs in.
2. The citizen submits an issue with description, category, image, and location.
3. The issue is stored in MongoDB with default `pending` status.
4. Admin users review the queue from the admin dashboard.
5. Admins filter, assign departments, and update issue statuses.
6. Status changes create notifications for the reporting citizen.
7. Citizens can revisit their dashboard to track progress.

## API Endpoints

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

### Health

- `GET /api/health`

## Local Setup

### Install Dependencies

```bash
npm install
npm install --workspace client
```

### Frontend Environment

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
ADMIN_REGISTRATION_SECRET=1234
OTP_EXPIRY_MINUTES=10
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_VERIFY_ATTEMPTS=5
OTP_HASH_SECRET=your_otp_hash_secret
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
AUTO_RESOLVE_OLD_ISSUES=false
AUTO_RESOLVE_DAYS=15
CRON_SECRET=your_vercel_cron_secret
```

### Run Locally

Start single Next.js app (frontend + backend route handlers):

```bash
npm run dev
```

## Deployment

### Single App Deployment

- Platform: Vercel
- Root Directory: `client`
- Add all environment variables from `client/.env.example`

### Production Activation Checklist

To fully activate production hardening in single-app deployment:

1. Add `ADMIN_REGISTRATION_SECRET` to the Vercel project.
2. Add `CRON_SECRET` to the Vercel project.
3. Keep `AUTO_RESOLVE_OLD_ISSUES=true` if you want stale issue auto-resolution enabled.
4. Redeploy after saving those variables.
5. Confirm cron setup in Vercel by checking:
   `Settings -> Cron Jobs`
6. Test secure admin creation using:
   `POST /api/auth/register-admin`
7. Test the scheduler manually with the production app URL:
   `GET /api/cron/auto-resolve`
   using header:
   `Authorization: Bearer <CRON_SECRET>`

When these steps are completed and the app is redeployed, admin security and the production-safe auto-resolve scheduler will be active in production.

### Current Deployed URL

- App (UI + API): `https://cap-project-client-one.vercel.app`

## Feature Review Against the Project Description

The given capstone description expects a mobile-first civic issue system with smart routing, prioritization, multimedia reporting, live mapping, analytics, and transparent status updates. The current project already covers a strong MVP, but it does not yet implement every advanced requirement.

### Fully or Strongly Covered

- Citizen issue reporting
- Image-based evidence
- Location coordinates in reports
- Admin management dashboard
- Category and status filtering
- Department assignment
- Citizen issue tracking
- Notifications on progress changes
- Interactive issue map support
- Responsive cross-device web usage
- Backend API structure for future extension

### Partially Covered

- Automatic location tagging
  GPS support exists, but reporting is not fully automatic in every case.

- Realtime updates
  Socket.IO hooks exist, but persistent realtime behavior is limited on Vercel serverless hosting.

- Analytics and reporting
  Basic issue counts and category summaries exist, but advanced municipal performance analytics are not implemented.

- Multimedia handling at scale
  Image upload support exists, but high-volume media optimization and processing pipelines are not implemented.

### Missing Compared to the Full Description

- Voice explanation or audio note upload
- Automated routing engine based on metadata and location
- Priority scoring or urgency inference
- Heatmap or hotspot visualization
- Explicit acknowledgment stage
- Citizen-admin communication thread
- Departmental response-time analytics
- Trend analytics and operational effectiveness reporting
- Dedicated mobile app build
- Scalable queue or background processing architecture for spikes

## What Is Missing in Simple Terms

Right now the project works well as a civic issue reporting MVP, but it is still missing the "smart city operations" layer. The main missing upgrades are:

- automatic department routing
- urgency and priority detection
- voice reporting
- advanced analytics
- deeper communication workflow
- hotspot-based map intelligence

## Suggested Future Improvements

- Add voice note recording for issue submission
- Add automatic routing based on category and coordinates
- Add issue priority scoring
- Add heatmap view for high-density complaint areas
- Add acknowledgment and comment thread workflow
- Add dashboard charts for response time and department performance
- Add SLA tracking
- Add native mobile app or PWA improvements
- Move realtime features to infrastructure better suited for long-lived socket connections

## Project Strengths

- Clear separation between citizen and admin workflows
- Strong full-stack integration
- Practical civic use case
- Authentication and authorization implemented
- Database-backed issue lifecycle
- Deployed frontend and backend
- Good foundation for future capstone expansion

## Limitations

- No audio support
- No auto-routing
- No priority engine
- Limited analytics depth
- Realtime support depends on hosting constraints
- Web-first instead of mobile-app-first

## Final Evaluation

This project already demonstrates a solid and functional civic issue management MVP. It successfully covers reporting, tracking, admin triage, notifications, map integration, and deployment. From a capstone perspective, it shows a meaningful real-world problem, a complete working product, and a strong technical foundation.

The biggest gap between the current implementation and the full project description is not basic functionality. The biggest gap is intelligent automation, richer analytics, and more advanced citizen-government interaction features.

## Notes

- `AUTO_RESOLVE_OLD_ISSUES=true` enables cron-based stale issue resolution
- `AUTO_RESOLVE_DAYS=15` defines the stale pending threshold
- Without Cloudinary credentials, development can still use a direct `imageUrl`
- Without a Google Maps API key, the map falls back to coordinate-based location display
