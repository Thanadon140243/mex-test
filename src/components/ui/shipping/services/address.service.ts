// 🌍 Address API Service - บริการข้อมูลที่อยู่
import axios from 'axios';
import type { PostalAddressData, Province, District, Village, Branch } from '../types';

// 📊 โหลดข้อมูลที่อยู่จากไฟล์ JSON
export const loadAddressData = async (): Promise<PostalAddressData> => {
  try {
    console.log('📊 Loading address data...');
    
    const response = await axios.get<PostalAddressData>('/json/postal_address_data.json');
    
    console.log('✅ Address data loaded:', {
      provinces: response.data.provinces?.length || 0,
      districts: response.data.districts?.length || 0,
      villages: response.data.villages?.length || 0,
      branches: response.data.branches?.length || 0
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to load address data:', error);
    throw new Error('Failed to load address data');
  }
};

// 🏢 กรองจังหวัด
export const filterProvinces = (provinces: Province[], searchTerm: string): Province[] => {
  if (!searchTerm) return provinces;
  
  return provinces.filter(province =>
    province.pr_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// 🏘️ กรองอำเภอตามจังหวัด
export const filterDistricts = (
  districts: District[], 
  provinceId: number, 
  searchTerm: string = ''
): District[] => {
  let filtered = districts.filter(district => district.pr_id === provinceId);
  
  if (searchTerm) {
    filtered = filtered.filter(district =>
      district.dr_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  return filtered;
};

// 🏠 กรองหมู่บ้านตามอำเภอ
export const filterVillages = (
  villages: Village[], 
  districtId: number, 
  searchTerm: string = ''
): Village[] => {
  let filtered = villages.filter(village => village.dr_id === districtId);
  
  if (searchTerm) {
    filtered = filtered.filter(village =>
      village.vill_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  return filtered;
};

// 🏪 กรองสาขาตามหมู่บ้าน
export const filterBranches = (
  branches: Branch[], 
  villageId: number, 
  searchTerm: string = ''
): Branch[] => {
  let filtered = branches.filter(branch => branch.village_id === villageId);
  
  if (searchTerm) {
    filtered = filtered.filter(branch =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  return filtered;
};

// 🔍 ค้นหาจังหวัดตาม ID
export const findProvinceById = (provinces: Province[], id: number): Province | undefined => {
  return provinces.find(province => province.pr_id === id);
};

// 🔍 ค้นหาอำเภอตาม ID
export const findDistrictById = (districts: District[], id: number): District | undefined => {
  return districts.find(district => district.dr_id === id);
};

// 🔍 ค้นหาหมู่บ้านตาม ID
export const findVillageById = (villages: Village[], id: number): Village | undefined => {
  return villages.find(village => village.vill_id === id);
};

// 🔍 ค้นหาสาขาตาม ID
export const findBranchById = (branches: Branch[], id: number): Branch | undefined => {
  return branches.find(branch => branch.id === id);
};
