import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import './css/Form.css'; // Import CSS for switch

interface Package {
    id: string;
    packageName: string;
    price: number;
    monthlyFee: number;
    coveragePeriod: string;
    status: boolean;
    image: string;
    equipmentDetails: string;
    includedServices: string;
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
    const [editPackage, setEditPackage] = useState<Package | null>(null);

    const resetForm = () => {
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
    };

    const closePopup = () => {
        resetForm(); // รีเซ็ตค่าฟอร์มทั้งหมด
        setImagePreview(null); // ล้างรูปภาพตัวอย่าง
        setEditPackage(null); // รีเซ็ตโหมดแก้ไข
        setIsPopupOpen(false); // ปิด Popup
    };

    const [errors, setErrors] = useState({
        packageName: '',
        price: '',
        monthlyFee: '',
        coveragePeriod: '',
    });

    useEffect(() => {
        // Mock API call to fetch packages
        const fetchPackages = async () => {
            const mockPackages: Package[] = [
                {
                    id: 'MEXPK0001',
                    packageName: 'แพ็คเกจ 1',
                    price: 1000,
                    monthlyFee: 100,
                    coveragePeriod: '1 ปี',
                    status: true,
                    image: '/img/LOGO500_500_0.jpg',
                    equipmentDetails: 'เครื่องปรับอากาศ 1 เครื่อง',
                    includedServices: 'บริการล้างแอร์ฟรี 2 ครั้ง',
                },
                {
                    id: 'MEXPK0002',
                    packageName: 'แพ็คเกจ 2',
                    price: 2000,
                    monthlyFee: 200,
                    coveragePeriod: '2 ปี',
                    status: false,
                    image: '/img/LOGO500_500_0.jpg',
                    equipmentDetails: 'เครื่องซักผ้า 1 เครื่อง',
                    includedServices: 'บริการตรวจเช็คฟรี 1 ครั้ง',
                },
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

    const formatNumberWithCommas = (number: number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
    
        // อัปเดตค่าใน formData
        setFormData((prev) => ({ ...prev, [name]: value }));
    
        // ลบข้อความแจ้งเตือนของฟิลด์ที่กำลังถูกแก้ไข
        setErrors((prev) => ({ ...prev, [name]: '' }));
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

    const handleEditPackage = (pkg: Package) => {
        setEditPackage(pkg); // เก็บข้อมูลแพ็คเกจที่ต้องการแก้ไข
        setFormData({
            packageName: pkg.packageName,
            price: pkg.price.toString(),
            monthlyFee: pkg.monthlyFee.toString(),
            equipmentDetails: pkg.equipmentDetails,
            includedServices: pkg.includedServices,
            coveragePeriod: pkg.coveragePeriod.split(' ')[0], // แยกตัวเลขออกจาก "1 ปี" หรือ "12 เดือน"
            coverageType: pkg.coveragePeriod.includes('ปี') ? 'ปี' : 'เดือน', // ตรวจสอบว่าเป็น "ปี" หรือ "เดือน"
            image: null, // ไม่สามารถตั้งค่าไฟล์โดยตรงได้
            status: pkg.status ? 'เปิด' : 'ปิด',
        });
        setImagePreview(pkg.image);
        setIsPopupOpen(true); // เปิด Popup
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        if (!validateForm()) {
            return; // หยุดการทำงานถ้าข้อมูลไม่ครบ
        }
    
        // ดำเนินการส่งข้อมูลต่อไป
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
    
            if (editPackage) {
                // อัปเดตแพ็คเกจที่มีอยู่
                const response = await fetch(`https://your-api-endpoint.com/packages/${editPackage.id}`, {
                    method: 'PUT',
                    body: formDataToSend,
                });
    
                if (response.ok) {
                    alert('อัปเดตข้อมูลสำเร็จ');
                    const updatedPackage = await response.json();
                    setPackages((prev) =>
                        prev.map((pkg) => (pkg.id === updatedPackage.id ? updatedPackage : pkg))
                    );
                } else {
                    alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
                }
            } else {
                // เพิ่มแพ็คเกจใหม่
                const response = await fetch('https://your-api-endpoint.com/packages', {
                    method: 'POST',
                    body: formDataToSend,
                });
    
                if (response.ok) {
                    alert('บันทึกข้อมูลสำเร็จ');
                    const newPackage = await response.json();
                    setPackages((prev) => [...prev, newPackage]);
                } else {
                    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
                }
            }
    
            closePopup(); // เรียกใช้ฟังก์ชันปิด Popup และรีเซ็ตค่า
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

    const validateForm = () => {
        const newErrors: typeof errors = {
            packageName: '',
            price: '',
            monthlyFee: '',
            coveragePeriod: '',
        };
    
        if (!formData.packageName.trim()) {
            newErrors.packageName = 'กรุณากรอกชื่อแพ็คเกจ';
        }
        if (!formData.price.trim()) {
            newErrors.price = 'กรุณากรอกราคาขายแพ็คเกจ';
        }
        if (!formData.monthlyFee.trim()) {
            newErrors.monthlyFee = 'กรุณากรอกค่าธรรมเนียมรายเดือน';
        }
        if (!formData.coveragePeriod.trim()) {
            newErrors.coveragePeriod = 'กรุณากรอกระยะเวลาความคุ้มครอง';
        }
    
        setErrors(newErrors);
    
        // คืนค่า true ถ้าไม่มีข้อผิดพลาด
        return Object.values(newErrors).every((error) => error === '');
    };

    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        packageId: string | null;
    }>({
        isOpen: false,
        packageId: null,
    });

    const openDeleteConfirmation = (packageId: string) => {
        setDeleteConfirmation({
            isOpen: true,
            packageId,
        });
    };

    const confirmDelete = () => {
        if (deleteConfirmation.packageId) {
            setPackages((prevPackages) =>
                prevPackages.filter((pkg) => pkg.id !== deleteConfirmation.packageId)
            );
        }
        setDeleteConfirmation({
            isOpen: false,
            packageId: null,
        });
    };

    const closeDeleteConfirmation = () => {
        setDeleteConfirmation({
            isOpen: false,
            packageId: null,
        });
    };

    const [deleteSelectedConfirmation, setDeleteSelectedConfirmation] = useState(false);

    const openDeleteSelectedConfirmation = () => {
        setDeleteSelectedConfirmation(true);
    };

    const confirmDeleteSelected = () => {
        setPackages((prevPackages) =>
            prevPackages.filter((pkg) => !selectedPackages.includes(pkg.id))
        );
        setSelectedPackages([]); // ล้างรายการที่เลือก
        setDeleteSelectedConfirmation(false); // ปิด Popup
    };

    const closeDeleteSelectedConfirmation = () => {
        setDeleteSelectedConfirmation(false);
    };

    const [editConfirmation, setEditConfirmation] = useState<{
        isOpen: boolean;
        packageId: string | null;
    }>({
        isOpen: false,
        packageId: null,
    });

    const openEditConfirmation = (packageId: string | null) => {
        setEditConfirmation({
            isOpen: true,
            packageId,
        });
    };

    const confirmEdit = async () => {
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
    
            if (editPackage) {
                // อัปเดตแพ็คเกจที่มีอยู่
                const response = await fetch(`https://your-api-endpoint.com/packages/${editPackage.id}`, {
                    method: 'PUT',
                    body: formDataToSend,
                });
    
                if (response.ok) {
                    alert('อัปเดตข้อมูลสำเร็จ');
                    const updatedPackage = await response.json();
                    setPackages((prev) =>
                        prev.map((pkg) => (pkg.id === updatedPackage.id ? updatedPackage : pkg))
                    );
                } else {
                    alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
                }
            }
    
            closeEditConfirmation(); // ปิด Popup ยืนยันการแก้ไข
            closePopup(); // ปิด Popup หลัก
        } catch (error) {
            console.error('Error updating package:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        }
    };

    const closeEditConfirmation = () => {
        setEditConfirmation({
            isOpen: false,
            packageId: null,
        });
    };

    const [statusConfirmation, setStatusConfirmation] = useState<{
        isOpen: boolean;
        packageId: string | null;
        newStatus: boolean | null;
    }>({
        isOpen: false,
        packageId: null,
        newStatus: null,
    });

    const openStatusConfirmation = (packageId: string, newStatus: boolean) => {
        setStatusConfirmation({
            isOpen: true,
            packageId,
            newStatus,
        });
    };

    const confirmStatusChange = () => {
        if (statusConfirmation.packageId !== null && statusConfirmation.newStatus !== null) {
            setPackages((prevPackages) =>
                prevPackages.map((pkg) =>
                    pkg.id === statusConfirmation.packageId && statusConfirmation.newStatus !== null
                        ? { ...pkg, status: statusConfirmation.newStatus }
                        : pkg
                )
            );
        }
        closeStatusConfirmation(); // ปิด Popup
    };

    const closeStatusConfirmation = () => {
        setStatusConfirmation({
            isOpen: false,
            packageId: null,
            newStatus: null,
        });
    };

    const handleToggleStatus = (id: string) => {
        const pkg = packages.find((pkg) => pkg.id === id);
        if (pkg) {
            openStatusConfirmation(id, !pkg.status); // เปิด Popup พร้อมข้อมูลสถานะใหม่
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">แพ็คเกจ</h1>
            <div className="flex justify-end mb-4">
            <button
                onClick={openDeleteSelectedConfirmation}
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
                        <th className="py-2 px-4 border-b text-center">แก้ไข</th>
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
                                <img src={pkg.image} alt={pkg.packageName} className="w-16 h-16 object-cover mx-auto" />
                            </td>
                            <td className="py-2 px-4 border-b text-center">{pkg.id}</td>
                            <td className="py-2 px-4 border-b text-center">{pkg.packageName}</td>
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
                                <button
                                    onClick={() => handleEditPackage(pkg)}
                                    className="text-blue-500 hover:underline"
                                >
                                    แก้ไข
                                </button>
                            </td>
                            <td className="py-2 px-4 border-b text-center">
                                <button
                                    onClick={() => openDeleteConfirmation(pkg.id)}
                                    className="text-red-500 hover:underline"
                                >
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
                        onClick={closePopup} // ใช้ฟังก์ชัน closePopup
                    ></div>

                    {/* Popup */}
                    <div
                        className="fixed top-0 right-0 h-full w-1/3 bg-[#ffff] shadow-lg z-50 p-4 overflow-y-auto"
                        style={{ maxHeight: '100vh' }}
                    >
                        <h2 className="text-xl font-bold mb-4">เพิ่มแพ็คเกจใหม่</h2>
                        <button
                            onClick={closePopup} // ใช้ฟังก์ชัน closePopup
                            className="absolute top-4 right-4 pt-1 pb-1 pr-3 pl-3 rounded bg-[#E52525] text-[#fff] hover:text-gray-700"
                        >
                            ✖
                        </button>
                        <form onSubmit={handleSubmit} className="space-y-2">
                            <div>
                                <label className="block mb-2">ชื่อแพ็คเกจ *</label>
                                <input
                                    type="text"
                                    name="packageName"
                                    value={formData.packageName}
                                    onChange={handleInputChange}
                                    className="w-full border rounded px-3 py-2"
                                />
                                {errors.packageName && <p className="text-red-500 text-sm">{errors.packageName}</p>}
                            </div>
                            <div className="flex space-x-4">
                                <div className="w-1/2">
                                    <label className="block mb-2">ราคาขายแพ็คเกจ *</label>
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full border rounded px-3 py-2"
                                        />
                                        <span className="ml-2">บาท</span>
                                    </div>
                                    {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                                </div>
                                <div className="w-1/2">
                                    <label className="block mb-2">ค่าธรรมเนียมรายเดือน *</label>
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            name="monthlyFee"
                                            value={formData.monthlyFee}
                                            onChange={handleInputChange}
                                            className="w-3/4 border rounded px-3 py-2" // ปรับความกว้างของ input
                                        />
                                        <span className="ml-2 whitespace-nowrap">บาท/เดือน</span>
                                    </div>
                                    {errors.monthlyFee && <p className="text-red-500 text-sm">{errors.monthlyFee}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2">รายละเอียดอุปกรณ์ที่ได้รับ</label>
                                <textarea
                                    name="equipmentDetails"
                                    value={formData.equipmentDetails}
                                    onChange={handleInputChange}
                                    className="w-full border rounded px-3 py-2 "
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block mb-2">บริการที่รวมในแพ็คเกจ</label>
                                <textarea
                                    name="includedServices"
                                    value={formData.includedServices}
                                    onChange={handleInputChange}
                                    className="w-full border rounded px-3 py-2 "
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block mb-2">ระยะเวลาความคุ้มครอง</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="number"
                                        name="coveragePeriod"
                                        value={formData.coveragePeriod}
                                        onChange={handleInputChange}
                                        className="w-1/2 border rounded px-3 py-2 "
                                    />
                                    <select
                                        name="coverageType"
                                        value={formData.coverageType}
                                        onChange={handleInputChange}
                                        className="border rounded px-3 py-2 "
                                    >
                                        <option value="เดือน">เดือน</option>
                                        <option value="ปี">ปี</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2">ภาพประกอบแพ็คเกจ</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full border rounded px-3 py-2 "
                                />
                                {imagePreview && (
                                    <div className="mt-4">
                                        <img src={imagePreview} alt="Preview" className="h-50 object-cover mx-auto" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block mb-2">สถานะการแสดงผล</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full border rounded px-3 py-2 "
                                >
                                    <option value="เปิด">เปิด</option>
                                    <option value="ปิด">ปิด</option>
                                </select>
                            </div>
                            <div className="flex justify-between space-x-4">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 "
                                >
                                    รีเซ็ต
                                </button>
                                <button type="button"
                                    onClick={() => {
                                        if (validateForm()) {
                                        openEditConfirmation(editPackage ? editPackage.id : null);
                                        }
                                    }}
                                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    {editPackage ? 'อัปเดต' : 'บันทึก'}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
            {deleteConfirmation.isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={closeDeleteConfirmation}
                    ></div>

                    {/* Popup */}
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">ยืนยันการลบ</h2>
                        <p className="mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบแพ็คเกจนี้?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                onClick={closeDeleteConfirmation}
                            >
                                ยกเลิก
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                onClick={confirmDelete}
                            >
                                ลบ
                            </button>
                        </div>
                    </div>
                </>
            )}
            {deleteSelectedConfirmation && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={closeDeleteSelectedConfirmation}
                    ></div>

                    {/* Popup */}
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">ยืนยันการลบ</h2>
                        <p className="mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบแพ็คเกจที่เลือกทั้งหมด?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                onClick={closeDeleteSelectedConfirmation}
                            >
                                ยกเลิก
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                onClick={confirmDeleteSelected}
                            >
                                ลบ
                            </button>
                        </div>
                    </div>
                </>
            )}
            {editConfirmation.isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={closeEditConfirmation}
                    ></div>

                    {/* Popup */}
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">
                            {editPackage ? 'ยืนยันการแก้ไขแพ็คเกจ' : 'ยืนยันการเพิ่มแพ็คเกจ'}
                        </h2>
                        <p className="mb-6">
                            {editPackage
                                ? `คุณแน่ใจหรือไม่ว่าต้องการบันทึกการแก้ไขแพ็คเกจ "${editPackage.packageName}"?`
                                : 'คุณแน่ใจหรือไม่ว่าต้องการบันทึกแพ็คเกจใหม่?'}
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                onClick={closeEditConfirmation}
                            >
                                ยกเลิก
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={confirmEdit}
                            >
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </>
            )}
            {statusConfirmation.isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={closeStatusConfirmation}
                    ></div>

                    {/* Popup */}
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">ยืนยันการเปลี่ยนสถานะ</h2>
                        <p className="mb-6">
                            คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยนสถานะของแพ็คเกจนี้เป็น{' '}
                            {statusConfirmation.newStatus ? 'เปิด' : 'ปิด'}?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                onClick={closeStatusConfirmation}
                            >
                                ยกเลิก
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={confirmStatusChange}
                            >
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Package;