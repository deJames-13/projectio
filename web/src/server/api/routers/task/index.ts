import { createTRPCRouter } from "~/server/api/trpc";
import { getAllTaskProcedure } from "./task.getAll";
import { getByIdTaskProcedure } from "./task.getById";
import { createTaskProcedure } from "./task.create";
import { updateTaskProcedure } from "./task.update";
import { updateStatusTaskProcedure } from "./task.updateStatus";
import { toggleCompleteTaskProcedure } from "./task.toggleComplete";
import { deleteTaskProcedure } from "./task.delete";

export const taskRouter = createTRPCRouter({
  getAll: getAllTaskProcedure,
  getById: getByIdTaskProcedure,
  create: createTaskProcedure,
  update: updateTaskProcedure,
  updateStatus: updateStatusTaskProcedure,
  toggleComplete: toggleCompleteTaskProcedure,
  delete: deleteTaskProcedure,
});

export * from "./task.service";
