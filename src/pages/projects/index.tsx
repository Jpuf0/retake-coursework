import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import CreateProjectCard from "~/components/projects/createProjectCard";
import { Trash2 } from "lucide-react";
import { api } from "~/utils/api";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "~/components/ui/alert-dialog";
import { toast } from "sonner";

const MINIMUM_LOADING_TIME = 500;

const DeleteProjectAlert: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="icon"
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
          <AlertDialogAction
            onClick={onClick}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function Projects() {
  const utils = api.useUtils();

  const { data: projects, isLoading: tRPCLoading, error } = api.projects.getAll.useQuery();

  const deleteProject = api.projects.delete.useMutation({
    onSuccess: () => {
      void utils.projects.getAll.invalidate();
      toast.success("Project deleted successfully");
    },
    onError: (e) => {
      console.log("Error deleting project", e);
      toast.error("Error deleting project");
    }
  })

  const [isLoading, setIsLoading] = useState(true);

  const handleDeleteProject = (projectId: number) => {
    deleteProject.mutate(projectId);
  }

  useEffect(() => {
    if (!tRPCLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, MINIMUM_LOADING_TIME);

      return () => clearTimeout(timer);
    }
  }, [tRPCLoading]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold text-white mb-4 sm:text-[3rem]">
            Project List
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6) as undefined[]].map((_, index) => (
              <Card key={index} className="shadow-md animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error loading projects: {error.message}</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-white mb-4 sm:text-[3rem]">
          Project List
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map((project) => (
            <Card key={project.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 group relative">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">{project.description}</p>
                {/* <p className="text-sm font-medium">
                  Status: <span className={`${project.status === 'Completed' ? 'text-green-500' : 'text-blue-500'}`}>{project.status}</span>
                </p> */}
              </CardContent>
              <DeleteProjectAlert
                onClick={() => handleDeleteProject(project.id)}
              />
            </Card>
          ))}

          <CreateProjectCard />
        </div>
      </div>
    </main>
  );
}