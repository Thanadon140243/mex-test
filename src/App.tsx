import React, { useState } from "react";
import './index.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState(""); // เก็บค่าที่ผู้ใช้กรอกในช่อง username
  const [password, setPassword] = useState(""); // เก็บค่าที่ผู้ใช้กรอกในช่อง password
  const [error, setError] = useState(""); // เก็บข้อความข้อผิดพลาด
  const [loading, setLoading] = useState(false); // แสดงสถานะการโหลด

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้า
    setLoading(true); // ตั้งสถานะการโหลดเป็น true
    setError(""); // ล้างข้อความข้อผิดพลาดก่อนหน้า

    try {
      console.debug("Request Payload:", { username, password });

      // ส่งคำขอไปยัง API
      const response = await fetch("https://api.mexservice.la/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }), // ส่งข้อมูล username และ password
      });

      console.debug("Response Status:", response.status);

      const data = await response.json();

      console.debug("Response Data:", data);

      if (response.ok && data.success) {
        console.debug("Login successful:", data);

        // เก็บ token ใน sessionStorage
        sessionStorage.setItem("token", data.data.token);
        sessionStorage.setItem("user", JSON.stringify(data.data.user));

        // ตรวจสอบ rule เพื่อ redirect
        if (data.data.user.rule === 1) {
          window.location.href = "/homeAdmin.html"; // Redirect ไปยังหน้า admin
        } else if (data.data.user.rule === 2) {
          window.location.href = "/homeStore.html"; // Redirect ไปยังหน้า store
        }
      } else {
        // แสดงข้อความข้อผิดพลาดจาก API
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false); // ตั้งสถานะการโหลดเป็น false
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen login-background">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
	<div className="flex justify-center mb-6">
          <img
            src="/img/Logo1000_300_red.png"
            alt="Logo"
            className="w-48 h-auto"
          />
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-medium text-gray-600"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // อัปเดตค่า username
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your username"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-600"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // อัปเดตค่า password
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