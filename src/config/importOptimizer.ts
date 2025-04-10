/**
 * Hướng dẫn tối ưu bundle size
 * 
 * Các best practices cho việc import:
 * 
 * 1. Import riêng lẻ thay vì import cả thư viện
 *    ✅ import { Button } from 'ui-library'
 *    ❌ import UILibrary from 'ui-library'
 * 
 * 2. Import động cho các thành phần lớn chỉ được sử dụng ở một số nơi
 *    ✅ const PDFViewer = React.lazy(() => import('./PDFViewer'))
 * 
 * 3. Import cụ thể các icons thay vì toàn bộ thư viện
 *    ✅ import { Heart, Share } from 'lucide-react'
 *    ❌ import * as Icons from 'lucide-react'
 * 
 * 4. Tránh re-export toàn bộ thư viện
 *    ✅ export { Button, Card, Input } from 'ui-library'
 *    ❌ export * from 'ui-library'
 * 
 * 5. Sử dụng tree-shakeable packages
 *    ✅ import { pick } from 'lodash-es'
 *    ❌ import { pick } from 'lodash'
 */

// Các alias exports có thể được sử dụng để đảm bảo imports được tối ưu
export const PREFERRED_IMPORTS = {
  // Icons
  icons: {
    import: 'import { IconName } from "lucide-react"',
    avoid: 'import * as Icons from "lucide-react"',
  },
  
  // Lodash
  lodash: {
    import: 'import { functionName } from "lodash-es"',
    avoid: 'import _ from "lodash"',
  },
  
  // Component libraries
  ui: {
    import: 'import { Component } from "../core/components/ui/component"',
    avoid: 'import * from "../core/components/ui"',
  }
};
