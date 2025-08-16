// ✅ Form Validation Utils - ยูทิลิตี้สำหรับตรวจสอบความถูกต้องของฟอร์ม
import type { 
  FormDataThai, 
  FormDataThaiLaos, 
  FormDataLaos, 
  FormDataLaosThai,
  FormErrors
} from '../types';

// 📱 Phone number validation
export const validatePhoneNumber = (phone: string): boolean => {
  // ตรวจสอบเบอร์โทรไทย (10 หลัก เริ่มต้นด้วย 0)
  const thaiPhonePattern = /^0[0-9]{9}$/;
  // ตรวจสอบเบอร์โทรลาว (8 หลัก เริ่มต้นด้วย 20 หรือ 30)
  const laosPhonePattern = /^(20|30)[0-9]{6}$/;
  
  return thaiPhonePattern.test(phone) || laosPhonePattern.test(phone);
};

// 📏 Weight validation (ต้องเป็นตัวเลขและมากกว่า 0)
export const validateWeight = (weight: string): boolean => {
  const weightNum = parseFloat(weight);
  return !isNaN(weightNum) && weightNum > 0 && weightNum <= 100; // สูงสุด 100 กิโลกรัม
};

// 📐 Dimension validation (ต้องเป็นตัวเลขและมากกว่า 0)
export const validateDimension = (dimension: string): boolean => {
  const dimensionNum = parseFloat(dimension);
  return !isNaN(dimensionNum) && dimensionNum > 0 && dimensionNum <= 200; // สูงสุด 200 ซม.
};

// 📝 Name validation (ไม่ใช่ช่องว่างและมีความยาวเพียงพอ)
export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100;
};

// 🏠 Address validation
export const validateAddress = (address: string): boolean => {
  return address.trim().length >= 10 && address.trim().length <= 500;
};

// 🇹🇭 Validate Thai form
export const validateThaiForm = (formData: FormDataThai): FormErrors => {
  const errors: FormErrors = {};

  // Sender validation
  if (!validateName(formData.senderNameThai)) {
    errors.senderNameThai = 'ชื่อผู้ส่งต้องมีความยาว 2-100 ตัวอักษร';
  }

  if (!validatePhoneNumber(formData.senderPhoneThai)) {
    errors.senderPhoneThai = 'เบอร์โทรผู้ส่งไม่ถูกต้อง (ต้องเป็นเลข 10 หลัก เริ่มต้นด้วย 0)';
  }

  if (!validateAddress(formData.senderAddressThai)) {
    errors.senderAddressThai = 'ที่อยู่ผู้ส่งต้องมีความยาว 10-500 ตัวอักษร';
  }

  if (!formData.senderAddressAreaThai.trim()) {
    errors.senderAddressAreaThai = 'กรุณาเลือกพื้นที่ผู้ส่ง';
  }

  // Receiver validation
  if (!validateName(formData.receiverNameThai)) {
    errors.receiverNameThai = 'ชื่อผู้รับต้องมีความยาว 2-100 ตัวอักษร';
  }

  if (!validatePhoneNumber(formData.receiverPhoneThai)) {
    errors.receiverPhoneThai = 'เบอร์โทรผู้รับไม่ถูกต้อง (ต้องเป็นเลข 10 หลัก เริ่มต้นด้วย 0)';
  }

  if (!validateAddress(formData.receiverAddressThai)) {
    errors.receiverAddressThai = 'ที่อยู่ผู้รับต้องมีความยาว 10-500 ตัวอักษร';
  }

  if (!formData.receiverAddressAreaThai.trim()) {
    errors.receiverAddressAreaThai = 'กรุณาเลือกพื้นที่ผู้รับ';
  }

  // Package validation
  if (!validateWeight(formData.weightThai)) {
    errors.weightThai = 'น้ำหนักต้องเป็นตัวเลข 0.1-100 กิโลกรัม';
  }

  if (!validateDimension(formData.widthThai)) {
    errors.widthThai = 'ความกว้างต้องเป็นตัวเลข 1-200 ซม.';
  }

  if (!validateDimension(formData.lengthThai)) {
    errors.lengthThai = 'ความยาวต้องเป็นตัวเลข 1-200 ซม.';
  }

  if (!validateDimension(formData.heightThai)) {
    errors.heightThai = 'ความสูงต้องเป็นตัวเลข 1-200 ซม.';
  }

  if (!formData.productTypeThai.trim()) {
    errors.productTypeThai = 'กรุณาระบุประเภทสินค้า';
  }

  return errors;
};

