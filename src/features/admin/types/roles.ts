export interface Role {
  id: number;
  name: string;
  permissions: RolePermissions;
  updated_at: string;
}

export interface RolePermissions {
  // Quản lý nội dung
  content: {
    hymns: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    authors: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    themes: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    categories: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    pdfs: {
      view: boolean;
      upload: boolean;
      delete: boolean;
    };
  };
  
  // Quản lý người dùng
  users: {
    view: boolean;
    edit: boolean;
    ban: boolean;
    delete: boolean;
    assignRoles: boolean;
  };
  
  // Quản lý cộng đồng
  community: {
    viewPosts: boolean;
    createPosts: boolean;
    editAnyPost: boolean;
    deleteAnyPost: boolean;
    moderateComments: boolean;
  };
  
  // Quản lý hệ thống
  system: {
    viewSettings: boolean;
    editSettings: boolean;
    viewLogs: boolean;
    manageRoles: boolean;
  };
}

export interface RoleFormData {
  name: string;
  permissions: RolePermissions;
}

export interface RoleFilterParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export const DEFAULT_PERMISSIONS: RolePermissions = {
  content: {
    hymns: { view: true, create: false, edit: false, delete: false },
    authors: { view: true, create: false, edit: false, delete: false },
    themes: { view: true, create: false, edit: false, delete: false },
    categories: { view: true, create: false, edit: false, delete: false },
    pdfs: { view: true, upload: false, delete: false }
  },
  users: {
    view: false,
    edit: false,
    ban: false,
    delete: false,
    assignRoles: false
  },
  community: {
    viewPosts: true,
    createPosts: true,
    editAnyPost: false,
    deleteAnyPost: false,
    moderateComments: false
  },
  system: {
    viewSettings: false,
    editSettings: false,
    viewLogs: false,
    manageRoles: false
  }
};

export const PERMISSION_GROUPS = [
  {
    id: 'content',
    label: 'Quản lý nội dung',
    subgroups: [
      {
        id: 'hymns',
        label: 'Thánh ca',
        permissions: ['view', 'create', 'edit', 'delete']
      },
      {
        id: 'authors',
        label: 'Tác giả',
        permissions: ['view', 'create', 'edit', 'delete']
      },
      {
        id: 'themes',
        label: 'Chủ đề',
        permissions: ['view', 'create', 'edit', 'delete']
      },
      {
        id: 'categories',
        label: 'Danh mục',
        permissions: ['view', 'create', 'edit', 'delete']
      },
      {
        id: 'pdfs',
        label: 'Tài liệu PDF',
        permissions: ['view', 'upload', 'delete']
      }
    ]
  },
  {
    id: 'users',
    label: 'Quản lý người dùng',
    permissions: ['view', 'edit', 'ban', 'delete', 'assignRoles']
  },
  {
    id: 'community',
    label: 'Quản lý cộng đồng',
    permissions: ['viewPosts', 'createPosts', 'editAnyPost', 'deleteAnyPost', 'moderateComments']
  },
  {
    id: 'system',
    label: 'Quản lý hệ thống',
    permissions: ['viewSettings', 'editSettings', 'viewLogs', 'manageRoles']
  }
];

export const PERMISSION_LABELS: Record<string, string> = {
  view: 'Xem',
  create: 'Tạo mới',
  edit: 'Chỉnh sửa',
  delete: 'Xóa',
  upload: 'Tải lên',
  ban: 'Khóa tài khoản',
  assignRoles: 'Gán vai trò',
  viewPosts: 'Xem bài viết',
  createPosts: 'Tạo bài viết',
  editAnyPost: 'Sửa mọi bài viết',
  deleteAnyPost: 'Xóa mọi bài viết',
  moderateComments: 'Kiểm duyệt bình luận',
  viewSettings: 'Xem cài đặt',
  editSettings: 'Sửa cài đặt',
  viewLogs: 'Xem nhật ký',
  manageRoles: 'Quản lý vai trò'
};
