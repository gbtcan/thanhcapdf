import React from 'react';
import { UserRoleTable } from '../components';
import { Users, ShieldAlert } from 'lucide-react';

const UserRoles: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
          <Users className="h-6 w-6 mr-2 text-indigo-600" />
          Quản lý người dùng
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Phân quyền và quản lý các tài khoản người dùng trong hệ thống
        </p>
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start">
        <ShieldAlert className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h3 className="text-blue-800 dark:text-blue-300 font-medium text-sm">Lưu ý về phân quyền</h3>
          <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
            Chỉ có người dùng với vai trò <strong>Quản trị viên</strong> mới có quyền thay đổi vai trò của người dùng khác. 
            Cẩn thận khi cấp quyền quản trị viên vì họ sẽ có toàn quyền truy cập vào hệ thống.
          </p>
        </div>
      </div>
      
      <UserRoleTable />
    </div>
  );
};

export default UserRoles;
