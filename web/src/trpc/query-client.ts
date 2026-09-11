import {
  defaultShouldDehydrateQuery,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import SuperJSON from "superjson";

export const createQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        const isUnauthorized =
          (typeof error === "object" &&
            error !== null &&
            "data" in error &&
            ((error as { data?: { code?: string; httpStatus?: number } }).data?.code === "UNAUTHORIZED" ||
              (error as { data?: { code?: string; httpStatus?: number } }).data?.httpStatus === 401)) ||
          (typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof (error as { message?: string }).message === "string" &&
            (error as { message: string }).message.includes("UNAUTHORIZED"));

        if (isUnauthorized && typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          console.warn("[tRPC] Session unauthorized or expired. Clearing session and redirecting to login.");
          void signOut({ callbackUrl: "/login" });
        }
      },
    }),
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
        retry: (failureCount, error) => {
          const isUnauthorized =
            typeof error === "object" &&
            error !== null &&
            "data" in error &&
            (error as { data?: { code?: string } }).data?.code === "UNAUTHORIZED";
          if (isUnauthorized) return false;
          return failureCount < 2;
        },
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
