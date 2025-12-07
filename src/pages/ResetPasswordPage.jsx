import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `http://localhost:5000/reset-password/${token}`,
        { password: formData.password }
      );

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-hero flex flex-col justify-center items-center min-h-screen p-4">
      <div className="relative z-20 w-full max-w-md">
        <div className="auth-card bg-[var(--secondary-dark)] p-8 rounded-xl shadow-2xl">
          <h1 className="text-3xl font-extrabold mb-2 text-[var(--accent-color)] text-center">
            Reset Password
          </h1>
          <p className="text-sm opacity-70 mb-8 text-center">
            Enter your new password below
          </p>

          {message && (
            <div className="bg-green-900/50 border border-green-500 text-green-300 px-4 py-3 rounded mb-6">
              {message}
              <p className="text-sm mt-2">Redirecting to login...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5 text-left">
              <label
                htmlFor="password"
                className="block font-semibold mb-1 text-sm text-[var(--text-light)]"
              >
                New Password *
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={6}
                className="input-style w-full p-3 border rounded-lg"
              />
              <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
            </div>

            <div className="mb-5 text-left">
              <label
                htmlFor="confirmPassword"
                className="block font-semibold mb-1 text-sm text-[var(--text-light)]"
              >
                Confirm New Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                minLength={6}
                className="input-style w-full p-3 border rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-4 border-none rounded-lg bg-[var(--accent-color)] text-[var(--primary-dark)] text-lg font-bold mt-5 cursor-pointer hover:bg-[#008a79] transition duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-5 text-sm text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[var(--accent-color)] hover:text-[var(--text-light)] transition duration-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResetPasswordPage;
