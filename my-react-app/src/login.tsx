import React, { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { firebaseAuth, googleProvider } from "./firebase";

interface LoginFormState {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: { id: number; email: string };
}

interface LoginPageProps {
  onLogin?: (data: AuthResponse) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function LoginPage({ onLogin }: LoginPageProps = {}) {
  const [form, setForm] = useState<LoginFormState>({ email: "", password: "" });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  const handleChange = (field: keyof LoginFormState) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = (): string => {
    if (!form.email.includes("@")) return "Enter a valid email address.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      const loginData = data as AuthResponse;
      localStorage.setItem("token", loginData.token);
      onLogin?.(loginData);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Google sign-in failed. Please try again.");
        return;
      }

      const loginData = data as AuthResponse;
      localStorage.setItem("token", loginData.token);
      onLogin?.(loginData);
    } catch {
      setError("Google sign-in was cancelled or failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Sign in</h1>
        <p className="text-sm text-gray-500 mb-6">Welcome back, enter your details.</p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.87 2.69-6.62z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.96 10.71A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3-2.33z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"/>
          </svg>
          {googleLoading ? "Signing in..." : "Continue with Google"}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400">or</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="name@company.com"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              placeholder="Enter your password"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between mb-6 mt-2">
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
              Forgot password?
            </Link>
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-4" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/s" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}