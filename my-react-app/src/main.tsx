import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import LoginPage from "./login";
import SignupPage from "./SignupPage";
import ForgotPasswordPage from "./ForgotPasswordPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/s" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      </Routes>
    </BrowserRouter>
  </StrictMode>
);