// 🇹🇭➡️🇱🇦 Validate Thai-Laos form
export const validateThaiLaosForm = (formData: FormDataThaiLaos): FormErrors => {
  const errors: FormErrors = {};

  // Sender validation (Thai side)
  if (!validateName(formData.senderNameThaiLaos)) {
    errors.senderNameThaiLaos = 'ชื่อผู้ส่งต้องมีความยาว 2-100 ตัวอักษร';
  }

  if (!validatePhoneNumber(formData.senderPhoneThaiLaos)) {
    errors.senderPhoneThaiLaos = 'เบอร์โทรผู้ส่งไม่ถูกต้อง';
  }

  if (!validateAddress(formData.senderAddressThaiLaos)) {
    errors.senderAddressThaiLaos = 'ที่อยู่ผู้ส่งต้องมีความยาว 10-500 ตัวอักษร';
  }

  if (!formData.senderAddressAreaThaiLaos.trim()) {
    errors.senderAddressAreaThaiLaos = 'กรุณาเลือกพื้นที่ผู้ส่ง';
  }

  // Receiver validation (Laos side)
  if (!validateName(formData.receiverNameThaiLaos)) {
    errors.receiverNameThaiLaos = 'ชื่อผู้รับต้องมีความยาว 2-100 ตัวอักษร';
  }

  if (!validatePhoneNumber(formData.receiverPhoneThaiLaos)) {
    errors.receiverPhoneThaiLaos = 'เบอร์โทรผู้รับไม่ถูกต้อง';
  }

  if (!validateAddress(formData.receiverAddressThaiLaos)) {
    errors.receiverAddressThaiLaos = 'ที่อยู่ผู้รับต้องมีความยาว 10-500 ตัวอักษร';
  }

  if (!formData.receiverVillagesThaiLaos.trim()) {
    errors.receiverVillagesThaiLaos = 'กรุณาเลือกหมู่บ้านผู้รับ';
  }

  if (!formData.receiverDistricThaiLaos.trim()) {
    errors.receiverDistricThaiLaos = 'กรุณาเลือกอำเภอผู้รับ';
  }

  if (!formData.receiverProvincestThaiLaos.trim()) {
    errors.receiverProvincestThaiLaos = 'กรุณาเลือกจังหวัดผู้รับ';
  }

  if (!formData.receiverBranchThaiLaos.trim()) {
    errors.receiverBranchThaiLaos = 'กรุณาเลือกสาขาผู้รับ';
  }

  // Package validation
  if (!validateWeight(formData.weightThaiLaos)) {
    errors.weightThaiLaos = 'น้ำหนักต้องเป็นตัวเลข 0.1-100 กิโลกรัม';
  }

  if (!validateDimension(formData.widthThaiLaos)) {
    errors.widthThaiLaos = 'ความกว้างต้องเป็นตัวเลข 1-200 ซม.';
  }

  if (!validateDimension(formData.lengthThaiLaos)) {
    errors.lengthThaiLaos = 'ความยาวต้องเป็นตัวเลข 1-200 ซม.';
  }

  if (!validateDimension(formData.heightThaiLaos)) {
    errors.heightThaiLaos = 'ความสูงต้องเป็นตัวเลข 1-200 ซม.';
  }

  if (!formData.productTypeThaiLaos.trim()) {
    errors.productTypeThaiLaos = 'กรุณาระบุประเภทสินค้า';
  }

  return errors;
};

// 🇱🇦 Validate Laos form
export const validateLaosForm = (formData: FormDataLaos): FormErrors => {
  const errors: FormErrors = {};

  // Sender validation
  if (!validateName(formData.senderNameLaos)) {
    errors.senderNameLaos = 'ชื่อผู้ส่งต้องมีความยาว 2-100 ตัวอักษร';
  }

  if (!validatePhoneNumber(formData.senderPhoneLaos)) {
    errors.senderPhoneLaos = 'เบอร์โทรผู้ส่งไม่ถูกต้อง';
  }

  if (!validateAddress(formData.senderAddressLaos)) {
    errors.senderAddressLaos = 'ที่อยู่ผู้ส่งต้องมีความยาว 10-500 ตัวอักษร';
  }

  if (!formData.senderVillagesLaos.trim()) {
    errors.senderVillagesLaos = 'กรุณาเลือกหมู่บ้านผู้ส่ง';
  }

  if (!formData.senderDistricLaos.trim()) {
    errors.senderDistricLaos = 'กรุณาเลือกอำเภอผู้ส่ง';
  }

  if (!formData.senderProvincestLaos.trim()) {
    errors.senderProvincestLaos = 'กรุณาเลือกจังหวัดผู้ส่ง';
  }

  // Receiver validation
  if (!validateName(formData.receiverNameLaos)) {
    errors.receiverNameLaos = 'ชื่อผู้รับต้องมีความยาว 2-100 ตัวอักษร';
  }

  if (!validatePhoneNumber(formData.receiverPhoneLaos)) {
    errors.receiverPhoneLaos = 'เบอร์โทรผู้รับไม่ถูกต้อง';
  }

  if (!validateAddress(formData.receiverAddressLaos)) {
    errors.receiverAddressLaos = 'ที่อยู่ผู้รับต้องมีความยาว 10-500 ตัวอักษร';
  }

  if (!formData.receiverVillagesLaos.trim()) {
    errors.receiverVillagesLaos = 'กรุณาเลือกหมู่บ้านผู้รับ';
  }

  if (!formData.receiverDistricLaos.trim()) {
    errors.receiverDistricLaos = 'กรุณาเลือกอำเภอผู้รับ';
  }

  if (!formData.receiverProvincestLaos.trim()) {
    errors.receiverProvincestLaos = 'กรุณาเลือกจังหวัดผู้รับ';
  }

  if (!formData.receiverBranchLaos.trim()) {
    errors.receiverBranchLaos = 'กรุณาเลือกสาขาผู้รับ';
  }

  // Package validation
  if (!validateWeight(formData.weightLaos)) {
    errors.weightLaos = 'น้ำหนักต้องเป็นตัวเลข 0.1-100 กิโลกรัม';
  }

  if (!validateDimension(formData.widthLaos)) {
    errors.widthLaos = 'ความกว้างต้องเป็นตัวเลข 1-200 ซม.';
  }

  if (!validateDimension(formData.lengthLaos)) {
    errors.lengthLaos = 'ความยาวต้องเป็นตัวเลข 1-200 ซม.';
  }

  if (!validateDimension(formData.heightLaos)) {
    errors.heightLaos = 'ความสูงต้องเป็นตัวเลข 1-200 ซม.';
  }

  if (!formData.productTypeLaos.trim()) {
    errors.productTypeLaos = 'กรุณาระบุประเภทสินค้า';
  }

  return errors;
};

