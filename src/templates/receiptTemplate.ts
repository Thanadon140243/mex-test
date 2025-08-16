export interface PaymentData {
  totalAmount: number;
  receivedAmount: number;
  changeAmount: number;
  currency: 'THB' | 'LAK';
  timestamp: string;
}

export interface ParcelData {
  parcelNumber: string;
  senderReceiver: string;
  deliveryType: string;
  externalPriceTHB?: number;
  mitaparpPriceTHB?: number;
  mitaparpPrice?: number;
  externalPriceLAK?: number;
  // 🔥 เพิ่ม properties ใหม่
  senderName?: string;
  senderAddress?: string;
  receiverName?: string;
  receiverAddress?: string;
  weight?: number;
  width?: number;
  length?: number;
  height?: number;
}

export interface EmployeeData {
  name: string;
}

export const generateReceiptHTML = (
  paymentData: PaymentData | null,
  parcelData: ParcelData[],
  employeeData: EmployeeData,
  formatNumberWithCommas: (number: number) => string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>ใบเสร็จ MEX Service</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: 80mm auto;
          margin: 0;
        }
        
        body {
          font-family: 'Sarabun', 'Tahoma', Arial, sans-serif;
          margin: 0;
          padding: 8px;
          font-size: 11px;
          line-height: 1.3;
          color: #2c3e50;
          background: white;
          width: 80mm;
        }
        
        .receipt-container {
          width: 100%;
          max-width: 72mm;
          margin: 0 auto;
          padding: 12px;
          background: white;
          border: 2px solid #E52525;
          border-radius: 8px;
        }
        
        .header {
          text-align: center;
          padding-bottom: 12px;
          margin-bottom: 12px;
          border-bottom: 1px solid #E52525;
        }
        
        .logo {
          width: 45px;
          height: 45px;
          margin: 0 auto 8px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #E52525;
        }
        
        .logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .company-name {
          font-size: 16px;
          font-weight: 800;
          color: #E52525;
          margin-bottom: 2px;
          letter-spacing: 0.5px;
        }
        
        .company-subtitle {
          font-size: 8px;
          color: #666;
          margin-bottom: 6px;
          font-weight: 500;
        }
        
        .receipt-title {
          font-size: 12px;
          font-weight: 700;
          margin: 8px 0;
          color: #E52525;
        }
        
        .receipt-info {
          margin-bottom: 12px;
          background: #f8f9fa;
          padding: 8px;
          border-radius: 6px;
          border-left: 3px solid #E52525;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          padding: 1px 0;
          font-size: 9px;
        }
        
        .info-row .label {
          font-weight: 600;
          color: #34495e;
        }
        
        .info-row .value {
          font-weight: 500;
          color: #2c3e50;
          text-align: right;
        }
        
        .section-divider {
          height: 1px;
          background: #E52525;
          margin: 12px 0;
        }
        
        .section-title {
          font-size: 10px;
          font-weight: 700;
          color: #E52525;
          margin: 12px 0 8px 0;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .parcel-section {
          margin: 12px 0;
        }
        
        .parcel-item {
          background: #fff;
          margin-bottom: 8px;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid #e9ecef;
          border-left: 3px solid #E52525;
        }
        
        .parcel-number {
          font-weight: 700;
          color: #E52525;
          font-size: 9px;
          margin-bottom: 3px;
        }
        
        .parcel-type {
          font-size: 8px;
          color: #6c757d;
          margin-bottom: 3px;
          font-weight: 500;
        }
        
        .parcel-amount {
          text-align: right;
          font-weight: 700;
          font-size: 10px;
          color: #27ae60;
        }
        
        .total-section {
          background: #E52525;
          color: white;
          padding: 10px;
          border-radius: 6px;
          margin: 12px 0;
          text-align: center;
        }
        
        .total-row {
          font-weight: 800;
          font-size: 12px;
        }
        
        .total-row .amount {
          font-size: 14px;
          margin-top: 2px;
        }
        
        .payment-section {
          margin: 12px 0;
          background: #f8f9fa;
          padding: 10px;
          border-radius: 6px;
          border: 1px dashed #E52525;
        }
        
        .payment-title {
          font-weight: 700;
          color: #E52525;
          margin-bottom: 6px;
          font-size: 10px;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .payment-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 9px;
          align-items: center;
        }
        
        .payment-row .label {
          color: #6c757d;
          font-weight: 600;
        }
        
        .payment-row .value {
          font-weight: 700;
          color: #2c3e50;
          background: white;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #dee2e6;
        }
        
        .footer {
          text-align: center;
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px dashed #E52525;
          font-size: 8px;
          color: #6c757d;
        }
        
        .thank-you {
          font-weight: 700;
          color: #E52525;
          margin-bottom: 6px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .company-info {
          margin-bottom: 2px;
          line-height: 1.3;
          font-weight: 500;
        }
        
        .contact-info {
          color: #666;
          font-weight: 600;
        }
        
        /* Print Styles */
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 5px;
            width: 80mm;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .receipt-container {
            border: 2px solid #E52525;
            border-radius: 0;
          }
          
          .total-section {
            background: #E52525 !important;
            color: white !important;
          }
          
          .company-name,
          .receipt-title,
          .section-title,
          .thank-you,
          .payment-title {
            color: #E52525 !important;
          }
          
          .parcel-amount {
            color: #27ae60 !important;
          }
        }

        .parcel-item {
          background: #fff;
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #e9ecef;
          border-left: 3px solid #E52525;
        }
        
        .parcel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          padding-bottom: 4px;
          border-bottom: 1px dotted #dee2e6;
        }
        
        .parcel-number {
          font-weight: 700;
          color: #E52525;
          font-size: 9px;
        }
        
        .parcel-type {
          font-size: 8px;
          color: #6c757d;
          font-weight: 500;
        }
        
        .parcel-route {
          background: #f8f9fa;
          padding: 6px;
          border-radius: 4px;
          margin: 6px 0;
          border: 1px solid #e9ecef;
        }
        
        .route-title {
          font-size: 8px;
          font-weight: 600;
          color: #E52525;
          text-align: center;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        
        .route-info {
          display: flex;
          justify-content: space-between;
          margin: 2px 0;
          font-size: 8px;
        }
        
        .route-label {
          font-weight: 600;
          color: #6c757d;
          width: 30px;
        }
        
        .route-value {
          font-weight: 500;
          color: #495057;
          text-align: right;
          flex: 1;
        }
        
        .parcel-amount {
          text-align: right;
          font-weight: 700;
          font-size: 10px;
          color: #27ae60;
          margin-top: 4px;
        }
        .parcel-route {
          background: #f8f9fa;
          padding: 8px;
          border-radius: 4px;
          margin: 6px 0;
          border: 1px solid #e9ecef;
        }
        
        .route-title {
          font-size: 8px;
          font-weight: 600;
          color: #E52525;
          text-align: center;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .route-section {
          margin: 4px 0;
        }
        
        .route-info {
          display: flex;
          margin: 2px 0;
          font-size: 8px;
          align-items: flex-start;
        }
        
        .route-label {
          font-weight: 600;
          color: #6c757d;
          width: 35px;
          flex-shrink: 0;
        }
        
        .route-value {
          font-weight: 500;
          color: #495057;
          flex: 1;
          word-wrap: break-word;
          line-height: 1.2;
        }
        
        .route-divider {
          text-align: center;
          color: #E52525;
          font-weight: 700;
          font-size: 10px;
          margin: 4px 0;
        }

        .parcel-details {
          background: #f8f9fa;
          padding: 6px;
          border-radius: 4px;
          margin: 6px 0;
          border: 1px solid #e9ecef;
        }
        
        .details-title {
          font-size: 8px;
          font-weight: 600;
          color: #E52525;
          text-align: center;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px;
          font-size: 8px;
        }
        
        .detail-item {
          display: flex;
          justify-content: space-between;
          margin: 1px 0;
        }
        
        .detail-label {
          font-weight: 600;
          color: #6c757d;
        }
        
        .detail-value {
          font-weight: 500;
          color: #495057;
        }
        
        .size-calculation {
          grid-column: span 2;
          text-align: center;
          margin-top: 2px;
          padding: 2px;
          background: #fff;
          border-radius: 3px;
        }
        
        .size-formula {
          font-size: 7px;
          color: #6c757d;
        }
        
        .size-result {
          font-size: 8px;
          font-weight: 600;
          color: #495057;
        }
          
      </style>
    </head>
    <body>
      <div class="receipt-container">
        
        <!-- Header -->
        <div class="header">
          <div class="logo">
            <img src="/img/LOGO500_500_0.jpg" alt="MEX Service Logo" />
          </div>
          <div class="company-name">MEX SERVICE</div>
          <div class="company-subtitle">บริการขนส่งระหว่างประเทศ</div>
          <div class="receipt-title">ใบเสร็จรับเงิน</div>
        </div>

        <!-- ข้อมูลใบเสร็จ -->
        <div class="receipt-info">
          <div class="info-row">
            <span class="label">วันที่:</span>
            <span class="value">${paymentData ? new Date(paymentData.timestamp).toLocaleDateString('th-TH', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : new Date().toLocaleDateString('th-TH')}</span>
          </div>
          <div class="info-row">
            <span class="label">เลขที่ใบเสร็จ:</span>
            <span class="value">RCP-${Date.now().toString().slice(-8)}</span>
          </div>
          <div class="info-row">
            <span class="label">พนักงาน:</span>
            <span class="value">${employeeData.name}</span>
          </div>
        </div>

        <div class="section-divider"></div>
        <div class="section-title">รายการพัสดุ</div>

        <!-- รายการพัสดุ -->
        <div class="parcel-section">
          ${parcelData.map((item, index) => {
            console.log("🔍 Debug ข้อมูลพัสดุรายการที่", index + 1, ":", item);
            console.log("📋 senderReceiver:", item.senderReceiver);
            console.log("📋 senderName:", item.senderName);
            console.log("📋 senderAddress:", item.senderAddress);
            console.log("📋 receiverName:", item.receiverName);
            console.log("📋 receiverAddress:", item.receiverAddress);
            
            // แยกข้อมูลจาก senderReceiver HTML
            let senderName = 'ไม่ระบุ';
            let receiverName = 'ไม่ระบุ';
            let senderAddress = '';
            let receiverAddress = '';
            
            // ลองแยกข้อมูลจาก HTML ใน senderReceiver
            if (item.senderReceiver && item.senderReceiver.includes('<div')) {
              console.log("🔍 พบ HTML ใน senderReceiver, กำลังแยกข้อมูล...");
              
              // แยกชื่อผู้ส่ง - ใช้ regex ที่ตรงกับโครงสร้าง HTML จริง
              const senderMatch = item.senderReceiver.match(/ผู้ส่ง<\/span>\s*<span[^>]*>([^<]+)<\/span>/);
              if (senderMatch) {
                senderName = senderMatch[1].trim();
                console.log("✅ พบชื่อผู้ส่ง:", senderName);
              } else {
                console.log("❌ ไม่พบชื่อผู้ส่ง");
              }
              
              // แยกชื่อผู้รับ - ใช้ regex ที่ตรงกับโครงสร้าง HTML จริง
              const receiverMatch = item.senderReceiver.match(/ผู้รับ<\/span>\s*<span[^>]*>([^<]+)<\/span>/);
              if (receiverMatch) {
                receiverName = receiverMatch[1].trim();
                console.log("✅ พบชื่อผู้รับ:", receiverName);
              } else {
                console.log("❌ ไม่พบชื่อผู้รับ");
              }
            } else if (item.senderReceiver && item.senderReceiver.includes(' → ')) {
              // ถ้าเป็นรูปแบบ "ผู้ส่ง → ผู้รับ"
              console.log("🔍 พบรูปแบบ Arrow ใน senderReceiver");
              const parts = item.senderReceiver.split(' → ');
              if (parts.length >= 2) {
                senderName = parts[0].trim();
                receiverName = parts[1].trim();
                console.log("✅ แยกได้ - ผู้ส่ง:", senderName, "ผู้รับ:", receiverName);
              }
            }
            
            // ใช้ข้อมูลจาก properties ถ้ามี (มีความสำคัญสูงกว่า)
            if (item.senderName) {
              senderName = item.senderName;
              console.log("✅ ใช้ senderName จาก property:", senderName);
            }
            if (item.receiverName) {
              receiverName = item.receiverName;
              console.log("✅ ใช้ receiverName จาก property:", receiverName);
            }
            if (item.senderAddress) {
              senderAddress = item.senderAddress;
              console.log("✅ ใช้ senderAddress จาก property:", senderAddress);
            }
            if (item.receiverAddress) {
              receiverAddress = item.receiverAddress;
              console.log("✅ ใช้ receiverAddress จาก property:", receiverAddress);
            }
            
            console.log("🏁 ข้อมูลสุดท้ายที่จะแสดง:");
            console.log("- ผู้ส่ง:", senderName);
            console.log("- ที่อยู่ผู้ส่ง:", senderAddress);
            console.log("- ผู้รับ:", receiverName);
            console.log("- ที่อยู่ผู้รับ:", receiverAddress);
            
            return `
            <div class="parcel-item">
              <div class="parcel-header">
                <div class="parcel-number">เลขพัสดุ: ${item.parcelNumber}</div>
                <div class="parcel-type">${item.deliveryType}</div>
              </div>
              
              <div class="parcel-route">
                <div class="route-title">ข้อมูลการส่ง</div>
                
                <div class="route-section">
                  <div class="route-info">
                    <span class="route-label">ผู้ส่ง:</span>
                    <span class="route-value">${senderName}</span>
                  </div>
                  ${senderAddress ? `
                  <div class="route-info">
                    <span class="route-label">ที่อยู่:</span>
                    <span class="route-value">${senderAddress}</span>
                  </div>` : ''}
                </div>
                
                <div class="route-divider">↓</div>
                
                <div class="route-section">
                  <div class="route-info">
                    <span class="route-label">ผู้รับ:</span>
                    <span class="route-value">${receiverName}</span>
                  </div>
                  ${receiverAddress ? `
                  <div class="route-info">
                    <span class="route-label">ที่อยู่:</span>
                    <span class="route-value">${receiverAddress}</span>
                  </div>` : ''}
                </div>
              </div>
              
              <div class="parcel-details">
                <div class="details-title">รายละเอียดพัสดุ</div>
                <div class="details-grid">
                  <div class="detail-item">
                    <span class="detail-label">น้ำหนัก:</span>
                    <span class="detail-value">${item.weight || 'ไม่ระบุ'} กก.</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">กว้าง:</span>
                    <span class="detail-value">${item.width || 'ไม่ระบุ'} ซม.</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">ยาว:</span>
                    <span class="detail-value">${item.length || 'ไม่ระบุ'} ซม.</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">สูง:</span>
                    <span class="detail-value">${item.height || 'ไม่ระบุ'} ซม.</span>
                  </div>
                  
                  ${(item.width && item.length && item.height) ? `
                  <div class="size-calculation">
                    <div class="size-formula">${item.width} × ${item.length} × ${item.height}</div>
                    <div class="size-result">= ${(item.width * item.length * item.height).toLocaleString()} ลบ.ซม.</div>
                  </div>` : ''}
                </div>
              </div>
              
              <div class="parcel-amount">
                ${paymentData?.currency === 'THB' 
                  ? formatNumberWithCommas((item.externalPriceTHB || 0) + (item.mitaparpPriceTHB || 0)) + ' บาท'
                  : formatNumberWithCommas((item.mitaparpPrice || 0) + (item.externalPriceLAK || 0)) + ' กีบ'
                }
              </div>
            </div>
            `;
          }).join('')}
        </div>

        <!-- สรุปยอดเงิน -->
        <div class="total-section">
          <div class="total-row">
            <div>ยอดรวมทั้งสิ้น</div>
            <div class="amount">${paymentData 
              ? formatNumberWithCommas(paymentData.totalAmount) + ' ' + (paymentData.currency === 'THB' ? 'บาท' : 'กีบ')
              : '0'
            }</div>
          </div>
        </div>

        <!-- ข้อมูลการชำระเงิน -->
        <div class="payment-section">
          <div class="payment-title">รายละเอียดการชำระเงิน</div>
          <div class="payment-row">
            <span class="label">จำนวนเงินที่รับ:</span>
            <span class="value">${paymentData 
              ? formatNumberWithCommas(paymentData.receivedAmount) + ' ' + (paymentData.currency === 'THB' ? 'บาท' : 'กีบ')
              : '0'
            }</span>
          </div>
          <div class="payment-row">
            <span class="label">เงินทอน:</span>
            <span class="value">${paymentData 
              ? formatNumberWithCommas(paymentData.changeAmount) + ' ' + (paymentData.currency === 'THB' ? 'บาท' : 'กีบ')
              : '0'
            }</span>
          </div>
        </div>

        <div class="section-divider"></div>

        <!-- Footer -->
        <div class="footer">
          <div class="thank-you">ขอบคุณที่ใช้บริการ</div>
          <div class="company-info">MEX Service</div>
          <div class="company-info">Your Trusted Delivery Partner</div>
          <div class="company-info contact-info">www.mexservice.com</div>
          <div class="company-info contact-info">Tel: 02-123-4567</div>
          <div class="company-info contact-info">info@mexservice.com</div>
        </div>
      </div>
    </body>
    </html>
  `;
};