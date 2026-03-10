# Branch Docs — Dzikri

## Backlog: UM-14 · Read Role Detail & Manajemen Pengguna

---

## Pages Implemented

### 1. Role Detail Page — `/admin/access/role/[id]`

Displays structured information for a single role.

**Route:** `src/app/admin/access/role/[id]/page.tsx`

- Protected with `withPermission('USER', 'READ')` — unauthenticated → `/login`, missing permission → 404.
- Reads `SIFPI_TOKEN` cookie and calls `serverGetRoleDetail` + `serverGetRoleUsers` from the services layer in parallel via `Promise.all`.
- Computes `canUpdate = hasPermission(session, 'USER', 'UPDATE')` on the server and passes it as a prop.
- On fetch failure / not found → `notFound()`.

**Component:** `src/features/access/components/role-detail.tsx`

UI sections:
- **Breadcrumb:** Manajemen Pengguna & Akses / Manajemen Role / `{role.name}`
- **Back link:** "Lihat semua role terdaftar" → `/admin/access`
- **Edit Role Ini button:** only rendered when `canUpdate` is `true` (hidden entirely, not disabled) → `/admin/access/role/[id]/edit`
- **Informasi Role card:** role name, `StatusBadge` (`approved` for active, `draft` for draft), description, Total users count (from API `totalElements`)
- **Matriks Kontrol Akses card:** reads `PERMISSION_MODULES` from the create-role hook × `[READ, CREATE, UPDATE, DELETE]`; checks each action against `permissions: Record<string, string[]>` from the API — ✓ green for granted, — grey for denied
- **Akun Terdaftar card:** live user list from `GET /api/roles/:id/users` with client-side search + pagination

---

### 2. Manajemen Pengguna — `/admin/access` (Users Section)

**Route:** `src/app/admin/access/page.tsx`

- Reads `SIFPI_TOKEN` cookie and calls `serverGetAdminUsers` + `serverGetRoles` from the services layer in parallel via `Promise.all`.
- Replaced the previous mock users array with live API data.
- Passes `totalElements` from the API response as `totalEntries` to `UserTable`.

---

### 3. Manajemen Akses — `/admin/access` (Roles Section)

**Route:** `src/app/admin/access/page.tsx`

- `serverGetRoles` fetches from `GET /api/roles`.
- Replaced the previous mock roles array with live API data.
- Each "Lihat Detail" button navigates to `/admin/access/role/${role.id}`.

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/admin/access/page.tsx` | Removed inline fetch functions; now calls `serverGetAdminUsers` + `serverGetRoles` from services |
| `src/app/admin/access/role/[id]/page.tsx` | **New** — server page with permission guard; calls `serverGetRoleDetail` + `serverGetRoleUsers` from services |
| `src/features/access/components/role-detail.tsx` | **New** — client component rendering role detail UI; Akun Terdaftar now uses real API data |
| `src/features/access/components/user-table.tsx` | Migrated from `User` to `AdminUser` type; added `deriveStatus()`; linked "Lihat Detail" to `/admin/access/users/[email]`; fixed role filter values to match API (`PROJECT_OWNER`) |
| `src/features/access/types/index.ts` | Added `AdminUser` and `RoleUserItem` interfaces |
| `src/features/access/services/index.ts` | Fixed API paths (`/roles` → `/api/roles`, `/users` → `/api/admin/users`); added server-side helpers `serverGetAdminUsers`, `serverGetRoles`, `serverGetRoleDetail`, `serverGetRoleUsers`; added `getRoleUsers` client helper |

---

## API Endpoints Used

| Method | Endpoint | Used by |
|--------|----------|---------|
| `GET` | `/api/roles` | Access page — roles section |
| `GET` | `/api/roles/:id` | Role detail page |
| `GET` | `/api/roles/:id/users` | Role detail page — Akun Terdaftar card |
| `GET` | `/api/admin/users` | Access page — users section |
| `GET` | `/api/admin/users/:email` | User detail page (route ready, page TBD) |

---

## Status Mapping — AdminUser

| `is_active` | `is_verified` | Badge |
|-------------|---------------|-------|
| `true` | `true` | ✅ Active (`approved`) |
| `true` | `false` | 🔄 In Review (`in-review`) |
| `false` | `true` | ⬜ Inactive (`draft`) |
| `false` | `false` | ❌ Rejected (`rejected`) |

---

## Compliance Notes

- **API calls in services only:** All fetch logic lives in `src/features/access/services/index.ts`. Page files only import and call service functions — no fetch/axios inline in page or component files.
- **Two sets of service helpers:**
  - `apiGet`/`apiPost` (client-side axios) — for use in client components and hooks
  - `serverGet*` (raw `fetch` + cookie forwarding) — for use in server components, following the same pattern as `session.ts`. Axios cannot be used server-side because its request interceptor references `document.cookie`.
- **Permission checks on server only:** `hasPermission` is called in server page files only; pre-computed booleans (`canUpdate`, `canCreate`, `canDelete`) are passed as props to client components — `auth-guard` is never imported client-side.
- **Buttons hidden, not disabled:** All permission-gated buttons are conditionally rendered (`{canUpdate && <Button />}`) — never rendered as `disabled`.

---

## Backlog: UM-7 · Read Detail Account

---

## Pages Implemented

### 4. User Detail Page — `/admin/access/users/[email]`

Displays structured profile information for a single user, with layout that adapts per role.

**Route:** `src/app/admin/access/users/[email]/page.tsx`

- Protected with `withPermission('USER', 'READ')` — unauthenticated → `/login`, missing permission → 404.
- Fetches user data server-side via `serverGetAdminUserDetail(email, token)` from the services layer.
- The `email` path param is URL-decoded before being forwarded to the API.
- Computes `canUpdate = hasPermission(session, 'USER', 'UPDATE')` and `canDelete = hasPermission(session, 'USER', 'DELETE')` on the server and passes them as props.
- On fetch failure / not found → `notFound()`.

**Component:** `src/features/access/components/user-detail.tsx`

Layout adapts based on the **viewed user's** `role` field (data-driven display — not session-role gating):

| Role | Row 1 | Row 2 |
|---|---|---|
| `PROJECT_OWNER` | Informasi Pengguna + Statistik Pengguna | Informasi Organisasi + Aksi |
| `INVESTOR` | Informasi Pengguna + Statistik Pengguna | Informasi Organisasi + Aksi |
| `EXECUTIVE` | Informasi Pengguna + Informasi Jabatan + Aksi | — |
| `ADMIN` | Informasi Pengguna + Aksi | — |

UI sections:
- **Breadcrumb:** User Management / `{email}`
- **Back link:** "Lihat semua pengguna terdaftar" → `/admin/access`
- **Informasi Pengguna card:** name, email, `StatusBadge` (`approved` / `in-review` based on `email_verified`), info chips for role, phone, joined date, last login
- **Statistik Pengguna card (PROJECT_OWNER):** `jumlah_proyek` and `inquiry_masuk` counts, each with a "Lihat Detail" button (no redirect yet)
- **Statistik Pengguna card (INVESTOR):** `budget_range` and `sector_interest` (Preferensi Investasi), both labelled with a "Confidential" badge
- **Informasi Organisasi card (PROJECT_OWNER):** `organisasi`, `jabatan`
- **Informasi Organisasi card (INVESTOR):** `company_info.name`, `company_info.sector`, `company_info.industry_type` (if present)
- **Informasi Jabatan card (EXECUTIVE):** `jabatan`
- **Aksi Manajemen Akun card:** action buttons gated by server-computed permissions:
  - Verifikasi Akun — only shown when `canUpdate && !email_verified`
  - Edit Informasi — only shown when `canUpdate`
  - Nonaktifkan Akses — only shown when `canDelete`

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/admin/access/users/[email]/page.tsx` | **New** — server page with permission guard + `serverGetAdminUserDetail` call |
| `src/features/access/components/user-detail.tsx` | **New** — client component rendering role-adaptive user detail UI |
| `src/features/access/services/index.ts` | Added `serverGetAdminUserDetail(email, token)` |
| `src/features/access/types/index.ts` | Added `CompanyInfo` and `AdminUserDetail` interfaces |

