import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';

// Lấy các biến môi trường từ import.meta.env (Vite)
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

// Kiểm tra biến môi trường
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Missing Supabase environment variables. PDF viewing and some features may not work.');
  console.error('Please check your .env or .env.local file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Options cho Supabase client
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 
      'x-application-name': 'ThanhCaPDF' 
    },
  },
};

// Tạo client chỉ khi có đủ thông tin xác thực
let supabase: any;
let supabaseClient: any;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, options);
  supabaseClient = supabase;
} else {
  // Tạo mock client để không gây lỗi trong quá trình phát triển
  supabase = {
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase not configured') })
    }),
    storage: {
      from: () => ({
        download: () => ({ data: null, error: new Error('Supabase not configured') }),
        getPublicUrl: () => ({ data: { publicUrl: '' }, error: null }),
        createSignedUrl: () => ({ data: null, error: new Error('Supabase not configured') })
      })
    },
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ unsubscribe: () => {} })
    }
  };
  supabaseClient = supabase;
}

// Export the existing singleton instance instead of creating a new one
export { supabase, supabaseClient };

// Export a function to properly check connection
export async function checkConnection(): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Cannot check connection - Supabase not properly configured');
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('hymns')
      .select('id')
      .limit(1);
      
    return !error;
  } catch (e) {
    console.error("Connection check failed:", e);
    return false;
  }
}

// Để tương thích với các file khác sử dụng supabase trực tiếp
export default supabaseClient;

// Health checking function
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('hymns')
      .select('id')
      .limit(1);
    
    return !error;
  } catch (err) {
    console.error('Error checking Supabase connection:', err);
    return false;
  }
};

// Function để lấy URL của storage bucket
export function getStorageUrl(bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
