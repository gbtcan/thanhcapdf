import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Music, Search, Filter, Plus, Edit, Trash, 
  AlertCircle, Loader2, XCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import PageLayout from '../../../components/PageLayout';
import type { HymnWithRelations, Category } from '../../../types';

// Pagination constants
const PAGE_SIZE = 10;

const AdminSongList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userRole, loading: authLoading } = useAuth();
  
  // State for search, filters, and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<HymnWithRelations | null>(null);
  
  // Redirect if not admin or editor
  useEffect(() => {
    if (!authLoading && userRole !== 'administrator' && userRole !== 'editor') {
      navigate('/login', { 
        state: { message: 'You need administrator or editor permissions to access this page.' }
      });
    }
  }, [userRole, authLoading, navigate]);

  // Fetch hymns with relations
  const { data: hymns, isLoading, error } = useQuery<HymnWithRelations[]>({
    queryKey: ['admin-hymns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hymns')
        .select(`
          *,
          hymn_authors(authors(*)),
          hymn_categories(categories(*))
        `)
        .order('title');
        
      if (error) throw error;
      
      return data.map(hymn => ({
        ...hymn,
        authors: hymn.hymn_authors?.map((ha: any) => ha.authors) || [],
        categories: hymn.hymn_categories?.map((hc: any) => hc.categories) || []
      }));
    },
    enabled: !authLoading && (userRole === 'administrator' || userRole === 'editor')
  });

  // Fetch categories for filtering
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data;
    },
    enabled: !authLoading && (userRole === 'administrator' || userRole === 'editor')
  });

  // Delete hymn mutation
  const deleteSong = useMutation({
    mutationFn: async (id: string) => {
      // First delete relationships
      await Promise.all([
        supabase.from('hymn_authors').delete().eq('hymn_id', id),
        supabase.from('hymn_categories').delete().eq('hymn_id', id),
        supabase.from('pdf_files').delete().eq('hymn_id', id)
      ]);
      
      // Then delete the hymn
      const { error } = await supabase
        .from('hymns')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hymns'] });
      setShowDeleteModal(false);
      setSelectedSong(null);
    }
  });

  // Handle opening delete modal
  const handleDeleteClick = (song: HymnWithRelations) => {
    setSelectedSong(song);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedSong) {
      deleteSong.mutate(selectedSong.id);
    }
  };

  // Filter hymns based on search and category
  const filteredHymns = hymns?.filter(hymn => {
    const matchesSearch = !searchQuery || 
      hymn.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hymn.authors?.some(author => 
        author.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesCategory = !categoryFilter || 
      hymn.categories?.some(category => category.id === categoryFilter);
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredHymns.length / PAGE_SIZE);
  const paginatedHymns = filteredHymns.slice(
    (currentPage - 1) * PAGE_SIZE, 
    currentPage * PAGE_SIZE
  );

  if (authLoading || (userRole !== 'administrator' && userRole !== 'editor')) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header with title and add button */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Music className="h-7 w-7 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Hymn Management</h1>
          </div>
          <Link
            to="/admin/songs/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Hymn
          </Link>
        </div>

        {/* Search and filter */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search hymns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 border rounded-lg ${
                  showFilters || categoryFilter 
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
          
          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Category
              </label>
              <select
                value={categoryFilter || ''}
                onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : null)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Categories</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* List of hymns */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Error loading hymns: {(error as Error).message}
                  </p>
                </div>
              </div>
            </div>
          ) : paginatedHymns.length === 0 ? (
            <div className="p-6 text-center">
              <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hymns found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || categoryFilter ? 
                  'Try adjusting your search or filter criteria' : 
                  'Get started by adding a new hymn'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {paginatedHymns.map((hymn) => (
                <li key={hymn.id} className="hover:bg-gray-50">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-indigo-600 truncate">{hymn.title}</h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        {hymn.authors && hymn.authors.length > 0 && (
                          <span className="truncate">
                            By: {hymn.authors.map(author => author.name).join(', ')}
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        {hymn.categories?.map(category => (
                          <span 
                            key={category.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-4 items-center">
                      <Link
                        to={`/admin/songs/${hymn.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      {userRole === 'administrator' && (
                        <button
                          onClick={() => handleDeleteClick(hymn)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * PAGE_SIZE) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * PAGE_SIZE, filteredHymns.length)}
                </span>{' '}
                of <span className="font-medium">{filteredHymns.length}</span> results
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-5 w-5 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {showDeleteModal && selectedSong && (
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Hymn</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete "{selectedSong.title}"? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    disabled={deleteSong.isPending}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteSong.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AdminSongList;
