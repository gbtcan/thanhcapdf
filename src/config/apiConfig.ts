/**
 * Cấu hình API cho toàn bộ ứng dụng
 */

export const apiConfig = {
  /**
   * Sử dụng mock API thay vì gọi API thật
   * - true: Sử dụng mock data (phát triển offline)
   * - false: Gọi API thật từ Supabase
   */
  useMockApi: import.meta.env.DEV && (import.meta.env.VITE_USE_MOCK_API === 'true'),
  
  /**
   * Thêm độ trễ ngẫu nhiên cho mock API để mô phỏng mạng
   */
  mockDelay: {
    enabled: true,
    minMs: 200,  // Độ trễ tối thiểu (ms)
    maxMs: 600   // Độ trễ tối đa (ms)
  },
  
  /**
   * Tự động tạo lỗi ngẫu nhiên để test error handling
   */
  mockErrors: {
    enabled: false,
    probability: 0.1  // Xác suất xảy ra lỗi (10%)
  },
  
  /**
   * Endpoint API
   */
  endpoints: {
    hymns: '/hymns',
    authors: '/authors',
    themes: '/themes',
    tags: '/tags'
  },
  
  /**
   * Cache API responses
   */
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000  // 5 minutes
  },
  
  /**
   * Số lượng kết quả mặc định cho mỗi trang
   */
  defaultPageSize: 10,
};

/**
 * Helper functions cho mock API
 */
export const mockUtils = {
  /**
   * Tạo độ trễ ngẫu nhiên cho mock API
   */
  delay: async (): Promise<void> => {
    if (!apiConfig.mockDelay.enabled) return;
    
    const { minMs, maxMs } = apiConfig.mockDelay;
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    
    return new Promise(resolve => setTimeout(resolve, delay));
  },
  
  /**
   * Tạo lỗi ngẫu nhiên để test error handling
   */
  shouldError: (): boolean => {
    if (!apiConfig.mockErrors.enabled) return false;
    
    return Math.random() < apiConfig.mockErrors.probability;
  },
  
  /**
   * Tạo lỗi API ngẫu nhiên
   */
  createRandomError: (): Error => {
    const errors = [
      new Error('Network error: Connection refused'),
      new Error('Service unavailable. Please try again later.'),
      new Error('Request timeout. Server took too long to respond.'),
      new Error('Internal server error. Our team has been notified.')
    ];
    
    const index = Math.floor(Math.random() * errors.length);
    return errors[index];
  }
};
