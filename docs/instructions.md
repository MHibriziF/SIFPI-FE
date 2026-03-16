# Development Instructions

## Project Structure

Follow the established folder structure. Do not dump files in arbitrary locations.

```
src/
├── app/                  # Next.js App Router pages and layouts
├── features/             # Feature-based modules
│   └── <feature-name>/
│       ├── components/   # UI components specific to this feature
│       ├── hooks/        # Custom hooks for this feature
│       ├── services/     # API call functions for this feature
│       └── types/        # TypeScript types/interfaces for this feature
└── shared/               # Reusable across features
    ├── components/       # Generic, reusable UI components
    ├── lib/              # Utility libraries (e.g., api.ts)
    └── types/            # Shared TypeScript types
```

- Each new feature goes under `src/features/<feature-name>/`.
- Reusable components and utilities go under `src/shared/`.
- Do not put feature-specific logic inside `src/shared/`.

## Environment Variables & Secrets

- **Never hardcode secrets**, API keys, tokens, or environment-specific URLs in source code.
- All configuration values must go in `.env.local` (not committed to the repo).
- Access them via `process.env.NEXT_PUBLIC_*` (client-safe) or `process.env.*` (server-only).
- Refer to `.env.example` for the list of required variables.

## Making API Calls

Always use the typed helpers from `src/shared/lib/api.ts`. Do not use `fetch` or `axios` directly.

### Available helpers

| Helper                           | Method | Use for                  |
| -------------------------------- | ------ | ------------------------ |
| `apiGet<T>(url, params?)`        | GET    | Fetching data            |
| `apiPost<T>(url, body?)`         | POST   | Creating resources       |
| `apiPut<T>(url, body?)`          | PUT    | Full update              |
| `apiPatch<T>(url, body?)`        | PATCH  | Partial update           |
| `apiDelete<T>(url)`              | DELETE | Deleting resources       |
| `apiPostFile<T>(url, formData)`  | POST   | Uploading files          |
| `apiPutFile<T>(url, formData)`   | PUT    | Replacing files          |
| `apiPatchFile<T>(url, formData)` | PATCH  | Partially updating files |

All helpers return `Promise<BaseResponse<T>>` and throw `ApiError` on failure.

### Example usage

```ts
import { apiGet, apiPost, ApiError } from '@/shared/lib/api';
import { apiGet, apiPost } from '@/shared/lib/api';
import type { User } from '../types/user';

// GET
const response = await apiGet<User[]>('/users');
const users = response.data;

// POST
const created = await apiPost<User>('/users', { name: 'Alice' });

// Error handling
try {
  const result = await apiGet<User>('/users/1');
} catch (err) {
  if (err instanceof ApiError) {
    console.error(err.status, err.message);
  }
}
```

Place API call functions inside the relevant `features/<feature>/services/` file, not directly in components or hooks.

## Animations

Use the **`motion`** library (installed) for scroll-triggered and entrance animations. Docs: https://motion.dev/docs/react-quick-start

### Scroll-triggered fade-in (most common pattern)

```tsx
'use client';

import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  content
</motion.div>;
```

- `whileInView` triggers the animation when the element scrolls into view.
- `viewport={{ once: true }}` means it only plays once, not every time it re-enters.
- Add `margin: '-50px'` to `viewport` to trigger slightly before the element is fully visible.
- Use `transition={{ delay: 0.1 }}` etc. for staggered effects.
- Any component using `motion` must have `'use client'` at the top.

## Public Pages (Route Group)

All public-facing pages live inside the `(public)` route group at `src/app/(public)/`. This route group provides the shared public layout (Navbar + Footer) automatically.

To add a new public page, create a folder inside `(public)/`:

```
src/app/(public)/
├── layout.tsx          ← public layout (Navbar + Footer) — do not duplicate
├── page.tsx            ← Home page (/)
├── login/
│   └── page.tsx        ← /login
├── register/
│   └── page.tsx        ← /register
└── your-page/
    └── page.tsx        ← /your-page
```

The layout reads the `SIFPI_TOKEN` cookie on the server and switches the Navbar between `public` (Login/Register links) and `authenticated` (Inquiries/Profile/Logout) variants automatically.

## Design System

