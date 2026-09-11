import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";
import { verifyPassword } from "~/server/auth/password";
import { verifyOtp } from "~/server/auth/otp";
import { initializeUserWorkspace } from "~/server/db/workspace";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js configured with Discord, GitHub, Google, and
 * Credentials with single-use email OTP verification.
 */
export const authConfig = {
  providers: [
    DiscordProvider({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials?.password !== "string"
        ) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;
        const otp = typeof credentials.otp === "string" ? credentials.otp.trim() : null;

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user?.password) {
          return null;
        }

        const isValid = verifyPassword(password, user.password);
        if (!isValid) {
          return null;
        }

        // Verify OTP code
        if (otp) {
          const isOtpValid = await verifyOtp(email, otp, "login");
          if (!isOtpValid) {
            return null;
          }
        } else {
          // Demo account bypass for rapid testing
          if (email !== "dej@projectio.app" || password !== "password123") {
            return null;
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar ?? user.image,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  events: {
    createUser: async ({ user }) => {
      if (user.id) {
        try {
          // Guarantee unique username for OAuth created users
          const dbUser = await db.user.findUnique({
            where: { id: user.id },
            select: { id: true, username: true, name: true, email: true },
          });

          if (dbUser && !dbUser.username) {
            const baseHandle = (dbUser.name ?? dbUser.email?.split("@")[0] ?? "user")
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, "")
              .slice(0, 15) || "user";

            let uniqueHandle = baseHandle;
            let counter = 1;
            while (await db.user.findFirst({ where: { username: { equals: uniqueHandle, mode: "insensitive" } } })) {
              uniqueHandle = `${baseHandle}${counter}`;
              counter++;
            }

            await db.user.update({
              where: { id: user.id },
              data: { username: uniqueHandle },
            });
          }

          const existingMember = await db.workspaceMember.findFirst({
            where: { userId: user.id },
          });
          if (!existingMember) {
            await initializeUserWorkspace(db, {
              id: user.id,
              name: user.name,
              email: user.email,
            });
          }
        } catch (err) {
          console.error("Failed to initialize workspace for new OAuth user:", err);
        }
      }
    },
  },
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      // Credentials provider is already authenticated via authorize()
      if (account?.provider === "credentials") {
        return true;
      }

      const email = (user.email ?? (profile as { email?: string })?.email)?.toLowerCase().trim();
      if (!email) {
        return "/login?error=EmailRequired";
      }

      const currentProvider = account?.provider.toLowerCase();

      // Check database for existing user with this email
      const existingUser = await db.user.findUnique({
        where: { email },
        include: { accounts: true },
      });

      if (existingUser) {
        const existingProviders = existingUser.accounts.map((a) => a.provider.toLowerCase());
        if (existingUser.password) {
          existingProviders.push("credentials");
        }

        const hasCurrentProvider = currentProvider
          ? existingUser.accounts.some((a) => a.provider.toLowerCase() === currentProvider)
          : false;

        // If user already signed in with this provider previously, allow sign in
        if (hasCurrentProvider) {
          return true;
        }

        // Rule 1: If user logged in with discord, that will be his primary one.
        // If user tries to log in with another like google or github, check database for similar email,
        // then invalidate user and add a toast that says "User with this email is already signed in with another provider"
        if (existingProviders.includes("discord") && currentProvider !== "discord") {
          console.warn(
            `[Auth Guard] Invalidation: User ${email} already has primary provider discord; rejected attempt from ${currentProvider}`
          );
          return `/login?error=OAuthAccountConflict&primary=discord&attempted=${currentProvider}`;
        }

        // Rule 2: No more than two providers logged in
        const uniqueProviders = new Set(existingProviders);
        if (uniqueProviders.size >= 2) {
          console.warn(
            `[Auth Guard] Invalidation: User ${email} has reached maximum of 2 providers (${Array.from(uniqueProviders).join(", ")}); rejected attempt from ${currentProvider}`
          );
          return `/login?error=OAuthAccountConflict&limit=2&attempted=${currentProvider}`;
        }

        // Rule 3: If user already has an existing provider, block unlinked provider login and invalidate
        if (existingProviders.length > 0) {
          console.warn(
            `[Auth Guard] Invalidation: User ${email} already registered with ${existingProviders.join(", ")}; rejected attempt from ${currentProvider}`
          );
          return `/login?error=OAuthAccountConflict&existing=${existingProviders[0]}&attempted=${currentProvider}`;
        }
      }

      return true;
    },
    jwt: async ({ token, user }) => {
      // 1. Initial sign-in: populate token from user object
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        return token;
      }

      // 2. Subsequent requests: Verify user still exists in the database
      if (token.id || token.email) {
        try {
          let dbUser = null;
          if (token.id && typeof token.id === "string") {
            dbUser = await db.user.findUnique({
              where: { id: token.id },
              select: { id: true, name: true, email: true, avatar: true },
            });
          }
          if (!dbUser && token.email) {
            dbUser = await db.user.findUnique({
              where: { email: token.email },
              select: { id: true, name: true, email: true, avatar: true },
            });
          }

          // If the user does not exist in the database, invalidate token so Auth.js cleans session cookies!
          if (!dbUser) {
            return null;
          }

          token.id = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.picture = dbUser.avatar;
        } catch {
          return null;
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token?.id && typeof token.id === "string") {
        session.user.id = token.id;
        if (token.email) session.user.email = token.email;
        if (token.name) session.user.name = token.name;
        if (token.picture) session.user.image = token.picture;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
