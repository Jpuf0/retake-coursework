import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Column, type Task } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "~/utils/api";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { BoardColumn } from "./Column";
import { TaskCard } from "./TaskCard";
import { hasDraggableData } from "./utils";

const addColumnFormSchema = z.object({
  name: z.string(),
});

const AddColumnCard: React.FC<{
  onSubmit: (data: z.infer<typeof addColumnFormSchema>) => void;
}> = ({ onSubmit }) => {
  const form = useForm<z.infer<typeof addColumnFormSchema>>({
    resolver: zodResolver(addColumnFormSchema),
    defaultValues: {
      name: "",
    },
    resetOptions: {
      keepValues: false,
      keepDirty: false,
      keepIsSubmitted: false,
      keepTouched: false,
    },
  });

  useEffect(() => {
    if (form.formState.isSubmitted) {
      form.reset();
    }
  }, [form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Column</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            id="add-column-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        placeholder="Name"
                        {...field}
                        className="w-full resize-none"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <Button className="mt-4 w-full" type="submit" form="add-column-form">
          Add Column
        </Button>
      </CardContent>
    </Card>
  );
};

const KanbanBoardTest = ({
  boardId,
  className,
}: {
  boardId: string;
  className?: string;
}) => {
  const { data: initialColumns, refetch: refetchColumns } =
    api.columns.getAllColumnsForBoard.useQuery({ projectId: boardId });
  const { data: initialTasks, refetch: refetchTasks } =
    api.tasks.getAllForBoard.useQuery({ projectId: boardId });

  const updateTasks = api.tasks.updateTasksPositionOnBoard.useMutation({
    onSuccess: () => {
      toast.info("Refreshing tasks...");
      void refetchTasks();
    },
    onError: (e) => {
      console.log("Error updating tasks", e);
      toast.error("Error updating tasks", {
        description: e.message,
      });
    },
  });

  const createColumn = api.columns.create.useMutation({
    onSuccess: () => {
      void refetchColumns();
      toast.success("Column created successfully");
    },
    onError: (e) => {
      console.log("Error creating column", e);
      toast.error("Error creating column");
    },
  });

  const [tasks, setTasks] = useState(initialTasks);
  const [columns, setColumns] = useState(initialColumns);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    if (initialTasks) {
      setTasks(initialTasks);
    }
    if (initialColumns) {
      setColumns(initialColumns);
    }
  }, [initialTasks, initialColumns]);

  const columnItems = useMemo(() => columns?.map((c) => c.id), [columns]);
  if (tasks === undefined || columns === undefined || columnItems === undefined)
    return <div className="text-white">Loading...</div>;

  return (
    <div className={className}>
      <DndContext
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <ScrollArea className="flex snap-x snap-mandatory px-2 pb-4">
          <div className="flex flex-row items-center justify-center gap-4">
            <SortableContext items={columnItems ?? []}>
              {columns?.map((column) => (
                <BoardColumn
                  key={column.id}
                  tasks={tasks.filter((task) => task.columnId === column.id)}
                  column={column}
                />
              ))}
            </SortableContext>
            <AddColumnCard
              onSubmit={({ name }) => createColumn.mutate({ name, boardId })}
            />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <DragOverlay>
          {activeColumn && (
            <BoardColumn
              isOverlay
              column={activeColumn}
              tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
            />
          )}
          {activeTask && <TaskCard task={activeTask} isOverlay />}
        </DragOverlay>
        ,
      </DndContext>
    </div>
  );

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;

    if (data?.type === "Column") {
      setActiveColumn(data.column);
      return;
    }

    if (data?.type === "Task") {
      setActiveTask(data.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    if (initialTasks !== tasks) {
      if (!tasks) {
        toast.error("Error updating tasks", {
          description: "No tasks found",
        });
      } else {
        void updateTasks.mutateAsync({
          boardId: boardId,
          tasks: tasks,
        });
      }
    }

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveATask = activeData?.type === "Task";
    const isOverATask = overData?.type === "Task";
    const isOverAColumn = overData?.type === "Column";

    if (!isActiveATask) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        if (!tasks) return;
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);
        const activeTask = tasks[activeIndex];
        const overTask = tasks[overIndex];

        if (
          activeTask &&
          overTask &&
          activeTask.columnId !== overTask.columnId
        ) {
          activeTask.columnId = overTask.columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        if (!tasks) return;
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const activeTask = tasks[activeIndex];
        if (activeTask) {
          activeTask.columnId = overId.toString();
          return arrayMove(tasks, activeIndex, activeIndex);
        }
        return tasks;
      });
    }
  }
};

export default KanbanBoardTest;
