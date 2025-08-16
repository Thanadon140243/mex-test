// 🇹🇭 SHIPPOP API Service - บริการ API ขนส่งไทย
import axios from 'axios';
import type { 
  ShippopPriceResponse, 
  ShippopOrderResponse, 
  ShippopParcelRequest,
  ShippopAddress,
  ShippopParcel
} from '../types/api.types';
import type { FormDataThai } from '../types/shipping.types';

// 🔧 Configuration
const SHIPPOP_API_BASE = 'https://api.shippop.com/v2';
const SHIPPOP_API_KEY = import.meta.env.VITE_SHIPPOP_API_KEY || '';
const SHIPPOP_EMAIL = import.meta.env.VITE_SHIPPOP_EMAIL || '';
const SHIPPOP_PASSWORD = import.meta.env.VITE_SHIPPOP_PASSWORD || '';

// 💰 ตรวจสอบราคาขนส่ง SHIPPOP
export const getShippopPrice = async (
  from: ShippopAddress,
  to: ShippopAddress,
  parcel: ShippopParcel,
  courierCode: string = 'THPOST'
): Promise<ShippopPriceResponse> => {
  try {
    console.log('🔍 Checking SHIPPOP price...');
    
    const response = await axios.post<ShippopPriceResponse>(`${SHIPPOP_API_BASE}/rates`, {
      api_key: SHIPPOP_API_KEY,
      email: SHIPPOP_EMAIL,
      password: SHIPPOP_PASSWORD,
      from,
      to,
      parcel,
      courier_code: courierCode
    });

    console.log('✅ SHIPPOP price response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ SHIPPOP price error:', error);
    throw new Error('Failed to get shipping price from SHIPPOP');
  }
};

// 📦 สร้างออเดอร์ SHIPPOP
export const createShippopOrder = async (
  orderData: ShippopParcelRequest
): Promise<ShippopOrderResponse> => {
  try {
    console.log('📦 Creating SHIPPOP order...');
    
    const response = await axios.post<ShippopOrderResponse>(`${SHIPPOP_API_BASE}/orders`, orderData);

    console.log('✅ SHIPPOP order created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ SHIPPOP order error:', error);
    throw new Error('Failed to create SHIPPOP order');
  }
};

// 🔄 แปลงข้อมูลฟอร์มเป็น SHIPPOP format
export const convertFormToShippopRequest = (
  formData: FormDataThai,
  senderPostcode: string = '10400',
  receiverPostcode: string = '10400'
): ShippopParcelRequest => {
  return {
    api_key: SHIPPOP_API_KEY,
    email: SHIPPOP_EMAIL,
    password: SHIPPOP_PASSWORD,
    from: {
      name: formData.senderNameThai,
      phone: formData.senderPhoneThai,
      address: formData.senderAddressThai,
      district: formData.senderAddressAreaThai,
      state: formData.senderAddressAreaThai,
      province: formData.senderAddressAreaThai,
      postcode: senderPostcode
    },
    to: {
      name: formData.receiverNameThai,
      phone: formData.receiverPhoneThai,
      address: formData.receiverAddressThai,
      district: formData.receiverAddressAreaThai,
      state: formData.receiverAddressAreaThai,
      province: formData.receiverAddressAreaThai,
      postcode: receiverPostcode
    },
    parcel: {
      name: formData.productTypeThai || 'Package',
      weight: parseFloat(formData.weightThai) || 1,
      width: parseFloat(formData.widthThai) || 10,
      length: parseFloat(formData.lengthThai) || 10,
      height: parseFloat(formData.heightThai) || 10
    }
  };
};

