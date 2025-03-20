import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, ArrowLeft } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import LoadingIndicator from '../../../components/LoadingIndicator';
import AlertBanner from '../../../components/AlertBanner';
import { Author } from '../../../types/hymns';

const AuthorForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Form state
  const [name, setName] = useState('');
  const [biography, setBiography] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Fetch author data if editing
  const { data: author, isLoading: authorLoading } = useQuery<Author>({
    queryKey: ['author', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
    onSuccess: (data) => {
      setName(data.name);
      setBiography(data.biography || '');
    }
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (authorData: { name: string; biography: string }) => {
      const { data, error } = await supabase
        .from('authors')
        .insert([authorData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-authors'] });
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/authors');
      }, 1500);
    },
    onError: (error: any) => {
      setFormError(error.message);
    }
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (authorData: { name: string; biography: string }) => {
      const { data, error } = await supabase
        .from('authors')
        .update(authorData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['author', id] });
      queryClient.invalidateQueries({ queryKey: ['all-authors'] });
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/authors');
      }, 1500);
    },
    onError: (error: any) => {
      setFormError(error.message);
    }
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!name.trim()) {
      setFormError('Author name is required');
      return;
    }
    
    const authorData = {
      name: name.trim(),
      biography: biography.trim() || null
    };
    
    if (isEditing) {
      updateMutation.mutate(authorData);
    } else {
      createMutation.mutate(authorData);
    }
  };
  
  if (isEditing && authorLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingIndicator size="large" message="Loading author details..." />
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/authors')}
          className="flex items-center text-gray-600 hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Authors
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-medium text-gray-800">
            {isEditing ? 'Edit Author' : 'Create New Author'}
          </h1>
        </div>
        
        {formError && (
          <div className="px-6 py-4">
            <AlertBanner
              type="error"
              title="Error"
              message={formError}
            />
          </div>
        )}
        
        {success && (
          <div className="px-6 py-4">
            <AlertBanner
              type="success"
              title="Success"
              message={`Author ${isEditing ? 'updated' : 'created'} successfully!`}
            />
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Author name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            {/* Biography */}
            <div>
              <label htmlFor="biography" className="block text-sm font-medium text-gray-700 mb-1">
                Biography
              </label>
              <textarea
                id="biography"
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                rows={6}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter author biography (optional)..."
              />
            </div>
          </div>
          
          {/* Form actions */}
          <div className="px-6 py-3 bg-gray-50 text-right space-x-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/authors')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              disabled={createMutation.isPending || updateMutation.isPending || success}
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <LoadingIndicator size="small" color="white" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1 inline" />
                  {isEditing ? 'Update Author' : 'Create Author'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthorForm;
