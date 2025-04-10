/**
 * API functions for checking the health of application services
 */

import { supabase } from '../../lib/supabase';

export interface HealthStatus {
  databaseConnected: boolean;
  authServiceOnline: boolean;
  storageServiceOnline: boolean;
  status: 'healthy' | 'degraded' | 'offline';
  lastChecked: Date;
  message?: string;
}

export interface ServiceCapabilities {
  fullTextSearch: boolean;
  realtime: boolean;
  storage: boolean;
  rpc: boolean;
  functions: boolean;
}

/**
 * Check health of Supabase services
 */
export async function checkSystemHealth(): Promise<HealthStatus> {
  const healthStatus: HealthStatus = {
    databaseConnected: false,
    authServiceOnline: false,
    storageServiceOnline: false,
    status: 'offline',
    lastChecked: new Date()
  };
  
  try {
    // Check database connection
    const { data: dbData, error: dbError } = await supabase
      .from('health_check')
      .select('*')
      .limit(1);
      
    healthStatus.databaseConnected = !dbError;
    
    // Check auth service (without an actual auth operation)
    const { data: authConfig, error: authError } = await supabase.auth.getSession();
    healthStatus.authServiceOnline = !authError;
    
    // Check storage service (without an actual bucket access)
    try {
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      healthStatus.storageServiceOnline = !storageError;
    } catch (err) {
      healthStatus.storageServiceOnline = false;
    }
    
    // Determine overall status
    if (healthStatus.databaseConnected && healthStatus.authServiceOnline && healthStatus.storageServiceOnline) {
      healthStatus.status = 'healthy';
      healthStatus.message = 'Tất cả dịch vụ đang hoạt động';
    } else if (healthStatus.databaseConnected || healthStatus.authServiceOnline) {
      healthStatus.status = 'degraded';
      healthStatus.message = 'Một số dịch vụ đang gặp sự cố';
    } else {
      healthStatus.status = 'offline';
      healthStatus.message = 'Không thể kết nối đến các dịch vụ';
    }
    
    return healthStatus;
  } catch (error) {
    healthStatus.status = 'offline';
    healthStatus.message = 'Đã xảy ra lỗi khi kiểm tra kết nối';
    console.error('Health check error:', error);
    return healthStatus;
  }
}

/**
 * Check for specific capabilities
 */
export async function checkServiceCapabilities(): Promise<ServiceCapabilities> {
  const capabilities: ServiceCapabilities = {
    fullTextSearch: false,
    realtime: false,
    storage: false,
    rpc: false,
    functions: false
  };
  
  try {
    // Check RPC capability
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc('test_rpc_function');
      capabilities.rpc = !rpcError;
    } catch {
      capabilities.rpc = false;
    }
    
    // Check storage capability
    try {
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      capabilities.storage = !storageError && Array.isArray(buckets);
    } catch {
      capabilities.storage = false;
    }
    
    // Check realtime capability
    try {
      const channel = supabase.channel('test');
      if (channel) {
        capabilities.realtime = true;
      }
    } catch {
      capabilities.realtime = false;
    }
    
    // Check full-text search capability
    try {
      const { data: searchResult, error: searchError } = await supabase
        .from('hymns_new')
        .select('id')
        .textSearch('title', 'test', { type: 'websearch' })
        .limit(1);
        
      capabilities.fullTextSearch = !searchError;
    } catch {
      capabilities.fullTextSearch = false;
    }
    
    // Check Edge Functions capability
    try {
      const { data: fnResult, error: fnError } = await supabase.functions.invoke('health-check');
      capabilities.functions = !fnError;
    } catch {
      capabilities.functions = false;
    }
    
    return capabilities;
  } catch (error) {
    console.error('Error checking service capabilities:', error);
    return capabilities;
  }
}
