// 🚛 Transporters Data Constants
// ไฟล์สำหรับเก็บข้อมูลบริษัทขนส่ง

// ข้อมูลขนส่งไทย
export const thaiTransporters = [
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
] as const;

// ข้อมูลขนส่งไทย-ลาว
export const thaiLaosTransporters = [
  { name: 'MEX', image: '/img/LOGO500_500_0.jpg', isActive: true },
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
] as const;

// ข้อมูลขนส่งลาว
export const laoTransporters = [
  { name: 'Mixay', image: '/img/logoShipping/Mixay_logo.png', isActive: true },
  { name: 'HAL', image: '/img/logoShipping/HAL_logo.png', isActive: true },
] as const;

// รวม Transporters ทั้งหมดไว้ในที่เดียว
export const TRANSPORTERS = {
  THAI: thaiTransporters,
  THAI_LAOS: thaiLaosTransporters,
  LAO: laoTransporters,
} as const;
