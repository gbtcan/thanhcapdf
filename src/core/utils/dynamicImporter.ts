/**
 * Hàm hỗ trợ dynamic import cho thư viện nặng
 * @param importFn Function thực hiện import động
 * @returns Promise với kết quả của import
 */
export async function loadDynamically<T>(importFn: () => Promise<T>): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    console.error('Lỗi khi dynamic import:', error);
    throw error;
  }
}

// Các utility functions cho việc dynamic import các thư viện phổ biến

/**
 * Tải thư viện PDF (pdf-lib) chỉ khi cần
 */
export async function loadPDFLib() {
  return loadDynamically(() => import('pdf-lib'));
}

/**
 * Tải thư viện đồ thị/charts chỉ khi cần
 */
export async function loadChartLibrary() {
  const module = await loadDynamically(() => import('chart.js'));
  return {
    Chart: module.Chart,
    registerables: module.registerables
  };
}

/**
 * Tải thư viện Editor chỉ khi cần
 */
export async function loadEditor() {
  const [tiptap, starterKit, placeholder, link] = await Promise.all([
    loadDynamically(() => import('@tiptap/react')),
    loadDynamically(() => import('@tiptap/starter-kit')),
    loadDynamically(() => import('@tiptap/extension-placeholder')),
    loadDynamically(() => import('@tiptap/extension-link'))
  ]);
  
  return {
    EditorContent: tiptap.EditorContent,
    useEditor: tiptap.useEditor,
    StarterKit: starterKit.default,
    Placeholder: placeholder.default,
    Link: link.default
  };
}