---

## API Endpoints Used

| Method | Endpoint | Used by |
|--------|----------|---------|
| `GET` | `/api/admin/users/{email}` | User detail page |


**Component:** `src/features/access/components/role-detail.tsx`

UI sections:
- **Breadcrumb:** Manajemen Pengguna & Akses / Manajemen Role / `{role.name}`
- **Back link:** "Lihat semua role terdaftar" → `/admin/access`
- **Edit Role Ini button:** only rendered when `canUpdate` is `true` (hidden entirely, not disabled) → `/admin/access/role/[id]/edit`
- **Informasi Role card:** role name, `StatusBadge` (`approved` for active, `draft` for draft), description
- **Matriks Kontrol Akses card:** reads `PERMISSION_MODULES` from the create-role hook × `[READ, CREATE, UPDATE, DELETE]`; checks each action against `permissions: Record<string, string[]>` from the API — ✓ green for granted, — grey for denied
- **Akun Terdaftar card:** mock user list (placeholder until `GET /api/roles/:id/users` is available) with live search + pagination

---

### 2. Manajemen Pengguna — `/admin/access` (Users Section)

**Route:** `src/app/admin/access/page.tsx`

- Added `fetchAdminUsers()` — server-side fetch from `GET /api/admin/users`, runs in parallel with `fetchRoles()` via `Promise.all`.
- Replaced the previous mock users array with live API data.
- Passes `totalElements` from the API response as `totalEntries` to `UserTable`.

---

### 3. Manajemen Akses — `/admin/access` (Roles Section)

**Route:** `src/app/admin/access/page.tsx`

