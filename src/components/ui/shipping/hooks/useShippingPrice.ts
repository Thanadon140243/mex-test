// 💰 Shipping Price Hook - Hook สำหรับคำนวณราคาขนส่ง
import { useState, useCallback } from 'react';
import type { 
  ShippingCalculation, 
  APIProvider, 
  FormDataThai, 
  FormDataThaiLaos, 
  FormDataLaos, 
  FormDataLaosThai 
} from '../types';

type ShippingFormData = FormDataThai | FormDataThaiLaos | FormDataLaos | FormDataLaosThai;

export const useShippingPrice = () => {
  // 💰 Price State
  const [priceData, setPriceData] = useState<ShippingCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  // 🔧 Calculate shipping price
  const calculatePrice = useCallback(async (
    provider: APIProvider,
    formData: ShippingFormData,
    shippingType: string
  ) => {
    try {
      setIsCalculating(true);
      setPriceError(null);
      
      console.log(`💰 Calculating price for ${provider} - ${shippingType}`);
      
      let calculation: ShippingCalculation;
      
      switch (provider) {
        case 'SHIPPOP':
          calculation = await calculateShippopPrice(formData as FormDataThai);
          break;
        case 'MIXAY':
          calculation = await calculateMixayPrice(formData);
          break;
        default:
          throw new Error('Unknown shipping provider');
      }
      
      setPriceData(calculation);
      console.log('✅ Price calculated:', calculation);
      
      return calculation;
    } catch (error) {
      console.error('❌ Price calculation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate price';
      setPriceError(errorMessage);
      throw error;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  // 🇹🇭 Calculate SHIPPOP price
  const calculateShippopPrice = async (formData: FormDataThai): Promise<ShippingCalculation> => {
    // ตัวอย่างการคำนวณราคา SHIPPOP
    // ในระบบจริงจะต้องเรียก getShippopPrice API
    
    const basePrice = 50; // ราคาฐาน
    const weight = parseFloat(formData.weightThai) || 1;
    const volume = (parseFloat(formData.widthThai) || 10) * 
                   (parseFloat(formData.lengthThai) || 10) * 
                   (parseFloat(formData.heightThai) || 10) / 1000000; // cm³ to m³
    
    const weightPrice = weight * 10; // 10 บาท/กิโลกรัม
    const volumePrice = volume * 1000; // 1000 บาท/ลูกบาศก์เมตร
    
    const shippingFeeInBaht = basePrice + Math.max(weightPrice, volumePrice);
    
    return {
      crossingFeeInBaht: 0,
      crossingFeeInKip: 0,
      shippingFeeInBaht,
      shippingFeeInKip: 0,
      totalBaht: shippingFeeInBaht,
      totalKip: 0
    };
  };

  // 🇱🇦 Calculate MIXAY price
  const calculateMixayPrice = async (
    formData: ShippingFormData
  ): Promise<ShippingCalculation> => {
    const crossingFee = 25000; // ค่าผ่านแดน 25,000 กีบ
    const crossingFeeInBaht = crossingFee / 400; // แปลงเป็นบาท (1 บาท = 400 กีบ)
    
    const weight = parseFloat(
      ('weightLaos' in formData && formData.weightLaos) || 
      ('weightThaiLaos' in formData && formData.weightThaiLaos) || 
      ('weightLaosThai' in formData && formData.weightLaosThai) || 
      '1'
    );
    
    const baseShippingFee = weight * 5000; // 5,000 กีบ/กิโลกรัม
    const shippingFeeInKip = baseShippingFee;
    const shippingFeeInBaht = shippingFeeInKip / 400;
    
    const totalKip = crossingFee + shippingFeeInKip;
    const totalBaht = crossingFeeInBaht + shippingFeeInBaht;
    
    return {
      crossingFeeInBaht,
      crossingFeeInKip: crossingFee,
      shippingFeeInBaht,
      shippingFeeInKip,
      totalBaht,
      totalKip
    };
  };

  // 🧹 Clear price data
  const clearPriceData = useCallback(() => {
    setPriceData(null);
    setPriceError(null);
  }, []);

  // 💱 Format currency
  const formatCurrency = useCallback((amount: number, currency: 'THB' | 'LAK') => {
    const formatter = new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency === 'THB' ? 'THB' : 'LAK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return formatter.format(amount);
  }, []);

  // 📊 Get price summary
  const getPriceSummary = useCallback(() => {
    if (!priceData) return null;
    
    return {
      crossingFee: {
        baht: formatCurrency(priceData.crossingFeeInBaht, 'THB'),
        kip: formatCurrency(priceData.crossingFeeInKip, 'LAK')
      },
      shippingFee: {
        baht: formatCurrency(priceData.shippingFeeInBaht, 'THB'),
        kip: formatCurrency(priceData.shippingFeeInKip, 'LAK')
      },
      total: {
        baht: formatCurrency(priceData.totalBaht, 'THB'),
        kip: formatCurrency(priceData.totalKip, 'LAK')
      }
    };
  }, [priceData, formatCurrency]);

  return {
    // State
    priceData,
    isCalculating,
    priceError,
    
    // Actions
    calculatePrice,
    clearPriceData,
    
    // Utilities
    formatCurrency,
    getPriceSummary
  };
};
