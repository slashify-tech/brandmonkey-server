import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { EmployeeProvider } from "./context/employeeContext.jsx";
import { AuthProvider } from "./context/loginContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_APP_CLIENT_ID}
    >
      <AuthProvider>
        <EmployeeProvider>
          <App />
        </EmployeeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
);
