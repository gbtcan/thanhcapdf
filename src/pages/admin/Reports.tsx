import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Filter, Check, X, AlertTriangle, Flag } from 'lucide-react';
import { AdminLayout } from '../../components/admin';
import LoadingIndicator from '../../components/LoadingIndicator';
import AlertBanner from '../../components/AlertBanner';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';
import { formatDate } from '../../utils/formatters';

// Define types for reports
type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
type ReportType = 'user' | 'hymn' | 'comment' | 'forum_post';

interface Report {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  reportedItemId: string;
  reportedItemType: string;
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  status: ReportStatus;
  assignedTo?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
}

// Mock API functions - replace with actual API calls
const fetchReports = async (page = 1, filters: Record<string, any> = {}, sortBy = 'createdAt', sortOrder = 'desc') => {
  // This would be an API call in production
  // For now return mock data
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  
  const mockReports: Report[] = [
    {
      id: '1',
      type: 'user',
      title: 'Inappropriate username',
      description: 'This user has an offensive username that violates community guidelines.',
      reportedItemId: 'user123',
      reportedItemType: 'user',
      reportedBy: {
        id: 'user456',
        name: 'John Smith',
        email: 'john@example.com'
      },
      createdAt: '2023-10-15T14:32:00Z',
      status: 'pending'
    },
    {
      id: '2',
      type: 'comment',
      title: 'Spam comment',
      description: 'User posting irrelevant links and promotional content.',
      reportedItemId: 'comment789',
      reportedItemType: 'comment',
      reportedBy: {
        id: 'user789',
        name: 'Sarah Johnson',
        email: 'sarah@example.com'
      },
      createdAt: '2023-10-14T09:45:00Z',
      status: 'reviewing',
      assignedTo: 'admin1'
    },
    {
      id: '3',
      type: 'forum_post',
      title: 'Harassment in forum',
      description: 'This post contains personal attacks against another user.',
      reportedItemId: 'post456',
      reportedItemType: 'forum_post',
      reportedBy: {
        id: 'user321',
        name: 'Michael Brown',
        email: 'michael@example.com'
      },
      createdAt: '2023-10-13T18:20:00Z',
      status: 'resolved',
      resolvedAt: '2023-10-14T10:15:00Z',
      resolvedBy: 'admin2',
      resolution: 'Post was removed and user was warned.'
    },
    {
      id: '4',
      type: 'hymn',
      title: 'Copyright violation',
      description: 'This hymn appears to be copied from a copyrighted source without permission.',
      reportedItemId: 'hymn123',
      reportedItemType: 'hymn',
      reportedBy: {
        id: 'user654',
        name: 'Emily Wilson',
        email: 'emily@example.com'
      },
      createdAt: '2023-10-12T11:05:00Z',
      status: 'dismissed',
      resolvedAt: '2023-10-13T15:30:00Z',
      resolvedBy: 'admin1',
      resolution: 'Verified that the hymn is in public domain.'
    },
    {
      id: '5',
      type: 'comment',
      title: 'Offensive language',
      description: 'Comment contains profanity and offensive language.',
      reportedItemId: 'comment456',
      reportedItemType: 'comment',
      reportedBy: {
        id: 'user987',
        name: 'David Lee',
        email: 'david@example.com'
      },
      createdAt: '2023-10-11T16:40:00Z',
      status: 'pending'
    }
  ];
  
  // Apply filters
  let filteredReports = [...mockReports];
  
  if (filters.status) {
    filteredReports = filteredReports.filter(report => report.status === filters.status);
  }
  
  if (filters.type) {
    filteredReports = filteredReports.filter(report => report.type === filters.type);
  }
  
  // Apply sorting
  filteredReports.sort((a, b) => {
    const aValue = a[sortBy as keyof Report];
    const bValue = b[sortBy as keyof Report];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return 0;
  });
  
  // Apply pagination
  const limit = 10;
  const offset = (page - 1) * limit;
  const paginatedReports = filteredReports.slice(offset, offset + limit);
  
  return {
    reports: paginatedReports,
    totalCount: filteredReports.length,
    page,
    totalPages: Math.ceil(filteredReports.length / limit)
  };
};

const updateReportStatus = async (reportId: string, status: ReportStatus, resolution?: string) => {
  // This would be an API call in production
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  return { success: true };
};

const ReportsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{status?: ReportStatus, type?: ReportType}>({});
  const [sortConfig, setSortConfig] = useState<{field: string, order: 'asc' | 'desc'}>({
    field: 'createdAt',
    order: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch reports with current filters and pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'reports', currentPage, filters, sortConfig],
    queryFn: () => fetchReports(currentPage, filters, sortConfig.field, sortConfig.order)
  });
  
  // Mutations for updating report status
  const updateStatusMutation = useMutation({
    mutationFn: ({ reportId, status, resolution }: { reportId: string, status: ReportStatus, resolution?: string }) => 
      updateReportStatus(reportId, status, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    }
  });
  
  // Handle sort toggle
  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
    }));
  };
  
  // Handle status update
  const handleStatusUpdate = (reportId: string, status: ReportStatus) => {
    updateStatusMutation.mutate({ reportId, status });
  };
  
  // Handle filter change
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Get status badge color
  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewing': return 'info';
      case 'resolved': return 'success';
      case 'dismissed': return 'neutral';
      default: return 'neutral';
    }
  };
  
  // Get type badge color
  const getTypeColor = (type: ReportType) => {
    switch (type) {
      case 'user': return 'purple';
      case 'comment': return 'blue';
      case 'forum_post': return 'green';
      case 'hymn': return 'indigo';
      default: return 'gray';
    }
  };
  
  return (
    <AdminLayout title="Report Management" description="Review and manage user reports">
      <div className="space-y-6">
        {/* Header and filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Review and manage reports from users
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row sm:items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>
        
        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white p-4 rounded-md shadow border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status-filter"
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700">
                Report Type
              </label>
              <select
                id="type-filter"
                value={filters.type || 'all'}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="all">All Types</option>
                <option value="user">User</option>
                <option value="hymn">Hymn</option>
                <option value="comment">Comment</option>
                <option value="forum_post">Forum Post</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Error and loading states */}
        {error ? (
          <AlertBanner
            type="error"
            title="Error loading reports"
            message="There was a problem loading the report data. Please try again later."
          />
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingIndicator size="large" message="Loading reports..." />
          </div>
        ) : (
          <>
            {/* Reports table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              {data && data.reports.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('type')}
                          >
                            <div className="flex items-center">
                              Type
                              {sortConfig.field === 'type' && (
                                sortConfig.order === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('title')}
                          >
                            <div className="flex items-center">
                              Report Details
                              {sortConfig.field === 'title' && (
                                sortConfig.order === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('reportedBy')}
                          >
                            <div className="flex items-center">
                              Reported By
                              {sortConfig.field === 'reportedBy' && (
                                sortConfig.order === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('createdAt')}
                          >
                            <div className="flex items-center">
                              Date
                              {sortConfig.field === 'createdAt' && (
                                sortConfig.order === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('status')}
                          >
                            <div className="flex items-center">
                              Status
                              {sortConfig.field === 'status' && (
                                sortConfig.order === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.reports.map((report) => (
                          <tr key={report.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge color={getTypeColor(report.type)} size="small">
                                {report.type.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{report.title}</div>
                              <div className="text-sm text-gray-500 line-clamp-2">{report.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{report.reportedBy.name}</div>
                              <div className="text-sm text-gray-500">{report.reportedBy.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(report.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge color={getStatusColor(report.status)}>
                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                {report.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusUpdate(report.id, 'reviewing')}
                                      className="text-indigo-600 hover:text-indigo-900"
                                      title="Mark as reviewing"
                                    >
                                      <AlertTriangle className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(report.id, 'dismissed')}
                                      className="text-red-600 hover:text-red-900"
                                      title="Dismiss report"
                                    >
                                      <X className="h-5 w-5" />
                                    </button>
                                  </>
                                )}
                                {report.status === 'reviewing' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusUpdate(report.id, 'resolved')}
                                      className="text-green-600 hover:text-green-900"
                                      title="Mark as resolved"
                                    >
                                      <Check className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(report.id, 'dismissed')}
                                      className="text-red-600 hover:text-red-900"
                                      title="Dismiss report"
                                    >
                                      <X className="h-5 w-5" />
                                    </button>
                                  </>
                                )}
                                <a
                                  href={`/admin/reports/${report.id}`}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  View
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  {data.totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50">
                      <Pagination 
                        currentPage={currentPage}
                        totalPages={data.totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center">
                  <Flag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {Object.keys(filters).length > 0 
                      ? "No reports match your current filters. Try adjusting your filters."
                      : "There are no reports to display at this time."}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
