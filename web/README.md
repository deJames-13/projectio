# Projectio

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Features Completed

- [x] **Relational Project Management**: Full CRUD for projects with creator ownership, status, progress, icon, and accent color.
- [x] **Project-Task Association (1:N)**: Tasks optionally or directly assigned to projects, assignees, and co-assignees.
- [x] **Project-Document Association (1:N & Confidential Mode)**: Documents can be tied to projects (visible to team members) or saved as personal confidential notes (`projectId: null`, strictly author-only).
- [x] **Team Member Management**: Live user search by username (`@username`), display name, or email with instant invite to projects. Creator-guarded member removals.
- [x] **Authentication & Isolated Workspaces**: NextAuth with Discord OAuth and credentials provider. Automatic starter workspace provisioning on user registration.
- [x] **Modular tRPC API**: Modular routers adhering to Create-T3 architecture (`project`, `task`, `doc`, `member`, `workspace`, `comment`, `activity`, `milestone`, `notification`, `auth`).
- [x] **Product Design System**: 4-tier UX/UI hierarchy conforming to WCAG AA, 8pt spacing grid, responsive drawers, modal dialogs, and 5-state completeness (Initial, Loading, Empty, Error, Filled).

## Roadmap

- [x] Add image upload using UploadThing
- [ ] Error monitoring with Sentry
- [ ] Parallel routes & modal routing
- [ ] Product Analytics (PostHog)
- [ ] API Rate Limiting (Upstash / Redis)

## Test Deployment with Vercel + Supabase Postgres Database
- [x] Vercel
- [x] Supabase Postgres (supabse cli)

## 911
- [x] add user profile customizations (image,role,etc.)
- [x] drag and drop Tasks
- [ ] when project is deleted, delete all tasks? (cascade delete??)
- [ ] when adding members search for the users database and use the username instead of name and role, dont add images,role just username search 

## UI 
- [x] google button hover contrast fix
- [x] fix dark mode in dashboard, the side bar and nav has dark mode but the
actual content is not. This also appears in profile
- [x] remove logo in breadcrumbs
- [x] disable username handle changing for now