// 🔍 ติดตามสถานะพัสดุ SHIPPOP
export const trackShippopParcel = async (trackingNumber: string) => {
  try {
    console.log('🔍 Tracking SHIPPOP parcel:', trackingNumber);
    
    const response = await axios.get(`${SHIPPOP_API_BASE}/tracking`, {
      params: {
        api_key: SHIPPOP_API_KEY,
        email: SHIPPOP_EMAIL,
        password: SHIPPOP_PASSWORD,
        tracking: trackingNumber
      }
    });

    console.log('✅ SHIPPOP tracking response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ SHIPPOP tracking error:', error);
    throw new Error('Failed to track SHIPPOP parcel');
  }
};

// 📦 Interface สำหรับข้อมูลพัสดุที่จะส่งคืน
export interface ShippopParcelData {
  parcelNumber: string;
  senderReceiver: string;
  deliveryType: string;
  mitaparpPrice: number;
  mitaparpPriceTHB: number;
  externalPriceTHB: number;
  externalPriceLAK: number;
  totalPriceTHB: number;
  totalPriceLAK: number;
  senderName: string;
  senderAddress: string;
  receiverName: string;
  receiverAddress: string;
  weight: number;
  width: number;
  length: number;
  height: number;
  senderPhone: string;
  receiverPhone: string;
}

// 🛠️ แยกข้อมูลที่อยู่จาก string
const parseAddressArea = (area: string) => {
  if (!area) return { postcode: "10110", district: "พญาไท", state: "ราชเทวี", province: "กรุงเทพ" };
  
  const parts = area.split(' ');
  if (parts.length >= 4) {
    return {
      postcode: parts[0] || "10110",
      district: parts[1] || "พญาไท", 
      state: parts[2] || "ราชเทวี",
      province: parts[3] || "กรุงเทพ"
    };
  }
  return { postcode: "10110", district: "พญาไท", state: "ราชเทวี", province: "กรุงเทพ" };
};

// 🚚 แปลงชื่อบริษัทขนส่งเป็น courier code
export const getCourierCode = (name: string): string => {
  if (name === "Flash Express") return "FLE";
  if (name === "Best Express") return "BEST";
  return "";
};

