import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import { FaHome, FaBoxOpen, FaCreditCard, FaCog, FaChevronDown, FaChevronUp, FaSignOutAlt } from "react-icons/fa";
import Franchise from "./components/ui/Franchise";
import DashboardDataAdmin from "./components/ui/DashboardDataAdmin";
import Package from "./components/ui/Package";
import UserGroup from "./components/ui/UserGroup";
import UserPermissions from "./components/ui/UserPermissions";

const Home: React.FC = () => {
  const [isFranchiseOpen, setIsFranchiseOpen] = useState(false);
  const [isCreditOpen, setIsCreditOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/index.html";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // ถ้าไม่มี Token ให้ Redirect ไปยังหน้า Login
      window.location.href = "/index.html";
    }
  }, []);

  return (
    <Router>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-52 bg-[#840505] text-white p-4 fixed h-full flex flex-col">
          <div className="flex justify-center mb-4">
            <img src="/img/Logo1000_300.png" alt="Logo" className="w-32 h-auto" />
          </div>
          <div>
            <Link to="/" className="flex items-center py-2 px-4 bg-[#E52525] rounded hover:bg-gray-600 mb-4">
              <FaHome className="mr-2" />
              <span>หน้าแรก</span>
            </Link>
            <button
              className="flex items-center w-full text-left py-2 px-4 bg-[#E52525] rounded hover:bg-gray-600"
              onClick={() => setIsFranchiseOpen(!isFranchiseOpen)}
            >
              <FaBoxOpen className="mr-2" />
              <span>แฟรนไซส์</span>
              {isFranchiseOpen ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />}
            </button>
            {isFranchiseOpen && (
              <div className="pl-4">
                <Link to="/package" className="block py-2 px-4 hover:bg-gray-600 rounded">แพ็ตเกจ</Link>
                <Link to="/franchise" className="block py-2 px-4 hover:bg-gray-600 rounded">เพิ่มแฟรนไซส์</Link>
                <Link to="/franchise-contract" className="block py-2 px-4 hover:bg-gray-600 rounded">สัญญาแฟรนไซส์</Link>
                <Link to="/franchise-settings" className="block py-2 px-4 hover:bg-gray-600 rounded">ตั้งค่าแฟรนไซส์</Link>
              </div>
            )}
          </div>
          <div>
            <button
              className="flex items-center w-full text-left py-2 px-4 bg-[#E52525] rounded hover:bg-gray-600 mt-4"
              onClick={() => setIsCreditOpen(!isCreditOpen)}
            >
              <FaCreditCard className="mr-2" />
              <span>เครดิต</span>
              {isCreditOpen ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />}
            </button>
            {isCreditOpen && (
              <div className="pl-4">
                <Link to="/credit-notification" className="block py-2 px-4 hover:bg-gray-600 rounded">รับแจ้งเติมเครดิต</Link>
                <Link to="/withdraw-credit" className="block py-2 px-4 hover:bg-gray-600 rounded">ถอนเครดิต</Link>
                <Link to="/credit-report" className="block py-2 px-4 hover:bg-gray-600 rounded">รายงานเครดิต</Link>
              </div>
            )}
          </div>
          <div>
            <button
              className="flex items-center w-full text-left py-2 px-4 bg-[#E52525] rounded hover:bg-gray-600 mt-4"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              <FaCog className="mr-2" />
              <span>ตั้งค่าทั่วไป</span>
              {isSettingsOpen ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />}
            </button>
            {isSettingsOpen && (
              <div className="pl-4">
                <Link to="/user-groups" className="block py-2 px-4 hover:bg-gray-600 rounded">กำหนดกลุ่มผู้ใช้งาน</Link>
                <Link to="/user-permissions" className="block py-2 px-4 hover:bg-gray-600 rounded">กำหนดสิทธิ์ผู้ใช้งาน</Link>
              </div>
            )}
          </div>
          {/* Logout Button */}
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center w-full py-2 px-4 bg-red-600 rounded hover:bg-red-700"
            >
              <FaSignOutAlt className="mr-2" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 ml-52">
          <Routes>
            <Route path="/" element={<DashboardDataAdmin />} />
            <Route path="/franchise" element={<Franchise />} />
            <Route path="/package" element={<Package />} />
            <Route path="/user-groups" element={<UserGroup />} />
            <Route path="/user-permissions" element={<UserPermissions />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default Home;