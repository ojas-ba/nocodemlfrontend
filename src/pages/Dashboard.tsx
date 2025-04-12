import { Typography, Box, Button, Dialog } from "@mui/material";
import { useAuth } from "../context/useAuth";
import { useState } from "react";
import CreateProject from "../components/Projects/CreateProject";
import ViewAllProject from "../components/Projects/ViewAllProject";
import { api } from "../utils/api";
import { useNotification } from "../context/NotificationContext";

interface deleteprops {
  project_id: number;
  user_id: number;
}

export default function Dashboard() {
  const auth_obj = useAuth();
  const user = auth_obj.user;
  const [showForm, setShowForm] = useState(false);
  const [refreshProjects, setRefreshProjects] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const show = useNotification();

  const handleNewProject = () => {
    if (user && user.project_id) {
      user.project_id = undefined; // Reset the project_id to create a new project
    }
    setShowForm(true);
  }

  const handleCloseForm = () => {
    setShowForm(false);
    setRefreshProjects((prev) => prev + 1);
  };

  const handleDeleteProject = async (deleteProps: deleteprops) => {
    try {
      const response = await api.post(`/projects/delete_project?project_id=${deleteProps.project_id}&user_id=${deleteProps.user_id}`);
      console.log(response);
      if (response.data && response.data.code === 1) {
        show("Project deleted successfully", "success");
        setRefreshProjects((prev) => prev + 1);
      }
    } catch (err) {
      show(err instanceof Error ? err.message : String(err), "error");
    }
  };

  const handleSelectProjectForDelete = (project: { id: number }) => {
    if (auth_obj.user?.user_id) {
      handleDeleteProject({ project_id: project.id, user_id: auth_obj.user.user_id });
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #0F172A, #1E293B)",
          color: "white",
          paddingBottom: "5%",
          display: "flow-root"
        }}
      >
        <Box sx={{ mt: 12, ml: 3, mb: 3 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: "#60A5FA",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.6)",
            }}
          >
            Welcome to the Dashboard, {user?.email}!
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "1rem",
            }}
          >
            Here you can manage your Projects.
          </Typography>
        </Box>

        <Box
          sx={{
            mt: 2,
            ml: 3,
            mr: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(30, 41, 59, 0.7)",
            backdropFilter: "blur(20px)",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            border: "1px solid rgba(96, 165, 250, 0.2)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "#60A5FA",
            }}
          >
            Your Projects
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              sx={{
                background: "linear-gradient(45deg, #60A5FA 30%, #93C5FD 90%)",
                color: "white",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  background: "linear-gradient(45deg, #93C5FD 30%, #60A5FA 90%)",
                },
              }}
              onClick={() => handleNewProject()}
            >
              New Project
            </Button>
            <Button
              variant="contained"
              sx={{
                background: "linear-gradient(45deg, #EF4444 30%, #F87171 90%)",
                color: "white",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  background: "linear-gradient(45deg, #F87171 30%, #EF4444 90%)",
                },
              }}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Project
            </Button>
          </Box>
        </Box>

        <ViewAllProject key={refreshProjects} />

        <Dialog open={showForm} onClose={() => setShowForm(false)}>
          <Box
            sx={{
              padding: 4,
              background: "linear-gradient(to bottom, #1E293B, #0F172A)",
              color: "white",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            }}
          >
            <CreateProject onClose={handleCloseForm} />
          </Box>
        </Dialog>

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <Box
            sx={{
              padding: 4,
              minWidth: 800,
              minHeight: 800,
              background: "linear-gradient(to bottom, #1E293B, #0F172A)",
              color: "white",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: "#60A5FA",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.6)",
              }}
            >
              Select a project to delete
            </Typography>
            <ViewAllProject onProjectClick={handleSelectProjectForDelete} />
          </Box>
        </Dialog>
      </Box>
    </>
  );
}

