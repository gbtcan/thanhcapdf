import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Settings, Save, RefreshCw, Database, Server, Globe, Bell } from 'lucide-react';
import AlertBanner from '../../components/AlertBanner';
import LoadingIndicator from '../../components/LoadingIndicator';

interface SystemSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  enable_registration: boolean;
  enable_forum: boolean;
  enable_contributions: boolean;
  maintenance_mode: boolean;
  version: string;
  last_backup: string;
  notifications_enabled: boolean;
}

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Load system settings
  const {
    data: settings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();
        
      if (error) throw error;
      return data as SystemSettings;
    }
  });
  
  // Form state
  const [formValues, setFormValues] = useState<SystemSettings | null>(null);
  
  // Set initial form values when settings load
  React.useEffect(() => {
    if (settings) {
      setFormValues(settings);
    }
  }, [settings]);
  
  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<SystemSettings>) => {
      const { error } = await supabase
        .from('system_settings')
        .update(newSettings)
        .eq('id', 1); // Assuming we have a single row with ID 1 for settings
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      refetch();
      setFormSuccess('Settings have been updated successfully.');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setFormSuccess(null);
      }, 5000);
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : 'Failed to update settings');
    }
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormValues((prev) => {
      if (!prev) return prev;
      
      if (type === 'checkbox') {
        return {
          ...prev,
          [name]: (e.target as HTMLInputElement).checked
        };
      }
      
      return {
        ...prev,
        [name]: value
      };
    });
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormValues((prev) => {
      if (!prev) return prev;
      
      return {
        ...prev,
        [name]: checked
      };
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    if (!formValues) return;
    
    updateSettingsMutation.mutate(formValues);
  };
  
  // Trigger database backup
  const createBackup = async () => {
    try {
      const { error } = await supabase.rpc('create_database_backup');
      
      if (error) throw error;
      
      setFormSuccess('Database backup initiated successfully.');
      refetch();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create database backup');
    }
  };
  
  // Clear cache
  const clearCache = async () => {
    try {
      const { error } = await supabase.rpc('clear_system_cache');
      
      if (error) throw error;
      
      setFormSuccess('System cache cleared successfully.');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to clear system cache');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingIndicator size="large" message="Loading system settings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <AlertBanner
          type="error"
          title="Error loading settings"
          message="There was a problem loading the system settings. Please try again."
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <Settings className="h-6 w-6 mr-2" />
        System Settings
      </h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'advanced'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Advanced
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'maintenance'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Maintenance
          </button>
        </nav>
      </div>
      
      {/* Success/Error messages */}
      {formError && (
        <AlertBanner
          type="error"
          message={formError}
          dismissible
          onDismiss={() => setFormError(null)}
          className="mb-6"
        />
      )}
      
      {formSuccess && (
        <AlertBanner
          type="success"
          message={formSuccess}
          dismissible
          onDismiss={() => setFormSuccess(null)}
          className="mb-6"
        />
      )}
      
      {/* Settings form */}
      {formValues && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* General settings */}
            {activeTab === 'general' && (
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="site_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Site Name
                    </label>
                    <input
                      type="text"
                      name="site_name"
                      id="site_name"
                      value={formValues.site_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="site_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Site Description
                    </label>
                    <textarea
                      name="site_description"
                      id="site_description"
                      rows={3}
                      value={formValues.site_description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      id="contact_email"
                      value={formValues.contact_email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enable_registration"
                      name="enable_registration"
                      checked={formValues.enable_registration}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="enable_registration" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Enable User Registration
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Advanced settings */}
            {activeTab === 'advanced' && (
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enable_forum"
                      name="enable_forum"
                      checked={formValues.enable_forum}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="enable_forum" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Enable Forum
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enable_contributions"
                      name="enable_contributions"
                      checked={formValues.enable_contributions}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="enable_contributions" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Enable User Contributions
                    </label>
                  </div>
                  
                  <div>
                    <label htmlFor="version" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Version
                    </label>
                    <input
                      type="text"
                      name="version"
                      id="version"
                      value={formValues.version}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Notifications settings */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifications_enabled"
                      name="notifications_enabled"
                      checked={formValues.notifications_enabled}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="notifications_enabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Enable System Notifications
                    </label>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-500 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Bell className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Notification settings require additional configuration in the email provider settings.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Notification Types</h4>
                    <div className="space-y-2 ml-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="notify_new_user"
                          name="notify_new_user"
                          checked={true}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="notify_new_user" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          New user registrations
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="notify_new_post"
                          name="notify_new_post"
                          checked={true}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="notify_new_post" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          New forum posts
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="notify_contribution"
                          name="notify_contribution"
                          checked={true}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="notify_contribution" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          New hymn contributions
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Maintenance settings */}
            {activeTab === 'maintenance' && (
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenance_mode"
                      name="maintenance_mode"
                      checked={formValues.maintenance_mode}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="maintenance_mode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Enable Maintenance Mode
                    </label>
                  </div>
                  
                  {formValues.maintenance_mode && (
                    <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-red-700 dark:text-red-300">
                            Maintenance mode is currently enabled. Only administrators can access the site.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Database Management</h4>
                    <div className="mt-3 flex flex-col space-y-3">
                      <div>
                        <button
                          type="button"
                          onClick={createBackup}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Database className="h-4 w-4 mr-2" />
                          Create Database Backup
                        </button>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Last backup: {formValues.last_backup ? new Date(formValues.last_backup).toLocaleString() : 'Never'}
                        </p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={clearCache}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Clear System Cache
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Form footer */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 text-right sm:px-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
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
      )}
    </div>
  );
};

export default AdminSettings;
