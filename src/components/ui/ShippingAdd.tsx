import React, { useState, useEffect } from 'react';
import { FaArrowRight } from 'react-icons/fa';
  
  // ข้อมูลนตาราง
  const mockData = [
    {
      parcelNumber: '123456',
      senderReceiver: 'นาย ก./นาย ข.',
      deliveryType: 'ด่วน',
      friendlyPrice: 100.0,
      externalPriceTHB: 200.0,
      externalPriceLAK: 500.0,
      totalPriceTHB: 300.0,
      totalPriceLAK: 700.0,
    },
  ];
  
  // ข้อมูลพนักงาน
  const employeeData = {
    name: 'นาย สมชาย ใจดี',
    positionGroup: 'ผู้จัดการฝ่ายขนส่ง',
    credit : '5000.00',
  };

  // ข้อมูลขนส่งไทย
  const thaiTransporters = [
    { name: 'ไปรษณีย์ไทย', image: '/img/logoShipping/Thaipost.jpg', isActive: false },
    { name: 'SCG Express', image: '/img/logoShipping/scg.png', isActive: false },
    { name: 'DHL', image: '/img/logoShipping/dhl.png', isActive: false },
    { name: 'Ninjavan', image: '/img/logoShipping/ninjavan.png', isActive: false },
    { name: 'Flash Express', image: '/img/logoShipping/flash.jpeg', isActive: true },
    { name: 'Best Express', image: '/img/logoShipping/best.png', isActive: true },
    { name: 'Aramex', image: '/img/logoShipping/aramex.png', isActive: false },
    { name: 'Kerry Express', image: '/img/logoShipping/kerry.png', isActive: false },
    { name: 'Lazada', image: '/img/logoShipping/lazada.png', isActive: false },
    { name: 'Makesend', image: '/img/logoShipping/makesend.png', isActive: false },
    { name: 'SPX Xpress', image: '/img/logoShipping/shopee.jpg', isActive: false },
    { name: 'Lalamove', image: '/img/logoShipping/lalamove.png', isActive: false },
    { name: 'Skootar', image: '/img/logoShipping/skootar.png', isActive: false },
  ];

  // ข้อมูลขนส่งลาว
  const laoTransporters = [
    { name: 'Mixay', image: '/img/logoShipping/Mixay_logo.png', isActive: true },
    { name: 'HAL', image: '/img/logoShipping/HAL_logo.png', isActive: true },
  ];


  // ฟังก์ชันสำหรับใส่เครื่องหมายจุลภาคในตัวเลข
