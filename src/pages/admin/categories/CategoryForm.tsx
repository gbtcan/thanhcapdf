import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query'; //import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, Save, ArrowLeft, X, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import type { Category } from '../../../types';
import PageLayout from '../../../components/PageLayout';

interface CategoryFormData {
  name: string;
  description: string;
}

const CategoryForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userRole } = useAuth();
  const isNew = id === 'new';
  
  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: ''
  });
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Check permissions
  useEffect(() => {
    if (userRole !== 'administrator' && userRole !== 'editor') {
      navigate('/login', { 
        state: { message: 'You need administrator or editor permissions to access this page.' } 
      });
    }
  }, [userRole, navigate]);

  // Fetch category if editing
  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: ['admin-category', id],
    queryFn: async () => {
      if (isNew) return null;
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      // Set form data
      setFormData({
        name: data.name,
        description: data.description || ''
      });
      
      return data;
    },
    enabled: !isNew && !!id
  });

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Basic validation
      if (!formData.name.trim()) {
        throw new Error('Category name is required');
      }
      
      // Create/update category in the database
      if (isNew) {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            description: formData.description || null
          });
          
        if (error) throw error;
      } else {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            description: formData.description || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
          
        if (error) throw error;
      }
      
      // Success
      setSuccess(true);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      // Navigate after a brief delay
      setTimeout(() => {
        navigate('/admin/categories');
      }, 1500);
      
    } catch (err: any) {
      console.error('Error saving category:', err);
      setError(err.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  if (categoryLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Tag className="h-7 w-7 text-indigo-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? 'Add New Category' : `Edit Category: ${category?.name}`}
            </h1>
          </div>
          <Link
            to="/admin/categories"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Categories</span>
          </Link>
        </div>

        {/* Success message */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Category {isNew ? 'created' : 'updated'} successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter category name"
              />
            </div>

            {/* Description field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter category description (optional)"
              />
            </div>
          </div>
          
          {/* Form footer */}
          <div className="px-6 py-4 bg-gray-50 text-right">
            <button
              type="button"
              onClick={() => navigate('/admin/categories')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  {isNew ? 'Create Category' : 'Update Category'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default CategoryForm;
