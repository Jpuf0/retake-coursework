import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Column, type Task } from "@prisma/client";
import { cva } from "class-variance-authority";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "~/utils/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { TaskCard } from "./TaskCard";

const createTaskFormSchema = z.object({
  content: z.string(),
});

const CreateTaskCard: React.FC<{
  onSubmit: (data: z.infer<typeof createTaskFormSchema>) => void;
}> = ({ onSubmit }) => {
  const form = useForm<z.infer<typeof createTaskFormSchema>>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: {
      content: "",
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="m-2 mt-auto bg-primary-foreground">
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="create-task-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <div>
                      <Textarea
                        placeholder="Content"
                        {...field}
                        className="h-60 w-full resize-none"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogClose asChild>
              <Button variant="outline" type="submit" form="create-task-form">
                Create
              </Button>
            </DialogClose>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export function BoardColumn({
  isOverlay,
  tasks,
  column,
}: {
  isOverlay?: boolean;
  tasks: Task[];
  column: Column;
}) {
  const columnTasks = useMemo(() => tasks.map((task) => task.id), [tasks]);
  const utils = api.useUtils();
  const createTask = api.tasks.create.useMutation({
    onSuccess: () => {
      void utils.tasks.getAllForBoard.invalidate();
      toast.success("Task created successfully");
    },
    onError: (e) => {
      console.log("Error creating task", e);
      toast.error("Error creating task");
    },
  });

  const deleteColumn = api.columns.delete.useMutation({
    onSuccess: () => {
      void utils.columns.getAllColumnsForBoard.invalidate();
      toast.success("Column deleted successfully");
    },
    onError: (e) => {
      console.log("Error deleting column", e);
      toast.error("Error deleting column");
    },
  });

  const DeleteColumnAlert: React.FC<{ onClick: () => void }> = ({
    onClick,
  }) => {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              column and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onClick}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  const { setNodeRef, isDragging } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const variants = cva(
    "h-[500px] max-h-[500px] w-[350px] max-w-full bg-primary-foreground flex flex-col flex-shrink-0 snap-center",
    {
      variants: {
        dragging: {
          default: "border-2 border-transparent",
          over: "ring-2 opacity-30",
          overlay: "ring-2 ring-primary",
        },
      },
    },
  );

  return (
    <Card
      ref={setNodeRef}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      <CardHeader className="space-between group flex flex-row items-center border-b-2 p-4 text-left font-semibold">
        <span className="m-auto">{column.name}</span>
        <DeleteColumnAlert
          onClick={() => {
            deleteColumn.mutate({ id: column.id });
          }}
        />
      </CardHeader>
      <ScrollArea>
        <CardContent className="flex flex-grow flex-col gap-2 p-2">
          <SortableContext items={columnTasks ?? []}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </CardContent>
      </ScrollArea>
      <CreateTaskCard
        onSubmit={({ content }) =>
          createTask.mutate({
            boardId: column.boardId,
            columnId: column.id,
            content: content,
          })
        }
      />
    </Card>
  );
}
