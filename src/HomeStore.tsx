import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { FaHome, FaTruck, FaMoneyCheckAlt, FaGamepad, FaShoppingCart, FaChartBar, FaCog, FaChevronDown, FaChevronUp, FaSignOutAlt } from 'react-icons/fa';
import DashboardDataStore from './components/ui/DashboardDataStore';
import ShippingAdd from './components/ui/ShippingAdd'; // Import ShippingAdd

const HomeStore: React.FC = () => {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/index.html";
    };
  
    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
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
            <Link to="/transport" className="flex items-center py-2 px-4 bg-[#E52525] rounded hover:bg-gray-600 mb-4">
              <FaTruck className="mr-2" />
              <span>ขนส่ง</span>
            </Link>
            <Link to="/transfer" className="flex items-center py-2 px-4 bg-[#E52525] rounded hover:bg-gray-600 mb-4">
              <FaMoneyCheckAlt className="mr-2" />
              <span>โอนเงิน</span>
            </Link>
            <Link to="/game-topup" className="flex items-center py-2 px-4 bg-[#E52525] rounded hover:bg-gray-600 mb-4">
              <FaGamepad className="mr-2" />
              <span>เติมเกม</span>
            </Link>
            <Link to="/shopping" className="flex items-center py-2 px-4 bg-[#E52525] rounded hover:bg-gray-600 mb-4">
              <FaShoppingCart className="mr-2" />
              <span>ซื้อสินค้า</span>
            </Link>
            <button
              className="flex items-center w-full text-left py-2 px-4 bg-[#E52525] rounded hover:bg-gray-600"
              onClick={() => setIsReportOpen(!isReportOpen)}
            >
              <FaChartBar className="mr-2" />
              <span>รายงาน</span>
              {isReportOpen ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />}
            </button>
            {isReportOpen && (
              <div className="pl-4">
                <Link to="/sales-report" className="block py-2 px-4 hover:bg-gray-600 rounded">รายงานยอดขาย</Link>
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
                <Link to="/user-settings" className="block py-2 px-4 hover:bg-gray-600 rounded">ตั้งค่าผู้ใช้</Link>
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
            {/* ตั้งค่าให้ path "/" แสดง DashboardDataStore */}
            <Route path="/" element={<DashboardDataStore />} />
            <Route path="/transport" element={<ShippingAdd />} />
            <Route path="/transfer" element={<></>} />
            <Route path="/game-topup" element={<></>} />
            <Route path="/shopping" element={<></>} />
            <Route path="/sales-report" element={<></>} />
            <Route path="/user-settings" element={<></>} />
            {/* Redirect หาก path ไม่ตรง */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default HomeStore;