- Added `fetchRoles()` — server-side fetch from `GET /api/roles`.
- Replaced the previous mock roles array with live API data.
- Each "Lihat Detail" button already navigates to `/admin/access/role/${role.id}`.

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/admin/access/page.tsx` | Replaced mocks with real fetches for both users (`GET /api/admin/users`) and roles (`GET /api/roles`) |
| `src/app/admin/access/role/[id]/page.tsx` | **New** — server page with permission guard + `GET /api/roles/:id` fetch |
| `src/features/access/components/role-detail.tsx` | **New** — client component rendering role detail UI |
| `src/features/access/components/user-table.tsx` | Migrated from `User` to `AdminUser` type; added `deriveStatus()`; linked "Lihat Detail" to `/admin/access/users/[email]` |
| `src/features/access/types/index.ts` | Added `AdminUser` interface matching `GET /api/admin/users` response |
| `src/features/access/services/index.ts` | Fixed `getRoleDetail` path: `/roles/:id` → `/api/roles/:id` |

---

## API Endpoints Used

| Method | Endpoint | Used by |
|--------|----------|---------|
| `GET` | `/api/roles` | Access page — roles section |
| `GET` | `/api/roles/:id` | Role detail page |
| `GET` | `/api/admin/users` | Access page — users section |
| `GET` | `/api/admin/users/:email` | User detail page (route ready, page TBD) |

---

## Status Mapping — AdminUser

| `is_active` | `is_verified` | Badge |
|-------------|---------------|-------|
| `true` | `true` | ✅ Active (`approved`) |
| `true` | `false` | 🔄 In Review (`in-review`) |
| `false` | `true` | ⬜ Inactive (`draft`) |
| `false` | `false` | ❌ Rejected (`rejected`) |

---

## Backlog: UM-7 · Read Detail Account

---

## Pages Implemented

### 3. User Detail Page — `/admin/access/users/[email]`

Displays structured profile information for a single user, with layout that adapts per role.

**Route:** `src/app/admin/access/users/[email]/page.tsx`

- Protected with `withPermission('USER', 'READ')` — unauthenticated → `/login`, missing permission → 404.
- Fetches user data server-side via `GET /api/admin/users/{email}` using `SIFPI_TOKEN` cookie forwarding.
- The `email` path param is URL-decoded before being forwarded to the API.
- Computes `canUpdate = hasPermission(session, 'USER', 'UPDATE')` and `canDelete = hasPermission(session, 'USER', 'DELETE')` on the server and passes them as props.
- On fetch failure / not found → `notFound()`.

**Component:** `src/features/access/components/user-detail.tsx`

Layout adapts based on the **viewed user's** `role` field (data-driven display — not session-role gating):

| Role | Row 1 | Row 2 |
|---|---|---|
| `PROJECT_OWNER` | Informasi Pengguna + Statistik Pengguna | Informasi Organisasi + Aksi |
| `INVESTOR` | Informasi Pengguna + Statistik Pengguna | Informasi Organisasi + Aksi |
| `EXECUTIVE` | Informasi Pengguna + Informasi Jabatan + Aksi | — |
| `ADMIN` | Informasi Pengguna + Aksi | — |

UI sections:
- **Breadcrumb:** User Management / `{email}`
- **Back link:** "Lihat semua pengguna terdaftar" → `/admin/access`
- **Informasi Pengguna card:** name, email, `StatusBadge` (`approved` / `in-review` based on `email_verified`), info chips for role, phone, joined date, last login
- **Statistik Pengguna card (PROJECT_OWNER):** `jumlah_proyek` and `inquiry_masuk` counts, each with a "Lihat Detail" button (no redirect yet)
- **Statistik Pengguna card (INVESTOR):** `budget_range` and `sector_interest` (Preferensi Investasi), both labelled with a "Confidential" badge
- **Informasi Organisasi card (PROJECT_OWNER):** `organisasi`, `jabatan`
- **Informasi Organisasi card (INVESTOR):** `company_info.name`, `company_info.sector`, `company_info.industry_type` (if present)
- **Informasi Jabatan card (EXECUTIVE):** `jabatan`
- **Aksi Manajemen Akun card:** action buttons gated by server-computed permissions:
  - Verifikasi Akun — only shown when `canUpdate && !email_verified`
  - Edit Informasi — only shown when `canUpdate`
  - Nonaktifkan Akses — only shown when `canDelete`

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/admin/access/users/[email]/page.tsx` | **New** — server page with permission guard + `GET /api/admin/users/{email}` fetch |
| `src/features/access/components/user-detail.tsx` | **New** — client component rendering role-adaptive user detail UI |
| `src/features/access/services/index.ts` | Added `serverGetAdminUserDetail(email, token)` |
| `src/features/access/types/index.ts` | Added `CompanyInfo` and `AdminUserDetail` interfaces |

---

## API Endpoints Used

| Method | Endpoint | Used by |
|--------|----------|---------|
| `GET` | `/api/admin/users/{email}` | User detail page |

---

## Notes

- All server-side API calls use direct `fetch` with `SIFPI_TOKEN` cookie forwarding — **not** the axios `api` client — because the axios client references `document.cookie` in its request interceptor, which is unavailable in server components.
- Permission checks are always computed on the server. Booleans (`canUpdate`, `canCreate`) are passed as props to client components — `auth-guard` is never imported client-side.
- The `Edit Role Ini` button is **hidden** (not disabled) when the user lacks `USER:UPDATE` permission, per project conventions.
- Action buttons in `AksiCard` are **hidden** (not disabled) based on `canUpdate`/`canDelete` props — never shown and then disabled.

---

## Backlog: PM-4 · Read Single Project Detail (PO)

---

## Pages Implemented

### 5. Project Detail Page — `/project-owner/projects/[id]`

Displays all project data in a structured, read-only layout for the Project Owner.

**Route:** `src/app/project-owner/projects/[id]/page.tsx`

- Protected with `withPermission('PROJECT', 'READ')` — unauthenticated → `/login`, missing permission → 404.
- Validates that `id` is a finite positive integer; calls `notFound()` immediately for invalid values (e.g. `"null"`).
- Computes `canEdit = hasPermission(session, 'PROJECT', 'UPDATE')` on the server using the `session` injected by `withPermission`, and passes it as a prop.
- All data fetching is handled client-side inside `ProjectOwnerDetailView`.

**Component:** `src/features/project/components/project-owner-detail-view.tsx`

Fetches `GET /api/projects/{id}` and `GET /api/projects/{id}/history` in parallel via `Promise.all` on mount. On 404 → redirects to `/project-owner/projects`. Other errors → danger toast.

Layout:

| Section | Left column (1/3) | Right column (2/3) |
|---|---|---|
| Top bar | Panel Verifikasi (full width) + Metadata Proyek (fixed width) | — |
| Body | Strategic Narrative, Project Structure, Additional Info, Feasibility Study, Financials | Status Proyek (timeline), Project Information, Incentives, Project Owner Information |
| Bottom | Indicative / High-level Timeline (full width) | — |

