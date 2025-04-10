import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Save, RefreshCw, KeyIcon, Settings as SettingsIcon, Sun, Moon, Smartphone } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);
  
  const changePasswordMutation = useMutation({
    mutationFn: async ({ current, newPass }: { current: string, newPass: string }) => {
      const { error } = await supabase.auth.updateUser({ 
        password: newPass 
      });
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError(null);
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Clear success message after a delay
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 5000);
    },
    onError: (error: any) => {
      setPasswordError(error.message || 'Failed to update password');
      setPasswordSuccess(false);
    }
  });
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    // Submit password change
    changePasswordMutation.mutate({ current: currentPassword, newPass: newPassword });
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <SettingsIcon className="h-6 w-6 mr-2" />
        Thiết lập tài khoản
      </h1>
      
      {/* Theme settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Giao diện
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">
              Chọn chủ đề
            </label>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  theme === 'light' 
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <Sun className="h-4 w-4 mr-2" />
                Sáng
              </button>
              
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  theme === 'dark' 
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Moon className="h-4 w-4 mr-2" />
                Tối
              </button>
              
              <button
                onClick={() => setTheme('system')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  theme === 'system' 
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Theo hệ thống
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Password settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-4">
          <KeyIcon className="h-5 w-5 mr-2" />
          Đổi mật khẩu
        </h2>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordError && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-md">
              {passwordError}
            </div>
          )}
          
          {passwordSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-3 rounded-md">
              Mật khẩu đã được cập nhật thành công
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-70"
          >
            {changePasswordMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Cập nhật mật khẩu
          </button>
        </form>
      </div>
      
      {/* Account actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Hành động tài khoản
        </h2>
        
        <div className="space-y-4">
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
