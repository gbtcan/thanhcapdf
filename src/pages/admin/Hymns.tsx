import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Hymn, HymnWithRelations } from '../../types';
import { Plus, Edit, Trash2, Music, FileText, Search, Filter, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import AlertBanner from '../../components/AlertBanner';
import LoadingIndicator from '../../components/LoadingIndicator';
import Pagination from '../../components/Pagination';
import SearchInput from '../../components/SearchInput';

const AdminHymns: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const pageSize = 10;

  // Fetch hymns with pagination and search
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-hymns', searchQuery, currentPage, selectedStatus],
    queryFn: async () => {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      let query = supabase
        .from('hymns_new')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          status,
          view_count,
          hymn_authors!inner(authors(id, name)),
          hymn_themes!inner(themes(id, name)),
          hymn_pdf_files(id)
        `, { count: 'exact' });
        
      // Apply status filter if not 'all'
      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }
      
      // Apply search if provided
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }
      
      // Apply pagination
      query = query.range(from, to).order('updated_at', { ascending: false });
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Transform data
      const hymns = data.map(hymn => ({
        ...hymn,
        authors: hymn.hymn_authors.map((ha: any) => ha.authors),
        themes: hymn.hymn_themes.map((hc: any) => hc.themes),
        pdf_count: hymn.hymn_pdf_files.length
      }));
      
      return {
        hymns,
        count: count || 0,
        totalPages: count ? Math.ceil(count / pageSize) : 0
      };
    },
    keepPreviousData: true
  });
  
  // Delete hymn mutation
  const deleteHymnMutation = useMutation({
    mutationFn: async (hymnId: string) => {
      const { error } = await supabase
        .from('hymns_new') // Changed from hymns to hymns_new
        .delete()
        .eq('id', hymnId);
        
      if (error) throw error;
      return hymnId;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['admin-hymns'] });
    }
  });
  
  // Update hymn status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ hymnId, status }: { hymnId: string, status: string }) => {
      const { error } = await supabase
        .from('hymns_new') // Changed from hymns to hymns_new
        .update({ status })
        .eq('id', hymnId);
        
      if (error) throw error;
      return { hymnId, status };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['admin-hymns'] });
    }
  });
  
  // Handle hymn deletion
  const handleDelete = (hymn: HymnWithRelations) => {
    if (window.confirm(`Are you sure you want to delete "${hymn.title}"? This action cannot be undone.`)) {
      deleteHymnMutation.mutate(hymn.id as string);
    }
  };
  
  // Handle status change
  const handleStatusChange = (hymn: HymnWithRelations, status: 'approved' | 'pending' | 'rejected') => {
    updateStatusMutation.mutate({ hymnId: hymn.id as string, status });
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Hymns</h1>
        <Link
          to="/admin/hymns/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Hymn
        </Link>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <SearchInput
            placeholder="Search hymns by title..."
            onSearch={setSearchQuery}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Filter className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <button
            onClick={() => refetch()}
            className="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className="h-5 w-5" />
            <span className="sr-only">Refresh</span>
          </button>
        </div>
      </div>
      
      {/* Error state */}
      {error && (
        <AlertBanner
          type="error"
          title="Error loading hymns"
          message="There was a problem loading the hymns. Please try again."
          className="mb-6"
        />
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingIndicator size="large" message="Loading hymns..." />
        </div>
      )}
      
      {/* Hymn table */}
      {!isLoading && !error && data && (
        <>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Hymn
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Author(s)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Files
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Views
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {data.hymns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No hymns found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    data.hymns.map((hymn: any) => (
                      <tr key={hymn.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Music className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{hymn.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">ID: {hymn.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {hymn.authors.map((author: any) => author.name).join(', ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            hymn.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            hymn.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {hymn.status === 'approved' ? 'Approved' :
                             hymn.status === 'rejected' ? 'Rejected' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <FileText className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                            {hymn.pdf_count}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {hymn.view_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {/* View button */}
                            <Link
                              to={`/hymns/${hymn.id}`}
                              className="p-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                              title="View hymn"
                            >
                              <Search className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                            
                            {/* Edit button */}
                            <Link
                              to={`/admin/hymns/edit/${hymn.id}`}
                              className="p-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                              title="Edit hymn"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                            
                            {/* Delete button */}
                            <button
                              onClick={() => handleDelete(hymn)}
                              className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                              title="Delete hymn"
                              disabled={deleteHymnMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-6">
              <Pagination 
                currentPage={currentPage} 
                totalPages={data.totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminHymns;
