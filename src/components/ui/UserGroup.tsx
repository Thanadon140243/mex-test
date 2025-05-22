import React, { useState } from 'react';
import { FaTrash, FaChevronDown, FaChevronUp, FaCheckCircle } from 'react-icons/fa';

interface UserGroup {
    id: string;
    groupName: string;
    permissions: string[];
}

const UserGroup: React.FC = () => {
    const availableMenus = [
        {
            category: 'แฟรนไชส์',
            menus: [
                { id: 'menu_package', name: 'แพ็คเกจ' },
                { id: 'menu_franchise', name: 'เพิ่มแฟรนไชส์' },
                { id: 'menu_franchise_contract', name: 'สัญญาแฟรนไชส์' },
                { id: 'menu_franchise_settings', name: 'ตั้งค่าแฟรนไชส์' },
            ],
        },
        {
            category: 'เครดิต',
            menus: [
                { id: 'menu_credit_notification', name: 'รับแจ้งเติมเครดิต' },
                { id: 'menu_withdraw_credit', name: 'ถอนเครดิต' },
                { id: 'menu_credit_report', name: 'รายงานเครดิต' },
            ],
        },
        {
            category: 'การตั้งค่า',
            menus: [
                { id: 'menu_user_groups', name: 'กำหนดกลุ่มผู้ใช้งาน' },
                { id: 'menu_user_permissions', name: 'กำหนดสิทธิ์ผู้ใช้งาน' },
            ],
        },
    ];

    const initialUserGroups: UserGroup[] = [
        {
            id: 'UG001',
            groupName: 'Admin',
            permissions: ['menu_package', 'menu_franchise', 'menu_user_groups', 'menu_user_permissions'],
        },
        {
            id: 'UG002',
            groupName: 'Editor',
            permissions: ['menu_package', 'menu_franchise'],
        },
        {
            id: 'UG003',
            groupName: 'Viewer',
            permissions: [],
        },
    ];
    
    const [userGroups, setUserGroups] = useState<UserGroup[]>([...initialUserGroups]);

    const resetPermissions = (groupId: string) => {
        setUserGroups((prevGroups) =>
            prevGroups.map((group) =>
                group.id === groupId
                    ? {
                          ...group,
                          permissions: initialUserGroups.find((initialGroup: UserGroup) => initialGroup.id === groupId)?.permissions || [],
                      }
                    : group
            )
        );
    };

    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

    const toggleDropdown = (groupId: string) => {
        setDropdownOpen((prev) => (prev === groupId ? null : groupId));
    };

    const handlePermissionChange = (groupId: string, menuId: string) => {
        setUserGroups((prevGroups) =>
            prevGroups.map((group) =>
                group.id === groupId
                    ? {
                          ...group,
                          permissions: group.permissions.includes(menuId)
                              ? group.permissions.filter((id) => id !== menuId)
                              : [...group.permissions, menuId],
                      }
                    : group
            )
        );
    };

    const handleSelectAll = (groupId: string, categoryMenus: { id: string }[], isSelected: boolean) => {
        setUserGroups((prevGroups) =>
            prevGroups.map((group) =>
                group.id === groupId
                    ? {
                          ...group,
                          permissions: isSelected
                              ? [...new Set([...group.permissions, ...categoryMenus.map((menu) => menu.id)])]
                              : group.permissions.filter((id) => !categoryMenus.map((menu) => menu.id).includes(id)),
                      }
                    : group
            )
        );
    };

    // popup
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [formData, setFormData] = useState({
        groupName: '',
        permissions: [] as string[],
    });

    const resetForm = () => {
        setFormData({
            groupName: '',
            permissions: [],
        });
        setErrors({
            groupName: '',
            permissions: '',
        });
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return; // หยุดการทำงานถ้าข้อมูลไม่ถูกต้อง
        }
    
        const newGroup = {
            id: `UG${userGroups.length + 1}`.padStart(5, '0'),
            groupName: formData.groupName,
            permissions: formData.permissions,
        };
    
        setUserGroups((prevGroups) => [...prevGroups, newGroup]);
        resetForm();
        setIsPopupOpen(false);
    };

    const [errors, setErrors] = useState<{
        groupName: string;
        permissions: string;
    }>({
        groupName: '',
        permissions: '',
    });

    const validateForm = () => {
        const newErrors: { groupName: string; permissions: string } = {
            groupName: '',
            permissions: '',
        };
    
        if (!formData.groupName.trim()) {
            newErrors.groupName = 'กรุณากรอกชื่อกลุ่มผู้ใช้งาน';
        }
    
        if (formData.permissions.length === 0) {
            newErrors.permissions = 'กรุณาเลือกสิทธิ์การใช้งานอย่างน้อย 1 รายการ';
        }
    
        setErrors(newErrors);
    
        // คืนค่า true ถ้าไม่มี error
        return Object.keys(newErrors).every((key) => newErrors[key as keyof typeof newErrors] === '');
    };

    // ฟังชั่นก์ popup ยืนยันการลบ
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        groupId: string | null;
    }>({
        isOpen: false,
        groupId: null,
    });

    const openDeleteConfirmation = (groupId: string) => {
        setDeleteConfirmation({
            isOpen: true,
            groupId,
        });
    };

    const confirmDelete = () => {
        if (deleteConfirmation.groupId) {
            setUserGroups((prevGroups) =>
                prevGroups.filter((group) => group.id !== deleteConfirmation.groupId)
            );
        }
        setDeleteConfirmation({
            isOpen: false,
            groupId: null,
        });
    };

    const closeDeleteConfirmation = () => {
        setDeleteConfirmation({
            isOpen: false,
            groupId: null,
        });
    };
    // สิ้นสุด ฟังชั่นก์ popup ยืนยันการลบ

    // ฟังชั่นก์ popup ยืนยันการแก้ไข
    const [editConfirmation, setEditConfirmation] = useState<{
        isOpen: boolean;
        groupId: string | null;
    }>({
        isOpen: false,
        groupId: null,
    });

    const openEditConfirmation = (groupId: string) => {
        setEditConfirmation({
            isOpen: true,
            groupId,
        });
    };

    const confirmEdit = () => {
        if (editConfirmation.groupId) {
            // บันทึกการแก้ไขสิทธิ์ (คุณสามารถเพิ่ม logic การบันทึกที่นี่)
            console.log(`Permissions updated for group ID: ${editConfirmation.groupId}`);
            setDropdownOpen(null); // พับ Dropdown หลังบันทึก
        }
        setEditConfirmation({
            isOpen: false,
            groupId: null,
        });
    };

    const closeEditConfirmation = () => {
        setEditConfirmation({
            isOpen: false,
            groupId: null,
        });
    };
    // สิ้นสุด ฟังชั่นก์ popup ยืนยันการแก้ไข

    const closeDropdown = (groupId: string) => {
        resetPermissions(groupId); // รีเซ็ตค่าที่แก้ไขกลับไปเป็นค่าเดิม
        setDropdownOpen(null); // ปิด Dropdown
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">กลุ่มผู้ใช้งาน</h1>
            <div className="flex justify-end mb-4">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => setIsPopupOpen(true)}
                >
                    เพิ่มกลุ่มผู้ใช้งาน
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border text-center">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">ชื่อกลุ่ม</th>
                            {availableMenus.flatMap((category) => category.menus).map((menu) => (
                                <th key={menu.id} className="py-2 px-4 border-b">{menu.name}</th>
                            ))}
                            <th className="py-2 px-4 border-b">แก้ไขสิทธิ์</th>
                            <th className="py-2 px-4 border-b">ลบ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userGroups.map((group) => (
                            <React.Fragment key={group.id}>
                                <tr>
                                    <td className="py-2 px-4 border-b">{group.groupName}</td>
                                    {availableMenus.flatMap((category) => category.menus).map((menu) => (
                                        <td key={menu.id} className="py-2 px-4 border-b">
                                            {group.permissions.includes(menu.id) ? (
                                                <FaCheckCircle className="text-green-500 inline" />
                                            ) : (
                                                ''
                                            )}
                                        </td>
                                    ))}
                                    <td className="py-2 px-4 border-b">
                                    <button
                                        className="flex items-center justify-center w-full h-full text-blue-500 hover:underline"
                                        onClick={() => {
                                            if (dropdownOpen === group.id) {
                                                closeDropdown(group.id); // ปิด Dropdown และรีเซ็ตค่า
                                            } else {
                                                toggleDropdown(group.id); // เปิด Dropdown
                                            }
                                        }}
                                    >
                                        {dropdownOpen === group.id ? <FaChevronUp /> : <FaChevronDown />}
                                    </button>
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        <button
                                            className="text-red-500 hover:underline"
                                            onClick={() => openDeleteConfirmation(group.id)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                                {dropdownOpen === group.id && (
                                    <tr>
                                        <td
                                            colSpan={availableMenus.flatMap((category) => category.menus).length + 2}
                                            className="bg-gray-50 border-t"
                                        >
                                            <div className="p-6 bg-white rounded-lg shadow-md">
                                                {availableMenus.map((category) => {
                                                    const allSelected = category.menus.every((menu) =>
                                                        group.permissions.includes(menu.id)
                                                    );
                                                    return (
                                                        <div key={category.category} className="mb-6">
                                                            {/* Header ของหมวดหมู่ */}
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h3 className="text-lg font-semibold text-gray-700">
                                                                    {category.category}
                                                                </h3>
                                                                <button
                                                                    className={`text-sm px-4 py-2 rounded ${
                                                                        allSelected
                                                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                                                    }`}
                                                                    onClick={() =>
                                                                        handleSelectAll(
                                                                            group.id,
                                                                            category.menus,
                                                                            !allSelected
                                                                        )
                                                                    }
                                                                >
                                                                    {allSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                                                                </button>
                                                            </div>

                                                            {/* เมนูย่อย */}
                                                            <div className="grid grid-cols-2 gap-3 w-96 ml-8">
                                                                {category.menus.map((menu) => (
                                                                    <label
                                                                        key={menu.id}
                                                                        className="flex items-center space-x-3"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={group.permissions.includes(menu.id)}
                                                                            onChange={() =>
                                                                                handlePermissionChange(group.id, menu.id)
                                                                            }
                                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                        />
                                                                        <span className="text-gray-600">
                                                                            {menu.name}
                                                                        </span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {/* ปุ่มด้านล่าง */}
                                                <div className="flex justify-end gap-4 mt-6">
                                                    <button
                                                        className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                                                        onClick={() => resetPermissions(group.id)}
                                                    >
                                                        รีเซ็ตค่า
                                                    </button>
                                                    <button
                                                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                                                        onClick={() => openEditConfirmation(group.id)}
                                                    >
                                                        บันทึก
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* popup เพิ่มกลุ่มผู้ใช้งาน */}
            {isPopupOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => {
                            resetForm();
                            setIsPopupOpen(false);
                        }}
                    ></div>

                    {/* Popup */}
                    <div className="fixed top-0 right-0 h-full w-1/3 bg-white shadow-lg z-50 p-4 overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">เพิ่มกลุ่มผู้ใช้งาน</h2>

                        <button
                            onClick={() => {
                                resetForm();
                                setIsPopupOpen(false);
                            }}
                            className="absolute top-4 right-4 pt-1 pb-1 pr-3 pl-3 rounded bg-red-500 text-white hover:bg-red-600"
                        >
                            ✖
                        </button>

                        {/* Form */}
                        <div className="mb-4">
                            <label className="block mb-2">ชื่อกลุ่มผู้ใช้งาน:</label>
                            <input
                                type="text"
                                value={formData.groupName}
                                onChange={(e) => {
                                    setFormData((prev) => ({ ...prev, groupName: e.target.value }));
                                    setErrors((prev) => ({ ...prev, groupName: '' })); // รีเซ็ต error เฉพาะ groupName
                                }}
                                className="w-full border rounded px-3 py-2"
                                placeholder="กรอกชื่อกลุ่มผู้ใช้งาน"
                            />
                            {errors.groupName && <p className="text-red-500 text-sm mt-1">{errors.groupName}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 font-bold text-lg">สิทธิ์การใช้งาน:</label>
                            {availableMenus.map((category) => {
                                const allSelected = category.menus.every((menu) =>
                                    formData.permissions.includes(menu.id)
                                );

                                return (
                                    <div key={category.category} className="mb-4 border rounded p-4 shadow-sm">
                                        {/* หมวดหมู่ */}
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-gray-700">{category.category}</h3>
                                            <button
                                                className={`text-sm px-3 py-1 rounded ${
                                                    allSelected
                                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                                }`}
                                                onClick={() => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        permissions: allSelected
                                                            ? prev.permissions.filter(
                                                                (id) => !category.menus.map((menu) => menu.id).includes(id)
                                                            )
                                                            : [...new Set([...prev.permissions, ...category.menus.map((menu) => menu.id)])],
                                                    }));
                                                }}
                                            >
                                                {allSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                                            </button>
                                        </div>

                                        {/* เมนูย่อย */}
                                        <div className="flex flex-wrap">
                                            {category.menus.map((menu) => (
                                                <label
                                                    key={menu.id}
                                                    className="flex items-center mb-2 mr-4 w-1/2"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.permissions.includes(menu.id)}
                                                        onChange={() => {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                permissions: prev.permissions.includes(menu.id)
                                                                    ? prev.permissions.filter((id) => id !== menu.id)
                                                                    : [...prev.permissions, menu.id],
                                                            }));
                                                            setErrors((prev) => ({ ...prev, permissions: '' }));
                                                        }}
                                                        className="mr-2"
                                                    />
                                                    {menu.name}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {errors.permissions && <p className="text-red-500 text-sm mt-1">{errors.permissions}</p>}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                onClick={() => {
                                    resetForm();
                                    setIsPopupOpen(false);
                                }}
                            >
                                ยกเลิก
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={handleSubmit}
                            >
                                บันทึก
                            </button>
                        </div>
                    </div>
                </>
            )}
            {/* poppu ยืนยันการลบ */}
            {deleteConfirmation.isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={closeDeleteConfirmation}
                    ></div>

                    {/* Popup */}
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">ยืนยันการลบ</h2>
                        <p className="mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบกลุ่มผู้ใช้งานนี้?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                onClick={closeDeleteConfirmation}
                            >
                                ยกเลิก
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                onClick={confirmDelete}
                            >
                                ลบ
                            </button>
                        </div>
                    </div>
                </>
            )}
            {/* popup ยืนยันการแก้ไข */}
            {editConfirmation.isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={closeEditConfirmation}
                    ></div>

                    {/* Popup */}
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">ยืนยันการแก้ไข</h2>
                        <p className="mb-6">คุณแน่ใจหรือไม่ว่าต้องการบันทึกการแก้ไขสิทธิ์สำหรับกลุ่มนี้?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                onClick={closeEditConfirmation}
                            >
                                ยกเลิก
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={confirmEdit}
                            >
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserGroup;