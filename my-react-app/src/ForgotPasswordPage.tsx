import React, { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setMessage(data.message || "If that email is registered, a reset link has been sent.");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Reset your password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email and we'll send you a link to reset it.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-4" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-green-600 mb-4" role="status">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Remembered it?{" "}
          <Link to="/" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
