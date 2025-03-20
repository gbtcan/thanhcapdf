import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, Search, Plus, Edit, Trash, 
  AlertCircle, Loader2, XCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import PageLayout from '../../../components/PageLayout';
import type { Author } from '../../../types';

// Pagination constants
const PAGE_SIZE = 12;

const AdminAuthorList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userRole, loading: authLoading } = useAuth();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [authorInUse, setAuthorInUse] = useState(false);
  
  // Check permissions
  useEffect(() => {
    if (!authLoading && userRole !== 'administrator' && userRole !== 'editor') {
      navigate('/login', { 
        state: { message: 'You need administrator or editor permissions to access this page.' }
      });
    }
  }, [userRole, authLoading, navigate]);

  // Fetch authors
  const { data: authors, isLoading, error } = useQuery<Author[]>({
    queryKey: ['admin-authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data;
    },
    enabled: !authLoading && (userRole === 'administrator' || userRole === 'editor')
  });

  // Delete author mutation
  const deleteAuthor = useMutation({
    mutationFn: async (authorId: number) => {
      // First check if author is in use
      const { count, error: countError } = await supabase
        .from('hymn_authors')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', authorId);
        
      if (countError) throw countError;
      
      if (count && count > 0) {
        setAuthorInUse(true);
        return false;
      }
      
      // If not in use, delete the author
      const { error } = await supabase
        .from('authors')
        .delete()
        .eq('id', authorId);
        
      if (error) throw error;
      return true;
    },
    onSuccess: (deleted) => {
      if (deleted) {
        queryClient.invalidateQueries({ queryKey: ['admin-authors'] });
        setShowDeleteModal(false);
        setSelectedAuthor(null);
      }
    }
  });

  // Handle opening delete modal
  const handleDeleteClick = (author: Author) => {
    setSelectedAuthor(author);
    setAuthorInUse(false);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedAuthor) {
      // Convert the ID to a number before passing it to the mutate function
      deleteAuthor.mutate(Number(selectedAuthor.id));
    }
  };

  // Filter authors based on search
  const filteredAuthors = authors?.filter(author =>
    !searchQuery || author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (author.biography && author.biography.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Calculate pagination
  const totalPages = Math.ceil(filteredAuthors.length / PAGE_SIZE);
  const paginatedAuthors = filteredAuthors.slice(
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
            <Users className="h-7 w-7 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Author Management</h1>
          </div>
          <Link
            to="/admin/authors/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Author
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search authors..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* List of authors */}
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
                    Error loading authors: {(error as Error).message}
                  </p>
                </div>
              </div>
            </div>
          ) : paginatedAuthors.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No authors found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 
                  'Try adjusting your search criteria' : 
                  'Get started by adding a new author'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {paginatedAuthors.map((author) => (
                <div key={author.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-indigo-600">{author.name}</h3>
                      {author.biography && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{author.biography}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Added {new Date(author.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/admin/authors/${author.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      {userRole === 'administrator' && (
                        <button
                          onClick={() => handleDeleteClick(author)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <Link
                      to={`/authors/${author.id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * PAGE_SIZE) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * PAGE_SIZE, filteredAuthors.length)}
                </span>{' '}
                of <span className="font-medium">{filteredAuthors.length}</span> results
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
        {showDeleteModal && selectedAuthor && (
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
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Author</h3>
                      <div className="mt-2">
                        {authorInUse ? (
                          <div className="text-sm text-red-500">
                            <p>
                              <strong>Cannot delete "{selectedAuthor.name}"</strong>
                            </p>
                            <p className="mt-1">
                              This author is associated with hymns in the database. Please remove these associations first.
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Are you sure you want to delete "{selectedAuthor.name}"? This action cannot be undone.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  {!authorInUse && (
                    <button
                      type="button"
                      onClick={handleDeleteConfirm}
                      disabled={deleteAuthor.isPending}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteAuthor.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    {authorInUse ? 'Understood' : 'Cancel'}
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

export default AdminAuthorList;
