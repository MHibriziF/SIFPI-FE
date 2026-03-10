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
