import axios from "axios";
import { Card, CardContent, Stack, Typography, TextField, Button, Grid, Link } from "@mui/material";
import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import machineLearningVideo from "../assets/Machine Learning.mp4";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";


// Using Memo to prevent re-rendering of video, Improves performance and makes sure 0 lag is there. 
const VideoComponent = React.memo(() => {
  console.log("Video Rendering");
  return (
    <video autoPlay loop muted style={{ width: "100%", height: "100%", objectFit: "cover" }}>
      <source src={machineLearningVideo} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
});

// Keep the video part untouched, Keep this thing outside to not break the memoisation chain.
// Otherwise video gets re-rendered everytime
const CardCover = styled("div")({
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden",
});

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors { // This is to check if username,password is correct or wrong. We will validate the form with this.
  email?: string;
  password?: string;
}
// the error fields will be displayed below the input box, So we need to clear error when the email/password are being re-entered.

export const Login = () => {
  const [formdata, setformdata] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const { login } = useAuth();
  const navigate = useNavigate();

  //'prevData' because it indicates we are working with the previous state. 
  const HandleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setformdata((prevdata) => ({
      ...prevdata,
      email: e.target.value,
    }));
    
    if (errors.email) {
      setErrors((preverrors) => ({ ...preverrors, email: "" })); // So when user starts typing we should clear the error field.
    }
  };

  const HandlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setformdata((prevdata) => ({
      ...prevdata,
      password: e.target.value
    }));

    if (errors.password) {
      setErrors((preverrors) => ({ ...preverrors, password: "" })); // So when user starts typing password we clear the field.
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email); // returns true if the email is valid, false otherwise.
  };

  const validateform = (): boolean => {
    const ValidationErrors: FormErrors = {};

    if (!formdata.email) {
      ValidationErrors.email = "Email is required";
    }
    else if (!validateEmail(formdata.email)) {
      ValidationErrors.email = "Invalid Email";
    }

    if (!formdata.password) {
      ValidationErrors.password = "Password is required";
    } else if (formdata.password.length < 8) {
      ValidationErrors.password = "Password should be at least 8 characters long";
    }

    setErrors(ValidationErrors);
    return Object.keys(ValidationErrors).length === 0; // returns true if no errors. meaning if no errors object will be empty.
  };

  const HandleLogin = async () => {
    if (validateform()) {
      try {
       const success = await login(formdata.email,formdata.password);
       if(success){
        navigate("/dashboard");
       }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Login failed:", error.response?.data);
          setErrors(error.response?.data || {});
        } else {
          console.error("Unexpected error:", error);
        }
      }
    }
  };

  return (
    <Grid container sx={{ height: "100vh" }}>
      {/* Left side - Video (60%) */}
      <Grid item xs={12} md={7} sx={{ display: "flex", alignItems: "center" }}>
        <Card sx={{ width: "100%", height: "100%", boxShadow: "none", borderRadius: 0 }}>
          <CardCover>
            <VideoComponent />
          </CardCover>
        </Card>
      </Grid>

      <Grid item xs={12} md={5} display="flex" alignItems="center" justifyContent="center">
        <Card sx={{ width: "80%", maxWidth: 400, padding: 4, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h4" component="h2" sx={{ textAlign: "center", marginBottom: 3 }}>
              Welcome Back
            </Typography>
            <Stack spacing={2}>
              <TextField label="Email" variant="outlined" fullWidth value={formdata.email} onChange={HandleEmailChange} error={!!errors.email} helperText={errors.email} />
              <TextField label="Password" type="password" variant="outlined" fullWidth value={formdata.password} onChange={HandlePasswordChange} error={!!errors.password} helperText={errors.password} />
              <Button variant="contained" color="primary" fullWidth onClick={HandleLogin}>
                Login
              </Button>
              <Link href="#" sx={{ textAlign: "center", display: "block", marginTop: 1 }}>
                Forgot password?
              </Link>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Login;