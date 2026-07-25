@AGENTS.md

# Garden Town

Community garden management app built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack
- Next.js 16 (App Router) with TypeScript
- Tailwind CSS v4
- PostgreSQL + Prisma (to be set up)
- NextAuth.js (to be set up)
- Plant APIs: OpenFarm, Perenual

## Project Structure
- `src/app/` — Next.js App Router pages
- `src/components/ui/` — Reusable UI primitives
- `src/components/features/` — Domain-specific components
- `src/lib/` — Utilities, API clients, helpers
- `src/hooks/` — Custom React hooks
- `src/types/` — TypeScript interfaces and types
- `prisma/` — Database schema
- `docs/` — Requirements and design docs

## Conventions
- Use functional components with hooks
- Use Tailwind utility classes for styling
- Types are defined in `src/types/index.ts`
- Mobile-first responsive design
