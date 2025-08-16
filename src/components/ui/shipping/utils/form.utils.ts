// 🔧 Form Helper Utils - ยูทิลิตี้ช่วยเหลือสำหรับฟอร์ม
import type { ShippingType } from '../types';

// 📝 Generate unique parcel number
export const generateParcelNumber = (type: ShippingType): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  const prefixes = {
    Thai: 'TH',
    ThaiLaos: 'TL',
    Laos: 'LA',
    LaosThai: 'LT'
  };
  
  return `${prefixes[type]}${timestamp}${random}`;
};

// 📊 Format form data for display
export const formatFormDataForDisplay = (
  formData: Record<string, unknown>
): Record<string, string> => {
  const formatted: Record<string, string> = {};
  
  Object.entries(formData).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      // แปลงชื่อฟิลด์เป็นภาษาไทย
      const fieldName = translateFieldName(key);
      formatted[fieldName] = value;
    }
  });
  
  return formatted;
};

// 🌐 Translate field names to Thai
export const translateFieldName = (fieldName: string): string => {
  const translations: Record<string, string> = {
    // Thai form fields
    senderNameThai: 'ชื่อผู้ส่ง',
    senderPhoneThai: 'เบอร์โทรผู้ส่ง',
    senderAddressThai: 'ที่อยู่ผู้ส่ง',
    senderAddressAreaThai: 'พื้นที่ผู้ส่ง',
    receiverNameThai: 'ชื่อผู้รับ',
    receiverPhoneThai: 'เบอร์โทรผู้รับ',
    receiverAddressThai: 'ที่อยู่ผู้รับ',
    receiverAddressAreaThai: 'พื้นที่ผู้รับ',
    weightThai: 'น้ำหนัก (กก.)',
    widthThai: 'ความกว้าง (ซม.)',
    lengthThai: 'ความยาว (ซม.)',
    heightThai: 'ความสูง (ซม.)',
    productTypeThai: 'ประเภทสินค้า',
    calculatedPrice: 'ราคาที่คำนวณได้',
    
    // Thai-Laos form fields
    senderNameThaiLaos: 'ชื่อผู้ส่ง',
    senderPhoneThaiLaos: 'เบอร์โทรผู้ส่ง',
    senderAddressThaiLaos: 'ที่อยู่ผู้ส่ง',
    senderAddressAreaThaiLaos: 'พื้นที่ผู้ส่ง',
    receiverNameThaiLaos: 'ชื่อผู้รับ',
    receiverPhoneThaiLaos: 'เบอร์โทรผู้รับ',
    receiverAddressThaiLaos: 'ที่อยู่ผู้รับ',
    receiverVillagesThaiLaos: 'หมู่บ้านผู้รับ',
    receiverDistricThaiLaos: 'อำเภอผู้รับ',
    receiverProvincestThaiLaos: 'จังหวัดผู้รับ',
    receiverBranchThaiLaos: 'สาขาผู้รับ',
    weightThaiLaos: 'น้ำหนัก (กก.)',
    widthThaiLaos: 'ความกว้าง (ซม.)',
    lengthThaiLaos: 'ความยาว (ซม.)',
    heightThaiLaos: 'ความสูง (ซม.)',
    productTypeThaiLaos: 'ประเภทสินค้า',
    
    // Laos form fields
    senderNameLaos: 'ชื่อผู้ส่ง',
    senderPhoneLaos: 'เบอร์โทรผู้ส่ง',
    senderAddressLaos: 'ที่อยู่ผู้ส่ง',
    senderVillagesLaos: 'หมู่บ้านผู้ส่ง',
    senderDistricLaos: 'อำเภอผู้ส่ง',
    senderProvincestLaos: 'จังหวัดผู้ส่ง',
    receiverNameLaos: 'ชื่อผู้รับ',
    receiverPhoneLaos: 'เบอร์โทรผู้รับ',
    receiverAddressLaos: 'ที่อยู่ผู้รับ',
    receiverVillagesLaos: 'หมู่บ้านผู้รับ',
    receiverDistricLaos: 'อำเภอผู้รับ',
    receiverProvincestLaos: 'จังหวัดผู้รับ',
    receiverBranchLaos: 'สาขาผู้รับ',
    weightLaos: 'น้ำหนัก (กก.)',
    widthLaos: 'ความกว้าง (ซม.)',
    lengthLaos: 'ความยาว (ซม.)',
    heightLaos: 'ความสูง (ซม.)',
    productTypeLaos: 'ประเภทสินค้า',
    
    // Laos-Thai form fields
    senderNameLaosThai: 'ชื่อผู้ส่ง',
    senderPhoneLaosThai: 'เบอร์โทรผู้ส่ง',
    senderAddressLaosThai: 'ที่อยู่ผู้ส่ง',
    senderVillagesLaosThai: 'หมู่บ้านผู้ส่ง',
    senderDistricLaosThai: 'อำเภอผู้ส่ง',
    senderProvincestLaosThai: 'จังหวัดผู้ส่ง',
    receiverNameLaosThai: 'ชื่อผู้รับ',
    receiverPhoneLaosThai: 'เบอร์โทรผู้รับ',
    receiverAddressLaosThai: 'ที่อยู่ผู้รับ',
    receiverAddressAreaLaosThai: 'พื้นที่ผู้รับ',
    weightLaosThai: 'น้ำหนัก (กก.)',
    widthLaosThai: 'ความกว้าง (ซม.)',
    lengthLaosThai: 'ความยาว (ซม.)',
    heightLaosThai: 'ความสูง (ซม.)',
    productTypeLaosThai: 'ประเภทสินค้า'
  };
  
  return translations[fieldName] || fieldName;
};

// 💱 Currency formatter
export const formatCurrency = (amount: number, currency: 'THB' | 'LAK'): string => {
  if (currency === 'THB') {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  } else {
    return new Intl.NumberFormat('lo-LA', {
      style: 'currency',
      currency: 'LAK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
};

// 📅 Format date for display
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// 🔄 Get shipping type display name
export const getShippingTypeDisplayName = (type: ShippingType): string => {
  const displayNames = {
    Thai: 'ขนส่งภายในไทย',
    ThaiLaos: 'ขนส่งไทย - ลาว',
    Laos: 'ขนส่งภายในลาว',
    LaosThai: 'ขนส่งลาว - ไทย'
  };
  
  return displayNames[type];
};

// 📊 Calculate volume weight
export const calculateVolumeWeight = (
  width: number,
  length: number,
  height: number,
  divisor: number = 6000
): number => {
  return (width * length * height) / divisor;
};

// ⚖️ Get chargeable weight (higher of actual weight or volume weight)
export const getChargeableWeight = (
  actualWeight: number,
  width: number,
  length: number,
  height: number
): number => {
  const volumeWeight = calculateVolumeWeight(width, length, height);
  return Math.max(actualWeight, volumeWeight);
};

// 🎨 Get status color
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    'in-transit': 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

// 🔍 Filter and search helpers
export const filterBySearchTerm = <T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm) return items;
  
  const term = searchTerm.toLowerCase();
  
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      return typeof value === 'string' && value.toLowerCase().includes(term);
    })
  );
};

// 📱 Mobile detection
export const isMobile = (): boolean => {
  return window.innerWidth < 768;
};

// 📋 Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// 🔄 Debounce function
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 📏 Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
