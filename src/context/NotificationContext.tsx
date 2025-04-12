import { Snackbar, Alert, AlertColor } from "@mui/material";
import { createContext, useContext, useState, ReactNode } from "react";

// Define the type for the notification function
type NotificationFunction = (msg: string, severity?: AlertColor, duration?: number) => void;

// Create context with correct type
const NotificationContext = createContext<NotificationFunction | undefined>(undefined);

// Define props type for provider
interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<AlertColor>("success");

  const showNotification: NotificationFunction = (msg, severity = "success", duration = 3000) => {
    setMessage(msg);
    setType(severity);
    setOpen(true);

    setTimeout(() => setOpen(false), duration);
  };

  return (
    <NotificationContext.Provider value={showNotification}>
      {children}
      <Snackbar open={open} autoHideDuration={3000} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity={type} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

// Custom hook to use notification
export function useNotification(): NotificationFunction {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
