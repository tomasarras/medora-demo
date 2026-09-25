# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Medora is a fictional clinic demo (portfolio project): Next.js App Router (JS, not TS) + Prisma/PostgreSQL (Neon), Tailwind v4. No image uploads in this one — doctors get a color-coded initials avatar instead of Vercel Blob.

## Commands

```
npm run dev       # next dev (localhost:3000)
npm run build     # prisma generate && prisma migrate deploy && next build
npm run lint      # eslint
npm run db:seed   # node prisma/seed.mjs — non-destructive, upserts the fixed demo catalog
```

Like `vestra-demo`, this build runs `prisma migrate deploy` itself, so a fresh Vercel deploy is self-contained — the only manual step afterward is seeding once via `POST /api/demo/reset`.

**`directUrl` points at `DATABASE_URL_UNPOOLED`, not a separate `DIRECT_URL`.** Same Neon-marketplace-integration naming as `vestra-demo` — see that repo's CLAUDE.md for the "don't clear the env var prefix" gotcha, it applies here too.

No test suite exists in this repo.

## Architecture

**No real auth, anywhere.** `app/page.js` (`/`) is a role picker — Paciente (→ `/paciente`, no gate), Médico (→ `/medico`, pick which doctor you are, no password), Secretaría (→ `enterSecretaria()` then `/secretaria`) — plus the "Restablecer demo" button. `RoleProvider` (`components/RoleProvider.js`) stores `{ role: "secretaria" | "medico", doctorId? }` as one JSON blob in `localStorage`. `app/secretaria/layout.js` and `app/medico/panel/layout.js` are the enforcement points — redirect to `/` or `/medico` respectively when the role/doctorId isn't set, same UX-guidance-only pattern as `vestra-demo`'s `AdminProvider`. No server-side check re-validates any of this on the API routes.

**The one place this demo genuinely needs a real database: double-booking.** Two patients (or a patient and the secretary) must not be able to book the same doctor's same time slot, and that has to hold across different browsers/visitors — not just within one `localStorage` cart, which is why `vestra-demo` needed a DB for coupon quantity and this one needs it for slot conflicts. `lib/appointments.js` `bookAppointment`/`rescheduleAppointment` wrap the conflict check + create/update in a `prisma.$transaction` at `Serializable` isolation: Postgres aborts one side of a genuine race with a serialization error (Prisma code `P2034`), which gets caught and turned into the same "ese horario ya fue reservado" response as the plain up-front conflict check that handles the non-racing case.

**Dates are handled as UTC "wall clock" values on purpose, everywhere.** `lib/schedule.js` builds appointment slots with `Date.UTC(...)`; `lib/format.js`'s `formatDate`/`formatTime`/`formatDayLabel`/`weekdayName` all read back with the UTC getters (`getUTCHours()` etc.), never the local ones. This means "09:00" always means the same wall-clock 09:00 regardless of which timezone the Vercel function or a visitor's browser happens to be in — there's no real timezone handling (no per-clinic TZ setting), which would matter for a real product but is out of scope for a demo.

**Working hours are a fixed constant, not per-doctor data.** `lib/schedule.js`'s `BLOCKS` (Mon–Fri, 09:00–13:00 and 14:00–18:00, 30-minute slots) apply to every doctor. `getAvailableSlots(doctorId, dateOnly)` generates the theoretical slots for that weekday and subtracts whatever's already booked (any non-`CANCELADO` appointment) for that doctor on that day.

**Domain logic lives in `lib/`, not in route handlers**, mirroring `vestra-demo`/`comanda-demo`: each feature has a `<Feature>Error(message, status)` class and route handlers just catch it and translate to a JSON response — `lib/specialties.js` (`SpecialtyError`), `lib/doctors.js` (`DoctorError`), `lib/patients.js` (`PatientError`), `lib/appointments.js` (`AppointmentError`).

**Patient identity is "whatever phone number you type in."** `lib/patients.js` `findOrCreatePatient` upserts by phone — same no-real-auth spirit as the rest of the app. "Mis turnos" (`app/paciente/mis-turnos`) looks up appointments by phone with no further verification; this is a demo, not a real patient portal.

**Data model** (`prisma/schema.prisma`): `Specialty → Doctor → Appointment ← Patient`. `Appointment.status` is `CONFIRMADO | ATENDIDO | CANCELADO` — cancelling never deletes the row (so the slot shows correctly as freed via the status filter, while the row stays for history); a doctor marks `ATENDIDO` and can attach free-text `notes` from `app/medico/panel/turno/[id]`.

**Route groups.** `/` is the role picker. Patient area (public, no gate): `/paciente` (landing + "quiénes somos"), `/paciente/reservar` (specialty → doctor → date → slot → patient details wizard), `/paciente/mis-turnos` (phone lookup + cancel). Médico area: `/medico` (pick-your-profile, public), `/medico/panel/*` (gated, personal agenda + `/medico/panel/turno/[id]` consult view). Secretaría area: `/secretaria/*` (gated), covering `turnos` (day view across all doctors, create walk-in, reschedule, cancel), `medicos` (+ `nuevo`/`[id]`, shared `components/DoctorForm.js`), `especialidades`, `pacientes` (+ `[id]` history).

**Demo reset**: `POST /api/demo/reset` (`lib/demoReset.js`) wipes every table and reseeds fixed specialties/doctors/patients plus 3 sample appointments (one already `ATENDIDO` with notes, so the doctor panel and patient history aren't empty on first load), exposed as a button on `/` — same role as `vestra-demo`'s reset.

**Client conventions**: plain `.js` files, `"use client"` where needed, Tailwind utility classes, `lucide-react` icons, `@/*` path alias. UI copy is in Spanish (Argentina) — match this when adding strings.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
