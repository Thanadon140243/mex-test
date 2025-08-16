// 🔧 API Configuration Constants
// ไฟล์สำหรับเก็บ API URLs และ credentials

// MIXAY API Configuration
export const MIXAY_CONFIG = {
  URL: import.meta.env.VITE_MIXAY_URL,
  USERNAME: import.meta.env.VITE_MIXAY_USERNAME,
  PASSWORD: import.meta.env.VITE_MIXAY_PASSWORD,
  PARTNER_CODE: import.meta.env.VITE_MIXAY_PARTNER_CODE,
};

// HAL API Configuration
export const HAL_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_HAL_API_CLIENT_ID,
  CLIENT_SECRET: import.meta.env.VITE_HAL_API_CLIENT_SECRET,
  GRANT_TYPE: import.meta.env.VITE_HAL_API_GRANT_TYPE,
  SCOPE: import.meta.env.VITE_HAL_API_SCOPE,
  USERNAME: import.meta.env.VITE_HAL_API_USERNAME,
  PASSWORD: import.meta.env.VITE_HAL_API_PASSWORD,
};

// SHIPPOP API Configuration
export const SHIPPOP_CONFIG = {
  API_KEY: import.meta.env.VITE_SHIPPOP_API_KEY,
};

// รวม API Config ทั้งหมดไว้ในที่เดียว
export const API_CONFIG = {
  MIXAY: MIXAY_CONFIG,
  HAL: HAL_CONFIG,
  SHIPPOP: SHIPPOP_CONFIG,
} as const;
