import { supabase } from './supabase';

/**
 * Increment view count for a document
 * Chỉ sử dụng các cách tiếp cận an toàn cho người dùng ẩn danh
 */
export async function incrementViewCount(docId: string): Promise<void> {
  try {
    // Skip if docId is missing or invalid
    if (!docId || docId === 'undefined') {
      console.warn('Invalid docId provided to incrementViewCount:', docId);
      return;
    }
    
    // Phương thức 1: Dùng RPC public_increment_hymn_view (SECURITY DEFINER) 
    try {
      const { error } = await supabase
        .rpc('public_increment_hymn_view', { 
          hymn_id: docId
        });
        
      if (!error) {
        console.log('View counted successfully with public_increment_hymn_view');
        return; // Thành công, thoát khỏi hàm
      } else {
        console.warn('public_increment_hymn_view failed:', error.message);
      }
    } catch (e) {
      console.warn('public_increment_hymn_view failed:', e);
    }
    
    // Phương thức 2: Thử cập nhật trực tiếp bảng hymns_new
    try {
      // Thử truy vấn trực tiếp mà không cần quyền xác thực cao
      const { data, error: selectError } = await supabase
        .from('hymns_new')
        .select('id, view_count')
        .eq('id', docId)
        .single();
      
      // Nếu có thể truy cập dữ liệu, thử cập nhật
      if (!selectError && data) {
        const currentCount = data.view_count || 0;
        const { error } = await supabase
          .from('hymns_new')
          .update({ 
            view_count: currentCount + 1,
            last_viewed_at: new Date().toISOString()
          })
          .eq('id', docId);
        
        if (!error) {
          console.log('View counted successfully with direct update');
          return;
        } else {
          console.warn('Direct update failed:', error.message);
        }
      }
    } catch (e) {
      console.warn('Direct data access failed:', e);
    }
    
    // Phương thức 3: Sử dụng cách thức đơn giản nhất - chỉ ghi log nếu các cách trên thất bại
    // Tránh hiển thị lỗi cho người dùng vì đây không phải chức năng quan trọng
    console.log('Logged view for hymn ID:', docId, '(no database update)');
    
  } catch (error) {
    console.warn('Error incrementing view count:', error);
    // Không ném lỗi - tính năng đếm lượt xem không quan trọng
  }
}