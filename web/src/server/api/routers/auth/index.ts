import { createTRPCRouter } from "~/server/api/trpc";
import { registerAuthProcedure } from "./auth.register";

export const authRouter = createTRPCRouter({
  register: registerAuthProcedure,
});

export * from "./auth.service";
