// 🇱🇦 MIXAY API Service - บริการ API ขนส่งลาว
import axios from 'axios';
import type { 
  MixayPriceResponse, 
  MixayOrderResponse, 
  MixayParcelRequest,
  MixayAddress,
  MixayPackage
} from '../types/api.types';
import type { FormDataLaos, FormDataThaiLaos, FormDataLaosThai } from '../types/shipping.types';

// 🔧 Configuration
const MIXAY_API_BASE = 'https://api.mixay.la/v1';
const MIXAY_API_KEY = import.meta.env.VITE_MIXAY_API_KEY || '';

// 💰 ตรวจสอบราคาขนส่ง MIXAY
export const getMixayPrice = async (
  sender: MixayAddress,
  receiver: MixayAddress,
  packageData: MixayPackage,
  serviceType: string = 'standard'
): Promise<MixayPriceResponse> => {
  try {
    console.log('🔍 Checking MIXAY price...');
    
    const response = await axios.post<MixayPriceResponse>(`${MIXAY_API_BASE}/calculate-price`, {
      api_key: MIXAY_API_KEY,
      sender,
      receiver,
      package: packageData,
      service_type: serviceType
    });

    console.log('✅ MIXAY price response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ MIXAY price error:', error);
    throw new Error('Failed to get shipping price from MIXAY');
  }
};

// 📦 สร้างออเดอร์ MIXAY
export const createMixayOrder = async (
  orderData: MixayParcelRequest
): Promise<MixayOrderResponse> => {
  try {
    console.log('📦 Creating MIXAY order...');
    
    const response = await axios.post<MixayOrderResponse>(`${MIXAY_API_BASE}/create-order`, orderData);

    console.log('✅ MIXAY order created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ MIXAY order error:', error);
    throw new Error('Failed to create MIXAY order');
  }
};

// 🔄 แปลงข้อมูลฟอร์มลาวเป็น MIXAY format
export const convertLaosFormToMixayRequest = (
  formData: FormDataLaos
): MixayParcelRequest => {
  return {
    api_key: MIXAY_API_KEY,
    sender: {
      name: formData.senderNameLaos,
      phone: formData.senderPhoneLaos,
      address: formData.senderAddressLaos,
      village: formData.senderVillagesLaos,
      district: formData.senderDistricLaos,
      province: formData.senderProvincestLaos,
      country: 'LAO'
    },
    receiver: {
      name: formData.receiverNameLaos,
      phone: formData.receiverPhoneLaos,
      address: formData.receiverAddressLaos,
      village: formData.receiverVillagesLaos,
      district: formData.receiverDistricLaos,
      province: formData.receiverProvincestLaos,
      country: 'LAO'
    },
    package: {
      description: formData.productTypeLaos || 'Package',
      weight: parseFloat(formData.weightLaos) || 1,
      dimensions: {
        width: parseFloat(formData.widthLaos) || 10,
        length: parseFloat(formData.lengthLaos) || 10,
        height: parseFloat(formData.heightLaos) || 10
      }
    }
  };
};

// 🔄 แปลงข้อมูลฟอร์มไทย-ลาวเป็น MIXAY format
export const convertThaiLaosFormToMixayRequest = (
  formData: FormDataThaiLaos
): MixayParcelRequest => {
  return {
    api_key: MIXAY_API_KEY,
    sender: {
      name: formData.senderNameThaiLaos,
      phone: formData.senderPhoneThaiLaos,
      address: formData.senderAddressThaiLaos,
      village: '', // ไทยไม่มีข้อมูล village
      district: formData.senderAddressAreaThaiLaos,
      province: formData.senderAddressAreaThaiLaos,
      country: 'THA'
    },
    receiver: {
      name: formData.receiverNameThaiLaos,
      phone: formData.receiverPhoneThaiLaos,
      address: formData.receiverAddressThaiLaos,
      village: formData.receiverVillagesThaiLaos,
      district: formData.receiverDistricThaiLaos,
      province: formData.receiverProvincestThaiLaos,
      country: 'LAO'
    },
    package: {
      description: formData.productTypeThaiLaos || 'Package',
      weight: parseFloat(formData.weightThaiLaos) || 1,
      dimensions: {
        width: parseFloat(formData.widthThaiLaos) || 10,
        length: parseFloat(formData.lengthThaiLaos) || 10,
        height: parseFloat(formData.heightThaiLaos) || 10
      }
    }
  };
};

// 🔄 แปลงข้อมูลฟอร์มลาว-ไทยเป็น MIXAY format
export const convertLaosThaiFormToMixayRequest = (
  formData: FormDataLaosThai
): MixayParcelRequest => {
  return {
    api_key: MIXAY_API_KEY,
    sender: {
      name: formData.senderNameLaosThai,
      phone: formData.senderPhoneLaosThai,
      address: formData.senderAddressLaosThai,
      village: formData.senderVillagesLaosThai,
      district: formData.senderDistricLaosThai,
      province: formData.senderProvincestLaosThai,
      country: 'LAO'
    },
    receiver: {
      name: formData.receiverNameLaosThai,
      phone: formData.receiverPhoneLaosThai,
      address: formData.receiverAddressLaosThai,
      village: '', // ไทยไม่มีข้อมูล village  
      district: formData.receiverAddressAreaLaosThai,
      province: formData.receiverAddressAreaLaosThai,
      country: 'THA'
    },
    package: {
      description: formData.productTypeLaosThai || 'Package',
      weight: parseFloat(formData.weightLaosThai) || 1,
      dimensions: {
        width: parseFloat(formData.widthLaosThai) || 10,
        length: parseFloat(formData.lengthLaosThai) || 10,
        height: parseFloat(formData.heightLaosThai) || 10
      }
    }
  };
};

// 🔍 ติดตามสถานะพัสดุ MIXAY
export const trackMixayParcel = async (trackingNumber: string) => {
  try {
    console.log('🔍 Tracking MIXAY parcel:', trackingNumber);
    
    const response = await axios.get(`${MIXAY_API_BASE}/tracking`, {
      params: {
        api_key: MIXAY_API_KEY,
        tracking_number: trackingNumber
      }
    });

    console.log('✅ MIXAY tracking response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ MIXAY tracking error:', error);
    throw new Error('Failed to track MIXAY parcel');
  }
};
