# Modular Approach & Separation of Concerns

### File Structure
```text
routers/                          <-- Root routers directory
  |_ <module>/                    <-- Dedicated module folder
    |_ index.ts                   <-- Module router definition & barrel export
    |_ <module>.service.ts        <-- Service layer (Prisma queries, business logic, transactions)
    |_ <module>.<procedure>.ts    <-- Controller route handlers (validation, context piping)
```

### Separation of Concerns:
1. **Route Handlers (`<module>.<function>.ts`)**:
   - Controller-like layer.
   - Defines tRPC procedure (`protectedProcedure` or `publicProcedure`).
   - Declares Zod input validation schemas.
   - Extracts and sanitizes request parameters, session users, and active workspace IDs.
   - Calls the underlying service method and formats the response.

2. **Service Layer (`<module>.service.ts`)**:
   - Pure business logic and database access layer.
   - Receives `db: PrismaClient` along with validated inputs and credentials.
   - Executes database queries, aggregations, relationship connections, and transactions.
   - Enforces domain rules, authorization checks, and activity logging.
   - Throws descriptive `TRPCError` instances when resources are not found or forbidden.

3. **Module Index (`index.ts`)**:
   - Assembles each isolated route handler into a unified tRPC router using `createTRPCRouter`.
   - Exports the module router (e.g. `projectRouter`, `taskRouter`) and re-exports service types.

### Example: `project` Module
- `src/server/api/routers/project/index.ts`
- `src/server/api/routers/project/project.service.ts`
- `src/server/api/routers/project/project.getAll.ts`
- `src/server/api/routers/project/project.getById.ts`
- `src/server/api/routers/project/project.create.ts`
- `src/server/api/routers/project/project.update.ts`
- `src/server/api/routers/project/project.addMember.ts`
- `src/server/api/routers/project/project.removeMember.ts`
- `src/server/api/routers/project/project.delete.ts`




      
