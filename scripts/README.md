# Thư mục Scripts - Thánh Ca PDF

Thư mục này chứa các công cụ hỗ trợ cho dự án Thánh Ca PDF, phục vụ cho việc phát triển, triển khai và quản lý dữ liệu của ứng dụng.

## JavaScript Files

| File | Mô tả | Cách sử dụng |
|------|-------|-------------|
| `dev-server.js` | Tạo server phát triển tùy chỉnh để khắc phục vấn đề MIME type | `npm run dev:fix` |
| `check-env.js` | Kiểm tra các biến môi trường đã được thiết lập đúng chưa | `npm run check-env` |
| `download-pdf-worker.js` | Tải worker file của PDF.js để hiển thị file PDF | Tự động chạy trước khi build dự án |
| `setup-db.js` | Áp dụng các migration database từ thư mục migrations | `npm run setup-db` |
| `upload.cjs` | Wrapper cho chức năng upload hàng loạt bằng TypeScript | `npm run upload` |

## Python Scripts

| File | Mô tả |
|------|-------|
| `_app_.py`, `scrip.py`, `pdf_uploader.py`, `import_pdfs.py` | Các script xử lý và upload file PDF lên Supabase storage |
| `retry_error.py`, `fix_error_files.py` | Công cụ để sửa lỗi và thử lại các file upload thất bại |
| `success_count.py` | Đếm số lượng file đã upload thành công |

## Tệp Cấu Hình và Dữ Liệu

| File | Mô tả |
|------|-------|
| `.env` | Chứa biến môi trường kết nối Supabase |
| `requirements.txt` | Liệt kê các thư viện Python cần thiết |
| `error_detection.json`, `upload_progress.json` | Lưu trạng thái và lỗi trong quá trình upload |
| `detailed_upload.log` | Log chi tiết quá trình upload |

## Thư mục PDF

Thư mục `pdf_files` chứa các file PDF bài hát thánh ca cần được upload lên Supabase storage.

## Hướng dẫn sử dụng

### Cài đặt môi trường:
```bash
npm install
pip install -r requirements.txt
```

### Kiểm tra biến môi trường:
```bash
npm run check-env
```

### Phát triển ứng dụng:
```bash
npm run dev
# hoặc nếu có vấn đề MIME type
npm run dev:fix
```

### Upload file PDF:
```bash
python scrip.py
# hoặc
npm run upload
```

### Thiết lập database:
```bash
npm run setup-db
```

> **Lưu ý:** Đảm bảo đã cấu hình Supabase đúng trong file `.env` trước khi sử dụng các script liên quan đến upload và database.

# Utility Scripts

This directory contains utility scripts to help with development and deployment:

## Database Scripts

- `setup-db.cjs` - Sets up the database by applying all migration files in order
- `check-env.cjs` - Checks if environment variables are correctly set up

## PDF.js Scripts

- `download-pdfjslib.cjs` - Downloads the PDF.js worker files for offline use (CommonJS version)
- `ensure-pdf-worker.js` - ES Module version for postinstall to download PDF.js worker

## Script Types

Note that we have both `.js` (ES Modules) and `.cjs` (CommonJS) script files:
- `.js` files use ES Module syntax (import/export)
- `.cjs` files use CommonJS syntax (require/module.exports)

This is because our project is set to `"type": "module"` in package.json.

## How to Run Scripts

```bash
# CommonJS scripts
npm run setup-db
npm run check-env

# ESM scripts
node scripts/ensure-pdf-worker.js
```

# Script Compatibility Note

This project uses both ES Module (ESM) and CommonJS (CJS) scripts:

## Running Scripts

### ESM Scripts (`.js`)
These files use modern ES Module syntax (`import`/`export`) and must be run with:
```bash
node scriptname.js
```

### CommonJS Scripts (`.cjs`)
These files use traditional CommonJS syntax (`require`/`module.exports`) and can be run with:
```bash
node scriptname.cjs
```

### Compatibility Scripts
For convenience, some scripts have both `.js` (ESM) and `.cjs` (CommonJS) versions:
- `check-env.js` (ESM version)
- `check-env.cjs` (CommonJS wrapper)

You can use either npm scripts or the batch files:
```bash
# Using npm scripts
npm run check-env      # Uses ESM version
npm run check-env:cjs  # Uses CommonJS wrapper

# Using batch files
scripts\check-env.bat  # Uses ESM version with proper flags
```