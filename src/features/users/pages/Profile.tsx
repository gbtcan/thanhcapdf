import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Pencil, RefreshCw, Save, User, Mail, Calendar } from 'lucide-react';
import { formatDate } from '../../../utils/formatters';
import { LoadingIndicator } from '../../../core/components';

const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });
  
  const updateProfileMutation = useMutation({
    mutationFn: async (newDisplayName: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          display_name: newDisplayName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setIsEditing(false);
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(displayName);
  };
  
  if (isLoading) {
    return <LoadingIndicator message="Đang tải thông tin cá nhân..." />;
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thông tin cá nhân</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
              >
                <Pencil className="h-4 w-4 mr-1.5" />
                Chỉnh sửa
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              
              {/* TODO: Add avatar upload functionality */}
              <button className="mt-4 text-sm text-indigo-600 hover:text-indigo-500">
                Thay đổi ảnh đại diện
              </button>
            </div>
            
            {/* Profile details */}
            <div className="flex-1">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tên hiển thị
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                      placeholder="Tên hiển thị"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="w-full px-4 py-2 border border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-600 rounded-md cursor-not-allowed dark:text-gray-300"
                      disabled
                    />
                    <p className="mt-1 text-sm text-gray-500">Email không thể thay đổi</p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {updateProfileMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Lưu thông tin
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{profile?.display_name}</h2>
                    <p className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                      <Mail className="h-4 w-4 mr-2" />
                      {user?.email}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Thông tin tài khoản
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Ngày tham gia: {formatDate(profile?.created_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Vai trò: {user?.roles?.name === 'administrator' ? 'Quản trị viên' : 
                                   user?.roles?.name === 'editor' ? 'Biên tập viên' : 'Thành viên'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
