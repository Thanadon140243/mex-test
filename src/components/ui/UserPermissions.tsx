import React, { useState } from 'react';
import { FaTrash, FaEdit, FaBoxOpen, FaCreditCard, FaCog } from 'react-icons/fa';

interface User {
    id: string;
    username: string;
    password: string;
    phone: string;
    email: string;
    position: string; // UserGroup
    permissions: string[];
}

const UserPermissions: React.FC = () => {
    const initialUsers: User[] = [
        {
            id: 'U001',
            username: 'John Doe',
            password: 'password123',
            phone: '0812345678',
            email: 'john.doe@example.com',
            position: 'Admin',
            permissions: ['menu_package', 'menu_user_permissions'],
        },
    ];

    const userGroups = ['Admin', 'Editor', 'Viewer'];

    const [users, setUsers] = useState<User[]>([...initialUsers]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: '', // Add the id property
        username: '',
        password: '',
        phone: '',
        email: '',
        position: '',
        permissions: [] as string[],
    });
    const [errors, setErrors] = useState({
      username: '',
      password: '',
      phone: '',
      email: '',
      position: '',
      permissions: '', // Add this property
  });

    const resetForm = () => {
        setFormData({
            id: '', // Reset the id property
            username: '',
            password: '',
            phone: '',
            email: '',
            position: '',
            permissions: [],
        });
        setErrors({
            username: '',
            password: '',
            phone: '',
            email: '',
            position: '',
            permissions: '',
        });
    };

    const validateForm = () => {
      const newErrors = {
          username: '',
          password: '',
          phone: '',
          email: '',
          position: '',
          permissions: '',
      };
  
      if (!formData.username.trim()) {
          newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
      }
  
      if (!formData.password.trim()) {
          newErrors.password = 'กรุณากรอกรหัสผ่าน';
      }
  
      if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) {
          newErrors.phone = 'กรุณากรอกเบอร์โทรให้ถูกต้อง (10 ตัวเลข)';
      }
  
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'กรุณากรอกอีเมล์ให้ถูกต้อง';
      }
  
      if (!formData.position.trim()) {
          newErrors.position = 'กรุณาเลือกตำแหน่ง';
      }
  
      setErrors(newErrors);
  
      // คืนค่า true ถ้าไม่มี error
      return Object.values(newErrors).every((error) => error === '');
  };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const newUser: User = {
            id: `U${users.length + 1}`.padStart(4, '0'),
            username: formData.username,
            password: formData.password,
            phone: formData.phone,
            email: formData.email,
            position: formData.position,
            permissions: formData.permissions,
        };

        setUsers((prevUsers) => [...prevUsers, newUser]);
        resetForm();
        setIsPopupOpen(false);
    };

    const handlePermissionChange = (permissionId: string) => {
        setFormData((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter((id) => id !== permissionId)
                : [...prev.permissions, permissionId],
        }));
    };

    const categorizedPermissions = [
      {
          category: 'แฟรนไซส์',
          permissions: [
              { id: 'menu_package', name: 'แพ็คเกจ', icon: <FaBoxOpen /> },
              { id: 'menu_franchise', name: 'เพิ่มแฟรนไซส์', icon: <FaBoxOpen /> },
              { id: 'menu_franchise_contract', name: 'สัญญาแฟรนไซส์', icon: <FaBoxOpen /> },
              { id: 'menu_franchise_settings', name: 'ตั้งค่าแฟรนไซส์', icon: <FaBoxOpen /> },
          ],
      },
      {
          category: 'เครดิต',
          permissions: [
              { id: 'menu_credit_notification', name: 'รับแจ้งเติมเครดิต', icon: <FaCreditCard /> },
              { id: 'menu_withdraw_credit', name: 'ถอนเครดิต', icon: <FaCreditCard /> },
              { id: 'menu_credit_report', name: 'รายงานเครดิต', icon: <FaCreditCard /> },
          ],
      },
      {
          category: 'ตั้งค่าทั่วไป',
          permissions: [
              { id: 'menu_user_groups', name: 'กำหนดกลุ่มผู้ใช้งาน', icon: <FaCog /> },
              { id: 'menu_user_permissions', name: 'กำหนดสิทธิ์ผู้ใช้งาน', icon: <FaCog /> },
          ],
      },
  ];

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
      setExpandedCategories((prev) =>
          prev.includes(category)
              ? prev.filter((cat) => cat !== category) // พับหมวดหมู่
              : [...prev, category] // ขยายหมวดหมู่
      );
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    userId: string | null;
  }>({
      isOpen: false,
      userId: null,
  });

  const openDeleteConfirmation = (userId: string) => {
    setDeleteConfirmation({
        isOpen: true,
        userId,
    });
};

const confirmDelete = () => {
    if (deleteConfirmation.userId) {
        setUsers((prevUsers) =>
            prevUsers.filter((user) => user.id !== deleteConfirmation.userId)
        );
    }
    setDeleteConfirmation({
        isOpen: false,
        userId: null,
    });
};

