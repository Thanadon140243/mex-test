export interface CoverSheetParcelData {
  parcelNumber: string;
  deliveryType: string;
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

export interface EmployeeData {
  name: string;
}

// 🎨 Function สร้าง barcode แบบสวยงาม Code 128-style
function generateBarcode(text: string): string {
  console.log("🔧 สร้าง barcode สำหรับ:", text);
  
  try {
    // ทำความสะอาดข้อความและรองรับความยาวมากขึ้น
    const cleanText = text.replace(/[^A-Z0-9]/g, '').substring(0, 12);
    console.log("📝 ข้อความที่ใช้:", cleanText || 'DEFAULT');
    
    // สร้าง professional barcode pattern
    const finalText = cleanText || 'DEFAULT';
    const barWidth = 2;
    const spacing = 1;
    const barHeight = 180;
    
    let bars = '';
    let currentX = 0;
    
    // Start pattern (บาร์โค้ด Code 128 style)
    bars += `<rect x="${currentX}" y="0" width="${barWidth * 2}" height="${barHeight}" fill="black"/>`;
    currentX += (barWidth * 2) + spacing;
    bars += `<rect x="${currentX}" y="0" width="${barWidth}" height="${barHeight}" fill="black"/>`;
    currentX += barWidth + spacing;
    bars += `<rect x="${currentX}" y="0" width="${barWidth * 2}" height="${barHeight}" fill="black"/>`;
    currentX += (barWidth * 2) + (spacing * 3);
    
    // Data bars - แต่ละตัวอักษรใช้ pattern ที่ซับซ้อนกว่า
    for (let i = 0; i < finalText.length; i++) {
      const char = finalText[i];
      const charCode = char.charCodeAt(0);
      
      // สร้าง 6 bars สำหรับแต่ละตัวอักษร (pattern ที่หนาแน่นกว่า)
      const pattern = [
        (charCode % 4) + 1,
        ((charCode + 1) % 3) + 1,
        ((charCode + 2) % 4) + 1,
        ((charCode + 3) % 3) + 1,
        ((charCode + 4) % 4) + 1,
        ((charCode + 5) % 3) + 1
      ];
      
      for (let j = 0; j < pattern.length; j++) {
        const barThickness = pattern[j] * barWidth;
        if (j % 2 === 0) { // แท่งดำ
          bars += `<rect x="${currentX}" y="0" width="${barThickness}" height="${barHeight}" fill="black"/>`;
        }
        currentX += barThickness;
      }
      
      // เพิ่มระยะห่างระหว่างตัวอักษร
      currentX += spacing * 2;
    }
    
    // End pattern
    currentX += spacing * 2;
    bars += `<rect x="${currentX}" y="0" width="${barWidth * 2}" height="${barHeight}" fill="black"/>`;
    currentX += (barWidth * 2) + spacing;
    bars += `<rect x="${currentX}" y="0" width="${barWidth}" height="${barHeight}" fill="black"/>`;
    currentX += barWidth + spacing;
    bars += `<rect x="${currentX}" y="0" width="${barWidth * 2}" height="${barHeight}" fill="black"/>`;
    currentX += (barWidth * 2);
    
    const totalWidth = currentX + 10;
    
    const svgHTML = `<svg width="32" height="180" viewBox="0 0 32 180" style="background: white;">
      <rect x="0" y="0" width="32" height="180" fill="white"/>
      <!-- Border frame -->
      <rect x="1" y="2" width="30" height="176" fill="none" stroke="#ddd" stroke-width="1"/>
      <!-- Vertical barcode pattern -->
      <g transform="translate(16, 10) rotate(90)">
        <g transform="translate(-${totalWidth/2}, -16)">
          ${bars}
        </g>
      </g>
      <!-- ไม่ใส่ text เพราะจะทำให้อ่านยาก -->
    </svg>`;
    
    console.log("✅ สร้าง professional barcode สำเร็จ");
    return svgHTML;
    
  } catch (error) {
    console.error("❌ Error creating barcode:", error);
    // Fallback barcode แบบสวยงาม
    return `<svg width="32" height="180" viewBox="0 0 32 180" style="background: white;">
      <rect x="0" y="0" width="32" height="180" fill="white"/>
      <rect x="1" y="2" width="30" height="176" fill="none" stroke="#ddd" stroke-width="1"/>
      <!-- Vertical barcode pattern -->
      <g transform="translate(16, 10) rotate(90)">
        <g transform="translate(-50, -16)">
          <rect x="10" y="8" width="3" height="8" fill="black"/>
          <rect x="16" y="8" width="2" height="8" fill="black"/>
          <rect x="21" y="8" width="4" height="8" fill="black"/>
          <rect x="28" y="8" width="2" height="8" fill="black"/>
          <rect x="33" y="8" width="3" height="8" fill="black"/>
          <rect x="39" y="8" width="2" height="8" fill="black"/>
          <rect x="44" y="8" width="4" height="8" fill="black"/>
          <rect x="51" y="8" width="2" height="8" fill="black"/>
          <rect x="56" y="8" width="3" height="8" fill="black"/>
          <rect x="62" y="8" width="2" height="8" fill="black"/>
          <rect x="67" y="8" width="4" height="8" fill="black"/>
        </g>
      </g>
    </svg>`;
  }
}

// 🟢 Export function สำหรับทดสอบ barcode
export function testBarcodeGeneration(testText: string = "TEST123"): string {
  console.log("🧪 ทดสอบ barcode generation");
  try {
    const result = generateBarcode(testText);
    console.log("✅ ทดสอบสำเร็จ");
    return result;
  } catch (error) {
    console.error("❌ ทดสอบล้มเหลว:", error);
    return "ERROR";
  }
}

export const generateCoverSheetHTML = (
  parcelData: CoverSheetParcelData[],
  employeeData: EmployeeData,
  formatNumberWithCommas: (number: number) => string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>ใบประหน้าพัสดุ MEX Service</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: A4;
          margin: 8mm;
        }
        
        body {
          font-family: 'Sarabun', 'Tahoma', Arial, sans-serif;
          font-size: 11px;
          line-height: 1.4;
          color: #000;
          background: white;
        }
        
        .labels-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8mm;
          padding: 0;
        }
        
        .label-container {
          width: 95mm;
          max-width: 95mm;
          border: 2px solid #000;
          font-family: 'Sarabun', sans-serif;
          font-size: 11px;
          position: relative;
          background: white;
          page-break-inside: avoid;
          margin-bottom: 8mm;
        }
        
        /* Header Section */
        .header {
          display: flex;
          align-items: center;
          background: #000;
          color: white;
          padding: 8px 12px;
          height: 55px;
        }
        
        .logo {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid white;
          margin-right: 10px;
        }
        
        .logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .destination {
          flex: 1;
          text-align: center;
          font-weight: 800;
          font-size: 16px;
          letter-spacing: 1px;
        }
        
        /* Barcode Section - แนวตั้งด้านขวา อยู่ตรงกลาง */
        .barcode-vertical {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 280px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          background: white;
          z-index: 10;
          border-left: 2px solid #000;
          box-shadow: inset 2px 0 4px rgba(0,0,0,0.1);
          gap: 4px;
        }
        
        .barcode-svg {
          width: 32px;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          padding: 0;
        }
        
        .barcode-svg svg {
          width: 32px;
          height: 180px;
        }
        
        .barcode-number {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: #000;
          background: white;
          padding: 2px 1px;
          border: 1px solid #ddd;
          border-radius: 2px;
          line-height: 1;
          width: 12px;
          text-align: center;
        }
        
        /* Tracking Code Section - แยกออกมาเป็นแถวใหม่ */
        .tracking-code-section {
          padding: 6px 8px;
          border-bottom: 1px solid #ddd;
          font-size: 11px;
          line-height: 1.4;
          background: #f0f8ff;
          margin-right: 52px;
          text-align: center;
        }
        
        .tracking-code-label {
          font-weight: 800;
          color: #000;
          margin-bottom: 2px;
        }
        
        .tracking-code-value {
          font-weight: 900;
          font-size: 13px;
          letter-spacing: 1px;
          color: #000;
        }
        
        /* Branch Code Vertical - ปรับตำแหน่งให้เหมาะสมกับบาร์โค้ดใหม่ */
        .branch-code-vertical {
          position: absolute;
          right: 52px;
          top: 65px;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          background: #000;
          color: white;
          padding: 8px 4px;
          font-weight: 900;
          font-size: 16px;
          letter-spacing: 2px;
          z-index: 5;
          border-radius: 0 0 0 4px;
        }
        
        /* Info Sections */
        .info-section {
          padding: 6px 8px;
          border-bottom: 1px solid #ddd;
          font-size: 11px;
          line-height: 1.4;
          background: white;
          margin-right: 52px;
        }
        
        .info-section:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-weight: 800;
          color: #000;
        }
        
        .info-value {
          color: #000;
          word-wrap: break-word;
          font-weight: 600;
        }
        
        .parcel-details {
          background: #f9f9f9 !important;
        }
        
        .shipping-fee {
          background: #fff3cd !important;
          font-weight: 800;
        }
        
        .system-info {
          background: #e9ecef !important;
          font-size: 10px;
        }
        
        .footer {
          font-size: 9px;
          line-height: 1.2;
          color: #000;
          background: #f8f9fa !important;
          text-align: center;
          padding: 8px !important;
        }
        
        /* Print Styles */
        @media print {
          @page {
            size: A4;
            margin: 6mm;
          }
          
          body {
            margin: 0;
            padding: 0;
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .labels-container {
            gap: 6mm;
          }
          
          .label-container {
            border: 2px solid black !important;
            background: white !important;
            margin-bottom: 6mm;
          }
          
          .header {
            background: black !important;
            color: white !important;
          }
          
          .logo {
            border: 2px solid white !important;
          }
          
          .branch-code-vertical {
            background: black !important;
            color: white !important;
          }
          
          .barcode-vertical {
            background: white !important;
            border-left: 2px solid #000 !important;
            box-shadow: none !important;
          }
          
          .barcode-svg {
            background: white !important;
          }
          
          .barcode-svg svg {
            background: white !important;
          }
          
          .tracking-code-section {
            background: #f5f5f5 !important;
            border-bottom: 1px solid black !important;
          }
          
          .info-section {
            border-bottom: 1px solid #ddd !important;
          }
          
          .parcel-details {
            background: #f5f5f5 !important;
          }
          
          .shipping-fee {
            background: #f0f0f0 !important;
          }
          
          .system-info {
            background: #e5e5e5 !important;
          }
          
          .footer {
            background: #f0f0f0 !important;
            color: #000 !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="labels-container">
        ${parcelData.map((item, index) => {
          // 🔍 Debug ข้อมูลแต่ละรายการก่อนสร้าง HTML
          console.log("🏷️ Debug ข้อมูลพัสดุใน Label รายการที่", index + 1, ":", item);
          console.log("🏷️ Debug เบอร์โทรของรายการที่", index + 1, ":", {
            senderPhone: item.senderPhone,
            receiverPhone: item.receiverPhone,
            senderName: item.senderName,
            receiverName: item.receiverName
          });
          
          const senderName = item.senderName || 'ไม่ระบุ';
          const receiverName = item.receiverName || 'ไม่ระบุ';
          const senderAddress = item.senderAddress || 'ไม่ระบุ';
          const receiverAddress = item.receiverAddress || 'ไม่ระบุ';
          const senderPhone = item.senderPhone || '-';
          const receiverPhone = item.receiverPhone || '-';
          
          // 🔍 Debug ค่าหลังจาก assign
          console.log("🏷️ Debug ค่าที่จะใช้ในใบประหน้า:", {
            senderName,
            receiverName,
            senderPhone,
            receiverPhone,
            senderAddress,
            receiverAddress
          });
          
          // สร้าง Branch Code จาก deliveryType
          const branchCode = item.deliveryType.includes('Mixay') ? 'M553' : 
                           item.deliveryType.includes('HAL') ? 'H001' : 'B001';
          
          // คำนวณค่าจัดส่ง
          const shippingFee = item.weight ? (item.weight * 50).toFixed(0) : '0';
          
          // 🟢 สร้าง barcode จากหมายเลขพัสดุ
          console.log("🔧 เริ่มสร้าง barcode สำหรับ:", item.parcelNumber);
          let barcodeHTML = '';
          
          try {
            if (!item.parcelNumber || item.parcelNumber.trim() === '') {
              console.warn("⚠️ หมายเลขพัสดุว่างเปล่า, ใช้ค่าเริ่มต้น");
              barcodeHTML = generateBarcode('DEFAULT');
            } else {
              barcodeHTML = generateBarcode(item.parcelNumber);
            }
            console.log("✅ สร้าง barcode สำเร็จ");
          } catch (error) {
            console.error("❌ เกิดข้อผิดพลาดในการสร้าง barcode:", error);
            // ใช้ barcode สำรอง
            barcodeHTML = `<svg width="32" height="180" viewBox="0 0 32 180" style="background: white;">
              <rect x="0" y="0" width="32" height="180" fill="white"/>
              <rect x="1" y="2" width="30" height="176" fill="none" stroke="#ddd" stroke-width="1"/>
              <!-- Vertical barcode pattern -->
              <g transform="translate(16, 10) rotate(90)">
                <g transform="translate(-50, -16)">
                  <rect x="10" y="8" width="3" height="8" fill="black"/>
                  <rect x="16" y="8" width="2" height="8" fill="black"/>
                  <rect x="21" y="8" width="4" height="8" fill="black"/>
                  <rect x="28" y="8" width="2" height="8" fill="black"/>
                  <rect x="33" y="8" width="3" height="8" fill="black"/>
                </g>
              </g>
            </svg>`;
          }
          
          return `
          <div class="label-container">
            
            <!-- Header -->
            <div class="header">
              <div class="logo">
                <img src="/img/LOGO500_500_0.jpg" alt="MEX Logo">
              </div>
              <div class="destination">${item.deliveryType}</div>
            </div>

            <!-- Barcode แนวตั้งด้านขวา (ใช้ barcode จริง) -->
            <div class="barcode-vertical">
              <div class="barcode-svg">
                ${barcodeHTML}
              </div>
              <div class="barcode-number">${item.parcelNumber}</div>
            </div>

            <!-- Branch Code Vertical -->
            <div class="branch-code-vertical">${branchCode}</div>

            <!-- Tracking Code Section - แถวใหม่ -->
            <div class="tracking-code-section">
              <div class="tracking-code-label">Mittraphap</div>
              <div class="tracking-code-value">${item.parcelNumber}</div>
            </div>

            <!-- Sender and Receiver Info -->
            <div class="info-section">
              <div><span class="info-label">ผู้ส่ง:</span> <span class="info-value">${senderName}</span> || <span class="info-label">โทร:</span> <span class="info-value">${senderPhone}</span></div>
              <div><span class="info-label">ปลายทาง (ผู้รับ):</span> <span class="info-value">${receiverName}</span></div>
            </div>

            <!-- Addresses Info -->
            <div class="info-section">
              <div><span class="info-label">ผู้ส่ง:</span> <span class="info-value">${senderName}</span> || <span class="info-label">โทร:</span> <span class="info-value">${senderPhone}</span></div>
              <div><span class="info-label">ต้นทาง (ผู้ส่ง):</span> <span class="info-value">${senderAddress}</span></div>
            </div>

            <!-- Parcel Details -->
            <div class="info-section parcel-details">
              <div class="info-label">พัสดุจ่ายต้นทาง</div>
              <div>L : ${item.length || '15'}cm | W : ${item.width || '15'}cm | H : ${item.height || '15'}cm</div>
              <div>น้ำหนัก : ${formatNumberWithCommas(item.weight || 1)}Kg</div>
            </div>

            <!-- Shipping Fee -->
            <div class="info-section shipping-fee">
              <div><span class="info-label">พัสดุจ่ายต้นทาง :</span> <span class="info-value">${formatNumberWithCommas(parseInt(shippingFee))}</span></div>
            </div>

            <!-- Footer -->
            <div class="info-section footer">
              <div>วันที่: ${new Date().toLocaleDateString('th-TH', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })} ${new Date().toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })}</div>
              <div>ออกโดย: ${employeeData.name}</div>
              <div>เวลาทำการ จันทร์-ศุกร์ 08.00-18.00 น.</div>
              <div>ติดต่อสอบถาม โทร +66 65 338 8543 | Created at: ${new Date().toLocaleDateString('th-TH', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })} @ ${new Date().toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })}</div>
            </div>

          </div>
          `;
        }).join('')}
      </div>
    </body>
    </html>
  `;
};