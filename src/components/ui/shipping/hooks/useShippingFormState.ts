// 🎛️ Shipping Form State Hook - Hook สำหรับจัดการสถานะฟอร์ม
import { useState, useCallback } from 'react';
import type { 
  FormDataThai, 
  FormDataThaiLaos, 
  FormDataLaos, 
  FormDataLaosThai,
  FormErrors,
  PopupState,
  StepState,
  TransporterState,
  DeleteConfirmation,
  ShippingType
} from '../types';

// 🏁 Initial Form Data
const initialFormDataThai: FormDataThai = {
  senderNameThai: '',
  senderPhoneThai: '',
  senderAddressThai: '',
  receiverNameThai: '',
  receiverPhoneThai: '',
  receiverAddressThai: '',
  weightThai: '',
  widthThai: '',
  lengthThai: '',
  heightThai: '',
  productTypeThai: '',
  senderAddressAreaThai: '',
  receiverAddressAreaThai: '',
  calculatedPrice: ''
};

const initialFormDataThaiLaos: FormDataThaiLaos = {
  senderNameThaiLaos: '',
  senderPhoneThaiLaos: '',
  senderAddressThaiLaos: '',
  receiverNameThaiLaos: '',
  receiverPhoneThaiLaos: '',
  receiverAddressThaiLaos: '',
  receiverVillagesThaiLaos: '',
  receiverDistricThaiLaos: '',
  receiverProvincestThaiLaos: '',
  receiverBranchThaiLaos: '',
  weightThaiLaos: '',
  widthThaiLaos: '',
  lengthThaiLaos: '',
  heightThaiLaos: '',
  productTypeThaiLaos: '',
  senderAddressAreaThaiLaos: ''
};

const initialFormDataLaos: FormDataLaos = {
  senderNameLaos: '',
  senderPhoneLaos: '',
  senderAddressLaos: '',
  senderVillagesLaos: '',
  senderDistricLaos: '',
  senderProvincestLaos: '',
  receiverNameLaos: '',
  receiverPhoneLaos: '',
  receiverAddressLaos: '',
  receiverVillagesLaos: '',
  receiverDistricLaos: '',
  receiverProvincestLaos: '',
  receiverBranchLaos: '',
  weightLaos: '',
  widthLaos: '',
  lengthLaos: '',
  heightLaos: '',
  productTypeLaos: ''
};

const initialFormDataLaosThai: FormDataLaosThai = {
  senderNameLaosThai: '',
  senderPhoneLaosThai: '',
  senderAddressLaosThai: '',
  senderVillagesLaosThai: '',
  senderDistricLaosThai: '',
  senderProvincestLaosThai: '',
  receiverNameLaosThai: '',
  receiverPhoneLaosThai: '',
  receiverAddressLaosThai: '',
  receiverAddressAreaLaosThai: '',
  productTypeLaosThai: '',
  weightLaosThai: '',
  widthLaosThai: '',
  lengthLaosThai: '',
  heightLaosThai: ''
};

export const useShippingFormState = () => {
  // 📝 Form Data States
  const [formDataThai, setFormDataThai] = useState<FormDataThai>(initialFormDataThai);
  const [formDataThaiLaos, setFormDataThaiLaos] = useState<FormDataThaiLaos>(initialFormDataThaiLaos);
  const [formDataLaos, setFormDataLaos] = useState<FormDataLaos>(initialFormDataLaos);
  const [formDataLaosThai, setFormDataLaosThai] = useState<FormDataLaosThai>(initialFormDataLaosThai);

  // ⚠️ Error States
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // 🎯 Popup States
  const [popupState, setPopupState] = useState<PopupState>({
    popup: false,
    popupThai: false,
    popupThaiLaos: false,
    popupLaos: false,
    popupLaosThai: false
  });

  // 📊 Step States
  const [stepState, setStepState] = useState<StepState>({
    thaiLaosStep: 1,
    laosThaiStep: 1
  });

  // 🚛 Transporter States
  const [transporterState, setTransporterState] = useState<TransporterState>({
    selectedTransporter: null,
    selectedLaoTransporter: null,
    selectedThaiTransporter: null
  });

  // 🗑️ Delete Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    isOpen: false,
    parcelNumber: null
  });

  // 🔄 Form Update Functions
  const updateFormData = useCallback((
    type: ShippingType, 
    field: string, 
    value: string
  ) => {
    console.log(`📝 Updating ${type} form field: ${field} = ${value}`);
    
    switch (type) {
      case 'Thai':
        setFormDataThai(prev => ({ ...prev, [field]: value }));
        break;
      case 'ThaiLaos':
        setFormDataThaiLaos(prev => ({ ...prev, [field]: value }));
        break;
      case 'Laos':
        setFormDataLaos(prev => ({ ...prev, [field]: value }));
        break;
      case 'LaosThai':
        setFormDataLaosThai(prev => ({ ...prev, [field]: value }));
        break;
    }
  }, []);

  // 🧹 Reset Form Functions
  const resetForm = useCallback((type: ShippingType) => {
    console.log(`🧹 Resetting ${type} form`);
    
    switch (type) {
      case 'Thai':
        setFormDataThai(initialFormDataThai);
        break;
      case 'ThaiLaos':
        setFormDataThaiLaos(initialFormDataThaiLaos);
        break;
      case 'Laos':
        setFormDataLaos(initialFormDataLaos);
        break;
      case 'LaosThai':
        setFormDataLaosThai(initialFormDataLaosThai);
        break;
    }
    
    // Clear errors for this form
    setFormErrors({});
  }, []);

  // ⚠️ Error Management
  const setFieldError = useCallback((field: string, message: string) => {
    setFormErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFormErrors({});
  }, []);

  // 🎯 Popup Management
  const openPopup = useCallback((type: keyof PopupState) => {
    setPopupState(prev => ({ ...prev, [type]: true }));
  }, []);

  const closePopup = useCallback((type: keyof PopupState) => {
    setPopupState(prev => ({ ...prev, [type]: false }));
  }, []);

  const closeAllPopups = useCallback(() => {
    setPopupState({
      popup: false,
      popupThai: false,
      popupThaiLaos: false,
      popupLaos: false,
      popupLaosThai: false
    });
  }, []);

  // 📊 Step Management
  const setStep = useCallback((type: 'thaiLaosStep' | 'laosThaiStep', step: number) => {
    setStepState(prev => ({ ...prev, [type]: step }));
  }, []);

  const nextStep = useCallback((type: 'thaiLaosStep' | 'laosThaiStep') => {
    setStepState(prev => ({ 
      ...prev, 
      [type]: prev[type] + 1 
    }));
  }, []);

  const prevStep = useCallback((type: 'thaiLaosStep' | 'laosThaiStep') => {
    setStepState(prev => ({ 
      ...prev, 
      [type]: Math.max(1, prev[type] - 1)
    }));
  }, []);

  return {
    // Form Data
    formDataThai,
    formDataThaiLaos,
    formDataLaos,
    formDataLaosThai,
    setFormDataThai,
    setFormDataThaiLaos,
    setFormDataLaos,
    setFormDataLaosThai,
    
    // Form Actions
    updateFormData,
    resetForm,
    
    // Error Management
    formErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    
    // Popup Management
    popupState,
    openPopup,
    closePopup,
    closeAllPopups,
    
    // Step Management
    stepState,
    setStep,
    nextStep,
    prevStep,
    
    // Transporter Management
    transporterState,
    setTransporterState,
    
    // Delete Confirmation
    deleteConfirmation,
    setDeleteConfirmation
  };
};
