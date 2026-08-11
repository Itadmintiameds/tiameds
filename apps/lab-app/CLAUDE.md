# CLAUDE.md — lab-app project context (LOCAL ONLY, not committed)

This file is a private working-memory document for Claude Code. It is gitignored — it will
never be pushed or shared. Keep it updated as the codebase evolves; treat it as a map, not
gospel — verify against actual files before relying on specifics (line numbers, function
names) for anything load-bearing.

## What this project is

`lab-app` is the frontend for **TiaMeds Lab Automation** — a multi-tenant laboratory
management system (patient visits, sample tracking, test catalogs/reference ranges, report
generation, billing/invoicing, insurance, doctors, staff/technicians). It lives at
`apps/lab-app` inside a Turborepo monorepo (`d:\Snykr\officeProject\labfrontend\tiameds`,
git root — repo has `apps/`, `packages/`, root `package.json`/`turbo.json`). The frontend
talks to a **separate Spring Boot backend** (Java) over REST; this repo has no direct DB
access except through a handful of Next.js route handlers used as a thin BFF (AI report
generation, transactional email).

- Framework: Next.js 14 (App Router), React 18, TypeScript.
- Styling: Tailwind CSS v4 + `antd` (Ant Design) components mixed in; `class-variance-authority`,
  `tailwind-merge`, `clsx` for class composition (`src/lib/utils.ts` → `cn()`).
- State: **Zustand** for auth (`src/context/userStore.ts`), React Context for lab
  selection (`src/context/LabContext.tsx`). No TanStack Query / SWR — data fetching is
  manual `useEffect` + service-call + `useState`.
- Forms: `react-hook-form` + `zod` resolvers (schemas in `src/schema/`).
- Rich text/report editing: Tiptap (`@tiptap/*`) — powers the "detailed report" editor.
- PDF/print/export: `@react-pdf/renderer`, `jspdf` + `jspdf-autotable`, `html2canvas`,
  `react-to-print`, `xlsx`/`papaparse` for CSV import-export (test reference ranges).
- Charts: `recharts` (dashboard statistics).
- Email (server-side only, via Next.js route handlers): `nodemailer` (Gmail SMTP).
- AI: `openai` SDK used server-side in `src/app/api/ai-report/route.ts` (model `gpt-5`
  default) to generate report insights/interpretation from structured test data.

## Monorepo layout

```
tiameds/                       ← git root (Turborepo)
├── apps/
│   └── lab-app/                ← THIS project (everything below is relative to here)
├── packages/                   ← shared packages (not yet explored in depth)
├── package.json / turbo.json
```

## Routing map (`src/app`)

Route groups `(admin)` and `(auth)` add no URL segment.

```
src/app/
├── layout.tsx              root layout: LabProvider, TokenExpirationHandler,
│                           IdleLogoutHandler, global react-toastify ToastContainer, fonts
├── page.tsx                public marketing landing page
├── components/             landing-page sections only (Navbar, Hero, Pricing, FAQ, ...)
├── (auth)/
│   ├── user-login/         → /user-login  (uses components/Login.tsx)
│   ├── register-user/      → /register-user (uses components/Register.tsx)
│   └── components/Login.tsx, Register.tsx
├── (admin)/
│   ├── dashboard/layout.tsx  client layout: useAuth() + useLabs(), fetches labs via
│   │                         getUsersLab(), renders SideBar + TopNav, Ctrl+B toggle,
│   │                         lab switching. → real path prefix is /dashboard/*
│   ├── dashboard/page.tsx    home: role-routed tab shell. ADMIN/SUPERADMIN land directly
│   │                         on `<Statistics />` (Patient/Sample Management moved to the
│   │                         sidebar nav for these roles); DESKROLE/TECHNICIAN (or both)
│   │                         still get a Patient Management / Sample Management tab
│   │                         toggle (`PatientDashboard` / `Technacian`). Most of the file
│   │                         below the export is commented-out prior iterations — don't
│   │                         confuse them with live code.
│   ├── dashboard/patients/ , patientdetails/       patient list/detail
│   ├── dashboard/doctor/                            referring doctor mgmt
│   ├── dashboard/test/ , test-detailed-report/,
│   │   test-reference-docs/                        test catalog + reference ranges
│   ├── dashboard/sample/ , pendingsamples/          sample collection/tracking queue
│   ├── dashboard/bill/ , billsummary/               billing/invoicing
│   ├── dashboard/insurance/                         insurance providers
│   ├── dashboard/lab/                               lab/branch settings, test pricing
│   ├── dashboard/package/                           test package bundles
│   ├── dashboard/technicians/                       staff/user management
│   ├── dashboard/subscription/                      plan management
│   ├── dashboard/inventorysummary/                   inventory reporting
│   ├── dashboard/detailreports/ , reportsettings/    report generation + settings
│   ├── dashboard/profile/                            user profile
│   ├── dashboard/newcommoncomponent/                 shared NewCommonTable/NewModal/
│   │                                                 NewPagination used across pages
│   └── component/            ← feature component library, see below
├── api/                     Next.js route handlers (BFF), see "BFF API routes"
├── onboarding/ , onboarding/request/    self-service lab signup flow (public)
├── verify-email/             email verification landing (public)
├── create-lab/               post-signup lab creation
├── forgot-password/ , reset-password/   password reset flow (public)
├── contact-us/ , schedule-demo/ , demo-report/   public marketing pages
```

