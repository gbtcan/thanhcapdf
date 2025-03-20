import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Save, X, AlertTriangle } from 'lucide-react';
import { fetchForumTags } from '../../lib/forumService';
import { supabase } from '../../lib/supabase';
import LoadingIndicator from '../../components/LoadingIndicator';
import AlertBanner from '../../components/AlertBanner';
import type { Tag } from '../../types/forum';

const ForumTags: React.FC = () => {
  const queryClient = useQueryClient();
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState<{ id: string; name: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Fetch tags
  const { data: tags, isLoading, error } = useQuery({
    queryKey: ['forum-tags'],
    queryFn: fetchForumTags
  });
  
  // Create tag mutation
  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('tags')
        .insert([{ name }])
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-tags'] });
      setNewTagName('');
      setErrorMessage(null);
      setSuccessMessage('Tag created successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: Error) => {
      setErrorMessage(`Failed to create tag: ${error.message}`);
    }
  });
  
  // Update tag mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from('tags')
        .update({ name })
        .eq('id', id);
        
      if (error) throw error;
      return { id, name };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-tags'] });
      setEditingTag(null);
      setErrorMessage(null);
      setSuccessMessage('Tag updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: Error) => {
      setErrorMessage(`Failed to update tag: ${error.message}`);
    }
  });
  
  // Delete tag mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-tags'] });
      setErrorMessage(null);
      setSuccessMessage('Tag deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: Error) => {
      setErrorMessage(`Failed to delete tag: ${error.message}`);
    }
  });
  
  // Handle create tag
  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim()) {
      createMutation.mutate(newTagName.trim());
    }
  };
  
  // Handle update tag
  const handleUpdateTag = () => {
    if (editingTag && editingTag.name.trim()) {
      updateMutation.mutate(editingTag);
    } else {
      setEditingTag(null);
    }
  };
  
  // Handle delete tag
  const handleDeleteTag = (id: string) => {
    if (confirm('Are you sure you want to delete this tag? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };
  
  // Start editing tag
  const startEditing = (tag: Tag) => {
    setEditingTag({ id: tag.id, name: tag.name });
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingTag(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage Forum Tags</h1>
      </div>
      
      {/* Status messages */}
      {errorMessage && (
        <AlertBanner
          type="error"
          title="Error"
          message={errorMessage}
          dismissible={true}
          onDismiss={() => setErrorMessage(null)}
        />
      )}
      
      {successMessage && (
        <AlertBanner
          type="success"
          title="Success"
          message={successMessage}
          dismissible={true}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}
      
      {/* Create new tag form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Tag</h2>
        <form onSubmit={handleCreateTag} className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Enter tag name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending || !newTagName.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
          >
            {createMutation.isPending ? (
              <LoadingIndicator size="small" color="white" className="mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add Tag
          </button>
        </form>
      </div>
      
      {/* Tag list */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="bg-gray-50 px-6 py-3 text-lg font-medium text-gray-900 border-b border-gray-200">
          Existing Tags
        </h2>
        
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingIndicator size="large" message="Loading tags..." />
          </div>
        ) : error ? (
          <div className="p-6">
            <AlertBanner
              type="error"
              title="Failed to load tags"
              message={error instanceof Error ? error.message : 'Unknown error occurred'}
            />
          </div>
        ) : !tags || tags.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No tags found. Create your first tag above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tag Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingTag && editingTag.id === tag.id ? (
                        <input
                          type="text"
                          value={editingTag.name}
                          onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingTag && editingTag.id === tag.id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={handleUpdateTag}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending ? (
                              <LoadingIndicator size="small" className="mr-1" />
                            ) : (
                              <Save className="h-4 w-4 mr-1" />
                            )}
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-500 hover:text-gray-700 flex items-center"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => startEditing(tag)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={deleteMutation.isPending && deleteMutation.variables === tag.id}
                          >
                            {deleteMutation.isPending && deleteMutation.variables === tag.id ? (
                              <LoadingIndicator size="small" color="red" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumTags;
