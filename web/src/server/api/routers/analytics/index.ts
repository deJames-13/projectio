import { createTRPCRouter } from "~/server/api/trpc";
import { getDashboardKPIsProcedure } from "./analytics.getDashboardKPIs";
import { getSprintBurndownProcedure } from "./analytics.getSprintBurndown";
import { getTaskDistributionProcedure } from "./analytics.getTaskDistribution";

export const analyticsRouter = createTRPCRouter({
  getDashboardKPIs: getDashboardKPIsProcedure,
  getSprintBurndown: getSprintBurndownProcedure,
  getTaskDistribution: getTaskDistributionProcedure,
});

export * from "./analytics.service";
