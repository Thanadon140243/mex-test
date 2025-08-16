import React, { useState } from "react";
import './index.css';

const Login: React.FC = () => {
   const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // เช็ค token ก่อน render
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (token && user) {
    try {
      const userObj = JSON.parse(user);
      if (userObj.rule === 1) {
        window.location.href = "/homeAdmin.html";
      } else if (userObj.rule === 2) {
        window.location.href = "/homeStore.html";
      }
      return null;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("https://api.mexservice.la/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, countryCode: "+66" }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        localStorage.setItem("countryCode", "+66");
        if (data.data.user.rule === 1) {
          window.location.href = "/homeAdmin.html";
        } else if (data.data.user.rule === 2) {
          window.location.href = "/homeStore.html";
        }
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen login-background">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <div className="flex justify-center mb-6">
          <img src="/img/Logo1000_300_red.png" alt="Logo" className="w-48 h-auto" />
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your username"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
            />
          </div>
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;