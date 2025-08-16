import React, { useState, useEffect } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { printReceipt } from '../../utils/printUtils';
import type { PaymentData } from '../../templates/receiptTemplate';
import { printCoverSheet, CoverSheetParcelData } from '../../utils/printCoverSheetUtils';
import axios from 'axios';

// 📁 Import Constants
import { 
  API_CONFIG, 
  employeeData, 
  TRANSPORTERS, 
  priceTable 
} from './constants';
import { formatNumberWithCommas } from './utils/formatNumber';

// 📁 Import Services & Hooks
import { 
  bookThaiParcel as bookThaiParcelService, 
  getCourierCode 
} from './shipping/services';
import { usePostalData } from './shipping/hooks';
import type { ZipDataItem } from './shipping/types';

// เอา API URLs จากไฟล์ constants แทน
const MIXAY_URL = API_CONFIG.MIXAY.URL;
const MIXAY_USERNAME = API_CONFIG.MIXAY.USERNAME;
const MIXAY_PASSWORD = API_CONFIG.MIXAY.PASSWORD;
const MIXAY_PARTNER_CODE = API_CONFIG.MIXAY.PARTNER_CODE;

const HAL_API_CLIENT_ID = API_CONFIG.HAL.CLIENT_ID;
const HAL_API_CLIENT_SECRET = API_CONFIG.HAL.CLIENT_SECRET;
const HAL_API_GRANT_TYPE = API_CONFIG.HAL.GRANT_TYPE;
const HAL_API_SCOPE = API_CONFIG.HAL.SCOPE;
const HAL_API_USERNAME = API_CONFIG.HAL.USERNAME;
const HAL_API_PASSWORD = API_CONFIG.HAL.PASSWORD;

// เอาข้อมูล transporters จากไฟล์ constants แทน  
const thaiTransporters = TRANSPORTERS.THAI;
const thaiLaosTransporters = TRANSPORTERS.THAI_LAOS;
const laoTransporters = TRANSPORTERS.LAO;

// ฟังก์ชันสำหรับใส่เครื่องหมายจุลภาคในตัวเลข - ใช้จากไฟล์ utils แทน

