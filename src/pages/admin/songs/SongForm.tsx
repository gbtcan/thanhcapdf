import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query'; //import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Music, Save, ArrowLeft, X, Plus, Loader2, CheckCircle, FileText } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import PDFUploader from '../../../components/PDFUploader';
import type { Author, Category } from '../../../types';

interface SongFormData {
  title: string;
  lyrics: string;
  selectedAuthors: number[];
  selectedCategories: number[];
  pdfUrl: string | null;
}

const SongForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userRole } = useAuth();
  const isNew = id === 'new';
  
  // Form state
  const [formData, setFormData] = useState<SongFormData>({
    title: '',
    lyrics: '',
    selectedAuthors: [],
    selectedCategories: [],
    pdfUrl: null
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

  // Fetch song data if editing
  const { data: song, isLoading: songLoading } = useQuery({
    queryKey: ['admin-song', id],
    queryFn: async () => {
      if (isNew) return null;
      
      const { data, error } = await supabase
        .from('hymns')
        .select(`
          *,
          hymn_authors(author_id),
          hymn_categories(category_id),
          pdf_files(file_url)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      // Set form data
      setFormData({
        title: data.title,
        lyrics: data.lyrics,
        selectedAuthors: data.hymn_authors?.map((ha: any) => Number(ha.author_id)) || [],
        selectedCategories: data.hymn_categories?.map((hc: any) => Number(hc.category_id)) || [],
        pdfUrl: data.pdf_files?.[0]?.file_url || null
      });
      
      return data;
    },
    enabled: !isNew && !!id
  });

  // Fetch all authors for selection
  const { data: authors } = useQuery({
    queryKey: ['authors-for-selection'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as Author[];
    }
  });

  // Fetch all categories for selection
  const { data: categories } = useQuery({
    queryKey: ['categories-for-selection'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as Category[];
    }
  });

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle author selection
  const handleAuthorChange = (authorId: number) => {
    setFormData(prev => {
      const authors = prev.selectedAuthors.includes(authorId)
        ? prev.selectedAuthors.filter(id => id !== authorId)
        : [...prev.selectedAuthors, authorId];
      
      return { ...prev, selectedAuthors: authors };
    });
  };

  // Handle category selection
  const handleCategoryChange = (categoryId: number) => {
    setFormData(prev => {
      const categories = prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId];
      
      return { ...prev, selectedCategories: categories };
    });
  };

  // Handle PDF upload
  const handlePdfUpload = (url: string) => {
    setFormData(prev => ({ ...prev, pdfUrl: url }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Basic validation
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      
      // Create or update the hymn
      let hymnId: string;
      
      if (isNew) {
        // Create new hymn
        const { data, error } = await supabase
          .from('hymns')
          .insert({
            title: formData.title,
            lyrics: formData.lyrics
          })
          .select('id')
          .single();
          
        if (error) throw error;
        hymnId = data.id;
      } else {
        // Update existing hymn
        const { error } = await supabase
          .from('hymns')
          .update({
            title: formData.title,
            lyrics: formData.lyrics,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
          
        if (error) throw error;
        hymnId = id!;
        
        // Delete existing relationships
        await Promise.all([
          supabase.from('hymn_authors').delete().eq('hymn_id', hymnId),
          supabase.from('hymn_categories').delete().eq('hymn_id', hymnId)
        ]);
      }
      
      // Create author relationships
      if (formData.selectedAuthors.length > 0) {
        const authorRelations = formData.selectedAuthors.map(authorId => ({
          hymn_id: hymnId,
          author_id: authorId
        }));
        
        const { error: authorError } = await supabase
          .from('hymn_authors')
          .insert(authorRelations);
          
        if (authorError) throw authorError;
      }
      
      // Create category relationships
      if (formData.selectedCategories.length > 0) {
        const categoryRelations = formData.selectedCategories.map(categoryId => ({
          hymn_id: hymnId,
          category_id: categoryId
        }));
        
        const { error: categoryError } = await supabase
          .from('hymn_categories')
          .insert(categoryRelations);
          
        if (categoryError) throw categoryError;
      }
      
      // Handle PDF attachment
      if (formData.pdfUrl) {
        if (isNew || !song?.pdf_files || song.pdf_files.length === 0) {
          // Create new PDF entry
          const { error: pdfError } = await supabase
            .from('pdf_files')
            .insert({
              hymn_id: hymnId,
              file_url: formData.pdfUrl
            });
            
          if (pdfError) throw pdfError;
        } else {
          // Update existing PDF entry
          const { error: pdfError } = await supabase
            .from('pdf_files')
            .update({
              file_url: formData.pdfUrl,
              updated_at: new Date().toISOString()
            })
            .eq('hymn_id', hymnId);
            
          if (pdfError) throw pdfError;
        }
      }
      
      // Success
      setSuccess(true);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['admin-hymns'] });
      queryClient.invalidateQueries({ queryKey: ['hymns'] });
      
      // Navigate after a brief delay
      setTimeout(() => {
        navigate('/admin/songs');
      }, 1500);
      
    } catch (err: any) {
      console.error('Error saving hymn:', err);
      setError(err.message || 'Failed to save hymn');
    } finally {
      setLoading(false);
    }
  };

  if (songLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Music className="h-7 w-7 text-indigo-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Add New Hymn' : `Edit Hymn: ${song?.title}`}
          </h1>
        </div>
        <Link
          to="/admin/songs"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back to Hymns</span>
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
                Hymn {isNew ? 'created' : 'updated'} successfully!
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
          {/* Title field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter hymn title"
            />
          </div>

          {/* Lyrics field */}
          <div>
            <label htmlFor="lyrics" className="block text-sm font-medium text-gray-700 mb-1">
              Lyrics <span className="text-red-500">*</span>
            </label>
            <textarea
              id="lyrics"
              name="lyrics"
              value={formData.lyrics}
              onChange={handleChange}
              required
              rows={10}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter hymn lyrics"
            />
          </div>

          {/* Authors selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Authors
            </label>
            
            {formData.selectedAuthors.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {formData.selectedAuthors.map(authorId => {
                  const author = authors?.find(a => Number(a.id) === authorId);
                  return author ? (
                    <span 
                      key={author.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {author.name}
                      <button
                        type="button"
                        onClick={() => handleAuthorChange(Number(author.id))}
                        className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                      >
                        <span className="sr-only">Remove {author.name}</span>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {authors?.map(author => (
                <div 
                  key={author.id}
                  className={`
                    p-3 border rounded-md cursor-pointer
                    ${formData.selectedAuthors.includes(Number(author.id))
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:bg-gray-50'}
                  `}
                  onClick={() => handleAuthorChange(Number(author.id))}
                >
                  <div className="text-sm font-medium">{author.name}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-3">
              <Link 
                to="/admin/authors/new"
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add new author
              </Link>
            </div>
          </div>

          {/* Categories selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Categories
            </label>
            
            {formData.selectedCategories.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {formData.selectedCategories.map(categoryId => {
                  const category = categories?.find(c => Number(c.id) === categoryId);
                  return category ? (
                    <span 
                      key={category.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {category.name}
                      <button
                        type="button"
                        onClick={() => handleCategoryChange(Number(category.id))}
                        className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                      >
                        <span className="sr-only">Remove {category.name}</span>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {categories?.map(category => (
                <div 
                  key={category.id}
                  className={`
                    p-3 border rounded-md cursor-pointer
                    ${formData.selectedCategories.includes(Number(category.id))
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:bg-gray-50'}
                  `}
                  onClick={() => handleCategoryChange(Number(category.id))}
                >
                  <div className="text-sm font-medium">{category.name}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-3">
              <Link 
                to="/admin/categories/new"
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add new category
              </Link>
            </div>
          </div>

          {/* PDF upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              PDF File
            </label>
            
            {formData.pdfUrl ? (
              <div className="mb-3">
                <a 
                  href={formData.pdfUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-indigo-600 hover:text-indigo-900"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  View current PDF
                </a>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, pdfUrl: null }))}
                  className="mt-2 text-sm text-red-600 hover:text-red-900"
                >
                  Remove PDF
                </button>
              </div>
            ) : (
              <PDFUploader 
                onUploadComplete={handlePdfUpload} 
                hymnId={id || 'new'}
              />
            )}
          </div>
        </div>
        
        {/* Form footer */}
        <div className="px-6 py-4 bg-gray-50 text-right">
          <button
            type="button"
            onClick={() => navigate('/admin/songs')}
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
                {isNew ? 'Create Hymn' : 'Update Hymn'}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SongForm;
