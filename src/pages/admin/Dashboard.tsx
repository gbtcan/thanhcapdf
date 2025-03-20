import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Music, Users, FileText, BookOpen, MessageSquare, Activity, Bookmark, BarChart2, Settings } from 'lucide-react';
import LoadingIndicator from '../../components/LoadingIndicator';
import AlertBanner from '../../components/AlertBanner';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';

const AdminDashboard: React.FC = () => {
  // Fetch dashboard stats
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      try {
        const [
          { count: hymnCount },
          { count: userCount },
          { count: themeCount },
          { count: pdfCount },
          { count: pendingCount },
          { data: recentHymns },
          { data: recentActivity },
          { data: topHymns }
        ] = await Promise.all([
          // Total hymn count
          supabase
            .from('hymns_new')
            .select('*', { count: 'exact', head: true }),
            
          // Total user count - use profiles table instead of users
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true }),
            
          // Total themes count
          supabase
            .from('themes')
            .select('*', { count: 'exact', head: true }),
            
          // Total PDF count
          supabase
            .from('hymn_pdf_files')
            .select('*', { count: 'exact', head: true }),
            
          // Pending hymns count
          supabase
            .from('hymns_new')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending'),
            
          // Recent hymns
          supabase
            .from('hymns_new')
            .select(`
              id,
              title,
              created_at,
              status,
              hymn_authors(author_id, authors(name))
            `)
            .order('created_at', { ascending: false })
            .limit(5),
            
          // Recent activity - use system_logs instead of audit_logs
          supabase
            .from('system_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10),

          // Top hymns by view count
          supabase
            .from('hymns_new')
            .select('id, title, view_count')
            .order('view_count', { ascending: false })
            .limit(5)
        ]);
        
        return {
          hymnCount,
          userCount,
          themeCount,
          pdfCount,
          pendingCount,
          recentHymns: recentHymns?.map(hymn => ({
            ...hymn,
            authors: hymn.hymn_authors?.map((ha) => ha.authors) || []
          })) || [],
          recentActivity: recentActivity || [],
          topHymns: topHymns || []
        };
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return {
          hymnCount: 0,
          userCount: 0,
          themeCount: 0,
          pdfCount: 0,
          pendingCount: 0,
          recentHymns: [],
          recentActivity: [],
          topHymns: []
        };
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingIndicator size="large" message="Loading dashboard..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <AlertBanner
          type="error"
          title="Error loading dashboard"
          message="There was a problem loading the dashboard data."
        />
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Hymns count */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <Music className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Hymns</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">{data?.hymnCount}</div>
                    {data?.pendingCount ? (
                      <span className="ml-2 text-sm font-medium text-yellow-500">
                        {data.pendingCount} pending
                      </span>
                    ) : null}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/hymns" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Manage hymns
              </Link>
            </div>
          </div>
        </div>
        
        {/* Users count */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Users</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">{data?.userCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/users" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Manage users
              </Link>
            </div>
          </div>
        </div>
        
        {/* Themes count - fixed the name from Categories to Themes */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Themes</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">{data?.themeCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/themes" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Manage themes
              </Link>
            </div>
          </div>
        </div>
        
        {/* PDF files count */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">PDF Files</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">{data?.pdfCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/files" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Manage files
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently added hymns */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Recently Added Hymns</h3>
          </div>
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.recentHymns?.length === 0 ? (
                <li className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No hymns added recently
                </li>
              ) : (
                data?.recentHymns?.map((hymn: any) => (
                  <li key={hymn.id} className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Music className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {hymn.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {hymn.authors?.map((author: any) => author.name).join(', ')}
                        </p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          hymn.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          hymn.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                          {hymn.status}
                        </span>
                      </div>
                      <div className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(hymn.created_at, { timeStyle: 'short', dateStyle: 'short' })}
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
            <div className="text-sm">
              <Link to="/admin/hymns" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                View all hymns
              </Link>
            </div>
          </div>
        </div>
        
        {/* Recent activity */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.recentActivity?.length === 0 ? (
                <li className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No recent activity
                </li>
              ) : (
                data?.recentActivity?.map((activity: any) => (
                  <li key={activity.id} className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Activity className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {activity.description || 'System activity'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {activity.user_email || 'System'}
                        </p>
                      </div>
                      <div className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(activity.created_at, { timeStyle: 'short', dateStyle: 'short' })}
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
            <div className="text-sm">
              <Link to="/admin/activity" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                View all activity
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional charts and stats */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top viewed hymns */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-indigo-500" />
              Most Viewed Hymns
            </h3>
          </div>
          <div className="p-6">
            {data?.topHymns?.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No hymn view data available
              </p>
            ) : (
              <div>
                {data?.topHymns?.map((hymn: any, index: number) => (
                  <div key={hymn.id} className="mb-4 last:mb-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-5">
                          {index + 1}.
                        </span>
                        <Link to={`/hymns/${hymn.id}`} className="ml-2 text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                          {hymn.title}
                        </Link>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {hymn.view_count || 0} views
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (hymn.view_count / Math.max(...data.topHymns.map((h: any) => h.view_count || 1))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Quick actions */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/admin/hymns/new"
                className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex flex-col items-center justify-center"
              >
                <Music className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Add New Hymn</span>
              </Link>
              
              <Link
                to="/admin/users/new"
                className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 flex flex-col items-center justify-center"
              >
                <Users className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Add New User</span>
              </Link>
              
              <Link
                to="/admin/themes"
                className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 flex flex-col items-center justify-center"
              >
                <Bookmark className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Themes</span>
              </Link>
              
              <Link
                to="/admin/settings"
                className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 flex flex-col items-center justify-center"
              >
                <Settings className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">System Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
