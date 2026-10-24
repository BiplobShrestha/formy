# Formy

E-governance service application portal (MERN).

Version: v4 (v3 plus 50 linked citizen records, document checks against parent records, logo slot)

- backend: Express + MongoDB (deploys to Render)
- frontend: React + Vite (deploys to Vercel)

## Seeded logins

Change in backend/seed/data.js, or set ADMIN_PASSWORD / OFFICER_PASSWORD in Render.

- Admin: 9800000001 / Admin@123
- Officer: 9800000002 / Officer@123

Citizen records (50 fictional people, 10 families with linked parents) live in backend/seed/data.js. Edit the names there.
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

## New in v4

- 50 citizen records. Ten people are linked to their father and mother records (fatherCitizenshipNumber and motherCitizenshipNumber in backend/seed/data.js).
- Admin review has a Document checks section: each uploaded certificate is shown beside the stored record of that person. The admin ticks each one. Forward to officer stays disabled until all are ticked. If the parent is not in the records, the admin must reject.
- Relationship verification also checks that a named father or mother really is the applicant's parent in the records.
- The officer sees the same document checks, read only.
- Helper text removed from the screens. Behaviour notes are in a separate document.
- Logo: save your logo as frontend/public/images/logo.png (shown in the top bar and footer). Replace frontend/public/favicon.svg for the tab icon.
- No new environment variables.

## v3 additions

- Account page: every user can change their own password.
- Login rate limit: 8 wrong attempts in 15 minutes locks that phone number for 15 minutes.
- Photos: hero.jpg and guide.jpg are in frontend/public/images/.
