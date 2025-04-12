import { createContext, useState, useEffect, ReactNode } from "react";
import { api } from "../utils/api";
import { useNotification } from "./NotificationContext";

// Define the user type
interface User {
  user_id: number;
  project_id?: number;
  preprocess_id?: number;
  email: string;
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Create context
export const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const show = useNotification();

  // Function to fetch the authenticated user
  const fetchUser = async () => {
    try {
      const response = await api.get("/auth/me");
      console.log(response.data);
      setUser({ email: response.data.user, user_id: response.data.user_id });
      show("Logged In","success")
    } catch (error) {
      setUser(null);
      show("Please Login To Continue","info")
    }
  };

  // Function to login
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      if(response.data.message === "success"){
        await fetchUser();
        return true; // Indicate success
      }
      else{
        show("Invaild Credentials","error")
        return false;
      }

    } catch (error) {
      show("Login Failed","error")
      return false; // Indicate failure
    }
  };

  // Function to logout
  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    show("Logged Out","info")
  };

  // Fetch user on mount (checks if user is already logged in)
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user ,login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
