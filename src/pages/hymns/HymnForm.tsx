import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Music, Save, ArrowLeft, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PageLayout from '../../components/PageLayout';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAuth } from '../../contexts/AuthContext';
import AlertBanner from '../../components/AlertBanner';

const HymnForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    lyrics: '',
    authorIds: [] as number[],
    categoryIds: [] as number[]
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // ...existing code...
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (isEditing) {
      updateHymnMutation.mutate();
    } else {
      createHymnMutation.mutate();
    }
  };

  if (isEditing && hymnLoading) {
    return (
      <PageLayout title="Loading Hymn...">
        <div className="flex justify-center py-12">
          <LoadingIndicator size="large" message="Loading hymn details..." />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={isEditing ? "Edit Hymn" : "Add New Hymn"}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Hymn" : "Add New Hymn"}
          </h1>
        </div>
        
        {successMessage && (
          <AlertBanner
            type="success"
            title="Success"
            message={successMessage}
          />
        )}
        
        {(createHymnMutation.error || updateHymnMutation.error) && (
          <AlertBanner
            type="error"
            title="Error"
            message={(createHymnMutation.error || updateHymnMutation.error) as string}
          />
        )}
        
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
          {/* Title field */}
          <div>
            <label 
              htmlFor="title" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full rounded-md shadow-sm ${
                formErrors.title ? 'border-red-300' : 'border-gray-300'
              } focus:border-indigo-500 focus:ring-indigo-500`}
            />
            {formErrors.title && (
              <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
            )}
          </div>
          
          {/* Authors selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Authors <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-1">
              {authors?.map(author => (
                <button
                  key={author.id}
                  type="button"
                  onClick={() => handleAuthorToggle(author.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formData.authorIds.includes(author.id)
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {author.name}
                </button>
              ))}
            </div>
            {formErrors.authors && (
              <p className="mt-1 text-sm text-red-600">{formErrors.authors}</p>
            )}
          </div>
          
          {/* Categories selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categories <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-1">
              {categories?.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formData.categoryIds.includes(category.id)
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            {formErrors.categories && (
              <p className="mt-1 text-sm text-red-600">{formErrors.categories}</p>
            )}
          </div>
          
          {/* Lyrics field */}
          <div>
            <label 
              htmlFor="lyrics" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Lyrics <span className="text-red-500">*</span>
            </label>
            <textarea
              id="lyrics"
              name="lyrics"
              value={formData.lyrics}
              onChange={handleInputChange}
              rows={12}
              className={`w-full rounded-md shadow-sm ${
                formErrors.lyrics ? 'border-red-300' : 'border-gray-300'
              } focus:border-indigo-500 focus:ring-indigo-500`}
              placeholder="Enter the lyrics here..."
            ></textarea>
            {formErrors.lyrics && (
              <p className="mt-1 text-sm text-red-600">{formErrors.lyrics}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Tip: Use blank lines to separate verses. Use [VERSE], [CHORUS], [BRIDGE] tags to mark sections.
            </p>
          </div>
          
          {/* Submit buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createHymnMutation.isPending || updateHymnMutation.isPending}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {createHymnMutation.isPending || updateHymnMutation.isPending ? (
                <div className="flex items-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 inline mr-2" />
                  {isEditing ? 'Update Hymn' : 'Create Hymn'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default HymnForm;