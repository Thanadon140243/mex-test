import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

const DashboardData: React.FC = () => {
  const [totalApplications, setTotalApplications] = useState(0);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [totalFranchises, setTotalFranchises] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [barData, setBarData] = useState<{ labels: string[], datasets: { label: string, data: number[], backgroundColor: string }[] }>({ labels: [], datasets: [] });
  const [pieData, setPieData] = useState<{ labels: string[], datasets: { data: number[], backgroundColor: string[], hoverBackgroundColor: string[] }[] }>({ labels: [], datasets: [] });
  const [lineData, setLineData] = useState<{ labels: string[], datasets: { label: string, data: number[], borderColor: string, backgroundColor: string, fill: boolean }[] }>({ labels: [], datasets: [] });

  useEffect(() => {
    // Mock API call to fetch data
    const fetchData = async () => {
      // TODO: Replace with actual API call
      const mockData = {
        totalApplications: 120,
        pendingApplications: 30,
        totalFranchises: 50,
        totalRevenue: 500000000,
        barData: {
          labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
          datasets: [
            {
              label: 'จำนวนใบสมัคร',
              data: [10, 20, 15, 13, 7, 20, 23, 10, 15,],
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
          ],
        },
        pieData: {
          labels: ['Starter', 'Standard', 'Premium'],
          datasets: [
            {
              data: [50, 30, 20],
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
              hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            },
          ],
        },
        lineData: {
          labels: ['มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.'],
          datasets: [
            {
              label: 'รายได้จากแฟรนไชส์',
              data: [100000, 90000, 200000, 150000, 250000, 260000],
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
            },
          ],
        },
      };

      setTotalApplications(mockData.totalApplications);
      setPendingApplications(mockData.pendingApplications);
      setTotalFranchises(mockData.totalFranchises);
      setTotalRevenue(mockData.totalRevenue);
      setBarData(mockData.barData);
      setPieData(mockData.pieData);
      setLineData(mockData.lineData);
    };

    fetchData();
  }, []);

  // Function to format number with commas
  const formatNumberWithCommas = (number: number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-[20px] shadow">
          <h3 className="text-xl font-bold">จำนวนใบสมัครทั้งหมด</h3>
          <p className="text-2xl">{totalApplications}</p>
        </div>
        <div className="bg-white p-4 rounded-[20px] shadow">
          <h3 className="text-xl font-bold">จำนวนใบสมัครที่รอพิจารณา</h3>
          <p className="text-2xl">{pendingApplications}</p>
        </div>
        <div className="bg-white p-4 rounded-[20px] shadow">
          <h3 className="text-xl font-bold">จำนวนสาขาแฟรนไชส์ที่เปิดแล้ว</h3>
          <p className="text-2xl">{totalFranchises}</p>
        </div>
        <div className="bg-white p-4 rounded-[20px] shadow">
          <h3 className="text-xl font-bold">รายได้รวมจากแฟรนไชส์</h3>
          <p className="text-2xl">{formatNumberWithCommas(totalRevenue)} บาท</p>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="col-span-3 bg-white p-4 rounded-[20px] shadow">
          <h3 className="text-xl font-bold mb-4">จำนวนใบสมัครรายเดือน</h3>
          <div className="h-64">
            <Bar data={barData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="col-span-2 bg-white p-4 rounded-[20px] shadow">
          <h3 className="text-xl font-bold mb-4">การเลือกแพ็กเกจแฟรนไชส์</h3>
          <div className="h-64">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-[20px] shadow">
        <h3 className="text-xl font-bold mb-4">รายได้จากแฟรนไชส์ย้อนหลัง 6 เดือน</h3>
        <div className="h-64">
          <Line data={lineData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
};

export default DashboardData;