### `(admin)/component` — admin feature components
- `LayoutComponent/` — `SideBar.tsx`, `TopNav.tsx`, `Navigation.tsx` (app chrome; has
  inline role checks for menu visibility).
- `common/` — generic shared UI: `Button`, `Model` (modal), `Pagination`,
  `TableComponent`, `TabComponent`/`SubTabComponent`, `MultiSelect`, `Loader`,
  `ConfirmationDialog` (see `docs/DESIGN_SYSTEM_CONFIRMATION_DIALOG.md`), plus billing
  report widgets (`BillReport`, `AmountReceivedTable`, `DayClosingSummary`,
  `ReceiptsSummary`, `ReportsGraphView`).
- `dashboard/patient/` — AddPatient, PatientList, UpdatePatient, ViewPatientDetails,
  LabReport.
- `dashboard/statistics/` — `Statistics.tsx` role-switches between `AdminStats.tsx`
  (~4.5k lines) and `SuperAdminStats.tsx` (~3.9k lines), the real analytics dashboards
  (KPIs, revenue trend, sample workflow funnel, technician/package/doctor performance,
  billing grid, age/gender distribution, etc. — fed by `adminStatService.ts` /
  `statisticsService.ts`, see Data/service layer). `BarGraph`, `PieChartStatus`,
  `TopStatus`, `StatisticsMain` are the prior generation — **`StatisticsMain.tsx` is now
  dead code**, referenced nowhere except itself; `BarGraph`/`PieChartStatus`/`TopStatus`
  are still imported by `StatisticsMain` only.
- `doctor/`, `insurance/`, `package/`, `lab/` — standard Add/List/Update/View CRUD sets
  per domain (`Lab`, `LabList`, `TestPriceList`, `TestReferanceList` for lab).
- `patientDashboard/` — richer patient workflow: `AddPatientComponent`,
  `EditPatientDetails`, `PatientDashboard`, `PatientVisitListTable`, `CancelPatient` /
  `CancellationDetailsModal` (visit cancellation — this is the file open in the IDE),
  `DuePayment`, `ConfirmModal`.
- `test/` — AddTest, TestEditComponent, TestList, TestSettings, test CSV
  Upload/Download, reference-range tools (`AddTestReferanceNew`, `TestReferancePoints`,
  `UploadTestReference`, `DownloadReferanceRangeExcel`).

### Top-level `src/components` (app-wide infra, distinct from `(admin)/component`)
- `ProtectedRoute.tsx` — client-side role guard, `requiredRoles?: string[]` prop.
- `TokenExpirationHandler.tsx`, `IdleLogoutHandler.tsx` — session lifecycle, wired in
  root layout.
- `ModernReportPage.tsx` — printable/PDF report rendering.
- `ui/` — `card.tsx`, `chart.tsx`, `rich-text-editor.tsx`,
  `detailed-report-tiptap-editor.tsx`, `section-editor-modal.tsx`,
  `report-formatter-demo.tsx` — backs the Tiptap detailed-report editor
  (see `docs/detailed-report-editor.md`).

### BFF API routes (`src/app/api`)
- `ai-report/route.ts` — POST; builds a prompt (`src/lib/ai/labReportPrompt.ts`) and
  calls OpenAI (`gpt-5`) to generate report insights/interpretation, response validated
  with zod. Requires `OPENAI_API_KEY` server env var.
