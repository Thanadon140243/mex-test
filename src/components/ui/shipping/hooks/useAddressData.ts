// 🌍 Address Data Hook - Hook สำหรับจัดการข้อมูลที่อยู่
import { useState, useEffect, useCallback } from 'react';
import type { PostalAddressData } from '../types';
import { 
  loadAddressData, 
  filterProvinces, 
  filterDistricts, 
  filterVillages, 
  filterBranches,
  findProvinceById,
  findDistrictById,
  findVillageById,
  findBranchById
} from '../services';

export const useAddressData = () => {
  // 📊 Data States
  const [addressData, setAddressData] = useState<PostalAddressData>({
    provinces: [],
    districts: [],
    villages: [],
    branches: []
  });

  // 🔍 Selection States
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedVillageId, setSelectedVillageId] = useState<number | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  // 🔄 Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🎯 Search States
  const [searchTerms, setSearchTerms] = useState({
    province: '',
    district: '',
    village: '',
    branch: ''
  });

  // 📥 Load address data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await loadAddressData();
        setAddressData(data);
        
        console.log('✅ Address data loaded successfully');
      } catch (err) {
        console.error('❌ Failed to load address data:', err);
        setError('Failed to load address data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 🔍 Get filtered data
  const getFilteredProvinces = useCallback(() => {
    return filterProvinces(addressData.provinces, searchTerms.province);
  }, [addressData.provinces, searchTerms.province]);

  const getFilteredDistricts = useCallback(() => {
    if (!selectedProvinceId) return [];
    return filterDistricts(addressData.districts, selectedProvinceId, searchTerms.district);
  }, [addressData.districts, selectedProvinceId, searchTerms.district]);

  const getFilteredVillages = useCallback(() => {
    if (!selectedDistrictId) return [];
    return filterVillages(addressData.villages, selectedDistrictId, searchTerms.village);
  }, [addressData.villages, selectedDistrictId, searchTerms.village]);

  const getFilteredBranches = useCallback(() => {
    if (!selectedVillageId) return [];
    return filterBranches(addressData.branches, selectedVillageId, searchTerms.branch);
  }, [addressData.branches, selectedVillageId, searchTerms.branch]);

  // 🔍 Get selected items
  const getSelectedProvince = useCallback(() => {
    if (!selectedProvinceId) return null;
    return findProvinceById(addressData.provinces, selectedProvinceId);
  }, [addressData.provinces, selectedProvinceId]);

  const getSelectedDistrict = useCallback(() => {
    if (!selectedDistrictId) return null;
    return findDistrictById(addressData.districts, selectedDistrictId);
  }, [addressData.districts, selectedDistrictId]);

  const getSelectedVillage = useCallback(() => {
    if (!selectedVillageId) return null;
    return findVillageById(addressData.villages, selectedVillageId);
  }, [addressData.villages, selectedVillageId]);

  const getSelectedBranch = useCallback(() => {
    if (!selectedBranchId) return null;
    return findBranchById(addressData.branches, selectedBranchId);
  }, [addressData.branches, selectedBranchId]);

  // 🔄 Selection handlers
  const selectProvince = useCallback((provinceId: number | null) => {
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId(null);
    setSelectedVillageId(null);
    setSelectedBranchId(null);
    
    // Clear search terms for dependent fields
    setSearchTerms(prev => ({
      ...prev,
      district: '',
      village: '',
      branch: ''
    }));
  }, []);

  const selectDistrict = useCallback((districtId: number | null) => {
    setSelectedDistrictId(districtId);
    setSelectedVillageId(null);
    setSelectedBranchId(null);
    
    // Clear search terms for dependent fields
    setSearchTerms(prev => ({
      ...prev,
      village: '',
      branch: ''
    }));
  }, []);

  const selectVillage = useCallback((villageId: number | null) => {
    setSelectedVillageId(villageId);
    setSelectedBranchId(null);
    
    // Clear search term for dependent field
    setSearchTerms(prev => ({
      ...prev,
      branch: ''
    }));
  }, []);

  const selectBranch = useCallback((branchId: number | null) => {
    setSelectedBranchId(branchId);
  }, []);

  // 🔍 Search handlers
  const updateSearchTerm = useCallback((field: keyof typeof searchTerms, value: string) => {
    setSearchTerms(prev => ({ ...prev, [field]: value }));
  }, []);

  const clearSearchTerms = useCallback(() => {
    setSearchTerms({
      province: '',
      district: '',
      village: '',
      branch: ''
    });
  }, []);

  // 🧹 Reset all selections
  const resetSelections = useCallback(() => {
    setSelectedProvinceId(null);
    setSelectedDistrictId(null);
    setSelectedVillageId(null);
    setSelectedBranchId(null);
    clearSearchTerms();
  }, [clearSearchTerms]);

  // 📊 Get full address string
  const getFullAddress = useCallback(() => {
    const province = getSelectedProvince();
    const district = getSelectedDistrict();
    const village = getSelectedVillage();
    const branch = getSelectedBranch();

    const parts = [];
    if (village) parts.push(village.vill_name);
    if (district) parts.push(district.dr_name);
    if (province) parts.push(province.pr_name);
    if (branch) parts.push(`(สาขา: ${branch.name})`);

    return parts.join(', ');
  }, [getSelectedProvince, getSelectedDistrict, getSelectedVillage, getSelectedBranch]);

  return {
    // Data
    addressData,
    isLoading,
    error,
    
    // Filtered data
    filteredProvinces: getFilteredProvinces(),
    filteredDistricts: getFilteredDistricts(),
    filteredVillages: getFilteredVillages(),
    filteredBranches: getFilteredBranches(),
    
    // Selected items
    selectedProvinceId,
    selectedDistrictId,
    selectedVillageId,
    selectedBranchId,
    selectedProvince: getSelectedProvince(),
    selectedDistrict: getSelectedDistrict(),
    selectedVillage: getSelectedVillage(),
    selectedBranch: getSelectedBranch(),
    
    // Selection handlers
    selectProvince,
    selectDistrict,
    selectVillage,
    selectBranch,
    resetSelections,
    
    // Search
    searchTerms,
    updateSearchTerm,
    clearSearchTerms,
    
    // Utilities
    getFullAddress
  };
};