const formatNumberWithCommas = (number: number): string => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const ShippingAdd: React.FC = () => {

    const [countryCode, setCountryCode] = useState<string | null>(null); // สร้าง state สำหรับ countryCode
    const [parcelData, setParcelData] = useState(mockData); // สร้าง state สำหรับข้อมูลพัสดุ
    const [selectedMenu, setSelectedMenu] = useState<string>('parcel'); // ตั้งค่าเริ่มต้นเป็น 'parcel'

    interface ZipDataItem {
      ตำบล: string;
      อำเภอ: string;
      จังหวัด: string;
    }
    
    // Define the ZipData type
    interface ZipData {
      [zipcode: string]: ZipDataItem[];
    }
    
        const [zipData, setZipData] = useState<ZipData>({}); // เก็บข้อมูลรหัสไปรษณีย์

    // ดึงข้อมูลรหัสไปรษณีย์จากไฟล์ JSON
    useEffect(() => {
      fetch('/json/postal_address_data.json')
        .then((res) => res.json())
        .then((data) => setZipData(data));
    }, []);

    const [senderAddressArea, setSenderZipcode] = useState(''); // สร้าง state สำหรับรหัสไปรษณีย์ผู้ส่ง
    const [senderResult, setSenderResult] = useState<ZipDataItem[]>([]); // สร้าง state สำหรับผลลัพธ์การค้นหารหัสไปรษณีย์ผู้ส่ง
    const [receiverAddressArea, setReceiverZipcode] = useState(''); // สร้าง state สำหรับรหัสไปรษณีย์ผู้รับ
    const [receiverResult, setReceiverResult] = useState<ZipDataItem[]>([]); // สร้าง state สำหรับผลลัพธ์การค้นหารหัสไปรษณีย์ผู้รับ
    const [senderZipcodeThaiLaos, setSenderZipcodeThaiLaos] = useState(''); // รหัสไปรษณีย์ผู้ส่ง
    const [senderResultThaiLaos, setSenderResultThaiLaos] = useState<ZipDataItem[]>([]); // ผลลัพธ์การค้นหาผู้ส่ง



    //-----------------------------------------------------------------------//

    useEffect(() => {
      const storedCountryCode = sessionStorage.getItem('countryCode');
      setCountryCode(storedCountryCode);
    }, []);
    
    const [selectedTransporter, setSelectedTransporter] = useState<string | null>(null);
    

    const [deleteConfirmation, setDeleteConfirmation] = useState<{
      isOpen: boolean;
      parcelNumber: string | null;
    }>({
      isOpen: false,
      parcelNumber: null,
    });
    
    //------------------------------ ฟังก์ชันสำหรับค้นหารหัสไปรษณีย์ ------------------------------//

    const handleSenderZipcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setSenderZipcode(inputValue);
    
      if (inputValue in zipData) {
        setSenderResult(zipData[inputValue]);
      } else {
        setSenderResult([]);
      }
    
      // ลบข้อความข้อผิดพลาดเมื่อกรอกข้อมูล
      if (errorsThai.senderAddressArea) {
        setErrorsThai({ ...errorsThai, senderAddressArea: '' });
      }
    };
    
    // ฟังก์ชันสำหรับจัดการการเลือกพื้นที่บริการ (ผู้ส่ง)
    const handleSenderResultSelect = (selectedItem: ZipDataItem) => {
      const selectedZipcode = Object.keys(zipData).find((key) => zipData[key].includes(selectedItem));
      const selectedArea = `${selectedZipcode} ${selectedItem.ตำบล} ${selectedItem.อำเภอ} ${selectedItem.จังหวัด}`;
      setSenderZipcode(selectedArea);
      setFormDataThai({ ...formDataThai, senderAddressAreaThai: selectedArea });
      setSenderResult([]);
    };
    
    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงในช่อง "พื้นที่บริการ (ผู้รับ)"
    const handleReceiverZipcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setReceiverZipcode(inputValue);
    
      if (inputValue in zipData) {
        setReceiverResult(zipData[inputValue]);
      } else {
        setReceiverResult([]);
      }
    
      // ลบข้อความข้อผิดพลาดเมื่อกรอกข้อมูล
      if (errorsThai.receiverAddressArea) {
        setErrorsThai({ ...errorsThai, receiverAddressArea: '' });
      }
    };
    
    // ฟังก์ชันสำหรับจัดการการเลือกพื้นที่บริการ (ผู้รับ)
    const handleReceiverResultSelect = (selectedItem: ZipDataItem) => {
      const selectedZipcode = Object.keys(zipData).find((key) => zipData[key].includes(selectedItem));
      const selectedArea = `${selectedZipcode} ${selectedItem.ตำบล} ${selectedItem.อำเภอ} ${selectedItem.จังหวัด}`;
      setReceiverZipcode(selectedArea);
      setFormDataThai({ ...formDataThai, receiverAddressAreaThai: selectedArea });
      setReceiverResult([]);
    };

    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงในช่อง "รหัสไปรษณีย์ผู้ส่ง"
    const handleSenderZipcodeChangeThaiLaos = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setSenderZipcodeThaiLaos(inputValue);

      if (inputValue in zipData) {
        setSenderResultThaiLaos(zipData[inputValue]);
      } else {
        setSenderResultThaiLaos([]);
      }

      // ลบข้อความข้อผิดพลาดเมื่อกรอกข้อมูล
      if (errorsThaiLaos.senderAddressAreaThaiLaos) {
        setErrorsThaiLaos({ ...errorsThaiLaos, senderAddressAreaThaiLaos: '' });
      }
    };

    // ฟังก์ชันสำหรับจัดการการเลือกพื้นที่บริการ (ผู้ส่ง)
    const handleSenderResultSelectThaiLaos = (selectedItem: ZipDataItem) => {
      const selectedZipcode = Object.keys(zipData).find((key) => zipData[key].includes(selectedItem));
      const selectedArea = `${selectedZipcode} ${selectedItem.ตำบล} ${selectedItem.อำเภอ} ${selectedItem.จังหวัด}`;
      setSenderZipcodeThaiLaos(selectedArea);
      setFormDataThaiLaos({ ...formDataThaiLaos, senderAddressAreaThaiLaos: selectedArea });
      setSenderResultThaiLaos([]);
    };

    //------------------------------ จัดการ Popup ------------------------------//

        const [popupThai, setPopupThai] = useState(false); // สร้าง state สำหรับ Popup ขนส่งไทย

        const [popupThaiLaos, setPopupThaiLaos] = useState(false); // สร้าง state สำหรับ Popup ขนส่งไทย-ลาว
        const [thaiLaosStep, setThaiLaosStep] = useState(1); // เริ่มต้นที่ Step 1
        const [selectedLaoTransporter, setSelectedLaoTransporter] = useState<string | null>(null); // เก็บขนส่งลาวที่เลือก

        const handleSelectLaoTransporter = (transporterName: string) => {
          setSelectedLaoTransporter(transporterName); // บันทึกชื่อขนส่งที่เลือก
        };

        const [popupLaos, setPopupLaos] = useState(false); // สร้าง state สำหรับ Popup ขนส่งลาว

        const [popupLaosThai, setPopupLaosThai] = useState(false); // สร้าง state สำหรับ Popup ขนส่งลาว-ไทย

    //------------------------------ Popup ยืนยันการลบ ------------------------------//

    // ฟังก์ชันเปิด Popup ยืนยันการลบ
    const openDeleteConfirmation = (parcelNumber: string) => {
      setDeleteConfirmation({
        isOpen: true,
        parcelNumber,
      });
    };
    
    // ฟังก์ชันปิด Popup ยืนยันการลบ
    const closeDeleteConfirmation = () => {
      setDeleteConfirmation({
        isOpen: false,
        parcelNumber: null,
      });
    };
    
    // ฟังก์ชันยืนยันการลบพัสดุ
    const confirmDelete = () => {
      if (deleteConfirmation.parcelNumber) {
        const updatedData = parcelData.filter(
          (data) => data.parcelNumber !== deleteConfirmation.parcelNumber
        );
        setParcelData(updatedData); // Update the state with the filtered data
        console.log("ลบพัสดุ:", deleteConfirmation.parcelNumber); // แสดงข้อมูลที่ถูกลบใน console
        setDeleteConfirmation({
          isOpen: false,
          parcelNumber: null,
        });
      }
    };

    //------------------------------ Popup ไทย ------------------------------//

    const [errorsThai, setErrorsThai] = useState<{ [key: string]: string }>({});

    const [formDataThai, setFormDataThai] = useState({
      senderNameThai: '',
      senderPhoneThai: '',
      senderAddressThai: '',
      receiverNameThai: '',
      receiverPhoneThai: '',
      receiverAddressThai: '',
      weightThai: '',
      widthThai: '',
      lengthThai: '',
      heightThai: '',
      productTypeThai: '',
      senderAddressAreaThai: '',
      receiverAddressAreaThai: '',
    });

    // ฟังก์ชันเปิด Popup สำหรับขนส่ง
    const openPopupThai = (transporterName: string) => {
      setSelectedTransporter(transporterName);
      setPopupThai(true);
    };

    // ฟังก์ชันสำหรับการเคลียร์ข้อมูลในฟอร์ม
    const resetFormThai = () => {
      setErrorsThai({
        senderNameThai: '',
        senderPhoneThai: '',
        senderAddressThai: '',
        receiverNameThai: '',
        receiverPhoneThai: '',
        receiverAddressThai: '',
        weightThai: '',
        widthThai: '',
        lengthThai: '',
        heightThai: '',
        productTypeThai: '',
        senderAddressAreaThai: '',
        receiverAddressAreaThai: '',
      });
      setErrorsThai({});
      setSenderZipcode('');
      setReceiverZipcode('');
      setSenderResult([]);
      setReceiverResult([]);
    };

    // ฟังก์ชันปิด Popup
    const closePopupThai = () => {
      setPopupThai(false);
      resetFormThai();
    };

    const validateThaiPopupInputs = () => {
      let isValid = true;
      const newErrors: { [key: string]: string } = {};
    
      // ตรวจสอบว่าทุกช่องต้องกรอก
      if (!formDataThai.senderNameThai) {
        newErrors.senderNameThai = "กรุณากรอกชื่อและนามสกุลผู้ส่ง";
        isValid = false;
      }
      if (!formDataThai.senderPhoneThai) {
        newErrors.senderPhoneThai = "กรุณากรอกเบอร์โทรผู้ส่ง";
        isValid = false;
      } else if (!/^\d+$/.test(formDataThai.senderPhoneThai)) {
        newErrors.senderPhoneThai = "เบอร์โทรต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataThai.senderAddressThai) {
        newErrors.senderAddressThai = "กรุณากรอกที่อยู่ผู้ส่ง";
        isValid = false;
      }
      if (!formDataThai.receiverNameThai) {
        newErrors.receiverNameThai = "กรุณากรอกชื่อและนามสกุลผู้รับ";
        isValid = false;
      }
      if (!formDataThai.receiverPhoneThai) {
        newErrors.receiverPhoneThai = "กรุณากรอกเบอร์โทรผู้รับ";
        isValid = false;
      } else if (!/^\d+$/.test(formDataThai.receiverPhoneThai)) {
        newErrors.receiverPhoneThai = "เบอร์โทรต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataThai.receiverAddressThai) {
        newErrors.receiverAddressThai = "กรุณากรอกที่อยู่ผู้รับ";
        isValid = false;
      }
      if (!formDataThai.weightThai) {
        newErrors.weightThai = "กรุณากรอกน้ำหนัก";
        isValid = false;
      } else if (!/^\d+(\.\d+)?$/.test(formDataThai.weightThai)) {
        newErrors.weightThai = "น้ำหนักต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataThai.widthThai) {
        newErrors.widthThai = "กรุณากรอกความกว้าง";
        isValid = false;
      } else if (!/^\d+$/.test(formDataThai.widthThai)) {
        newErrors.widthThai = "ความกว้างต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataThai.lengthThai) {
        newErrors.lengthThai = "กรุณากรอกความยาว";
        isValid = false;
      } else if (!/^\d+$/.test(formDataThai.lengthThai)) {
        newErrors.lengthThai = "ความยาวต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataThai.heightThai) {
        newErrors.heightThai = "กรุณากรอกความสูง";
        isValid = false;
      } else if (!/^\d+$/.test(formDataThai.heightThai)) {
        newErrors.heightThai = "ความสูงต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataThai.productTypeThai) {
        newErrors.productTypeThai = "กรุณาเลือกประเภทสินค้า";
        isValid = false;
      }
      if (!formDataThai.senderAddressAreaThai) {
        newErrors.senderAddressAreaThai = "กรุณากรอกพื้นที่บริการ (ผู้ส่ง)";
        isValid = false;
      }
      if (!formDataThai.receiverAddressAreaThai) {
        newErrors.receiverAddressAreaThai = "กรุณากรอกพื้นที่บริการ (ผู้รับ)";
        isValid = false;
      }
    
      setErrorsThai(newErrors); // อัปเดต errors
      return isValid;
    };

    const handleThaiInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, fieldName: string) => {
      const { value } = e.target;
    
      // อัปเดตค่าใน formData
      setFormDataThai((prevFormData) => ({
        ...prevFormData,
        [fieldName]: value,
      }));
    
      // ลบข้อความ validate ของช่องที่กำลังกรอก
      if (errorsThai[fieldName]) {
        setErrorsThai((prevErrors) => ({
          ...prevErrors,
          [fieldName]: '',
        }));
      }
    };

    //------------------------------ Popup ไทย-ลาว ------------------------------//

    const [errorsThaiLaos, setErrorsThaiLaos] = useState<{ [key: string]: string }>({});

    const [formDataThaiLaos, setFormDataThaiLaos] = useState({
      senderNameThaiLaos: '',
      senderPhoneThaiLaos: '',
      senderAddressThaiLaos: '',
      receiverNameThaiLaos: '',
      receiverPhoneThaiLaos: '',
      receiverAddressThaiLaos: '',
      receiverHouseThaiLaos: '',
      receiverCityThaiLaos: '',
      receiverDistrictThaiLaos: '',
      weightThaiLaos: '',
      widthThaiLaos: '',
      lengthThaiLaos: '',
      heightThaiLaos: '',
      productTypeThaiLaos: '',
      senderAddressAreaThaiLaos: '',
    });

    // ฟังก์ชันเปิด Popup สำหรับขนส่งไทย-ลาว
    const openPopupThaiLaos = (transporterName: string) => {
      setSelectedTransporter(transporterName);
      setPopupThaiLaos(true);
    };

    // ฟังก์ชันปิด Popup
    const closePopupThaiLaos = () => {
      setPopupThaiLaos(false);
      resetThaiLaosSteps(); // รีเซ็ต Step และฟอร์ม
      resetFormThaiLaos();
    };

    // ฟังก์ชันสำหรับปุ่ม "ถัดไป" ใน Popup ไทย-ลาว
    const goToNextStepThaiLaos = () => {
      setThaiLaosStep((prevStep) => prevStep + 1); // ไปยัง Step ถัดไป
    };
    
    // ฟังก์ชันสำหรับปุ่ม "ย้อนกลับ" ใน Popup ไทย-ลาว
    const goToPreviousStepThaiLaos = () => {
      setThaiLaosStep((prevStep) => prevStep - 1); // ย้อนกลับไปยัง Step ก่อนหน้า
    };
    
    // ฟังก์ชันสำหรับการเคลียร์ step และฟอร์มใน Popup ไทย-ลาว
    const resetThaiLaosSteps = () => {
      setThaiLaosStep(1); // รีเซ็ตกลับไปที่ Step 1
      setSelectedLaoTransporter(null); // ล้างค่าขนส่งลาวที่เลือก
      resetFormThai(); // ล้างฟอร์ม
    };

    // ฟังก์ชันสำหรับการตรวจสอบข้อมูลใน Popup ไทย-ลาว
    const validateThaiLaosPopupInput = () => {
      let isValid = true;
      const newErrors: { [key: string]: string } = {};

      if (!formDataThaiLaos.senderNameThaiLaos) {
        newErrors.senderNameThaiLaos = "กรุณากรอกชื่อและนามสกุลผู้ส่ง";
        isValid = false;
      }
      if (!formDataThaiLaos.senderPhoneThaiLaos) {
        newErrors.senderPhoneThaiLaos = "กรุณากรอกเบอร์โทรผู้ส่ง";
        isValid = false;
      } else if (!/^\d+$/.test(formDataThaiLaos.senderPhoneThaiLaos)) {
        newErrors.senderPhoneThaiLaos = "เบอร์โทรต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataThaiLaos.senderAddressThaiLaos) {
        newErrors.senderAddressThaiLaos = "กรุณากรอกที่อยู่ผู้ส่ง";
        isValid = false;
      }
      if (!formDataThaiLaos.receiverNameThaiLaos) {
        newErrors.receiverNameThaiLaos = "กรุณากรอกชื่อและนามสกุลผู้รับ";
        isValid = false;
      }
      if (!formDataThaiLaos.receiverPhoneThaiLaos) {
        newErrors.receiverPhoneThaiLaos = "กรุณากรอกเบอร์โทรผู้รับ";
        isValid = false;
      } else if (!/^\d+$/.test(formDataThaiLaos.receiverPhoneThaiLaos)) {
        newErrors.receiverPhoneThaiLaos = "เบอร์โทรต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataThaiLaos.receiverAddressThaiLaos) {
        newErrors.receiverAddressThaiLaos = "กรุณากรอกที่อยู่ผู้รับ";
        isValid = false;
      }
      if (!formDataThaiLaos.weightThaiLaos) {
        newErrors.weightThaiLaos = "กรุณากรอกน้ำหนัก";
        isValid = false;
      } else if (!/^\d+(\.\d+)?$/.test(formDataThaiLaos.weightThaiLaos)) {
        newErrors.weightThaiLaos = "น้ำหนักต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataThaiLaos.widthThaiLaos) {
        newErrors.widthThaiLaos = "กรุณากรอกความกว้าง";
        isValid = false;
      } else if (!/^\d+$/.test(formDataThaiLaos.widthThaiLaos)) {
        newErrors.widthThaiLaos = "ความกว้างต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataThaiLaos.lengthThaiLaos) {
        newErrors.lengthThaiLaos = "กรุณากรอกความยาว";
        isValid = false;
      } else if (!/^\d+$/.test(formDataThaiLaos.lengthThaiLaos)) {
        newErrors.lengthThaiLaos = "ความยาวต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataThaiLaos.heightThaiLaos) {
        newErrors.heightThaiLaos = "กรุณากรอกความสูง";
        isValid = false;
      } else if (!/^\d+$/.test(formDataThaiLaos.heightThaiLaos)) {
        newErrors.heightThaiLaos = "ความสูงต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataThaiLaos.productTypeThaiLaos) {
        newErrors.productTypeThaiLaos = "กรุณาเลือกประเภทสินค้า";
        isValid = false;
      }
      if (!formDataThaiLaos.senderAddressAreaThaiLaos) {
        newErrors.senderAddressAreaThaiLaos = "กรุณากรอกพื้นที่บริการ (ผู้ส่ง)";
        isValid = false;
      }
      if (!formDataThaiLaos.receiverHouseThaiLaos) {
        newErrors.receiverHouseThaiLaos = "กรุณากรอกบ้านผ";
        isValid = false;
      }
      if (!formDataThaiLaos.receiverCityThaiLaos) {
        newErrors.receiverCityThaiLaos = "กรุณากรอกเมือง";
        isValid = false;
      }
      if (!formDataThaiLaos.receiverDistrictThaiLaos) {
        newErrors.receiverDistrictThaiLaos = "กรุณากรอกแขวง";
        isValid = false;
      }
    
      setErrorsThaiLaos(newErrors); // อัปเดต errors
      return isValid;
    };

    const handleThaiLaosInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
      fieldName: string
    ) => {
      const { value } = e.target;
    
      // อัปเดตค่าใน formDataThaiLaos
      setFormDataThaiLaos((prevFormData) => ({
        ...prevFormData,
        [fieldName]: value,
      }));
    
      // ลบข้อความแจ้งเตือนของฟิลด์ที่กำลังกรอก
      if (errorsThaiLaos[fieldName]) {
        setErrorsThaiLaos((prevErrors) => ({
          ...prevErrors,
          [fieldName]: '',
        }));
      }
    };

    const resetFormThaiLaos = () => {
      setErrorsThaiLaos({}); // ล้างข้อความแจ้งเตือน
      setFormDataThaiLaos({
        senderNameThaiLaos: '',
        senderPhoneThaiLaos: '',
        senderAddressThaiLaos: '',
        receiverNameThaiLaos: '',
        receiverPhoneThaiLaos: '',
        receiverAddressThaiLaos: '',
        receiverHouseThaiLaos: '',
        receiverCityThaiLaos: '',
        receiverDistrictThaiLaos: '',
        weightThaiLaos: '',
        widthThaiLaos: '',
        lengthThaiLaos: '',
        heightThaiLaos: '',
        productTypeThaiLaos: '',
        senderAddressAreaThaiLaos: '',
      }); // ล้างข้อมูลในฟอร์ม
      setSenderZipcodeThaiLaos(''); // ล้างรหัสไปรษณีย์ผู้ส่ง
      setSenderResultThaiLaos([]); // ล้างผลลัพธ์การค้นหาผู้ส่ง
      setThaiLaosStep(1); // รีเซ็ตขั้นตอนกลับไปที่ Step 1
      setSelectedLaoTransporter(null); // ล้างค่าขนส่งลาวที่เลือก
    };

    //------------------------------ Popup ลาว ------------------------------//

    const [errorsLaos, setErrorsLaos] = useState<{ [key: string]: string }>({});

    const [formDataLaos, setFormDataLaos] = useState({
      senderNameLaos: '',
      senderPhoneLaos: '',
      senderAddressLaos: '',
      senderHouseLaos: '',
      senderCityLaos: '',
      senderDistrictLaos: '',
      receiverNameLaos: '',
      receiverPhoneLaos: '',
      receiverAddressLaos: '',
      receiverHouseLaos: '',
      receiverCityLaos: '',
      receiverDistrictLaos: '',
      weightLaos: '',
      widthLaos: '',
      lengthLaos: '',
      heightLaos: '',
      productTypeLaos: '',
    });

    // ฟังก์ชันเปิด Popup สำหรับขนส่งไทย-ลาว
    const openPopupLaos = (transporterName: string) => {
      setSelectedTransporter(transporterName);
      setPopupLaos(true);
    };

    // ฟังก์ชันปิด Popup
    const closePopupLaos = () => {
      setPopupLaos(false);
    };

    const validateLaosPopupInputs = () => {
      let isValid = true;
      const newErrors: { [key: string]: string } = {};
    
      // ตรวจสอบว่าทุกช่องต้องกรอก
      if (!formDataLaos.senderNameLaos) {
        newErrors.senderNameLaos = "กรุณากรอกชื่อและนามสกุลผู้ส่ง";
        isValid = false;
      }
      if (!formDataLaos.senderPhoneLaos) {
        newErrors.senderPhoneLaos = "กรุณากรอกเบอร์โทรผู้ส่ง";
        isValid = false;
      } else if (!/^\d+$/.test(formDataLaos.senderPhoneLaos)) {
        newErrors.senderPhoneLaos = "เบอร์โทรต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataLaos.senderAddressLaos) {
        newErrors.senderAddressLaos = "กรุณากรอกที่อยู่ผู้ส่ง";
        isValid = false;
      }
      if (!formDataLaos.senderHouseLaos) {
        newErrors.senderHouseLaos = "กรุณากรอกบ้าน";
        isValid = false;
      }
      if (!formDataLaos.senderCityLaos) {
        newErrors.senderCityLaos = "กรุณากรอกเมือง";
        isValid = false;
      }
      if (!formDataLaos.senderDistrictLaos) {
        newErrors.senderDistrictLaos = "กรุณากรอกแขวง";
        isValid = false;
      }
      if (!formDataLaos.receiverNameLaos) {
        newErrors.receiverNameLaos = "กรุณากรอกชื่อและนามสกุลผู้รับ";
        isValid = false;
      }
      if (!formDataLaos.receiverPhoneLaos) {
        newErrors.receiverPhoneLaos = "กรุณากรอกเบอร์โทรผู้รับ";
        isValid = false;
      } else if (!/^\d+$/.test(formDataLaos.receiverPhoneLaos)) {
        newErrors.receiverPhoneLaos = "เบอร์โทรต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataLaos.receiverAddressLaos) {
        newErrors.receiverAddressLaos = "กรุณากรอกที่อยู่";
        isValid = false;
      }
      if (!formDataLaos.receiverHouseLaos) {
        newErrors.receiverHouseLaos = "กรุณากรอกบ้าน";
        isValid = false;
      }
      if (!formDataLaos.receiverCityLaos) {
        newErrors.receiverCityLaos = "กรุณากรอกเมือง";
        isValid = false;
      }
      if (!formDataLaos.receiverDistrictLaos) {
        newErrors.receiverDistrictLaos = "กรุณากรอกแขวงผู้รับ";
        isValid = false;
      }
      if (!formDataLaos.productTypeLaos) {
        newErrors.productTypeLaos = "กรุณาเลือกประเภทสินค้า";
        isValid = false;
      }
      if (!formDataLaos.weightLaos) {
        newErrors.weightLaos = "กรุณากรอกน้ำหนัก";
        isValid = false;
      } else if (!/^\d+(\.\d+)?$/.test(formDataLaos.weightLaos)) {
        newErrors.weightLaos = "น้ำหนักต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataLaos.widthLaos) {
        newErrors.widthLaos = "กรุณากรอกความกว้าง";
        isValid = false;
      } else if (!/^\d+$/.test(formDataLaos.widthLaos)) {
        newErrors.widthLaos = "ความกว้างต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataLaos.lengthLaos) {
        newErrors.lengthLaos = "กรุณากรอกความยาว";
        isValid = false;
      } else if (!/^\d+$/.test(formDataLaos.lengthLaos)) {
        newErrors.lengthLaos = "ความยาวต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataLaos.heightLaos) {
        newErrors.heightLaos = "กรุณากรอกความสูง";
        isValid = false;
      } else if (!/^\d+$/.test(formDataLaos.heightLaos)) {
        newErrors.heightLaos = "ความสูงต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
    
      setErrorsLaos(newErrors); // อัปเดต errors
      return isValid;
    };

    const handleLaosInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
      fieldName: string
    ) => {
      const { value } = e.target;
    
      // อัปเดตค่าใน formDataLaos
      setFormDataLaos((prevFormData) => ({
        ...prevFormData,
        [fieldName]: value,
      }));
    
      // ลบข้อความแจ้งเตือนของฟิลด์ที่กำลังกรอก
      if (errorsLaos[fieldName]) {
        setErrorsLaos((prevErrors) => ({
          ...prevErrors,
          [fieldName]: '',
        }));
      }
    };

    // ฟังก์ชันสำหรับการเคลียร์ข้อมูลในฟอร์ม
    const resetFormLaos = () => {
      // ล้างข้อความแจ้งเตือน
      setErrorsLaos({});
    
      // ล้างค่าฟอร์ม
      setFormDataLaos({
        senderNameLaos: '',
        senderPhoneLaos: '',
        senderAddressLaos: '',
        senderHouseLaos: '',
        senderCityLaos: '',
        senderDistrictLaos: '',
        receiverNameLaos: '',
        receiverPhoneLaos: '',
        receiverAddressLaos: '',
        receiverHouseLaos: '',
        receiverCityLaos: '',
        receiverDistrictLaos: '',
        weightLaos: '',
        widthLaos: '',
        lengthLaos: '',
        heightLaos: '',
        productTypeLaos: '',
      });
    };

    //------------------------------ Popup ลาว-ไทย ------------------------------//

    // ฟังก์ชันเปิด Popup สำหรับขนส่งไทย-ลาว
    const openPopupLaosThai = (transporterName: string) => {
      setSelectedTransporter(transporterName);
      setPopupLaosThai(true);
    };

    // State สำหรับ popupLaosThai
    const [laosThaiStep, setLaosThaiStep] = useState(1); // เริ่มต้นที่ Step 1
    const [selectedThaiTransporter, setSelectedThaiTransporter] = useState<string | null>(null); // ขนส่งไทยที่เลือก

    const [errorsLaosThai, setErrorsLaosThai] = useState<{ [key: string]: string }>({});

    const [formDataLaosThai, setFormDataLaosThai] = useState({
      senderNameLaosThai: '',
      senderPhoneLaosThai: '',
      senderAddressLaosThai: '',
      senderHouseLaosThai: '',
      senderCityLaosThai: '',
      senderDistrictLaosThai: '',
      receiverNameLaosThai: '',
      receiverPhoneLaosThai: '',
      receiverAddressLaosThai: '',
      receiverAddressAreaLaosThai: '',
      productTypeLaosThai: '',
      weightLaosThai: '',
      widthLaosThai: '',
      lengthLaosThai: '',
      heightLaosThai: '',
    });

    // ฟังก์ชันสำหรับเลือกขนส่งไทย
    const handleSelectThaiTransporter = (transporterName: string) => {
      setSelectedThaiTransporter(transporterName); // บันทึกชื่อขนส่งที่เลือก
    };

    // ฟังก์ชันสำหรับเปลี่ยนขั้นตอนใน popupLaosThai
    const goToNextStepLaosThai = () => {
      setLaosThaiStep((prevStep) => prevStep + 1); // ไปยัง Step ถัดไป
    };

    const goToPreviousStepLaosThai = () => {
      setLaosThaiStep((prevStep) => prevStep - 1); // ย้อนกลับไปยัง Step ก่อนหน้า
    };

    // ฟังก์ชันสำหรับปิด popupLaosThai
    const closePopupLaosThai = () => {
      setPopupLaosThai(false); // ปิด popup
      setLaosThaiStep(1); // รีเซ็ตขั้นตอนกลับไปที่ Step 1
      setSelectedThaiTransporter(null); // ล้างค่าขนส่งไทยที่เลือก
      resetFormLaosThai(); // ล้างค่าฟอร์ม
    };

    const validateLaosThaiPopupInputs = () => {
      let isValid = true;
      const newErrors: { [key: string]: string } = {};
    
      // ตรวจสอบว่าทุกช่องต้องกรอก
      if (!formDataLaosThai.senderNameLaosThai) {
        newErrors.senderNameLaosThai = "กรุณากรอกชื่อและนามสกุลผู้ส่ง";
        isValid = false;
      }
      if (!formDataLaosThai.senderPhoneLaosThai) {
        newErrors.senderPhoneLaosThai = "กรุณากรอกเบอร์โทรผู้ส่ง";
        isValid = false;
      } else if (!/^\d+$/.test(formDataLaosThai.senderPhoneLaosThai)) {
        newErrors.senderPhoneLaosThai = "เบอร์โทรต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataLaosThai.senderAddressLaosThai) {
        newErrors.senderAddressLaosThai = "กรุณากรอกที่อยู่ผู้ส่ง";
        isValid = false;
      }
      if (!formDataLaosThai.senderHouseLaosThai) {
        newErrors.senderHouseLaosThai = "กรุณากรอกบ้าน";
        isValid = false;
      }
      if (!formDataLaosThai.senderCityLaosThai) {
        newErrors.senderCityLaosThai = "กรุณากรอกเมือง";
        isValid = false;
      }
      if (!formDataLaosThai.senderDistrictLaosThai) {
        newErrors.senderDistrictLaosThai = "กรุณากรอกแขวง";
        isValid = false;
      }
      if (!formDataLaosThai.receiverNameLaosThai) {
        newErrors.receiverNameLaosThai = "กรุณากรอกชื่อและนามสกุลผู้รับ";
        isValid = false;
      }
      if (!formDataLaosThai.receiverPhoneLaosThai) {
        newErrors.receiverPhoneLaosThai = "กรุณากรอกเบอร์โทรผู้รับ";
        isValid = false;
      } else if (!/^\d+$/.test(formDataLaosThai.receiverPhoneLaosThai)) {
        newErrors.receiverPhoneLaosThai = "เบอร์โทรต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataLaosThai.receiverAddressLaosThai) {
        newErrors.receiverAddressLaosThai = "กรุณากรอกที่อยู่ผู้รับ";
        isValid = false;
      }
      if (!formDataLaosThai.receiverAddressAreaLaosThai) {
        newErrors.receiverAddressAreaLaosThai = "กรุณากรอกพื้นที่บริการ (ผู้รับ)";
        isValid = false;
      }
      if (!formDataLaosThai.productTypeLaosThai) {
        newErrors.productTypeLaosThai = "กรุณาเลือกประเภทสินค้า";
        isValid = false;
      }
      if (!formDataLaosThai.weightLaosThai) {
        newErrors.weightLaosThai = "กรุณากรอกน้ำหนัก";
        isValid = false;
      } else if (!/^\d+(\.\d+)?$/.test(formDataLaosThai.weightLaosThai)) {
        newErrors.weightLaosThai = "น้ำหนักต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataLaosThai.widthLaosThai) {
        newErrors.widthLaosThai = "กรุณากรอกความกว้าง";
        isValid = false;
      } else if (!/^\d+$/.test(formDataLaosThai.widthLaosThai)) {
        newErrors.widthLaosThai = "ความกว้างต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataLaosThai.lengthLaosThai) {
        newErrors.lengthLaosThai = "กรุณากรอกความยาว";
        isValid = false;
      } else if (!/^\d+$/.test(formDataLaosThai.lengthLaosThai)) {
        newErrors.lengthLaosThai = "ความยาวต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
      if (!formDataLaosThai.heightLaosThai) {
        newErrors.heightLaosThai = "กรุณากรอกความสูง";
        isValid = false;
      } else if (!/^\d+$/.test(formDataLaosThai.heightLaosThai)) {
        newErrors.heightLaosThai = "ความสูงต้องเป็นตัวเลขเท่านั้น";
        isValid = false;
      }
    
      setErrorsLaosThai(newErrors); // อัปเดต errors
      return isValid;
    };

    const handleLaosThaiInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
      fieldName: string
    ) => {
      const { value } = e.target;
    
      // อัปเดตค่าใน formData
      setFormDataLaosThai((prevFormData) => ({
        ...prevFormData,
        [fieldName]: value,
      }));
    
      // ลบข้อความแจ้งเตือนของฟิลด์ที่กำลังกรอก
      if (errorsLaosThai[fieldName]) {
        setErrorsLaosThai((prevErrors) => ({
          ...prevErrors,
          [fieldName]: '',
        }));
      }
    };

    const resetFormLaosThai = () => {
      // ล้างข้อความแจ้งเตือน
      setErrorsLaosThai({});
    
      // ล้างค่าฟอร์ม
      setFormDataLaosThai({
        senderNameLaosThai: '',
        senderPhoneLaosThai: '',
        senderAddressLaosThai: '',
        senderHouseLaosThai: '',
        senderCityLaosThai: '',
        senderDistrictLaosThai: '',
        receiverNameLaosThai: '',
        receiverPhoneLaosThai: '',
        receiverAddressLaosThai: '',
        receiverAddressAreaLaosThai: '',
        productTypeLaosThai: '',
        weightLaosThai: '',
        widthLaosThai: '',
        lengthLaosThai: '',
        heightLaosThai: '',
      });
    
      // รีเซ็ตขั้นตอนกลับไปที่ Step 1
      setLaosThaiStep(1);
    
      // ล้างค่าขนส่งไทยที่เลือก
      setSelectedThaiTransporter(null);
    };

  return (
    <div className="grid grid-cols-6 gap-4 p-4 h-full overflow-hidden">
      {/* Left Column */}
      <div className="col-span-4 space-y-4">
        {/* Row 1: Employee Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-[16px] font-bold">ข้อมูลพนักงาน</h2>
          <p className="text-[13px]">
            ชื่อพนักงาน : <span className="pr-5">{employeeData.name}</span> 
            ตำแหน่ง : <span className="pr-5">{employeeData.positionGroup}</span> 
            <span className="font-medium text-[#E52525]">
              ยอดคงเหลือ : {formatNumberWithCommas(parseFloat(employeeData.credit))} บาท
            </span>
          </p>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-3 gap-4">
          {/* Part 1: Outstanding Amount */}
          <div className="bg-white p-4 rounded-lg shadow col-span-3">
            <h2 className="text-lg font-bold">ยอดที่ต้องชำระ</h2>
            <p className="text-4xl font-medium text-right">
              {formatNumberWithCommas(2000)} บาท
            </p>
          </div>

          {/* Part 2: Table */}
          <div className="col-span-3 bg-white rounded-lg shadow h-64 overflow-y-auto h-[400px]">
            <table className="table-auto w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-[#E52525] text-white z-10 ">
                <tr>
                  <th className="px-4 py-2 border">เลขพัสดุ</th>
                  <th className="px-4 py-2 border">ลายชื่อ ผู้ส่ง/ผู้รับ</th>
                  <th className="px-4 py-2 border">การจัดส่ง</th>
                  <th className="px-4 py-2 border">ราคาขนส่งมิตรถาพ</th>
                  <th className="px-4 py-2 border">ราคาขนส่งภายนอก THB</th>
                  <th className="px-4 py-2 border">ราคาขนส่งภายนอก LAK</th>
                  <th className="px-4 py-2 border">ราคารวม THB</th>
                  <th className="px-4 py-2 border">ราคารวม LAK</th>
                  <th className="px-4 py-2 border">ลบ</th>
                </tr>
              </thead>
              <tbody>
                {parcelData.map((data, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border">{data.parcelNumber}</td>
                    <td className="px-4 py-2 border">{data.senderReceiver}</td>
                    <td className="px-4 py-2 border">{data.deliveryType}</td>
                    <td className="px-4 py-2 border">{formatNumberWithCommas(data.friendlyPrice)}</td>
                    <td className="px-4 py-2 border">{formatNumberWithCommas(data.externalPriceTHB)}</td>
                    <td className="px-4 py-2 border">{formatNumberWithCommas(data.externalPriceLAK)}</td>
                    <td className="px-4 py-2 border">{formatNumberWithCommas(data.totalPriceTHB)}</td>
                    <td className="px-4 py-2 border">{formatNumberWithCommas(data.totalPriceLAK)}</td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => openDeleteConfirmation(data.parcelNumber)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Part 3: Total */}
            <div className="col-span-3 bg-[#E52525] text-white p-4 rounded-t-lg shadow fixed bottom-0 left-[250px] w-[52%] z-10">
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="font-bold">ยอดรวม (ราคาขนส่งมิตรถาพ)</p>
                        <p className="font-medium">{formatNumberWithCommas(2000)} บาท</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold">ยอดรวม (ราคารวม THB)</p>
                        <p className="font-medium">{formatNumberWithCommas(2000)} บาท</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold">ยอดรวม (ราคารวม LAK)</p>
                        <p className="font-medium">{formatNumberWithCommas(50000)}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="col-span-2 bg-white p-1 rounded-lg shadow">
        <div className="flex space-x-2">
          {/* ปุ่มเลือกประเภทงาน */}
          <button
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              selectedMenu === 'parcel'
                ? 'bg-blue-500 text-white flex-grow'
                : 'bg-gray-200 text-black'
            }`}
            onClick={() => setSelectedMenu('parcel')}
          >
            งานพัสดุ
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              selectedMenu === 'other'
                ? 'bg-blue-500 text-white flex-grow'
                : 'bg-gray-200 text-black'
            }`}
            onClick={() => setSelectedMenu('other')}
          >
            สินค้าอื่น
          </button>
        </div>

        {/* แสดงปุ่มชั้นถัดไปตามเมนูที่เลือก */}
        <div className="mt-1">
          {selectedMenu === 'parcel' ? (
            <div className="flex flex-col space-y-4">
              {countryCode === '+66' ? (
                <div className="flex space-x-4">
                <button
                  className={`w-1/2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 ${
                    selectedTransporter === 'thai' ? 'border-2 border-green-700' : ''
                  }`}
                  onClick={() => setSelectedTransporter('thai')}
                >
                  ขนส่งไทย
                </button>
                <button
                  className={`w-1/2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 ${
                    selectedTransporter === 'thai-lao' ? 'border-2 border-green-700' : ''
                  }`}
                  onClick={() => setSelectedTransporter('thai-lao')}
                >
                  ขนส่งไทย - ลาว
                </button>
              </div>
              ) : countryCode === '+85' ? (
                <div className="flex space-x-4">
                  <button
                    className={`w-1/2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 ${
                      selectedTransporter === 'lao' ? 'border-2 border-green-700' : ''
                    }`}
                    onClick={() => setSelectedTransporter('lao')}
                  >
                    ขนส่งลาว
                  </button>
                  <button
                    className={`w-1/2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 ${
                      selectedTransporter === 'lao-thai' ? 'border-2 border-green-700' : ''
                    }`}
                    onClick={() => setSelectedTransporter('lao-thai')}
                  >
                    ขนส่งลาว - ไทย
                  </button>
                </div>
              ) : (
                <p className="text-red-500">ไม่พบข้อมูลประเทศ</p>
              )}
            </div>
          ) : selectedMenu === 'other' ? (
            <div className="flex space-x-4">
              <button className="w-1/2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 active:bg-yellow-700">
                เมนูสินค้าอื่น 1
              </button>
              <button className="w-1/2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 active:bg-yellow-700">
                เมนูสินค้าอื่น 2
              </button>
            </div>
          ) : (
            <p className="text-gray-500">กรุณาเลือกเมนูด้านบน</p>
          )}
        </div>

        {/* แสดงรายชื่อขนส่งในไทย */}
        {selectedTransporter === 'thai' && (
          <div className="mt-4 grid grid-cols-3 gap-4 h-[560px] overflow-y-scroll bg-gray-50 p-2 rounded-lg shadow-inner">
            {thaiTransporters.map((transporter, index) => (
              <div
                key={index}
                className={`relative p-2 rounded-lg shadow flex flex-col items-center transition-all duration-300 ${
                  transporter.isActive
                    ? 'bg-white hover:bg-gray-200 cursor-pointer'
                    : 'bg-gray-500 cursor-not-allowed'
                }`}
                onClick={() => transporter.isActive && openPopupThai(transporter.name)}
              >
                {/* รูปภาพ */}
                <img
                  src={transporter.image}
                  alt={transporter.name}
                  className={`object-cover rounded-lg mb-2 w-24 h-24 ${
                    transporter.isActive ? 'opacity-100' : 'opacity-50'
                  }`}
                  draggable="false"
                />
                {/* ชื่อขนส่ง */}
                <p
                  className={`text-[13px] font-bold ${
                    transporter.isActive ? 'text-black' : 'text-gray-500'
                  }`}
                >
                  {transporter.name}
                </p>
                {/* Overlay สำหรับสถานะปิดใช้งาน */}
                {!transporter.isActive && (
                  <div className="absolute inset-0 bg-gray-400 bg-opacity-50 rounded-lg"></div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* แสดงรายชื่อขนส่งในไทย-ลาว */}
        {selectedTransporter === 'thai-lao' && (
          <div className="mt-4 grid grid-cols-3 gap-4 h-[560px] overflow-y-scroll bg-gray-50 p-2 rounded-lg shadow-inner">
            {thaiTransporters.map((transporter, index) => (
              <div
                key={index}
                className={`relative p-2 rounded-lg shadow flex flex-col items-center transition-all duration-300 ${
                  transporter.isActive
                    ? 'bg-white hover:bg-gray-200 cursor-pointer'
                    : 'bg-gray-500 cursor-not-allowed'
                }`}
                onClick={() => transporter.isActive && openPopupThaiLaos(transporter.name)}
              >
                {/* รูปภาพ */}
                <img
                  src={transporter.image}
                  alt={transporter.name}
                  className={`object-cover rounded-lg mb-2 w-24 h-24 ${
                    transporter.isActive ? 'opacity-100' : 'opacity-50'
                  }`}
                  draggable="false"
                />
                {/* ชื่อขนส่ง */}
                <p
                  className={`text-[13px] font-bold ${
                    transporter.isActive ? 'text-black' : 'text-gray-500'
                  }`}
                >
                  {transporter.name}
                </p>
                {/* Overlay สำหรับสถานะปิดใช้งาน */}
                {!transporter.isActive && (
                  <div className="absolute inset-0 bg-gray-400 bg-opacity-50 rounded-lg"></div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* แสดงรายชื่อขนส่งในลาว */}
        {selectedTransporter === 'lao' && (
          <div className="mt-4 grid grid-cols-3 gap-4 h-[560px] overflow-y-scroll bg-gray-50 p-2 rounded-lg shadow-inner">
            {laoTransporters.map((transporter, index) => (
              <div
                key={index}
                className={`relative p-2 rounded-lg shadow flex flex-col items-center transition-all duration-300 h-[140px] ${
                  transporter.isActive
                    ? 'bg-white hover:bg-gray-200 cursor-pointer'
                    : 'bg-gray-500 cursor-not-allowed'
                }`}
                onClick={() => transporter.isActive && openPopupLaos(transporter.name)} // เปิด popup สำหรับขนส่งลาว
              >
                <img
                  src={transporter.image}
                  alt={transporter.name}
                  className={`object-cover rounded-lg mb-2 w-24 h-24 ${
                    transporter.isActive ? 'opacity-100' : 'opacity-50'
                  }`}
                  draggable="false"
                />
                <p className={`text-[13px] font-bold ${transporter.isActive ? 'text-black' : 'text-gray-500'}`}>
                  {transporter.name}
                </p>
                {!transporter.isActive && (
                  <div className="absolute inset-0 bg-gray-400 bg-opacity-50 rounded-lg"></div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* แสดงรายชื่อขนส่งในลาว-ไทย */}
        {selectedTransporter === 'lao-thai' && (
          <div className="mt-4 grid grid-cols-3 gap-4 h-[560px] overflow-y-scroll bg-gray-50 p-2 rounded-lg shadow-inner">
            {laoTransporters.map((transporter, index) => (
              <div
                key={index}
                className={`relative p-2 rounded-lg shadow flex flex-col items-center transition-all duration-300 h-[140px] ${
                  transporter.isActive
                    ? 'bg-white hover:bg-gray-200 cursor-pointer'
                    : 'bg-gray-500 cursor-not-allowed'
                }`}
                onClick={() => transporter.isActive && openPopupLaosThai(transporter.name)} // เปิด popup สำหรับขนส่งลาว-ไทย
              >
                <img
                  src={transporter.image}
                  alt={transporter.name}
                  className={`object-cover rounded-lg mb-2 w-24 h-24 ${
                    transporter.isActive ? 'opacity-100' : 'opacity-50'
                  }`}
                  draggable="false"
                />
                <p className={`text-[13px] font-bold ${transporter.isActive ? 'text-black' : 'text-gray-500'}`}>
                  {transporter.name}
                </p>
                {!transporter.isActive && (
                  <div className="absolute inset-0 bg-gray-400 bg-opacity-50 rounded-lg"></div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* popup ยืนยันการลบ */}
        {deleteConfirmation.isOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={closeDeleteConfirmation}
            ></div>

            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 w-96">
              <h2 className="text-lg font-bold mb-1">ยืนยันการลบ</h2>
              <p className="mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบพัสดุหมายเลข {deleteConfirmation.parcelNumber}?</p>
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
        
      </div>

      {popupThai && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closePopupThai}></div>

          <div className="fixed top-0 right-0 h-full w-1/3 bg-white shadow-lg z-50 p-4 overflow-y-auto">
            
            {/* Header Popup */}
            <div className="p-0 border-b mb-2">
              <h2 className="text-2xl font-bold mb-3">{selectedTransporter}</h2>
              <button
                className="absolute top-4 right-4 pt-1 pb-1 pr-3 pl-3 rounded bg-[#E52525] text-[#fff] hover:text-gray-700 "
                onClick={closePopupThai}
              >
                ✕
              </button>
            </div>

            {/* ข้อมูลการส่งพัสดุ */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* ผู้ส่ง */}
              <div>
                <h3 className="text-lg font-bold mb-2">ผู้ส่ง</h3>
                <div className="mb-1">
                  <label className="block text-sm mb-1">ชื่อและนามสกุล</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ชื่อและนามสกุลผู้ส่ง" value={formDataThai.senderNameThai} onChange={(e) => handleThaiInputChange(e, 'senderNameThai')}/>
                  {errorsThai.senderNameThai && <p className="text-red-500 text-sm mt-1">{errorsThai.senderNameThai}</p>}
                </div>
                <div className="mb-1">
                  <label className="block text-sm mb-1">เบอร์โทร</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="เบอร์โทรผู้ส่ง" value={formDataThai.senderPhoneThai} onChange={(e) => handleThaiInputChange(e, 'senderPhoneThai')}/>
                  {errorsThai.senderPhoneThai && <p className="text-red-500 text-sm mt-1">{errorsThai.senderPhoneThai}</p>}
                </div>
                <div className="mb-1">
                  <label className="block text-sm mb-1">ที่อยู่</label>
                  <textarea className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ที่อยู่ผู้ส่ง" rows={2} value={formDataThai.senderAddressThai} onChange={(e) => handleThaiInputChange(e, 'senderAddressThai')}></textarea>
                  {errorsThai.senderAddressThai && <p className="text-red-500 text-sm mt-1">{errorsThai.senderAddressThai}</p>}
                </div>
                <div className="mb-1">
                  <label className="block text-sm mb-1">พื้นที่บริการ (ผู้ส่ง)</label>
                  <div className="relative">
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" value={senderAddressArea} onChange={handleSenderZipcodeChange} placeholder="กรอกรหัสไปรษณีย์ผู้ส่ง"/>
                    {senderResult.length > 0 && (
                      <div className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full">
                        {senderResult.map((item, idx) => (
                          <div key={idx} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSenderResultSelect(item)}>
                            {Object.keys(zipData).find((key) => zipData[key].includes(item))}, 
                            จังหวัด: {item.จังหวัด}, อำเภอ: {item.อำเภอ}, ตำบล: {item.ตำบล}
                          </div>
                        ))}
                      </div>
                    )}
                    {errorsThai.senderAddressAreaThai && <p className="text-red-500 text-sm mt-1">{errorsThai.senderAddressAreaThai}</p>}
                  </div>
                </div>
              </div>

              {/* ผู้รับ */}
              <div>
                <h3 className="text-lg font-bold mb-2">ผู้รับ</h3>
                <div className="mb-1">
                  <label className="block text-sm mb-1">ชื่อและนามสกุล</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ชื่อและนามสกุลผู้รับ" value={formDataThai.receiverNameThai} onChange={(e) => handleThaiInputChange(e, 'receiverNameThai')}/>
                  {errorsThai.receiverNameThai && <p className="text-red-500 text-sm mt-1">{errorsThai.receiverNameThai}</p>}
                </div>
                <div className="mb-1">
                  <label className="block text-sm mb-1">เบอร์โทร</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="เบอร์โทรผู้รับ" value={formDataThai.receiverPhoneThai} onChange={(e) => handleThaiInputChange(e, 'receiverPhoneThai')}/>
                  {errorsThai.receiverPhoneThai && <p className="text-red-500 text-sm mt-1">{errorsThai.receiverPhoneThai}</p>}
                </div>
                <div className="mb-1">
                  <label className="block text-sm mb-1">ที่อยู่</label>
                  <textarea className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ที่อยู่ผู้รับ" rows={2} value={formDataThai.receiverAddressThai} onChange={(e) => handleThaiInputChange(e, 'receiverAddressThai')}></textarea>
                  {errorsThai.receiverAddressThai && <p className="text-red-500 text-sm mt-1">{errorsThai.receiverAddressThai}</p>}
                </div>
                <div className="mb-1">
                  <label className="block text-sm mb-1">พื้นที่บริการ (ผู้รับ)</label>
                  <div className="relative">
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" value={receiverAddressArea} onChange={handleReceiverZipcodeChange} placeholder="กรอกรหัสไปรษณีย์ผู้รับ"/>
                    {receiverResult.length > 0 && (
                      <div className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full">
                        {receiverResult.map((item, idx) => (
                          <div key={idx} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleReceiverResultSelect(item)}>
                            {Object.keys(zipData).find((key) => zipData[key].includes(item))}, 
                            จังหวัด: {item.จังหวัด}, อำเภอ: {item.อำเภอ}, ตำบล: {item.ตำบล}
                          </div>
                        ))}
                      </div>
                    )}
                    {errorsThai.receiverAddressAreaThai && <p className="text-red-500 text-sm mt-1">{errorsThai.receiverAddressAreaThai}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* ข้อมูลพัสดุ */}
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-1">รายละเอียดพัสดุ</h3>

              {/* ประเภทสินค้า และ น้ำหนัก */}
              <div className="grid grid-cols-2 gap-4 mb-1">
                {/* ประเภทสินค้า */}
                <div className="mb-1">
                  <label className="block mb-2" >ประเภทสินค้า</label>
                    <select className="w-full border border-gray-300 rounded-lg p-2 text-sm" defaultValue="" value={formDataThai.productTypeThai} onChange={(e) => handleThaiInputChange(e, 'productTypeThai')}>
                    <option value="" disabled>เลือกประเภทสินค้า</option>
                    <option value="เอกสาร">เอกสาร</option>
                    <option value="อาหารแห้ง">อาหารแห้ง</option>
                    <option value="ของใช้">ของใช้</option>
                    <option value="อุปกรณ์ IT">อุปกรณ์ IT</option>
                    <option value="เสื้อผ้า">เสื้อผ้า</option>
                    <option value="สื่อบันเทิง">สื่อบันเทิง</option>
                    <option value="อะไหล่ยนต์">อะไหล่ยนต์</option>
                    <option value="รองเท้า / กระเป๋า">รองเท้า / กระเป๋า</option>
                    <option value="เครื่องสำอาง">เครื่องสำอาง</option>
                    <option value="เฟอร์นิเจอร์">เฟอร์นิเจอร์</option>
                    <option value="ผลไม้">ผลไม้</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                    {errorsThai.productTypeThai && <p className="text-red-500 text-sm mt-1">{errorsThai.productTypeThai}</p>}
                </div>

                {/* น้ำหนัก */}
                <div>
                  <label className="block mb-2">น้ำหนัก (กิโลกรัม)</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="น้ำหนัก"value={formDataThai.weightThai} onChange={(e) => handleThaiInputChange(e, 'weightThai')}/>
                  {errorsThai.weightThai && <p className="text-red-500 text-sm mt-1">{errorsThai.weightThai}</p>}
                </div>
              </div>

              {/* กว้าง, ยาว, สูง */}
              <div className="grid grid-cols-3 gap-4 mb-1">
                <div>
                  <label className="block text-sm mb-1">กว้าง (ซม.)</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="กว้าง"value={formDataThai.widthThai} onChange={(e) => handleThaiInputChange(e, 'widthThai')}/>
                  {errorsThai.widthThai && <p className="text-red-500 text-sm mt-1">{errorsThai.widthThai}</p>}
                </div>
                <div>
                  <label className="block text-sm mb-1">ยาว (ซม.)</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ยาว"value={formDataThai.lengthThai} onChange={(e) => handleThaiInputChange(e, 'lengthThai')}/>
                  {errorsThai.lengthThai && <p className="text-red-500 text-sm mt-1">{errorsThai.lengthThai}</p>}
                </div>
                <div>
                  <label className="block text-sm mb-1">สูง (ซม.)</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="สูง"value={formDataThai.heightThai} onChange={(e) => handleThaiInputChange(e, 'heightThai')}/>
                  {errorsThai.heightThai && <p className="text-red-500 text-sm mt-1">{errorsThai.heightThai}</p>}
                </div>
              </div>

              {/* ขนาดกล่อง และ ราคาที่คำนวนได้ */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                {/* ขนาดกล่อง */}
                <div>
                  <label className="block text-sm mb-1">ขนาดกล่อง</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ขนาดกล่อง"/>
                </div>

                {/* ราคาที่คำนวนได้ */}
                <div>
                  <label className="block text-sm mb-1">ราคาที่คำนวนได้ (บาท)</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ราคา" readOnly/>
                </div>
              </div>
            </div>

            <div className="mt-4">
              {/* ด้านขวา: ยอดที่ต้องชำระ */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-bold mb-2">ยอดที่ต้องชำระ</h2>
                {/* แสดงชื่อขนส่ง */}
                <p className="text-sm font-medium mb-2">{selectedTransporter || 'ยังไม่ได้เลือกขนส่ง'}</p>
                <div className="bg-green-100 p-4 rounded-lg text-center">
                  {/* แสดงจำนวนเงินที่ต้องชำระ */}
                  <p className="text-xl font-bold text-[#E52525]">0 บาท</p>
                </div>
              </div>
            </div> 

            <div className="flex justify-between mt-4">
              {/* ปุ่มยกเลิก */}
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={closePopupThai}
              >
                ยกเลิก
              </button>

              {/* ปุ่มบันทึก */}
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={() => {
                  if (validateThaiPopupInputs()) {
                    console.log("ข้อมูลที่กรอก:", formDataThai); // แสดงข้อมูลที่กรอกใน console
                    // เพิ่มโค้ดสำหรับการบันทึกหรือดำเนินการอื่น ๆ ที่นี่
                  } else {
                    console.log("ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง");
                  }
                }}
              >
                บันทึก
              </button>
            </div>
            

          </div>
        </>
      )}

      {popupThaiLaos && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closePopupThaiLaos}
          ></div>

          {/* Popup Content */}
          <div className="fixed top-0 right-0 h-full w-1/3 bg-white shadow-lg z-50 p-4 overflow-y-auto">
            {/* Header */}
            <div className="p-0 border-b mb-2">
              <h2 className="text-2xl font-bold mb-3 flex items-center">
                <span>{selectedTransporter}</span>
                {selectedLaoTransporter && (
                  <>
                    <FaArrowRight className="mx-2 text-[#E52525]" />
                    <span>{selectedLaoTransporter}</span>
                  </>
                )}
              </h2>
              <button
                className="absolute top-4 right-4 pt-1 pb-1 pr-3 pl-3 rounded bg-[#E52525] text-[#fff] hover:text-gray-700"
                onClick={closePopupThaiLaos}
              >
                ✕
              </button>
            </div>

            {/* Step 1: เลือกขนส่งลาว */}
            {thaiLaosStep === 1 && (
              <div>
                <h3 className="text-lg font-bold mb-2">เลือกขนส่งลาว</h3>
                <div className="grid grid-cols-3 gap-4">
                  {laoTransporters.map((transporter, index) => (
                    <div
                      key={index}
                      className={`relative p-2 rounded-lg shadow flex flex-col items-center transition-all duration-300 ${
                        transporter.isActive
                          ? selectedLaoTransporter === transporter.name
                            ? 'bg-zinc-300 border-2 border-zinc-800' // สไตล์เมื่อถูกเลือก
                            : 'bg-white hover:bg-gray-200 cursor-pointer'
                          : 'bg-gray-500 cursor-not-allowed'
                      }`}
                      onClick={() =>
                        transporter.isActive && handleSelectLaoTransporter(transporter.name)
                      }
                    >
                      <img
                        src={transporter.image}
                        alt={transporter.name}
                        className={`object-cover rounded-lg mb-2 w-24 h-24 ${
                          transporter.isActive ? 'opacity-100' : 'opacity-50'
                        }`}
                        draggable="false"
                      />
                      <p
                        className={`text-[13px] font-bold ${
                          transporter.isActive ? 'text-black' : 'text-gray-500'
                        }`}
                      >
                        {transporter.name}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={goToNextStepThaiLaos}
                    disabled={!selectedLaoTransporter} // ปุ่มจะกดไม่ได้ถ้ายังไม่ได้เลือกขนส่ง
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: ฟอร์มการส่ง */}
            {thaiLaosStep === 2 && (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-1">
                  {/* ผู้ส่ง */}
                  <div>
                    <h3 className="text-lg font-bold mb-2">ผู้ส่ง</h3>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">ชื่อและนามสกุล</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ชื่อและนามสกุลผู้ส่ง" value={formDataThaiLaos.senderNameThaiLaos} onChange={(e) => handleThaiLaosInputChange(e, 'senderNameThaiLaos')}/>
                      {errorsThaiLaos.senderNameThaiLaos && (<p className="text-red-500 text-sm mt-1">{errorsThaiLaos.senderNameThaiLaos}</p>)}
                    </div>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">เบอร์โทร</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="เบอร์โทรผู้ส่ง" value={formDataThaiLaos.senderPhoneThaiLaos} onChange={(e) => handleThaiLaosInputChange(e, 'senderPhoneThaiLaos')}/>
                      {errorsThaiLaos.senderPhoneThaiLaos && (<p className="text-red-500 text-sm mt-1">{errorsThaiLaos.senderPhoneThaiLaos}</p>)}
                    </div>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">ที่อยู่</label>
                      <textarea className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ที่อยู่ผู้ส่ง" rows={2} value={formDataThaiLaos.senderAddressThaiLaos} onChange={(e) => handleThaiLaosInputChange(e, 'senderAddressThaiLaos')}></textarea>
                      {errorsThaiLaos.senderAddressThaiLaos && (<p className="text-red-500 text-sm mt-1">{errorsThaiLaos.senderAddressThaiLaos}</p>)}
                    </div>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">พื้นที่บริการ (ผู้ส่ง)</label>
                      <div className="relative">
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" value={senderZipcodeThaiLaos} onChange={handleSenderZipcodeChangeThaiLaos} placeholder="กรอกรหัสไปรษณีย์ผู้ส่ง"/>
                        {senderResultThaiLaos.length > 0 && (
                          <div className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full">
                            {senderResultThaiLaos.map((item, idx) => (
                              <div key={idx} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSenderResultSelectThaiLaos(item)}>
                                {Object.keys(zipData).find((key) => zipData[key].includes(item))}, 
                                จังหวัด: {item.จังหวัด}, อำเภอ: {item.อำเภอ}, ตำบล: {item.ตำบล}
                              </div>
                            ))}
                          </div>
                        )}
                        {errorsThaiLaos.senderAddressAreaThaiLaos && (
                          <p className="text-red-500 text-sm mt-1">{errorsThaiLaos.senderAddressAreaThaiLaos}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ผู้รับ */}
                  <div>
                    <h3 className="text-lg font-bold mb-2">ผู้รับ</h3>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">ชื่อและนามสกุล</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ชื่อและนามสกุลผู้รับ" value={formDataThaiLaos.receiverNameThaiLaos} onChange={(e) => handleThaiLaosInputChange(e, 'receiverNameThaiLaos')}/>
                      {errorsThaiLaos.receiverNameThaiLaos && (<p className="text-red-500 text-sm mt-1">{errorsThaiLaos.receiverNameThaiLaos}</p>)}
                    </div>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">เบอร์โทร</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="เบอร์โทรผู้รับ" value={formDataThaiLaos.receiverPhoneThaiLaos} onChange={(e) => handleThaiLaosInputChange(e, 'receiverPhoneThaiLaos')}/>
                      {errorsThaiLaos.receiverPhoneThaiLaos && (<p className="text-red-500 text-sm mt-1">{errorsThaiLaos.receiverPhoneThaiLaos}</p>)}
                    </div>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">ที่อยู่</label>
                      <textarea className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ที่อยู่ผู้รับ" rows={2} value={formDataThaiLaos.receiverAddressThaiLaos} onChange={(e) => handleThaiLaosInputChange(e, 'receiverAddressThaiLaos')}></textarea>
                      {errorsThaiLaos.receiverAddressThaiLaos && (<p className="text-red-500 text-sm mt-1">{errorsThaiLaos.receiverAddressThaiLaos}</p>)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-1">
                      <div>
                        <label className="block text-sm mb-1">บ้าน</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="บ้านผู้รับ" value={formDataThaiLaos.receiverHouseThaiLaos} onChange={(e) => handleThaiLaosInputChange(e, 'receiverHouseThaiLaos')}/>
                        {errorsThaiLaos.receiverHouseThaiLaos && (<p className="text-red-500 text-sm mt-1">{errorsThaiLaos.receiverHouseThaiLaos}</p>)}
                      </div>
                      <div>
                        <label className="block text-sm mb-1">เมือง</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="เมืองผู้รับ" value={formDataThaiLaos.receiverCityThaiLaos} onChange={(e) => handleThaiLaosInputChange(e, 'receiverCityThaiLaos')}/>
                        {errorsThaiLaos.receiverCityThaiLaos && (<p className="text-red-500 text-sm mt-1">{errorsThaiLaos.receiverCityThaiLaos}</p>)}
                      </div>
                    </div>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">แขวง</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="แขวงผู้รับ" value={formDataThaiLaos.receiverDistrictThaiLaos} onChange={(e) => handleThaiLaosInputChange(e, 'receiverDistrictThaiLaos')}/>
                      {errorsThaiLaos.receiverDistrictThaiLaos && (<p className="text-red-500 text-sm mt-1">{errorsThaiLaos.receiverDistrictThaiLaos}</p>)}
                    </div>
                  </div>
                </div>

                {/* Form Section 2 */}
                <div className="mb-1">
                  <h3 className="text-lg font-bold mb-1">รายละเอียดพัสดุ</h3>

                  {/* ประเภทสินค้า และ น้ำหนัก */}
                  <div className="grid grid-cols-2 gap-4 mb-1">
                    <div>
                      <label className="block text-sm mb-1">ประเภทสินค้า</label>
                      <select className="w-full border border-gray-300 rounded-lg p-2 text-sm " value={formDataThaiLaos.productTypeThaiLaos} onChange={(e) => handleThaiLaosInputChange(e, 'productTypeThaiLaos')}>
                        <option value="" disabled>เลือกประเภทสินค้า</option>
                        <option value="เอกสาร">เอกสาร</option>
                        <option value="อาหารแห้ง">อาหารแห้ง</option>
                        <option value="ของใช้">ของใช้</option>
                        <option value="อุปกรณ์ IT">อุปกรณ์ IT</option>
                        <option value="เสื้อผ้า">เสื้อผ้า</option>
                        <option value="สื่อบันเทิง">สื่อบันเทิง</option>
                        <option value="อะไหล่ยนต์">อะไหล่ยนต์</option>
                        <option value="รองเท้า / กระเป๋า">รองเท้า / กระเป๋า</option>
                        <option value="เครื่องสำอาง">เครื่องสำอาง</option>
                        <option value="เฟอร์นิเจอร์">เฟอร์นิเจอร์</option>
                      </select>
                      {errorsThaiLaos.productTypeThaiLaos && (<p className="text-red-500 text-sm mt-1">{errorsThaiLaos.productTypeThaiLaos}</p>)}
                    </div>
                    <div>
                      <label className="block text-sm mb-1">น้ำหนัก (กิโลกรัม)</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="น้ำหนัก" value={formDataThaiLaos.weightThaiLaos} onChange={(e) => handleThaiLaosInputChange(e, 'weightThaiLaos')}/>
                      {errorsThaiLaos.weightThaiLaos && (<p className="text-red-500 text-sm mt-1">{errorsThaiLaos.weightThaiLaos}</p>)}
                    </div>
                  </div>

                  {/* กว้าง, ยาว, สูง */}
                  <div className="grid grid-cols-3 gap-4 mb-1">
                    <div>
                      <label className="block text-sm mb-1">กว้าง (ซม.)</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="กว้าง" value={formDataThaiLaos.widthThaiLaos} onChange={(e) => handleThaiLaosInputChange(e, 'widthThaiLaos')}/>
                      {errorsThaiLaos.widthThaiLaos && (<p className="text-red-500 text-sm mt-1">{errorsThaiLaos.widthThaiLaos}</p>)}
                    </div>
                    <div>
                      <label className="block text-sm mb-1">ยาว (ซม.)</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ยาว" value={formDataThaiLaos.lengthThaiLaos} onChange={(e) => handleThaiLaosInputChange(e, 'lengthThaiLaos')}/>
                      {errorsThaiLaos.lengthThaiLaos && (<p className="text-red-500 text-sm mt-1">{errorsThaiLaos.lengthThaiLaos}</p>)}
                    </div>
                    <div>
                      <label className="block text-sm mb-1">สูง (ซม.)</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="สูง" value={formDataThaiLaos.heightThaiLaos} onChange={(e) => handleThaiLaosInputChange(e, 'heightThaiLaos')}/>
                      {errorsThaiLaos.heightThaiLaos && (<p className="text-red-500 text-sm mt-1">{errorsThaiLaos.heightThaiLaos}</p>)}
                    </div>
                  </div>

                  {/* ขนาดกล่อง และ ราคาที่คำนวนได้ */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">ขนาดกล่อง</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ขนาดกล่อง" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">ราคาที่คำนวนได้ (บาท)</label>
                      <input type="number" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ราคา" readOnly/>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  {/* ด้านซ้าย: อัตราแลกเปลี่ยน */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-bold mb-2">อัตราแลกเปลี่ยน</h2>
                    <p className="text-sm font-medium mb-2 text-gray-600">ลาว ซื้อ ไทย</p>
                    <div className="bg-yellow-100 p-4 rounded-lg text-center">
                      {/* แสดงจำนวนเงินกีบลาว */}
                      <p className="text-xl font-bold text-[#E52525]">
                        {formatNumberWithCommas(50000)} กีบ
                      </p>
                    </div>
                  </div>

                  {/* ด้านขวา: ยอดที่ต้องชำระ */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-bold mb-2">ยอดที่ต้องชำระ</h2>
                    {/* แสดงชื่อขนส่ง */}
                    <p className="text-sm font-medium mb-2 text-gray-600 flex items-center">
                      <span>{selectedTransporter}</span>
                      {selectedLaoTransporter && (
                        <>
                          <FaArrowRight className="mx-2 text-[#E52525]" />
                          <span>{selectedLaoTransporter}</span>
                        </>
                      )}
                    </p>
                    <div className="bg-green-100 p-4 rounded-lg text-center">
                      {/* แสดงจำนวนเงินที่ต้องชำระ */}
                      <p className="text-xl font-bold text-[#E52525]">
                        {formatNumberWithCommas(2000)} บาท
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    onClick={goToPreviousStepThaiLaos}
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => {
                      if (validateThaiLaosPopupInput()) {
                        console.log("ข้อมูลที่กรอก:", formDataThaiLaos);
                        closePopupThaiLaos();
                      } else {
                        console.log("ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง");
                      }
                    }}
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {popupLaos && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              resetFormLaos(); // ล้างค่าฟอร์ม
              closePopupLaos(); // ปิด Popup
            }}
          ></div>

          {/* Popup Content */}
          <div className="fixed top-0 right-0 h-full w-1/3 bg-white shadow-lg z-50 p-4 overflow-y-auto">
            {/* Header */}
            <div className="p-0 border-b mb-2">
              <h2 className="text-2xl font-bold mb-3">{selectedTransporter}</h2>
              <button
                className="absolute top-4 right-4 pt-1 pb-1 pr-3 pl-3 rounded bg-[#E52525] text-[#fff] hover:text-gray-700"
                onClick={() => {
                  resetFormLaos(); // ล้างค่าฟอร์ม
                  closePopupLaos(); // ปิด Popup
                }}
              >
                ✕
              </button>
            </div>

            {/* Form Section */}
            <div>
              {/* Section 1: ผู้ส่ง */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold mb-2">ผู้ส่ง</h3>
                  <div className="mb-1">
                    <label className="block text-sm mb-1">ชื่อและนามสกุล</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ชื่อและนามสกุลผู้ส่ง" value={formDataLaos.senderNameLaos} onChange={(e) => handleLaosInputChange(e, 'senderNameLaos')}/>
                    {errorsLaos.senderNameLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.senderNameLaos}</p>)}
                  </div>
                  <div className="mb-1">
                    <label className="block text-sm mb-1">เบอร์โทร</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="เบอร์โทรผู้ส่ง" value={formDataLaos.senderPhoneLaos} onChange={(e) => handleLaosInputChange(e, 'senderPhoneLaos')}/>
                    {errorsLaos.senderPhoneLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.senderPhoneLaos}</p>)}
                  </div>
                  <div className="mb-1">
                    <label className="block text-sm mb-1">ที่อยู่</label>
                    <textarea className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ที่อยู่ผู้ส่ง" rows={2} value={formDataLaos.senderAddressLaos} onChange={(e) => handleLaosInputChange(e, 'senderAddressLaos')}></textarea>
                    {errorsLaos.senderAddressLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.senderAddressLaos}</p>)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-1">
                    <div>
                      <label className="block text-sm mb-1">บ้าน</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="บ้านผู้ส่ง" value={formDataLaos.senderHouseLaos} onChange={(e) => handleLaosInputChange(e, 'senderHouseLaos')}/>
                      {errorsLaos.senderHouseLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.senderHouseLaos}</p>)}
                    </div>
                    <div>
                      <label className="block text-sm mb-1">เมือง</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="เมืองผู้ส่ง" value={formDataLaos.senderCityLaos} onChange={(e) => handleLaosInputChange(e, 'senderCityLaos')}/>
                      {errorsLaos.senderCityLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.senderCityLaos}</p>)}
                    </div>
                  </div>
                  <div className="mb-1">
                    <label className="block text-sm mb-1">แขวง</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="แขวงผู้ส่ง" value={formDataLaos.senderDistrictLaos} onChange={(e) => handleLaosInputChange(e, 'senderDistrictLaos')}/>
                    {errorsLaos.senderDistrictLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.senderDistrictLaos}</p>)}
                  </div>
                </div>

                {/* Section 1: ผู้รับ */}
                <div>
                  <h3 className="text-lg font-bold mb-2">ผู้รับ</h3>
                  <div className="mb-1">
                    <label className="block text-sm mb-1">ชื่อและนามสกุล</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ชื่อและนามสกุลผู้รับ" value={formDataLaos.receiverNameLaos} onChange={(e) => handleLaosInputChange(e, 'receiverNameLaos')}/>
                    {errorsLaos.receiverNameLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.receiverNameLaos}</p>)}
                  </div>
                  <div className="mb-1">
                    <label className="block text-sm mb-1">เบอร์โทร</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="เบอร์โทรผู้รับ" value={formDataLaos.receiverPhoneLaos} onChange={(e) => handleLaosInputChange(e, 'receiverPhoneLaos')}/>
                    {errorsLaos.receiverPhoneLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.receiverPhoneLaos}</p>)}
                  </div>
                  <div className="mb-1">
                    <label className="block text-sm mb-1">ที่อยู่</label>
                    <textarea className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ที่อยู่ผู้รับ" rows={2} value={formDataLaos.receiverAddressLaos} onChange={(e) => handleLaosInputChange(e, 'receiverAddressLaos')}></textarea>
                    {errorsLaos.receiverAddressLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.receiverAddressLaos}</p>)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-1">
                    <div>
                      <label className="block text-sm mb-1">บ้าน</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="บ้านผู้รับ" value={formDataLaos.receiverHouseLaos} onChange={(e) => handleLaosInputChange(e, 'receiverHouseLaos')}/>
                      {errorsLaos.receiverHouseLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.receiverHouseLaos}</p>)}
                    </div>
                    <div>
                      <label className="block text-sm mb-1">เมือง</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="เมืองผู้รับ" value={formDataLaos.receiverCityLaos} onChange={(e) => handleLaosInputChange(e, 'receiverCityLaos')}/>
                      {errorsLaos.receiverCityLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.receiverCityLaos}</p>)}
                    </div>
                  </div>
                  <div className="mb-1">
                    <label className="block text-sm mb-1">แขวง</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="แขวงผู้รับ" value={formDataLaos.receiverDistrictLaos} onChange={(e) => handleLaosInputChange(e, 'receiverDistrictLaos')}/>
                    {errorsLaos.receiverDistrictLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.receiverDistrictLaos}</p>)}
                  </div>
                </div>
              </div>

              {/* Section 2: รายละเอียดพัสดุ */}
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-1">รายละเอียดพัสดุ</h3>
                <div className="grid grid-cols-2 gap-4 mb-1">
                  <div>
                    <label className="block text-sm mb-1">ประเภทสินค้า</label>
                    <select className="w-full border border-gray-300 rounded-lg p-2 text-sm" value={formDataLaos.productTypeLaos} onChange={(e) => handleLaosInputChange(e, 'productTypeLaos')}>
                      <option value="" disabled>
                        เลือกประเภทสินค้า
                      </option>
                      <option value="เอกสาร">เอกสาร</option>
                      <option value="อาหารแห้ง">อาหารแห้ง</option>
                      <option value="ของใช้">ของใช้</option>
                      <option value="อุปกรณ์ IT">อุปกรณ์ IT</option>
                      <option value="เสื้อผ้า">เสื้อผ้า</option>
                      <option value="สื่อบันเทิง">สื่อบันเทิง</option>
                      <option value="อะไหล่ยนต์">อะไหล่ยนต์</option>
                      <option value="รองเท้า / กระเป๋า">รองเท้า / กระเป๋า</option>
                      <option value="เครื่องสำอาง">เครื่องสำอาง</option>
                      <option value="เฟอร์นิเจอร์">เฟอร์นิเจอร์</option>
                    </select>
                    {errorsLaos.productTypeLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.productTypeLaos}</p>)}
                  </div>
                  <div>
                    <label className="block text-sm mb-1">น้ำหนัก (กิโลกรัม)</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="น้ำหนัก" value={formDataLaos.weightLaos} onChange={(e) => handleLaosInputChange(e, 'weightLaos')}/>
                    {errorsLaos.weightLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.weightLaos}</p>)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-1">
                  <div>
                    <label className="block text-sm mb-1">กว้าง (ซม.)</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="กว้าง" value={formDataLaos.widthLaos} onChange={(e) => handleLaosInputChange(e, 'widthLaos')}/>
                    {errorsLaos.widthLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.widthLaos}</p>)}
                  </div>
                  <div>
                    <label className="block text-sm mb-1">ยาว (ซม.)</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ยาว" value={formDataLaos.lengthLaos} onChange={(e) => handleLaosInputChange(e, 'lengthLaos')}/>
                    {errorsLaos.lengthLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.lengthLaos}</p>)}
                  </div>
                  <div>
                    <label className="block text-sm mb-1">สูง (ซม.)</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="สูง" value={formDataLaos.heightLaos} onChange={(e) => handleLaosInputChange(e, 'heightLaos')}/>
                    {errorsLaos.heightLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.heightLaos}</p>)}
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-bold mb-2">ยอดที่ต้องชำระ</h2>
                {/* แสดงชื่อขนส่ง */}
                <p className="text-sm font-medium mb-2 text-gray-600">
                  {selectedTransporter}
                </p>
                <div className="bg-green-100 p-4 rounded-lg text-center">
                  {/* แสดงจำนวนเงินที่ต้องชำระ */}
                  <p className="text-xl font-bold text-[#E52525]">
                    {formatNumberWithCommas(2000)} กีบ
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-between mt-4">
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  onClick={() => {
                    resetFormLaos(); // ล้างค่าฟอร์ม
                    closePopupLaos(); // ปิด Popup
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={() => {
                    if (validateLaosPopupInputs()) {
                      console.log("ข้อมูลที่กรอก:", formDataLaos); // แสดงข้อมูลที่กรอกใน console
                      resetFormLaos(); // ล้างค่าฟอร์มหลังบันทึกสำเร็จ
                      closePopupLaos(); // ปิด Popup
                    } else {
                      console.log("ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง");
                    }
                  }}
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {popupLaosThai && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closePopupLaosThai}
          ></div>

          {/* Popup Content */}
          <div className="fixed top-0 right-0 h-full w-1/3 bg-white shadow-lg z-50 p-4 overflow-y-auto">
            {/* Header */}
            <div className="p-0 border-b mb-2">
              <h2 className="text-2xl font-bold mb-3 flex items-center">
                <span>{selectedTransporter}</span>
                {selectedThaiTransporter && (
                  <>
                    <FaArrowRight className="mx-2 text-[#E52525]" />
                    <span>{selectedThaiTransporter}</span>
                  </>
                )}
              </h2>
              <button
                className="absolute top-4 right-4 pt-1 pb-1 pr-3 pl-3 rounded bg-[#E52525] text-[#fff] hover:text-gray-700"
                onClick={closePopupLaosThai}
              >
                ✕
              </button>
            </div>

            {/* Step 1: เลือกขนส่งไทย */}
            {laosThaiStep === 1 && (
              <div>
                <h3 className="text-lg font-bold mb-2">เลือกขนส่งไทย</h3>
                <div className="grid grid-cols-3 gap-4">
                  {thaiTransporters.map((transporter, index) => (
                    <div
                      key={index}
                      className={`relative p-2 rounded-lg shadow flex flex-col items-center transition-all duration-300 ${
                        transporter.isActive
                          ? selectedThaiTransporter === transporter.name
                            ? 'bg-zinc-300 border-2 border-zinc-800'
                            : 'bg-white hover:bg-gray-200 cursor-pointer'
                          : 'bg-gray-500 cursor-not-allowed'
                      }`}
                      onClick={() =>
                        transporter.isActive && handleSelectThaiTransporter(transporter.name)
                      }
                    >
                      <img
                        src={transporter.image}
                        alt={transporter.name}
                        className={`object-cover rounded-lg mb-2 w-24 h-24 ${
                          transporter.isActive ? 'opacity-100' : 'opacity-50'
                        }`}
                        draggable="false"
                      />
                      <p
                        className={`text-[13px] font-bold ${
                          transporter.isActive ? 'text-black' : 'text-gray-500'
                        }`}
                      >
                        {transporter.name}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={goToNextStepLaosThai}
                    disabled={!selectedThaiTransporter} // ปุ่มจะกดไม่ได้ถ้ายังไม่ได้เลือกขนส่ง
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: ฟอร์มการส่ง */}
            {laosThaiStep === 2 && (
              <div>
                <h3 className="text-lg font-bold mb-2">กรอกข้อมูล</h3>

                {/* ส่วนที่ 1: ผู้ส่งและผู้รับ */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* ผู้ส่ง */}
                  <div>
                    <h4 className="text-lg font-bold mb-2">ผู้ส่ง</h4>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">ชื่อและนามสกุล</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ชื่อและนามสกุลผู้ส่ง" value={formDataLaosThai.senderNameLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'senderNameLaosThai')}/>
                      {errorsLaosThai.senderNameLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.senderNameLaosThai}</p>)}
                    </div>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">เบอร์โทร</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="เบอร์โทรผู้ส่ง" value={formDataLaosThai.senderPhoneLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'senderPhoneLaosThai')}/>
                      {errorsLaosThai.senderPhoneLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.senderPhoneLaosThai}</p>)}
                    </div>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">ที่อยู่</label>
                      <textarea className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ที่อยู่ผู้ส่ง" rows={2} value={formDataLaosThai.senderAddressLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'senderAddressLaosThai')}></textarea>
                      {errorsLaosThai.senderAddressLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.senderAddressLaosThai}</p>)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-1">
                      {/* บ้าน */}
                      <div>
                        <label className="block text-sm mb-1">บ้าน</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="บ้านผู้ส่ง" value={formDataLaosThai.senderHouseLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'senderHouseLaosThai')}/>
                        {errorsLaosThai.senderHouseLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.senderHouseLaosThai}</p>)}
                      </div>

                      {/* เมือง */}
                      <div>
                        <label className="block text-sm mb-1">เมือง</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="เมืองผู้ส่ง" value={formDataLaosThai.senderCityLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'senderCityLaosThai')}/>
                        {errorsLaosThai.senderCityLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.senderCityLaosThai}</p>)}
                      </div>
                    </div>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">แขวง</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="แขวงผู้ส่ง" value={formDataLaosThai.senderDistrictLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'senderDistrictLaosThai')}/>
                      {errorsLaosThai.senderDistrictLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.senderDistrictLaosThai}</p>)}
                    </div>
                  </div>

                  {/* ผู้รับ */}
                  <div>
                    <h4 className="text-lg font-bold mb-2">ผู้รับ</h4>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">ชื่อและนามสกุล</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ชื่อและนามสกุลผู้รับ" value={formDataLaosThai.receiverNameLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'receiverNameLaosThai')}/>
                      {errorsLaosThai.receiverNameLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.receiverNameLaosThai}</p>)}
                    </div>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">เบอร์โทร</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="เบอร์โทรผู้รับ" value={formDataLaosThai.receiverPhoneLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'receiverPhoneLaosThai')}/>
                      {errorsLaosThai.receiverPhoneLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.receiverPhoneLaosThai}</p>)}
                    </div>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">ที่อยู่</label>
                      <textarea className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ที่อยู่ผู้รับ" rows={2} value={formDataLaosThai.receiverAddressLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'receiverAddressLaosThai')}></textarea>
                      {errorsLaosThai.receiverAddressLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.receiverAddressLaosThai}</p>)}
                    </div>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">พื้นที่บริการ (ผู้ส่ง)</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="พื้นที่บริการ (ผู้ส่ง)" value={formDataLaosThai.receiverAddressAreaLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'receiverAddressAreaLaosThai')}/>
                      {errorsLaosThai.receiverAddressAreaLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.receiverAddressAreaLaosThai}</p>)}
                    </div>
                  </div>
                </div>

                {/* ส่วนที่ 2 และ 3: รายละเอียดพัสดุ */}
                <div className="mb-4">
                  <h4 className="text-lg font-bold mb-2">รายละเอียดพัสดุ</h4>
                  {/* ประเภทสินค้า และ น้ำหนัก */}
                  <div className="grid grid-cols-2 gap-4 mb-1">
                    <div>
                      <label className="block text-sm mb-1">ประเภทสินค้า</label>
                      <select className="w-full border border-gray-300 rounded-lg p-2 text-sm" value={formDataLaosThai.productTypeLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'productTypeLaosThai')}>
                        <option value="" disabled>เลือกประเภทสินค้า</option>
                        <option value="เอกสาร">เอกสาร</option>
                        <option value="อาหารแห้ง">อาหารแห้ง</option>
                        <option value="ของใช้">ของใช้</option>
                        <option value="อุปกรณ์ IT">อุปกรณ์ IT</option>
                        <option value="เสื้อผ้า">เสื้อผ้า</option>
                        <option value="สื่อบันเทิง">สื่อบันเทิง</option>
                        <option value="อะไหล่ยนต์">อะไหล่ยนต์</option>
                        <option value="รองเท้า / กระเป๋า">รองเท้า / กระเป๋า</option>
                        <option value="เครื่องสำอาง">เครื่องสำอาง</option>
                        <option value="เฟอร์นิเจอร์">เฟอร์นิเจอร์</option>
                      </select>
                      {errorsLaosThai.productTypeLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.productTypeLaosThai}</p>)}
                    </div>
                    <div>
                      <label className="block text-sm mb-1">น้ำหนัก (กิโลกรัม)</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="น้ำหนัก" value={formDataLaosThai.weightLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'weightLaosThai')}/>
                      {errorsLaosThai.weightLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.weightLaosThai}</p>)}
                    </div>
                  </div>

                  {/* กว้าง, ยาว, สูง */}
                  <div className="grid grid-cols-3 gap-4 mb-1">
                    <div>
                      <label className="block text-sm mb-1">กว้าง (ซม.)</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="กว้าง" value={formDataLaosThai.widthLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'widthLaosThai')}/>
                      {errorsLaosThai.widthLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.widthLaosThai}</p>)}
                    </div>
                    <div>
                      <label className="block text-sm mb-1">ยาว (ซม.)</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ยาว" value={formDataLaosThai.lengthLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'lengthLaosThai')}/>
                      {errorsLaosThai.lengthLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.lengthLaosThai}</p>)}
                    </div>
                    <div>
                      <label className="block text-sm mb-1">สูง (ซม.)</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="สูง" value={formDataLaosThai.heightLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'heightLaosThai')}/>
                      {errorsLaosThai.heightLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.heightLaosThai}</p>)}
                    </div>
                  </div>
                </div>

                {/* ขนาดกล่อง และ ราคาที่คำนวนได้ */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">ขนาดกล่อง</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ขนาดกล่อง"/>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">ราคาที่คำนวนได้ (บาท)</label>
                    <input type="number" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ราคา" readOnly/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  {/* ด้านซ้าย: อัตราแลกเปลี่ยน */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-bold mb-2">อัตราแลกเปลี่ยน</h2>
                    <p className="text-sm font-medium mb-2 text-gray-600">ลาว ซื้อ ไทย</p>
                    <div className="bg-yellow-100 p-4 rounded-lg text-center">
                      {/* แสดงจำนวนเงินกีบลาว */}
                      <p className="text-xl font-bold text-[#E52525]">
                        {formatNumberWithCommas(50000)} กีบ
                      </p>
                    </div>
                  </div>

                  {/* ด้านขวา: ยอดที่ต้องชำระ */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-bold mb-2">ยอดที่ต้องชำระ</h2>
                    {/* แสดงชื่อขนส่ง */}
                    <p className="text-sm font-medium mb-2 text-gray-600 flex items-center">
                      <span>{selectedTransporter}</span>
                      {selectedThaiTransporter && (
                        <>
                          <FaArrowRight className="mx-2 text-[#E52525]" />
                          <span>{selectedThaiTransporter}</span>
                        </>
                      )}
                    </p>
                    <div className="bg-green-100 p-4 rounded-lg text-center">
                      {/* แสดงจำนวนเงินที่ต้องชำระ */}
                      <p className="text-xl font-bold text-[#E52525]">
                        {formatNumberWithCommas(2000)} บาท
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600" onClick={goToPreviousStepLaosThai}>
                    ย้อนกลับ
                  </button>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => {
                      if (validateLaosThaiPopupInputs()) {
                        console.log("ข้อมูลที่กรอก:", formDataLaosThai); // แสดงข้อมูลที่กรอกใน console
                        closePopupLaosThai(); // ปิด Popup
                      } else {
                        console.log("ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง");
                      }
                    }}
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
};

export default ShippingAdd;