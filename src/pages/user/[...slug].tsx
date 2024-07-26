import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import CreateProjectCard from "~/components/projects/createProjectCard";
import { Trash2 } from "lucide-react";
import { api } from "~/utils/api";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
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
} from "~/components/ui/alert-dialog";
import { toast } from "sonner";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ScrollArea } from "~/components/ui/scroll-area";

const MINIMUM_LOADING_TIME = 500;

const DeleteProjectAlert: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="icon"
          className="absolute bottom-2 right-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            project and remove its data from our servers.
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

export default function Projects() {
  const { data: session } = useSession();
  const utils = api.useUtils();
  const {
    data: projects,
    isLoading: tRPCLoading,
    error,
  } = api.projects.getAll.useQuery();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const deleteProject = api.projects.delete.useMutation({
    onSuccess: () => {
      void utils.projects.getAll.invalidate();
      toast.success("Project deleted successfully");
    },
    onError: (e) => {
      console.log("Error deleting project", e);
      toast.error("Error deleting project");
    },
  });

  const handleDeleteProject = (projectId: string) => {
    deleteProject.mutate({
      id: projectId,
    });
  };

  useEffect(() => {
    if (session === null) {
      void signIn();
    }
    if (!tRPCLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, MINIMUM_LOADING_TIME);

      return () => clearTimeout(timer);
    }
  }, [tRPCLoading, session]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container mx-auto p-4">
          <h1 className="mb-4 text-2xl font-bold text-white sm:text-[3rem]">
            Project List
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...(Array(6) as undefined[])].map((_, index) => (
              <Card key={index} className="animate-pulse shadow-md">
                <CardHeader>
                  <div className="h-6 w-3/4 rounded bg-gray-200"></div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
                  <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container mx-auto p-4">
          <div className="text-2xl font-bold text-red-500">
            Error loading projects: {error.message}
          </div>
          ;
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-full flex-grow flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold text-white sm:text-[3rem]">
          Project List
        </h1>
        <ScrollArea className="h-[800px] w-[1400px] flex-grow">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => (
              <Card
                key={project.id}
                className="group relative cursor-pointer shadow-md transition-shadow duration-300 hover:shadow-lg"
                onClick={() => router.push(`/b/${project.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {project.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-gray-600">{project.description}</p>
                  <p className="text-sm font-medium">
                    Status:{" "}
                    <span
                      className={`${project.status === "Completed" ? "text-green-500" : "text-blue-500"}`}
                    >
                      {project.status}
                    </span>
                  </p>
                </CardContent>
                <DeleteProjectAlert
                  onClick={() => handleDeleteProject(project.id)}
                />
              </Card>
            ))}
            <CreateProjectCard />
          </div>
        </ScrollArea>
      </div>
    </main>
  );
}
