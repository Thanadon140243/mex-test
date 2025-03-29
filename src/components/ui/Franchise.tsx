import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import './css/Package.css'; // Import CSS for styling

interface Franchise {
    id: string;
    storeName: string;
    address: string;
    packageName: string;
    ownerName: string;
    phoneNumber: string;
}

const Franchise: React.FC = () => {
    const [franchises, setFranchises] = useState<Franchise[]>([]);
    const [selectedFranchises, setSelectedFranchises] = useState<string[]>([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        personalInfo: {
            name: '',
            phoneNumber: '',
            email: '',
            idCard: '',
            address: '',
            idCardFile: null as File | null,
            countryCode: '+85',
            house: '',
            city: '',
            district: '',
            postalCode: '',
            province: '',
            subDistrict: '',
        },
        businessInfo: {
            storeName: '',
            storeAddress: '',
            storeArea: '',
            businessExperience: '',
            investmentBudget: '',
        },
        selectedPackage: null as string | null,
        paymentInfo: {
            paymentProof: null as File | null,
            paymentMethod: '',
            termsAccepted: false,
        },
    });

    useEffect(() => {
        // Mock API call to fetch franchise data
        const fetchFranchises = async () => {
            const mockFranchises: Franchise[] = [
                {
                    id: 'FR001',
                    storeName: 'ร้าน A',
                    address: '123 ถนนหลัก แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพฯ',
                    packageName: 'แพ็กเกจ 1',
                    ownerName: 'นายสมชาย ใจดี',
                    phoneNumber: '081-234-5678',
                },
                {
                    id: 'FR002',
                    storeName: 'ร้าน B',
                    address: '456 ถนนรอง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพฯ',
                    packageName: 'แพ็กเกจ 2',
                    ownerName: 'นางสาวสมหญิง ใจดี',
                    phoneNumber: '089-876-5432',
                },
            ];

            setFranchises(mockFranchises);
        };

        fetchFranchises();
    }, []);

    const handleSelectFranchise = (id: string) => {
        setSelectedFranchises((prevSelected) =>
            prevSelected.includes(id) ? prevSelected.filter((frId) => frId !== id) : [...prevSelected, id]
        );
    };

    const handleDeleteSelected = () => {
        if (window.confirm('คุณแน่ใจว่าต้องการลบแฟรนไชส์ที่เลือกทั้งหมดหรือไม่?')) {
            setFranchises((prevFranchises) => prevFranchises.filter((fr) => !selectedFranchises.includes(fr.id)));
            setSelectedFranchises([]);
        }
    };

    const handleDeleteFranchise = (id: string) => {
        if (window.confirm('คุณแน่ใจว่าต้องการลบแฟรนไชส์นี้หรือไม่?')) {
            setFranchises((prevFranchises) => prevFranchises.filter((fr) => fr.id !== id));
        }
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, section: string, field: string) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const [errors, setErrors] = useState<{ [key: string]: string }>({}); // State สำหรับเก็บข้อผิดพลาด

const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    const { personalInfo } = formData;

    // ชื่อ-นามสกุล
    if (!personalInfo.name.trim()) {
        newErrors.name = 'กรุณากรอกชื่อ-นามสกุล';
    }

    // เบอร์โทรศัพท์
    if (!personalInfo.phoneNumber.trim()) {
        newErrors.phoneNumber = 'กรุณากรอกเบอร์โทรศัพท์';
    } else if (!/^\d{10}$/.test(personalInfo.phoneNumber)) {
        newErrors.phoneNumber = 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
    }

    // อีเมล
    if (!personalInfo.email.trim()) {
        newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
        newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    // เลขบัตรประชาชน
    if (!personalInfo.idCard.trim()) {
        newErrors.idCard = 'กรุณากรอกเลขบัตรประชาชน';
    } else if (!/^\d{13}$/.test(personalInfo.idCard)) {
        newErrors.idCard = 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
    }

    // Dropdown เฉพาะกรณี
    if (personalInfo.countryCode === '+85') {
        if (!personalInfo.house.trim()) {
            newErrors.house = 'กรุณาเลือกบ้าน';
        }
        if (!personalInfo.city.trim()) {
            newErrors.city = 'กรุณาเลือกเมือง';
        }
        if (!personalInfo.district.trim()) {
            newErrors.district = 'กรุณาเลือกแขวง';
        }
    } else if (personalInfo.countryCode === '+66') {
        if (!personalInfo.postalCode.trim()) {
            newErrors.postalCode = 'กรุณากรอกรหัสไปรษณีย์';
        }
        if (!personalInfo.province.trim()) {
            newErrors.province = 'กรุณาเลือกจังหวัด';
        }
        if (!personalInfo.city.trim()) {
            newErrors.city = 'กรุณาเลือกอำเภอ';
        }
        if (!personalInfo.subDistrict.trim()) {
            newErrors.subDistrict = 'กรุณาเลือกตำบล';
        }
    }

    // ที่อยู่ปัจจุบัน
    if (!personalInfo.address.trim()) {
        newErrors.address = 'กรุณากรอกที่อยู่ปัจจุบัน';
    }

    // อัปโหลดสำเนาบัตรประชาชน
    if (!personalInfo.idCardFile) {
        newErrors.idCardFile = 'กรุณาอัปโหลดสำเนาบัตรประชาชน';
    }

    setErrors(newErrors); // อัปเดต State ข้อผิดพลาด
    return newErrors;
};

const handleNextStep = () => {
    if (currentStep === 1) {
        const validationErrors = validateStep1();
        if (Object.keys(validationErrors).length > 0) {
            return; // หยุดการทำงานถ้ามีข้อผิดพลาด
        }
    }
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
};

    const handleSubmit = () => {
        if (!formData.paymentInfo.termsAccepted) {
            alert('กรุณายอมรับข้อตกลงและเงื่อนไข');
            return;
        }
        alert('สมัครแฟรนไชส์สำเร็จ');
        setIsPopupOpen(false);
        setCurrentStep(1);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">แฟรนไชส์</h1>
            <div className="flex justify-end mb-4">
                {/* ปุ่มลบหลายรายการ */}
                <button
                    onClick={handleDeleteSelected}
                    className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600"
                >
                    ลบ
                </button>
                {/* ปุ่มเพิ่มแฟรนไชส์ */}
                <button
                    onClick={() => setIsPopupOpen(true)} // Open popup
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    เพิ่มแฟรนไชส์
                </button>
            </div>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b text-center">
                            <input
                                type="checkbox"
                                onChange={(e) =>
                                    setSelectedFranchises(e.target.checked ? franchises.map((fr) => fr.id) : [])
                                }
                                checked={selectedFranchises.length === franchises.length}
                            />
                        </th>
                        <th className="py-2 px-4 border-b text-center">ชื่อร้าน</th>
                        <th className="py-2 px-4 border-b text-center">ที่อยู่ร้าน</th>
                        <th className="py-2 px-4 border-b text-center">แพ็กเกจ</th>
                        <th className="py-2 px-4 border-b text-center">ชื่อ-นามสกุล</th>
                        <th className="py-2 px-4 border-b text-center">เบอร์โทรศัพท์</th>
                        <th className="py-2 px-4 border-b text-center">ลบ</th>
                    </tr>
                </thead>
                <tbody>
                    {franchises.map((fr) => (
                        <tr key={fr.id} className="cursor-pointer">
                            <td className="py-2 px-4 border-b text-center">
                                <input
                                    type="checkbox"
                                    checked={selectedFranchises.includes(fr.id)}
                                    onChange={() => handleSelectFranchise(fr.id)}
                                />
                            </td>
                            <td className="py-2 px-4 border-b text-center">{fr.storeName}</td>
                            <td className="py-2 px-4 border-b text-center">{fr.address}</td>
                            <td className="py-2 px-4 border-b text-center">{fr.packageName}</td>
                            <td className="py-2 px-4 border-b text-center">{fr.ownerName}</td>
                            <td className="py-2 px-4 border-b text-center">{fr.phoneNumber}</td>
                            <td className="py-2 px-4 border-b text-center">
                                {/* ปุ่มลบรายการเดียว */}
                                <button
                                    onClick={() => handleDeleteFranchise(fr.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isPopupOpen && (
    <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsPopupOpen(false)}></div>
        <div className="fixed top-0 right-0 h-full w-1/3 bg-white shadow-lg z-50 p-4 overflow-y-auto">
            {currentStep === 1 && (
                <div>
                    <h3 className="text-lg font-bold mb-4">ข้อมูลส่วนตัวผู้สมัคร</h3>
                    <form>
                        {/* ชื่อ-นามสกุล */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.personalInfo.name}
                                onChange={(e) => handleInputChange(e, 'personalInfo', 'name')}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* เบอร์โทรศัพท์ */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                            <div className="flex">
                                <select
                                    value={formData.personalInfo.countryCode}
                                    onChange={(e) => handleInputChange(e, 'personalInfo', 'countryCode')}
                                    className="border border-gray-300 rounded-l px-3 py-2"
                                >
                                    <option value="+85">+85</option>
                                    <option value="+66">+66</option>
                                </select>
                                <input
                                    type="text"
                                    value={formData.personalInfo.phoneNumber}
                                    onChange={(e) => handleInputChange(e, 'personalInfo', 'phoneNumber')}
                                    className="w-full border border-gray-300 rounded-r px-3 py-2"
                                    placeholder="ตัวเลข 10 ตัว"
                                    maxLength={10}
                                    pattern="\d*"
                                    required
                                />
                            </div>
                            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                        </div>

                        {/* อีเมล */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">อีเมล <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                value={formData.personalInfo.email}
                                onChange={(e) => handleInputChange(e, 'personalInfo', 'email')}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {formData.personalInfo.countryCode === '+85' && (
                            <>
                                {/* Dropdown บ้าน */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">บ้าน <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.personalInfo.house}
                                        onChange={(e) => handleInputChange(e, 'personalInfo', 'house')}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        required
                                    >
                                        <option value="">เลือกบ้าน</option>
                                        <option value="บ้าน A">บ้าน A</option>
                                        <option value="บ้าน B">บ้าน B</option>
                                    </select>
                                </div>

                                {/* Dropdown เมือง */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">เมือง <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.personalInfo.city}
                                        onChange={(e) => handleInputChange(e, 'personalInfo', 'city')}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        required
                                    >
                                        <option value="">เลือกเมือง</option>
                                        <option value="เมือง A">เมือง A</option>
                                        <option value="เมือง B">เมือง B</option>
                                    </select>
                                </div>

                                {/* Dropdown แขวง */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">แขวง <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.personalInfo.district}
                                        onChange={(e) => handleInputChange(e, 'personalInfo', 'district')}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        required
                                    >
                                        <option value="">เลือกแขวง</option>
                                        <option value="แขวง A">แขวง A</option>
                                        <option value="แขวง B">แขวง B</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {formData.personalInfo.countryCode === '+66' && (
                            <>
                                {/* Dropdown รหัสไปรษณีย์ */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">รหัสไปรษณีย์ <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.personalInfo.postalCode}
                                        onChange={(e) => handleInputChange(e, 'personalInfo', 'postalCode')}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        placeholder="กรอกรหัสไปรษณีย์"
                                        maxLength={5}
                                        pattern="\d*"
                                        required
                                    />
                                </div>

                                {/* Dropdown จังหวัด */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">จังหวัด <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.personalInfo.province}
                                        onChange={(e) => handleInputChange(e, 'personalInfo', 'province')}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        required
                                    >
                                        <option value="">เลือกจังหวัด</option>
                                        <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                                        <option value="เชียงใหม่">เชียงใหม่</option>
                                    </select>
                                </div>

                                {/* Dropdown อำเภอ */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">อำเภอ <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.personalInfo.city}
                                        onChange={(e) => handleInputChange(e, 'personalInfo', 'city')}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        required
                                    >
                                        <option value="">เลือกอำเภอ</option>
                                        <option value="อำเภอ A">อำเภอ A</option>
                                        <option value="อำเภอ B">อำเภอ B</option>
                                    </select>
                                </div>

                                {/* Dropdown ตำบล */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">ตำบล <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.personalInfo.subDistrict}
                                        onChange={(e) => handleInputChange(e, 'personalInfo', 'subDistrict')}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        required
                                    >
                                        <option value="">เลือกตำบล</option>
                                        <option value="ตำบล A">ตำบล A</option>
                                        <option value="ตำบล B">ตำบล B</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* เลขบัตรประชาชน */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">เลขบัตรประชาชน <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.personalInfo.idCard}
                                onChange={(e) => handleInputChange(e, 'personalInfo', 'idCard')}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                placeholder="ตัวเลข 13 ตัว"
                                maxLength={13}
                                pattern="\d*"
                                required
                            />
                        </div>

                        {/* ที่อยู่ปัจจุบัน */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">ที่อยู่ปัจจุบัน <span className="text-red-500">*</span></label>
                            <textarea
                                value={formData.personalInfo.address}
                                onChange={(e) => handleInputChange(e, 'personalInfo', 'address')}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                rows={3}
                                required
                            ></textarea>
                        </div>

                        {/* อัปโหลดสำเนาบัตรประชาชน */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">อัปโหลดสำเนาบัตรประชาชน <span className="text-red-500">*</span></label>
                            <input
                                type="file"
                                onChange={(e) => handleFileChange(e, 'personalInfo', 'idCardFile')}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                accept="image/*"
                                required
                            />
                            {formData.personalInfo.idCardFile && (
                                <img
                                    src={URL.createObjectURL(formData.personalInfo.idCardFile)}
                                    alt="Preview"
                                    className="mt-2 h-32 object-contain"
                                />
                            )}
                        </div>

                        {/* ปุ่มถัดไป */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                ถัดไป
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    </>
)}
        </div>
    );
};

export default Franchise;