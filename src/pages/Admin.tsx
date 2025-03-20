import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Settings, Users, Music, BookOpen } from 'lucide-react';
import UserManagement from './admin/Users';

const Admin = () => {
  const location = useLocation();
  const isRootAdminPath = location.pathname === '/admin' || location.pathname === '/admin/';
  
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Settings className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {isRootAdminPath && (
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            to="/admin/users"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            </div>
            <p className="text-gray-600">Manage user roles and permissions</p>
          </Link>

          <Link
            to="/admin/hymns"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Music className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Hymn Management</h2>
            </div>
            <p className="text-gray-600">Add, edit, and manage hymns</p>
          </Link>

          <Link
            to="/admin/categories"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Category Management</h2>
            </div>
            <p className="text-gray-600">Manage hymn categories and tags</p>
          </Link>
        </div>
      )}

      <div className={isRootAdminPath ? "" : "bg-white rounded-lg shadow-md p-6"}>
        <Routes>
          <Route path="users" element={<UserManagement />} />
          <Route path="hymns" element={<div>Hymn Management Component</div>} />
          <Route path="categories" element={<div>Category Management Component</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;