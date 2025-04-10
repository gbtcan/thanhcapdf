import React, { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { useUserRoles } from '../hooks/useUserRoles';
import { formatDate } from '../../../utils/formatters';

const UserRoleTable: React.FC = () => {
  const {
    users,
    totalUsers,
    roles,
    isLoading,
    isUpdating,
    page,
    search,
    setSearch,
    nextPage,
    previousPage,
    handleRoleChange
  } = useUserRoles();
  
  const [searchInput, setSearchInput] = useState(search);
  
  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header and search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSearchSubmit} className="flex">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm người dùng..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
          <button
            type="submit"
            className="ml-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Tìm kiếm
          </button>
        </form>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-750 text-left">
              <th className="py-3.5 px-4 text-sm font-semibold text-gray-900 dark:text-white">Người dùng</th>
              <th className="py-3.5 px-4 text-sm font-semibold text-gray-900 dark:text-white">Email</th>
              <th className="py-3.5 px-4 text-sm font-semibold text-gray-900 dark:text-white">Ngày tạo</th>
              <th className="py-3.5 px-4 text-sm font-semibold text-gray-900 dark:text-white">Vai trò</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center text-gray-500 dark:text-gray-400">
                  <RefreshCw className="h-6 w-6 mx-auto animate-spin" />
                  <p className="mt-2">Đang tải dữ liệu người dùng...</p>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center text-gray-500 dark:text-gray-400">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.display_name}
                          className="h-8 w-8 rounded-full mr-3" 
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">
                            {user.display_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                      <span className="text-gray-900 dark:text-white font-medium">
                        {user.display_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{formatDate(user.created_at)}</td>
                  <td className="py-4 px-4">
                    <select
                      value={user.role_id}
                      onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                      disabled={isUpdating}
                      className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name === 'administrator' ? 'Quản trị viên' :
                           role.name === 'editor' ? 'Biên tập viên' : 'Người dùng'}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Hiển thị <span className="font-medium">{users.length}</span> trong tổng số{' '}
          <span className="font-medium">{totalUsers}</span> người dùng
        </div>
        <div className="flex space-x-2">
          <button
            onClick={previousPage}
            disabled={page === 0}
            className={`px-3 py-1 border rounded-md ${
              page === 0
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-650'
            }`}
          >
            Trước
          </button>
          <button
            onClick={nextPage}
            disabled={users.length < 10}
            className={`px-3 py-1 border rounded-md ${
              users.length < 10
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-650'
            }`}
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserRoleTable;
