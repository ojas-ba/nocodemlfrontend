import NavBar from "./components/NavBar/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/Auth/ProtectedRoutes";
import Workspace from "./pages/Workspace";


const App = () => (
  <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Route */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/workspace" element={
          <ProtectedRoute>
            <Workspace />
          </ProtectedRoute>
        } />
        
        {/* Fallback Route */}
        <Route path="*" element={<Home />} />
        {/* 404 Not Found */}
        <Route path="/404" element={<div>404 Not Found</div>} />
        {/* Redirect to 404 for any other unmatched routes */}
        <Route path="*" element={<div>404 Not Found</div>} />

      </Routes>
  </BrowserRouter>

);

export default App;
