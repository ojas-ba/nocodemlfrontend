import axios from "axios";
import { Card, CardContent, Stack, Typography, TextField, Button, Grid } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import machineLearningVideo from "../assets/Machine Learning.mp4";
import { useNotification } from "../context/NotificationContext";
import { api } from "../utils/api";

//Create a videocomponent that prevents re-rendering it,We can do it my memo in react 
// Meaning it will make the website slow asf while typing in the input field
const VideoComponent = React.memo(() => {
  console.log("Video Rendering")
  return (
    <video autoPlay loop muted style={{ width: "100%", height: "100%", objectFit: "cover" }}>
      <source src={machineLearningVideo} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
});

  // Keep the video part untouched, Keep this thing outside to not break the memoisation chain.
  // Otherwise video gets re-rendered everytme
const CardCover = styled("div")({
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  });

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  secretKey: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  secretKey?: string;
}

export const Register = () => {
  const navigate = useNavigate();
  const show = useNotification();
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    secretKey: ""
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeStep, setActiveStep] = useState<number>(0); // 0: Name, 1: Email, 2: Passwords, 3: Secret Key
  
  const handleInputChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = e.target.value;
    
    // For secret key, only allow digits and limit to 4 characters
    if (field === 'secretKey') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setFormData((prevData) => ({
      ...prevData,
      [field]: value
    }));
  
    if (errors[field]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: ""
      }));
    }
  };
  
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validate only the fields of the current step
  const validateStep = (): boolean => {
    const stepErrors: FormErrors = {};
  
    if (activeStep === 0) {
      if (!formData.firstName) {
        stepErrors.firstName = "First name is required";
      }
      if (!formData.lastName) {
        stepErrors.lastName = "Last name is required";
      }
    } else if (activeStep === 1) {
      if (!formData.email) {
        stepErrors.email = "Email is required";
      } else if (!validateEmail(formData.email)) {
        stepErrors.email = "Invalid email format";
      }
    } else if (activeStep === 2) {
      if (!formData.password) {
        stepErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        stepErrors.password = "Password should be at least 8 characters long";
      }
      if (!formData.confirmPassword) {
        stepErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        stepErrors.confirmPassword = "Passwords do not match";
      }
    } else if (activeStep === 3) {
      if (!formData.secretKey) {
        stepErrors.secretKey = "Secret key is required";
      } else if (formData.secretKey.length !== 4) {
        stepErrors.secretKey = "Secret key must be exactly 4 digits";
      }
    }
  
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };
  
  const handleRegister = async () => {
    if (validateStep()) {
      // Add registration logic here
      
      try{
       await api.post("/auth/register",{
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          secretKey: Number(formData.secretKey)
        },{
          headers: {
            "Content-Type": "application/json",
          },
        });
        show("Registration successful", "success");
        navigate('/login');
      }
      catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Registration failed:", error.response?.data);
          setErrors(error.response?.data || {});
        } else {
          console.error("Unexpected error:", error);
        }
      }
    }
  };

  
  
  return (
    <Grid container sx={{ height: "100vh" }}>
      <Grid item xs={12} md={7} sx={{ display: "flex", alignItems: "center" }}>
        <Card sx={{ width: "100%", height: "100%", boxShadow: "none", borderRadius: 0 }}>
          <CardCover>
              <VideoComponent/>
          </CardCover>
        </Card>
      </Grid>
  
      <Grid item xs={12} md={5} display="flex" alignItems="center" justifyContent="center">
        <Card sx={{ width: "80%", maxWidth: 400, padding: 4, boxShadow: 3}}>
          <CardContent>
            <Typography variant="h4" component="h2" sx={{ textAlign: "center", marginBottom: 3 }}>
              Create Account
            </Typography>
            <Stack spacing={2}>
              {activeStep === 0 && (
                <>
                  <TextField
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    value={formData.firstName}
                    onChange={handleInputChange("firstName")}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  />
                  <TextField
                    label="Last Name"
                    variant="outlined"
                    fullWidth
                    value={formData.lastName}
                    onChange={handleInputChange("lastName")}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                  />
                </>
              )}
  
              {activeStep === 1 && (
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              )}
  
              {activeStep === 2 && (
                <>
                  <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    error={!!errors.password}
                    helperText={errors.password}
                  />
                  <TextField
                    label="Confirm Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                  />
                </>
              )}
  
              {activeStep === 3 && (
                <TextField
                  label="Secret Key (4 digits)"
                  variant="outlined"
                  fullWidth
                  value={formData.secretKey}
                  onChange={handleInputChange("secretKey")}
                  error={!!errors.secretKey}
                  helperText={errors.secretKey}
                  inputProps={{
                    maxLength: 4,
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                />
              )}
            </Stack>
  
            <Stack direction="row" justifyContent="space-between" sx={{ marginTop: 3 }}>
              {activeStep > 0 && (
                <Button variant="outlined" onClick={handleBack}>
                  Back
                </Button>
              )}
              {activeStep < 3 && (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              )}
              {activeStep === 3 && (
                <Button variant="contained" onClick={handleRegister}>
                  Register
                </Button>
              )}
            </Stack>
  
            <Typography variant="body2" sx={{ textAlign: "center", marginTop: 2 }}>
              Already have an account?{" "}
              <RouterLink to="/login" style={{ textDecoration: "none", color: "primary" }}>
                Login here
              </RouterLink>
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
  
export default Register;
