/**
 * usePostalData Hook
 * จัดการข้อมูลรหัสไปรษณีย์สำหรับ ShippingAdd component
 */

import { useState, useEffect } from 'react';

export interface ZipDataItem {
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
}

export interface ZipData {
  [zipcode: string]: ZipDataItem[];
}

// Thai interface for compatibility with existing code
interface ThaiZipDataItem {
  ตำบล: string;
  อำเภอ: string;
  จังหวัด: string;
}

interface ThaiZipData {
  [zipcode: string]: ThaiZipDataItem[];
}

/**
 * Hook สำหรับจัดการข้อมูลรหัสไปรษณีย์
 */
export const usePostalData = () => {
  const [thaiZipData, setThaiZipData] = useState<ThaiZipData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/json/postal_address_data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setThaiZipData(data);
      } catch (err) {
        console.error('Error loading postal data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load postal data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * ค้นหาข้อมูลรหัสไปรษณีย์
   * @param inputValue รหัสไปรษณีย์ที่ต้องการค้นหา
   * @returns ThaiZipDataItem[] ผลลัพธ์การค้นหา
   */
  const searchZipCode = (inputValue: string): ThaiZipDataItem[] => {
    if (inputValue in thaiZipData) {
      return thaiZipData[inputValue];
    }
    return [];
  };

  /**
   * หารหัสไปรษณีย์จาก ThaiZipDataItem
   * @param selectedItem รายการที่เลือก
   * @returns string | undefined รหัสไปรษณีย์
   */
  const findZipCodeByItem = (selectedItem: ThaiZipDataItem): string | undefined => {
    return Object.keys(thaiZipData).find((key) => thaiZipData[key].includes(selectedItem));
  };

  return {
    zipData: thaiZipData,
    isLoading,
    error,
    searchZipCode,
    findZipCodeByItem
  };
};
