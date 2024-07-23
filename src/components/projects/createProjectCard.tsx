import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import { toast } from "sonner";

export default function CreateProjectCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const utils = api.useUtils();

  const createProject = api.projects.create.useMutation({
    onSuccess: () => {
      void utils.projects.getAll.invalidate();
      toast.success(`Project "${projectName}" created successfully`, {
        description: projectDescription,
      });
      handleCloseDialog();
    },
    onError: () => {
      console.log("Error creating project");
    },
  });

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setProjectName("");
    setProjectDescription("");
  };

  const handleCreateProject = () => {
    createProject.mutate({
      name: projectName,
      description: projectDescription,
      status: "In Progress",
    });
  };

  return (
    <>
      <Card
        className="flex cursor-pointer flex-col items-center justify-center shadow-md transition-shadow duration-300 hover:shadow-lg"
        onClick={handleOpenDialog}
      >
        <CardContent className="flex flex-col items-center py-8">
          <Plus size={48} className="mb-2 text-gray-400" />
          <p className="text-lg font-semibold text-gray-500">
            Create New Project
          </p>
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="projectName" className="text-right">
                Name
              </label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="projectDescription" className="text-right">
                Description
              </label>
              <Input
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={createProject.isPending}
            >
              {createProject.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
