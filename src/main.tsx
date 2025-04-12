import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
    </NotificationProvider>

  </StrictMode>,
)
