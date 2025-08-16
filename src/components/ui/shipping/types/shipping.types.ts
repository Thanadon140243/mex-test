// 📦 Shipping Types - ประเภทข้อมูลสำหรับระบบขนส่ง

// 📍 Address & Postal Data Types
export interface ZipDataItem {
  ตำบล: string;
  อำเภอ: string;
  จังหวัด: string;
}

export interface ZipData {
  [zipcode: string]: ZipDataItem[];
}

export interface ParcelData {
  parcelNumber: string;
  senderReceiver: string;
  deliveryType: string;
  mitaparpPrice?: number;
  mitaparpPriceTHB?: number;
  externalPriceTHB?: number;
  externalPriceLAK?: number;
  totalPriceTHB?: number;
  totalPriceLAK?: number;
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

// 🇹🇭 Form Data Types - ฟอร์มไทย
export interface FormDataThai {
  senderNameThai: string;
  senderPhoneThai: string;
  senderAddressThai: string;
  receiverNameThai: string;
  receiverPhoneThai: string;
  receiverAddressThai: string;
  weightThai: string;
  widthThai: string;
  lengthThai: string;
  heightThai: string;
  productTypeThai: string;
  senderAddressAreaThai: string;
  receiverAddressAreaThai: string;
  calculatedPrice: string;
}

// 🇹🇭➡️🇱🇦 Form Data Types - ฟอร์มไทย-ลาว
export interface FormDataThaiLaos {
  senderNameThaiLaos: string;
  senderPhoneThaiLaos: string;
  senderAddressThaiLaos: string;
  receiverNameThaiLaos: string;
  receiverPhoneThaiLaos: string;
  receiverAddressThaiLaos: string;
  receiverVillagesThaiLaos: string;
  receiverDistricThaiLaos: string;
  receiverProvincestThaiLaos: string;
  receiverBranchThaiLaos: string;
  weightThaiLaos: string;
  widthThaiLaos: string;
  lengthThaiLaos: string;
  heightThaiLaos: string;
  productTypeThaiLaos: string;
  senderAddressAreaThaiLaos: string;
}

// 🇱🇦 Form Data Types - ฟอร์มลาว
export interface FormDataLaos {
  senderNameLaos: string;
  senderPhoneLaos: string;
  senderAddressLaos: string;
  senderVillagesLaos: string;
  senderDistricLaos: string;
  senderProvincestLaos: string;
  receiverNameLaos: string;
  receiverPhoneLaos: string;
  receiverAddressLaos: string;
  receiverVillagesLaos: string;
  receiverDistricLaos: string;
  receiverProvincestLaos: string;
  receiverBranchLaos: string;
  weightLaos: string;
  widthLaos: string;
  lengthLaos: string;
  heightLaos: string;
  productTypeLaos: string;
}

// 🇱🇦➡️🇹🇭 Form Data Types - ฟอร์มลาว-ไทย
export interface FormDataLaosThai {
  senderNameLaosThai: string;
  senderPhoneLaosThai: string;
  senderAddressLaosThai: string;
  senderVillagesLaosThai: string;
  senderDistricLaosThai: string;
  senderProvincestLaosThai: string;
  receiverNameLaosThai: string;
  receiverPhoneLaosThai: string;
  receiverAddressLaosThai: string;
  receiverAddressAreaLaosThai: string;
  productTypeLaosThai: string;
  weightLaosThai: string;
  widthLaosThai: string;
  lengthLaosThai: string;
  heightLaosThai: string;
}

// 🏢 Address Types - ประเภทข้อมูลที่อยู่
export interface Province {
  pr_id: number;
  pr_name: string;
}

export interface District {
  dr_id: number;
  dr_name: string;
  pr_id: number;
}

export interface Village {
  vill_id: number;
  vill_name: string;
  pr_id: number;
  dr_id: number;
}

export interface Branch {
  id: number;
  name: string;
  province_id: number;
  district_id: number;
  village_id: number;
}

// 🎯 Form Error Types - ประเภทข้อมูลข้อผิดพลาด
export interface FormErrors {
  [key: string]: string;
}

// 🎛️ UI State Types - ประเภทข้อมูลสถานะ UI
export interface PopupState {
  popup: boolean;
  popupThai: boolean;
  popupThaiLaos: boolean;
  popupLaos: boolean;
  popupLaosThai: boolean;
}

export interface StepState {
  thaiLaosStep: number;
  laosThaiStep: number;
}

export interface TransporterState {
  selectedTransporter: string | null;
  selectedLaoTransporter: string | null;
  selectedThaiTransporter: string | null;
}

// 🔄 Delete Confirmation Type
export interface DeleteConfirmation {
  isOpen: boolean;
  parcelNumber: string | null;
}

// 📊 Shipping Price Calculation
export interface ShippingCalculation {
  crossingFeeInBaht: number;
  crossingFeeInKip: number;
  shippingFeeInBaht: number;
  shippingFeeInKip: number;
  totalBaht: number;
  totalKip: number;
}

export type ShippingType = 'Thai' | 'ThaiLaos' | 'Laos' | 'LaosThai';
export type APIProvider = 'SHIPPOP' | 'MIXAY' | null;
