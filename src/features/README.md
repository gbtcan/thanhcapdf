# Cấu trúc thư mục Features

Thư mục này chứa các tính năng chính của ứng dụng ThánhCaPDF, được tổ chức theo từng module nghiệp vụ.

## Cấu trúc

### Nghiệp vụ chính

- `hymns/` - Quản lý thánh ca
- `catalog/` - Quản lý danh mục (tác giả, chủ đề)

### Nghiệp vụ phụ

- `users/` - Quản lý người dùng, xác thực
- `community/` - Tính năng cộng đồng (bình luận, chia sẻ)
- `admin/` - Giao diện quản trị

## Cách tổ chức module

Mỗi module được tổ chức theo các thư mục sau:

- `api/` - API calls và data services
- `components/` - React components 
- `hooks/` - Custom hooks
- `pages/` - Các trang hoàn chỉnh
- `types/` - Định nghĩa TypeScript
- `utils/` - Các hàm tiện ích riêng của module

## Cấu trúc được tinh gọn

src/
├── core/                          # Các thành phần cốt lõi
│   ├── components/                # Component dùng chung
│   │   └── ui/                    # UI components cơ bản
│   ├── contexts/                  # Context providers
│   ├── hooks/                     # Global hooks
│   ├── guards/                    # Bảo vệ route
│   ├── types/                     # Định nghĩa kiểu dữ liệu chung
│   └── utils/                     # Các hàm tiện ích
├── features/                      # Các tính năng/module chức năng
│   ├── hymns/                     # Module Thánh Ca (nghiệp vụ chính)
│   │   ├── api/                   # Giao tiếp API 
│   │   ├── components/            # Components riêng của thánh ca
│   │   ├── hooks/                 # Hooks riêng của thánh ca
│   │   └── pages/                 # Trang thánh ca
│   ├── catalog/                   # Module danh mục (nghiệp vụ chính)
│   │   ├── api/                   # API cho tác giả, chủ đề
│   │   ├── components/            # Components của catalog
│   │   └── pages/                 # Trang danh mục
│   ├── users/                     # Quản lý người dùng (nghiệp vụ phụ)
│   │   ├── auth/                  # Xác thực
│   │   ├── profile/               # Hồ sơ người dùng
│   │   └── settings/              # Cài đặt người dùng
│   ├── community/                 # Cộng đồng (nghiệp vụ phụ)
│   │   ├── api/                   # API cộng đồng
│   │   ├── components/            # Components cộng đồng
│   │   └── pages/                 # Trang cộng đồng
│   └── admin/                     # Quản trị (đối tượng admin)
│       ├── content/               # Quản lý nội dung
│       └── users/                 # Quản lý người dùng
├── layouts/                       # Các layout
│   ├── admin/                     # Layout cho Admin
│   └── public/                    # Layout cho người dùng
├── lib/                           # Thư viện và tiện ích
│   ├── supabase/                  # Kết nối Supabase
│   └── utils/                     # Các utility functions
├── config/                        # Cấu hình ứng dụng
└── styles/                        # Styles toàn cục