// 🇱🇦➡️🇹🇭 Validate Laos-Thai form
export const validateLaosThaiForm = (formData: FormDataLaosThai): FormErrors => {
  const errors: FormErrors = {};

  // Sender validation (Laos side)
  if (!validateName(formData.senderNameLaosThai)) {
    errors.senderNameLaosThai = 'ชื่อผู้ส่งต้องมีความยาว 2-100 ตัวอักษร';
  }

  if (!validatePhoneNumber(formData.senderPhoneLaosThai)) {
    errors.senderPhoneLaosThai = 'เบอร์โทรผู้ส่งไม่ถูกต้อง';
  }

  if (!validateAddress(formData.senderAddressLaosThai)) {
    errors.senderAddressLaosThai = 'ที่อยู่ผู้ส่งต้องมีความยาว 10-500 ตัวอักษร';
  }

  if (!formData.senderVillagesLaosThai.trim()) {
    errors.senderVillagesLaosThai = 'กรุณาเลือกหมู่บ้านผู้ส่ง';
  }

  if (!formData.senderDistricLaosThai.trim()) {
    errors.senderDistricLaosThai = 'กรุณาเลือกอำเภอผู้ส่ง';
  }

  if (!formData.senderProvincestLaosThai.trim()) {
    errors.senderProvincestLaosThai = 'กรุณาเลือกจังหวัดผู้ส่ง';
  }

  // Receiver validation (Thai side)
  if (!validateName(formData.receiverNameLaosThai)) {
    errors.receiverNameLaosThai = 'ชื่อผู้รับต้องมีความยาว 2-100 ตัวอักษร';
  }

  if (!validatePhoneNumber(formData.receiverPhoneLaosThai)) {
    errors.receiverPhoneLaosThai = 'เบอร์โทรผู้รับไม่ถูกต้อง';
  }

  if (!validateAddress(formData.receiverAddressLaosThai)) {
    errors.receiverAddressLaosThai = 'ที่อยู่ผู้รับต้องมีความยาว 10-500 ตัวอักษร';
  }

  if (!formData.receiverAddressAreaLaosThai.trim()) {
    errors.receiverAddressAreaLaosThai = 'กรุณาเลือกพื้นที่ผู้รับ';
  }

  // Package validation
  if (!validateWeight(formData.weightLaosThai)) {
    errors.weightLaosThai = 'น้ำหนักต้องเป็นตัวเลข 0.1-100 กิโลกรัม';
  }

  if (!validateDimension(formData.widthLaosThai)) {
    errors.widthLaosThai = 'ความกว้างต้องเป็นตัวเลข 1-200 ซม.';
  }

  if (!validateDimension(formData.lengthLaosThai)) {
    errors.lengthLaosThai = 'ความยาวต้องเป็นตัวเลข 1-200 ซม.';
  }

  if (!validateDimension(formData.heightLaosThai)) {
    errors.heightLaosThai = 'ความสูงต้องเป็นตัวเลข 1-200 ซม.';
  }

  if (!formData.productTypeLaosThai.trim()) {
    errors.productTypeLaosThai = 'กรุณาระบุประเภทสินค้า';
  }

  return errors;
};

// 🔄 Generic validation function
export const validateForm = (
  formData: FormDataThai | FormDataThaiLaos | FormDataLaos | FormDataLaosThai,
  formType: 'Thai' | 'ThaiLaos' | 'Laos' | 'LaosThai'
): FormErrors => {
  switch (formType) {
    case 'Thai':
      return validateThaiForm(formData as FormDataThai);
    case 'ThaiLaos':
      return validateThaiLaosForm(formData as FormDataThaiLaos);
    case 'Laos':
      return validateLaosForm(formData as FormDataLaos);
    case 'LaosThai':
      return validateLaosThaiForm(formData as FormDataLaosThai);
    default:
      return {};
  }
};