UI sections:
- **Hero banner:** "Manajemen Proyek" heading + subheading
- **Breadcrumb:** Projects / `#{id}` → back link to `/project-owner/projects`
- **Panel Verifikasi card:** displays `rejectionReason` (admin notes); "Revisi (Edit) Proyek" button rendered only when `canEdit && status === PERBAIKAN_DATA` — hidden otherwise, never disabled
- **Metadata Proyek card:** project ID, `StatusBadge`, `editedAt`, `createdAt`, document download link → `GET /api/projects/{id}/file`
- **Strategic Narrative card:** location image via `GET /api/projects/{id}/location-image` with `onError` fallback; `valueProposition` text
- **Project Structure card:** structure image via `GET /api/projects/{id}/structure-image` with `onError` fallback
- **Additional Information card:** `additionalInfo` (rendered only when non-null)
- **Feasibility Study card:** availability badge (`isFeasibilityStudy`)
- **Financials card:** `totalCapex`, `totalOpex`, `npv`, `irr`, `revenueStream` — formatted as IDR / percentage
- **Status Proyek card:** 6-step vertical approval timeline (DRAFT → DIAJUKAN → IN_REVIEW → PERBAIKAN_DATA → TERVERIFIKASI → TERPUBLIKASI) derived from history API; each step shows its date (from `changedAt`) or "Menunggu"; contact links for WhatsApp / email
- **Project Information card:** sector, location, description, cooperation model, concession period, asset readiness
- **Incentives card:** `governmentSupport`
- **Project Owner Information card:** `contactPersonName`, `ownerInstitution`, `contactPersonEmail`, `contactPersonPhone`
- **Indicative Timeline card:** horizontal scroll row of `timelines[]` entries, each rendered as a card showing `timeRange` and `phaseDescription`

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/project-owner/projects/[id]/page.tsx` | **New** — server page with `withPermission('PROJECT', 'READ')` guard; computes `canEdit` and passes it as prop |
| `src/features/project/components/project-owner-detail-view.tsx` | **New** — client component; fetches project detail + history in parallel; renders full read-only detail layout |
| `src/features/project/services/index.ts` | Added `getProjectById(id)` and `getProjectHistory(id)` |
| `src/features/project/types/index.ts` | Added `ProjectDetailDTO` (extends `ProjectResponseDTO` with `ownerId`, `rejectionReason`, `createdAt`, `editedAt`) and `ProjectHistoryItemDTO` |

---

## API Endpoints Used

| Method | Endpoint | Used by |
|--------|----------|---------|
| `GET` | `/api/projects/{id}` | Project detail — main data |
| `GET` | `/api/projects/{id}/history` | Project detail — approval timeline |
| `GET` | `/api/projects/{id}/location-image` | Location map image (raw bytes) |
| `GET` | `/api/projects/{id}/structure-image` | Project structure image (raw bytes) |
| `GET` | `/api/projects/{id}/file` | Project document download (raw bytes) |

---

## Compliance Notes

- **API calls in services only:** `getProjectById` and `getProjectHistory` live in `src/features/project/services/index.ts` using `apiGet` from `src/shared/lib/api.ts` — no inline `fetch` or `axios` in component or page files. Image/file endpoints are used directly as `<img src>` / `<a href>` since they return raw bytes, not JSON.
- **Permission checks on server only:** `hasPermission` is called in the page file only; `canEdit` boolean is passed as a prop to the client component — `auth-guard` is never imported client-side.
- **Buttons hidden, not disabled:** "Revisi (Edit) Proyek" uses `{showEditButton && <Button />}` where `showEditButton = canEdit && status === PERBAIKAN_DATA` — never rendered as `disabled`.
- **No role-based gating:** all UI decisions use permission flags, not `session.role`.

---

## Backlog: UM-12 · Forgot Password

---

## Pages Implemented

### 6. Lupa Password — `/forgot-password`

Allows any unauthenticated user to request a password reset link by entering their email.

**Route:** `src/app/(public)/forgot-password/page.tsx`

- Public route inside the `(public)` route group — inherits shared Navbar + Footer from `(public)/layout.tsx`.
- No auth guard required (matches `AuthPath.PUBLIC` on the backend).
- Renders `ForgotPasswordForm` centered over the hero background image with a 70% dark overlay, matching the Figma design.

**Component:** `src/features/auth/components/forgot-password-form.tsx`

- Client component (`'use client'`).
- Email field with real-time validation (required + format check) using `TextInput` from `@/shared/components/form-fields`.
- `Notification` (info variant) from `@/shared/components/info-toast` displays the "Instruksi" hint below the input.
- On submit: calls `forgotPassword({ email })` → `POST /api/auth/forgot-password`.
- Backend always returns 200 regardless of whether the email is registered (prevents user enumeration). The form therefore transitions to a **success state** on any non-error response.
- **Success state:** `MailCheck` icon + confirmation message + "Kembali ke Login" button → `/login`.
- On network / server error: `showToast('danger', ...)` via `@/shared/components/toast`.
- Two-button layout: "Kirim Instruksi" (submit) + "Kembali" (Link → `/login`).

---

### 7. Reset Password — `/reset-password`

Allows a user to set a new password using the single-use token received by email.

**Route:** `src/app/(public)/reset-password/page.tsx`

- Public route inside the `(public)` route group.
- No auth guard required (matches `AuthPath.PUBLIC` on the backend).
- Renders `ResetPasswordForm` centered over the hero background image with a 70% dark overlay.

**Component:** `src/features/auth/components/reset-password-form.tsx`

- Client component (`'use client'`) with an inner `Suspense` boundary wrapping the `useSearchParams` consumer, as required by Next.js App Router.
- Reads `?token=` from the URL via `useSearchParams`. If missing → renders an **invalid token** state with a "Minta Link Baru" button → `/forgot-password`.
- **Password Baru** and **Konfirmasi Password Baru** fields using `TextInput` from `@/shared/components/form-fields`.
- Client-side validation before submission:
  - `newPassword` required + ≥ 8 characters.
  - `confirmPassword` must match `newPassword`.
  - Errors cleared field-by-field as the user types.
- On submit: calls `resetPassword({ token, newPassword, confirmPassword })` → `POST /api/auth/reset-password`.
- **Success state:** `CheckCircle` icon + "Password Berhasil Diubah" message + "Ke Halaman Login" button; auto-redirects to `/login` after 3 seconds via `setTimeout`.
- On API error (invalid/expired token, passwords don't match per backend): `showToast('danger', err.message, ...)` — the backend error message is surfaced directly to the user.

---

## Files Changed

| File | Change |
|------|--------|
| `src/features/auth/types/index.ts` | Added `ForgotPasswordRequest` and `ResetPasswordRequest` interfaces |
| `src/features/auth/services/index.ts` | Added `forgotPassword()` (`POST /api/auth/forgot-password`) and `resetPassword()` (`POST /api/auth/reset-password`) using `apiPost` |
| `src/features/auth/components/forgot-password-form.tsx` | **New** — client form component for the forgot-password flow |
| `src/features/auth/components/reset-password-form.tsx` | **New** — client form component for the reset-password flow; reads token from URL; wrapped in `Suspense` |
| `src/app/(public)/forgot-password/page.tsx` | **New** — public page rendering `ForgotPasswordForm` over hero background |
| `src/app/(public)/reset-password/page.tsx` | **New** — public page rendering `ResetPasswordForm` over hero background |

---

## API Endpoints Used

| Method | Endpoint | Used by |
|--------|----------|---------|
| `POST` | `/api/auth/forgot-password` | `ForgotPasswordForm` — sends reset link |
| `POST` | `/api/auth/reset-password` | `ResetPasswordForm` — applies new password with token |

---

## Compliance Notes

- **API calls in services only:** `forgotPassword` and `resetPassword` are defined in `src/features/auth/services/index.ts` using `apiPost` from `src/shared/lib/api.ts` — no inline `fetch` or `axios` in component files.
- **No auth guard on public pages:** both pages are inside the `(public)` route group and require no session. The middleware does not intercept them.
- **Token from URL only:** the reset token is read from `?token=` search params; it is never stored in state beyond the component's lifetime, and is submitted directly to the backend.
- **Backend-driven error messages:** `ApiError.message` from the backend (e.g. "Token reset password tidak valid atau sudah digunakan.") is passed directly to `showToast` — no frontend re-mapping of error codes.
- **No role-based gating:** both pages are fully public and require no permission checks.

---

## Backlog: UM-8 · View & Update Own Profile

---

## Pages Implemented

### 6. Profile Dispatcher — `/profile`

**Route:** `src/app/(public)/profile/page.tsx`

- Pure server-side dispatcher — renders no HTML.
- Calls `getSession()` to read the JWT on the server.
- Unauthenticated → `redirect('/login')`.
- Redirects each role to its dedicated profile route:

| Role | Redirect |
|------|----------|
| `ADMIN` | `/admin/profile` |
| `EXECUTIVE` | `/executive/profile` |
| `OWNER` / `PROJECT_OWNER` | `/project-owner/profile` |
| `INVESTOR` | `/investor/profile` |

This ensures the Navbar "Update Profil" link at `/profile` always reaches the correct role-specific page regardless of the logged-in user's role.

---

### 7. Investor Profile Page — `/investor/profile`

**Route:** `src/app/investor/profile/page.tsx`

- New dedicated route group `src/app/investor/` with its own `layout.tsx`.
- Layout calls `requireRole('INVESTOR')` — non-investors are redirected to their own home.
- Layout wraps with `<Navbar variant="authenticated">`, `<FlashToast />`, `<Footer />` (mirrors the public route group — no sidebar).

**Component:** `src/features/user-management/components/update-investor-profile-form.tsx`

- `'use client'` form; pre-fills all fields from `GET /api/users/profile` on mount.
- **Section: Data Diri dan Organisasi** — Nama (required), Email (required), Nomor Telepon (required), Perusahaan/Instansi, Jabatan.
- **Section: Preferensi Investasi** — Budget Investasi (dropdown), Sektor Prioritas (13-option checkbox grid, min 3 hint).
- **Section: Detail Profil Investor** — Stage Preferensi, Risk Appetite, Instrumen Investasi Pilihan, Model Keterlibatan, AUM Size, Kehadiran Lokal, Standar ESG.
- **Consent checkboxes** (below Detail Profil Investor): `opt_in_email` + `agree_privacy` — pre-filled from API, sent in every PATCH payload.
- Validation: name (required), email (format), phone (regex `^[+]?[0-9][0-9\s\-]{6,18}[0-9]$` + max 20 chars). 409 Conflict → surfaces on email field.
- "Batalkan" reverts all fields (including checkboxes) to `originalData`.
- Right card: **Ubah Password** dummy (all inputs disabled, helper text shown).

**Page wrapper:** `src/features/user-management/pages/update-profile/investor.tsx`

- Hero banner with `bg-primary/90` overlay, "UPDATE PROFILE" heading, back link to `/catalogue`.

---

### 8. Admin Profile Page — `/admin/profile`

**Route:** `src/app/admin/profile/page.tsx`

- Protected by the existing `src/app/admin/layout.tsx` (`requireRole('ADMIN')`).

**Component:** `src/features/user-management/components/update-admin-profile-form.tsx`

- `'use client'` form; pre-fills from `GET /api/users/profile`.
- Fields: Nama (required), Alamat Email (required), Nomor Telepon (required), Jabatan (optional).
- Same validation and "Batalkan" pattern as investor.
- Right card: **Ubah Password** dummy.

**Page wrapper:** `src/features/user-management/pages/update-profile/admin.tsx`

- Grey banner (`bg-grey`), "Update Profile" heading + "Kelola profil Anda" subheading.

---

### 9. Executive Profile Page — `/executive/profile`

**Route:** `src/app/executive/profile/page.tsx`

- New `src/app/executive/layout.tsx` created — calls `requireRole('EXECUTIVE')`, uses `DashboardShell navKey="executive"` with Footer. Mirrors admin layout.

**Component:** Reuses `UpdateAdminProfileForm` — Executive shares identical UM-8 fields with Admin (name, email, phone, jabatan).

**Page wrapper:** `src/features/user-management/pages/update-profile/executive.tsx`

- Same grey banner layout as admin.

---

### 10. Project Owner Profile Page — `/project-owner/profile`

**Route:** `src/app/project-owner/profile/page.tsx`

- Protected by the existing `src/app/project-owner/layout.tsx` (`requireRole('PROJECT_OWNER')`).

**Component:** `src/features/user-management/components/update-owner-profile-form.tsx`

- `'use client'` form; pre-fills from `GET /api/users/profile`.
- **Section: Data Diri** — Nama (required), Alamat Email (required), Nomor Telepon (required).
- **Section: Informasi Organisasi** — Nama organisasi (`institution_name`, optional), Posisi pada organisasi (`position`, optional — takes precedence over `jabatan` per UM-8).
- Same validation, cancel, and dummy password card pattern.

**Page wrapper:** `src/features/user-management/pages/update-profile/owner.tsx`

- Same grey banner layout as admin/executive.

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/(public)/profile/page.tsx` | Rewritten as pure role dispatcher — no HTML rendered, redirects all roles to dedicated routes |
| `src/app/investor/layout.tsx` | **New** — `requireRole('INVESTOR')` + Navbar authenticated + FlashToast + Footer |
| `src/app/investor/profile/page.tsx` | **New** — renders `InvestorUpdateProfilePage` |
| `src/app/executive/layout.tsx` | **New** — `requireRole('EXECUTIVE')` + `DashboardShell navKey="executive"` + Footer |
| `src/app/executive/profile/page.tsx` | Updated — renders `ExecutiveUpdateProfilePage` |
| `src/app/admin/profile/page.tsx` | Updated — renders `AdminUpdateProfilePage` |
| `src/app/project-owner/profile/page.tsx` | Updated — renders `OwnerUpdateProfilePage` |
| `src/features/user-management/types/index.ts` | Added `ProjectOwnerUserDetailDTO`, `UpdateProjectOwnerProfileRequest`; added `opt_in_email` + `agree_privacy` to `UpdateInvestorProfileRequest` |
| `src/features/user-management/services/index.ts` | Added `updateOwnerProfile()`; added `ProjectOwnerUserDetailDTO` + `UpdateProjectOwnerProfileRequest` imports |
| `src/features/user-management/components/update-investor-profile-form.tsx` | **New** — full investor form with all UM-8 fields, sector grid, consent checkboxes |
| `src/features/user-management/components/update-admin-profile-form.tsx` | **New** — admin/executive form (name, email, phone, jabatan) |
| `src/features/user-management/components/update-owner-profile-form.tsx` | **New** — project owner form (name, email, phone, institution_name, position) |
| `src/features/user-management/pages/update-profile/investor.tsx` | **New** — server page wrapper with hero banner |
| `src/features/user-management/pages/update-profile/admin.tsx` | **New** — server page wrapper with grey banner |
| `src/features/user-management/pages/update-profile/executive.tsx` | **New** — server page wrapper with grey banner, reuses admin form |
| `src/features/user-management/pages/update-profile/owner.tsx` | **New** — server page wrapper with grey banner |

