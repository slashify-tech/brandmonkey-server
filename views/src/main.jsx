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
      clientId={
        "324735075458-8gabk4frko4oujfhe4itiutghb2ag2p8.apps.googleusercontent.com"
      }
    >
      <AuthProvider>
        <EmployeeProvider>
          <App />
        </EmployeeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
);
