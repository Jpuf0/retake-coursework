import { Active, DataRef, Over } from "@dnd-kit/core";
import { Column, Task } from "@prisma/client";

type ColumnDragData = {
  type: "Column";
  column: Column;
};

type TaskDragData = {
  type: "Task";
  task: Task;
};

type DraggableData = ColumnDragData | TaskDragData;

export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined,
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === "Column" || data?.type === "Task") {
    return true;
  }

  return false;
}
