/**
 * Integration tests for the `column` router.
 */
import type { inferProcedureInput } from "@trpc/server";
import { expect, test } from "vitest";
import { createCaller, type AppRouter } from "../root";
import { createInnerTRPCContext } from "../trpc";

test("create and get column", async () => {
  const ctx = createInnerTRPCContext({
    session: {
      user: { id: "clz2c3vxg000013e6rab2cnaw", name: "Test User" },
      expires: "1",
    },
  });
  const caller = createCaller(ctx);

  const board = await caller.projects.create({
    name: "Test Project",
    description: "Test Description",
    status: "In Progress",
  });

  const input: inferProcedureInput<AppRouter["columns"]["create"]> = {
    name: "Test Column",
    boardId: board.id,
  };

  const create = await caller.columns.create(input);
  const byId = await caller.columns.getById({ id: create.id });

  expect(byId).toHaveProperty("id", create.id);
  expect(byId).toHaveProperty("name", "Test Column");
  expect(byId).toHaveProperty("boardId", board.id);
  expect(byId).toHaveProperty("createdAt");
  expect(byId).toHaveProperty("updatedAt");
});