---

## API Endpoints Used

| Method | Endpoint | Used by |
|--------|----------|---------|
| `GET` | `/api/users/profile` | All profile forms — pre-fill on mount |
| `PATCH` | `/api/users/profile` | All profile forms — submit handler |

---

## Compliance Notes

- **API calls in services only:** `getMyProfile`, `updateInvestorProfile`, `updateAdminProfile`, `updateOwnerProfile` all live in `src/features/user-management/services/index.ts` — no inline `fetch` or `axios` in component files.
- **No `auth-guard` in client components:** role is resolved server-side in layout/page files; forms receive no session prop and perform no role checks.
- **Payload is role-aware:** each form sends only the fields its role requires — investor sends investor-only fields, owner sends `institution_name`/`position`, admin/executive send `jabatan`. Role-specific fields from other roles are never included.
- **409 Conflict surfaces on email field:** if the API returns a 409 (email already in use), the error message is set on the email field instead of (or in addition to) a toast.
- **Dummy password card:** "Ubah Password" card is rendered but all inputs and buttons are `disabled` with a helper text note. No submit handler attached.

---

## Backlog: PM-11 · Read Single Project Detail (Public / Investor)

---

## Pages Implemented

### 11. Public Project Detail Page — `/projects/[id]`

Displays full read-only detail for a single published project, accessible to all visitors (no login required for viewing).

