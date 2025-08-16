// 🔢 Number Formatting Utilities
// ไฟล์สำหรับฟังก์ชันจัดรูปแบบตัวเลข

// ฟังก์ชันสำหรับใส่เครื่องหมายจุลภาคในตัวเลข
export const formatNumberWithCommas = (number: number): string => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
