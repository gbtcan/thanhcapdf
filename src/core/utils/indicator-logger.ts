/**
 * Hiển thị biểu tượng trạng thái kết nối dữ liệu
 */
export class ConnectionStatusIndicator {
  static statusElem: HTMLElement | null = null;
  
  static initialize() {
    // Tạo element trạng thái
    const elem = document.createElement('div');
    elem.style.position = 'fixed';
    elem.style.bottom = '10px';
    elem.style.left = '10px';
    elem.style.zIndex = '9999';
    elem.style.padding = '6px';
    elem.style.borderRadius = '50%';
    elem.style.background = 'rgba(255, 255, 255, 0.2)';
    elem.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.2)';
    elem.style.cursor = 'pointer';
    elem.title = 'Trạng thái kết nối dữ liệu';
    
    // Tạo biểu tượng
    const icon = document.createElement('div');
    icon.style.width = '12px';
    icon.style.height = '12px';
    icon.style.borderRadius = '50%';
    icon.style.backgroundColor = '#777';
    elem.appendChild(icon);
    
    // Thêm vào DOM
    document.body.appendChild(elem);
    this.statusElem = icon;
    
    // Hiển thị chi tiết khi nhấp vào
    elem.addEventListener('click', () => this.showDetails());
  }
  
  static setOnline() {
    if (this.statusElem) {
      this.statusElem.style.backgroundColor = '#4CAF50';
      this.statusElem.title = 'Kết nối dữ liệu: Đang hoạt động';
    }
  }
  
  static setOffline() {
    if (this.statusElem) {
      this.statusElem.style.backgroundColor = '#F44336';
      this.statusElem.title = 'Kết nối dữ liệu: Mất kết nối';
    }
  }
  
  static setLoading() {
    if (this.statusElem) {
      this.statusElem.style.backgroundColor = '#FFC107';
      this.statusElem.title = 'Kết nối dữ liệu: Đang tải...';
    }
  }
  
  static showDetails() {
    console.info('Chi tiết kết nối dữ liệu', {
      online: navigator.onLine,
      lastError: window.__lastSupabaseError || 'Không có lỗi',
      lastSuccessfulRequest: window.__lastSuccessfulRequest || 'Chưa có'
    });
  }
}

// Nắm bắt sự kiện kết nối từ window
window.addEventListener('online', () => ConnectionStatusIndicator.setOnline());
window.addEventListener('offline', () => ConnectionStatusIndicator.setOffline());

// Đặt hook cho các request Supabase
if (typeof window !== 'undefined') {
  window.__lastSupabaseError = null;
  window.__lastSuccessfulRequest = null;
}

/**
 * Lắng nghe lỗi Supabase để cập nhật trạng thái kết nối
 */
export function trackSupabaseConnection() {
  const originalFetch = window.fetch;
  
  window.fetch = function(...args) {
    const url = args[0].toString();
    ConnectionStatusIndicator.setLoading();
    
    // Nếu là request đến Supabase
    if (url.includes('supabase.co')) {
      return originalFetch.apply(this, args)
        .then(response => {
          if (response.ok) {
            window.__lastSuccessfulRequest = new Date().toISOString();
            ConnectionStatusIndicator.setOnline();
          } else {
            window.__lastSupabaseError = `HTTP ${response.status}`;
            ConnectionStatusIndicator.setOffline();
          }
          return response;
        })
        .catch(error => {
          window.__lastSupabaseError = error.message;
          ConnectionStatusIndicator.setOffline();
          throw error;
        });
    }
    
    return originalFetch.apply(this, args);
  };
}

// Khởi tạo khi DOM sẵn sàng
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    ConnectionStatusIndicator.initialize();
    trackSupabaseConnection();
  });
}
