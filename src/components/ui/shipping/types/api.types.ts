// 🌐 API Response Types - ประเภทข้อมูลจาก API

// 📦 SHIPPOP API Types
export interface ShippopPriceResponse {
  status: boolean;
  data?: ShippopPriceData;
  message?: string;
}

export interface ShippopPriceData {
  price: number;
  total: number;
  price_remote_area?: number;
  courier_code: string;
  courier_name: string;
  service_type_name: string;
  pickup_available: boolean;
  cod_available: boolean;
  insurance_available: boolean;
  dimension_weight?: number;
}

export interface ShippopOrderResponse {
  status: boolean;
  data?: ShippopOrderData;
  message?: string;
}

export interface ShippopOrderData {
  purchase_id: string;
  tracking: string;
  status: string;
  ref: string;
  courier_code: string;
  courier_tracking_code?: string;
}

export interface ShippopParcelRequest {
  api_key: string;
  email: string;
  password: string;
  from: ShippopAddress;
  to: ShippopAddress;
  parcel: ShippopParcel;
  value?: number;
  pickup_date?: string;
  service_type?: string;
  courier_code?: string;
  cod_amount?: number;
  remark?: string;
}

export interface ShippopAddress {
  name: string;
  phone: string;
  address: string;
  district: string;
  state: string;
  province: string;
  postcode: string;
}

export interface ShippopParcel {
  name: string;
  weight: number;
  width: number;
  length: number;
  height: number;
}

// 🇱🇦 MIXAY API Types
export interface MixayPriceResponse {
  success: boolean;
  data?: MixayPriceData;
  message?: string;
}

export interface MixayPriceData {
  shipping_fee: number;
  currency: string;
  delivery_time: string;
  service_type: string;
}

export interface MixayOrderResponse {
  success: boolean;
  data?: MixayOrderData;
  message?: string;
}

export interface MixayOrderData {
  tracking_number: string;
  order_id: string;
  status: string;
  reference_code: string;
}

export interface MixayParcelRequest {
  api_key: string;
  sender: MixayAddress;
  receiver: MixayAddress;
  package: MixayPackage;
  service_type?: string;
  delivery_instructions?: string;
  cod_amount?: number;
}

export interface MixayAddress {
  name: string;
  phone: string;
  address: string;
  village: string;
  district: string;
  province: string;
  country: string;
}

export interface MixayPackage {
  description: string;
  weight: number;
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
  value?: number;
}

// 🌍 Geolocation API Types
import { Province, District, Village, Branch } from './shipping.types';

export interface PostalAddressData {
  provinces: Province[];
  districts: District[];
  villages: Village[];
  branches: Branch[];
}

// ⚠️ Error Types
export interface APIError {
  message: string;
  status?: number;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// 🔧 Generic API Response
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}
