import { supabaseClient } from './client';

/**
 * Kiểm tra kết nối đến Supabase và xác thực cơ sở dữ liệu
 */
export async function validateSupabaseConnection() {
  try {
    // Thử một truy vấn đơn giản
    const { data, error } = await supabaseClient
      .from('hymns_new')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection test succeeded');
    
    // Kiểm tra cấu trúc bảng và mối quan hệ bằng các truy vấn riêng biệt
    try {
      // Sử dụng tên ràng buộc cụ thể cho hymn_authors
      const authorTest = await supabaseClient
        .from('authors')
        .select('*, hymns:hymn_authors!hymn_authors_author_id_fkey(hymn_id)')
        .limit(1);
      
      if (authorTest.error) console.warn('Author relationship test failed:', authorTest.error);
      else console.log('Author relationship test passed');
    } catch (e) {
      console.warn('Author relationship test threw exception:', e);
    }
    
    try {
      // Sử dụng tên ràng buộc cụ thể cho hymn_themes
      const themeTest = await supabaseClient
        .from('themes')
        .select('*, hymns:hymn_themes!hymn_themes_theme_id_fkey(hymn_id)')
        .limit(1);
      
      if (themeTest.error) console.warn('Theme relationship test failed:', themeTest.error);
      else console.log('Theme relationship test passed');
    } catch (e) {
      console.warn('Theme relationship test threw exception:', e);
    }
    
    return true;
  } catch (err) {
    console.error('Failed to validate Supabase connection:', err);
    return false;
  }
}
