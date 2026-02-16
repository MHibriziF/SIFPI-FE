# SIFPI - FE

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Structure

```
sifpi-fe/
├── public/                     # Static assets (SVGs, images)
├── src/
│   ├── app/                    # Next.js App Router (routes & layouts)
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── favicon.ico
│   ├── features/               # Feature modules (domain-driven)
│   │   └── <feature>/
│   │       ├── components/     # UI components scoped to the feature
│   │       ├── hooks/          # React hooks scoped to the feature
│   │       ├── services/       # API calls & business logic for the feature
│   │       └── types/          # TypeScript types for the feature
│   ├── shared/                 # Code shared across all features
│   │   ├── components/         # Reusable UI components
│   │   ├── lib/                # Utilities & API client (axios)
│   │   └── types/              # Shared TypeScript types (BaseResponse, ApiError)
│   └── styles/
│       └── globals.css         # Global styles (Tailwind CSS)
├── Dockerfile
├── docker-compose.yaml
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
└── package.json
```

## Architecture

The project follows a **feature-based architecture** on top of the Next.js App Router. Each domain feature lives under `src/features/<feature>/` with its own `components`, `hooks`, `services`, and `types` directories, keeping related code co-located and isolated from other features. Code that is used across multiple features (the axios API client, shared types like `BaseResponse`/`ApiError`, and reusable UI components) resides in `src/shared/`. Routing and page layouts are handled by the Next.js App Router in `src/app/`. The API layer uses axios with typed helpers (`apiGet`, `apiPost`, etc.) and a centralized error interceptor that normalizes backend errors into an `ApiError` class.

## Getting Started

### With Next.JS default

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### With docker

1. Make sure that Docker is installed and is running in your local device.
2. Run `docker compose up -d`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
