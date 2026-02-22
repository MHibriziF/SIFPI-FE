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
</motion.div>
```

- `whileInView` triggers the animation when the element scrolls into view.
- `viewport={{ once: true }}` means it only plays once, not every time it re-enters.
- Add `margin: '-50px'` to `viewport` to trigger slightly before the element is fully visible.
- Use `transition={{ delay: 0.1 }}` etc. for staggered effects.
- Any component using `motion` must have `'use client'` at the top.

## Design System

A design system page is available at **`/design-system`** (dev only). It showcases all shared UI components — buttons, form fields, badges, toasts, and both navbar variants — so you can develop and review components in isolation without navigating the full app.

To add a new component to the design system, edit `src/app/design-system/page.tsx`.
