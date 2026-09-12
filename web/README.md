<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/title-light-500.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/title-dark-500.png">
  </picture>
</p>

<p align="center">
  <strong>High-performance, zero-latency agile project management engineered for speed, clarity, and precision.</strong>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript_5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.8" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" /></a>
  <a href="https://trpc.io"><img src="https://img.shields.io/badge/tRPC_v11-2596BE?style=for-the-badge&logo=trpc&logoColor=white" alt="tRPC v11" /></a>
  <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma_v6-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma v6" /></a>
  <a href="https://authjs.dev"><img src="https://img.shields.io/badge/Auth.js_v5-black?style=for-the-badge&logo=nextauth.js&logoColor=white" alt="Auth.js v5" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
  <a href="https://uploadthing.com"><img src="https://img.shields.io/badge/UploadThing-FF4F64?style=for-the-badge&logo=uploadthing&logoColor=white" alt="UploadThing" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License: MIT" /></a>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#%EF%B8%8F-architecture--data-flow">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-environment-variables">Environment Variables</a> •
  <a href="#-database--seeding">Database & Seeding</a> •
  <a href="#-available-scripts">Scripts</a> •
  <a href="#-roadmap">Roadmap</a> •
  <a href="#-license">License</a>
</p>

---

## 🧭 Overview

**Projectio** is an open-source, multi-tenant project management platform engineered with the **Create T3 Stack** (`Next.js 16`, `tRPC v11`, `Prisma v6`, `Tailwind CSS v4`). Designed for modern product squads and high-velocity engineering teams, Projectio eliminates sprint friction by unifying interactive Kanban boards, automated velocity telemetry, Git branch linking, and markdown specifications into one cohesive interface.

Built with strict end-to-end type safety, optimistic UI updates, and an anti-slop design system complying with WCAG 2.1 AA accessibility standards, Projectio delivers desktop-grade responsiveness in both dark and light modes.

---

## ✨ Key Features

### 📊 Interactive Kanban & Sprint Orchestration

- **Drag-and-Drop Workflows:** Move tasks seamlessly across `Backlog`, `Todo`, `In Progress`, `Review`, and `Done` with immediate optimistic UI updates.
- **Granular Task Prioritization:** Categorize initiatives with `P0 (Urgent)`, `P1 (High)`, `P2 (Medium)`, and `P3 (Low)` indicators.
- **Dependency & Blocker Tracking:** Visualize blocked tasks and blocking relationships (`blocks`) directly on task cards.
- **Git Branch Association:** Attach development branches directly to task records for immediate traceability across developer workflows.
- **Team Assignment & Co-assignees:** Assign tasks to primary owners with support for multiple co-assignees and quick-view avatar stacks.
- **Live Task Activity & Comments:** Detailed activity drawer featuring rich discussion threads and human-readable relative timestamps.

### 🏢 Multi-Tenant Workspaces & Role-Based Access (RBAC)

- **Isolated Tenant Workspaces:** Secure workspace boundaries mapped to custom slugs (`/dashboard`, `projects`, etc.).
- **Role-Based Governance:** Built-in permissions hierarchy: `Owner`, `Admin`, `Member`, and `Product Lead`.
- **Live User Search & Fast Invites:** Instantly invite collaborators by searching usernames (`@username`), full names, or email addresses.
- **Creator-Guarded Protections:** Prevents accidental removals and enforces creator ownership over project resources.

### 📁 Relational Project Tracking

- **Full CRUD Project Management:** Create, customize, edit, and archive projects with custom titles, rich descriptions, and launch targets.
- **Visual Status Indicators:** Monitor project states at a glance: `On Track`, `At Risk`, `Delayed`, or `Completed`.
- **Progress Telemetry:** Dynamic percentage calculations driven by completed child tasks.
- **Design Customization:** Assign unique project icon motifs (`palette`, `terminal`, `code`, etc.) and hex accent colors.

### 📝 Documentation Hub & Confidential Notes

