import { useState } from "react";
import { DatasetForm } from "../Forms/DatasetForms";
import { ProjectForms } from "../Forms/ProjectForms";
import { useAuth } from "../../context/useAuth";

export default function CreateProject({ onClose }: { onClose: () => void }) {
  const auth_obj = useAuth();
  const user = auth_obj.user;
  const [projectCreated, setProjectCreated] = useState<boolean>(!!user?.project_id);

  const handleProjectSuccess = (project_id: number) => {
    user!.project_id = project_id; // assign project id to user object
    setProjectCreated(true);
  };

  const handleDatasetSuccess = () => {
    onClose();
    user!.project_id = undefined; // reset project id in user object
  };

  return (
    <>
      {projectCreated ? (
        <DatasetForm onSuccess={handleDatasetSuccess} />
      ) : (
        // Pass onClose to allow project form close if needed.
        <ProjectForms onSuccess={handleProjectSuccess} onClose={onClose} />
      )}
    </>
  );
}
