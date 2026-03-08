# Branch Docs — Dzikri

## Backlog: UM-14 · Read Role Detail & Manajemen Pengguna

---

## Pages Implemented

### 1. Role Detail Page — `/admin/access/role/[id]`

Displays structured information for a single role.

**Route:** `src/app/admin/access/role/[id]/page.tsx`

- Protected with `withPermission('USER', 'READ')` — unauthenticated → `/login`, missing permission → 404.
- Fetches role data server-side via `GET /api/roles/:id` using `SIFPI_TOKEN` cookie forwarding (same pattern as `session.ts`).
- Computes `canUpdate = hasPermission(session, 'USER', 'UPDATE')` on the server and passes it as a prop.
- On fetch failure / not found → `notFound()`.

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

## Notes

- All server-side API calls use direct `fetch` with `SIFPI_TOKEN` cookie forwarding — **not** the axios `api` client — because the axios client references `document.cookie` in its request interceptor, which is unavailable in server components.
- Permission checks are always computed on the server. Booleans (`canUpdate`, `canCreate`) are passed as props to client components — `auth-guard` is never imported client-side.
- The `Edit Role Ini` button is **hidden** (not disabled) when the user lacks `USER:UPDATE` permission, per project conventions.
