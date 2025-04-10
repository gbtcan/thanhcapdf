import React, { useState } from 'react';
import { useAuth } from '../../../../core/contexts/AuthContext';
import { useTheme } from '../../../../core/contexts/ThemeContext';
import { Button } from '../../../../core/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../core/components/ui/card';
import { AlertCircle, CheckCircle, Moon, Sun, Monitor, Lock } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Xử lý đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      // Kiểm tra đầu vào
      if (!passwordCurrent || !passwordNew || !passwordConfirm) {
        throw new Error('Vui lòng nhập đầy đủ thông tin');
      }
      
      if (passwordNew.length < 6) {
        throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
      }
      
      if (passwordNew !== passwordConfirm) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }
      
      // Gọi API đổi mật khẩu
      const { error } = await supabase.auth.updateUser({ password: passwordNew });
      
      if (error) throw error;
      
      // Thành công
      setSuccess('Đổi mật khẩu thành công');
      setPasswordCurrent('');
      setPasswordNew('');
      setPasswordConfirm('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Cài đặt tài khoản</h1>
      
      {/* Appearance Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Giao diện</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant={theme === 'light' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setTheme('light')}
            >
              <Sun className="h-5 w-5 mr-2" />
              Sáng
            </Button>
            <Button 
              variant={theme === 'dark' ? 'default' : 'outline'} 
              className="flex-1"
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-5 w-5 mr-2" />
              Tối
            </Button>
            <Button 
              variant={theme === 'system' ? 'default' : 'outline'} 
              className="flex-1"
              onClick={() => setTheme('system')}
            >
              <Monitor className="h-5 w-5 mr-2" />
              Hệ thống
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Password Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md mb-4 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-3 rounded-md mb-4 flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{success}</p>
            </div>
          )}
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="passwordCurrent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 transform -translate-y-1/2 left-3 h-5 w-5 text-gray-400" />
                <input
                  id="passwordCurrent"
                  type="password"
                  value={passwordCurrent}
                  onChange={(e) => setPasswordCurrent(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="passwordNew" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 transform -translate-y-1/2 left-3 h-5 w-5 text-gray-400" />
                <input
                  id="passwordNew"
                  type="password"
                  value={passwordNew}
                  onChange={(e) => setPasswordNew(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Mật khẩu phải có ít nhất 6 ký tự
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 transform -translate-y-1/2 left-3 h-5 w-5 text-gray-400" />
                <input
                  id="passwordConfirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
            onClick={logout}
          >
            Đăng xuất
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Thiếu import
import { supabase } from '../../../../lib/supabase';

export default Settings;
