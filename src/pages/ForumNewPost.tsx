import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Save, ArrowLeft, Loader2, X, Tag, Music, 
  PlusCircle, CheckCircle, AlertTriangle, Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  fetchPostDetails, 
  createPost, 
  updatePost, 
  fetchForumTags 
} from '../lib/forumService';
import { supabase } from '../lib/supabase';
import PageLayout from '../components/PageLayout';
import type { Tag as TagType } from '../types/forum';

interface PostFormData {
  title: string;
  content: string;
  hymnId: string;
  tagIds: string[];
}

const ForumNewPost = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    hymnId: '',
    tagIds: []
  });
  
  // UI state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hymnSearchQuery, setHymnSearchQuery] = useState('');
  const [hymnSearchResults, setHymnSearchResults] = useState([]);
  const [showHymnDropdown, setShowHymnDropdown] = useState(false);
  const [selectedHymnTitle, setSelectedHymnTitle] = useState('');
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: isEditing ? `/forum/edit/${id}` : '/forum/new' } });
    }
  }, [isAuthenticated, navigate, isEditing, id]);
  
  // Fetch all tags
  const { data: tags } = useQuery<TagType[]>({
    queryKey: ['forum-tags'],
    queryFn: fetchForumTags,
  });
  
  // If editing, fetch existing post data
  const { data: existingPost } = useQuery({
    queryKey: ['forum-post', id],
    queryFn: () => fetchPostDetails(id!),
    enabled: isEditing,
    onSuccess: (data) => {
      if (data) {
        setFormData({
          title: data.title,
          content: data.content,
          hymnId: data.hymn?.id || '',
          tagIds: data.tags?.map(tag => tag.id) || []
        });
        setSelectedHymnTitle(data.hymn?.title || '');
      }
    }
  });
  
  // Create post mutation
  const createMutation = useMutation({
    mutationFn: (data: PostFormData) => createPost({
      hymnId: data.hymnId,
      userId: user!.id,
      title: data.title,
      content: data.content,
      tagIds: data.tagIds
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      setSuccess(true);
      setTimeout(() => {
        navigate('/forum');
      }, 2000);
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to create post');
    }
  });
  
  // Update post mutation
  const updateMutation = useMutation({
    mutationFn: (data: PostFormData) => updatePost(id!, {
      title: data.title,
      content: data.content,
      tagIds: data.tagIds
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-post', id] });
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/forum/post/${id}`);
      }, 2000);
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to update post');
    }
  });
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Simple validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }
    if (!isEditing && !formData.hymnId) {
      setError('You must select a hymn');
      return;
    }
    
    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle tag selection
  const toggleTag = (tagId: string) => {
    setFormData(prev => {
      if (prev.tagIds.includes(tagId)) {
        return { 
          ...prev, 
          tagIds: prev.tagIds.filter(id => id !== tagId) 
        };
      } else {
        return { 
          ...prev, 
          tagIds: [...prev.tagIds, tagId] 
        };
      }
    });
  };
  
  // Search hymns
  useEffect(() => {
    const searchHymns = async () => {
      if (hymnSearchQuery.length < 2) {
        setHymnSearchResults([]);
        setShowHymnDropdown(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('hymns')
          .select('id, title')
          .ilike('title', `%${hymnSearchQuery}%`)
          .limit(5);
          
        if (error) throw error;
        
        setHymnSearchResults(data);
        setShowHymnDropdown(true);
      } catch (error) {
        console.error('Error searching hymns:', error);
        setHymnSearchResults([]);
      }
    };
    
    const timeout = setTimeout(searchHymns, 300);
    return () => clearTimeout(timeout);
  }, [hymnSearchQuery]);
  
  // Select a hymn from search results
  const selectHymn = (hymn: any) => {
    setFormData(prev => ({ ...prev, hymnId: hymn.id }));
    setSelectedHymnTitle(hymn.title);
    setHymnSearchQuery('');
    setShowHymnDropdown(false);
  };
  
  // Clear selected hymn
  const clearSelectedHymn = () => {
    setFormData(prev => ({ ...prev, hymnId: '' }));
    setSelectedHymnTitle('');
  };
  
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Link
            to={isEditing ? `/forum/post/${id}` : "/forum"}
            className="inline-flex items-center text-gray-700 hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {isEditing ? 'Cancel edit' : 'Back to forum'}
          </Link>
        </div>
        
        {/* Form header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Discussion' : 'Create New Discussion'}
        </h1>
        
        {/* Success message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-100 rounded-md p-4 flex">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Success!</h3>
              <p className="text-sm text-green-700 mt-1">
                {isEditing 
                  ? 'Your discussion has been updated.' 
                  : 'Your discussion has been created.'}
              </p>
              <p className="text-sm text-green-700">Redirecting...</p>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-md p-4 flex">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Title field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Discussion Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter a descriptive title"
                required
              />
            </div>
            
            {/* Hymn selection (only for new posts) */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Hymn
                </label>
                
                {formData.hymnId && selectedHymnTitle ? (
                  <div className="flex items-center">
                    <div className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md flex items-center flex-1">
                      <Music className="h-4 w-4 mr-2" />
                      <span>{selectedHymnTitle}</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearSelectedHymn}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={hymnSearchQuery}
                        onChange={(e) => setHymnSearchQuery(e.target.value)}
                        className="pl-10 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Search for a hymn..."
                      />
                    </div>
                    
                    {showHymnDropdown && hymnSearchResults.length > 0 && (
                      <ul className="absolute z-10 w-full bg-white shadow-lg rounded-md mt-1 max-h-60 overflow-auto border border-gray-200">
                        {hymnSearchResults.map((hymn: any) => (
                          <li 
                            key={hymn.id}
                            className="px-4 py-2 hover:bg-indigo-50 cursor-pointer flex items-center"
                            onClick={() => selectHymn(hymn)}
                          >
                            <Music className="h-4 w-4 mr-2 text-gray-500" />
                            {hymn.title}
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {showHymnDropdown && hymnSearchResults.length === 0 && hymnSearchQuery.length >= 2 && (
                      <div className="absolute z-10 w-full bg-white shadow-lg rounded-md mt-1 border border-gray-200 p-3 text-center">
                        <p className="text-gray-500 text-sm">No hymns found matching "{hymnSearchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Content field */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Discussion Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={8}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Share your thoughts, questions or insights..."
                required
              ></textarea>
            </div>
            
            {/* Tags selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (Optional)
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags?.map(tag => (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      formData.tagIds.includes(tag.id)
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200'
                    } border`}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag.name}
                  </button>
                ))}
                
                {!tags?.length && (
                  <p className="text-sm text-gray-500 italic">Loading tags...</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Form actions */}
          <div className="px-6 py-3 bg-gray-50 flex justify-between items-center border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(isEditing ? `/forum/post/${id}` : '/forum')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Discussion' : 'Create Discussion'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default ForumNewPost;