const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
        isOpen: false,
        userId: null,
    });
};

const [editConfirmation, setEditConfirmation] = useState<{
  isOpen: boolean;
  userId: string | null;
}>({
  isOpen: false,
  userId: null,
});

const [isEditing, setIsEditing] = useState(false);

const openEditForm = (userId: string) => {
  const userToEdit = users.find((user) => user.id === userId);
  if (userToEdit) {
      setFormData({
          id: userToEdit.id, // เพิ่ม id ที่นี่
          username: userToEdit.username,
          password: userToEdit.password,
          phone: userToEdit.phone,
          email: userToEdit.email,
          position: userToEdit.position,
          permissions: userToEdit.permissions,
      });
      setIsEditing(true); // ตั้งสถานะเป็นการแก้ไข
      setIsPopupOpen(true);
  }
};

const openEditConfirmation = (userId: string) => {
  setEditConfirmation({
      isOpen: true,
      userId,
  });
};

const confirmEdit = () => {
  if (editConfirmation.userId) {
      setUsers((prevUsers) =>
          prevUsers.map((user) =>
              user.id === editConfirmation.userId
                  ? {
                        ...user,
                        username: formData.username,
                        password: formData.password,
                        phone: formData.phone,
                        email: formData.email,
                        position: formData.position,
                        permissions: formData.permissions,
                    }
                  : user
          )
      );
  }
  setEditConfirmation({
      isOpen: false,
      userId: null,
  });
  resetForm();
  setIsPopupOpen(false);
  setIsEditing(false);
};

