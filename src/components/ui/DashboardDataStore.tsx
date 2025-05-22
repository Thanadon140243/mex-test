import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardDataStore: React.FC = () => {
  // Mock data
  const data = {
    parcelsToday: 120,
    revenueToday: 50000,
    costToday: 20000,
    profitToday: 30000,
    remainingCredit: 150000,
    cashReceived: 30000,
    transferReceived: 20000,
    news: [
        { id: 1, title: 'โปรโมชั่นพิเศษเดือนนี้', date: '2025-04-01', details: 'รายละเอียดโปรโมชั่นพิเศษ...' },
        { id: 2, title: 'ประกาศหยุดทำการ', date: '2025-04-05', details: 'รายละเอียดการหยุดทำการ...' },
        { id: 3, title: 'กิจกรรมพิเศษ', date: '2025-04-10', details: 'รายละเอียดกิจกรรมพิเศษ...' },
        { id: 4, title: 'อัปเดตระบบ', date: '2025-04-15', details: 'รายละเอียดการอัปเดตระบบ...' },
        { id: 5, title: 'ประกาศสำคัญ', date: '2025-04-20', details: 'รายละเอียดประกาศสำคัญ...' },
        { id: 6, title: 'โปรโมชั่นใหม่', date: '2025-04-25', details: 'รายละเอียดโปรโมชั่นใหม่...' },
        { id: 7, title: 'ข่าวสำคัญเพิ่มเติม', date: '2025-04-28', details: 'รายละเอียดข่าวสำคัญเพิ่มเติม...' },
        { id: 8, title: 'กิจกรรมใหม่', date: '2025-04-30', details: 'รายละเอียดกิจกรรมใหม่...' },
        { id: 9, title: 'ข่าวเกินขีดจำกัด', date: '2025-05-01', details: 'รายละเอียดข่าวเกินขีดจำกัด...' },
      ],
  };

  const limitedNews = data.news.slice(-4); // แสดงเฉพาะ 4 ข่าวล่าสุด

  // State for news popup
  const [selectedNews, setSelectedNews] = useState<{ title: string; details: string } | null>(null);

  // Chart data
  const chartData = {
    labels: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
    datasets: [
      {
        label: 'จำนวนพัสดุ',
        data: [120, 150, 180, 200, 220, 250, 300, 280, 260, 240, 230, 210],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'ต้นทุน',
        data: [20000, 25000, 30000, 35000, 40000, 45000, 50000, 48000, 46000, 44000, 42000, 40000],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'กำไร',
        data: [30000, 35000, 40000, 45000, 50000, 55000, 60000, 58000, 56000, 54000, 52000, 50000],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'กราฟแสดงรายได้รายปี',
      },
    },
  };

  const formatNumberWithCommas = (number: number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="p-4">
      {/* Section 1: Summary Boxes */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-[20px] shadow">
          <h3 className="text-xl font-bold">พัสดุวันนี้</h3>
          <p className="text-2xl">{formatNumberWithCommas(data.parcelsToday)} ชิ้น</p>
        </div>
        <div className="bg-white p-4 rounded-[20px] shadow">
          <h3 className="text-xl font-bold">รายได้วันนี้</h3>
          <p className="text-2xl">{formatNumberWithCommas(data.revenueToday)} บาท</p>
        </div>
        <div className="bg-white p-4 rounded-[20px] shadow">
          <h3 className="text-xl font-bold">ต้นทุนวันนี้</h3>
          <p className="text-2xl">{formatNumberWithCommas(data.costToday)} บาท</p>
        </div>
        <div className="bg-white p-4 rounded-[20px] shadow">
          <h3 className="text-xl font-bold">กำไรวันนี้</h3>
          <p className="text-2xl">{formatNumberWithCommas(data.profitToday)} บาท</p>
        </div>
        <div className="bg-white p-4 rounded-[20px] shadow">
          <h3 className="text-xl font-bold">เครดิตคงเหลือ</h3>
          <p className="text-2xl">{formatNumberWithCommas(data.remainingCredit)} บาท</p>
        </div>
      </div>

      {/* Section 2: Chart and Additional Info */}
      <div className="grid grid-cols-4 gap-4">
        {/* Chart */}
        <div className="col-span-3 bg-white p-4 rounded-[20px] shadow">
          <Bar data={chartData} options={chartOptions} />
        </div>

        {/* Additional Info */}
        <div className="col-span-1 space-y-4">
          {/* Cash and Transfer */}
          <div className="bg-white p-4 rounded-[20px] shadow">
            <h3 className="text-xl font-bold">การรับเงิน</h3>
            <p className="text-lg">เงินสด: {formatNumberWithCommas(data.cashReceived)} บาท</p>
            <p className="text-lg">เงินโอน: {formatNumberWithCommas(data.transferReceived)} บาท</p>
          </div>

          {/* News */}
          <div className="bg-white p-4 rounded-[20px] shadow">
            <h3 className="text-xl font-bold">ข่าวประชาสัมพันธ์</h3>
            {limitedNews.map((news) => (
            <div
                key={news.id}
                className="mb-4 p-4 border rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => setSelectedNews({ title: news.title, details: news.details })}
            >
                <h4 className="text-l">{news.title}</h4>
                <p className="text-sm text-gray-500">{news.date}</p>
            </div>
            ))}
          </div>
        </div>
      </div>

      {/* News Popup */}
      {selectedNews && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSelectedNews(null)}
          ></div>

          {/* Popup */}
          <div className="fixed top-0 right-0 h-full w-1/3 bg-white shadow-lg z-50 p-6 overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{selectedNews.title}</h2>
            <p className="mb-6">{selectedNews.details}</p>
            <div className="flex justify-end">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => setSelectedNews(null)}
              >
                ปิด
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardDataStore;