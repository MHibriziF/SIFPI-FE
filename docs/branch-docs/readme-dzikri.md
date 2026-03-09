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