const ShippingAdd: React.FC = () => {

    const [countryCode, setCountryCode] = useState<string | null>(null); // สร้าง state สำหรับ countryCode
    interface ParcelTableData {
      parcelNumber: string;
      senderReceiver: string;
      deliveryType: string;
      mitaparpPrice: number;
      mitaparpPriceTHB: number;
      externalPriceTHB: number;
      externalPriceLAK: number;
      totalPriceTHB: number;
      totalPriceLAK: number;
      // 🔥 เพิ่มฟิลด์ใหม่
      senderName?: string;
      senderAddress?: string;
      receiverName?: string;
      receiverAddress?: string;
      weight?: number;
      width?: number;
      length?: number;
      height?: number;
      senderPhone?: string;
      receiverPhone?: string;
    }
    
    const [parcelData, setParcelData] = useState<ParcelTableData[]>([]); // สร้าง state สำหรับข้อมูลพัสดุ
    const [selectedMenu, setSelectedMenu] = useState<string>('parcel'); // ตั้งค่าเริ่มต้นเป็น 'parcel'

    // 🔄 ใช้ Hook สำหรับจัดการข้อมูลรหัสไปรษณีย์
    const { searchZipCode, findZipCodeByItem } = usePostalData();

    const [senderAddressArea, setSenderZipcode] = useState(''); // สร้าง state สำหรับรหัสไปรษณีย์ผู้ส่ง
    const [senderResult, setSenderResult] = useState<ZipDataItem[]>([]); // สร้าง state สำหรับผลลัพธ์การค้นหารหัสไปรษณีย์ผู้ส่ง
    const [receiverAddressArea, setReceiverZipcode] = useState(''); // สร้าง state สำหรับรหัสไปรษณีย์ผู้รับ
    const [receiverResult, setReceiverResult] = useState<ZipDataItem[]>([]); // สร้าง state สำหรับผลลัพธ์การค้นหารหัสไปรษณีย์ผู้รับ
    const [senderZipcodeThaiLaos, setSenderZipcodeThaiLaos] = useState(''); // รหัสไปรษณีย์ผู้ส่ง
    const [senderResultThaiLaos, setSenderResultThaiLaos] = useState<ZipDataItem[]>([]); // ผลลัพธ์การค้นหาผู้ส่ง

    const [showPrintPopup, setShowPrintPopup] = useState(false);

    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [receivedAmount, setReceivedAmount] = useState('');

    const [paymentCurrency, setPaymentCurrency] = useState<'THB' | 'LAK'>('THB');

    const totalTHB = parcelData.reduce((sum, item) => {
      const external = parseFloat(item.externalPriceTHB?.toString() || "0");
      const mitaparp = parseFloat(item.mitaparpPriceTHB?.toString() || "0");
      return sum + external + mitaparp;
    }, 0);

    const totalLAK = parcelData.reduce((sum, item) => {
      const mitaparp = parseFloat(item.mitaparpPrice?.toString() || "0");
      const external = parseFloat(item.externalPriceLAK?.toString() || "0");
      return sum + mitaparp + external;
    }, 0);
    const totalAmount = paymentCurrency === 'THB' ? totalTHB : totalLAK;
    const changeAmount = receivedAmount 
      ? Math.round((parseFloat(receivedAmount) - totalAmount) * 100) / 100 
      : 0;

    //-----------------------------------------------------------------------//

    useEffect(() => {
      const storedCountryCode = localStorage.getItem('countryCode');
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
    
    interface MixayParcelResponse {
      parcel?: {
        external_tracking_no?: string;
        sender_name?: string;
        receiver_name?: string;
        price?: number;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    }

    const mapMixayResponseToTable = (
      response: MixayParcelResponse, 
      transporterName: string,
      formData?: {
        senderPhone?: string;
        receiverPhone?: string;
        senderName?: string;
        receiverName?: string;
        senderAddress?: string;
        receiverAddress?: string;
        weight?: number;
        width?: number;
        length?: number;
        height?: number;
      } // เพิ่มพารามิเตอร์สำหรับข้อมูลฟอร์ม
    ) => {
      // 🔍 Debug ข้อมูลที่รับเข้ามาใน mapMixayResponseToTable
      console.log("🔍 DEBUG mapMixayResponseToTable รับค่า:");
      console.log("- response:", response);
      console.log("- transporterName:", transporterName);
      console.log("- formData:", formData);
      console.log("- formData.senderPhone:", formData?.senderPhone);
      console.log("- formData.receiverPhone:", formData?.receiverPhone);

      const result = {
        parcelNumber: response.parcel?.external_tracking_no || "-",
        senderReceiver: `
          <div style="display:flex;flex-direction:column;gap:6px;">
            <div style="background:rgba(59,130,246,0.08);border-radius:10px;padding:4px 10px 4px 10px;display:flex;align-items:center;">
              <span style="font-weight:600;color:#2563eb;">ผู้ส่ง</span>
              <span style="color:#222;margin-left:8px;">${response.parcel?.sender_name || "-"}</span>
            </div>
            <div style="background:rgba(16,185,129,0.08);border-radius:10px;padding:4px 10px 4px 10px;display:flex;align-items:center;">
              <span style="font-weight:600;color:#059669;">ผู้รับ</span>
              <span style="color:#222;margin-left:8px;">${response.parcel?.receiver_name || "-"}</span>
            </div>
          </div>
        `,
        deliveryType: transporterName,
        mitaparpPrice: 10000,
        mitaparpPriceTHB: 200,
        externalPriceTHB: 150,
        externalPriceLAK: typeof response.parcel?.price === "number" ? response.parcel.price : 0,
        totalPriceTHB: 0,
        totalPriceLAK: 0,
        // ✅ ใช้ข้อมูลจากฟอร์มแทนค่าว่าง
        senderPhone: formData?.senderPhone || '',
        receiverPhone: formData?.receiverPhone || '',
        // เพิ่มข้อมูลอื่นๆ ที่จำเป็นสำหรับใบประหน้า
        senderName: formData?.senderName || response.parcel?.sender_name || '',
        receiverName: formData?.receiverName || response.parcel?.receiver_name || '',
        senderAddress: formData?.senderAddress || '',
        receiverAddress: formData?.receiverAddress || '',
        weight: formData?.weight || 0,
        width: formData?.width || 0,
        length: formData?.length || 0,
        height: formData?.height || 0,
      };

      // 🔍 Debug ผลลัพธ์ที่จะ return
      console.log("🔍 DEBUG mapMixayResponseToTable จะ return:", result);
      console.log("🔍 DEBUG เบอร์โทรใน result:", {
        senderPhone: result.senderPhone,
        receiverPhone: result.receiverPhone
      });

      return result;
    };

    const calculateShippingPrice = () => {
      const weight = parseFloat(formDataThaiLaos.weightThaiLaos);
      const width = parseFloat(formDataThaiLaos.widthThaiLaos);
      const length = parseFloat(formDataThaiLaos.lengthThaiLaos);
      const height = parseFloat(formDataThaiLaos.heightThaiLaos);
      
      // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
      if (isNaN(weight) || isNaN(width) || isNaN(length) || isNaN(height)) {
        return 0;
      }
      
      // คำนวณขนาดรวม (กว้าง x ยาว x สูง)
      const totalSize = width * length * height;
      
      // หาราคาที่เหมาะสมจากตาราง
      for (const item of priceTable) {
        if (totalSize <= item.maxSize && weight <= item.maxWeight) {
          return item.price;
        }
      }
      
      // ถ้าเกินขนาดสูงสุด ให้ใช้ราคาสูงสุด
      return 620;
    };

    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);


    //------------------------------ ฟังก์ชันสำหรับค้นหารหัสไปรษณีย์ ------------------------------//

    const handleSenderZipcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setSenderZipcode(inputValue);
    
      const searchResults = searchZipCode(inputValue);
      setSenderResult(searchResults);
    
      // ลบข้อความข้อผิดพลาดเมื่อกรอกข้อมูล
      if (errorsThai.senderAddressArea) {
        setErrorsThai({ ...errorsThai, senderAddressArea: '' });
      }
    };
    
    // ฟังก์ชันสำหรับจัดการการเลือกพื้นที่บริการ (ผู้ส่ง)
    const handleSenderResultSelect = (selectedItem: ZipDataItem) => {
      const selectedZipcode = findZipCodeByItem(selectedItem);
      const selectedArea = `${selectedZipcode} ${selectedItem.ตำบล} ${selectedItem.อำเภอ} ${selectedItem.จังหวัด}`;
      setSenderZipcode(selectedArea);
      setFormDataThai({ ...formDataThai, senderAddressAreaThai: selectedArea });
      setSenderResult([]);
    };
    
    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงในช่อง "พื้นที่บริการ (ผู้รับ)"
    const handleReceiverZipcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setReceiverZipcode(inputValue);
    
      const searchResults = searchZipCode(inputValue);
      setReceiverResult(searchResults);
    
      // ลบข้อความข้อผิดพลาดเมื่อกรอกข้อมูล
      if (errorsThai.receiverAddressArea) {
        setErrorsThai({ ...errorsThai, receiverAddressArea: '' });
      }
    };
    
    // ฟังก์ชันสำหรับจัดการการเลือกพื้นที่บริการ (ผู้รับ)
    const handleReceiverResultSelect = (selectedItem: ZipDataItem) => {
      const selectedZipcode = findZipCodeByItem(selectedItem);
      const selectedArea = `${selectedZipcode} ${selectedItem.ตำบล} ${selectedItem.อำเภอ} ${selectedItem.จังหวัด}`;
      setReceiverZipcode(selectedArea);
      setFormDataThai({ ...formDataThai, receiverAddressAreaThai: selectedArea });
      setReceiverResult([]);
    };

    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงในช่อง "รหัสไปรษณีย์ผู้ส่ง"
    const handleSenderZipcodeChangeThaiLaos = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setSenderZipcodeThaiLaos(inputValue);

      const searchResults = searchZipCode(inputValue);
      setSenderResultThaiLaos(searchResults);

      // ลบข้อความข้อผิดพลาดเมื่อกรอกข้อมูล
      if (errorsThaiLaos.senderAddressAreaThaiLaos) {
        setErrorsThaiLaos({ ...errorsThaiLaos, senderAddressAreaThaiLaos: '' });
      }
    };

    // ฟังก์ชันสำหรับจัดการการเลือกพื้นที่บริการ (ผู้ส่ง)
    const handleSenderResultSelectThaiLaos = (selectedItem: ZipDataItem) => {
      const selectedZipcode = findZipCodeByItem(selectedItem);
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
          console.log("🔍 เลือกขนส่งลาว:", transporterName);
          setSelectedLaoTransporter(transporterName); // บันทึกชื่อขนส่งที่เลือก
          
          // เชื่อม API เมื่อเลือก Mixay
          if (transporterName === "Mixay") {
            console.log("🔗 เริ่มเชื่อม API Mixay...");
            console.log("📊 ตรวจสอบค่า Environment Variables:");
            console.log("- MIXAY_URL:", MIXAY_URL);
            console.log("- MIXAY_USERNAME:", MIXAY_USERNAME);
            console.log("- MIXAY_PASSWORD:", MIXAY_PASSWORD ? "มีค่า" : "ไม่มีค่า");
            console.log("- MIXAY_PARTNER_CODE:", MIXAY_PARTNER_CODE);
            
            fetchMixayToken().then(() => {
              console.log("✅ Login Mixay สำเร็จ, เริ่มดึงข้อมูล Dropship...");
              fetchMixayDropshipData(); // เรียก API ดึงข้อมูล Dropship หลังจาก login สำเร็จ
            }).catch((error) => {
              console.error("❌ Login Mixay ล้มเหลว:", error);
            });
          }
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

    // 📦 จองพัสดุผ่าน SHIPPOP API (ใช้ service)
    const bookThaiParcel = async (courierCode: string) => {
      try {
        const newParcelData = await bookThaiParcelService(formDataThai, courierCode, selectedTransporter || "Flash Express");
        
        if (newParcelData) {
          setParcelData(prev => [...prev, newParcelData]);
          console.log("✅ เพิ่มข้อมูลลงตารางสำเร็จ");
          closePopupThai();
        } else {
          console.log("⚠️ SHIPPOP booking: ไม่พบข้อมูลพัสดุใน response");
        }
      } catch (error) {
        console.error("❌ SHIPPOP booking error:", error);
      }
    };

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
      calculatedPrice: '', // เพิ่มฟิลด์สำหรับเก็บราคาที่คำนวนได้
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
    const [mixayCalculatedPriceThaiLaos, setMixayCalculatedPriceThaiLaos] = useState<number | null>(null);

    const [formDataThaiLaos, setFormDataThaiLaos] = useState({
      senderNameThaiLaos: '',
      senderPhoneThaiLaos: '',
      senderAddressThaiLaos: '',
      receiverNameThaiLaos: '',
      receiverPhoneThaiLaos: '',
      receiverAddressThaiLaos: '',
      receiverVillagesThaiLaos: '',
      receiverDistricThaiLaos: '',
      receiverProvincestThaiLaos: '',
      receiverBranchThaiLaos: '',
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
      if (!formDataThaiLaos.receiverVillagesThaiLaos) {
        newErrors.receiverVillagesThaiLaos = "กรุณากรอกบ้าน";
        isValid = false;
      }
      if (!formDataThaiLaos.receiverDistricThaiLaos) {
        newErrors.receiverDistricThaiLaos = "กรุณากรอกเมือง";
        isValid = false;
      }
      if (!formDataThaiLaos.receiverProvincestThaiLaos) {
        newErrors.receiverProvincestThaiLaos = "กรุณากรอกแขวง";
        isValid = false;
      }
      if (!formDataThaiLaos.receiverBranchThaiLaos) {
        newErrors.receiverBranchThaiLaos = "กรุณากรอกสาขา";
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
        receiverVillagesThaiLaos: '',
        receiverDistricThaiLaos: '',
        receiverProvincestThaiLaos: '',
        receiverBranchThaiLaos: '',
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
      setMixayCalculatedPriceThaiLaos(null); // รีเซ็ตราคาที่คำนวณ
      
      // 🟢 Reset search states สำหรับ ThaiLaos
      setReceiverProvinceSearchTermThaiLaos('');
      setReceiverDistrictSearchTermThaiLaos('');
      setReceiverVillagesSearchTermThaiLaos('');
      setReceiverBranchSearchTermThaiLaos('');
      
      // Reset selected IDs
      setReceiverSelectedProvinceIdThaiLaos(null);
      setReceiverSelectedDistrictIdThaiLaos(null);
      setSelectedReceiverVillageIdThaiLaos(null);
      
      // Reset dropdown states
      setReceiverProvinceDropdownOpenThaiLaos(false);
      setReceiverDistrictDropdownOpenThaiLaos(false);
      setReceiverVillagesDropdownOpenThaiLaos(false);
      setReceiverBranchDropdownOpenThaiLaos(false);
    };

    // 🟢 Function สำหรับจัดการ input changes ของ แขวง เมือง บ้าน สาขา สำหรับ ThaiLaos
    const handleThaiLaosLocationInputChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      fieldName: string,
      resetLowerLevels: boolean = false
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
      
      // Reset lower level fields when upper level changes
      if (resetLowerLevels) {
        if (fieldName === 'receiverProvincestThaiLaos') {
          // Reset เมือง บ้าน สาขา เมื่อเปลี่ยนแขวง
          setFormDataThaiLaos((prev) => ({
            ...prev,
            receiverDistricThaiLaos: '',
            receiverVillagesThaiLaos: '',
            receiverBranchThaiLaos: '',
          }));
          setReceiverDistrictSearchTermThaiLaos('');
          setReceiverVillagesSearchTermThaiLaos('');
          setReceiverBranchSearchTermThaiLaos('');
          setReceiverSelectedDistrictIdThaiLaos(null);
          setSelectedReceiverVillageIdThaiLaos(null);
        } else if (fieldName === 'receiverDistricThaiLaos') {
          // Reset บ้าน สาขา เมื่อเปลี่ยนเมือง
          setFormDataThaiLaos((prev) => ({
            ...prev,
            receiverVillagesThaiLaos: '',
            receiverBranchThaiLaos: '',
          }));
          setReceiverVillagesSearchTermThaiLaos('');
          setReceiverBranchSearchTermThaiLaos('');
          setSelectedReceiverVillageIdThaiLaos(null);
        } else if (fieldName === 'receiverVillagesThaiLaos') {
          // Reset สาขา เมื่อเปลี่ยนบ้าน
          setFormDataThaiLaos((prev) => ({
            ...prev,
            receiverBranchThaiLaos: '',
          }));
          setReceiverBranchSearchTermThaiLaos('');
        }
      }
    };

    const addMixayParcelThaiLaos = async () => {
      console.log("📦 เริ่มสร้างพัสดุ Mixay ไทย-ลาว");
      
      if (mixayCalculatedPriceThaiLaos === null) {
        await calculateMixayPriceThaiLaos();
        if (mixayCalculatedPriceThaiLaos === null) {
          alert("ไม่สามารถคำนวณราคาได้ กรุณาลองใหม่อีกครั้ง");
          return;
        }
      }

      // 🔥 คำนวณค่าต่างๆ ที่จะใส่ลงตาราง
      const crossingFeeInBaht = calculateShippingPrice();
      const crossingFeeInKip = Math.round(crossingFeeInBaht * 650 * 1.02);
      
      let shippingFeeInBaht = 0;
      let shippingFeeInKip = 0;
      let totalBaht = 0;
      let totalKip = 0;
      
      if (selectedLaoTransporter === "Mixay" && mixayCalculatedPriceThaiLaos !== null) {
        const adjustedRate = 650 * 0.98; // 637
        shippingFeeInBaht = parseFloat((mixayCalculatedPriceThaiLaos / adjustedRate).toFixed(2));
        shippingFeeInKip = mixayCalculatedPriceThaiLaos;
        totalBaht = parseFloat((shippingFeeInBaht + crossingFeeInBaht).toFixed(2));
        totalKip = Math.round(shippingFeeInKip + crossingFeeInKip);
      } else {
        shippingFeeInBaht = 0;
        shippingFeeInKip = 0;
        totalBaht = shippingFeeInBaht + crossingFeeInBaht;
        totalKip = Math.round(crossingFeeInKip);
      }

      const payload = {
        partner_code: MIXAY_PARTNER_CODE,
        weight: Number(formDataThaiLaos.weightThaiLaos),
        destination_type: "non_capital",
        source_system_reference: `order-${Date.now()}`,
        parcel_name: formDataThaiLaos.productTypeThaiLaos,
        sender_name: formDataThaiLaos.senderNameThaiLaos,
        sender_phone: formDataThaiLaos.senderPhoneThaiLaos,
        sender_address: `${formDataThaiLaos.senderAddressThaiLaos || ''} ${formDataThaiLaos.senderAddressAreaThaiLaos || ''}`.trim(),
        receiver_name: formDataThaiLaos.receiverNameThaiLaos,
        receiver_phone: formDataThaiLaos.receiverPhoneThaiLaos,
        receiver_address: [
          formDataThaiLaos.receiverAddressThaiLaos,
          formDataThaiLaos.receiverVillagesThaiLaos,
          formDataThaiLaos.receiverDistricThaiLaos,
          formDataThaiLaos.receiverProvincestThaiLaos
        ].filter(Boolean).join(" "),
        dropship_end: 1,
        size_w: Number(formDataThaiLaos.widthThaiLaos),
        size_l: Number(formDataThaiLaos.lengthThaiLaos),
        size_h: Number(formDataThaiLaos.heightThaiLaos),
        cod_price: 0,
        price: mixayCalculatedPriceThaiLaos
      };

      try {
        const token = localStorage.getItem("mixay_token");
        const response = await axios.post(
          `${MIXAY_URL}/api/v1/ex_parcel/add_ex_parcel/add`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const data = response.data;

        // เพิ่ม debug ก่อนสร้าง newParcelData
        console.log("🔍 DEBUG formDataThaiLaos:", {
          senderName: formDataThaiLaos.senderNameThaiLaos,
          senderAddress: formDataThaiLaos.senderAddressAreaThaiLaos,
          receiverName: formDataThaiLaos.receiverNameThaiLaos,
          receiverVillages: formDataThaiLaos.receiverVillagesThaiLaos,
          receiverDistric: formDataThaiLaos.receiverDistricThaiLaos,
          receiverProvinces: formDataThaiLaos.receiverProvincestThaiLaos
        });

        // 🔥 เพิ่มข้อมูลลงตารางพร้อมค่าที่คำนวณได้
        if (data.status && data.parcel) {
          const transporterDisplay = `${selectedTransporter} → ${selectedLaoTransporter}`;
          
          const newParcelData = {
            parcelNumber: data.parcel?.external_tracking_no || "-",
            senderReceiver: `
              <div style="display:flex;flex-direction:column;gap:6px;">
                <div style="background:rgba(59,130,246,0.08);border-radius:10px;padding:4px 10px 4px 10px;display:flex;align-items:center;">
                  <span style="font-weight:600;color:#2563eb;">ผู้ส่ง</span>
                  <span style="color:#222;margin-left:8px;">${formDataThaiLaos.senderNameThaiLaos || "-"}</span>
                </div>
                <div style="background:rgba(16,185,129,0.08);border-radius:10px;padding:4px 10px 4px 10px;display:flex;align-items:center;">
                  <span style="font-weight:600;color:#059669;">ผู้รับ</span>
                  <span style="color:#222;margin-left:8px;">${formDataThaiLaos.receiverNameThaiLaos || "-"}</span>
                </div>
              </div>
            `,
            deliveryType: transporterDisplay,
            mitaparpPrice: crossingFeeInKip,
            mitaparpPriceTHB: crossingFeeInBaht,
            externalPriceTHB: shippingFeeInBaht,
            externalPriceLAK: shippingFeeInKip,
            totalPriceTHB: totalBaht,
            totalPriceLAK: totalKip,
            // 🔥 ข้อมูลผู้ส่ง-ผู้รับ
            senderName: formDataThaiLaos.senderNameThaiLaos || '',
            senderAddress: `${formDataThaiLaos.senderAddressThaiLaos || ''} ${formDataThaiLaos.senderAddressAreaThaiLaos || ''}`.trim(),
            receiverName: formDataThaiLaos.receiverNameThaiLaos || '',
            receiverAddress: [
              formDataThaiLaos.receiverAddressThaiLaos || '',
              formDataThaiLaos.receiverVillagesThaiLaos,
              formDataThaiLaos.receiverDistricThaiLaos,
              formDataThaiLaos.receiverProvincestThaiLaos
            ].filter(Boolean).join(' ') || '',
            // 🔥 เพิ่มข้อมูลน้ำหนักและขนาด
            weight: parseFloat(formDataThaiLaos.weightThaiLaos) || 0,
            width: parseFloat(formDataThaiLaos.widthThaiLaos) || 0,
            length: parseFloat(formDataThaiLaos.lengthThaiLaos) || 0,
            height: parseFloat(formDataThaiLaos.heightThaiLaos) || 0,
            // ✅ เพิ่มเบอร์โทร (ส่วนที่ขาดหายไป!)
            senderPhone: formDataThaiLaos.senderPhoneThaiLaos || '',
            receiverPhone: formDataThaiLaos.receiverPhoneThaiLaos || '',
          };

          console.log("📦 ข้อมูลพัสดุที่จะเพิ่ม (รวมชื่อ-ที่อยู่):", newParcelData);
          
          setParcelData(prev => [...prev, newParcelData]);
          console.log("✅ เพิ่มข้อมูลลงตารางสำเร็จ:", newParcelData);
          
          setMixayCalculatedPriceThaiLaos(null);
        } else {
          console.error("❌ สร้างพัสดุไม่สำเร็จ");
        }
      } catch (e) {
        console.error("❌ Mixay ไทย-ลาว Add Parcel Error:", e);
      }
    };

    const calculateMixayPriceThaiLaos = async () => {
      console.log("🧮 เริ่มคำนวณราคา Mixay ไทย-ลาว");
      console.log("📋 ข้อมูลสำหรับคำนวณ:", {
        weight: formDataThaiLaos.weightThaiLaos,
        productType: formDataThaiLaos.productTypeThaiLaos,
        dimensions: {
          width: formDataThaiLaos.widthThaiLaos,
          length: formDataThaiLaos.lengthThaiLaos,
          height: formDataThaiLaos.heightThaiLaos
        }
      });

      if (!formDataThaiLaos.weightThaiLaos || !formDataThaiLaos.productTypeThaiLaos || !formDataThaiLaos.widthThaiLaos || !formDataThaiLaos.lengthThaiLaos || !formDataThaiLaos.heightThaiLaos) {
        console.log("⚠️ ข้อมูลไม่ครบสำหรับการคำนวณ");
        setMixayCalculatedPriceThaiLaos(null);
        return;
      }

      const payload = {
        partner_code: MIXAY_PARTNER_CODE,
        weight: Number(formDataThaiLaos.weightThaiLaos),
        destination_type: "non_capital",
        source_system_reference: `calc-${Date.now()}`,
        parcel_name: formDataThaiLaos.productTypeThaiLaos,
        sender_name: formDataThaiLaos.senderNameThaiLaos || "Test Sender",
        sender_phone: formDataThaiLaos.senderPhoneThaiLaos || "0123456789",
        sender_address: `${formDataThaiLaos.senderAddressThaiLaos || 'Test Address'} ${formDataThaiLaos.senderAddressAreaThaiLaos || ''}`.trim(),
        receiver_name: formDataThaiLaos.receiverNameThaiLaos || "Test Receiver",
        receiver_phone: formDataThaiLaos.receiverPhoneThaiLaos || "0123456789",
        receiver_address: [
          formDataThaiLaos.receiverAddressThaiLaos || "Test Address",
          formDataThaiLaos.receiverVillagesThaiLaos || "",
          formDataThaiLaos.receiverDistricThaiLaos || "",
          formDataThaiLaos.receiverProvincestThaiLaos || ""
        ].filter(Boolean).join(" "),
        dropship_end: 1,
        size_w: Number(formDataThaiLaos.widthThaiLaos),
        size_l: Number(formDataThaiLaos.lengthThaiLaos),
        size_h: Number(formDataThaiLaos.heightThaiLaos),
        cod_price: 100000
      };

      console.log("📤 Payload สำหรับคำนวณราคา:", payload);

      try {
        const token = localStorage.getItem("mixay_token");
        console.log("🔑 ใช้ Token สำหรับคำนวณ:", token ? token.substring(0, 20) + "..." : "ไม่มี Token");
        
        if (!token) {
          console.error("❌ ไม่พบ Token สำหรับการคำนวณ");
          setMixayCalculatedPriceThaiLaos(null);
          return;
        }

        const response = await axios.post(
          `${MIXAY_URL}/api/v1/ex_parcel/add_ex_parcel/cal`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        console.log("📨 Calculate Response Status:", response.status);
        console.log("📨 Calculate Response Data:", response.data);

        const data = response.data;

        if (data.data?.price !== undefined) {
          setMixayCalculatedPriceThaiLaos(data.data.price);
          console.log("✅ คำนวณราคาสำเร็จ:", data.data.price, "กีบ");
        } else {
          console.log("⚠️ ไม่พบราคาในการตอบกลับ");
          setMixayCalculatedPriceThaiLaos(null);
        }
      } catch (e) {
        console.error("❌ เกิดข้อผิดพลาดในการคำนวณราคา:", e);
        setMixayCalculatedPriceThaiLaos(null);
      }
    };

    useEffect(() => {
      if (
        selectedLaoTransporter === "Mixay" &&
        formDataThaiLaos.weightThaiLaos &&
        formDataThaiLaos.productTypeThaiLaos &&
        formDataThaiLaos.widthThaiLaos &&
        formDataThaiLaos.lengthThaiLaos &&
        formDataThaiLaos.heightThaiLaos
      ) {
        console.log("🔄 Trigger การคำนวณราคาอัตโนมัติ");
        calculateMixayPriceThaiLaos();
      } else {
        setMixayCalculatedPriceThaiLaos(null);
      }
      // eslint-disable-next-line
    }, [
      selectedLaoTransporter,
      formDataThaiLaos.weightThaiLaos,
      formDataThaiLaos.productTypeThaiLaos,
      formDataThaiLaos.widthThaiLaos,
      formDataThaiLaos.lengthThaiLaos,
      formDataThaiLaos.heightThaiLaos
    ]);

    

    //------------------------------ Popup ลาว ------------------------------//

    const [errorsLaos, setErrorsLaos] = useState<{ [key: string]: string }>({});
    const [provinces, setProvinces] = useState<{ pr_id: number; pr_name: string }[]>([]);

    const [dropdownOpen, setDropdownOpen] = useState(false); // ควบคุมการแสดง dropdown
    const [searchTerm, setSearchTerm] = useState(''); // เก็บคำค้นหา

    const [receiverProvinceDropdownOpen, setReceiverProvinceDropdownOpen] = useState(false);
    const [receiverProvinceSearchTerm, setReceiverProvinceSearchTerm] = useState('');
    const [receiverSelectedProvinceId, setReceiverSelectedProvinceId] = useState<number | null>(null);

    const [districts, setDistricts] = useState<{ dr_id: number; dr_name: string; pr_id: number }[]>([]);

    const [receiverDistrictDropdownOpen, setReceiverDistrictDropdownOpen] = useState(false);
    const [receiverDistrictSearchTerm, setReceiverDistrictSearchTerm] = useState('');
    
    const [villages, setVillages] = useState<{ vill_id: number; vill_name: string; pr_id: number; dr_id: number}[]>([]);

    const [branches, setBranches] = useState<{ id: number; name: string; province_id: number; district_id: number; village_id: number }[]>([]);

    // 🟢 State Variables สำหรับ ThaiLaos - ระบบค้นหาแขวง เมือง บ้าน สาขา
    const [receiverProvinceSearchTermThaiLaos, setReceiverProvinceSearchTermThaiLaos] = useState('');
    const [receiverDistrictSearchTermThaiLaos, setReceiverDistrictSearchTermThaiLaos] = useState('');
    const [receiverVillagesSearchTermThaiLaos, setReceiverVillagesSearchTermThaiLaos] = useState('');
    const [receiverBranchSearchTermThaiLaos, setReceiverBranchSearchTermThaiLaos] = useState('');
    
    // Selected ID states สำหรับ ThaiLaos
    const [receiverSelectedProvinceIdThaiLaos, setReceiverSelectedProvinceIdThaiLaos] = useState<number | null>(null);
    const [receiverSelectedDistrictIdThaiLaos, setReceiverSelectedDistrictIdThaiLaos] = useState<number | null>(null);
    const [selectedReceiverVillageIdThaiLaos, setSelectedReceiverVillageIdThaiLaos] = useState<number | null>(null);
    
    // Dropdown open states สำหรับ ThaiLaos
    const [receiverProvinceDropdownOpenThaiLaos, setReceiverProvinceDropdownOpenThaiLaos] = useState(false);
    const [receiverDistrictDropdownOpenThaiLaos, setReceiverDistrictDropdownOpenThaiLaos] = useState(false);
    const [receiverVillagesDropdownOpenThaiLaos, setReceiverVillagesDropdownOpenThaiLaos] = useState(false);
    const [receiverBranchDropdownOpenThaiLaos, setReceiverBranchDropdownOpenThaiLaos] = useState(false);

    const [mixayCalculatedPrice, setMixayCalculatedPrice] = useState<number | null>(null);

    const filteredProvinces = provinces.filter((province) =>
      province.pr_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredReceiverProvinces = provinces.filter((province) =>
      province.pr_name.toLowerCase().includes(receiverProvinceSearchTerm.toLowerCase())
    );

    const filteredReceiverDistricts = districts.filter(
      (district) =>
        (!receiverSelectedProvinceId || district.pr_id === receiverSelectedProvinceId) &&
        district.dr_name.toLowerCase().includes(receiverDistrictSearchTerm.toLowerCase())
    );

    // 🟢 Filtered Variables สำหรับ ThaiLaos - ระบบกรองข้อมูล แขวง เมือง บ้าน สาขา
    const filteredReceiverProvincesThaiLaos = provinces.filter((province) =>
      province.pr_name.toLowerCase().includes(receiverProvinceSearchTermThaiLaos.toLowerCase())
    );

    const filteredReceiverDistrictsThaiLaos = districts.filter(
      (district) =>
        (!receiverSelectedProvinceIdThaiLaos || district.pr_id === receiverSelectedProvinceIdThaiLaos) &&
        district.dr_name.toLowerCase().includes(receiverDistrictSearchTermThaiLaos.toLowerCase())
    );

    const filteredReceiverVillagesThaiLaos = villages.filter((village) => {
      const isProvinceMatched = !receiverSelectedProvinceIdThaiLaos || village.pr_id === receiverSelectedProvinceIdThaiLaos;
      const isDistrictMatched = !receiverSelectedDistrictIdThaiLaos || village.dr_id === receiverSelectedDistrictIdThaiLaos;
      return isProvinceMatched && isDistrictMatched && village.vill_name.toLowerCase().includes(receiverVillagesSearchTermThaiLaos.toLowerCase());
    });

    const filteredReceiverBranchesThaiLaos = branches.filter(item => {
      const isProvinceMatched = !receiverSelectedProvinceIdThaiLaos || item.province_id === receiverSelectedProvinceIdThaiLaos;
      const isDistrictMatched = !receiverSelectedDistrictIdThaiLaos || item.district_id === receiverSelectedDistrictIdThaiLaos;
      const isVillageMatched = !selectedReceiverVillageIdThaiLaos || item.village_id === selectedReceiverVillageIdThaiLaos;
      return ( isProvinceMatched && isDistrictMatched && isVillageMatched && item.name.toLowerCase().includes(receiverBranchSearchTermThaiLaos.toLowerCase()) );
    });

    async function fetchHalAccessToken() {
      try {
        const response = await axios.post(
          '/api/hal/oauth/token',
          {
            client_id: HAL_API_CLIENT_ID,
            client_secret: HAL_API_CLIENT_SECRET,
            grant_type: HAL_API_GRANT_TYPE,
            scope: HAL_API_SCOPE,
            username: HAL_API_USERNAME,
            password: HAL_API_PASSWORD,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        const data = response.data;
        console.debug("HAL API Response:", data);
        if (data.access_token) {
          localStorage.setItem("access_token_HAL", data.access_token);
        }
        if (data.refresh_token) {
          localStorage.setItem("refresh_token_HAL", data.refresh_token);
        }
        localStorage.setItem("hal_token_response", JSON.stringify(data));
      } catch (error) {
        console.error("HAL API Error:", error);
      }
    }

    async function fetchMixayToken() {
      try {
        const response = await axios.post(
          `${MIXAY_URL}/api/auth/login`,
          {
            username: MIXAY_USERNAME,
            password: MIXAY_PASSWORD,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        const data = response.data;
        if (data.success && data.data?.authorization?.token) {
          localStorage.setItem("mixay_token", data.data.authorization.token);
        }
      } catch (error) {
        console.error("Mixay Login Error:", error);
      }
    }

    async function fetchMixayDropshipData() {
      const token = localStorage.getItem("mixay_token"); // ดึง token จาก localStorage

      if (!token) {
        console.error("Token ไม่พบใน localStorage");
        return;
      }

      try {
        const response = await axios.get(
          "https://new.mixayexpress.com/api/v1/ex_parcel/getDropship?status=true",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // ใส่ Bearer Token ใน header
            },
          }
        );

        const result = response.data;

        console.log("ข้อมูลจาก API ทั้งหมด:", result);

        const provinces = Array.from(
          new Map(
            result.data
              .filter((item: DropshipItem) => item.province?.pr_name) // กรองเฉพาะข้อมูลที่มี `pr_name`
              .map((item: DropshipItem) => [item.province?.pr_id, { pr_id: item.province?.pr_id, pr_name: item.province?.pr_name }]) // ใช้ Map เพื่อเก็บข้อมูลที่ไม่ซ้ำ
          ).values()
        );
        setProvinces(provinces as { pr_id: number; pr_name: string }[]);

        const districts = Array.from(
          new Map(
            result.data
              .filter((item: DropshipItem) => item.dristric?.dr_name && item.province?.pr_id !== undefined)
              .map((item: DropshipItem) => [
                item.dristric?.dr_id,
                {
                  dr_id: item.dristric?.dr_id,
                  dr_name: item.dristric?.dr_name,
                  pr_id: item.province?.pr_id,
                },
              ])
          ).values()
        );
        setDistricts(districts as { dr_id: number; dr_name: string; pr_id: number }[]);

        const villages = Array.from(
          new Map(
            result.data
              .filter((item: DropshipItem) => item.village?.vill_name) // กรองเฉพาะข้อมูลที่มี `pr_name`
              .map((item: DropshipItem) => [
                item.village?.vill_id,
                {
                  vill_id: item.village?.vill_id,
                  vill_name: item.village?.vill_name,
                  pr_id: item.province?.pr_id,
                  dr_id: item.dristric?.dr_id,
                },
              ])
          ).values()
        );
        setVillages(villages as { vill_id: number; vill_name: string; pr_id: number; dr_id: number }[]);

        interface BranchItem {
          id: number;
          name: string;
          province_id: number;
          district_id: number;
          village_id: number;
          [key: string]: unknown;
        }

        const branches = (result.data as BranchItem[])
          .filter((item: BranchItem) => item.name && item.id && item.province_id && item.district_id && item.village_id)
          .map((item: BranchItem) => ({
            id: Number(item.id),
            name: item.name,
            province_id: Number(item.province_id),
            district_id: Number(item.district_id),
            village_id: Number(item.village_id)
          }));
        setBranches(branches);

        type DropshipItem = {
          province?: { pr_id?: string | number; pr_name?: string };
          pr_id?: string | number;
          pr_name?: string;
          district?: { dr_id?: string | number; dr_name?: string };
          dristric?: { dr_id?: string | number; dr_name?: string };
          dr_id?: string | number;
          dr_name?: string;
          village?: { vill_id?: string | number; vill_name?: string };
          vill_id?: string | number;
          vill_name?: string;
          [key: string]: unknown;
        };

        
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    }

    const calculateMixayPrice = async () => {
      const branch = branches.find(b => b.name === formDataLaos.receiverBranchLaos);
      if (!branch) return;

      const payload = {
        partner_code: MIXAY_PARTNER_CODE,
        weight: Number(formDataLaos.weightLaos),
        destination_type: "non_capital",
        source_system_reference: "order-1234",
        parcel_name: formDataLaos.productTypeLaos,
        sender_name: formDataLaos.senderNameLaos,
        sender_phone: formDataLaos.senderPhoneLaos,
        sender_address: [
          formDataLaos.senderAddressLaos,
          formDataLaos.senderProvincestLaos,
          formDataLaos.senderDistricLaos,
          formDataLaos.senderVillagesLaos
        ].filter(Boolean).join(" "),
        receiver_name: formDataLaos.receiverNameLaos,
        receiver_phone: formDataLaos.receiverPhoneLaos,
        receiver_address: formDataLaos.receiverAddressLaos,
        dropship_end: branch.id,
        size_w: Number(formDataLaos.widthLaos),
        size_l: Number(formDataLaos.lengthLaos),
        size_h: Number(formDataLaos.heightLaos),
        cod_price: 100000
      };

      try {
        const token = localStorage.getItem("mixay_token");
        const response = await axios.post(
          `${MIXAY_URL}/api/v1/ex_parcel/add_ex_parcel/cal`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const data = response.data;
        console.log("คำนวนราคา:", data);
        setMixayCalculatedPrice(data.data?.price ?? null);
      } catch (e) {
        setMixayCalculatedPrice(null);
      }
    };

    const addMixayParcel = async () => {
      const branch = branches.find(b => b.name === formDataLaos.receiverBranchLaos);
      if (!branch) return;

      const payload = {
        partner_code: MIXAY_PARTNER_CODE,
        weight: Number(formDataLaos.weightLaos),
        destination_type: "non_capital",
        source_system_reference: "order-1234",
        parcel_name: formDataLaos.productTypeLaos,
        sender_name: formDataLaos.senderNameLaos,
        sender_phone: formDataLaos.senderPhoneLaos,
        sender_address: [
          formDataLaos.senderAddressLaos,
          formDataLaos.senderProvincestLaos,
          formDataLaos.senderDistricLaos,
          formDataLaos.senderVillagesLaos
        ].filter(Boolean).join(" "),
        receiver_name: formDataLaos.receiverNameLaos,
        receiver_phone: formDataLaos.receiverPhoneLaos,
        receiver_address: formDataLaos.receiverAddressLaos,
        dropship_end: branch.id,
        size_w: Number(formDataLaos.widthLaos),
        size_l: Number(formDataLaos.lengthLaos),
        size_h: Number(formDataLaos.heightLaos),
        cod_price: 100000,
        price: mixayCalculatedPrice // ส่งราคาที่คำนวณได้ไปด้วย (ถ้าต้องการ)
      };

      try {
        const token = localStorage.getItem("mixay_token");
        const response = await axios.post(
          `${MIXAY_URL}/api/v1/ex_parcel/add_ex_parcel/add`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const data = response.data;
        console.log("พัสดุภายนอกเข้าระบบ Mixay:", data);

        console.log("🔍 DEBUG formDataLaos ก่อนส่งไป mapMixayResponseToTable:", {
          senderName: formDataLaos.senderNameLaos,
          senderPhone: formDataLaos.senderPhoneLaos,
          receiverName: formDataLaos.receiverNameLaos,
          receiverPhone: formDataLaos.receiverPhoneLaos,
          senderAddress: [
            formDataLaos.senderAddressLaos,
            formDataLaos.senderProvincestLaos,
            formDataLaos.senderDistricLaos,
            formDataLaos.senderVillagesLaos
          ].filter(Boolean).join(' '),
          receiverAddress: formDataLaos.receiverAddressLaos,
          weight: parseFloat(formDataLaos.weightLaos) || 0,
          width: parseFloat(formDataLaos.widthLaos) || 0,
          length: parseFloat(formDataLaos.lengthLaos) || 0,
          height: parseFloat(formDataLaos.heightLaos) || 0,
        });

        // เพิ่มข้อมูลลงตาราง
        if (data.status && data.parcel) {
          const newParcelData = mapMixayResponseToTable(data, selectedTransporter || "Mixay", {
            // ✅ ส่งข้อมูลเบอร์โทรและข้อมูลอื่นๆ
            senderPhone: formDataLaos.senderPhoneLaos,
            receiverPhone: formDataLaos.receiverPhoneLaos,
            senderName: formDataLaos.senderNameLaos,
            receiverName: formDataLaos.receiverNameLaos,
            senderAddress: [
              formDataLaos.senderAddressLaos,
              formDataLaos.senderProvincestLaos,
              formDataLaos.senderDistricLaos,
              formDataLaos.senderVillagesLaos
            ].filter(Boolean).join(' '),
            receiverAddress: formDataLaos.receiverAddressLaos,
            weight: parseFloat(formDataLaos.weightLaos) || 0,
            width: parseFloat(formDataLaos.widthLaos) || 0,
            length: parseFloat(formDataLaos.lengthLaos) || 0,
            height: parseFloat(formDataLaos.heightLaos) || 0,
          });

          // 🔍 Debug ข้อมูลที่ได้จาก mapMixayResponseToTable
          console.log("🔍 DEBUG newParcelData จาก mapMixayResponseToTable:", newParcelData);
          console.log("🔍 DEBUG เบอร์โทรใน newParcelData:", {
            senderPhone: newParcelData.senderPhone,
            receiverPhone: newParcelData.receiverPhone
          });

          setParcelData(prev => [...prev, newParcelData]);
        }
        // คุณสามารถแจ้งเตือนหรืออัปเดต UI ตามผลลัพธ์ที่ได้
      } catch (e) {
        console.error("Add Parcel Error:", e);
      }
    };

    const [formDataLaos, setFormDataLaos] = useState({
      senderNameLaos: '',
      senderPhoneLaos: '',
      senderAddressLaos: '',
      senderVillagesLaos: '',
      senderDistricLaos: '',
      senderProvincestLaos: '',
      receiverNameLaos: '',
      receiverPhoneLaos: '',
      receiverAddressLaos: '',
      receiverVillagesLaos: '',
      receiverDistricLaos: '',
      receiverProvincestLaos: '',
      receiverBranchLaos: '',
      weightLaos: '',
      widthLaos: '',
      lengthLaos: '',
      heightLaos: '',
      productTypeLaos: '',
    });

    useEffect(() => {
      if (
        formDataLaos.weightLaos &&
        formDataLaos.productTypeLaos &&
        formDataLaos.receiverBranchLaos
      ) {
        calculateMixayPrice();
      }
      // eslint-disable-next-line
    }, [formDataLaos.weightLaos, formDataLaos.productTypeLaos, formDataLaos.receiverBranchLaos]);

    // ฟังก์ชันเปิด Popup สำหรับขนส่งไทย-ลาว
    const openPopupLaos = (transporterName: string) => {
      setSelectedTransporter(transporterName);
      setPopupLaos(true);
      if (transporterName === "HAL") {
        fetchHalAccessToken();
      }
      if (transporterName === "Mixay") {
        fetchMixayToken().then(() => {
          fetchMixayDropshipData(); // เรียก API ดึงข้อมูล Dropship หลังจาก login สำเร็จ
        });
      }
    };

    // ฟังก์ชันปิด Popup
    const closePopupLaos = () => {
      setPopupLaos(false);
      resetFormLaos();
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
      if (!formDataLaos.senderVillagesLaos) {
        newErrors.senderVillagesLaos = "กรุณากรอกบ้าน";
        isValid = false;
      }
      if (!formDataLaos.senderDistricLaos) {
        newErrors.senderDistricLaos = "กรุณากรอกเมือง";
        isValid = false;
      }
      if (!formDataLaos.senderProvincestLaos) {
        newErrors.senderProvincestLaos = "กรุณากรอกแขวง";
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
      if (!formDataLaos.receiverVillagesLaos) {
        newErrors.receiverVillagesLaos = "กรุณากรอกบ้าน";
        isValid = false;
      }
      if (!formDataLaos.receiverDistricLaos) {
        newErrors.receiverDistricLaos = "กรุณากรอกเมือง";
        isValid = false;
      }
      if (!formDataLaos.receiverProvincestLaos) {
        newErrors.receiverProvincestLaos = "กรุณากรอกแขวง";
        isValid = false;
      }
      if (!formDataLaos.receiverBranchLaos) {
        newErrors.receiverBranchLaos = "กรุณากรอกสาขา";
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
      fieldName: string,
      isThaiLaos: boolean = false // เพิ่มพารามิเตอร์นี้
    ) => {
      const { value } = e.target;

      if (isThaiLaos) {
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
      } else {
        // อัปเดตค่าใน formDataLaos (เดิม)
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
      }
    };

    // ฟังก์ชันสำหรับการเคลียร์ข้อมูลในฟอร์ม
    const resetFormLaos = () => {
      setErrorsLaos({});
      setFormDataLaos({
        senderNameLaos: '',
        senderPhoneLaos: '',
        senderAddressLaos: '',
        senderVillagesLaos: '',
        senderDistricLaos: '',
        senderProvincestLaos: '',
        receiverNameLaos: '',
        receiverPhoneLaos: '',
        receiverAddressLaos: '',
        receiverVillagesLaos: '',
        receiverDistricLaos: '',
        receiverProvincestLaos: '',
        receiverBranchLaos: '',
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
      senderVillagesLaosThai: '',
      senderDistricLaosThai: '',
      senderProvincestLaosThai: '',
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
      if (!formDataLaosThai.senderVillagesLaosThai) {
        newErrors.senderVillagesLaosThai = "กรุณากรอกบ้าน";
        isValid = false;
      }
      if (!formDataLaosThai.senderDistricLaosThai) {
        newErrors.senderDistricLaosThai = "กรุณากรอกเมือง";
        isValid = false;
      }
      if (!formDataLaosThai.senderProvincestLaosThai) {
        newErrors.senderProvincestLaosThai = "กรุณากรอกแขวง";
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
        senderVillagesLaosThai: '',
        senderDistricLaosThai: '',
        senderProvincestLaosThai: '',
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
          <div className="bg-white p-4 rounded-lg shadow col-span-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">ยอดที่ต้องชำระ</h2>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-4xl font-medium text-right">
                {formatNumberWithCommas(totalTHB)} บาท
                {" / "}
                {formatNumberWithCommas(totalLAK)} กีบ
              </p>
              <button
                className={`font-bold py-3 px-8 rounded-lg text-lg shadow transition-all duration-200
                  ${parcelData.length === 0
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'}
                `}
                onClick={() => setShowPaymentPopup(true)}
                disabled={parcelData.length === 0}
              >
                ชำระเงิน
              </button>
            </div>
          </div>

          {/* Part 2: Table */}
          <div className="col-span-3 bg-white rounded-lg shadow h-64 overflow-y-auto h-[400px]">
            <table className="table-auto w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-[#E52525] text-white z-10 ">
                <tr>
                  <th className="px-4 py-2 border w-[150px] text-center">เลขพัสดุ</th>
                  <th className="px-4 py-2 border w-[210px] text-center">ลายชื่อ ผู้ส่ง/ผู้รับ</th>
                  <th className="px-2 py-2 border w-[100px] text-center">การจัดส่ง</th>
                  <th className="px-2 py-2 border w-[80px] text-center">ราคาขนส่งมิตรถาพ</th>
                  <th className="px-2 py-2 border w-[90px] text-center">ราคาขนส่งภายนอก THB</th>
                  <th className="px-2 py-2 border w-[90px] text-center">ราคาขนส่งภายนอก LAK</th>
                  <th className="px-2 py-2 border w-[90px] text-center">ราคารวม THB</th>
                  <th className="px-2 py-2 border w-[90px] text-center">ราคารวม LAK</th>
                  <th className="px-2 py-2 border w-[60px] text-center">ลบ</th>
                </tr>
              </thead>
              <tbody>
                {parcelData.map((data, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border w-[150px] text-center">{data.parcelNumber}</td>
                    <td className="px-4 border w-[210px] text-center">
                      <span
                        dangerouslySetInnerHTML={{ __html: data.senderReceiver }}
                        style={{ display: "block", whiteSpace: "pre-line" }}
                      />
                    </td>
                    <td className="px-2 py-2 border w-[100px] text-center">{data.deliveryType}</td>
                    <td className="px-2 py-2 border w-[80px] text-center">{formatNumberWithCommas(data.mitaparpPrice)}</td>
                    <td className="px-2 py-2 border w-[90px] text-center">{formatNumberWithCommas(data.externalPriceTHB)}</td>
                    <td className="px-2 py-2 border w-[90px] text-center">{formatNumberWithCommas(data.externalPriceLAK)}</td>
                    <td className="px-2 py-2 border w-[90px] text-center">
                      {
                        // ราคารวม THB = 150 + mitaparpPriceTHB (200)
                        formatNumberWithCommas((data.externalPriceTHB || 0) + (data.mitaparpPriceTHB || 0))
                      }
                    </td>
                    <td className="px-2 py-2 border w-[90px] text-center">
                      {
                        // ราคารวม LAK = ราคาขนส่งมิตรถาพ + ราคาขนส่งภายนอก LAK
                        formatNumberWithCommas((data.mitaparpPrice || 0) + (data.externalPriceLAK || 0))
                      }
                    </td>
                    <td className="px-2 py-2 border text-center w-[60px]">
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
                        <p className="font-medium">
                          {formatNumberWithCommas(parcelData.reduce((sum, item) => sum + (item.mitaparpPriceTHB || 0), 0))} บาท / {formatNumberWithCommas(parcelData.reduce((sum, item) => sum + (item.mitaparpPrice || 0), 0))} กีบ
                        </p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">ยอดรวม (ราคารวม THB)</p>
                      <p className="font-medium">
                        {formatNumberWithCommas(totalTHB)} บาท
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">ยอดรวม (ราคารวม LAK)</p>
                      <p className="font-medium">
                        {formatNumberWithCommas(totalLAK)} กีบ
                      </p>
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
            {thaiLaosTransporters.map((transporter, index) => (
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
                            {findZipCodeByItem(item)}, 
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
                            {findZipCodeByItem(item)}, 
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
                    <select className="w-full border border-gray-300 rounded-lg p-2 text-sm" value={formDataThai.productTypeThai} onChange={(e) => handleThaiInputChange(e, 'productTypeThai')}>
                    <option value="">เลือกประเภทสินค้า</option>
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
                  <label className="block text-sm mb-1">ขนาดกล่อง (ลบ.ซม.)</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-100" 
                    placeholder="กว้าง x ยาว x สูง"
                    value={
                      formDataThai.widthThai && formDataThai.lengthThai && formDataThai.heightThai
                        ? `${parseFloat(formDataThai.widthThai) * parseFloat(formDataThai.lengthThai) * parseFloat(formDataThai.heightThai)} ลบ.ซม.`
                        : ""
                    }
                    readOnly
                  />
                </div>

                {/* ราคาที่คำนวนได้ */}
                <div>
                  <label className="block text-sm mb-1">ราคาที่คำนวนได้ (บาท)</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-100" 
                    placeholder="ราคาจะแสดงหลังจากจอง"
                    value={formDataThai.calculatedPrice || ""}
                    readOnly
                  />
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
                    console.log("ข้อมูลที่กรอก:", formDataThai);
                    // เพิ่ม log ดูค่า courier_code
                    const courierCode = getCourierCode(selectedTransporter || "");
                    console.log("courierCode ที่จะส่ง:", courierCode);
                    if (courierCode) {
                      bookThaiParcel(courierCode);
                    } else {
                      alert("กรุณาเลือกขนส่งที่รองรับ");
                    }
                    closePopupThai();
                    resetFormThai();
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
          <div className="fixed top-0 right-0 h-full w-3/6 bg-white shadow-lg z-50 p-4 overflow-y-auto">
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
                                {findZipCodeByItem(item)}, 
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
                      <div className="mb-1">
                        <label className="block text-sm mb-1">แขวง</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm" 
                            placeholder="ค้นหาและเลือกแขวง" 
                            value={formDataThaiLaos.receiverProvincestThaiLaos}
                            onChange={(e) => { 
                              setReceiverProvinceSearchTermThaiLaos(e.target.value); 
                              handleThaiLaosLocationInputChange(e, 'receiverProvincestThaiLaos', true);
                            }}
                            onFocus={() => setReceiverProvinceDropdownOpenThaiLaos(true)}
                            onBlur={() => setTimeout(() => setReceiverProvinceDropdownOpenThaiLaos(false), 200)}
                          />
                          {receiverProvinceDropdownOpenThaiLaos && filteredReceiverProvincesThaiLaos.length > 0 && (
                            <div className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full">
                              {filteredReceiverProvincesThaiLaos.map((province) => (
                                <div key={province.pr_id} className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    setFormDataThaiLaos((prev) => ({ ...prev, receiverProvincestThaiLaos: province.pr_name }));
                                    setReceiverProvinceSearchTermThaiLaos(province.pr_name);
                                    setReceiverSelectedProvinceIdThaiLaos(province.pr_id);
                                    setReceiverProvinceDropdownOpenThaiLaos(false);
                                    // Reset lower levels when province changes
                                    setFormDataThaiLaos((prev) => ({
                                      ...prev,
                                      receiverProvincestThaiLaos: province.pr_name,
                                      receiverDistricThaiLaos: '',
                                      receiverVillagesThaiLaos: '',
                                      receiverBranchThaiLaos: '',
                                    }));
                                    setReceiverDistrictSearchTermThaiLaos('');
                                    setReceiverVillagesSearchTermThaiLaos('');
                                    setReceiverBranchSearchTermThaiLaos('');
                                    setReceiverSelectedDistrictIdThaiLaos(null);
                                    setSelectedReceiverVillageIdThaiLaos(null);
                                  }}
                                >
                                  {province.pr_name}
                                </div>
                              ))}
                            </div>
                          )}
                          {errorsThaiLaos.receiverProvincestThaiLaos && ( <p className="text-red-500 text-sm mt-1">{errorsThaiLaos.receiverProvincestThaiLaos}</p> )}
                        </div>
                      </div>
                      <div className="mb-1">
                        <label className="block text-sm mb-1">เมือง</label>
                        <div className="relative">
                          <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ค้นหาและเลือกเมือง" value={formDataThaiLaos.receiverDistricThaiLaos}
                            onChange={(e) => {
                              setReceiverDistrictSearchTermThaiLaos(e.target.value);
                              handleThaiLaosLocationInputChange(e, 'receiverDistricThaiLaos', true);
                            }}
                            onFocus={() => setReceiverDistrictDropdownOpenThaiLaos(true)}
                            onBlur={() => setTimeout(() => setReceiverDistrictDropdownOpenThaiLaos(false), 200)}
                          />
                          {receiverDistrictDropdownOpenThaiLaos && filteredReceiverDistrictsThaiLaos.length > 0 && (
                            <div className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full">
                              {filteredReceiverDistrictsThaiLaos.map((district) => (
                                <div key={district.dr_id} className="p-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => {
                                    setFormDataThaiLaos((prev) => ({ 
                                      ...prev, 
                                      receiverDistricThaiLaos: district.dr_name,
                                      receiverVillagesThaiLaos: '',
                                      receiverBranchThaiLaos: '',
                                    }));
                                    setReceiverDistrictSearchTermThaiLaos(district.dr_name);
                                    setReceiverSelectedDistrictIdThaiLaos(district.dr_id);
                                    setReceiverDistrictDropdownOpenThaiLaos(false);
                                    // Reset lower levels when district changes
                                    setReceiverVillagesSearchTermThaiLaos('');
                                    setReceiverBranchSearchTermThaiLaos('');
                                    setSelectedReceiverVillageIdThaiLaos(null);
                                  }}
                                >
                                  {district.dr_name}
                                </div>
                              ))}
                            </div>
                          )}
                          {errorsThaiLaos.receiverDistricThaiLaos && ( <p className="text-red-500 text-sm mt-1">{errorsThaiLaos.receiverDistricThaiLaos}</p> )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-1">
                      <div className="mb-1">
                        <label className="block text-sm mb-1">บ้าน</label>
                        <div className="relative">
                          <input  type="text"  className="w-full border border-gray-300 rounded-lg p-2 text-sm"  placeholder="ค้นหาและเลือกบ้าน"  value={receiverVillagesSearchTermThaiLaos}
                            onChange={(e) => {
                              setReceiverVillagesSearchTermThaiLaos(e.target.value);
                              handleThaiLaosLocationInputChange(e, 'receiverVillagesThaiLaos', true);
                            }}
                            onFocus={() => setReceiverVillagesDropdownOpenThaiLaos(true)}
                            onBlur={() => setTimeout(() => setReceiverVillagesDropdownOpenThaiLaos(false), 200)}
                          />
                          {receiverVillagesDropdownOpenThaiLaos && filteredReceiverVillagesThaiLaos.length > 0 && (
                            <div className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full">
                              {filteredReceiverVillagesThaiLaos.map((village) => (
                                <div key={village.vill_id} className="p-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => {
                                    setFormDataThaiLaos((prev) => ({ 
                                      ...prev, 
                                      receiverVillagesThaiLaos: village.vill_name,
                                      receiverBranchThaiLaos: '',
                                    }));
                                    setReceiverVillagesSearchTermThaiLaos(village.vill_name);
                                    setSelectedReceiverVillageIdThaiLaos(village.vill_id);
                                    setReceiverVillagesDropdownOpenThaiLaos(false);
                                    // Reset lower levels when village changes
                                    setReceiverBranchSearchTermThaiLaos('');
                                  }}
                                >
                                  {village.vill_name}
                                </div>
                              ))}
                            </div>
                          )}
                          {errorsThaiLaos.receiverVillagesThaiLaos && ( <p className="text-red-500 text-sm mt-1">{errorsThaiLaos.receiverVillagesThaiLaos}</p> )}
                        </div>
                      </div>
                      <div className="mb-1">
                        <label className="block text-sm mb-1">สาขา</label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            placeholder="ค้นหาและเลือกสาขา"
                            value={receiverBranchSearchTermThaiLaos}
                            onChange={e => {
                              setReceiverBranchSearchTermThaiLaos(e.target.value);
                              handleThaiLaosLocationInputChange(e, 'receiverBranchThaiLaos', false);
                            }}
                            onFocus={() => setReceiverBranchDropdownOpenThaiLaos(true)}
                            onBlur={() => setTimeout(() => setReceiverBranchDropdownOpenThaiLaos(false), 200)}
                          />
                          {receiverBranchDropdownOpenThaiLaos && filteredReceiverBranchesThaiLaos.length > 0 && (
                            <div className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full">
                              {filteredReceiverBranchesThaiLaos.map(branch => (
                                <div
                                  key={branch.id}
                                  className="p-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => {
                                    setFormDataThaiLaos(prev => ({
                                      ...prev,
                                      receiverBranchThaiLaos: branch.name,
                                      receiverBranchThaiLaosId: branch.id,
                                      receiverProvinceId: branch.province_id,
                                      receiverDistrictId: branch.district_id,
                                      receiverVillageId: branch.village_id,
                                    }));
                                    setReceiverBranchSearchTermThaiLaos(branch.name);
                                    setReceiverBranchDropdownOpenThaiLaos(false);
                                  }}
                                >
                                  {branch.name}
                                </div>
                              ))}
                            </div>
                          )}
                          {errorsThaiLaos.receiverBranchThaiLaos && (
                            <p className="text-red-500 text-sm mt-1">{errorsThaiLaos.receiverBranchThaiLaos}</p>
                          )}
                        </div>
                      </div>
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
                        <option value="">เลือกประเภทสินค้า</option>
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
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-50" 
                        placeholder="ขนาดกล่อง" 
                        value={
                          formDataThaiLaos.widthThaiLaos && formDataThaiLaos.lengthThaiLaos && formDataThaiLaos.heightThaiLaos
                            ? `${parseFloat(formDataThaiLaos.widthThaiLaos || '0') * parseFloat(formDataThaiLaos.lengthThaiLaos || '0') * parseFloat(formDataThaiLaos.heightThaiLaos || '0')} ซม.`
                            : '0 ซม.'
                        }
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">ราคาที่คำนวนได้ (LAK)</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-50" 
                        placeholder="ราคา" 
                        value={
                          selectedLaoTransporter === "Mixay" 
                            ? (mixayCalculatedPriceThaiLaos !== null 
                                ? formatNumberWithCommas(mixayCalculatedPriceThaiLaos) 
                                : "กำลังคำนวณ...")
                            : "0"
                        }
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="gap-4 mt-4">
                  {(() => {
                    // 🔥 สร้างตัวแปรคำนวณค่าต่างๆ
                    const crossingFeeInBaht = calculateShippingPrice();
                    const crossingFeeInKip = Math.round(crossingFeeInBaht * 650 * 1.02);
                    
                    let shippingFeeInBaht = 0;
                    let shippingFeeInKip = 0;
                    let totalBaht = 0;
                    let totalKip = 0;
                    
                    if (selectedLaoTransporter === "Mixay" && mixayCalculatedPriceThaiLaos !== null) {
                      // คำนวณสำหรับ Mixay
                      const adjustedRate = 650 * 0.98; // 637
                      shippingFeeInBaht = parseFloat((mixayCalculatedPriceThaiLaos / adjustedRate).toFixed(2));
                      shippingFeeInKip = mixayCalculatedPriceThaiLaos;
                      totalBaht = Math.round(shippingFeeInBaht + crossingFeeInBaht);
                      totalKip = Math.round(shippingFeeInKip + crossingFeeInKip);
                    } else {
                      // คำนวณสำหรับขนส่งอื่น
                      shippingFeeInBaht = 0;
                      shippingFeeInKip = 0;
                      totalBaht = shippingFeeInBaht + crossingFeeInBaht;
                      totalKip = Math.round(crossingFeeInKip);
                    }

                    return (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="border border-gray-300 bg-[#E52525] text-white p-2 text-center font-bold">สกุลเงิน</th>
                            <th className="border border-gray-300 bg-[#E52525] text-white p-2 text-center font-bold">ค่าข้าม</th>
                            <th className="border border-gray-300 bg-[#E52525] text-white p-2 text-center font-bold">ค่าส่ง</th>
                            <th className="border border-gray-300 bg-[#E52525] text-white p-2 text-center font-bold">ยอดรวม</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* แถวบาท */}
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-2 text-center font-medium">THB</td>
                            <td className="border border-gray-300 p-2 text-center">
                              {formatNumberWithCommas(crossingFeeInBaht)}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {formatNumberWithCommas(shippingFeeInBaht)}
                            </td>
                            <td className="border border-gray-300 p-2 text-center font-bold text-[#E52525]">
                              {formatNumberWithCommas(totalBaht)}
                            </td>
                          </tr>
                          
                          {/* แถวกีบ */}
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 p-2 text-center font-medium">LAK</td>
                            <td className="border border-gray-300 p-2 text-center">
                              {formatNumberWithCommas(crossingFeeInKip)}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {formatNumberWithCommas(shippingFeeInKip)}
                            </td>
                            <td className="border border-gray-300 p-2 text-center font-bold text-[#E52525]">
                              {formatNumberWithCommas(totalKip)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    );
                  })()}
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
                    onClick={async () => {
                      console.log("🖱️ คลิกปุ่มบันทึก");
                      console.log("🔍 selectedLaoTransporter:", selectedLaoTransporter);
                      console.log("🔍 formDataThaiLaos:", formDataThaiLaos);
                      
                      if (validateThaiLaosPopupInput()) {
                        console.log("✅ ข้อมูลที่กรอกถูกต้อง:", formDataThaiLaos);
                        
                        // คำนวณค่าต่างๆ ก่อนส่งออก
                        const crossingFeeInBaht = calculateShippingPrice();
                        const crossingFeeInKip = Math.round(crossingFeeInBaht * 650 * 1.02);
                        
                        let shippingFeeInBaht = 0;
                        let totalBaht = 0;
                        let totalKip = 0;
                        
                        if (selectedLaoTransporter === "Mixay" && mixayCalculatedPriceThaiLaos !== null) {
                          // คำนวณสำหรับ Mixay
                          const adjustedRate = 650 * 0.98; // 637
                          shippingFeeInBaht = mixayCalculatedPriceThaiLaos / adjustedRate;
                          totalBaht = Math.round(shippingFeeInBaht + crossingFeeInBaht);
                          totalKip = Math.round(mixayCalculatedPriceThaiLaos + crossingFeeInKip);
                        } else {
                          // คำนวณสำหรับขนส่งอื่น
                          shippingFeeInBaht = 0;
                          totalBaht = shippingFeeInBaht + crossingFeeInBaht;
                          totalKip = Math.round(crossingFeeInKip);
                        }
                        
                        // สร้างออบเจกต์ข้อมูลที่จะส่งออก
                        const outputData = {
                          // ข้อมูลพื้นฐาน
                          selectedTransporter: selectedTransporter,
                          selectedLaoTransporter: selectedLaoTransporter,
                          formData: formDataThaiLaos,
                          
                          // ข้อมูลการคำนวณราคา
                          pricing: {
                            // ราคาขั้นต้น
                            mixayCalculatedPrice: mixayCalculatedPriceThaiLaos,
                            crossingFeeInBaht: crossingFeeInBaht,
                            crossingFeeInKip: crossingFeeInKip,
                            shippingFeeInBaht: parseFloat(shippingFeeInBaht.toFixed(2)),
                            
                            // ราคารวม
                            totalBaht: totalBaht,
                            totalKip: totalKip,
                            
                            // รายละเอียดการคำนวณ
                            calculations: {
                              adjustedRate: 650 * 0.98, // 637
                              exchangeRateWithFee: 650 * 1.02, // 663
                              boxSize: parseFloat(formDataThaiLaos.widthThaiLaos || '0') + 
                                      parseFloat(formDataThaiLaos.lengthThaiLaos || '0') + 
                                      parseFloat(formDataThaiLaos.heightThaiLaos || '0'),
                              weight: parseFloat(formDataThaiLaos.weightThaiLaos || '0')
                            }
                          },
                          
                          // ข้อมูลสำหรับตาราง
                          tableData: {
                            currency: {
                              baht: {
                                shippingFee: selectedLaoTransporter === "Mixay" 
                                  ? parseFloat(shippingFeeInBaht.toFixed(2))
                                  : 0,
                                crossingFee: crossingFeeInBaht,
                                total: totalBaht
                              },
                              lak: {
                                shippingFee: selectedLaoTransporter === "Mixay" 
                                  ? mixayCalculatedPriceThaiLaos 
                                  : 0,
                                crossingFee: crossingFeeInKip,
                                total: totalKip
                              }
                            }
                          },
                          
                          // timestamp
                          timestamp: new Date().toISOString(),
                          
                          // สถานะ
                          status: "calculated"
                        };
                        
                        // ส่งออกข้อมูล
                        console.log("📤 ข้อมูลที่ส่งออก (OUTPUT DATA):", outputData);
                        console.log("💰 สรุปราคา:");
                        console.log("- ค่าส่ง (บาท):", outputData.tableData.currency.baht.shippingFee);
                        console.log("- ค่าข้าม (บาท):", outputData.tableData.currency.baht.crossingFee);
                        console.log("- ยอดรวม (บาท):", outputData.tableData.currency.baht.total);
                        console.log("- ค่าส่ง (กีบ):", outputData.tableData.currency.lak.shippingFee);
                        console.log("- ค่าข้าม (กีบ):", outputData.tableData.currency.lak.crossingFee);
                        console.log("- ยอดรวม (กีบ):", outputData.tableData.currency.lak.total);
                        
                        // เรียก API ตามขนส่งที่เลือก
                        if (selectedLaoTransporter === "Mixay") {
                          console.log("🚀 เรียก API Mixay...");
                          await addMixayParcelThaiLaos(); // เรียก API Mixay
                        } else {
                          console.log("ℹ️ ไม่ใช่ Mixay - ไม่เรียก API");
                        }
                        
                        // ปิด popup และรีเซ็ตฟอร์ม
                        closePopupThaiLaos();
                        resetFormThaiLaos();
                        
                        // คุณสามารถส่งข้อมูลไปยัง parent component หรือ API ได้ที่นี่
                        // เช่น: onSubmit(outputData) หรือ saveToDatabase(outputData)
                        
                      } else {
                        console.log("❌ ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง");
                        console.log("🔍 errorsThaiLaos:", errorsThaiLaos);
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
          <div className="fixed top-0 right-0 h-full w-3/6 bg-white shadow-lg z-50 p-4 overflow-y-auto">
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
                    <div className="mb-1">
                      <label className="block text-sm mb-1">แขวง</label>
                      <div className="relative">
                        {/* Input สำหรับค้นหาและเลือก */}
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ค้นหาและเลือกแขวง" value={formDataLaos.senderProvincestLaos}
                          onChange={(e) => { setSearchTerm(e.target.value); handleLaosInputChange(e, 'senderProvincestLaos'); }}
                          onFocus={() => setDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                        />
                        {/* Dropdown แสดงผลลัพธ์ */}
                        {dropdownOpen && filteredProvinces.length > 0 && (
                          <div className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full">
                            {filteredProvinces.map((province) => (
                              <div key={province.pr_id} className="p-2 hover:bg-gray-100 cursor-pointer"
                               onClick={() => {
                                  setFormDataLaos((prev) => ({ ...prev, senderProvincestLaos: province.pr_name, }));
                                  setSearchTerm(province.pr_name);
                                  setDropdownOpen(false);
                                }}
                              >
                                {province.pr_name}
                              </div>
                            ))}
                          </div>
                        )}
                        {errorsLaos.senderProvincestLaos && (
                          <p className="text-red-500 text-sm mt-1">{errorsLaos.senderProvincestLaos}</p>
                        )}
                      </div>
                    </div>

                    <div className="mb-1">
                      <label className="block text-sm mb-1">เมือง</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="เมืองผู้ส่ง" value={formDataLaos.senderDistricLaos} onChange={(e) => handleLaosInputChange(e, 'senderDistricLaos')}/>
                      {errorsLaos.senderDistricLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.senderDistricLaos}</p>)}
                    </div>
                  </div>
                  <div className="mb-1">
                    <label className="block text-sm mb-1">บ้าน</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="บ้านผู้ส่ง" value={formDataLaos.senderVillagesLaos} onChange={(e) => handleLaosInputChange(e, 'senderVillagesLaos')}/>
                    {errorsLaos.senderVillagesLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.senderVillagesLaos}</p>)}
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
                    <div className="mb-1">
                      <label className="block text-sm mb-1">แขวง</label>
                      <div className="relative">
                        {/* Input สำหรับค้นหาและเลือก */}
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ค้นหาและเลือกแขวง" value={formDataLaos.receiverProvincestLaos}
                          onChange={(e) => { setReceiverProvinceSearchTerm(e.target.value); handleLaosInputChange(e, 'receiverProvincestLaos'); }}
                          onFocus={() => setReceiverProvinceDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setReceiverProvinceDropdownOpen(false), 200)}
                        />
                        {/* Dropdown แสดงผลลัพธ์ */}
                        {receiverProvinceDropdownOpen && filteredReceiverProvinces.length > 0 && (
                          <div className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full">
                            {filteredReceiverProvinces.map((province) => (
                              <div key={province.pr_id} className="p-2 hover:bg-gray-100 cursor-pointer"
                               onClick={() => {
                                  setFormDataLaos((prev) => ({ ...prev, receiverProvincestLaos: province.pr_name, }));
                                  setReceiverProvinceSearchTerm(province.pr_name);
                                  setReceiverSelectedProvinceId(province.pr_id); // อัปเดต selectedProvinceId
                                  setReceiverProvinceDropdownOpen(false);
                                }}
                              >
                                {province.pr_name}
                              </div>
                            ))}
                          </div>
                        )}
                        {errorsLaos.receiverProvincestLaos && ( <p className="text-red-500 text-sm mt-1">{errorsLaos.receiverProvincestLaos}</p> )}
                      </div>
                    </div>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">เมือง</label>
                      <div className="relative">
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="ค้นหาและเลือกเมือง" value={formDataLaos.receiverDistricLaos}
                          onChange={(e) => {
                            setReceiverDistrictSearchTerm(e.target.value);
                            handleLaosInputChange(e, 'receiverDistricLaos');
                          }}
                          onFocus={() => setReceiverDistrictDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setReceiverDistrictDropdownOpen(false), 200)}
                        />
                        {receiverDistrictDropdownOpen && filteredReceiverDistricts.length > 0 && (
                          <div className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full">
                            {filteredReceiverDistricts.map((district) => (
                              <div key={district.dr_id} className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setFormDataLaos((prev) => ({ ...prev, receiverDistricLaos: district.dr_name, }));
                                  setReceiverDistrictSearchTerm(district.dr_name);
                                  setReceiverDistrictDropdownOpen(false);
                                }}
                              >
                                {district.dr_name}
                              </div>
                            ))}
                          </div>
                        )}
                        {errorsLaos.receiverDistricLaos && ( <p className="text-red-500 text-sm mt-1">{errorsLaos.receiverDistricLaos}</p> )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-1">
                    <div className="mb-1">
                      <label className="block text-sm mb-1">บ้าน</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="บ้านผู้รับ" value={formDataLaos.receiverVillagesLaos} onChange={(e) => handleLaosInputChange(e, 'receiverVillagesLaos')}/>
                      {errorsLaos.receiverVillagesLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.receiverVillagesLaos}</p>)}
                    </div>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">สาขา</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="สาขาผู้รับ" value={formDataLaos.receiverBranchLaos} onChange={(e) => handleLaosInputChange(e, 'receiverBranchLaos')}/>
                      {errorsLaos.receiverBranchLaos && (<p className="text-red-500 text-sm mt-1">{errorsLaos.receiverBranchLaos}</p>)}
                    </div>
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
                      <option value="">
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
                    {mixayCalculatedPrice !== null
                      ? `${formatNumberWithCommas(mixayCalculatedPrice)} กีบ`
                      : "กรอกข้อมูลเพื่อคำนวณราคา"}
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
                  onClick={async () => {
                    if (validateLaosPopupInputs()) {
                      const outputData = {
                        ...formDataLaos,
                        mixayCalculatedPrice,
                      };
                      console.log("ข้อมูลที่กรอก:", outputData);
                      await addMixayParcel(); // เรียก API นำเข้าพัสดุ
                      resetFormLaos();
                      closePopupLaos();
                    } else {
                      console.log("ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง");
                      console.log("ข้อมูลที่กรอก:", formDataLaos);
                      console.log("ฟิลด์ที่ขาดหาย:", {
                        senderVillagesLaos: formDataLaos.senderVillagesLaos || "❌ ไม่ได้กรอกบ้านผู้ส่ง",
                        senderDistricLaos: formDataLaos.senderDistricLaos || "❌ ไม่ได้กรอกเมืองผู้ส่ง",
                        receiverVillagesLaos: formDataLaos.receiverVillagesLaos || "❌ ไม่ได้กรอกบ้านผู้รับ",
                        receiverBranchLaos: formDataLaos.receiverBranchLaos || "❌ ไม่ได้กรอกสาขาผู้รับ"
                      });
                      console.log("กรุณากรอกข้อมูลให้ครบถ้วน:");
                      console.log("- บ้านผู้ส่ง");
                      console.log("- เมืองผู้ส่ง");
                      console.log("- บ้านผู้รับ");
                      console.log("- สาขาผู้รับ");
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
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="บ้านผู้ส่ง" value={formDataLaosThai.senderVillagesLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'senderVillagesLaosThai')}/>
                        {errorsLaosThai.senderVillagesLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.senderVillagesLaosThai}</p>)}
                      </div>

                      {/* เมือง */}
                      <div>
                        <label className="block text-sm mb-1">เมือง</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="เมืองผู้ส่ง" value={formDataLaosThai.senderDistricLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'senderDistricLaosThai')}/>
                        {errorsLaosThai.senderDistricLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.senderDistricLaosThai}</p>)}
                      </div>
                    </div>
                    <div className="mb-1">
                      <label className="block text-sm mb-1">แขวง</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm" placeholder="แขวงผู้ส่ง" value={formDataLaosThai.senderProvincestLaosThai} onChange={(e) => handleLaosThaiInputChange(e, 'senderProvincestLaosThai')}/>
                      {errorsLaosThai.senderProvincestLaosThai && (<p className="text-red-500 text-sm mt-1">{errorsLaosThai.senderProvincestLaosThai}</p>)}
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
                        <option value="">เลือกประเภทสินค้า</option>
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
                        {formatNumberWithCommas(0)} บาท
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

      {showPaymentPopup && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50"></div>
          <div className="fixed top-1/2 left-1/2 z-50 bg-white rounded-lg shadow-lg p-8 w-[350px] -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">รับชำระเงิน</h2>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded font-bold border ${paymentCurrency === 'THB' ? 'bg-green-500 text-white border-green-600' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                  onClick={() => {
                    setPaymentCurrency('THB');
                    setReceivedAmount('');
                  }}
                >
                  บาท
                </button>
                <button
                  className={`px-3 py-1 rounded font-bold border ${paymentCurrency === 'LAK' ? 'bg-green-500 text-white border-green-600' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                  onClick={() => {
                    setPaymentCurrency('LAK');
                    setReceivedAmount('');
                  }}
                >
                  กีบ
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">ยอดที่ต้องชำระ</label>
              <div className="text-2xl font-bold text-[#E52525] mb-2">
                {formatNumberWithCommas(paymentCurrency === 'THB' ? totalTHB : totalLAK)}
                {paymentCurrency === 'THB' ? ' บาท' : ' กีบ'}
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">จำนวนเงินที่รับมา</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg p-2 text-lg appearance-none"
                placeholder={`กรอกจำนวนเงินที่รับมา (${paymentCurrency === 'THB' ? 'บาท' : 'กีบ'})`}
                value={receivedAmount}
                onChange={e => setReceivedAmount(e.target.value)}
                min={0}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">เงินทอน</label>
              <div className={`text-2xl font-bold ${changeAmount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                {receivedAmount ? formatNumberWithCommas(changeAmount) : '0'}
                {paymentCurrency === 'THB' ? ' บาท' : ' กีบ'}
              </div>
              {receivedAmount && changeAmount < 0 && (
                <div className="text-red-500 text-sm mt-1">จำนวนเงินที่รับมาต้องมากกว่าหรือเท่ากับยอดที่ต้องชำระ</div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500"
                onClick={() => setShowPaymentPopup(false)}
              >
                ยกเลิก
              </button>
              <button
                className={`px-4 py-2 rounded font-bold ${!receivedAmount || changeAmount < 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
                disabled={!receivedAmount || changeAmount < 0}
                onClick={() => {
                  // บันทึกข้อมูลการชำระเงิน
                  setPaymentData({
                    totalAmount: totalAmount,
                    receivedAmount: parseFloat(receivedAmount),
                    changeAmount: changeAmount,
                    currency: paymentCurrency,
                    timestamp: new Date().toISOString()
                  });
                  
                  setShowPaymentPopup(false);
                  setReceivedAmount('');
                  setShowPrintPopup(true);
                }}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </>
      )}

      {showPrintPopup && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50"></div>
          <div className="fixed top-1/2 left-1/2 z-50 bg-white rounded-lg shadow-lg p-8 w-[400px] -translate-x-1/2 -translate-y-1/2">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-green-600 mb-2">ชำระเงินสำเร็จ!</h2>
              <p className="text-gray-600">เลือกการพิมพ์เอกสาร</p>
            </div>
            
            <div className="space-y-4">
              <button
                className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 text-lg font-medium"
                onClick={async () => {
                  try {
                    await printReceipt(
                      paymentData,
                      parcelData,
                      employeeData,
                      formatNumberWithCommas
                    );
                    console.log("พิมพ์ใบเสร็จสำเร็จ - กลับสู่หน้าเลือกพิมพ์");
                    // หน้านี้จะยังคงแสดงอยู่หลังจากพิมพ์เสร็จ
                  } catch (error) {
                    console.error("เกิดข้อผิดพลาดในการพิมพ์:", error);
                  }
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                สั่งพิมพ์ใบเสร็จ
              </button>
              
              <button
                className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 text-lg font-medium"
                onClick={async () => {
                  try {
                    console.log("🖨️ เริ่มสร้างใบประหน้า...");
                    
                    // แปลงข้อมูล parcelData เป็น CoverSheetParcelData
                    const coverSheetData: CoverSheetParcelData[] = parcelData.map(item => ({
                      parcelNumber: item.parcelNumber,
                      deliveryType: item.deliveryType,
                      senderName: item.senderName,
                      senderAddress: item.senderAddress,
                      receiverName: item.receiverName,
                      receiverAddress: item.receiverAddress,
                      weight: item.weight,
                      width: item.width,
                      length: item.length,
                      height: item.height,
                      senderPhone: item.senderPhone,
                      receiverPhone: item.receiverPhone
                    }));

                    // พิมพ์ใบประหน้า
                    await printCoverSheet(
                      coverSheetData,
                      employeeData,
                      formatNumberWithCommas
                    );
                    
                    console.log("✅ พิมพ์ใบประหน้าสำเร็จ");
                    
                  } catch (error) {
                    console.error("❌ เกิดข้อผิดพลาดในการพิมพ์ใบประหน้า:", error);
                    alert("เกิดข้อผิดพลาดในการพิมพ์ใบประหน้า");
                  }
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                สั่งพิมพ์ใบประหน้า
              </button>
              
              <button
                className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 text-lg font-medium"
                onClick={() => {
                  setShowPrintPopup(false);
                  // ล้างข้อมูลพัสดุหลังจากชำระเงินเสร็จ
                  setParcelData([]);
                }}
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

export default ShippingAdd;