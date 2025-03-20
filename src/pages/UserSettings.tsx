import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PageLayout from '../components/PageLayout';
import AlertBanner from '../components/AlertBanner';
import { useLocalStorage } from '../utils/hooks';
import { Bell, Moon, Sun, Save, Loader2 } from 'lucide-react';

interface NotificationSettings {
  email_notifications: boolean;
  browser_notifications: boolean;
  mobile_push_notifications: boolean;
  comment_notifications: boolean;
  reply_notifications: boolean;
  mention_notifications: boolean;
  favorite_notifications: boolean;
  hymn_status_notifications: boolean;
  post_liked_notifications: boolean;
  system_notifications: boolean;
  digest_frequency: 'never' | 'daily' | 'weekly' | 'monthly';
}

const UserSettings: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Theme setting
  const [theme, setTheme] = useLocalStorage<'light' | 'dark' | 'system'>('theme', 'system');
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    browser_notifications: true,
    mobile_push_notifications: false,
    comment_notifications: true,
    reply_notifications: true,
    mention_notifications: true,
    favorite_notifications: true,
    hymn_status_notifications: true,
    post_liked_notifications: true,
    system_notifications: true,
    digest_frequency: 'weekly'
  });
  
  // State for saving
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Fetch user settings when component mounts
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      // Redirect to login if not authenticated
      navigate('/auth/login', { state: { from: '/settings' } });
      return;
    }
    
    if (user) {
      fetchNotificationSettings();
    }
  }, [user, isAuthenticated, authLoading, navigate]);
  
  // Fetch notification settings from the database
  const fetchNotificationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setNotificationSettings(data as NotificationSettings);
      } else {
        // No settings found, create default settings
        await createDefaultNotificationSettings();
      }
    } catch (err) {
      console.error('Error fetching notification settings:', err);
      setError('Failed to load your notification settings');
    }
  };
  
  // Create default notification settings
  const createDefaultNotificationSettings = async () => {
    try {
      const defaultSettings = {
        user_id: user!.id,
        ...notificationSettings
      };
      
      const { error } = await supabase
        .from('notification_preferences')
        .insert([defaultSettings]);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error creating default notification settings:', err);
    }
  };
  
  // Handle form changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle theme change
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    
    // Apply theme immediately
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };
  
  // Save settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Update notification preferences
      const { error: updateError } = await supabase
        .from('notification_preferences')
        .update(notificationSettings)
        .eq('user_id', user!.id);
      
      if (updateError) throw updateError;
      
      // Update theme preference in user settings
      const { error: themeUpdateError } = await supabase
        .from('user_settings')
        .upsert([
          {
            user_id: user!.id,
            theme
          }
        ]);
      
      if (themeUpdateError) throw themeUpdateError;
      
      setSuccess('Your settings have been saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading) {
    return (
      <PageLayout title="Loading Settings">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
            <p className="mt-2 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  if (!user) {
    return (
      <PageLayout title="Settings">
        <div className="max-w-lg mx-auto p-6">
          <AlertBanner
            type="error"
            title="Authentication Required"
            message="Please log in to access your settings"
          />
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title="Settings" description="Manage your account preferences and notification settings">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Configure your account preferences and notification settings.
          </p>
        </div>
        
        {error && (
          <AlertBanner
            type="error"
            message={error}
            className="mb-6"
            dismissible
            onDismiss={() => setError(null)}
          />
        )}
        
        {success && (
          <AlertBanner
            type="success"
            message={success}
            className="mb-6"
            dismissible
            onDismiss={() => setSuccess(null)}
          />
        )}
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <form onSubmit={handleSaveSettings}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Theme Preferences</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose how Catholic Hymns appears to you.
              </p>
              
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div 
                  className={`p-4 rounded-lg border cursor-pointer ${
                    theme === 'light'
                      ? 'border-indigo-500 ring-2 ring-indigo-500'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => handleThemeChange('light')}
                >
                  <div className="flex justify-between items-center mb-2">
                    <Sun className="h-5 w-5 text-yellow-500" />
                    <div className={`h-4 w-4 rounded-full ${
                      theme === 'light' ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}></div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Light</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Always use light mode
                  </p>
                </div>
                
                <div 
                  className={`p-4 rounded-lg border cursor-pointer ${
                    theme === 'dark'
                      ? 'border-indigo-500 ring-2 ring-indigo-500'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <div className="flex justify-between items-center mb-2">
                    <Moon className="h-5 w-5 text-indigo-500" />
                    <div className={`h-4 w-4 rounded-full ${
                      theme === 'dark' ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}></div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Dark</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Always use dark mode
                  </p>
                </div>
                
                <div 
                  className={`p-4 rounded-lg border cursor-pointer ${
                    theme === 'system'
                      ? 'border-indigo-500 ring-2 ring-indigo-500'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => handleThemeChange('system')}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex">
                      <Sun className="h-5 w-5 text-yellow-500" />
                      <Moon className="h-5 w-5 text-indigo-500 ml-1" />
                    </div>
                    <div className={`h-4 w-4 rounded-full ${
                      theme === 'system' ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}></div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">System</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Follow system theme
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Bell className="h-5 w-5 mr-2 text-indigo-500" />
                Notification Settings
              </h2>
              <p className="mt-1 mb-4 text-sm text-gray-500 dark:text-gray-400">
                Control how and when you receive notifications.
              </p>
              
              {/* Notification channels */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Notification Channels</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="email_notifications"
                      name="email_notifications"
                      type="checkbox"
                      checked={notificationSettings.email_notifications}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="email_notifications" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                      Email Notifications
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="browser_notifications"
                      name="browser_notifications"
                      type="checkbox"
                      checked={notificationSettings.browser_notifications}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="browser_notifications" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                      Browser Notifications
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="mobile_push_notifications"
                      name="mobile_push_notifications"
                      type="checkbox"
                      checked={notificationSettings.mobile_push_notifications}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="mobile_push_notifications" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                      Mobile Push Notifications
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Notification types */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Notification Types</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="comment_notifications"
                      name="comment_notifications"
                      type="checkbox"
                      checked={notificationSettings.comment_notifications}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="comment_notifications" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                      Comments on your posts
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="reply_notifications"
                      name="reply_notifications"
                      type="checkbox"
                      checked={notificationSettings.reply_notifications}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="reply_notifications" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                      Replies to your comments
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="mention_notifications"
                      name="mention_notifications"
                      type="checkbox"
                      checked={notificationSettings.mention_notifications}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="mention_notifications" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                      Mentions in posts and comments
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="favorite_notifications"
                      name="favorite_notifications"
                      type="checkbox"
                      checked={notificationSettings.favorite_notifications}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="favorite_notifications" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                      Favorites on your contributions
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="hymn_status_notifications"
                      name="hymn_status_notifications"
                      type="checkbox"
                      checked={notificationSettings.hymn_status_notifications}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hymn_status_notifications" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                      Status updates on hymns you've contributed
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="system_notifications"
                      name="system_notifications"
                      type="checkbox"
                      checked={notificationSettings.system_notifications}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="system_notifications" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                      System announcements and updates
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Email digest frequency */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Email Digest Frequency</h3>
                <select
                  id="digest_frequency"
                  name="digest_frequency"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={notificationSettings.digest_frequency}
                  onChange={handleSelectChange}
                >
                  <option value="never">Never</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            
            <div className="p-6 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default UserSettings;