A design system page is available at **`/design-system`** (dev only). It showcases all shared UI components — buttons, form fields, badges, toasts, and both navbar variants — so you can develop and review components in isolation without navigating the full app.

To add a new component to the design system, edit `src/app/design-system/page.tsx`.

## Sidebar & Dashboard Layout

Some pages use a sidebar layout instead of the public Navbar + Footer. The sidebar system lives in `src/shared/components/sidebar/`.

### Key files

| File                          | Purpose                                                                   |
| ----------------------------- | ------------------------------------------------------------------------- |
| `sidebar/sidebar.tsx`         | shadcn primitive — do not edit                                            |
| `sidebar/nav-configs.ts`      | Nav item definitions per role (`ADMIN_NAV`, `OWNER_NAV`, `EXECUTIVE_NAV`) |
| `sidebar/app-sidebar.tsx`     | Renders the sidebar from a `navKey` prop                                  |
| `sidebar/dashboard-shell.tsx` | Full shell: `SidebarProvider` + `AppSidebar` + `SidebarInset` header      |

### Adding a new role

1. Add a nav array in `nav-configs.ts`:

```ts
export const MY_ROLE_NAV: NavGroup[] = [
  {
    label: 'Section',
    items: [
      { title: 'Page', href: '/myrole/page', icon: SomeIcon },
    ],
  },
];

// Also add to NAV_CONFIGS and NavKey:
export type NavKey = 'admin' | 'owner' | 'executive' | 'myrole';
export const NAV_CONFIGS: Record<NavKey, NavGroup[]> = { ..., myrole: MY_ROLE_NAV };
```

2. Create a route and layout:

```
src/app/role/
├── layout.tsx
└── some-page/page.tsx
```

```tsx
// role/layout.tsx
import DashboardShell from '@/shared/components/sidebar/dashboard-shell';

export default function MyRoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navKey="myrole" user={{ name: 'User Name', role: 'My Role' }}>
      {children}
    </DashboardShell>
  );
}
```

That's it — the sidebar, mobile drawer, colors, and toggle are all handled by `DashboardShell`.

### Adding pages to a role (sitemap)

**You never touch the layout again.** Every `page.tsx` you create inside the route folder automatically gets the sidebar — no imports needed in the page file.

```
src/app/example/
├── layout.tsx                        ← sidebar defined here ONCE
├── dashboard/
│   └── page.tsx                      → /dashboard
├── projects/
│   ├── page.tsx                      → /dashboard/projects
│   ├── pending/
│   │   └── page.tsx                  → /dashboard/projects/pending
│   └── [id]/
│       └── page.tsx                  → /dashboard/projects/[id]
├── users/
│   └── page.tsx                      → /dashboard/users
└── settings/
    └── page.tsx                      → /dashboard/settings
```

Each page is just a plain component:

```tsx
// src/app/role/projects/page.tsx
export default function ProjectsPage() {
  return (
    <div className="p-6">
      <h1>Projects</h1>
    </div>
  );
}
```

Next.js automatically wraps it with the nearest parent `layout.tsx`. The sidebar stays mounted and does **not** re-render when navigating between pages in the same route group.

> When a new page is added to the sidebar nav, add its href to `nav-configs.ts` and create the matching `page.tsx` inside the route group. The two must be kept in sync manually.

### Adding a dropdown (collapsible) nav item

Add `subItems` to any `NavItem` in `nav-configs.ts`:

```ts
{
  title: 'Projects',
  href: '/dashboard/projects',
  icon: FolderKanban,
  subItems: [
    { title: 'All Projects', href: '/dashboard/projects' },
    { title: 'Pending Review', href: '/dashboard/projects/pending' },
  ],
},
```

`AppSidebar` automatically renders it as a collapsible group. Items without `subItems` render as a flat link.

### Notes

- Pass only `navKey` (a string) from server layouts — never pass nav arrays directly, as Lucide icon components cannot be serialized across the server/client boundary.
- The sidebar color theme is defined in `SIDEBAR_THEME` inside `dashboard-shell.tsx`.
- The public Navbar and Footer only appear on pages inside the `(public)` route group — they are inherited from `(public)/layout.tsx`. Pages outside that group (e.g. `/admin`, `/owner`) have no Navbar or Footer by default; they use `DashboardShell` via their own `layout.tsx` instead.

