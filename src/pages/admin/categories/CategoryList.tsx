import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Tag, BookOpen, Search, Plus, Edit, Trash, 
  AlertCircle, Loader2, XCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import PageLayout from '../../../components/PageLayout';
import type { Category } from '../../../types';

// Pagination constants
const PAGE_SIZE = 12;

const AdminCategoryList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userRole, loading: authLoading } = useAuth();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryInUse, setCategoryInUse] = useState(false);
  
  // Check permissions
  useEffect(() => {
    if (!authLoading && userRole !== 'administrator' && userRole !== 'editor') {
      navigate('/login', { 
        state: { message: 'You need administrator or editor permissions to access this page.' }
      });
    }
  }, [userRole, authLoading, navigate]);

  // Fetch categories
  const { data: categories, isLoading, error } = useQuery<Category[]>({
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
  
  // Fetch category usage count
  const { data: categoryCounts } = useQuery<Record<number, number>>({
    queryKey: ['category-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hymn_categories')
        .select('category_id, count');
      
      if (error) throw error;
      
      // Group by category_id and count occurrences
      return data.reduce((acc: Record<number, number>, item: any) => {
        const categoryId = item.category_id;
        acc[categoryId] = (acc[categoryId] || 0) + 1;
        return acc;
      }, {});
    },
    enabled: !authLoading && (userRole === 'administrator' || userRole === 'editor')
  });

  // Delete category mutation
  const deleteCategory = useMutation({
    mutationFn: async (categoryId: number) => {
      // First check if category is in use
      const { count, error: countError } = await supabase
        .from('hymn_categories')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId);
        
      if (countError) throw countError;
      
      if (count && count > 0) {
        setCategoryInUse(true);
        return false;
      }
      
      // If not in use, delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
        
      if (error) throw error;
      return true;
    },
    onSuccess: (deleted) => {
      if (deleted) {
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        setShowDeleteModal(false);
        setSelectedCategory(null);
      }
    }
  });

  // Handle opening delete modal
  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setCategoryInUse(false);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedCategory) {
      deleteCategory.mutate(selectedCategory.id);
    }
  };

  // Filter categories based on search
  const filteredCategories = categories?.filter(category =>
    !searchQuery || 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Calculate pagination
  const totalPages = Math.ceil(filteredCategories.length / PAGE_SIZE);
  const paginatedCategories = filteredCategories.slice(
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
            <Tag className="h-7 w-7 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          </div>
          <Link
            to="/admin/categories/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Category
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* List of categories */}
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
                    Error loading categories: {(error as Error).message}
                  </p>
                </div>
              </div>
            </div>
          ) : paginatedCategories.length === 0 ? (
            <div className="p-6 text-center">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No categories found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 
                  'Try adjusting your search criteria' : 
                  'Get started by adding a new category'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {paginatedCategories.map((category) => (
                <div key={category.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-indigo-600">{category.name}</h3>
                      {category.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{category.description}</p>
                      )}
                      <div className="flex items-center mt-2">
                        <BookOpen className="h-4 w-4 text-gray-400 mr-1" />
                        <p className="text-xs text-gray-500">
                          {categoryCounts?.[category.id] || 0} hymns
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/admin/categories/${category.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      {userRole === 'administrator' && (
                        <button
                          onClick={() => handleDeleteClick(category)}
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
                      to={`/categories/${category.id}`}
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
                  {Math.min(currentPage * PAGE_SIZE, filteredCategories.length)}
                </span>{' '}
                of <span className="font-medium">{filteredCategories.length}</span> results
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
        {showDeleteModal && selectedCategory && (
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
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Category</h3>
                      <div className="mt-2">
                        {categoryInUse ? (
                          <div className="text-sm text-red-500">
                            <p>
                              <strong>Cannot delete "{selectedCategory.name}"</strong>
                            </p>
                            <p className="mt-1">
                              This category is used by hymns in the database. Please remove these associations first.
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Are you sure you want to delete "{selectedCategory.name}"? This action cannot be undone.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  {!categoryInUse && (
                    <button
                      type="button"
                      onClick={handleDeleteConfirm}
                      disabled={deleteCategory.isPending}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteCategory.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    {categoryInUse ? 'Understood' : 'Cancel'}
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

export default AdminCategoryList;