- `email/route.ts` — POST; validates address via APILayer MailboxLayer, sends
  "welcome" account-creation email via Nodemailer/Gmail.
- `sendReport/route.ts` — emails a lab report (likely PDF attachment).
- `sendinvoice/route.ts` — emails an invoice.
- `admin-stats/[...path]/route.ts`, `superadmin-stats/[...path]/route.ts` — GET-only
  catch-all proxies in front of the backend's `AdminStatsController`
  (`/lab-admin/stats/*`) and `SuperAdminStatsController` (`/lab-super-admin/stats/*`).
  Exist because those two controllers authenticate via an `Authorization: Bearer`
  header instead of the httpOnly `accessToken` cookie every other endpoint uses — the
  browser can't read that cookie to build the header itself, so this runs server-side,
  reads the cookie, and re-attaches it as Bearer. Each route has its own in-process
  refresh-token dedup (`refreshInFlight`) mirroring `utils/api.ts`'s browser-side dedup,
  needed because `AdminStats.tsx`/`SuperAdminStats.tsx` fan out many `Promise.allSettled`
  calls at once and a naive implementation would race multiple `/auth/refresh` calls
  against the same rotating refresh token.

### `src/middleware.ts`
Matches `['/', '/user-login', '/login', '/dashboard/:path*', '/admin/:path*',
'/onboarding/:path*', '/verify-email/:path*']`. Coarse cookie-presence check only (no
role check):
- Checks for `accessToken` / `refreshToken` / legacy `token` cookie.
- `/onboarding` and `/verify-email` always allowed.
- Authenticated user hitting `/`, `/user-login`, `/login` → redirected to `/dashboard`.
- Unauthenticated user hitting `/dashboard/*`, `/admin/*` → redirected to `/user-login`.

## Auth & session model

Backend issues **RS256-signed JWTs** as httpOnly cookies (`accessToken` 15 min TTL,
`refreshToken` 24h TTL, rotated on every login/refresh). Full backend-side detail is in
`backend_jwt.md` and `docs/loginflow.md` (OTP/2FA is layered on top of username+password
before tokens are issued — login now requires OTP verification too).

- **`src/utils/api.ts`** — the single shared axios instance. `baseURL:
  process.env.NEXT_PUBLIC_API_URL`, `withCredentials: true` (cookies do the auth work,
  no manual `Authorization` header on the request side). Response interceptor handles
  401/403: triggers `performRefresh()` which POSTs `/auth/refresh` via a *separate*
  `refreshClient` instance (avoids interceptor recursion); concurrent 401s are
  deduplicated via a single in-flight `refreshPromise` + `failedQueue`. If refresh
  itself fails, clears the legacy `token` cookie and hard-redirects to `/user-login`
  (skipped on public routes). `refreshAccessToken` exported for proactive/silent
  refresh elsewhere. **Almost every service file imports this same instance** — the
  exceptions are `adminStatService.ts` and `statisticsService.ts`, which create their
  own local axios instances pointed at `/api/admin-stats` and `/api/superadmin-stats`
  (the BFF proxies described above) instead of hitting the backend directly.
- **`src/context/userStore.ts`** (Zustand, despite the "context" folder name) —
  `useAuthStore`: `{user, token, isAuthenticated, isLoading}` + `login`, `logout`,
  `updateUser`, `initializeToken` (hydrates session from httpOnly cookies via
  `getCurrentUser()` on app boot).
- **`src/hooks/useAuth.ts`** — wraps `useAuthStore`; decodes JWT payload (`atob`, no
  verification, just for expiry) with a 5-min buffer, periodic (5 min) expiry checks +
  auto-redirect; exposes `isAdmin`, `isSuperAdmin`, `isTechnician`, `isDeskRole` derived
  from `user.roles`.
- **`src/hooks/useIdleLogout.ts`** — 30-min inactivity timer (mouse/keyboard/
  scroll/touch/visibility), calls backend logout + clears cookies/store on timeout,
  skipped on public auth pages.
- **`src/hooks/useTokenInitializer.ts`** — calls `initializeToken()` on mount.
- **RBAC**: roles seen — `SUPERADMIN`, `ADMIN`, `TECHNICIAN`, `DESKROLE` (from
  `LoginResponseData.roles: string[]`). **No centralized permissions module** — role
  checks (`roles.includes('SUPERADMIN' | 'ADMIN' | 'TECHNICIAN')`) are inlined ad hoc in
  ~14 files (`SideBar.tsx` and various dashboard pages: test, package, sample,
  technicians, lab, patientdetails, pendingsamples). `ProtectedRoute.tsx` is the only
  reusable guard, taking `requiredRoles?: string[]`. Middleware itself does NOT check
  roles, only cookie presence.
