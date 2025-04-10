/**
 * Thực thi một hàm với số lần thử lại cụ thể nếu nó thất bại
 * 
 * @param fn Hàm cần thực thi (trả về Promise)
 * @param retries Số lần thử lại tối đa
 * @param delay Độ trễ giữa các lần thử lại (ms)
 * @param backoffRate Tỉ lệ tăng thời gian giữa các lần thử lại
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoffRate = 1.5
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return withRetry(fn, retries - 1, delay * backoffRate, backoffRate);
  }
}

/**
 * Thực thi một hàm với timeout
 * 
 * @param fn Hàm cần thực thi (trả về Promise)
 * @param timeoutMs Thời gian timeout (ms)
 */
export function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs = 5000
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
}

/**
 * Xử lý lỗi từ API và trả về dữ liệu hoặc lỗi đã được định dạng
 * 
 * @param promise Promise API call
 */
export async function handleApiCall<T, E = Error>(
  promise: Promise<T>
): Promise<[T | null, E | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error as E];
  }
}