**Route:** `src/app/(public)/projects/[id]/page.tsx`

- No `requireRole` — public page, no auth wall.
- Calls `getSession()` server-side; passes `isLoggedIn: boolean` (true when session is non-null) as a prop to the client component.
- Inherits the public Navbar + Footer automatically via `(public)/layout.tsx`.

**Component:** `src/features/project/components/public-project-detail-view.tsx`

- `'use client'` — fetches `GET /api/catalogue/{id}` on mount via `getCatalogueProjectById` from the project services layer.
- Calls `POST /api/project-views` (fire-and-forget) on mount to register a view.
- Shows an animated skeleton while loading; renders an error/not-found state on failure.

**Layout — Responsive two-column:**

| Breakpoint | Layout |
|---|---|
| Mobile (`< lg`) | Single column — all cards stacked |
| Desktop (`lg+`) | `grid-cols-[1fr_480px]` — left narrative + right info panels |

**Left column cards:**

| Card | Content |
|---|---|
| Strategic Narrative / Value Proposition | Location image (`GET /api/catalogue/{id}/location-image`) + `description` + `valueProposition` |
| Project Structure | Structure image (`GET /api/catalogue/{id}/structure-image`) in 16:9 aspect ratio |
| Additional Information | `additionalInfo` — only rendered when non-null |