## Authorization & Permissions

The backend uses a **role + permission matrix** model. The login response includes both:

```json
{
  "role": "ADMIN",
  "permissions": {
    "PROJECT": ["CREATE", "READ", "UPDATE", "DELETE"],
    "NEWS": ["CREATE", "READ", "UPDATE", "DELETE"],
    "INQUIRY": ["CREATE", "READ", "UPDATE", "DELETE"],
    "USER": ["CREATE", "READ", "UPDATE", "DELETE"],
    "VERIFICATION": ["CREATE", "READ", "UPDATE", "DELETE"]
  }
}
```

- **`role`** is a `string`. The four built-in values are `ADMIN`, `OWNER`, `INVESTOR`, and `EXECUTIVE`. Admins can create custom roles with arbitrary names — those fall back to `/dashboard`.
- **`permissions`** determines what a user can see and do in the UI.

### Rule: never gate UI by role

Do not conditionally render UI based on `role`. Always check **permissions** instead. This ensures custom roles work correctly without code changes.

```ts
// WRONG
if (session.role === 'ADMIN') showDeleteButton();

// CORRECT
if (hasPermission(session, 'PROJECT', 'DELETE')) showDeleteButton();
```

### Route guards

All auth utilities live in `src/shared/lib/auth-guard.ts`. This file is **server-only** — never import it from a client component.

#### Two-layer protection

| Layer | File | What it does |
| ----- | ---- | ------------ |
| Middleware | `src/proxy.ts` | Fast edge check — redirects to `/login` if no token |
| Layout guard | `src/app/<role>/layout.tsx` | Calls `requireRole()` — redirects wrong-role users to their own home |

The middleware covers all protected route prefixes. The layout does the real role check via `getSession()`.

#### `requireRole(...allowed)`

Use in **server layouts** for routes that belong to specific known roles.

```tsx
// src/app/admin/layout.tsx
import { requireRole } from '@/shared/lib/auth-guard';

export default async function AdminLayout({ children }) {
  const session = await requireRole('ADMIN', 'EXECUTIVE');
  // session is AuthResponse — redirects to /login or the user's own home if role doesn't match
  ...
}
```

#### `requireCustomRole()`

Use in **`/dashboard/layout.tsx`** for custom (non-built-in) roles. Redirects the four known roles to their own home.

```tsx
// src/app/dashboard/layout.tsx
import { requireCustomRole } from '@/shared/lib/auth-guard';

export default async function DashboardLayout({ children }) {
  const session = await requireCustomRole();
  ...
}
```

#### `getRoleHome(role)`

Maps a role string to its home page. Returns `/dashboard` for unknown roles, `/login` for `null`.

```ts
import { getRoleHome } from '@/shared/lib/auth-guard';

getRoleHome('ADMIN')     // '/admin/dashboard'
getRoleHome('OWNER')     // '/owner/dashboard'
getRoleHome('INVESTOR')  // '/catalogue'
getRoleHome('EXECUTIVE') // '/admin/insights'
getRoleHome('CUSTOM')    // '/dashboard'
getRoleHome(null)        // '/login'
```

#### `getRole()`

Cached async helper that returns the current user's role string (or `null`). Safe to call in server components without worrying about duplicate `/api/me` calls.

```ts
import { getRole } from '@/shared/lib/auth-guard';

const role = await getRole(); // string | null
```

### `hasPermission` utility

```ts
import { hasPermission } from '@/shared/lib/auth-guard';
import type { Resource, Action } from '@/shared/lib/auth-guard';
```

```ts
hasPermission(session, resource, action): boolean
```

| Parameter  | Type                                                            |
| ---------- | --------------------------------------------------------------- |
| `session`  | `AuthResponse \| null \| undefined`                            |
| `resource` | `'PROJECT' \| 'NEWS' \| 'INQUIRY' \| 'USER' \| 'VERIFICATION'` |
| `action`   | `'CREATE' \| 'READ' \| 'UPDATE' \| 'DELETE'`                   |

Returns `false` if session is `null`/`undefined` — safe to call without a null check.

