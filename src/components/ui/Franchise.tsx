import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import './css/Form.css'; // Import CSS for styling

interface Franchise {
    id: string;
    fullName: string;
    phoneNumber: string;
    countryCode: string;
    email: string;
    idCard: string;
    address: string;
    uploadedIdCard?: string;
    laosHouse?: string;
    laosCity?: string;
    laosDistrict?: string;
    postalCode?: string;
    province?: string;
    district?: string;
    subDistrict?: string;
    
    storeName?: string;
    storeLaosHouse?: string;
    storeLaosCity?: string;
    storeLaosDistrict?: string;
    storePostalCode?: string;
    storeProvince?: string;
    storeDistrict?: string;
    storeSubDistrict?: string;
    storeAddress?: string;
    storeArea?: string;
    businessExperience?: string;
    investmentBudget?: string;

    selectedPackage?: string;

    paymentProof?: string;
    paymentMethod?: string;
    termsAccepted?: string;
}

const Franchise: React.FC = () => {
    const [franchises, setFranchises] = useState<Franchise[]>([]);
    const [selectedFranchises, setSelectedFranchises] = useState<string[]>([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(null);

    const [formData, setFormData] = useState({
        personalInfo: {
            fullName: '',
            phoneNumber: '',
            email: '',
            idCard: '',
            address: '',
            uploadedIdCard: null as File | string | null,
            countryCode: '+85',
            laosHouse: '',
            laosCity: '',
            laosDistrict: '',
            postalCode: '',
            province: '',
            district: '',
            subDistrict: '',
        },
        businessInfo: {
            storeName: '',
            storeLaosHouse: '',
            storeLaosCity: '',
            storeLaosDistrict: '',
            storePostalCode: '',
            storeProvince: '',
            storeDistrict: '',
            storeSubDistrict: '',
            storeAddress: '',
            storeArea: '',
            businessExperience: '',
            investmentBudget: '',
        },
        packageSelection: {
            selectedPackage: null as string | null,
        },
        paymentInfo: {
            paymentProof: null as File | string | null,
            paymentMethod: '',
            termsAccepted: false,
        },
    });
    
    const [errors, setErrors] = useState<{
        fullName: string;
        phoneNumber: string;
        email: string;
        idCard: string;
        address: string;
        uploadedIdCard?: string;
        laosHouse?: string;
        laosCity?: string;
        laosDistrict?: string;
        postalCode?: string;
        province?: string;
        district?: string;
        subDistrict?: string;
        
        storeName?: string;
        storeLaosHouse?: string;
        storeLaosCity?: string;
        storeLaosDistrict?: string;
        storePostalCode?: string;
        storeProvince?: string;
        storeDistrict?: string;
        storeSubDistrict?: string;
        storeAddress?: string;
        storeArea?: string;
        businessExperience?: string;
        investmentBudget?: string;

        selectedPackage?: string;

        paymentProof?: string;
        paymentMethod?: string;
        termsAccepted?: string;
    }>({
        fullName: '',
        phoneNumber: '',
        email: '',
        idCard: '',
        address: '',
        uploadedIdCard: '',
        laosHouse: '',
        laosCity: '',
        laosDistrict: '',
        postalCode: '',
        province: '',
        district: '',
        subDistrict: '',

        storeName: '',
        storeLaosHouse: '',
        storeLaosCity: '',
        storeLaosDistrict: '',
        storePostalCode: '',
        storeProvince: '',
        storeDistrict: '',
        storeSubDistrict: '',
        storeAddress: '',
        storeArea: '',
        businessExperience: '',
        investmentBudget: '',

        selectedPackage: '',

        paymentProof: '',
        paymentMethod: '',
        termsAccepted: '',
    });

    const resetForm = () => {
        setFormData({
            personalInfo: {
                fullName: '',
                phoneNumber: '',
                email: '',
                idCard: '',
                address: '',
                uploadedIdCard: null,
                countryCode: '+85',
                laosHouse: '',
                laosCity: '',
                laosDistrict: '',
                postalCode: '',
                province: '',
                district: '',
                subDistrict: '',
            },
            businessInfo: {
                storeName: '',
                storeLaosHouse: '',
                storeLaosCity: '',
                storeLaosDistrict: '',
                storePostalCode: '',
                storeProvince: '',
                storeDistrict: '',
                storeSubDistrict: '',
                storeAddress: '',
                storeArea: '',
                businessExperience: '',
                investmentBudget: '',
            },
            packageSelection: {
                selectedPackage: null,
            },
            paymentInfo: {
                paymentProof: null,
                paymentMethod: '',
                termsAccepted: false,
            },
        });
    
        setErrors({
            fullName: '',
            phoneNumber: '',
            email: '',
            idCard: '',
            address: '',
            uploadedIdCard: '',
            laosHouse: '',
            laosCity: '',
            laosDistrict: '',
            postalCode: '',
            province: '',
            district: '',
            subDistrict: '',
            storeName: '',
            storeLaosHouse: '',
            storeLaosCity: '',
            storeLaosDistrict: '',
            storePostalCode: '',
            storeProvince: '',
            storeDistrict: '',
            storeSubDistrict: '',
            storeAddress: '',
            storeArea: '',
            businessExperience: '',
            investmentBudget: '',
            selectedPackage: '',
            paymentProof: '',
            paymentMethod: '',
            termsAccepted: '',
        }); // ล้างข้อความแจ้งเตือนทั้งหมด
    };

    useEffect(() => {
        // Mock API call to fetch franchise data
        const fetchFranchises = async () => {
            const mockFranchises: Franchise[] = [
                {
                    id: 'FR001',
                    fullName: 'สมชาย ใจดี',
                    phoneNumber: '0812345678',
                    countryCode: '+66',
                    email: 'somchai@example.com',
                    idCard: '1234567890123',
                    address: '123 หมู่ 4 ตำบลท่ามะกา อำเภอท่ามะกา จังหวัดกาญจนบุรี',
                    uploadedIdCard: '/img/LOGO500_500_0.jpg',
                    laosHouse: '',
                    laosCity: '',
                    laosDistrict: '',
                    postalCode: '10100',
                    province: 'กรุงเทพมหานคร',
                    district: 'อำเภอ A',
                    subDistrict: 'ตำบล B',
    
                    storeName: 'ร้านสมชายแฟรนไชส์',
                    storeLaosHouse: '',
                    storeLaosCity: '',
                    storeLaosDistrict: '',
                    storePostalCode: '10100',
                    storeProvince: 'กรุงเทพมหานคร',
                    storeDistrict: 'อำเภอ A',
                    storeSubDistrict: 'ตำบล B',
                    storeAddress: '123 หมู่ 4 ตำบลท่ามะกา อำเภอท่ามะกา จังหวัดกาญจนบุรี',
                    storeArea: '50',
                    businessExperience: 'มีประสบการณ์เปิดร้านขายของชำ 5 ปี',
                    investmentBudget: '100000',
    
                    selectedPackage: 'PKG001',
    
                    paymentProof: '/img/LOGO500_500_0.jpg',
                    paymentMethod: 'QR Code',
                    termsAccepted: 'true',
                },
                {
                    id: 'FR002',
                    fullName: 'สมหญิง ใจดี',
                    phoneNumber: '0898765432',
                    countryCode: '+66',
                    email: 'somying@example.com',
                    idCard: '9876543210987',
                    address: '456 หมู่ 2 ตำบลบางรัก อำเภอบางรัก จังหวัดกรุงเทพมหานคร',
                    uploadedIdCard: '/img/LOGO500_500_0.jpg',
                    laosHouse: '',
                    laosCity: '',
                    laosDistrict: '',
                    postalCode: '10110',
                    province: 'กรุงเทพมหานคร',
                    district: 'อำเภอ A',
                    subDistrict: 'ตำบล B',
    
                    storeName: 'ร้านสมหญิงแฟรนไชส์',
                    storeLaosHouse: '',
                    storeLaosCity: '',
                    storeLaosDistrict: '',
                    storePostalCode: '10110',
                    storeProvince: 'กรุงเทพมหานคร',
                    storeDistrict: 'อำเภอ A',
                    storeSubDistrict: 'ตำบล B',
                    storeAddress: '456 หมู่ 2 ตำบลบางรัก อำเภอบางรัก จังหวัดกรุงเทพมหานคร',
                    storeArea: '30',
                    businessExperience: 'ไม่มีประสบการณ์ แต่มีความสนใจในธุรกิจแฟรนไชส์',
                    investmentBudget: '50000',
    
                    selectedPackage: 'PKG002',
    
                    paymentProof: '/img/LOGO500_500_0.jpg',
                    paymentMethod: 'PromptPay',
                    termsAccepted: 'true',
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

    const handleEditFranchise = (franchise: Franchise) => {
        setEditingFranchise(franchise); // เก็บข้อมูลแฟรนไชส์ที่ต้องการแก้ไข
        setFormData({
            personalInfo: {
                fullName: franchise.fullName || '',
                phoneNumber: franchise.phoneNumber || '',
                email: franchise.email || '',
                idCard: franchise.idCard || '',
                address: franchise.address || '',
                uploadedIdCard: franchise.uploadedIdCard || null, // หากต้องการแสดงไฟล์ที่อัปโหลด ต้องจัดการเพิ่มเติม
                countryCode: franchise.countryCode || '',
                laosHouse: franchise.laosHouse || '',
                laosCity: franchise.laosCity || '',
                laosDistrict: franchise.laosDistrict || '',
                postalCode: franchise.postalCode || '',
                province: franchise.province || '',
                district: franchise.district || '',
                subDistrict: franchise.subDistrict || '',
            },
            businessInfo: {
                storeName: franchise.storeName || '',
                storeLaosHouse: franchise.storeLaosHouse || '',
                storeLaosCity: franchise.storeLaosCity || '',
                storeLaosDistrict: franchise.storeLaosDistrict || '',
                storePostalCode: franchise.storePostalCode || '',
                storeProvince: franchise.storeProvince || '',
                storeDistrict: franchise.storeDistrict || '',
                storeSubDistrict: franchise.storeSubDistrict || '',
                storeAddress: franchise.storeAddress || '',
                storeArea: franchise.storeArea || '',
                businessExperience: franchise.businessExperience || '',
                investmentBudget: franchise.investmentBudget || '',
            },
            packageSelection: {
                selectedPackage: franchise.selectedPackage || null,
            },
            paymentInfo: {
                paymentProof: franchise.paymentProof || null, // หากต้องการแสดงไฟล์ที่อัปโหลด ต้องจัดการเพิ่มเติม
                paymentMethod: franchise.paymentMethod || '',
                termsAccepted: franchise.termsAccepted === 'true',
            },
        });
        setIsPopupOpen(true); // เปิด Popup
    };

    const [currentStep, setCurrentStep] = useState(1); // State สำหรับเก็บขั้นตอนปัจจุบัน

    const handleNextStep = () => {
        
        if (currentStep === 1 && !validateStep1()) {
            return; // หยุดการทำงานถ้าข้อมูลไม่ครบ
        }

        if (currentStep === 2 && !validateStep2()) {
            return; // หยุดการทำงานถ้าข้อมูลไม่ครบ
        }

        if (currentStep === 4 && !validateStep4()) {
            return; // หยุดการทำงานถ้าข้อมูลไม่ครบใน Step 4
        }

        if (currentStep < 4) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleSubmit = () => {
        if (!validateStep4()) {
            return; // หยุดการทำงานถ้าข้อมูลไม่ครบใน Step 4
        }
    
        // เปิด Popup ยืนยันการบันทึก
        openEditConfirmation(editingFranchise ? editingFranchise.id : null);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
        section: keyof typeof formData,
        field: string
    ) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    
        // ลบข้อความแจ้งเตือนเมื่อผู้ใช้เริ่มกรอกข้อมูล
        setErrors((prev) => ({
            ...prev,
            [field]: '',
        }));
    };

    const handlePhoneNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        section: keyof typeof formData,
        field: string
    ) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) { // ตรวจสอบว่ามีเฉพาะตัวเลข
            setFormData((prev) => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value,
                },
            }));
    
            // ลบข้อความแจ้งเตือนเมื่อผู้ใช้เริ่มกรอกข้อมูลใหม่
            setErrors((prev) => ({
                ...prev,
                phoneNumber: '', // ลบข้อความแจ้งเตือนของเบอร์โทรศัพท์
            }));
        }
    };

    const handleIdCardChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        section: keyof typeof formData,
        field: string
    ) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) { // ตรวจสอบว่ามีเฉพาะตัวเลข
            setFormData((prev) => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value,
                },
            }));
    
            // ลบข้อความแจ้งเตือนเมื่อผู้ใช้เริ่มกรอกข้อมูลใหม่
            setErrors((prev) => ({
                ...prev,
                idCard: '', // ลบข้อความแจ้งเตือนของเบอร์โทรศัพท์
            }));
        }
    };

    interface Package {
        id: string;
        name: string;
        price: string;
        monthlyFee: string;
        equipment: string;
        services: string;
        coverage: string;
        image: string;
    }
    
    const [packages, setPackages] = useState<Package[]>([]);
    const [loadingPackages, setLoadingPackages] = useState(true);
    
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                // Mock API call
                const mockPackages: Package[] = [
                    {
                        id: 'PKG001',
                        name: 'แพ็กเกจ A',
                        price: '10,000 บาท',
                        monthlyFee: '500 บาท',
                        equipment: 'เครื่อง POS, เครื่องพิมพ์ใบเสร็จ',
                        services: 'บริการหลังการขาย, การฝึกอบรม',
                        coverage: '1 ปี',
                        image: '/img/LOGO500_500_0.jpg',
                    },
                    {
                        id: 'PKG002',
                        name: 'แพ็กเกจ B',
                        price: '20,000 บาท',
                        monthlyFee: '1,000 บาท',
                        equipment: 'เครื่อง POS, เครื่องพิมพ์ใบเสร็จ, ลิ้นชักเก็บเงิน',
                        services: 'บริการหลังการขาย, การฝึกอบรม, การตลาด',
                        coverage: '2 ปี',
                        image: '/img/LOGO500_500_0.jpg',
                    },
                    {
                        id: 'PKG003',
                        name: 'แพ็กเกจ C',
                        price: '30,000 บาท',
                        monthlyFee: '1,500 บาท',
                        equipment: 'เครื่อง POS, เครื่องพิมพ์ใบเสร็จ, ลิ้นชักเก็บเงิน, กล้องวงจรปิด',
                        services: 'บริการหลังการขาย, การฝึกอบรม, การตลาด, การสนับสนุนด้านเทคนิค',
                        coverage: '3 ปี',
                        image: '/img/LOGO500_500_0.jpg',
                    },
                ];
                setPackages(mockPackages);
            } catch (error) {
                console.error('Error fetching packages:', error);
            } finally {
                setLoadingPackages(false);
            }
        };
    
        fetchPackages();
    }, []);

    const handleFileUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        section: keyof typeof formData,
        field: string
    ) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: file,
            },
        }));
    
        // ลบข้อความแจ้งเตือนเมื่อผู้ใช้อัปโหลดไฟล์
        setErrors((prev) => ({
            ...prev,
            [field]: '',
        }));
    };

    const validateStep1 = () => {
        const newErrors: Partial<typeof errors> = {};
    
        if (!formData.personalInfo.fullName.trim()) {
            newErrors.fullName = 'กรุณากรอกชื่อ-นามสกุล';
        }
        if (!formData.personalInfo.phoneNumber.trim()) {
            newErrors.phoneNumber = 'กรุณากรอกเบอร์โทรศัพท์';
        } else if (!/^\d{9,10}$/.test(formData.personalInfo.phoneNumber)) {
            newErrors.phoneNumber = 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
        }
        if (!formData.personalInfo.email.trim()) {
            newErrors.email = 'กรุณากรอกอีเมล';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalInfo.email)) {
            newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
        }
        if (!formData.personalInfo.idCard.trim()) {
            newErrors.idCard = 'กรุณากรอกเลขบัตรประชาชน';
        } else if (!/^\d{13}$/.test(formData.personalInfo.idCard)) {
            newErrors.idCard = 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
        }
        if (!formData.personalInfo.address.trim()) {
            newErrors.address = 'กรุณากรอกที่อยู่ปัจจุบัน';
        }
        if (!formData.personalInfo.uploadedIdCard) {
            newErrors.uploadedIdCard = 'กรุณาอัปโหลดสำเนาบัตรประชาชน';
        }
        if (formData.personalInfo.countryCode === '+85' && !formData.personalInfo.laosHouse.trim()) {
            newErrors.laosHouse = 'กรุณาเลือกบ้าน';
        }
        if (formData.personalInfo.countryCode === '+85' && !formData.personalInfo.laosCity.trim()) {
            newErrors.laosCity = 'กรุณาเลือกเมือง';
        }
        if (formData.personalInfo.countryCode === '+85' && !formData.personalInfo.laosDistrict.trim()) {
            newErrors.laosDistrict = 'กรุณาเลือกแขวง';
        }
        if (formData.personalInfo.countryCode === '+66' && !formData.personalInfo.postalCode.trim()) {
            newErrors.postalCode = 'กรุณาเลือกรหัสไปรษณีย์';
        }
        if (formData.personalInfo.countryCode === '+66' && !formData.personalInfo.province.trim()) {
            newErrors.province = 'กรุณาเลือกจังหวัด';
        }
        if (formData.personalInfo.countryCode === '+66' && !formData.personalInfo.district.trim()) {
            newErrors.district = 'กรุณาเลือกอำเภอ';
        }
        if (formData.personalInfo.countryCode === '+66' && !formData.personalInfo.subDistrict.trim()) {
            newErrors.subDistrict = 'กรุณาเลือกตำบล';
        }
    
        setErrors({
            ...errors,
            ...newErrors,
        });
        return Object.keys(newErrors).length === 0; // ถ้าไม่มี error จะคืนค่า true
    };

    const validateStep2 = () => {
        const newErrors: Partial<typeof errors> = {};
    
        if (!formData.businessInfo.storeName.trim()) {
            newErrors.storeName = 'กรุณากรอกชื่อร้าน/แฟรนไชส์';
        }
        if (formData.personalInfo.countryCode === '+85' && !formData.businessInfo.storeLaosHouse.trim()) {
            newErrors.storeLaosHouse = 'กรุณาเลือกบ้าน';
        }
        if (formData.personalInfo.countryCode === '+85' && !formData.businessInfo.storeLaosCity.trim()) {
            newErrors.storeLaosCity = 'กรุณาเลือกเมือง';
        }
        if (formData.personalInfo.countryCode === '+85' && !formData.businessInfo.storeLaosDistrict.trim()) {
            newErrors.storeLaosDistrict = 'กรุณาเลือกแขวง';
        }
        if (formData.personalInfo.countryCode === '+66' && !formData.businessInfo.storePostalCode.trim()) {
            newErrors.storePostalCode = 'กรุณาเลือกรหัสไปรษณีย์';
        }
        if (formData.personalInfo.countryCode === '+66' && !formData.businessInfo.storeProvince.trim()) {
            newErrors.storeProvince = 'กรุณาเลือกจังหวัด';
        }
        if (formData.personalInfo.countryCode === '+66' && !formData.businessInfo.storeDistrict.trim()) {
            newErrors.storeDistrict = 'กรุณาเลือกอำเภอ';
        }
        if (formData.personalInfo.countryCode === '+66' && !formData.businessInfo.storeSubDistrict.trim()) {
            newErrors.storeSubDistrict = 'กรุณาเลือกตำบล';
        }
        if (!formData.businessInfo.storeAddress.trim()) {
            newErrors.storeAddress = 'กรุณากรอกที่อยู่ร้าน';
        }
        if (!formData.businessInfo.storeArea.trim() || isNaN(Number(formData.businessInfo.storeArea))) {
            newErrors.storeArea = 'กรุณากรอกขนาดพื้นที่ร้านเป็นตัวเลข';
        }
        if (!formData.businessInfo.investmentBudget.trim() || isNaN(Number(formData.businessInfo.investmentBudget))) {
            newErrors.investmentBudget = 'กรุณากรอกงบประมาณที่ต้องการลงทุนเป็นตัวเลข';
        }
    
        setErrors({
            ...errors,
            ...newErrors,
        });
    
        return Object.keys(newErrors).length === 0; // ถ้าไม่มี error จะคืนค่า true
    };

    const validateStep4 = () => {
        const newErrors: Partial<typeof errors> = {};
    
        if (!formData.paymentInfo.paymentProof) {
            newErrors.paymentProof = 'กรุณาอัปโหลดเอกสารการชำระเงิน';
        }
        if (!formData.paymentInfo.paymentMethod) {
            newErrors.paymentMethod = 'กรุณาเลือกระบบการชำระเงิน';
        }
        if (!formData.paymentInfo.termsAccepted) {
            newErrors.termsAccepted = 'กรุณายอมรับข้อตกลงและเงื่อนไข';
        }
    
        setErrors({
            ...errors,
            ...newErrors,
        });
    
        return Object.keys(newErrors).length === 0; // ถ้าไม่มี error จะคืนค่า true
    };

    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        franchiseId: string | null;
    }>({
        isOpen: false,
        franchiseId: null,
    });

    const openDeleteConfirmation = (franchiseId: string) => {
        setDeleteConfirmation({
            isOpen: true,
            franchiseId,
        });
    };

    const confirmDelete = () => {
        if (deleteConfirmation.franchiseId) {
            setFranchises((prevFranchises) =>
                prevFranchises.filter((franchise) => franchise.id !== deleteConfirmation.franchiseId)
            );
        }
        setDeleteConfirmation({
            isOpen: false,
            franchiseId: null,
        });
    };

    const closeDeleteConfirmation = () => {
        setDeleteConfirmation({
            isOpen: false,
            franchiseId: null,
        });
    };
    
    const [deleteSelectedConfirmation, setDeleteSelectedConfirmation] = useState(false);

    const openDeleteSelectedConfirmation = () => {
        setDeleteSelectedConfirmation(true);
    };

    const confirmDeleteSelected = () => {
        setFranchises((prevFranchises) =>
            prevFranchises.filter((fr) => !selectedFranchises.includes(fr.id))
        );
        setSelectedFranchises([]);
        setDeleteSelectedConfirmation(false);
    };

    const closeDeleteSelectedConfirmation = () => {
        setDeleteSelectedConfirmation(false);
    };

    const [editConfirmation, setEditConfirmation] = useState<{
        isOpen: boolean;
        franchiseId: string | null;
    }>({
        isOpen: false,
        franchiseId: null,
    });

    const openEditConfirmation = (franchiseId: string | null) => {
        setEditConfirmation({
            isOpen: true,
            franchiseId,
        });
    };

    const closeEditConfirmation = () => {
        setEditConfirmation({
            isOpen: false,
            franchiseId: null,
        });
    };

    const confirmEdit = () => {
        // รวม countryCode และ phoneNumber
        const fullPhoneNumber = `${formData.personalInfo.countryCode}${formData.personalInfo.phoneNumber}`;
    
        // สร้าง payload สำหรับส่งไปยัง API
        const payload = {
            ...formData,
            personalInfo: {
                ...formData.personalInfo,
                phoneNumber: fullPhoneNumber, // ใช้เบอร์โทรที่รวมแล้ว
                uploadedIdCard:
                    typeof formData.personalInfo.uploadedIdCard === 'string'
                        ? formData.personalInfo.uploadedIdCard // ใช้ URL เดิม
                        : formData.personalInfo.uploadedIdCard?.name,
            },
            paymentInfo: {
                ...formData.paymentInfo,
                paymentProof:
                    typeof formData.paymentInfo.paymentProof === 'string'
                        ? formData.paymentInfo.paymentProof // ใช้ URL เดิม
                        : formData.paymentInfo.paymentProof?.name, // หรือชื่อไฟล์ใหม่
            },
        };
    
        if (editConfirmation.franchiseId) {
            // กำลังแก้ไขข้อมูล
            console.log('Updating Franchise:', payload);
            alert('แก้ไขแฟรนไชส์สำเร็จ!');
        } else {
            // เพิ่มข้อมูลใหม่
            console.log('Creating Franchise:', payload);
            alert('สมัครแฟรนไชส์สำเร็จ!');
        }
    
        setEditConfirmation({
            isOpen: false,
            franchiseId: null,
        });
    
        resetForm(); // ล้างค่าฟอร์มทั้งหมด
        setIsPopupOpen(false); // ปิด Popup
        setCurrentStep(1); // รีเซ็ตขั้นตอนกลับไปที่ Step 1
    };
    

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">แฟรนไชส์</h1>
            <div className="flex justify-end mb-4">
                {/* ปุ่มลบหลายรายการ */}
                <button
                    onClick={openDeleteSelectedConfirmation}
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
                        <th className="py-2 px-4 border-b text-center">แก้ไข</th>
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
                            <td className="py-2 px-4 border-b text-center">{fr.storeAddress}</td>
                            <td className="py-2 px-4 border-b text-center">{fr.selectedPackage}</td>
                            <td className="py-2 px-4 border-b text-center">{fr.fullName}</td>
                            <td className="py-2 px-4 border-b text-center">{fr.phoneNumber}</td>
                            <td className="py-2 px-4 border-b text-center">
                                <button
                                    onClick={() => handleEditFranchise(fr)}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    แก้ไข
                                </button>
                            </td>
                            <td className="py-2 px-4 border-b text-center">
                                {/* ปุ่มลบรายการเดียว */}
                                <button
                                    onClick={() => openDeleteConfirmation(fr.id)}
                                    className="text-red-500 hover:text-red-700"
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
                        onClick={() => {
                            resetForm(); // ล้างค่าฟอร์มทั้งหมด
                            setIsPopupOpen(false); // ปิด Popup
                        }}
                    ></div>

                    {/* Popup */}
                    <div className="fixed top-0 right-0 h-full w-1/3 bg-[#ffff] shadow-lg z-50 p-4 overflow-y-auto"
                        style={{ maxHeight: '100vh' }}>
                        <h2 className="text-xl font-bold mb-4">เพิ่มแฟรนไชส์</h2>

                        <button onClick={() => {resetForm(); setIsPopupOpen(false);}} // Close popup
                            className="absolute top-4 right-4 pt-1 pb-1 pr-3 pl-3 rounded bg-[#E52525] text-[#fff] hover:text-gray-700">
                            ✖
                        </button>
                        
                        {/* Step Form Content */}
                        <div>
                            {currentStep === 1 && (
                                <div >
                                    <h3 className="text-lg font-bold mb-4">ข้อมูลส่วนตัวผู้สมัคร</h3>
                                    {/* ฟอร์มสำหรับกรอกข้อมูลส่วนตัว */}
                                    <div className="mb-2">
                                        <label className="block mb-2">ชื่อ-นามสกุล:</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.personalInfo.fullName}
                                            onChange={(e) => handleInputChange(e, 'personalInfo', 'fullName')}
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="กรอกชื่อ-นามสกุล"
                                            required
                                        />
                                        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                                    </div>
                                    <div className="mb-2">
                                        <label className="block mb-2">เบอร์โทรศัพท์ *</label>
                                        <div className="flex">
                                            <select
                                                name="countryCode"
                                                value={formData.personalInfo.countryCode}
                                                onChange={(e) => handleInputChange(e, 'personalInfo', 'countryCode')}
                                                className="border rounded-l px-3 py-2 bg-gray-100"
                                            >
                                                <option value="+85">+85</option>
                                                <option value="+66">+66</option>
                                            </select>
                                            <input
                                                type="text"
                                                name="phoneNumber"
                                                value={formData.personalInfo.phoneNumber}
                                                onChange={(e) => handlePhoneNumberChange(e, 'personalInfo', 'phoneNumber')}
                                                className="w-full border rounded-r px-3 py-2"
                                                placeholder="กรอกเบอร์โทรศัพท์"
                                                maxLength={10} // จำกัดให้กรอกได้สูงสุด 10 ตัวอักษร
                                                required
                                            />
                                        </div>
                                        {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                                    </div>
                                    <div className="mb-2">
                                        <label className="block mb-2">อีเมล *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.personalInfo.email}
                                            onChange={(e) => handleInputChange(e, 'personalInfo', 'email')}
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="กรอกอีเมล"
                                            required
                                        />
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                    </div>
                                    <div className="mb-2">
                                        <label className="block mb-2">เลขบัตรประชาชน *</label>
                                        <input
                                            type="text"
                                            name="idCard"
                                            value={formData.personalInfo.idCard}
                                            onChange={(e) => handleIdCardChange(e, 'personalInfo', 'idCard')} // ใช้ฟังก์ชันเดียวกับเบอร์โทรศัพท์
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="กรอกเลขบัตรประชาชน"
                                            maxLength={13} // จำกัดให้กรอกได้สูงสุด 13 ตัวอักษร
                                            required
                                        />
                                        {errors.idCard && <p className="text-red-500 text-sm mt-1">{errors.idCard}</p>}
                                    </div>
                                    {formData.personalInfo.countryCode === '+85' && (
                                    <div>
                                        <div className="flex gap-4 mb-2">
                                            <div className="w-1/2">
                                                <label className="block mb-2">บ้าน *</label>
                                                <select
                                                    name="laosHouse"
                                                    value={formData.personalInfo.laosHouse}
                                                    onChange={(e) => handleInputChange(e, 'personalInfo', 'laosHouse')}
                                                    className="w-full border rounded px-3 py-2"
                                                    required
                                                >
                                                    <option value="">เลือกบ้าน</option>
                                                    <option value="บ้าน A">บ้าน A</option>
                                                    <option value="บ้าน B">บ้าน B</option>
                                                    <option value="บ้าน C">บ้าน C</option>
                                                </select>
                                                {errors.laosHouse && <p className="text-red-500 text-sm mt-1">{errors.laosHouse}</p>}
                                            </div>
                                            <div className="w-1/2">
                                                <label className="block mb-2">เมือง *</label>
                                                <select
                                                    name="laosCity"
                                                    value={formData.personalInfo.laosCity}
                                                    onChange={(e) => handleInputChange(e, 'personalInfo', 'laosCity')}
                                                    className="w-full border rounded px-3 py-2"
                                                    required
                                                >
                                                    <option value="">เลือกเมือง</option>
                                                    <option value="เมือง A">เมือง A</option>
                                                    <option value="เมือง B">เมือง B</option>
                                                    <option value="เมือง C">เมือง C</option>
                                                </select>
                                                {errors.laosCity && <p className="text-red-500 text-sm mt-1">{errors.laosCity}</p>}
                                            </div>
                                        </div>
                                        <div className="mb-2">
                                            <label className="block mb-2">แขวง *</label>
                                            <select
                                                name="laosDistrict"
                                                value={formData.personalInfo.laosDistrict}
                                                onChange={(e) => handleInputChange(e, 'personalInfo', 'laosDistrict')}
                                                className="w-full border rounded px-3 py-2"
                                                required
                                            >
                                                <option value="">เลือกแขวง</option>
                                                <option value="แขวง A">แขวง A</option>
                                                <option value="แขวง B">แขวง B</option>
                                                <option value="แขวง C">แขวง C</option>
                                            </select>
                                            {errors.laosDistrict && <p className="text-red-500 text-sm mt-1">{errors.laosDistrict}</p>}
                                        </div>
                                    </div>
                                    )}
                                    {formData.personalInfo.countryCode === '+66' && (
                                        <div>
                                            <div className="flex gap-4 mb-2">
                                                <div className="w-1/2">
                                                    <label className="block mb-2">รหัสไปรษณีย์ *</label>
                                                    <select
                                                        name="postalCode"
                                                        value={formData.personalInfo.postalCode}
                                                        onChange={(e) => handleInputChange(e, 'personalInfo', 'postalCode')}
                                                        className="w-full border rounded px-3 py-2"
                                                        required
                                                    >
                                                        <option value="">เลือกรหัสไปรษณีย์</option>
                                                        <option value="10100">10100</option>
                                                        <option value="10200">10200</option>
                                                        <option value="10300">10300</option>
                                                    </select>
                                                    {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                                                </div>
                                                <div className="w-1/2">
                                                    <label className="block mb-2">จังหวัด *</label>
                                                    <select
                                                        name="province"
                                                        value={formData.personalInfo.province}
                                                        onChange={(e) => handleInputChange(e, 'personalInfo', 'province')}
                                                        className="w-full border rounded px-3 py-2"
                                                        required
                                                    >
                                                        <option value="">เลือกจังหวัด</option>
                                                        <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                                                        <option value="เชียงใหม่">เชียงใหม่</option>
                                                        <option value="ภูเก็ต">ภูเก็ต</option>
                                                    </select>
                                                    {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
                                                </div>
                                            </div>
                                            <div className="flex gap-4 mb-2">
                                                <div className="w-1/2">
                                                    <label className="block mb-2">อำเภอ *</label>
                                                    <select
                                                        name="district"
                                                        value={formData.personalInfo.district}
                                                        onChange={(e) => handleInputChange(e, 'personalInfo', 'district')}
                                                        className="w-full border rounded px-3 py-2"
                                                        required
                                                    >
                                                        <option value="">เลือกอำเภอ</option>
                                                        <option value="อำเภอ A">อำเภอ A</option>
                                                        <option value="อำเภอ B">อำเภอ B</option>
                                                        <option value="อำเภอ C">อำเภอ C</option>
                                                    </select>
                                                    {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                                                </div>
                                                <div className="w-1/2">
                                                    <label className="block mb-2">ตำบล *</label>
                                                    <select
                                                        name="subDistrict"
                                                        value={formData.personalInfo.subDistrict}
                                                        onChange={(e) => handleInputChange(e, 'personalInfo', 'subDistrict')}
                                                        className="w-full border rounded px-3 py-2"
                                                        required
                                                    >
                                                        <option value="">เลือกตำบล</option>
                                                        <option value="ตำบล A">ตำบล A</option>
                                                        <option value="ตำบล B">ตำบล B</option>
                                                        <option value="ตำบล C">ตำบล C</option>
                                                    </select>
                                                    {errors.subDistrict && <p className="text-red-500 text-sm mt-1">{errors.subDistrict}</p>}
                                                </div>
                                            </div>                                            
                                        </div>
                                    )}
                                    <div className="mb-2">
                                        <label className="block mb-2">ที่อยู่ปัจจุบัน *</label>
                                        <textarea
                                            name="address"
                                            value={formData.personalInfo.address}
                                            onChange={(e) => handleInputChange(e, 'personalInfo', 'address')}
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="กรอกที่อยู่ปัจจุบัน"
                                            rows={2}
                                            required
                                        ></textarea>
                                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                    </div>
                                    <div className="mb-2">
                                        <label className="block mb-2">อัปโหลดสำเนาบัตรประชาชน *</label>
                                        <input
                                            type="file"
                                            name="uploadedIdCard"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, 'personalInfo', 'uploadedIdCard')}
                                            className="w-full border rounded px-3 py-2"
                                        />
                                        {formData.personalInfo.uploadedIdCard && (
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-600">ไฟล์ที่อัปโหลด:</p>
                                                <img
                                                    src={
                                                        typeof formData.personalInfo.uploadedIdCard === 'string'
                                                            ? formData.personalInfo.uploadedIdCard // URL ของไฟล์ที่มีอยู่
                                                            : URL.createObjectURL(formData.personalInfo.uploadedIdCard) // ไฟล์ใหม่ที่อัปโหลด
                                                    }
                                                    alt="ตัวอย่างสำเนาบัตรประชาชน"
                                                    className="mt-2 h-50 object-cover border"
                                                />
                                            </div>
                                        )}
                                        {errors.uploadedIdCard && <p className="text-red-500 text-sm mt-1">{errors.uploadedIdCard}</p>}
                                    </div>
                                </div>
                            )}
                            {currentStep === 2 && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4">ข้อมูลธุรกิจ</h3>
                                    {/* ฟอร์มสำหรับกรอกข้อมูลธุรกิจ */}
                                    <div className="mb-2">
                                        <label className="block mb-2">ชื่อร้าน/แฟรนไชส์ที่ต้องการใช้ *</label>
                                        <input
                                            type="text"
                                            name="storeName"
                                            value={formData.businessInfo.storeName}
                                            onChange={(e) => handleInputChange(e, 'businessInfo', 'storeName')}
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="กรอกชื่อร้าน/แฟรนไชส์"
                                            required
                                        />
                                        {errors.storeName && <p className="text-red-500 text-sm mt-1">{errors.storeName}</p>}
                                    </div>
                                    {formData.personalInfo.countryCode === '+85' && (
                                        <div>
                                            <div className="flex gap-4 mb-2">
                                                <div className="w-1/2">
                                                    <label className="block mb-2">บ้าน *</label>
                                                    <select
                                                        name="storeLaosHouse"
                                                        value={formData.businessInfo.storeLaosHouse}
                                                        onChange={(e) => handleInputChange(e, 'businessInfo', 'storeLaosHouse')}
                                                        className="w-full border rounded px-3 py-2"
                                                        required
                                                    >
                                                        <option value="">เลือกบ้าน</option>
                                                        <option value="บ้าน A">บ้าน A</option>
                                                        <option value="บ้าน B">บ้าน B</option>
                                                        <option value="บ้าน C">บ้าน C</option>
                                                    </select>
                                                    {errors.storeLaosHouse && <p className="text-red-500 text-sm mt-1">{errors.storeLaosHouse}</p>}
                                                </div>
                                                <div className="w-1/2">
                                                    <label className="block mb-2">เมือง *</label>
                                                    <select
                                                        name="LaosCity"
                                                        value={formData.businessInfo.storeLaosCity}
                                                        onChange={(e) => handleInputChange(e, 'businessInfo', 'storeLaosCity')}
                                                        className="w-full border rounded px-3 py-2"
                                                        required
                                                    >
                                                        <option value="">เลือกเมือง</option>
                                                        <option value="เมือง A">เมือง A</option>
                                                        <option value="เมือง B">เมือง B</option>
                                                        <option value="เมือง C">เมือง C</option>
                                                    </select>
                                                    {errors.storeLaosCity && <p className="text-red-500 text-sm mt-1">{errors.storeLaosCity}</p>}
                                                </div>
                                            </div>
                                            <div className="mb-2">
                                                <label className="block mb-2">แขวง *</label>
                                                <select
                                                    name="LaosDistrict"
                                                    value={formData.businessInfo.storeLaosDistrict}
                                                    onChange={(e) => handleInputChange(e, 'businessInfo', 'storeLaosDistrict')}
                                                    className="w-full border rounded px-3 py-2"
                                                    required
                                                >
                                                    <option value="">เลือกแขวง</option>
                                                    <option value="แขวง A">แขวง A</option>
                                                    <option value="แขวง B">แขวง B</option>
                                                    <option value="แขวง C">แขวง C</option>
                                                </select>
                                                {errors.storeLaosDistrict && <p className="text-red-500 text-sm mt-1">{errors.storeLaosDistrict}</p>}
                                            </div>
                                        </div>
                                    )}
                                    {formData.personalInfo.countryCode === '+66' && (
                                        <div>
                                            <div className="flex gap-4 mb-2">
                                                <div className="w-1/2">
                                                    <label className="block mb-2">รหัสไปรษณีย์ *</label>
                                                    <select
                                                        name="postalCode"
                                                        value={formData.businessInfo.storePostalCode}
                                                        onChange={(e) => handleInputChange(e, 'businessInfo', 'storePostalCode')}
                                                        className="w-full border rounded px-3 py-2"
                                                        required
                                                    >
                                                        <option value="">เลือกรหัสไปรษณีย์</option>
                                                        <option value="10100">10100</option>
                                                        <option value="10200">10200</option>
                                                        <option value="10300">10300</option>
                                                    </select>
                                                    {errors.storePostalCode && <p className="text-red-500 text-sm mt-1">{errors.storePostalCode}</p>}
                                                </div>
                                                <div className="w-1/2">
                                                    <label className="block mb-2">จังหวัด *</label>
                                                    <select
                                                        name="storeProvince"
                                                        value={formData.businessInfo.storeProvince}
                                                        onChange={(e) => handleInputChange(e, 'businessInfo', 'storeProvince')}
                                                        className="w-full border rounded px-3 py-2"
                                                        required
                                                    >
                                                        <option value="">เลือกจังหวัด</option>
                                                        <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                                                        <option value="เชียงใหม่">เชียงใหม่</option>
                                                        <option value="ภูเก็ต">ภูเก็ต</option>
                                                    </select>
                                                    {errors.storeProvince && <p className="text-red-500 text-sm mt-1">{errors.storeProvince}</p>}
                                                </div>
                                            </div>
                                            <div className="flex gap-4 mb-2">
                                                <div className="w-1/2">
                                                    <label className="block mb-2">อำเภอ *</label>
                                                    <select
                                                        name="storeDistrict"
                                                        value={formData.businessInfo.storeDistrict}
                                                        onChange={(e) => handleInputChange(e, 'businessInfo', 'storeDistrict')}
                                                        className="w-full border rounded px-3 py-2"
                                                        required
                                                    >
                                                        <option value="">เลือกอำเภอ</option>
                                                        <option value="อำเภอ A">อำเภอ A</option>
                                                        <option value="อำเภอ B">อำเภอ B</option>
                                                        <option value="อำเภอ C">อำเภอ C</option>
                                                    </select>
                                                    {errors.storeDistrict && <p className="text-red-500 text-sm mt-1">{errors.storeDistrict}</p>}
                                                </div>
                                                <div className="w-1/2">
                                                    <label className="block mb-2">ตำบล *</label>
                                                    <select
                                                        name="storeSubDistrict"
                                                        value={formData.businessInfo.storeSubDistrict}
                                                        onChange={(e) => handleInputChange(e, 'businessInfo', 'storeSubDistrict')}
                                                        className="w-full border rounded px-3 py-2"
                                                        required
                                                    >
                                                        <option value="">เลือกตำบล</option>
                                                        <option value="ตำบล A">ตำบล A</option>
                                                        <option value="ตำบล B">ตำบล B</option>
                                                        <option value="ตำบล C">ตำบล C</option>
                                                    </select>
                                                    {errors.storeSubDistrict && <p className="text-red-500 text-sm mt-1">{errors.storeSubDistrict}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="mb-2">
                                        <label className="block mb-2">ที่อยู่ร้าน *</label>
                                        <textarea
                                            name="storeAddress"
                                            value={formData.businessInfo.storeAddress}
                                            onChange={(e) => handleInputChange(e, 'businessInfo', 'storeAddress')}
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="กรอกที่อยู่ร้าน"
                                            rows={2}
                                            required
                                        ></textarea>
                                        {errors.storeAddress && <p className="text-red-500 text-sm mt-1">{errors.storeAddress}</p>}
                                    </div>
                                    <div className="mb-2">
                                        <label className="block mb-2">ขนาดพื้นที่ร้าน (ตร.ม.) *</label>
                                        <input
                                            type="number"
                                            name="storeArea"
                                            value={formData.businessInfo.storeArea}
                                            onChange={(e) => handleInputChange(e, 'businessInfo', 'storeArea')}
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="กรอกขนาดพื้นที่ร้าน (ตร.ม.)"
                                            required
                                        />
                                        {errors.storeArea && <p className="text-red-500 text-sm mt-1">{errors.storeArea}</p>}
                                    </div>
                                    <div className="mb-2">
                                        <label className="block mb-2">ประสบการณ์ด้านธุรกิจ/การขนส่ง (ถ้ามี)</label>
                                        <textarea
                                            name="businessExperience"
                                            value={formData.businessInfo.businessExperience}
                                            onChange={(e) => handleInputChange(e, 'businessInfo', 'businessExperience')}
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="กรอกประสบการณ์ด้านธุรกิจ/การขนส่ง (ถ้ามี)"
                                            rows={2}
                                        ></textarea>
                                    </div>
                                    <div className="mb-2">
                                        <label className="block mb-2">งบประมาณที่ต้องการลงทุน *</label>
                                        <input
                                            type="number"
                                            name="investmentBudget"
                                            value={formData.businessInfo.investmentBudget}
                                            onChange={(e) => handleInputChange(e, 'businessInfo', 'investmentBudget')}
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="กรอกงบประมาณที่ต้องการลงทุน"
                                            required
                                        />
                                        {errors.investmentBudget && <p className="text-red-500 text-sm mt-1">{errors.investmentBudget}</p>}
                                    </div>
                                </div>
                            )}
                            {loadingPackages ? (
                                <p className="text-center text-gray-500">กำลังโหลดข้อมูลแพ็กเกจ...</p>
                            ) : (
                                currentStep === 3 && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-4">เลือกแพ็กเกจแฟรนไชส์</h3>
                                        <div className="flex flex-col gap-4">
                                            {packages.map((pkg) => (
                                                <div
                                                    key={pkg.id}
                                                    className={`border rounded-lg shadow-md p-4 flex items-center ${
                                                        formData.packageSelection.selectedPackage === pkg.id ? 'border-blue-500' : 'border-gray-300'
                                                    }`}
                                                >
                                                    {/* รูปภาพ */}
                                                    <img
                                                        src={pkg.image}
                                                        alt={pkg.name}
                                                        className="w-32 h-32 object-cover rounded-md mr-4"
                                                    />

                                                    {/* เนื้อหา */}
                                                    <div className="flex-1 flex flex-col">
                                                        <h4 className="text-lg font-bold mb-2">{pkg.name}</h4>
                                                        <p className="text-sm text-gray-600 mb-1">ราคาขาย: {pkg.price}</p>
                                                        <p className="text-sm text-gray-600 mb-1">ค่าธรรมเนียมรายเดือน: {pkg.monthlyFee}</p>
                                                        <p className="text-sm text-gray-600 mb-1">รายละเอียดอุปกรณ์: {pkg.equipment}</p>
                                                        <p className="text-sm text-gray-600 mb-1">บริการที่รวม: {pkg.services}</p>
                                                        <p className="text-sm text-gray-600 mb-1">ระยะเวลาความคุ้มครอง: {pkg.coverage}</p>

                                                        {/* ปุ่มเลือก */}
                                                        <button
                                                            className={`mt-auto px-4 py-2 rounded ${
                                                                formData.packageSelection.selectedPackage === pkg.id
                                                                    ? 'bg-blue-500 text-white'
                                                                    : 'bg-gray-200 text-gray-700'
                                                            }`}
                                                            onClick={() =>
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    packageSelection: { ...prev.packageSelection, selectedPackage: pkg.id },
                                                                }))
                                                            }
                                                        >
                                                            {formData.packageSelection.selectedPackage === pkg.id ? 'เลือกแล้ว' : 'เลือกแพ็กเกจนี้'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            )}
                            {currentStep === 4 && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4">การชำระเงินและเอกสารแนบ</h3>
                                    {/* ฟอร์มสำหรับการชำระเงินและเอกสารแนบ */}
                                    <div className="mb-2">
                                        <label className="block mb-2">อัปโหลดเอกสารการชำระเงิน *</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, 'paymentInfo', 'paymentProof')}
                                            className="w-full border rounded px-3 py-2"
                                        />
                                        {formData.paymentInfo.paymentProof && (
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-600">ไฟล์ที่อัปโหลด:</p>
                                                <img
                                                    src={
                                                        typeof formData.paymentInfo.paymentProof === 'string'
                                                            ? formData.paymentInfo.paymentProof // URL ของไฟล์ที่มีอยู่
                                                            : URL.createObjectURL(formData.paymentInfo.paymentProof) // ไฟล์ใหม่ที่อัปโหลด
                                                    }
                                                    alt="ตัวอย่างเอกสารการชำระเงิน"
                                                    className="h-50 object-cover border"
                                                />
                                            </div>
                                        )}
                                        {errors.paymentProof && <p className="text-red-500 text-sm mt-1">{errors.paymentProof}</p>}
                                    </div>
                                    <div className="mb-2">
                                        <label className="block mb-2">เลือกระบบการชำระเงิน *</label>
                                        <div className="relative">
                                            <select
                                                name="paymentMethod"
                                                value={formData.paymentInfo.paymentMethod}
                                                onChange={(e) => handleInputChange(e, 'paymentInfo', 'paymentMethod')}
                                                className="w-full border rounded px-3 py-2 appearance-none"
                                                required
                                            >
                                                <option value="" disabled>กรุณาเลือกระบบการชำระเงิน</option>
                                                <option value="QR Code">📱 ผ่าน QR Code</option>
                                                <option value="บัตรเครดิต">💳 บัตรเครดิต</option>
                                                <option value="PromptPay">🏦 PromptPay</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg
                                                    className="w-4 h-4 text-gray-400"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        {errors.paymentMethod && <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="termsAccepted"
                                                checked={formData.paymentInfo.termsAccepted}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        paymentInfo: {
                                                            ...prev.paymentInfo,
                                                            termsAccepted: e.target.checked,
                                                        },
                                                    }))
                                                }
                                                className="mr-2"
                                                required
                                            />
                                            <span>ฉันยอมรับข้อตกลงและเงื่อนไข *</span>
                                        </label>
                                        {errors.termsAccepted && <p className="text-red-500 text-sm mt-1">{errors.termsAccepted}</p>}
                                    </div>
                                                                    </div>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-6">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handlePreviousStep}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    ย้อนกลับ
                                </button>
                            )}
                            {currentStep < 4 && (
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-auto"
                                >
                                    ถัดไป
                                </button>
                            )}
                            {currentStep === 4 && (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-auto"
                                >
                                    {editingFranchise ? 'บันทึก' : 'สมัครแฟรนไชส์'}
                                </button>
                            )}
                        </div>
                    </div> {/* ปิด popup */}
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
                        <p className="mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบแฟรนไชส์นี้?</p>
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
                        <p className="mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบแฟรนไชส์ที่เลือกทั้งหมด?</p>
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
                        <h2 className="text-lg font-bold mb-4">ยืนยันการบันทึก</h2>
                        <p className="mb-6">
                            {editConfirmation.franchiseId
                                ? 'คุณแน่ใจหรือไม่ว่าต้องการบันทึกการแก้ไขแฟรนไชส์นี้?'
                                : 'คุณแน่ใจหรือไม่ว่าต้องการเพิ่มแฟรนไชส์ใหม่?'}
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                onClick={closeEditConfirmation}
                            >
                                ยกเลิก
                            </button>
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                onClick={confirmEdit}
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

export default Franchise;