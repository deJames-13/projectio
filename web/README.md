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

- [ ] Add image upload using UploadThing
- [ ] Error monitoring with Sentry
- [ ] Parallel routes & modal routing
- [ ] Product Analytics (PostHog)
- [ ] API Rate Limiting (Upstash / Redis)


## 911
agy --conversation=1102cb64-2fde-46ce-a4bd-545a1a849fc7

- [ ] add user profile customizations (image,role,etc.)
- [ ] Fix members showing in workspace??
- [ ] Add workspace management if theres members?
- [ ] drag and drop Tasks
- [ ] when project is deleted, delete all tasks? (cascade delete??)




