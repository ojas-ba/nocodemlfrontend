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
  IconButton,
  Divider,
  LinearProgress
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

interface DatasetFormData {
  name: string;
  description: string;
}

interface DatasetFormErrors {
  name?: string;
  description?: string;
  file?: string;
}

interface DatasetFormProps {
  onSuccess: () => void;
}

export const DatasetForm = ({ onSuccess }: DatasetFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<DatasetFormData>({
    name: "",
    description: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [errors, setErrors] = useState<DatasetFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const show = useNotification();
  const auth_obj = useAuth(); // Assuming you have a useAuth hook to get user details

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (errors[name as keyof DatasetFormErrors]) {
      setErrors((prevErrors) => ({ 
        ...prevErrors, 
        [name]: "" 
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      
      if (errors.file) {
        setErrors((prevErrors) => ({ ...prevErrors, file: "" }));
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileName("");
  };

  const validateForm = (): boolean => {
    const validationErrors: DatasetFormErrors = {};

    if (!formData.name) {
      validationErrors.name = "Dataset name is required";
    } else if (formData.name.length < 1 || formData.name.length > 50) {
      validationErrors.name = "Name must be between 1 and 50 characters";
    }

    if (!formData.description) {
      validationErrors.description = "Dataset description is required";
    } else if (formData.description.length < 1 || formData.description.length > 500) {
      validationErrors.description = "Description must be between 1 and 500 characters";
    }

    if (!file) {
      validationErrors.file = "Dataset file is required";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", auth_obj.user?.user_id.toString() || "");

    try {
      const response = await api.post("/projects/upload_file", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data && response.data.file_id) {
        return response.data.file_id;
      } else {
        throw new Error("Failed to get file ID from upload response");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`File upload failed: ${error.message}`);
      } else {
        throw new Error("File upload failed");
      }
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      setUploadProgress(0);
      
      try {
        // First, upload the file
        const fileId = await uploadFile();
        
        if (!fileId) {
          show("Failed to upload file", "error");
          setIsSubmitting(false);
          return;
        }
        
        // Then submit the dataset details with the file ID
        const datasetDetails = {
          ...formData,
          file_id: fileId,
          user_id: auth_obj.user?.user_id,
          project_id: auth_obj.user?.project_id
        };
        const response = await api.post("/projects/add_dataset_details", datasetDetails);
        
        if (response.data && response.data.dataset_id) {
          show("Dataset uploaded successfully!", "success");
          // Reset form
          setFormData({ name: "", description: "" });
          setFile(null);
          setFileName("");
          setUploadProgress(0);
          onSuccess();
          navigate("/dashboard"); 
        } else {
          show(response.data.message || "Failed to add dataset details", "error");
        }
      } catch (error) {
        if (error instanceof Error) {
          show(error.message, "error");
        } else {
          show("An unexpected error occurred", "error");
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      show("Please correct the errors before submitting", "error");
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Upload New Dataset
        </Typography>
        <Box component="form" noValidate sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dataset Name"
                name="name"
                variant="outlined"
                value={formData.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name || "Maximum 50 characters"}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dataset Description"
                name="description"
                variant="outlined"
                value={formData.description}
                onChange={handleInputChange}
                error={!!errors.description}
                helperText={errors.description || "Maximum 500 characters"}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Upload Dataset File
              </Typography>
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
                color={errors.file ? "error" : "primary"}
              >
                Select File
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.json,.parquet,.txt"
                />
              </Button>
              
              {fileName && (
                <Box 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    mt: 1,
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {fileName}
                  </Typography>
                  <IconButton size="small" onClick={clearFile}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              
              {errors.file && (
                <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                  {errors.file}
                </Typography>
              )}
            </Grid>
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {uploadProgress}%
                  </Typography>
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{ mt: 2 }}
                fullWidth
                startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
              >
                {isSubmitting ? "Uploading..." : "Upload Dataset"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};