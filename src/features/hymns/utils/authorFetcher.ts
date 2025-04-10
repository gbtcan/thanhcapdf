import { supabase } from '../../../lib/supabase';

/**
 * Cache để lưu trữ thông tin tác giả đã truy vấn
 */
const authorCache = new Map();

/**
 * Queue để quản lý các yêu cầu tác giả đang chờ xử lý
 */
const pendingHymnAuthors = new Set<string>(); // Explicitly type the Set as Set<string>

/**
 * Trạng thái của quá trình tải
 */
let isFetchingAuthors = false;

/**
 * Thời gian trễ giữa các lô yêu cầu (ms)
 */
const BATCH_DELAY = 200;

/**
 * Kích thước lô tối đa
 */
const MAX_BATCH_SIZE = 15;

/**
 * Lấy thông tin tác giả cho nhiều bài hát với sự tối ưu hóa
 * - Sử dụng cache để tránh tải lại dữ liệu đã có
 * - Nhóm nhiều yêu cầu thành một lô duy nhất
 * - Giới hạn số lượng yêu cầu đồng thời
 * 
 * @param hymnIds Danh sách ID của các bài hát cần lấy thông tin tác giả
 * @returns Promise<Record<string, string[]>> - Map các ID bài hát đến danh sách ID tác giả
 */
export async function fetchHymnAuthors(hymnIds: string[]): Promise<Record<string, string[]>> {
  // Đảm bảo hymnIds là một mảng hợp lệ
  if (!hymnIds || !Array.isArray(hymnIds) || hymnIds.length === 0) {
    return {};
  }

  // Lọc ra chỉ những ID cần tải (không có trong cache)
  const idsToFetch = hymnIds.filter(id => !authorCache.has(id));
  
  // Thêm ID vào danh sách chờ
  idsToFetch.forEach(id => pendingHymnAuthors.add(id));
  
  // Bắt đầu quá trình tải nếu chưa đang thực hiện
  if (!isFetchingAuthors) {
    processPendingAuthorRequests();
  }

  // Đợi dữ liệu cho tất cả ID được yêu cầu
  await waitForAuthorsData(hymnIds);
  
  // Trả về kết quả từ cache cho các ID được yêu cầu
  const result: Record<string, string[]> = {};
  hymnIds.forEach(id => {
    result[id] = authorCache.get(id) || [];
  });
  
  return result;
}

/**
 * Xử lý hàng đợi các yêu cầu tác giả đang chờ
 */
async function processPendingAuthorRequests() {
  if (pendingHymnAuthors.size === 0 || isFetchingAuthors) return;
  
  isFetchingAuthors = true;
  
  try {
    // Lấy một lô các ID từ danh sách chờ
    const batchIds = Array.from(pendingHymnAuthors).slice(0, MAX_BATCH_SIZE); // Now batchIds is string[]
    if (batchIds.length > 0) {
      // Xóa các ID này khỏi danh sách chờ
      batchIds.forEach(id => pendingHymnAuthors.delete(id));
      
      // Tải dữ liệu cho lô này
      console.log(`Đang tải thông tin tác giả cho ${batchIds.length} bài hát`);
      
      // Truy vấn Supabase sử dụng `in` thay vì nhiều truy vấn riêng lẻ
      const { data, error } = await supabase
        .from('hymn_authors')
        .select('hymn_id, author_id')
        .in('hymn_id', batchIds);
      
      if (error) {
        console.error('Lỗi khi tải thông tin tác giả:', error);
      } else if (data) {
        // Nhóm kết quả theo hymn_id
        const groupedByHymn: Record<string, string[]> = {};
        data.forEach((item: { hymn_id: string; author_id: string }) => {
          if (!groupedByHymn[item.hymn_id]) {
            groupedByHymn[item.hymn_id] = [];
          }
          groupedByHymn[item.hymn_id].push(item.author_id);
        });
        
        // Lưu vào cache cho mỗi ID bài hát đã yêu cầu
        batchIds.forEach((id) => { // Type is now correctly inferred as string
          authorCache.set(id, groupedByHymn[id] || []);
        });
      }
      
      // Đợi một thời gian trước khi xử lý lô tiếp theo
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
    }
  } catch (error) {
    console.error('Lỗi khi xử lý hàng đợi tác giả:', error);
  } finally {
    isFetchingAuthors = false;
    
    // Tiếp tục xử lý nếu vẫn còn yêu cầu đang chờ
    if (pendingHymnAuthors.size > 0) {
      processPendingAuthorRequests();
    }
  }
}

/**
 * Đợi cho đến khi thông tin tác giả được tải cho tất cả ID bài hát
 */
async function waitForAuthorsData(hymnIds: string[]): Promise<void> {
  const MAX_ATTEMPTS = 10;
  const ATTEMPT_DELAY = 300;
  
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Kiểm tra xem tất cả ID đã có trong cache chưa
    const allCached = hymnIds.every(id => authorCache.has(id));
    
    if (allCached) {
      return; // Tất cả dữ liệu đã sẵn sàng
    }
    
    // Đợi một chút trước khi kiểm tra lại
    await new Promise(resolve => setTimeout(resolve, ATTEMPT_DELAY));
  }
  
  // Nếu đã hết số lần thử, đánh dấu các ID còn thiếu là mảng rỗng
  hymnIds.forEach(id => {
    if (!authorCache.has(id)) {
      authorCache.set(id, []);
    }
  });
}

/**
 * Xóa cache tác giả
 */
export function clearAuthorCache() {
  authorCache.clear();
}