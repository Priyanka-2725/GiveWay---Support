# GiveWay Full-Stack Migration Report

## Summary

GiveWay is now structured as a Next.js 14 frontend plus a Node.js/Express backend backed by PostgreSQL through Prisma. The frontend API layer no longer uses local mock persistence for application operations; it sends Axios requests to the Express API configured by `NEXT_PUBLIC_API_URL`.

## Firebase Removal Report

Current source scan result:

- No Firebase SDK dependency in `package.json`.
- No Firebase imports in `src/`, `backend/src/`, or `prisma/`.
- No Firebase initialization calls such as `initializeApp`.
- No Firebase public or server environment variables in `.env`.
- No Firebase Auth, Firestore, Storage, Functions, App Check, Hosting, or security rules remain in active source.

The previous Firebase replacement artifacts are preserved as historical migration notes:

- `FIREBASE_MIGRATION_AUDIT.md`
- `MIGRATION_REPORT.md`
- `MIGRATION_COMPLETE.md`

## Architecture

Frontend:

- Next.js `14.2.35`
- App Router
- TypeScript
- Tailwind CSS
- Axios API client at `src/lib/api.ts`

Backend:

- Express API in `backend/src`
- JWT auth with secure HTTP-only cookie support and bearer-token fallback
- bcrypt password hashing
- Nodemailer email delivery
- Helmet, CORS, rate limiting, input validation with Zod

Database:

- PostgreSQL
- Prisma schema at `prisma/schema.prisma`

## Backend Structure

```text
backend/
  src/
    config/
    controllers/
    middleware/
    prisma/
    routes/
    services/
    utils/
    app.js
    server.js
```

## Data Model

The Prisma schema includes:

- `User`
- `Ngo`
- `NgoMember`
- `Donation`
- `VolunteerRequest`
- `Notification`
- `FeedItem`
- `VerificationToken`
- `PasswordResetToken`

Role enums:

- `user`
- `ngo_admin`
- `admin`
- `superadmin`

NGO membership roles:

- `owner`
- `manager`

## API Reference

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/verify-email`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

Users:

- `PATCH /users/:id`

NGOs:

- `GET /ngos`
- `GET /ngos/:id`
- `POST /ngos`
- `PATCH /ngos/:id`
- `DELETE /ngos/:id`

Donations:

- `GET /donations`
- `POST /donations`

Volunteers:

- `GET /volunteers`
- `POST /volunteers/:ngoId`
- `PATCH /volunteers/:id/status`

Notifications:

- `GET /notifications/:userId`
- `PATCH /notifications/:id/read`

Feed:

- `GET /feed/my`

Admin:

- `POST /admin/admins`
- `DELETE /admin/admins/:userId`
- `PATCH /admin/ngos/:ngoId/verify`
- `DELETE /admin/ngos/:id`

## Governance Rules

- `priyankasingh15102004@gmail.com` is automatically promoted to `superadmin`.
- Superadmin can create/remove admins, verify NGOs, and delete NGOs.
- Admin can verify NGOs and moderate platform data.
- NGO creator is inserted into `ngo_members` as `owner`.
- NGO owners and managers can manage their NGO, donations, and volunteer requests.
- Protected feature routes require verified email.

## Migration Strategy

1. Start PostgreSQL with `docker compose up postgres`.
2. Configure backend environment from `backend/.env.example`.
3. Generate Prisma client with `npm run prisma:generate --prefix backend`.
4. Create database tables with `npm run prisma:migrate --prefix backend`.
5. Start backend with `npm run dev:backend`.
6. Start frontend with `npm run dev`.
7. Move any historical Firebase-exported data into PostgreSQL using Prisma seed/import scripts.
8. Remove remaining mock data modules once production data import is complete.

## Verification

Completed checks:

- `npm run typecheck`
- `npm run build`
- `backend/src/app` load check
- `prisma validate --schema prisma/schema.prisma`
- Firebase source scan across `src`, `backend/src`, `prisma`, `package.json`, and `.env`