const closeEditConfirmation = () => {
  setEditConfirmation({
      isOpen: false,
      userId: null,
  });
};



    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">จัดการผู้ใช้งาน</h1>
            <div className="flex justify-end mb-4">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => setIsPopupOpen(true)}
                >
                    เพิ่มผู้ใช้งาน
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border text-center">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">ชื่อผู้ใช้</th>
                            <th className="py-2 px-4 border-b">เบอร์โทร</th>
                            <th className="py-2 px-4 border-b">อีเมล์</th>
                            <th className="py-2 px-4 border-b">ตำแหน่ง</th>
                            <th className="py-2 px-4 border-b">แก้ไข</th>
                            <th className="py-2 px-4 border-b">ลบ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="py-2 px-4 border-b">{user.username}</td>
                                <td className="py-2 px-4 border-b">{user.phone}</td>
                                <td className="py-2 px-4 border-b">{user.email}</td>
                                <td className="py-2 px-4 border-b">{user.position}</td>
                                <td className="py-2 px-4 border-b">
                                  <button
                                      className="text-blue-500 hover:underline"
                                      onClick={() => openEditForm(user.id)}
                                  >
                                      <FaEdit />
                                  </button>
                                </td>
                                <td className="py-2 px-4 border-b">
                                  <button
                                      className="text-red-500 hover:underline"
                                      onClick={() => openDeleteConfirmation(user.id)}
                                  >
                                      <FaTrash />
                                  </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

          {/* Popup เพิ่มผู้ใช้งาน */}
          {isPopupOpen && (
              <>
                  {/* Backdrop */}
                  <div
                      className="fixed inset-0 bg-black bg-opacity-50 z-40"
                      onClick={() => {
                        resetForm(); // รีเซ็ตค่าในฟอร์ม
                        setIsPopupOpen(false); // ปิดฟอร์ม
                      }}
                  ></div>

                  {/* Popup */}
                  <div className="fixed top-0 right-0 h-full w-1/3 bg-white shadow-lg z-50 p-4 overflow-y-auto">
                      <h2 className="text-xl font-bold mb-4">เพิ่มผู้ใช้งาน</h2>
                      <button
                          onClick={() => {
                            resetForm(); // รีเซ็ตค่าในฟอร์ม
                            setIsPopupOpen(false); // ปิดฟอร์ม
                          }}
                          className="absolute top-4 right-4 pt-1 pb-1 pr-3 pl-3 rounded bg-red-500 text-white hover:bg-red-600"
                      >
                          ✖
                      </button>
                      <form className="space-y-4">
                          <div>
                              <label className="block mb-2">ชื่อผู้ใช้ *</label>
                              <input
                                  type="text"
                                  value={formData.username}
                                  onChange={(e) => {
                                      setFormData((prev) => ({ ...prev, username: e.target.value }));
                                      setErrors((prev) => ({ ...prev, username: '' })); // ลบข้อความแจ้งเตือน
                                  }}
                                  className="w-full border rounded px-3 py-2"
                              />
                              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                          </div>
                          <div>
                              <label className="block mb-2">รหัสผ่าน *</label>
                              <input
                                  type="password"
                                  value={formData.password}
                                  onChange={(e) => {
                                      setFormData((prev) => ({ ...prev, password: e.target.value }));
                                      setErrors((prev) => ({ ...prev, password: '' })); // ลบข้อความแจ้งเตือน
                                  }}
                                  className="w-full border rounded px-3 py-2"
                              />
                              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                          </div>
                          <div>
                              <label className="block mb-2">เบอร์โทร *</label>
                              <input
                                  type="text"
                                  value={formData.phone}
                                  onChange={(e) => {
                                      const value = e.target.value;
                                      if (/^\d*$/.test(value)) { // ตรวจสอบว่ามีเฉพาะตัวเลข
                                          setFormData((prev) => ({ ...prev, phone: value }));
                                          setErrors((prev) => ({ ...prev, phone: '' })); // ลบข้อความแจ้งเตือน
                                      }
                                  }}
                                  maxLength={10} // จำกัดความยาวไม่เกิน 10 ตัว
                                  className="w-full border rounded px-3 py-2"
                              />
                              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                          </div>
                          <div>
                              <label className="block mb-2">อีเมล์ *</label>
                              <input
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) => {
                                      setFormData((prev) => ({ ...prev, email: e.target.value }));
                                      setErrors((prev) => ({ ...prev, email: '' })); // ลบข้อความแจ้งเตือน
                                  }}
                                  className="w-full border rounded px-3 py-2"
                              />
                              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                          </div>
                          <div>
                              <label className="block mb-2">ตำแหน่ง *</label>
                              <select
                                  value={formData.position}
                                  onChange={(e) => {
                                      setFormData((prev) => ({ ...prev, position: e.target.value }));
                                      setErrors((prev) => ({ ...prev, position: '' })); // ลบข้อความแจ้งเตือน
                                  }}
                                  className="w-full border rounded px-3 py-2"
                              >
                                  <option value="">-- เลือกตำแหน่ง --</option>
                                  {userGroups.map((group) => (
                                      <option key={group} value={group}>
                                          {group}
                                      </option>
                                  ))}
                              </select>
                              {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
                          </div>
                          <div>
                              <label className="block mb-2 text-lg font-bold">สิทธ์การเข้าถึงเฉพาะบุคคล</label>
                              <div className="space-y-4">
                                  {categorizedPermissions.map((category) => (
                                      <div
                                          key={category.category}
                                          className="border rounded-lg shadow-md p-2 hover:shadow-lg transition-shadow duration-300"
                                      >
                                          {/* หัวข้อหมวดหมู่ */}
                                          <button
                                              type="button"
                                              onClick={() => toggleCategory(category.category)}
                                              className="w-full text-left flex items-center justify-between p-2 rounded-md"
                                          >
                                              <span>{category.category}</span>
                                              {expandedCategories.includes(category.category) ? '▲' : '▼'}
                                          </button>

                                          {/* รายการสิทธิ์ในหมวดหมู่ */}
                                          {expandedCategories.includes(category.category) && (
                                              <div className="mt-4 grid grid-cols-2 gap-4">
                                                  {category.permissions.map((permission) => (
                                                      <div
                                                          key={permission.id}
                                                          className="flex items-center p-2 border rounded-lg hover:bg-gray-100 cursor-pointer"
                                                          onClick={() => handlePermissionChange(permission.id)} // กดที่รายการเพื่อเลือก checkbox
                                                      >
                                                          <div className="text-blue-500 mr-3">{permission.icon}</div>
                                                          <label className="flex items-center space-x-3 cursor-pointer">
                                                              <input
                                                                  type="checkbox"
                                                                  checked={formData.permissions.includes(permission.id)}
                                                                  onChange={() => handlePermissionChange(permission.id)}
                                                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                              />
                                                              <span>{permission.name}</span>
                                                          </label>
                                                      </div>
                                                  ))}
                                              </div>
                                          )}
                                      </div>
                                  ))}
                              </div>
                          </div>
                          <div className="flex justify-end gap-4">
                          <button
                              type="button"
                              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                              onClick={() => {
                                  resetForm(); // รีเซ็ตค่าในฟอร์ม
                                  setIsPopupOpen(false); // ปิดฟอร์ม
                              }}
                          >
                              ยกเลิก
                          </button>
                          <button
                              type="button"
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                              onClick={() => {
                                  if (isEditing) {
                                      openEditConfirmation(formData.id); // เปิด popup ยืนยันการแก้ไข
                                  } else {
                                      handleSubmit(); // เรียกฟังก์ชันเพิ่มผู้ใช้งาน
                                  }
                              }}
                          >
                              {isEditing ? 'บันทึก' : 'เพิ่มผู้ใช้'}
                          </button>
                          </div>
                      </form>
                  </div>
              </>
          )}
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
                    <p className="mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?</p>
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
                    <p className="mb-6">คุณแน่ใจหรือไม่ว่าต้องการบันทึกการแก้ไขข้อมูลนี้?</p>
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

export default UserPermissions;