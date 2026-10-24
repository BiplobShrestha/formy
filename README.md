# Formy

E-governance service application portal (MERN).

Version: v3 (v2 plus a full design pass, change password, login rate limit, photo slots)

- backend: Express + MongoDB (deploys to Render)
- frontend: React + Vite (deploys to Vercel)

## Seeded logins

Change in backend/seed/data.js, or set ADMIN_PASSWORD / OFFICER_PASSWORD in Render.

- Admin: 9800000001 / Admin@123
- Officer: 9800000002 / Officer@123

Citizen records (30 fictional people) live in backend/seed/data.js. Edit the names there.
They sync on every backend restart. A new record is added, an existing citizenshipNumber is updated.

## Flow

1. Customer registers and submits a form (Pending)
2. Admin opens Review, checks the application against the citizen record, then forwards it or rejects it with a reason
3. Officer verifies (approve) or rejects with a reason
4. Customer downloads a decision letter (PDF). A rejected application can be edited and resubmitted

## Adding a service

Add one object to the `services` array in backend/config/services.js (fields, required documents, letter wording).
No frontend change is needed, the forms are built from that config.

## Notes

- Uploaded photos are stored in MongoDB (images only, shrunk in the browser first).
- Render free tier sleeps when idle, so the first request can take about a minute.

## New in v3

- Design: new look on every page, works on phones. Progress tracker on each application.
- Account page: every user can change their own password (use it to replace the seeded admin and officer passwords).
- Login rate limit: 8 wrong attempts in 15 minutes locks that phone number for 15 minutes.
- Photos: hero.jpg and guide.jpg are already in frontend/public/images/. Replace them with other photos of the same names any time.
- No new environment variables.
