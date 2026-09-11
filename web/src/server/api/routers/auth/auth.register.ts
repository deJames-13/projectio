import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";
import { authService } from "./auth.service";

export const registerAuthProcedure = publicProcedure
  .input(
    z.object({
      name: z.string().min(1, "Name is required"),
      username: z.string().optional(),
      email: z.string().email("Valid email is required"),
      password: z.string().min(6, "Password must be at least 6 characters"),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return authService.register(ctx.db, input);
  });