**Right column cards:**

| Card | Content |
|---|---|
| Project Information | `sector`, `location`, `cooperationModel`, `concessionPeriod`, `assetReadiness`, `ownerInstitution`, `isFeasibilityStudy` |
| Incentives / Government Support | `governmentSupport` |
| Financials | `totalCapex`, `totalOpex`, `npv`, `irr`, `revenueStream` — each as a labelled row |
| Project Owner Information | `contactPersonName`, `ownerInstitution`; email + phone only shown when `isLoggedIn`; contact buttons shown always but disabled + tooltipped when not logged in |

**Full-width card (below columns):**

| Card | Content |
|---|---|
| Indicative / High-level Timeline | Horizontal scrollable row of `TimelineChip` cards from `timelines[]` — only rendered when `timelines.length > 0` |

**Bottom metadata bar:** `createdAt` and `editedAt` formatted as Indonesian locale dates.

**Authentication-gated contact section:**

- When `isLoggedIn === false`:
  - `contactPersonEmail` and `contactPersonPhone` are not rendered; replaced with italic `"Kontak tersembunyi — login untuk melihat"`.
  - "Hubungi via WhatsApp" and "Hubungi via Email" buttons are `disabled`.
  - Hovering either button shows a portal tooltip: **"Login sebagai Investor untuk menghubungi"** — rendered via `createPortal` into `document.body` to escape the `overflow-hidden` card boundary.
- When `isLoggedIn === true`:
  - Full contact details shown; buttons are active links (`https://wa.me/...` and `mailto:`).

