/**
 * Integration tests for the `task` router.
 */
import type { inferProcedureInput } from "@trpc/server";
import { AppRouter, createCaller } from "../root";
import { createInnerTRPCContext, createTRPCContext } from "../trpc";
import { expect, test } from "vitest";

test("create and get task", async () => {
  const ctx = await createInnerTRPCContext({
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

  const column = await caller.columns.create({
    name: "Test Column",
    boardId: board.id,
  });

  const input: inferProcedureInput<AppRouter["tasks"]["create"]> = {
    content: "Test Task",
    columnId: column.id,
    boardId: board.id,
  };

  const create = await caller.tasks.create(input);
  const byId = await caller.tasks.getById({ id: create.id });

  expect(byId).toMatchObject(input);
});

test("create and delete task", async () => {
  const ctx = await createInnerTRPCContext({
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

  const column = await caller.columns.create({
    name: "Test Column",
    boardId: board.id,
  });

  const input: inferProcedureInput<AppRouter["tasks"]["create"]> = {
    content: "Test Task",
    columnId: column.id,
    boardId: board.id,
  };

  const create = await caller.tasks.create(input);

  const deleteInput: inferProcedureInput<AppRouter["tasks"]["delete"]> = {
    taskId: create.id,
  };

  const deleted = await caller.tasks.delete(deleteInput);
  expect(deleted).toMatchObject(create);
});

test("update task content", async () => {
  const ctx = await createInnerTRPCContext({
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

  const column = await caller.columns.create({
    name: "Test Column",
    boardId: board.id,
  });

  const input: inferProcedureInput<AppRouter["tasks"]["create"]> = {
    content: "Test Task",
    columnId: column.id,
    boardId: board.id,
  };

  const create = await caller.tasks.create(input);

  const updateInput: inferProcedureInput<
    AppRouter["tasks"]["updateTaskContent"]
  > = {
    taskId: create.id,
    content: "Updated Task",
  };

  const updated = await caller.tasks.updateTaskContent(updateInput);
  expect(updated).toHaveProperty("content", "Updated Task");
});

test("update tasks position on board", async () => {
  const ctx = await createInnerTRPCContext({
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
  const board2 = await caller.projects.create({
    name: "Test Project2",
    description: "Test Description2",
    status: "In Progress",
  });

  const column = await caller.columns.create({
    name: "Test Column",
    boardId: board.id,
  });

  const input: inferProcedureInput<AppRouter["tasks"]["create"]> = {
    content: "Test Task",
    columnId: column.id,
    boardId: board.id,
  };

  const create = await caller.tasks.create(input);

  const updateInput: inferProcedureInput<
    AppRouter["tasks"]["updateTasksPositionOnBoard"]
  > = {
    boardId: board.id,
    tasks: [
      {
        id: create.id,
        content: "Updated Task",
        boardId: board2.id,
        columnId: column.id,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      },
    ],
  };

  const updated = await caller.tasks.updateTasksPositionOnBoard(updateInput);
  expect(updated).toHaveProperty("count", 1);
});
