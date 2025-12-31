import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import axios from "axios";
import API_URL from "../../config/api";

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    First_name: "",
    Last_name: "",
    Email: "",
    Password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Sign up logic
      await axios.post(`${API_URL}/api/users/create`, {
        First_name: formData.First_name,
        Last_name: formData.Last_name,
        Email: formData.Email,
        Password: formData.Password,
        role: "student", // ensure student role for signup
      });

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-md w-full bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-slate-700/50">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Create Account
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-xl">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-900/30 border border-green-500/50 rounded-xl">
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              First Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={formData.First_name}
                onChange={(e) =>
                  setFormData({ ...formData, First_name: e.target.value })
                }
                required
                placeholder="John"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Last Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={formData.Last_name}
                onChange={(e) =>
                  setFormData({ ...formData, Last_name: e.target.value })
                }
                required
                placeholder="Doe"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                value={formData.Email}
                onChange={(e) =>
                  setFormData({ ...formData, Email: e.target.value })
                }
                required
                placeholder="john.doe@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                value={formData.Password}
                onChange={(e) =>
                  setFormData({ ...formData, Password: e.target.value })
                }
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiArrowRight className="text-lg" />
            )}
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-slate-400 text-sm">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-indigo-400 hover:underline"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
