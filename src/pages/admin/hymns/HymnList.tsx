import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Music, Search, Filter, Plus, Edit, Trash, 
  Check, XCircle, AlertTriangle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import PageLayout from '../../../components/PageLayout';
import LoadingIndicator from '../../../components/LoadingIndicator';
import AlertBanner from '../../../components/AlertBanner';
import { useAuth } from '../../../contexts/AuthContext';

const AdminHymnList: React.FC = () => {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteHymnId, setDeleteHymnId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const PAGE_SIZE = 10;
  
  // Fetch hymns with admin details
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-hymns', statusFilter, currentPage],
    queryFn: async () => {
      let query = supabase
        .from('hymns')
        .select(`
          *,
          hymn_authors(authors(*)),
          hymn_categories(categories(*)),
          custom_users(name, email)
        `, { count: 'exact' });
      
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      // Calculate pagination
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      return {
        hymns: data.map(hymn => ({
          ...hymn,
          authors: hymn.hymn_authors?.map((ha: any) => ha.authors) || [],
          categories: hymn.hymn_categories?.map((hc: any) => hc.categories) || [],
          creator: hymn.custom_users
        })),
        totalCount: count || 0
      };
    }
  });
  
  // Delete hymn mutation
  const deleteHymnMutation = useMutation({
    mutationFn: async (hymnId: string) => {
      // Delete related records first
      await Promise.all([
        supabase.from('hymn_authors').delete().eq('hymn_id', hymnId),
        supabase.from('hymn_categories').delete().eq('hymn_id', hymnId),
        supabase.from('hymn_views').delete().eq('hymn_id', hymnId),
        supabase.from('pdf_files').delete().eq('hymn_id', hymnId)
      ]);
      
      // Then delete the hymn
      const { error } = await supabase
        .from('hymns')
        .delete()
        .eq('id', hymnId);
      
      if (error) throw error;
      return hymnId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hymns'] });
      setShowDeleteConfirm(false);
      setDeleteHymnId(null);
    }
  });
  
  // Approve hymn mutation
  const approveHymnMutation = useMutation({
    mutationFn: async ({ hymnId, status }: { hymnId: string; status: string }) => {
      const { error } = await supabase
        .from('hymns')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', hymnId);
      
      if (error) throw error;
      return hymnId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hymns'] });
    }
  });
  
  // Filtered hymns based on search query
  const filteredHymns = data?.hymns.filter(hymn => 
    searchQuery 
      ? hymn.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        hymn.authors?.some(author => 
          author?.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : true
  ) || [];
  
  // Total pages for pagination
  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;
  
  // Handle delete confirmation
  const handleDeleteClick = (hymnId: string) => {
    setDeleteHymnId(hymnId);
    setShowDeleteConfirm(true);
  };
  
  // Handle hymn approval
  const handleApproveHymn = (hymnId: string) => {
    approveHymnMutation.mutate({ hymnId, status: 'approved' });
  };
  
  // Handle hymn rejection
  const handleRejectHymn = (hymnId: string) => {
    approveHymnMutation.mutate({ hymnId, status: 'rejected' });
  };
  
  return (
    <PageLayout title="Manage Hymns">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hymns Management</h1>
              <p className="text-gray-500">Manage, approve, and organize hymns</p>
            </div>
            <Link
              to="/admin/hymns/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Hymn
            </Link>
          </div>
          
          {/* Search and filters */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search hymns..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
              </div>
            </div>
            
            {/* Expanded filters */}
            {showFilters && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setStatusFilter(null)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          statusFilter === null 
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          statusFilter === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => setStatusFilter('approved')}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          statusFilter === 'approved'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        Approved
                      </button>
                      <button
                        onClick={() => setStatusFilter('rejected')}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          statusFilter === 'rejected'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        Rejected
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Hymn list */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingIndicator size="large" message="Loading hymns..." />
            </div>
          ) : error ? (
            <AlertBanner 
              type="error"
              title="Error loading hymns"
              message="There was a problem loading the hymn list. Please try again."
            />
          ) : filteredHymns.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hymns found</h3>
              <p className="mt-1 text-gray-500">
                {searchQuery 
                  ? 'No hymns match your search criteria.' 
                  : statusFilter 
                    ? `No hymns with status "${statusFilter}" found.` 
                    : 'There are no hymns in the system yet.'}
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hymn
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author(s)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHymns.map((hymn) => (
                    <tr key={hymn.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Music className="h-5 w-5 text-indigo-600 mr-3" />
                          <div className="text-sm font-medium text-gray-900">
                            <Link to={`/hymns/${hymn.id}`} className="hover:text-indigo-600">
                              {hymn.title}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {hymn.authors?.map(author => author?.name).join(', ') || 'No author'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${hymn.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : hymn.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                          {hymn.status === 'approved' && <Check className="h-3 w-3 mr-1" />}
                          {hymn.status === 'pending' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {hymn.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                          {hymn.status?.charAt(0).toUpperCase() + hymn.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {hymn.creator?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          {/* Approval buttons for pending hymns (admin and editor) */}
                          {hymn.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveHymn(hymn.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleRejectHymn(hymn.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          
                          {/* Edit button (admin and editor) */}
                          <Link
                            to={`/admin/hymns/${hymn.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          
                          {/* Delete button (admin only) */}
                          {userRole === 'administrator' && (
                            <button
                              onClick={() => handleDeleteClick(hymn.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * PAGE_SIZE + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * PAGE_SIZE, data?.totalCount || 0)}
                </span>{' '}
                of <span className="font-medium">{data?.totalCount}</span> hymns
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
          
          {/* Delete confirmation modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Confirmation</h3>
                <p className="text-gray-500 mb-4">
                  Are you sure you want to delete this hymn? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteHymnId && deleteHymnMutation.mutate(deleteHymnId)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    disabled={deleteHymnMutation.isPending}
                  >
                    {deleteHymnMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminHymnList;
