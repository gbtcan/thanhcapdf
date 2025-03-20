import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save, Edit, Loader2, Camera, AlertCircle, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PageLayout from '../components/PageLayout';
import AlertBanner from '../components/AlertBanner';
import TabNavigation from '../components/TabNavigation';
import UserFavorites from '../components/UserFavorites';
import UserPosts from '../components/UserPosts';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingIndicator from '../components/LoadingIndicator';

interface ProfileForm {
  displayName: string;
  email: string;
  bio: string;
}

const Profile: React.FC = () => {
  const { user, updateProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form state
  const [form, setForm] = useState<ProfileForm>({
    displayName: '',
    email: '',
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'favorites', label: 'Favorites', icon: <Heart className="h-4 w-4" /> },
    { id: 'posts', label: 'Posts' }
  ];

  // Load user data on mount
  useEffect(() => {
    if (!user && !authLoading) {
      // Redirect to login if not authenticated
      navigate('/auth/login', { state: { from: '/profile' } });
      return;
    }

    if (user) {
      setForm({
        displayName: user.display_name || '',
        email: user.email || '',
        bio: user.bio || ''
      });
      setAvatarUrl(user.avatar_url || null);
    }
  }, [user, authLoading, navigate]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Update profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          display_name: form.displayName,
          bio: form.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Update user context
      if (updateProfile) {
        await updateProfile({
          ...user,
          display_name: form.displayName,
          bio: form.bio
        });
      }
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update profile. Please try again.');
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    const fileType = file.type;
    if (!fileType.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Maximum file size: 2MB
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image size should be less than 2MB');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      if (!urlData) throw new Error('Failed to get public URL');
      
      const avatarUrl = urlData.publicUrl;
      
      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Update user context
      if (updateProfile) {
        await updateProfile({
          ...user,
          avatar_url: avatarUrl
        });
      }
      
      setAvatarUrl(avatarUrl);
      setSuccess('Avatar updated successfully!');
    } catch (error) {
      setError('Failed to upload avatar. Please try again.');
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <PageLayout title="Profile">
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingIndicator size="large" message="Loading profile..." />
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout title="Profile">
        <div className="max-w-lg mx-auto p-6">
          <AlertBanner
            type="error"
            title="Authentication Required"
            message="Please log in to view your profile"
            className="mb-4"
          />
          <button
            onClick={() => navigate('/auth/login', { state: { from: '/profile' } })}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Log In
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <ErrorBoundary>
      <PageLayout title="My Profile">
        <div className="max-w-4xl mx-auto p-4">
          {/* Tabs Navigation */}
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="underline"
            className="mb-6"
          />
          
          {/* Tab Content */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {activeTab === 'profile' && (
              <div className="p-6">
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
                
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center mb-8">
                  {/* Avatar */}
                  <div className="relative mb-4 md:mb-0 md:mr-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border border-gray-300">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <User size={32} />
                        </div>
                      )}
                    </div>
                    
                    {isEditing && (
                      <div className="absolute bottom-0 right-0">
                        <label
                          htmlFor="avatar-upload"
                          className="cursor-pointer bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700"
                        >
                          {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Camera className="h-4 w-4" />
                          )}
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="text-center md:text-left">
                    <h1 className="text-2xl font-bold">{user.display_name || 'User'}</h1>
                    <p className="text-gray-600">{user.email}</p>
                    {user.roles && (
                      <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded mt-2">
                        {user.roles.name}
                      </span>
                    )}
                  </div>
                  
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="ml-auto px-3 py-1 flex items-center text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Profile
                    </button>
                  )}
                </div>
                
                {/* Profile Form */}
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Display Name */}
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name
                      </label>
                      <input
                        id="displayName"
                        name="displayName"
                        type="text"
                        value={form.displayName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                        }`}
                      />
                    </div>
                    
                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        disabled={true} // Email is always read-only
                        className="block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                      />
                    </div>
                    
                    {/* Bio */}
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={form.bio}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                        }`}
                        placeholder={isEditing ? "Tell us about yourself..." : "No bio provided"}
                      />
                    </div>
                  </div>
                  
                  {/* Form Actions */}
                  {isEditing && (
                    <div className="mt-8 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form to original values
                          setForm({
                            displayName: user.display_name || '',
                            email: user.email || '',
                            bio: user.bio || ''
                          });
                          setError(null);
                          setSuccess(null);
                        }}
                        disabled={isSubmitting}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm mr-3 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 border border-transparent text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 inline-flex items-center"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
                  )}
                </form>
              </div>
            )}
            
            {activeTab === 'favorites' && (
              <div className="p-6">
                <UserFavorites userId={user.id} />
              </div>
            )}
            
            {activeTab === 'posts' && (
              <div className="p-6">
                <UserPosts userId={user.id} />
              </div>
            )}
          </div>
        </div>
      </PageLayout>
    </ErrorBoundary>
  );
};

export default Profile;
