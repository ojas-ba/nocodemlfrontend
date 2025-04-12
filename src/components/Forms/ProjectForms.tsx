import { useState } from "react";
import { api } from "../../utils/api";
import { useNotification } from "../../context/NotificationContext";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Grid,
  CircularProgress,
  IconButton
} from "@mui/material";
import { useAuth } from "../../context/useAuth";
import CloseIcon from "@mui/icons-material/Close";

interface ProjectFormData {
  name: string;
  description: string;
  user_id?: number;
}

interface ProjectFormErrors {
  name?: string;
  description?: string;
}

interface ProjectFormProps {
  onSuccess: (id: number) => void;
  onClose?: () => void;
}

export const ProjectForms = ({ onSuccess, onClose }: ProjectFormProps) => {
  const [formdata, setFormdata] = useState<ProjectFormData>({
    name: "",
    description: ""
  });
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const show = useNotification();
  const auth_obj = useAuth();
  const user = auth_obj.user;
  
  // Assign user_id dynamically when user changes
  const user_id = user?.user_id;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormdata((prevdata) => ({
      ...prevdata,
      [name]: value
    }));

    if (errors[name as keyof ProjectFormErrors]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const validationErrors: ProjectFormErrors = {};

    if (!formdata.name.trim()) {
      validationErrors.name = "Project Name is required";
    }

    if (!formdata.description.trim()) {
      validationErrors.description = "Project Description is required";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      show("Please fill all the required fields!", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/projects/create_project", {
        ...formdata,
        user_id
      });

      if (response.data.message === "success") {
        show("Project created successfully!", "success");
        setFormdata({ name: "", description: "" });
        onSuccess(response.data.project_id);
      }
    } catch (error) {
      show(
        error instanceof Error ? error.message : "An unexpected error occurred.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, position: "relative" }}>
        {/* Close Button (if onClose is provided) */}
        {onClose && (
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        )}

        <Typography variant="h5" component="h2" gutterBottom>
          Create New Project
        </Typography>
        <Box component="form" noValidate sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                name="name"
                variant="outlined"
                value={formdata.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name || ""}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Description"
                name="description"
                variant="outlined"
                value={formdata.description}
                onChange={handleInputChange}
                error={!!errors.description}
                helperText={errors.description || ""}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{ mt: 2 }}
                fullWidth
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Create Project"
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};
