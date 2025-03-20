import { supabase } from '../lib/supabase';

interface ConnectionStatus {
  auth: boolean;
  database: boolean;
  storage: boolean;
  message?: string;
}

/**
 * Tests the connection to Supabase services
 * @returns ConnectionStatus object with status for each service
 */
export async function testSupabaseConnection(): Promise<ConnectionStatus> {
  const status: ConnectionStatus = {
    auth: false,
    database: false,
    storage: false
  };
  
  try {
    // Test authentication service
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    status.auth = !sessionError;
    
    // Test database service with a simple query
    const { data: dbData, error: dbError } = await supabase
      .from('categories')
      .select('count')
      .limit(1);
    status.database = !dbError;
    
    // Test storage service
    const { data: bucketData, error: storageError } = await supabase.storage.listBuckets();
    status.storage = !storageError;
    
    // Set status message
    if (status.auth && status.database && status.storage) {
      status.message = 'All Supabase services are connected and working properly';
    } else {
      const failing = [];
      if (!status.auth) failing.push('Authentication');
      if (!status.database) failing.push('Database');
      if (!status.storage) failing.push('Storage');
      status.message = `Connection issues with: ${failing.join(', ')}`;
    }
    
    return status;
  } catch (error) {
    console.error('Error testing Supabase connections:', error);
    return {
      auth: false,
      database: false,
      storage: false,
      message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Tests the network connectivity
 * @returns boolean indicating if the browser is online
 */
export function testNetworkConnection(): boolean {
  return navigator.onLine;
}

// Allow running from browser console
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
}
