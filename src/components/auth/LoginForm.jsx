import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// set backend base URL (ensure this matches your server)
axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.headers.post["Content-Type"] = "application/json";

const LoginForm = () => {
  const [view, setView] = useState("login"); // "login" | "signup" | "forgot"
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [modal, setModal] = useState({
    title: "",
    message: "",
    type: "success",
  });
  const [redirectPath, setRedirectPath] = useState(null);

  const showModal = (title, message, type = "success") => {
    setModal({ title, message, type });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    // Navigate after closing modal if redirect path is set
    if (redirectPath) {
      navigate(redirectPath);
      setRedirectPath(null);
    }
  };

  // helper to get local today in YYYY-MM-DD for input[max]
  const getTodayDateString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  const maxDOB = getTodayDateString();

  // signup submit
  const handleSignup = async (e) => {
    e.preventDefault();
    const password = e.target["signup-password"].value;
    const confirmPassword = e.target["confirm-password"].value;

    if (password !== confirmPassword) {
      showModal("Error", "Passwords do not match", "error");
      return;
    }

    const dobValue = e.target.DOB.value;
    if (dobValue) {
      const dob = new Date(dobValue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dob > today) {
        showModal("Error", "Date of birth cannot be in the future", "error");
        return;
      }
    }

    const userData = {
      First_name: e.target.FirstName.value,
      Last_name: e.target.LastName.value,
      Email: e.target.email.value,
      Department: e.target.department.value,
      DOB: e.target.DOB.value,
      Password: password,
    };

    try {
      const res = await axios.post("/signup", userData);
      showModal(
        "Account Created",
        res.data.message || "Student account created successfully!"
      );
      // clear form after successful signup
      e.target.reset();
      setView("login");
    } catch (err) {
      // show detailed server message when available
      const serverMsg =
        err.response?.data?.message || err.message || "Signup failed";
      showModal("Error", serverMsg, "error");
    }
  };

  // login submit
  const handleLogin = async (e) => {
    e.preventDefault();
    const loginData = {
      Email: e.target["login-username"].value,
      Password: e.target["login-password"].value,
    };

    try {
      const res = await axios.post("/login", loginData);

      console.log("Login response:", res.data);

      // Store token and user data
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      const role = res.data.user?.role || "student";
      const dashboardPath = `/dashboard/${role}`;

      // Show success message briefly then redirect
      showModal(
        "Login Successful",
        `Welcome back, ${res.data.user.First_name}! Redirecting...`
      );

      // Use window.location instead of navigate
      setTimeout(() => {
        window.location.href = dashboardPath;
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      const serverMsg =
        err.response?.data?.message || err.message || "Invalid credentials";
      showModal("Error", serverMsg, "error");
    }
  };

  // forgot submit
  const handleForgot = async (e) => {
    e.preventDefault();
    const email = e.target["forgot-email"].value;
    try {
      const res = await axios.post("/forgot-password", { Email: email });

      // Check if reset URL is returned (development mode only)
      if (res.data.resetUrl) {
        showModal(
          "⚠️ Development Mode",
          `Email service not configured. Here's your reset link:\n\n${res.data.resetUrl}\n\nThis link expires in 30 minutes.\n\n(In production, this will be sent to your email)`,
          "success"
        );
      } else {
        showModal(
          "✅ Email Sent",
          "Password reset link has been sent to your email. Please check your inbox and spam folder.",
          "success"
        );
        setTimeout(() => setView("login"), 3000);
      }
    } catch (err) {
      const serverMsg =
        err.response?.data?.message || err.message || "Reset failed";
      showModal("Error", serverMsg, "error");
    }
  };

  return (
    <main className="auth-hero flex flex-col justify-center items-center min-h-screen p-4">
      <div className="relative z-20 w-full max-w-md">
        {/* LOGIN VIEW */}
        {view === "login" && (
          <div className="auth-card bg-[var(--secondary-dark)] p-8 rounded-xl shadow-2xl transition-opacity duration-300">
            <h1 className="text-4xl font-extrabold mb-8 text-[var(--accent-color)] text-center">
              Co-Nexus Login
            </h1>

            <form id="login-form" onSubmit={handleLogin}>
              <div className="mb-5 text-left">
                <label
                  htmlFor="login-username"
                  className="block font-semibold mb-1 text-sm text-[var(--text-light)]"
                >
                  Username or Email
                </label>
                <input
                  type="text"
                  id="login-username"
                  name="login-username"
                  required
                  className="input-style w-full p-3 border rounded-lg transition duration-300"
                />
              </div>

              <div className="mb-5 text-left">
                <label
                  htmlFor="login-password"
                  className="block font-semibold mb-1 text-sm text-[var(--text-light)]"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="login-password"
                  name="login-password"
                  required
                  className="input-style w-full p-3 border rounded-lg transition duration-300"
                />
              </div>

              <button
                type="submit"
                className="w-full p-4 border-none rounded-lg bg-[var(--accent-color)] text-[var(--primary-dark)] text-lg font-bold mt-5 cursor-pointer hover:bg-[#008a79] transition duration-200 transform hover:-translate-y-0.5"
              >
                Log In
              </button>
            </form>

            <div className="mt-5 text-sm text-center">
              <button
                type="button"
                onClick={() => setView("forgot")}
                className="text-[var(--accent-color)] hover:text-[var(--text-light)] transition duration-200"
              >
                Forgot Password?
              </button>
              <span className="mx-2">|</span>
              <button
                type="button"
                onClick={() => setView("signup")}
                className="text-[var(--accent-color)] hover:text-[var(--text-light)] transition duration-200"
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* SIGNUP VIEW - STUDENT ONLY */}
        {view === "signup" && (
          <div className="auth-card bg-[var(--secondary-dark)] p-8 rounded-xl shadow-2xl transition-opacity duration-300 max-h-[90vh] overflow-y-auto">
            <h1 className="text-4xl font-extrabold mb-1 text-[var(--accent-color)] text-center">
              Student Registration
            </h1>
            <p className="text-sm mb-6 opacity-70 text-center">
              Create your student account to access events and activities.
            </p>

            <form id="signup-form" onSubmit={handleSignup}>
              <div className="flex flex-col sm:flex-row gap-2 mb-5">
                <div className="flex-1 text-left">
                  <label
                    htmlFor="FirstName"
                    className="block font-semibold mb-1 text-sm text-[var(--text-light)]"
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="FirstName"
                    name="FirstName"
                    required
                    className="input-style w-full p-3 border rounded-lg"
                  />
                </div>
                <div className="flex-1 text-left">
                  <label
                    htmlFor="LastName"
                    className="block font-semibold mb-1 text-sm text-[var(--text-light)]"
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="LastName"
                    name="LastName"
                    required
                    className="input-style w-full p-3 border rounded-lg"
                  />
                </div>
              </div>

              <div className="mb-5 text-left">
                <label
                  htmlFor="email"
                  className="block font-semibold mb-1 text-sm text-[var(--text-light)]"
                >
                  University Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="e.g., student@college.edu"
                  required
                  className="input-style w-full p-3 border rounded-lg"
                />
              </div>

              <div className="mb-5 text-left">
                <label
                  htmlFor="department"
                  className="block font-semibold mb-1 text-sm text-[var(--text-light)]"
                >
                  Department *
                </label>
                <select
                  id="department"
                  name="department"
                  required
                  className="input-style w-full p-3 border rounded-lg select-arrow"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select your department...
                  </option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Engineering">
                    Electrical Engineering
                  </option>
                  <option value="Mechanical Engineering">
                    Mechanical Engineering
                  </option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Information Technology">
                    Information Technology
                  </option>
                  <option value="Electronics & Communication">
                    Electronics & Communication
                  </option>
                  <option value="Business Administration">
                    Business Administration
                  </option>
                  <option value="Humanities">Humanities</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-5 text-left">
                <label
                  htmlFor="DOB"
                  className="block font-semibold mb-1 text-sm text-[var(--text-light)]"
                >
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="DOB"
                  name="DOB"
                  required
                  className="input-style w-full p-3 border rounded-lg"
                  max={maxDOB}
                />
              </div>

              <div className="mb-5 text-left">
                <label
                  htmlFor="signup-password"
                  className="block font-semibold mb-1 text-sm text-[var(--text-light)]"
                >
                  Create Password *
                </label>
                <input
                  type="password"
                  id="signup-password"
                  name="signup-password"
                  required
                  minLength={6}
                  className="input-style w-full p-3 border rounded-lg"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Minimum 6 characters
                </p>
              </div>

              <div className="mb-5 text-left">
                <label
                  htmlFor="confirm-password"
                  className="block font-semibold mb-1 text-sm text-[var(--text-light)]"
                >
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirm-password"
                  required
                  minLength={6}
                  className="input-style w-full p-3 border rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full p-4 border-none rounded-lg bg-[var(--accent-color)] text-[var(--primary-dark)] text-lg font-bold mt-5 cursor-pointer hover:bg-[#008a79] transition duration-200 transform hover:-translate-y-0.5"
              >
                Create Student Account
              </button>
            </form>

            <div className="mt-5 text-sm text-center">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setView("login")}
                className="text-[var(--accent-color)] hover:text-[var(--text-light)] transition duration-200"
              >
                Log In Here
              </button>
            </div>

            <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-300 text-center">
                <strong>Note:</strong> Faculty and HOD accounts are managed by
                department heads. Contact your HOD for faculty registration.
              </p>
            </div>
          </div>
        )}

        {/* FORGOT VIEW */}
        {view === "forgot" && (
          <div className="auth-card bg-[var(--secondary-dark)] p-8 rounded-xl shadow-2xl transition-opacity duration-300">
            <h1 className="text-3xl font-extrabold mb-1 text-[var(--accent-color)] text-center">
              Forgot Your Password?
            </h1>
            <p className="text-sm opacity-70 mb-8 text-center">
              Enter your registered email address below, and we'll send you
              instructions to reset your password.
            </p>

            <form id="forgot-form" onSubmit={handleForgot}>
              <div className="mb-5 text-left">
                <label
                  htmlFor="forgot-email"
                  className="block font-semibold mb-1 text-sm text-[var(--text-light)]"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="forgot-email"
                  name="forgot-email"
                  required
                  className="input-style w-full p-3 border rounded-lg transition duration-300"
                />
              </div>

              <button
                type="submit"
                className="w-full p-4 border-none rounded-lg bg-[var(--accent-color)] text-[var(--primary-dark)] text-lg font-bold mt-5 cursor-pointer hover:bg-[#008a79] transition duration-200 transform hover:-translate-y-0.5"
              >
                Send Reset Link
              </button>
            </form>

            <div className="mt-5 text-sm text-center">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => setView("login")}
                className="text-[var(--accent-color)] hover:text-[var(--text-light)] transition duration-200"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
          <div className="bg-[var(--secondary-dark)] p-6 rounded-xl shadow-2xl max-w-lg w-full">
            <h3
              className="text-xl font-bold mb-3"
              style={{
                color:
                  modal.type === "success" ? "var(--accent-color)" : "#FF6B6B",
              }}
            >
              {modal.title}
            </h3>
            <p className="text-sm mb-5 whitespace-pre-line break-all">
              {modal.message}
            </p>

            {/* If there's a reset URL in the message, add a copy button */}
            {modal.message.includes("http://localhost:3000/reset-password") && (
              <button
                onClick={() => {
                  const url = modal.message.match(
                    /(http:\/\/localhost:3000\/reset-password\?token=[^\s\n]+)/
                  )?.[1];
                  if (url) {
                    navigator.clipboard.writeText(url);
                    alert("Reset link copied to clipboard!");
                  }
                }}
                className="w-full py-2 mb-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                📋 Copy Reset Link
              </button>
            )}

            <button
              onClick={closeModal}
              className="w-full py-3 rounded-lg bg-[var(--accent-color)] text-[var(--primary-dark)] font-semibold hover:bg-[#008a79] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default LoginForm;