- Related flows: password reset (`docs/forget-reset-password.md`), self-service lab
  onboarding/signup (`onboarding.md` at repo root — email verification token →
  onboarding form → creates User + Lab in one transaction; many `NOT NULL` lab fields
  required, see that file's table before touching the onboarding form).

## Data/service layer (`services/` at repo root, sibling to `src`)

15 files. 13 use axios via `src/utils/api.ts` and call the Spring Boot backend directly;
`adminStatService.ts` and `statisticsService.ts` are the exception (see Auth section) —
they use their own axios instances against the local `/api/admin-stats` and
`/api/superadmin-stats` BFF proxies. Endpoint shape is generally `/lab/{labId}/...` or
`admin/lab/{labId}/...` (multi-tenant, scoped by lab). Summary:

| File | Domain | Notes |
|---|---|---|
| `authService.ts` | login, OTP verify, register, logout, `getCurrentUser`, forgot/reset password | `/auth/*`, `/public/register` |
| `billing.ts` | `billing(labId)` | `GET /lab/{labId}/billing` |
| `doctorServices.ts` | doctor CRUD | `/admin/lab/{labId}/doctors[/{id}]` |
| `insuranceService.ts` | insurance CRUD | `/lab/admin/insurance/{labId}[/insurance/{id}]` |
| `labServices.ts` | `getLabs`, `getUsersLab`, `createLab`, `getLabList`, `getLabById`, `updateLabById`, `getLabLogoUploadUrl` (S3 presigned) | `lab/admin/*`; toasts directly inside service |
| `onboardingService.ts` | request/resend verification email, verify token, `completeOnboarding` | `/public/onboarding/*`, pre-auth |
| `packageServices.ts` | health package CRUD | `/admin/lab/{labId}/package[s]` |
| `patientServices.ts` | **largest**: visits by date range, get/search (debounced 300ms) patient, add/update/delete patient, visits by patient/date, health snapshot (AI trend context), visit cancellation, partial payment, datewise transaction/payment details | `/lab/{labId}/*` |
| `reportServices.ts` | report CRUD + report settings (letterhead/signature, S3 signature upload) + get/save AI clinical observations per visit | `/lab/{labId}/report*`, `/report-settings`, `/lab/{labId}/visit/{visitId}/ai-clinical-observation` |
| `sampleServices.ts` | sample CRUD + visit-sample ops (add/get/collected-completed/update/delete) | `/lab/{labId}/sample*`, `/lab/*-samples`; samples are **lab-isolated**, see `docs/sampledoc.md` |
| `statusServices.ts` | `getLabStatsData(labId, startDate, endDate)` — old single-lab stats call | `lab/statistics/{labId}`; only remaining consumer is `StatisticsMain.tsx`, which is itself dead code (see routing map) |
| `technicianServices.ts` | actually staff/member mgmt: get/create/update/reset-password/delete member | `/user-management/*`; **inconsistent error handling** — catches and *returns* `error.response?.data` instead of throwing, unlike other services |
| `testService.ts` | **most complex**: test catalog CRUD + pagination, CSV upload/download, reference-range CRUD + CSV, "master"/super-admin test & reference lists | `admin/lab/*`, `lab/test-reference/*`, `super-admin/referance-and-test/*` |
| `adminStatService.ts` | ADMIN dashboard analytics feeding `AdminStats.tsx`: per-lab KPIs (revenue/patients/tests/TAT/etc.), revenue trend, sample workflow funnel, technician/package performance, top referring doctors, top ordered tests, age/gender distribution, billing grid report, `getMyLabsCount` (the one endpoint not scoped by `{labId}`) | via `/api/admin-stats` proxy → backend `/lab-admin/stats/*`; every call unwraps `{data, message, status}` through a shared `get<T>()` helper |
| `statisticsService.ts` | SUPERADMIN dashboard analytics feeding `SuperAdminStats.tsx`: cross-lab KPIs, role/lab-wise breakdowns, revenue-by-lab, earnings by category, lab performance ranking, billing grid | via `/api/superadmin-stats` proxy → backend `/lab-super-admin/stats/*` |

Only public env var: `NEXT_PUBLIC_API_URL` (backend base URL) — used solely in
`src/utils/api.ts`. No `.env.example` committed; real `.env` exists at project root.
Server-only secrets (`OPENAI_API_KEY`, SMTP creds, MailboxLayer key) are consumed inside
`src/app/api/*` route handlers, never exposed client-side.

## Domain types (`src/types/`)

- `auth.ts` — `LoginRequest`, `LoginResponseData` (roles, modules), OTP types,
  forgot/reset password types.
- `Lab.ts` / `LabFormData.ts` / `LabFormFormData.ts` — lab profile (address, license,
  director info, GST/tax ID, accreditation, logo).
- `patient/patient.ts` — core clinical model: `Patient` (demographics + embedded
  `Visit`), `Visit` (date/type/status, doctorId, testIds/packageIds/insuranceIds,
  `Billing`, `TestResult[]`), `Billing` (amounts, payment method/status, per-method
  breakdown, `BillingTransaction[]`), enums `PaymentStatus`, `PaymentMethod`,
  `VisitType`, `VisitStatus`, `Gender`, `DiscountReason`.
- `patient/healthSnapshot.ts` — cross-visit test-history trend type (AI context).
- `test/testlist.ts` — `TestList` (catalog item), `TestForm`, `TestReferancePoint`
  (reference ranges by age/gender, min/max, units, dropdown JSON).
- `sample/sample.ts` — `SampleList`, `Sample`, `TestResult`, `VisitSampleList`/
  `PatientData` (denormalized visit+patient+sample+test view), generic `ApiResponse<T>`.
- `doctor/doctor.ts`, `insurance/insurance.ts`, `package/package.ts` — entity types
  (package type is also duplicated inline in `packageServices.ts` — a known
  inconsistency, not a bug).
- `printbill/bill.ts` — `Bill`, `LabDetails`, `PatientDetails`, `Test`,
  `HealthPackage` (invoice/PDF shape, GST/CGST/SGST breakdown).
- `onboarding/` — `RegisterData`, `LabRegisterData`, onboarding DTOs.
- `loginUser/LogedUserType.ts` — simplified logged-in user shape.
- `reportSettings.ts`, `labStatus.ts` (`LabStats`), `aiInsights.ts`,
  `pendingTable/PendingTatbleDataType.tsx`, `NavigationItem.ts`, `nodemailer.d.ts`.
- `adminStatsData.ts` / `statisticsData.ts` — response shapes for `adminStatService.ts`
  (single-lab, ADMIN) / `statisticsService.ts` (cross-lab, SUPERADMIN) respectively; both
  large and mostly parallel (KPIs, revenue trend, grid report, top referring doctors,
  etc.) but not shared — same-shaped types are independently declared in each file.

## Validation (`src/schema/`, Zod + react-hook-form)

One schema per form: login/register (`loginDataSchema`/`registerDataSchema`/
`formDataSchema`), `patientScheamData.ts` (`patientSchema` — patient+visit+billing
combined, `YYYY-MM-DD` date regex), `editPatientSchema.ts`, `doctorSchemaData.ts`,
`insuranceSchema.ts`, `labFromDataSchema.ts`, `memberSchema.ts` (staff creation),
`packageDataSchema.ts`, `testReferancePointSchema.ts`. Note:
`testFormDataSchema.ts` exists but is currently commented out/unused.

## Utilities (`src/lib/`, `src/utils/`)

- `lib/utils.ts` — `cn()` (clsx + tailwind-merge).
- `lib/ai/aiClinicalObservation.ts`, `labReportPrompt.ts` — AI clinical observation
  serialisation (UI bullet arrays <-> the backend's flat per-visit strings) + content
  fingerprint used to detect edited results + prompt building. There is no local/
  localStorage cache for observations: the per-visit record on the backend is the only
  store, so every device sees identical text. The record is fetched in
  `CommonReportViewWrapper` alongside `getReportData` (NOT inside `CommonReportView2`) so
  a reopened report renders its AI section on the first frame; `CommonReportView2` only
  calls OpenAI when the wrapper found nothing or the fingerprint no longer matches, and
  writes the result back. Backend upserts one row per visit and echoes `contentHash`
  (`AiClinicalObservationController`).
- `utils/api.ts` — shared axios client (see Auth section above).
- `utils/auth.ts` — `handleLogout()`.
- `utils/cookies.ts` — `getCookie`/`setCookie`/`deleteCookie` (non-httpOnly, secure,
  samesite=strict).
- `utils/ageUtils.ts` — age calc/formatting for reference-range age-band matching.
- `utils/csvUtils.ts` — CSV parsing/generation for test/reference-range import-export.
- `utils/dateUtils.ts` — `DateFilterOption`, `getDateRange()` for dashboard filters
  (today/yesterday/last7days/thisMonth/thisYear/custom).
- `utils/debounce.ts` — generic debounce (used by patient phone search).
- `utils/dropdownParser.ts` — parses dropdown/select option strings for test reference
  config (see `docs/FRONTEND_JSON_FIELDS_GUIDE.md`).
- `utils/reportFormatter.ts` — formats JSON report payloads (fetal parameters,
  observations, structured tables) into medical report layout (see
  `docs/REPORT_DATA_DOCUMENTATION.md`, `docs/detailed-report-editor.md`).

## Existing docs worth reading before touching these areas

Located in `docs/` (repo-tracked, keep these as source of truth over this file when they
conflict):
- `TiaMeds_Lab_Management_System_Documentation.md` — full feature doc, start here for
  big picture.
- `loginflow.md` — OTP/2FA login flow.
- `forget-reset-password.md` — password reset flow (DB-backed rate limiting).
- `sampledoc.md` — samples are lab-isolated (per-lab, not global) — quick reference.
- `reportfill.md` — `PatientReportDataFill` component (technician result entry).
- `detailed-report-editor.md` — Tiptap detailed/radiology report editor internals,
  table-corruption avoidance.
- `REPORT_DATA_DOCUMENTATION.md` — data structures for each report component.
- `FRONTEND_JSON_FIELDS_GUIDE.md` — dropdown/impression JSON field conventions.
- `TEST_REFERENCE_SYSTEM_DOCUMENTATION.md` — test reference range management.
- `DESIGN_SYSTEM_CONFIRMATION_DIALOG.md` — confirmation dialog design system/usage.

At repo root: `onboarding.md` (self-service signup flow), `backend_jwt.md` (JWT
issuance/refresh/revocation on the backend). At monorepo root:
`REPORT_SETTINGS.md`, `S3_LOGO_UPLOAD.md`.

## Known inconsistencies / gotchas (worth knowing before refactoring)

- `technicianServices.ts` swallows errors and returns `error.response?.data` instead of
  throwing, unlike every other service file which throws/lets the interceptor handle it
  — don't assume uniform error-handling when calling it.
- No centralized RBAC/permissions module; role checks are duplicated ad hoc across ~14
  components. If adding a new role or menu item, expect to touch `SideBar.tsx` plus each
  relevant page.
- `package` type is defined both in `src/types/package/package.ts` and inline in
  `packageServices.ts`.
- `testFormDataSchema.ts` is unused/commented out — don't assume it's wired up.
- No TanStack Query/SWR — all data fetching is manual, so watch for missing
  loading/error states or stale-data bugs when adding new fetches.
- No `.env.example` — only a real `.env`; if bootstrapping a new environment, the only
  required public var is `NEXT_PUBLIC_API_URL`, but server route handlers additionally
  need `OPENAI_API_KEY` and SMTP/MailboxLayer secrets (check `src/app/api/*/route.ts`
  for exact var names when needed).
- `dashboard/statistics/StatisticsMain.tsx`, `BarGraph.tsx`, `PieChartStatus.tsx`,
  `TopStatus.tsx`, and `services/statusServices.ts` are dead code — nothing outside that
  cluster imports them anymore. `Statistics.tsx` now renders `AdminStats.tsx` /
  `SuperAdminStats.tsx` directly based on `isSuperAdmin`. Don't assume they're wired up;
  confirm with a grep before editing or deleting.
- `adminStatService.ts` / `statisticsService.ts` deliberately don't go through
  `src/utils/api.ts` — they call local `/api/admin-stats` and `/api/superadmin-stats`
  BFF proxy routes instead, because those two backend controllers need a Bearer header
  the browser can't construct from an httpOnly cookie. If a bug looks like a stats call
  is "ignoring" the shared axios interceptor/refresh logic, this is why — check the
  route handler under `src/app/api/{admin,superadmin}-stats/[...path]/route.ts` first.
