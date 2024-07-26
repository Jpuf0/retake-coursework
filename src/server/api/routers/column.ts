import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const columnRouter = createTRPCRouter({
  getAllColumnsForBoard: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.column.findMany({
        where: {
          boardId: {
            equals: input.projectId,
          },
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.column.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        boardId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.column.create({
        data: {
          name: input.name,
          boardId: input.boardId,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.column.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