`auth-guard` is **server-only**. `hasPermission` can only be called in server components. Client components must receive the pre-computed boolean (or the session) as a prop.

### `withPermission` — page-level guard (like `@PreAuthorize`)

For gating an entire page, use `withPermission` instead of calling `hasPermission` manually. It wraps the page component, checks auth + permission, and injects `session` as the second argument.

```tsx
import { withPermission } from '@/shared/lib/auth-guard';

export default withPermission('PROJECT', 'READ')(async (props, session) => {
  return <ProjectList />;
});
```

Compared to the manual approach:

```tsx
// Without withPermission — verbose
export default async function ProjectsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!hasPermission(session, 'PROJECT', 'READ')) notFound();
  return <ProjectList />;
}

// With withPermission — clean
export default withPermission('PROJECT', 'READ')(async (props, session) => {
  return <ProjectList />;
});
```

`props` is the standard Next.js page props (`params`, `searchParams`). Use them normally:

```tsx
export default withPermission('PROJECT', 'READ')(async ({ params }, session) => {
  const { id } = await params;
  const project = await getProject(id);
  return <ProjectDetail project={project} canEdit={hasPermission(session, 'PROJECT', 'UPDATE')} />;
});
```

Behaviour:
- Unauthenticated → redirect to `/login`
- Authenticated but missing permission → `notFound()` (404)
- Authenticated with permission → page renders, `session` is injected

#### Hiding / showing UI elements

The most common pattern — render an action only when the user has the matching permission:

```tsx
import { getSession } from '@/shared/lib/session';
import { hasPermission } from '@/shared/lib/auth-guard';

export default async function ProjectsPage() {
  const session = await getSession();

  const canCreate = hasPermission(session, 'PROJECT', 'CREATE');
  const canDelete = hasPermission(session, 'PROJECT', 'DELETE');

  return (
    <div>
      {canCreate && <CreateProjectButton />}

      <ProjectList>
        {/* pass the flag down to a client component */}
        <ProjectRow canDelete={canDelete} />
      </ProjectList>
    </div>
  );
}
```

Never show a button (e.g. Delete) and then disable it — just don't render it at all.

#### Blocking an entire page section

Use `notFound()` or a redirect when the user has no read access to the resource:

```tsx
import { notFound } from 'next/navigation';
import { getSession } from '@/shared/lib/session';
import { hasPermission } from '@/shared/lib/auth-guard';

export default async function UsersPage() {
  const session = await getSession();

  if (!hasPermission(session, 'USER', 'READ')) notFound();

  return <UserTable />;
}
```

#### Passing flags to client components

`hasPermission` cannot be called inside a client component. Compute the booleans on the server and pass them as props:

```tsx
// server page — compute all flags here
export default async function ProjectDetailPage() {
  const session = await getSession();

  return (
    <ProjectActions
      canEdit={hasPermission(session, 'PROJECT', 'UPDATE')}
      canDelete={hasPermission(session, 'PROJECT', 'DELETE')}
    />
  );
}

// client component — receives pre-computed flags, no auth-guard import needed
'use client';

interface Props {
  canEdit: boolean;
  canDelete: boolean;
}

export function ProjectActions({ canEdit, canDelete }: Props) {
  return (
    <div>
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
    </div>
  );
}
```

#### What not to do

```tsx
// ✗ importing auth-guard in a client component — build error
'use client';
import { hasPermission } from '@/shared/lib/auth-guard';

// ✗ gating by role instead of permission
if (session.role === 'ADMIN') { ... }

// ✗ showing a disabled button instead of hiding it
<Button disabled={!canDelete}>Delete</Button>
```

### Post-login redirect

After login, users are redirected via `ROLE_REDIRECT` in `login-form.tsx`:

| Role        | Redirect          |
| ----------- | ----------------- |
| `ADMIN`     | `/admin/dashboard`  |
| `OWNER`     | `/owner/dashboard`  |
| `INVESTOR`  | `/catalogue`        |
| `EXECUTIVE` | `/admin/insights`   |
| _(custom)_  | `/dashboard`        |

Custom roles fall back to `/dashboard`. That layout calls `requireCustomRole()` and the pages themselves should gate content with `hasPermission`.
