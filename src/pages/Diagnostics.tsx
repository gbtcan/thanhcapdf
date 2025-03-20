import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PageLayout from '../components/PageLayout';
import { Check, X, AlertTriangle, Info, Radio, Database, Server, Settings } from 'lucide-react';

interface SystemInfo {
  browser: string;
  os: string;
  timestamp: string;
  connection: string;
}

interface ConnectionStatus {
  auth: boolean;
  db: boolean;
  storage: boolean;
  message?: string;
}

const Diagnostics = () => {
  const { user, userRole, isAuthenticated } = useAuth();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    auth: false,
    db: false,
    storage: false
  });
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  
  // Get system info on mount
  useEffect(() => {
    const getSystemInfo = () => {
      try {
        const userAgent = navigator.userAgent;
        
        // Extract browser
        let browser = 'Unknown';
        if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
        else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
        else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
        else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';
        else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) browser = 'Internet Explorer';
        
        // Extract OS
        let os = 'Unknown';
        if (userAgent.indexOf('Windows') > -1) os = 'Windows';
        else if (userAgent.indexOf('Mac OS') > -1) os = 'macOS';
        else if (userAgent.indexOf('Linux') > -1) os = 'Linux';
        else if (userAgent.indexOf('Android') > -1) os = 'Android';
        else if (userAgent.indexOf('iOS') > -1) os = 'iOS';
        
        // Network connection
        const connection = navigator.onLine ? 'Online' : 'Offline';
        
        setSystemInfo({
          browser,
          os,
          timestamp: new Date().toISOString(),
          connection
        });
      } catch (error) {
        console.error('Error getting system info:', error);
        setSystemInfo({
          browser: 'Unknown (Error)',
          os: 'Unknown (Error)',
          timestamp: new Date().toISOString(),
          connection: 'Unknown'
        });
      }
    };
    
    getSystemInfo();
  }, []);
  
  // Check Supabase connections
  useEffect(() => {
    const checkConnections = async () => {
      setIsCheckingConnection(true);
      
      try {
        // Check auth connection
        let authStatus = false;
        try {
          const { data } = await supabase.auth.getSession();
          authStatus = true;
        } catch (error) {
          console.error('Auth connection error:', error);
        }
        
        // Check database connection
        let dbStatus = false;
        try {
          // Try to query a public table
          const { data, error } = await supabase
            .from('categories')
            .select('count')
            .limit(1)
            .single();
          
          dbStatus = !error;
        } catch (error) {
          console.error('Database connection error:', error);
        }
        
        // Check storage connection
        let storageStatus = false;
        try {
          const { data } = await supabase.storage.listBuckets();
          storageStatus = !!data;
        } catch (error) {
          console.error('Storage connection error:', error);
        }
        
        // Update states
        setConnectionStatus({
          auth: authStatus,
          db: dbStatus,
          storage: storageStatus,
          message: authStatus && dbStatus && storageStatus 
            ? 'All services connected successfully'
            : 'Some services failed to connect'
        });
      } catch (error) {
        console.error('Connection check error:', error);
        setConnectionStatus({
          auth: false,
          db: false,
          storage: false,
          message: `Connection check failed: ${(error as Error).message}`
        });
      } finally {
        setIsCheckingConnection(false);
      }
    };
    
    checkConnections();
  }, []);
  
  return (
    <PageLayout title="System Diagnostics">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Connection status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold flex items-center mb-4">
            <Server className="h-5 w-5 text-indigo-600 mr-2" />
            Connection Status
          </h2>
          
          {isCheckingConnection ? (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
              <span>Checking connections...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Overall status message */}
              <div className={`px-4 py-3 rounded-md ${
                connectionStatus.auth && connectionStatus.db && connectionStatus.storage
                  ? 'bg-green-50 text-green-800'
                  : 'bg-yellow-50 text-yellow-800'
              }`}>
                <div className="flex">
                  {connectionStatus.auth && connectionStatus.db && connectionStatus.storage ? (
                    <Check className="h-5 w-5 mr-2" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 mr-2" />
                  )}
                  <span>{connectionStatus.message}</span>
                </div>
              </div>
              
              {/* Individual services */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Authentication</span>
                    {connectionStatus.auth ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Database</span>
                    {connectionStatus.db ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Storage</span>
                    {connectionStatus.storage ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* User information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold flex items-center mb-4">
            <Radio className="h-5 w-5 text-indigo-600 mr-2" />
            User Status
          </h2>
          
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-md p-4">
                <div className="text-sm text-gray-500 mb-1">Authentication Status</div>
                <div className="flex items-center">
                  {isAuthenticated ? (
                    <>
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-green-700">Authenticated</span>
                    </>
                  ) : (
                    <>
                      <Info className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-blue-700">Not Authenticated</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-md p-4">
                <div className="text-sm text-gray-500 mb-1">User Role</div>
                <div className="font-medium">
                  {userRole || 'No role (anonymous)'}
                </div>
              </div>
            </div>
            
            {user && (
              <div className="border border-gray-200 rounded-md p-4">
                <div className="text-sm text-gray-500 mb-1">User Information</div>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600">ID:</span>{' '}
                    <span className="font-mono text-sm">{user.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>{' '}
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* System information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold flex items-center mb-4">
            <Settings className="h-5 w-5 text-indigo-600 mr-2" />
            System Information
          </h2>
          
          {systemInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-md p-4">
                <div className="text-sm text-gray-500 mb-1">Browser</div>
                <div className="font-medium">{systemInfo.browser}</div>
              </div>
              
              <div className="border border-gray-200 rounded-md p-4">
                <div className="text-sm text-gray-500 mb-1">Operating System</div>
                <div className="font-medium">{systemInfo.os}</div>
              </div>
              
              <div className="border border-gray-200 rounded-md p-4">
                <div className="text-sm text-gray-500 mb-1">Network Status</div>
                <div className="flex items-center">
                  {systemInfo.connection === 'Online' ? (
                    <>
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-green-700">Online</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-red-700">Offline</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-md p-4">
                <div className="text-sm text-gray-500 mb-1">Date & Time</div>
                <div className="font-medium">
                  {new Date(systemInfo.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Loading system information...</div>
          )}
          
          {/* Environment info */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="font-medium mb-3">Environment Variables</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-md p-4">
                <div className="text-sm text-gray-500 mb-1">Mode</div>
                <div className="font-medium">
                  {import.meta.env.MODE}
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-md p-4">
                <div className="text-sm text-gray-500 mb-1">Base URL</div>
                <div className="font-medium">
                  {import.meta.env.BASE_URL || '/'}
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-md p-4">
                <div className="text-sm text-gray-500 mb-1">Supabase URL</div>
                <div className="font-medium line-clamp-1">
                  {import.meta.env.VITE_SUPABASE_URL || 'Not set'}
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-md p-4">
                <div className="text-sm text-gray-500 mb-1">Supabase Key Status</div>
                <div className="font-medium">
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Diagnostics;