**Images:** Served from the API proxy (`/api/catalogue/{id}/location-image`, `/api/catalogue/{id}/structure-image`) using `next/image` with `unoptimized` (raw bytes, no Next.js image optimiser needed). **Download:** `<a href="/api/catalogue/{id}/file" download>`.

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/(public)/projects/[id]/page.tsx` | **New** — async server page; calls `getSession()`, passes `projectId` + `isLoggedIn` to client component |
| `src/features/project/components/public-project-detail-view.tsx` | **New** — client component; full PM-11 detail view with responsive layout, portal tooltip, and auth-gated contact |

No changes to existing services or types — `getCatalogueProjectById`, `recordProjectView`, and `CatalogueProjectDetailDTO` were already present in `src/features/project/services/index.ts` and `src/features/project/types/index.ts`.

---

## API Endpoints Used

| Method | Endpoint | Used by |
|--------|----------|---------|
| `GET` | `/api/catalogue/{id}` | Project detail — main data fetch |
| `POST` | `/api/project-views` | Project detail — view counter (fire-and-forget) |
| `GET` | `/api/catalogue/{id}/location-image` | Strategic Narrative card — location map image |
| `GET` | `/api/catalogue/{id}/structure-image` | Project Structure card — diagram image |
| `GET` | `/api/catalogue/{id}/file` | Download button — project document |

---

## Compliance Notes

- **API calls in services only:** `getCatalogueProjectById` and `recordProjectView` are imported from `src/features/project/services/index.ts` — no inline `fetch` or `axios` in the component.
- **No `auth-guard` in client component:** `isLoggedIn` is a plain boolean computed server-side in the page file and passed as a prop — `auth-guard` is never imported client-side.
- **Contact gating by permission, not role:** visibility of email/phone and button state are driven solely by the `isLoggedIn` boolean — no role string comparison anywhere.
- **Portal tooltip escapes `overflow-hidden`:** `TooltipButton` uses `createPortal` + `getBoundingClientRect` to position the tooltip fixed in the viewport, avoiding clipping by any ancestor with `overflow: hidden`.

---

## Backlog: UM-15 · Update Role (Admin)

---

## Pages Implemented

### 11. Edit Role Page — `/admin/access/role/[id]/edit`

Allows an Admin to update a role's name, status, description, permission matrix, and user assignments.

**Route:** `src/app/admin/access/role/[id]/edit/page.tsx`

- Protected with `withPermission('USER', 'UPDATE')` — unauthenticated → `/login`, missing permission → 404.
- Reads `SIFPI_TOKEN` cookie and calls `serverGetRoleDetail` + `serverGetRoleUsers` from the services layer in parallel via `Promise.all`.
- On fetch failure / not found → `notFound()`.
- Passes the full `RoleDetail` object and the initial role user list as props to `RoleEditForm`.

**Component:** `src/features/access/components/role-edit-form.tsx`

- `'use client'` form; all fields pre-filled from the server-fetched `RoleDetail`.
- **Back link:** "Lihat detail role" → `/admin/access/role/[id]`.
- **Informasi Role card:** Nama Role (required), Status Role dropdown (required), Deskripsi Role (required) — pre-filled from current values.
- **Matriks Kontrol Akses card:** editable permission matrix using the same `PERMISSION_MODULES` constant as create-role. Sub-permissions (Create/Edit/Delete) are disabled when "Dapat Akses" is unchecked. Disabling access auto-clears all sub-permissions; enabling any sub-permission auto-enables access.
- **Akun Terdaftar card:** searchable, paginated user table (fetched from `GET /api/admin/users`). Current role members are highlighted in blue and pre-checked. Unchecking a member queues them for removal; checking a non-member queues them for addition. Side panel shows live add/remove counters with a "Batalkan" reset button.
- **Audit trail notice:** info banner listing the total user count affected and referencing the audit log system.
- **Action buttons:** "Simpan Perubahan" (triggers confirm modal) + "Kembali (Buang Perubahan)" → detail page.

**Hook:** `src/features/access/hooks/use-edit-role-form.ts`

- Initializes form state from `initialRole` (name, `status ? '1' : '0'`, description, permissions converted via `parsePermissions`).
- Tracks user changes in two separate `Map` states: `toAddDetails` (non-members to add) and `toRemoveDetails` (current members to remove).
- `emailToIdMap` is seeded from `initialRoleUsers` at mount (all have IDs from the updated `GET /api/roles/{id}/users`); enriched further as all-users pages load.
- At submit: resolves `addUserIds` in order — (1) `u.id` from `UserDTO`, (2) `emailToIdMap` cache, (3) `getUserByEmail` per-user fallback. `removeUserIds` always resolves from `initialRoleUsers` which now always includes `id`.
- Omits `addUserIds`/`removeUserIds` from payload entirely when empty (per UM-15 — omitted = no change).
- On success: success toast + `router.push` to detail page + `router.refresh()`.
- On error: danger toast with `ApiError.message`.

**Confirmation modal:** `src/features/access/components/role-edit-confirm-modal.tsx`

- Shows a summary of all pending changes before final submission:
  - Informasi Role table (name, status, description).
  - Permissions table (active modules × actions, ✓ / – per cell).
  - Users to add (blue border table) — only shown when `toAddDetails.size > 0`.
  - Users to remove (red border table) — only shown when `toRemoveDetails.size > 0`.
  - Audit trail notice.
- "Kembali" closes the modal without submitting; "Konfirmasi & Simpan" calls `confirmSubmit`.

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/admin/access/role/[id]/edit/page.tsx` | **New** — server page with `withPermission('USER', 'UPDATE')` guard; fetches role detail + role users server-side |
| `src/features/access/components/role-edit-form.tsx` | **New** — client form with editable permission matrix, user assignment table with pre-checked members, side panel counters, confirmation modal |
| `src/features/access/components/role-edit-confirm-modal.tsx` | **New** — confirmation modal summarising all pending changes (info, permissions, add/remove user lists) |
| `src/features/access/hooks/use-edit-role-form.ts` | **New** — form state, permission toggle, user queue logic, ID resolution strategy, submit handler |
| `src/features/access/services/index.ts` | Added `updateRole(id, data)` (`PUT /api/roles/{id}`) and `getUserByEmail(email)` (`GET /api/admin/users/{email}`) |
| `src/features/access/types/index.ts` | Added `UpdateRoleRequest` interface; made `RoleUserItem.id` non-optional (BE now always returns it); added `id?: string` to `UserDTO` |

---

## API Endpoints Used

| Method | Endpoint | Used by |
|--------|----------|---------|
| `GET` | `/api/roles/{id}` | Edit page — pre-fill role info and permissions |
| `GET` | `/api/roles/{id}/users` | Edit page — seed initial member list and `emailToIdMap` |
| `GET` | `/api/admin/users` | Edit form — all-users table for assignment |
| `GET` | `/api/admin/users/{email}` | Submit fallback — resolve user ID when not in cache |
| `PUT` | `/api/roles/{id}` | Submit — send updated role data |

---

## User ID Resolution Strategy

`addUserIds` and `removeUserIds` require UUIDs. Resolution order:

| Source | Covers |
|--------|--------|
| `UserDTO.id` (from `GET /api/admin/users`) | Adds — if the all-users endpoint returns `id` |
| `emailToIdMap` cache (seeded from `initialRoleUsers`) | Adds for users who were already in this role; removes always |
| `getUserByEmail(email)` per-user fetch (fallback) | Adds — when neither above source has the ID |

`GET /api/roles/{id}/users` now always returns `id`, so **removes are always fully resolved** without any extra requests.

---

## Compliance Notes

- **API calls in services only:** `updateRole` and `getUserByEmail` live in `src/features/access/services/index.ts` — no inline `fetch` or `axios` in hook or component files.
- **Permission check on server only:** `withPermission('USER', 'UPDATE')` guards the page server-side; no `hasPermission` or `auth-guard` import in the client hook or components.
- **Buttons hidden, not disabled:** the "Edit Role Ini" button on the detail page is conditionally rendered (`{canUpdate && <Button />}`) — never shown as `disabled`.
- **Payload omits unchanged user lists:** `addUserIds` and `removeUserIds` are excluded from the request body when empty, matching the UM-15 spec ("omitted = no change").
- **Status serialised correctly:** UI uses `'1'`/`'0'` string values for the Radix `Select`; converted to `boolean` (`status === '1'`) before sending to the API.
