import { type Task } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const taskRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.task.findUnique({
        where: {
          id: input.id,
          board: {
            createdById: {
              equals: ctx.session.user.id,
            },
          },
        },
      });
    }),
  getAllForBoard: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.task.findMany({
        where: {
          boardId: {
            equals: input.projectId,
          },
        },
      });
    }),

  updateTasksPositionOnBoard: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        tasks: z.array(z.custom<Task>()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const all_tasks = await Promise.all(
        input.tasks.map(async (task) => {
          await ctx.db.task.update({
            where: {
              id: task.id,
              boardId: input.boardId,
            },
            data: task,
          });
        }),
      );

      return {
        count: all_tasks.length,
      };
    }),

  updateTaskContent: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.update({
        where: {
          id: input.taskId,
        },
        data: {
          content: input.content,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        content: z.string(),
        columnId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.create({
        data: {
          content: input.content,
          boardId: input.boardId,
          columnId: input.columnId,
        },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.delete({
        where: { id: input.taskId },
      });
    }),
});
