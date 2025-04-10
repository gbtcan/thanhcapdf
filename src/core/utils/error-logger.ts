/**
 * Utility để xử lý và lọc lỗi console
 */

// Danh sách các lỗi nên bỏ qua (không hiển thị trong console)
const ERROR_PATTERNS_TO_IGNORE = [
  'Could not establish connection. Receiving end does not exist',
  'Extension context invalidated',
  'The message port closed before a response was received',
  'GET https://fwoxlggleieoztmcvsju.supabase.co/rest/v1/_dummy_query', // Lỗi dummy query không quan trọng
  '404 (Not Found)', // Bỏ qua lỗi 404 từ dummy query
  'PGRST201', // Bỏ qua lỗi quan hệ trong thời gian sửa
  'PGRST200', // Bỏ qua lỗi quan hệ không tìm thấy
  'PGRST', // Bỏ qua tất cả lỗi từ PostgREST trong thời gian sửa
  'Could not embed because more than one relationship was found', // Lỗi quan hệ nhiều-nhiều
  'Could not find a relationship between', // Lỗi quan hệ không tìm thấy
  'Error fetching hymns', // Tạm thời ẩn trong quá trình debug
  'Error fetching themes',
  'Error fetching authors'
];

/**
 * Ghi đè console.error để lọc các lỗi không mong muốn
 */
export function setupConsoleErrorFilter(): void {
  // Sao lưu hàm console.error gốc
  const originalConsoleError = console.error;

  // Ghi đè console.error với phiên bản đã lọc
  console.error = function(...args: any[]) {
    // Kiểm tra nếu thông báo lỗi chứa bất kỳ mẫu nào cần bỏ qua
    const errorMessage = args.join(' ');
    const shouldIgnore = ERROR_PATTERNS_TO_IGNORE.some(pattern => 
      errorMessage.includes(pattern)
    );

    // Nếu không phải là lỗi cần bỏ qua, ghi log bình thường
    if (!shouldIgnore) {
      originalConsoleError.apply(console, args);
    }
  };
}
