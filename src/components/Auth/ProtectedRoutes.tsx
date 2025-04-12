import { useState, useEffect } from "react";
import { JSX } from "react";
import { useAuth } from "../../context/useAuth";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  const [shouldNavigate, setShouldNavigate] = useState(false);

  useEffect(() => {
    if (!user) {
      const timeout = setTimeout(() => {
        setShouldNavigate(true);
      }, 500);

      return () => clearTimeout(timeout); // Cleanup in case the component unmounts
    }
  }, [user]);

  if (shouldNavigate) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
