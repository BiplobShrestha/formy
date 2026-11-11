# Formy

E-governance service application portal (MERN).

Version: v9 (v8 plus a styled file picker button)

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

## New in v9

- The Choose file button on every upload field (forms and notices) now matches the site buttons.

## v8 additions

- Notice popup shows one notice at a time, newest first. The next one appears after the visitor closes the one before. After the last one it stays away for the rest of the browser session.
- Admin Notices page has a Text or Image switch. An image notice needs a title (only the admin sees it) and a JPG or PNG. Big photos are shrunk in the browser to under 900 KB.
- Image notices show as pictures in the popup and in the Notices list on the landing page. Hidden notices are not public, and deleting a notice deletes its picture.
- No new environment variables.

## v7 additions

- Top bar shows only the name, without the role in brackets.
- Officer buttons are now Approve and Reject.

## v6 additions

- PDF letters redesigned: letterhead with logo and reference block, a status box, tables for application and applicant details, numbered annexures, signature and stamp blocks, page numbers and a footer on every page.
- Customer letter (one page): approved or not approved, summary table, reason in a box if rejected.
- Officer letter: formal request, details table, annexure list, verification box with the admin signature, then one annexure page per document.
- All letter layout is in backend/lib/letters.js. Colours are at the top of that file.

## v5 additions

- Logo shown in the top bar, footer, browser tab and on every PDF letter (backend/assets/logo.png and frontend/public/images/logo.png).
- Approval letter to the customer carries the officer signature and the APPROVED stamp. The officer letter carries the verification signature. Images are in backend/assets. Replace a file there to change it. If a file is missing the letter is made without it.
- Keep the two copies of logo.png the same (frontend/public/images and backend/assets).

## v4 additions

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