- **Project Specifications:** Link engineering requirements, product specs, and API definitions directly to parent projects.
- **Confidential Author Mode:** Personal notes with `projectId: null` strictly isolated to the author for private brainstorming.
- **Categorization & Bookmarks:** Star critical documents and filter by category for rapid lookup.

### ⌨️ Command Palette & Velocity UX

- **Omnipresent Quick Actions:** Trigger the global command palette via `Cmd + K` (Mac) or `Ctrl + K` (Windows/Linux).
- **Instant Navigation:** Fast-jump to tasks, projects, documentation, team settings, or switch workspaces without touching the mouse.

### 🎨 Design System & Anti-Slop Principles

- **Dual Theme Engine:** Pixel-perfect dark and light themes with seamless automatic system preference detection.
- **4-Tier UX Hierarchy:** Strict design standard: Strategy (Tier 1) → Aesthetic Identity (Tier 2) → Anti-Slop Verification (Tier 3) → Technical Standards (Tier 4).
- **5-State Completeness:** Every interface handles `Initial`, `Loading` (skeletons), `Empty` (actionable CTA), `Error` (clear recovery), and `Filled` states.
- **WCAG 2.1 AA Compliance:** Minimum 4.5:1 contrast ratios, keyboard navigation landmarks, visible focus rings, and 8pt spatial grid rhythm.

---

