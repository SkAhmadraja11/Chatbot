import React, { useState } from "react";
import axios from "axios";
import "./auth.css"; // make sure file name matches exactly

const Auth = ({ onAuthSuccess }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [serverMsg, setServerMsg] = useState("");
  const [errors, setErrors] = useState({});

  // ✅ Base backend URL (using port 7070)
  const API_BASE_URL = "http://localhost:7070/api/users";

  // Flip between login/register
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setServerMsg("");
    setErrors({});
  };

  // Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Simple validation
  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = "Username is required";
    if (isFlipped && !form.email.trim()) errs.email = "Email is required";
    if (!form.password.trim()) errs.password = "Password is required";
    return errs;
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const endpoint = isFlipped ? "/register" : "/login";
      const response = await axios.post(API_BASE_URL + endpoint, form);

      setServerMsg(response.data || "Success!");
      setErrors({});

      // ✅ Trigger chatbot if login/register success
      if (response.data && response.data.toLowerCase().includes("success")) {
        setTimeout(() => {
          if (typeof onAuthSuccess === "function") {
            onAuthSuccess(form.username);
          }
        }, 500);
      }
    } catch (error) {
      setServerMsg(
        error.response?.data || "Server not responding on port 7070!"
      );
    }
  };

  return (
    <div className="auth-viewport">
      <div className="auth-scene">
        <div className={`auth-card ${isFlipped ? "is-flipped" : ""}`}>

          {/* LOGIN FACE */}
          <div className="auth-face auth-face-front">
            <div className="brand">KL-Sender</div>
            <div className="title">Login</div>

            <form className="form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="username"
                className={`input ${errors.username ? "error" : ""}`}
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
              />
              {errors.username && <div className="field-error">{errors.username}</div>}

              <input
                type="password"
                name="password"
                className={`input ${errors.password ? "error" : ""}`}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && <div className="field-error">{errors.password}</div>}

              <button type="submit" className="btn primary">Login</button>
            </form>

            {serverMsg && (
              <div
                className={`server-msg ${
                  serverMsg.toLowerCase().includes("success")
                    ? "success"
                    : "error"
                }`}
              >
                {serverMsg}
              </div>
            )}

            <div className="alt">
              <span>Don’t have an account?</span>
              <button className="link-btn" onClick={handleFlip}>
                Register
              </button>
            </div>
          </div>

          {/* REGISTER FACE */}
          <div className="auth-face auth-face-back">
            <div className="brand inverse">KL-Sender</div>
            <div className="title">Create Account</div>

            <form className="form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="username"
                className={`input ${errors.username ? "error" : ""}`}
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
              />
              {errors.username && <div className="field-error">{errors.username}</div>}

              <input
                type="email"
                name="email"
                className={`input ${errors.email ? "error" : ""}`}
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <div className="field-error">{errors.email}</div>}

              <input
                type="password"
                name="password"
                className={`input ${errors.password ? "error" : ""}`}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && <div className="field-error">{errors.password}</div>}

              <button type="submit" className="btn primary">Register</button>
            </form>

            {serverMsg && (
              <div
                className={`server-msg ${
                  serverMsg.toLowerCase().includes("success")
                    ? "success"
                    : "error"
                }`}
              >
                {serverMsg}
              </div>
            )}

            <div className="alt">
              <span>Already have an account?</span>
              <button className="link-btn" onClick={handleFlip}>
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