// 📦 จองพัสดุผ่าน SHIPPOP API (สำหรับขนส่งไทย)
export const bookThaiParcel = async (
  formData: FormDataThai, 
  courierCode: string, 
  selectedTransporter: string
): Promise<ShippopParcelData | null> => {
  console.log("📊 ข้อมูลที่กรอก:", formData);
  console.log("📤 courierCode ที่จะส่ง:", courierCode);

  // แยกข้อมูลที่อยู่
  const senderArea = parseAddressArea(formData.senderAddressAreaThai);
  const receiverArea = parseAddressArea(formData.receiverAddressAreaThai);

  console.log("📍 ข้อมูลผู้ส่งที่แยกได้:", senderArea);
  console.log("📍 ข้อมูลผู้รับที่แยกได้:", receiverArea);

  const data = JSON.stringify({
    "api_key": SHIPPOP_API_KEY || "pdd7c9b377421a98aa5732b581e6580f7f04f1f539c8b3b7a6cc18c16c277636e2c6df81a5d96e68f21747282212",
    "email": "test@shippop.com",
    "data": [
      {
        "product": {
          "0": {
            "product_code": formData.productTypeThai,
            "name": formData.productTypeThai,
            "category": formData.productTypeThai,
            "detail": "-",
            "price": "0",
            "amount": 1,
            "size": "-",
            "color": "-",
            "weight": parseFloat(formData.weightThai)
          }
        },
        "from": {
          "name": formData.senderNameThai,
          "address": formData.senderAddressThai,
          "district": senderArea.district,
          "state": senderArea.state,
          "province": senderArea.province,
          "postcode": senderArea.postcode,
          "tel": formData.senderPhoneThai
        },
        "to": {
          "name": formData.receiverNameThai,
          "address": formData.receiverAddressThai,
          "district": receiverArea.district,
          "state": receiverArea.state,
          "province": receiverArea.province,
          "postcode": receiverArea.postcode,
          "tel": formData.receiverPhoneThai
        },
        "parcel": {
          "name": "BOX1",
          "weight": parseFloat(formData.weightThai),
          "width": parseFloat(formData.widthThai),
          "length": parseFloat(formData.lengthThai),
          "height": parseFloat(formData.heightThai)
        },
        "cod_amount": 0,
        "courier_code": courierCode
      }
    ]
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: '/api/shippop/booking/',
    headers: { 
      'Content-Type': 'application/json'
    },
    data: data
  };

  console.log("📤 SHIPPOP booking config:", config);

  try {
    const response = await axios.request(config);
    console.log("✅ SHIPPOP booking response:", JSON.stringify(response.data));

    // ตรวจสอบและประมวลผล response
    if (response.data && response.data.status && response.data.data && response.data.data["0"]) {
      const d = response.data.data["0"];
      
      console.log("📦 เลขพัสดุ (tracking_code):", d.tracking_code);
      console.log("🚚 ขนส่ง (courier_code):", d.courier_code);
      console.log("💰 ราคาขนส่ง (price):", d.price);
      console.log("👤 ชื่อผู้ส่ง:", d.from?.name, "ที่อยู่:", d.from?.address);
      console.log("👤 ชื่อผู้รับ:", d.to?.name, "ที่อยู่:", d.to?.address);
      
      // สร้างข้อมูลพัสดุสำหรับเพิ่มลงตาราง
      const newParcelData: ShippopParcelData = {
        parcelNumber: d.tracking_code || "-",
        senderReceiver: `
          <div style="display:flex;flex-direction:column;gap:6px;">
            <div style="background:rgba(59,130,246,0.08);border-radius:10px;padding:4px 10px 4px 10px;display:flex;align-items:center;">
              <span style="font-weight:600;color:#2563eb;">ผู้ส่ง</span>
              <span style="color:#222;margin-left:8px;">${formData.senderNameThai || "-"}</span>
            </div>
            <div style="background:rgba(16,185,129,0.08);border-radius:10px;padding:4px 10px 4px 10px;display:flex;align-items:center;">
              <span style="font-weight:600;color:#059669;">ผู้รับ</span>
              <span style="color:#222;margin-left:8px;">${formData.receiverNameThai || "-"}</span>
            </div>
          </div>
        `,
        deliveryType: selectedTransporter || "Flash Express",
        mitaparpPrice: 0,
        mitaparpPriceTHB: 0,
        externalPriceTHB: parseFloat(d.price) || 0,
        externalPriceLAK: 0,
        totalPriceTHB: parseFloat(d.price) || 0,
        totalPriceLAK: 0,
        senderName: formData.senderNameThai || '',
        senderAddress: `${formData.senderAddressThai || ''} ${formData.senderAddressAreaThai || ''}`.trim(),
        receiverName: formData.receiverNameThai || '',
        receiverAddress: `${formData.receiverAddressThai || ''} ${formData.receiverAddressAreaThai || ''}`.trim(),
        weight: parseFloat(formData.weightThai) || 0,
        width: parseFloat(formData.widthThai) || 0,
        length: parseFloat(formData.lengthThai) || 0,
        height: parseFloat(formData.heightThai) || 0,
        senderPhone: formData.senderPhoneThai || '',
        receiverPhone: formData.receiverPhoneThai || ''
      };
      
      console.log("✅ สร้างข้อมูลพัสดุสำเร็จ");
      return newParcelData;
    } else {
      console.log("⚠️ SHIPPOP booking: ไม่พบข้อมูลพัสดุใน response");
      return null;
    }
  } catch (error) {
    console.error("❌ SHIPPOP booking error:", error);
    
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const err = error as { response?: { status?: number; data?: unknown } };
      console.error("📄 Response status:", err.response?.status);
      console.error("📄 Response data:", err.response?.data);
    } else if (typeof error === 'object' && error !== null && 'request' in error) {
      console.error("📡 No response received");
    } else {
      const err = error as { message?: string };
      console.error("⚙️ Error setting up request:", err.message);
    }
    
    throw error;
  }
};