## ⚡ Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Client["Client Surface (Web / Browser)"]
        UI["Next.js 16 App Router (React 19)"]
        TC["tRPC React Query Client (@tanstack/react-query v5)"]
        Theme["Dark / Light Theme Engine"]
        UI --> TC
        UI --> Theme
    end

    subgraph Server["Server Layer (Next.js Node Server)"]
        API["tRPC Router Handler (/api/trpc)"]
        Auth["Auth.js v5 (NextAuth) Session Validator"]
        Zod["Zod Input / Output Schema Validation"]
        Routers["Modular Routers:
        • task  • project  • workspace
        • doc   • member   • comment
        • auth  • activity • milestone"]

        API --> Auth
        Auth --> Zod
        Zod --> Routers
    end

    subgraph Data["Database & External Services"]
        Prisma["Prisma ORM v6 Client"]
        Supabase[("PostgreSQL Database (Supabase)")]
        UploadThing["UploadThing (File & Asset CDN)"]
        Resend["Resend / SMTP (Transactional Email)"]

        Routers --> Prisma
        Prisma --> Supabase
        Routers -.-> UploadThing
        Routers -.-> Resend
    end

    TC -- "Type-Safe HTTP RPC Calls" --> API
```

---

## 🛠️ Tech Stack

| Category           | Technology                                                                    | Description                                                     |
| :----------------- | :---------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| **Framework**      | [Next.js 16](https://nextjs.org/)                                             | App Router, Server Components, Server Actions, Turbopack        |
| **UI Library**     | [React 19](https://react.dev/)                                                | Latest concurrent primitives, compiler-ready architecture       |
| **Language**       | [TypeScript 5.8](https://www.typescriptlang.org/)                             | Strict mode, end-to-end typed contracts across the entire stack |
| **Styling**        | [Tailwind CSS v4](https://tailwindcss.com/)                                   | Next-generation engine with `@tailwindcss/postcss`              |
| **API Layer**      | [tRPC v11](https://trpc.io/)                                                  | End-to-end typesafe APIs with TanStack React Query v5           |
| **Database ORM**   | [Prisma v6](https://www.prisma.io/)                                           | Declarative schema, migrations, relations, and type generation  |
| **Database**       | [PostgreSQL](https://www.postgresql.org/) / [Supabase](https://supabase.com/) | Relational database with pooled & direct connection support     |
| **Authentication** | [Auth.js v5 (NextAuth)](https://authjs.dev/)                                  | OAuth (Discord, GitHub, Google) + Credentials provider          |
| **Validation**     | [Zod 3.24](https://zod.dev/)                                                  | Runtime contract validation & `@t3-oss/env-nextjs` parsing      |
| **File Storage**   | [UploadThing](https://uploadthing.com/)                                       | Cloud file and avatar upload infrastructure                     |
| **Icons**          | [Lucide React](https://lucide.dev/)                                           | Clean, consistent, and accessible SVG icon library              |
| **Email Service**  | [Resend](https://resend.com/)                                                 | Modern transactional email delivery service                     |

---

## 📂 Project Structure

```plaintext
projectio-web/
├── prisma/
│   ├── schema.prisma           # Multi-tenant Prisma schema & relational models
│   └── seed.ts                 # Database seeder with demo users & projects
├── public/
│   ├── images/                 # Theme-aware brand titles and logo assets
│   └── favicon.ico             # App icons & favicons
├── src/
│   ├── app/                    # Next.js 16 App Router
│   │   ├── (workspace)/        # Authenticated workspace layout & pages
│   │   │   ├── dashboard/      # Projectio overview & velocity telemetry
│   │   │   ├── docs/           # Specifications & confidential documents hub
│   │   │   ├── inbox/          # Notifications & assignment alerts
│   │   │   ├── members/        # Team roster, roles, and invitation modal
│   │   │   ├── projects/       # Projects list & single project detail views
│   │   │   ├── settings/       # Workspace & personal preferences
│   │   │   └── tasks/          # Interactive Kanban board & sprint view
│   │   ├── api/                # API routes (tRPC, Auth, UploadThing)
│   │   ├── login/              # Sign in page (OAuth & Credentials)
│   │   ├── register/           # Account registration & workspace setup
│   │   ├── layout.tsx          # Root HTML layout with providers
│   │   └── page.tsx            # High-conversion public landing page
│   ├── components/             # React components categorized by domain
│   │   ├── auth/               # Authentication forms & login widgets
│   │   ├── dashboard/          # Metric cards, velocity graphs, activity feed
│   │   ├── docs/               # Markdown viewer & editor drawers
│   │   ├── landing/            # Landing page hero, showcase, marquee, Bento
│   │   ├── layout/             # TopNav, Sidebar, responsive mobile drawer
│   │   ├── modals/             # NewTaskModal, NewProjectModal, InviteModal
│   │   ├── tasks/              # Kanban columns, task cards, task drawer
│   │   └── ui/                 # Reusable primitive components (buttons, badges, inputs)
│   ├── contexts/               # ThemeContext, AuthContext, WorkspaceContext
│   ├── env.js                  # T3 runtime environment schema validation
│   ├── hooks/                  # Custom React hooks (parallax, keyboard shortcuts)
│   ├── server/
│   │   ├── api/                # tRPC server configuration & modular routers
│   │   │   ├── routers/        # task, project, workspace, doc, member, etc.
│   │   │   ├── root.ts         # Primary AppRouter combining all domain routers
│   │   │   └── trpc.ts         # Context creation & procedure guards
│   │   ├── auth/               # NextAuth configuration, password hashing, adapter
│   │   └── db.ts               # Global Prisma client singleton instance
│   ├── styles/                 # Global styles & Tailwind CSS v4 definitions
│   └── trpc/                   # React Query client hooks & hydration helpers
├── .env.example                # Template for environment configuration
├── next.config.js              # Next.js configuration
├── package.json                # Project dependencies & npm scripts
├── tsconfig.json               # TypeScript compiler configuration
└── LICENSE                     # MIT Open-Source License
```

---

## 🚀 Getting Started

Follow these instructions to clone, configure, and run Projectio locally.

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v20.14.0` or higher
- **npm**: `v10.0.0` or higher (or `bun` / `pnpm`)
- **PostgreSQL**: A local instance or cloud database (e.g. [Supabase](https://supabase.com/))

### 1. Clone the Repository

```bash
git clone https://github.com/deJames-13/projectio.git
cd projectio/web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Duplicate `.env.example` into a local `.env` file:

```bash
cp .env.example .env
```

Open `.env` and fill in your database connection string and authentication secrets (see the [Environment Variables](#-environment-variables) section below for detailed options).

### 4. Setup Database & Seed Initial Data

Push your Prisma schema to your database and seed initial test records:

```bash
# Push schema changes to the database
npm run db:push

# Seed the database with mock workspace, demo users, projects, and tasks
npx tsx prisma/seed.ts
```

> [!TIP]
> **Default Test Credentials:**
>
> - **Email:** `dej@projectio.app`
> - **Password:** `password123`

### 5. Launch Development Server

Start the Next.js development server with Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore Projectio!

---

## 🔐 Environment Variables

Projectio utilizes `@t3-oss/env-nextjs` with Zod to enforce strict compile-time and runtime validation. The required and optional variables are outlined below:

| Variable                               | Environment |    Required    | Default / Example                                                            | Description                                                               |
| :------------------------------------- | :---------- | :------------: | :--------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| `DATABASE_URL`                         | Server      |    **Yes**     | `postgresql://postgres:...@pooler.supabase.com:6543/postgres?pgbouncer=true` | Pooled connection string for Prisma ORM                                   |
| `DIRECT_URL`                           | Server      |    Optional    | `postgresql://postgres:...@db.supabase.co:5432/postgres`                     | Direct unpooled database connection string (required for migrations)      |
| `AUTH_SECRET`                          | Server      | **Yes** (prod) | `openssl rand -base64 32`                                                    | Secret used to encrypt Auth.js session tokens and cookies                 |
| `AUTH_DISCORD_ID`                      | Server      |    Optional    | _Discord OAuth Client ID_                                                    | OAuth App Client ID for Discord login                                     |
| `AUTH_DISCORD_SECRET`                  | Server      |    Optional    | _Discord OAuth Client Secret_                                                | OAuth App Client Secret for Discord login                                 |
| `AUTH_GITHUB_ID`                       | Server      |    Optional    | _GitHub OAuth Client ID_                                                     | OAuth App Client ID for GitHub login                                      |
| `AUTH_GITHUB_SECRET`                   | Server      |    Optional    | _GitHub OAuth Client Secret_                                                 | OAuth App Client Secret for GitHub login                                  |
| `AUTH_GOOGLE_ID`                       | Server      |    Optional    | _Google OAuth Client ID_                                                     | OAuth App Client ID for Google login                                      |
| `AUTH_GOOGLE_SECRET`                   | Server      |    Optional    | _Google OAuth Client Secret_                                                 | OAuth App Client Secret for Google login                                  |
| `UPLOADTHING_TOKEN`                    | Server      |    Optional    | `sk_live_...`                                                                | API Token from [UploadThing Dashboard](https://uploadthing.com/dashboard) |
| `RESEND_API_KEY`                       | Server      |    Optional    | `re_...`                                                                     | Transactional email API key from [Resend](https://resend.com/)            |
| `EMAIL_FROM`                           | Server      |    Optional    | `Projectio <notifications@projectio.app>`                                    | Sender address for system emails                                          |
| `NEXT_PUBLIC_SUPABASE_URL`             | Client      |    Optional    | `https://your-project.supabase.co`                                           | Public Supabase project API URL                                           |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client      |    Optional    | `eyJhbGciOiJIUzI1NiIsIn...`                                                  | Public Supabase anonymous API key                                         |

> [!NOTE]
> To run production builds or CI checks without setting real third-party credentials, you can pass `SKIP_ENV_VALIDATION=1`.

---

## 💾 Database & Seeding

Projectio uses **Prisma ORM** targeting **PostgreSQL**.

### Schema Management

```bash
# Push schema updates directly to development database
npm run db:push

# Generate a new Prisma migration
npm run db:generate

# Deploy pending migrations to a staging/production database
npm run db:migrate

# Open Prisma Studio GUI in your browser
npm run db:studio
```

### Seeding

The database seeder (`prisma/seed.ts`) automatically populates:

- **Primary Account:** Dej Espinosa (`dej@projectio.app`, role `Product Lead`)
- **Colleagues:** Sarah Jenkins, Elena Rossi, Marcus Johnson, Sarah Chen
- **Starter Workspace:** Multi-tenant workspace pre-configured with members
- **Active Projects:** Cross-functional projects with custom colors & icons
- **Tasks & Sprints:** Pre-populated Kanban cards across all stages with blockers, priorities, and comments
- **Specifications:** Project specs and confidential notes

---

## 📜 Available Scripts

| Command                | Action                                                                 |
| :--------------------- | :--------------------------------------------------------------------- |
| `npm run dev`          | Starts development server with Turbopack (`next dev --turbo`)          |
| `npm run build`        | Builds the production Next.js bundle                                   |
| `npm run start`        | Boots the compiled production application                              |
| `npm run preview`      | Compiles a production build and immediately previews it locally        |
| `npm run check`        | Runs both ESLint and TypeScript checks in one pass                     |
| `npm run typecheck`    | Validates TypeScript types across the entire codebase (`tsc --noEmit`) |
| `npm run lint`         | Analyzes code for syntax and style issues via ESLint                   |
| `npm run lint:fix`     | Automatically corrects fixable linting issues                          |
| `npm run format:check` | Verifies code formatting with Prettier                                 |
| `npm run format:write` | Formats all source files with Prettier & Tailwind CSS plugin           |
| `npm run db:push`      | Synchronizes Prisma schema directly with the connected database        |
| `npm run db:generate`  | Creates and applies Prisma migrations in development                   |
| `npm run db:migrate`   | Applies pending migrations in production                               |
| `npm run db:studio`    | Launches interactive Prisma Studio database viewer                     |

---

## 🗺️ Roadmap

- [x] **Relational Project Management**: Full CRUD for projects with creator ownership, status, progress, icon, and accent color.
- [x] **Project-Task Association (1:N)**: Tasks optionally or directly assigned to projects, assignees, and co-assignees.
- [x] **Project-Document Association (1:N & Confidential Mode)**: Public team documents alongside confidential private notes (`projectId: null`).
- [x] **Team Member Management**: Live user search by username (`@username`), display name, or email with instant invite to projects.
- [x] **Authentication & Isolated Workspaces**: NextAuth with Discord OAuth and credentials provider. Automatic starter workspace provisioning.
- [x] **Modular tRPC API**: Modular routers adhering to Create-T3 architecture (`project`, `task`, `doc`, `member`, `workspace`, etc.).
- [x] **Product Design System**: 4-tier UX/UI hierarchy conforming to WCAG AA, 8pt spacing grid, responsive drawers, and 5-state completeness.
- [x] **Interactive Kanban Board**: Drag-and-drop task movements, blocker tags, and priority labels.
- [x] **Image & Asset Uploads**: Seamless media uploads powered by UploadThing.
- [ ] **Error Monitoring & Diagnostics**: Sentry SDK integration for real-time error telemetry.
- [ ] **Parallel & Intercepting Routes**: Modal routing for frictionless task editing without leaving current context.
- [ ] **Product Analytics**: Privacy-friendly telemetry via PostHog.
- [ ] **API Rate Limiting & Caching**: Upstash Redis rate limiting on public and auth endpoints.

---

## 🤝 Contributing

Contributions are always welcome! Whether reporting a bug, proposing a feature, or submitting a pull request, please follow these guidelines:

1. **Fork the repository** and clone your fork locally.
2. **Create a topic branch** from `main`:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes** using conventional commit messages:
   ```bash
   git commit -m "feat(tasks): add keyboard shortcut for quick task creation"
   ```
4. **Ensure all checks pass**:
   ```bash
   npm run check
   ```
5. **Push to your branch** and open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for full legal text and copyright details.

---

<p align="center">
  Built with ❤️ using the <a href="https://create.t3.gg/">Create T3 Stack</a>.
</p>
