import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Task } from "@prisma/client";
import { cva } from "class-variance-authority";
import { Edit, GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Badge } from "../ui/badge";
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
import { Textarea } from "../ui/textarea";

const EditTaskFormSchema = z.object({
  content: z.string(),
});

const DeleteTaskAlert: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this task
            and remove its data from our servers.
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

const EditTaskCard: React.FC<{
  onSubmit: (data: z.infer<typeof EditTaskFormSchema>) => void;
  onDelete: () => void;
  currentContent: string;
}> = ({ onSubmit, onDelete, currentContent }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof EditTaskFormSchema>>({
    resolver: zodResolver(EditTaskFormSchema),
    defaultValues: {
      content: currentContent,
    },
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-2 right-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="edit-task-form"
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
            <div className="flex justify-between">
              <DialogClose asChild>
                <Button variant="outline" type="submit" form="edit-task-form">
                  Save Changes
                </Button>
              </DialogClose>
              <DeleteTaskAlert
                onClick={() => {
                  onDelete();
                  setIsDialogOpen(false);
                }}
              />
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export function TaskCard({
  task,
  isOverlay,
}: {
  task: Task;
  isOverlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const utils = api.useUtils();

  const updateTaskContent = api.tasks.updateTaskContent.useMutation({
    onSuccess: () => {
      void utils.tasks.getAllForBoard.invalidate();
    },
    onError: (e) => {
      console.log("Error updating task", e);
      toast.error("Error updating task");
    },
  });

  const deleteTask = api.tasks.delete.useMutation({
    onSuccess: () => {
      void utils.tasks.getAllForBoard.invalidate();
    },
    onError: (e) => {
      console.log("Error deleting task", e);
      toast.error("Error deleting task");
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("group", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
    },
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      <CardHeader className="space-between relative flex flex-row border-b-2 border-secondary px-3 py-3">
        <Button
          variant="ghost"
          {...attributes}
          {...listeners}
          className="text-secondary-foreground/500 -ml-2 h-auto cursor-grab p-1"
        >
          <span className="sr-only">Move task</span>
          <GripVertical />
        </Button>
        <Badge variant={"outline"} className="ml-auto font-semibold">
          Task
        </Badge>
      </CardHeader>
      <CardContent className="whitespace-pre-wrap px-3 pb-6 pt-3 text-left">
        {task.content}
        <EditTaskCard
          currentContent={task.content}
          onSubmit={({ content }) =>
            updateTaskContent.mutate({
              taskId: task.id,
              content,
            })
          }
          onDelete={() => deleteTask.mutate({ taskId: task.id })}
        />
      </CardContent>
    </Card>
  );
}
