import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Theme } from '../../types';
import { Tag, Plus, Edit, Trash2, Save, X, RefreshCw } from 'lucide-react';
import AdminCard from '../../components/admin/AdminCard';
import AdminTable from '../../components/admin/AdminTable';
import AdminAlert from '../../components/admin/AdminAlert';
import LoadingIndicator from '../../components/LoadingIndicator';

const AdminThemes: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAddingTheme, setIsAddingTheme] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [themeName, setThemeName] = useState('');
  const [themeDescription, setThemeDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch themes
  const { data: themes, isLoading } = useQuery({
    queryKey: ['admin-themes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as Theme[];
    }
  });

  // Count hymns by theme
  const { data: themeHymnCounts } = useQuery({
    queryKey: ['theme-hymn-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hymn_themes')
        .select('theme_id, count')
        .select('theme_id, count(*)')
        .group('theme_id');
        
      if (error) throw error;

      // Convert to a map for easier lookup
      const counts: Record<string, number> = {};
      data.forEach((item) => {
        counts[item.theme_id] = item.count;
      });
      
      return counts;
    }
  });

  // Create theme mutation
  const createThemeMutation = useMutation({
    mutationFn: async (theme: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('themes')
        .insert([theme])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-themes'] });
      resetForm();
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to create theme');
    }
  });

  // Update theme mutation
  const updateThemeMutation = useMutation({
    mutationFn: async (theme: { id: string; name: string; description?: string }) => {
      const { id, ...updateData } = theme;
      const { error } = await supabase
        .from('themes')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      return theme;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-themes'] });
      resetForm();
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to update theme');
    }
  });

  // Delete theme mutation
  const deleteThemeMutation = useMutation({
    mutationFn: async (themeId: string) => {
      const { error } = await supabase
        .from('themes')
        .delete()
        .eq('id', themeId);
        
      if (error) throw error;
      return themeId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-themes'] });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to delete theme');
    }
  });

  // Reset form state
  const resetForm = () => {
    setIsAddingTheme(false);
    setEditingThemeId(null);
    setThemeName('');
    setThemeDescription('');
    setError(null);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!themeName.trim()) {
      setError('Theme name is required');
      return;
    }
    
    if (editingThemeId) {
      updateThemeMutation.mutate({
        id: editingThemeId,
        name: themeName.trim(),
        description: themeDescription.trim() || undefined
      });
    } else {
      createThemeMutation.mutate({
        name: themeName.trim(),
        description: themeDescription.trim() || undefined
      });
    }
  };

  // Start editing a theme
  const handleEdit = (theme: Theme) => {
    setEditingThemeId(theme.id);
    setThemeName(theme.name);
    setThemeDescription(theme.description || '');
    setIsAddingTheme(true);
  };

  // Handle delete theme
  const handleDelete = (theme: Theme) => {
    const hymnCount = themeHymnCounts?.[theme.id] || 0;
    
    // Warn user if theme has hymns
    let confirmMessage = `Are you sure you want to delete the theme "${theme.name}"?`;
    if (hymnCount > 0) {
      confirmMessage += `\n\nThis theme has ${hymnCount} hymns. Deleting it will remove the theme reference from these hymns.`;
    }
    
    if (window.confirm(confirmMessage)) {
      deleteThemeMutation.mutate(theme.id);
    }
  };

  // Define table columns
  const columns = [
    {
      header: 'Theme',
      accessor: 'name',
      cell: (value: string, row: Theme) => (
        <div className="flex items-center">
          <Tag className="h-5 w-5 text-indigo-500 mr-2" />
          <span className="font-medium text-gray-900 dark:text-white">{value}</span>
        </div>
      )
    },
    {
      header: 'Description',
      accessor: 'description',
      cell: (value: string) => value || <span className="text-gray-400 dark:text-gray-500 italic">No description</span>
    },
    {
      header: 'Hymn Count',
      accessor: (row: Theme) => themeHymnCounts?.[row.id] || 0,
      cell: (value: number) => (
        <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {value}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (row: Theme) => row,
      cell: (_: any, row: Theme) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
            title="Edit theme"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            title="Delete theme"
            disabled={deleteThemeMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Themes</h1>
        <button
          onClick={() => setIsAddingTheme(!isAddingTheme)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {isAddingTheme ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Theme
            </>
          )}
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <AdminAlert
          type="error"
          message={error}
          dismissible
          onDismiss={() => setError(null)}
          className="mb-6"
        />
      )}
      
      {/* Add/Edit theme form */}
      {isAddingTheme && (
        <AdminCard
          title={editingThemeId ? "Edit Theme" : "Add Theme"}
          className="mb-6"
        >
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="theme-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theme Name *
                </label>
                <input
                  type="text"
                  id="theme-name"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter theme name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="theme-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description (optional)
                </label>
                <textarea
                  id="theme-description"
                  rows={3}
                  value={themeDescription}
                  onChange={(e) => setThemeDescription(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter theme description"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createThemeMutation.isPending || updateThemeMutation.isPending}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
                >
                  {(createThemeMutation.isPending || updateThemeMutation.isPending) ? (
                    <>
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      {editingThemeId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingThemeId ? 'Update Theme' : 'Create Theme'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </AdminCard>
      )}
      
      {/* Themes table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingIndicator size="large" message="Loading themes..." />
        </div>
      ) : (
        <AdminTable
          columns={columns}
          data={themes || []}
          keyField="id"
          emptyMessage="No themes found. Click 'Add Theme' to create one."
        />
      )}
      
      {/* Stats */}
      {themes && themes.length > 0 && (
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>Total themes: {themes.length}</p>
        </div>
      )}
    </div>
  );
};

export default AdminThemes;
