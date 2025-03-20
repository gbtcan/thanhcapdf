import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  User, Mail, Shield, Clock, Music, 
  LogOut, Loader2, Save, AlertTriangle, CheckCircle, AlertCircle,
  Moon, Sun, Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import PageLayout from '../components/PageLayout';
import ThemeSelector from '../components/ThemeSelector';
import { useLocalStorage } from '../utils/hooks';
import type { HymnWithRelations } from '../types';
import UserReputation from '../components/user/UserReputation';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, userRole, logout, isAuthenticated } = useAuth();
  const { settings } = useTheme();
  
  // Profile states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Recently viewed hymns (from local storage)
  const [recentlyViewed] = useLocalStorage<string[]>('recentlyViewedHymns', []);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate('/login', { state: { from: '/profile' } });
    }
  }, [isAuthenticated, user, navigate]);
  
  // Fetch profile data
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user logged in');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      // Set form values
      setDisplayName(data.display_name || '');
      setEmail(data.email || user.email || '');
      
      return data;
    },
    enabled: isAuthenticated
  });
  
  // Fetch recently viewed hymns
  const { data: recentHymns } = useQuery<HymnWithRelations[]>({
    queryKey: ['recently-viewed-hymns', recentlyViewed],
    queryFn: async () => {
      if (!recentlyViewed.length) return [];
      
      const { data, error } = await supabase
        .from('hymns')
        .select(`
          *,
          hymn_authors(authors(*))
        `)
        .in('id', recentlyViewed)
        .limit(5);
      
      if (error) throw error;
      
      return data.map((hymn: any) => ({
        ...hymn,
        authors: hymn.hymn_authors?.map((ha: any) => ha.authors) || []
      }));
    },
    enabled: recentlyViewed.length > 0
  });
  
  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (values: { display_name?: string }) => {
      if (!user) throw new Error('No user logged in');
      
      const { error } = await supabase
        .from('users')
        .update(values)
        .eq('id', user.id);
        
      if (error) throw error;
      
      return true;
    },
    onSuccess: () => {
      setSuccess('Your profile has been updated successfully.');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    },
    onError: (error) => {
      setError(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await updateProfile.mutateAsync({
        display_name: displayName
      });
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };
  
  // User activity stats for display
  const { data: userStats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user logged in');
      
      // Get number of favorites
      const { count: favoritesCount, error: favError } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (favError) throw favError;
      
      // For now just return favorites count, can add more stats later
      return {
        favoritesCount: favoritesCount || 0,
        lastLogin: user?.last_sign_in_at ? new Date(user.last_sign_in_at) : null,
      };
    },
    enabled: isAuthenticated
  });
  
  // Handle logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate('/');
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Error logging out');
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }
  
  return (
    <PageLayout title="Your Profile">
      {profileLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - User info */}
          <div className="md:col-span-1 space-y-6">
            {/* User card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col items-center">
                <div className="bg-indigo-100 p-4 rounded-full">
                  <User className="h-12 w-12 text-indigo-600" />
                </div>
                <h2 className="mt-4 text-xl font-medium text-gray-900">
                  {userProfile?.display_name || email || 'User'}
                </h2>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Mail className="h-4 w-4 mr-1" />
                  {email}
                </div>
                <div className="mt-1 flex items-center text-xs px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                  <Shield className="h-3 w-3 mr-1" />
                  {userRole || 'User'}
                </div>
              </div>
            </div>
            
            {/* Stats card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Activity</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Favorites</span>
                  <span className="text-gray-900 font-medium">{userStats?.favoritesCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last login</span>
                  <span className="text-gray-900 font-medium">
                    {userStats?.lastLogin?.toLocaleDateString() || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link 
                  to="/favorites" 
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View your favorites →
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right column - Forms and settings */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile form */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Edit Profile</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Success message */}
                {success && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <div className="flex">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="ml-3 text-green-700">{success}</span>
                    </div>
                  </div>
                )}
                
                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <span className="ml-3 text-red-700">{error}</span>
                    </div>
                  </div>
                )}
                
                {/* Display name field */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This is how your name will appear on the site
                  </p>
                </div>
                
                {/* Email field (readonly) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    disabled
                    className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>
                
                {/* Submit button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Display preferences */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Display Preferences</h3>
                <ThemeSelector />
              </div>
              
              <div className="p-6 space-y-4">
                {/* Current theme */}
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">Current Theme</h4>
                    <p className="text-sm text-gray-500">Control how the application looks</p>
                  </div>
                  <div className="flex items-center">
                    {settings.mode === 'light' && <Sun className="h-5 w-5 text-amber-500 mr-1" />}
                    {settings.mode === 'dark' && <Moon className="h-5 w-5 text-indigo-500 mr-1" />}
                    {settings.mode === 'system' && <Settings className="h-5 w-5 text-gray-500 mr-1" />}
                    <span className="text-gray-700">
                      {settings.mode === 'light' && 'Light Mode'}
                      {settings.mode === 'dark' && 'Dark Mode'}
                      {settings.mode === 'system' && 'System Default'}
                    </span>
                  </div>
                </div>
                
                {/* Font size */}
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">Font Size</h4>
                    <p className="text-sm text-gray-500">Adjust text size for better readability</p>
                  </div>
                  <span className="text-gray-700 capitalize">{settings.fontSize}</span>
                </div>
                
                {/* High contrast mode */}
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">High Contrast</h4>
                    <p className="text-sm text-gray-500">Enhanced visibility mode</p>
                  </div>
                  <span className="text-gray-700">{settings.highContrast ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-6 mt-6">
        {/* User Reputation */}
        <UserReputation 
          userId={userProfile.id} 
          reputation={userProfile.reputation || 0} 
        />
        
        {/* ...existing components... */}
      </div>
    </PageLayout>
  );
};

export default UserProfile;
