import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import './css/Package.css'; // Import CSS for switch

interface Package {
    id: string;
    name: string;
    price: number;
    monthlyFee: number;
    coveragePeriod: string;
    status: boolean;
    imageUrl: string;
}

const Package: React.FC = () => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false); // State for popup visibility
    const [formData, setFormData] = useState({
        packageName: '',
        price: '',
        monthlyFee: '',
        equipmentDetails: '',
        includedServices: '',
        coveragePeriod: '',
        coverageType: 'ปี', // Default to "ปี"
        image: null as File | null,
        status: 'เปิด', // Default to "เปิด"
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        // Mock API call to fetch packages
        const fetchPackages = async () => {
            const mockPackages: Package[] = [
                { id: 'MEXPK0001', name: 'แพ็คเกจ 1', price: 1000, monthlyFee: 100, coveragePeriod: '1 ปี', status: true, imageUrl: '/img/LOGO500_500_0.jpg' },
                { id: 'MEXPK0002', name: 'แพ็คเกจ 2', price: 2000, monthlyFee: 200, coveragePeriod: '2 ปี', status: false, imageUrl: '/img/LOGO500_500_0.jpg' },
            ];

            setPackages(mockPackages);
        };

        fetchPackages();
    }, []);

    const handleSelectPackage = (id: string) => {
        setSelectedPackages((prevSelected) =>
            prevSelected.includes(id) ? prevSelected.filter((pkgId) => pkgId !== id) : [...prevSelected, id]
        );
    };

    const handleDeleteSelected = () => {
        if (window.confirm('คุณแน่ใจว่าต้องการลบแพ็คเกจที่เลือกทั้งหมดหรือไม่?')) {
            setPackages((prevPackages) => prevPackages.filter((pkg) => !selectedPackages.includes(pkg.id)));
            setSelectedPackages([]);
        }
    };

    const handleDeletePackage = (id: string) => {
        if (window.confirm('คุณแน่ใจว่าต้องการลบแพ็คเกจนี้หรือไม่?')) {
            setPackages((prevPackages) => prevPackages.filter((pkg) => pkg.id !== id));
        }
    };

    const handleToggleStatus = (id: string) => {
        const pkg = packages.find((pkg) => pkg.id === id);
        if (pkg && window.confirm(`คุณแน่ใจว่าต้องการเปลี่ยนสถานะของแพ็คเกจ ${pkg.name} หรือไม่?`)) {
            setPackages((prevPackages) =>
                prevPackages.map((pkg) => (pkg.id === id ? { ...pkg, status: !pkg.status } : pkg))
            );
        }
    };

    const formatNumberWithCommas = (number: number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({ ...prev, image: file }));
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.packageName || !formData.price || !formData.monthlyFee) {
            alert('กรุณากรอกข้อมูลที่จำเป็น');
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('packageName', formData.packageName);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('monthlyFee', formData.monthlyFee);
            formDataToSend.append('equipmentDetails', formData.equipmentDetails);
            formDataToSend.append('includedServices', formData.includedServices);
            formDataToSend.append('coveragePeriod', formData.coveragePeriod);
            formDataToSend.append('coverageType', formData.coverageType);
            formDataToSend.append('status', formData.status);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            const response = await fetch('https://your-api-endpoint.com/packages', {
                method: 'POST',
                body: formDataToSend,
            });

            if (response.ok) {
                alert('บันทึกข้อมูลสำเร็จ');
                setIsPopupOpen(false);
                setFormData({
                    packageName: '',
                    price: '',
                    monthlyFee: '',
                    equipmentDetails: '',
                    includedServices: '',
                    coveragePeriod: '',
                    coverageType: 'ปี',
                    image: null,
                    status: 'เปิด',
                });
                setImagePreview(null);
                // Fetch updated packages
                const updatedPackages = await response.json();
                setPackages((prev) => [...prev, updatedPackages]);
            } else {
                alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        }
    };

    const handleReset = () => {
        setFormData({
            packageName: '',
            price: '',
            monthlyFee: '',
            equipmentDetails: '',
            includedServices: '',
            coveragePeriod: '',
            coverageType: 'ปี',
            image: null,
            status: 'เปิด',
        });
        setImagePreview(null);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">แพ็คเกจ</h1>
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleDeleteSelected}
                    className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600"
                >
                    ลบ
                </button>
                <button
                    onClick={() => setIsPopupOpen(true)} // Open popup
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    เพิ่มแพ็คเกจ
                </button>
            </div>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b text-center">
                            <input
                                type="checkbox"
                                onChange={(e) => setSelectedPackages(e.target.checked ? packages.map((pkg) => pkg.id) : [])}
                                checked={selectedPackages.length === packages.length}
                            />
                        </th>
                        <th className="py-2 px-4 border-b text-center">รูปแพ็คเกจ</th>
                        <th className="py-2 px-4 border-b text-center">รหัสแพ็คเกจ</th>
                        <th className="py-2 px-4 border-b text-center">ชื่อแพ็คเกจ</th>
                        <th className="py-2 px-4 border-b text-center">ราคาขายแพ็คเกจ</th>
                        <th className="py-2 px-4 border-b text-center">ค่าทำเนียมรายเดือน</th>
                        <th className="py-2 px-4 border-b text-center">ระยะเวลาคุ้มครอง</th>
                        <th className="py-2 px-4 border-b text-center">สถานะ</th>
                        <th className="py-2 px-4 border-b text-center">ลบ</th>
                    </tr>
                </thead>
                <tbody>
                    {packages.map((pkg) => (
                        <tr key={pkg.id} className="cursor-pointer">
                            <td className="py-2 px-4 border-b text-center">
                                <input
                                    type="checkbox"
                                    checked={selectedPackages.includes(pkg.id)}
                                    onChange={() => handleSelectPackage(pkg.id)}
                                />
                            </td>
                            <td className="py-2 px-4 border-b text-center">
                                <img src={pkg.imageUrl} alt={pkg.name} className="w-16 h-16 object-cover mx-auto" />
                            </td>
                            <td className="py-2 px-4 border-b text-center">{pkg.id}</td>
                            <td className="py-2 px-4 border-b text-center">{pkg.name}</td>
                            <td className="py-2 px-4 border-b text-center">{formatNumberWithCommas(pkg.price)}</td>
                            <td className="py-2 px-4 border-b text-center">{formatNumberWithCommas(pkg.monthlyFee)}</td>
                            <td className="py-2 px-4 border-b text-center">{pkg.coveragePeriod}</td>
                            <td className="py-2 px-4 border-b text-center">
                                <label className="switch">
                                    <input type="checkbox" checked={pkg.status} onChange={() => handleToggleStatus(pkg.id)} />
                                    <span className="slider"></span>
                                </label>
                            </td>
                            <td className="py-2 px-4 border-b text-center">
                                <button onClick={() => handleDeletePackage(pkg.id)} className="text-red-500">
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Backdrop and Popup */}
            {isPopupOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setIsPopupOpen(false)} // Close popup when clicking on backdrop
                    ></div>

                    {/* Popup */}
                    <div
                        className="fixed top-0 right-0 h-full w-1/3 bg-[#e4e4e4] shadow-lg z-50 p-4 overflow-y-auto"
                        style={{ maxHeight: '100vh' }}
                    >
                        <h2 className="text-xl font-bold mb-4">เพิ่มแพ็คเกจใหม่</h2>
                        <button
                            onClick={() => setIsPopupOpen(false)} // Close popup
                            className="absolute top-4 right-4 pt-1 pb-1 pr-3 pl-3 rounded-[50px] bg-[#E52525] text-[#fff] hover:text-gray-700"
                        >
                            ✖
                        </button>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block font-bold mb-2">ชื่อแพ็คเกจ *</label>
                                <input
                                    type="text"
                                    name="packageName"
                                    value={formData.packageName}
                                    onChange={handleInputChange}
                                    className="w-full border rounded px-3 py-2 rounded-[50px]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-2">ราคาขายแพ็คเกจ *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full border rounded px-3 py-2 rounded-[50px]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-2">ค่าธรรมเนียมรายเดือน *</label>
                                <input
                                    type="number"
                                    name="monthlyFee"
                                    value={formData.monthlyFee}
                                    onChange={handleInputChange}
                                    className="w-full border rounded px-3 py-2 rounded-[50px]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-2">รายละเอียดอุปกรณ์ที่ได้รับ</label>
                                <textarea
                                    name="equipmentDetails"
                                    value={formData.equipmentDetails}
                                    onChange={handleInputChange}
                                    className="w-full border rounded px-3 py-2 rounded-[20px]"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-2">บริการที่รวมในแพ็คเกจ</label>
                                <textarea
                                    name="includedServices"
                                    value={formData.includedServices}
                                    onChange={handleInputChange}
                                    className="w-full border rounded px-3 py-2 rounded-[20px]"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-2">ระยะเวลาความคุ้มครอง</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="number"
                                        name="coveragePeriod"
                                        value={formData.coveragePeriod}
                                        onChange={handleInputChange}
                                        className="w-1/2 border rounded px-3 py-2 rounded-[50px]"
                                    />
                                    <select
                                        name="coverageType"
                                        value={formData.coverageType}
                                        onChange={handleInputChange}
                                        className="border rounded px-3 py-2 rounded-[50px]"
                                    >
                                        <option value="เดือน">เดือน</option>
                                        <option value="ปี">ปี</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block font-bold mb-2">ภาพประกอบแพ็คเกจ</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full border rounded px-3 py-2 rounded-[50px]"
                                />
                                {imagePreview && (
                                    <div className="mt-4">
                                        <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover mx-auto" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block font-bold mb-2">สถานะการแสดงผล</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full border rounded px-3 py-2 rounded-[50px]"
                                >
                                    <option value="เปิด">เปิด</option>
                                    <option value="ปิด">ปิด</option>
                                </select>
                            </div>
                            <div className="flex justify-between space-x-4">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 rounded-[50px]"
                                >
                                    รีเซ็ต
                                </button>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 rounded-[50px]"
                                >
                                    บันทึก
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default Package;