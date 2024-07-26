/**
 * Integration tests for the `project` router.
 */
import type { inferProcedureInput } from "@trpc/server";
import { expect, test } from "vitest";
import { createCaller, type AppRouter } from "../root";
import { createInnerTRPCContext } from "../trpc";

test("create and get project", async () => {
  const ctx = createInnerTRPCContext({
    session: {
      user: { id: "clz2c3vxg000013e6rab2cnaw", name: "Test User" },
      expires: "1",
    },
  });

  const caller = createCaller(ctx);

  const input: inferProcedureInput<AppRouter["projects"]["create"]> = {
    name: "Test Project",
    description: "Test Description",
    status: "In Progress",
  };

  const create = await caller.projects.create(input);
  const byId = await caller.projects.getById({ id: create.id });

  expect(byId).toMatchObject(create);
});

test("create and delete project", async () => {
  const ctx = createInnerTRPCContext({
    session: {
      user: { id: "clz2c3vxg000013e6rab2cnaw", name: "Test User" },
      expires: "1",
    },
  });
  const caller = createCaller(ctx);

  const input: inferProcedureInput<AppRouter["projects"]["create"]> = {
    name: "Test Project",
    description: "Test Description",
    status: "In Progress",
  };

  const create = await caller.projects.create(input);

  const deleteInput: inferProcedureInput<AppRouter["projects"]["delete"]> = {
    id: create.id,
  };

  const deleted = await caller.projects.delete(deleteInput);
  expect(deleted).toMatchObject(create);
});
