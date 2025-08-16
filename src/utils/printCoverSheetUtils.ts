import { generateCoverSheetHTML, CoverSheetParcelData, EmployeeData } from '../templates/coverSheetTemplate';

export const printCoverSheet = (
  parcelData: CoverSheetParcelData[],
  employeeData: EmployeeData,
  formatNumberWithCommas: (number: number) => string
): Promise<void> => {
  return new Promise((resolve) => {
    try {
      // Debug ข้อมูลก่อนสร้างใบประหน้า
      console.log("🔍 DEBUG ข้อมูลที่ส่งไปยังใบประหน้า:");
      console.log("📦 parcelData:", parcelData);
      console.log("👨‍💼 employeeData:", employeeData);
      
      parcelData.forEach((item, index) => {
        console.log(`📦 พัสดุรายการที่ ${index + 1}:`, {
          parcelNumber: item.parcelNumber,
          deliveryType: item.deliveryType,
          senderName: item.senderName,
          senderAddress: item.senderAddress,
          receiverName: item.receiverName,
          receiverAddress: item.receiverAddress,
          senderPhone: item.senderPhone, // 🔍 เช็คเบอร์โทรผู้ส่ง
          receiverPhone: item.receiverPhone, // 🔍 เช็คเบอร์โทรผู้รับ
          weight: item.weight,
          width: item.width,
          length: item.length,
          height: item.height
        });
      });

      // สร้าง HTML สำหรับใบประหน้า
      const coverSheetHTML = generateCoverSheetHTML(
        parcelData,
        employeeData,
        formatNumberWithCommas
      );

      // สร้าง iframe ซ่อนสำหรับการพิมพ์
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'absolute';
      printFrame.style.top = '-9999px';
      printFrame.style.left = '-9999px';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = 'none';
      
      document.body.appendChild(printFrame);

      // เขียน HTML ลงใน iframe
      const frameDoc = printFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(coverSheetHTML);
        frameDoc.close();

        // รอให้โหลดเสร็จแล้วพิมพ์
        printFrame.onload = () => {
          setTimeout(() => {
            try {
              printFrame.contentWindow?.print();
              
              // ทำความสะอาดหลังจากพิมพ์
              setTimeout(() => {
                document.body.removeChild(printFrame);
                console.log('✅ พิมพ์ใบประหน้าสำเร็จ');
                resolve();
              }, 1000);
              
            } catch (printError) {
              console.error('❌ เกิดข้อผิดพลาดในการพิมพ์:', printError);
              document.body.removeChild(printFrame);
              resolve();
            }
          }, 500);
        };
      } else {
        console.error('❌ ไม่สามารถเข้าถึง iframe document ได้');
        document.body.removeChild(printFrame);
        resolve();
      }
      
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการสร้างใบประหน้า:', error);
      alert('เกิดข้อผิดพลาดในการพิมพ์ใบประหน้า');
      resolve();
    }
  });
};

// Export types เพื่อให้ไฟล์อื่นใช้ได้
export type { CoverSheetParcelData, EmployeeData } from '../templates/coverSheetTemplate';