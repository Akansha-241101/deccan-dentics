# Memory — Deccan Dentics

Last updated 30 Oct 2026 (admin dashboard added). Read this before changing brand, scope, or structure.

## 1. What this is

A resume / portfolio product under the **Deccan Dentics** brand: Next.js app `deccan-dentics-dental-clinic`. Brand name only — not a live clinic website.

The product is a public brochure plus appointment booking, plus a staff `/admin` dashboard for schedule, patients, and appointments. The admin area is a demo with a shared recruiter login, not production-grade multi-tenant auth.

## 2. Brand decisions already made

- Tagline: "Healthy smiles. Happier lives."
- Hero line: "Expert Dental Care for a Brighter, Healthier You".
- Palette, type, and radius are the tokens in `src/app/globals.css` and `brand-manifest.json`.
- Headings are Libre Baskerville. Body is Merriweather. Caveat is a single handwritten accent.
- Buttons are gently raised. Fields are slightly inset. Cards and accordion rows are quiet raised panels. Menus float. Nothing else gets a bevel.
- Light and dark themes share roles. Dark is not a separate brand.
- Content modules live under `src/data/`. Reviews in `reviews.js` are placeholders until approved.
- Motion: Framer Motion for section entrances; Embla for reviews.

The old homepage line "Don't Just Smile, Shine with Confidence!" is legacy. Do not put it in the UI unless the clinic asks.

## 3. Portfolio brand facts

Recorded for this demo (not tied to a live clinic domain):

- Phone: `079956 86661`.
- Email: `drsadiqali2000@gmail.com`. Public contact detail for the demo, not an app secret.
- Hours: Monday–Saturday 09:00–20:00, Sunday 14:00–18:00.
- Branches: Kondapur, Manikonda, Rajendranagar (listed beside Videnta), Toli Chowki. Addresses are in the manifest.
- Proof stats in copy: 10+ years, 25k+ patients, family dentistry.
- Services are listed in `brand-manifest.json`.

## 4. Conflicts to keep consistent in the demo

- Some copy mentions 5 branches and Malakpet; the branch list shows four. Prefer the four in the manifest.
- Hero badge figures must match the stats used elsewhere in the UI.
- Do not invent doctor names or clinician bios for the portfolio.

## 5. Technical decisions

- Bun is the package manager. Commands go through `bun` or `bunx`.
- shadcn style is `base-nova`. Primitives sit on Base UI, not Radix.
- `cn` comes from the `cn` package. `src/lib/utils.ts` re-exports it.
- Components are grouped by feature under `src/components/` (`home`, `services`, `why-choose-us`, `about`, `reviews`, `branches`, `faq`, `contact`, plus `layout`, `motion`, `ui`). See `ARCHITECTURE.md`.
- Images live under `public/images/{brand,hero,services,faq,about,why-choose-us,tools,decor,source}/`. Brand mark for collapsed admin sidebar: `public/images/brand/logo-mark.png`. Floating dental tools use `FloatingTools` (desktop only).
- Admin shell collapse state lives in `AdminShell` (default expanded). Desktop rail animates `md:w-64` ↔ `md:w-20` over 500ms; collapsed nav uses tooltips. Shared admin page frame: `AdminPage` / `AdminPageHeader` (actions via `children`). Toasts use shadcn Sonner via `useShowToast` (`success` | `pending` | `error`), mounted top-center from root layout. Time fields use `TimeSelect` (30-min slots); dates use `DatePicker` + shadcn `Calendar`.
- Theme uses shadcn/`next-themes` `ThemeProvider` on the root layout (`attribute="class"`, `defaultTheme="light"`, `enableSystem={false}`). Header `ThemeToggle` is hidden for now but kept and wired to `useTheme`. `suppressHydrationWarning` on `<html>` / `<body>` stays.
- Dev server is `next dev --webpack` even though `next.config.ts` also mentions Turbopack CSS. Leave that alone unless dev is being fixed on purpose.
- No database or email provider is installed. Do not add one inside a visual change.
- Admin auth: Neon Auth (email + password), only for emails in `ADMIN_EMAILS`. `src/proxy.ts` guards `/admin`; server actions call `assertAdmin()`. The old client password gate is gone.
- Admin state: `useAdminStore` (zustand, in memory only) is filled from Neon by `app/admin/(panel)/layout.tsx`; every change saves through a server action and reverts on failure. Admin code mirrors the Eatrrite implementation (leads renamed patients; no payment, questionnaire or Google Meet). Tables `dd_*`, setup in `docs/database.md`. Website booking: `/book` → `POST /api/appointments` → patient + appointment rows → SMTP emails → `/appointment-confirmed`.
- Dashboard stats filter against fixed `DASHBOARD_REFERENCE_DATE` (`2026-10-30`) and seed `createdAt`/`updatedAt` values. Do not use `new Date()` during Client Component render on statically prerendered admin pages — defer with `useEffect` (Next blocks prerender otherwise).
- Schedule days use `slots[]` (multiple open/close windows). Sunday seeds closed. Destructive actions (delete patient/appointment, remove slot, close day, log out) go through `ConfirmationModal` via `useConfirmDialog`.
- Appointment delivery is undecided. The public form must not fake a successful send.

## 6. Lessons from the design work

- A 7% black mix on a white field looks dirty, not recessed. Field faces stay almost white. The inset is about one pixel.
- An open select should not draw a focus outline. The outline sits outside the trigger and collides with the menu. Use the green border instead while `data-popup-open` is set.
- `overflow` on a popup clips its own shadow. The drop shadow belongs on the floating positioner (`surface-float`). Do not put CSS `filter` on an ancestor of a `position: fixed` popover or the menu will jump.
- Card shadows disappear if the same element uses `overflow: hidden`. Prefer the shadow, and round images themselves.
- Accordion questions should stay in the body font. Display type on every row feels costume-like.

## 7. Constraints

- Clinic copy must match `brand-manifest.json` or a confirmation recorded here. Do not reference a real clinic domain.
- No payments, accounts, OTP, or medical-history fields in this version.
- Source files we write stay at or under 120 lines. `src/app/globals.css` is the token file and may be longer. See `RULES.md`.
- `select.tsx` from shadcn is already over 120 lines. Split it before adding behavior, rather than letting it grow.
- Floating tool accents are decorative only (`pointer-events-none`, desktop). Do not block clicks or text.

## 8. How to record a new decision

Add a short dated note to section 5 or section 4. Update `brand-manifest.json`, `TASKS.md`, and the doc that owns the topic. Do not leave the decision only in a chat.
