-- Tạo bảng roles nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS public.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Thêm role_id vào bảng users_profile nếu chưa có
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users_profile' AND column_name = 'role_id'
    ) THEN
        ALTER TABLE public.users_profile ADD COLUMN role_id INT REFERENCES public.roles(id);
    END IF;
END $$;

-- Thêm một số vai trò mặc định
INSERT INTO public.roles (name, permissions) 
VALUES 
('Admin', '{
    "content": {
        "hymns": {"view": true, "create": true, "edit": true, "delete": true},
        "authors": {"view": true, "create": true, "edit": true, "delete": true},
        "themes": {"view": true, "create": true, "edit": true, "delete": true},
        "categories": {"view": true, "create": true, "edit": true, "delete": true},
        "pdfs": {"view": true, "upload": true, "delete": true}
    },
    "users": {
        "view": true, "edit": true, "ban": true, "delete": true, "assignRoles": true
    },
    "community": {
        "viewPosts": true, "createPosts": true, "editAnyPost": true, "deleteAnyPost": true, "moderateComments": true
    },
    "system": {
        "viewSettings": true, "editSettings": true, "viewLogs": true, "manageRoles": true
    }
}')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.roles (name, permissions) 
VALUES 
('Editor', '{
    "content": {
        "hymns": {"view": true, "create": true, "edit": true, "delete": false},
        "authors": {"view": true, "create": true, "edit": true, "delete": false},
        "themes": {"view": true, "create": true, "edit": true, "delete": false},
        "categories": {"view": true, "create": true, "edit": true, "delete": false},
        "pdfs": {"view": true, "upload": true, "delete": false}
    },
    "users": {
        "view": true, "edit": false, "ban": false, "delete": false, "assignRoles": false
    },
    "community": {
        "viewPosts": true, "createPosts": true, "editAnyPost": true, "deleteAnyPost": false, "moderateComments": true
    },
    "system": {
        "viewSettings": true, "editSettings": false, "viewLogs": true, "manageRoles": false
    }
}')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.roles (name, permissions) 
VALUES 
('User', '{
    "content": {
        "hymns": {"view": true, "create": false, "edit": false, "delete": false},
        "authors": {"view": true, "create": false, "edit": false, "delete": false},
        "themes": {"view": true, "create": false, "edit": false, "delete": false},
        "categories": {"view": true, "create": false, "edit": false, "delete": false},
        "pdfs": {"view": true, "upload": false, "delete": false}
    },
    "users": {
        "view": false, "edit": false, "ban": false, "delete": false, "assignRoles": false
    },
    "community": {
        "viewPosts": true, "createPosts": true, "editAnyPost": false, "deleteAnyPost": false, "moderateComments": false
    },
    "system": {
        "viewSettings": false, "editSettings": false, "viewLogs": false, "manageRoles": false
    }
}')
ON CONFLICT (name) DO NOTHING;

-- Tạo function để kiểm tra quyền của vai trò
CREATE OR REPLACE FUNCTION public.check_role_permission(
    p_user_id UUID,
    p_permission TEXT,
    p_resource TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_permissions JSONB;
    v_path TEXT[];
    v_current JSONB;
    v_i INTEGER;
BEGIN
    -- Lấy permissions của user từ role
    SELECT r.permissions INTO v_permissions
    FROM public.users_profile up
    JOIN public.roles r ON r.id = up.role_id
    WHERE up.id = p_user_id;
    
    -- Nếu không tìm thấy role, hoặc permissions là null, trả về false
    IF v_permissions IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Xây dựng path cho permission
    IF p_resource IS NULL THEN
        v_path := string_to_array(p_permission, '.');
    ELSE
        v_path := string_to_array(p_resource || '.' || p_permission, '.');
    END IF;
    
    -- Duyệt qua path để kiểm tra permission
    v_current := v_permissions;
    FOR v_i IN 1..array_length(v_path, 1) LOOP
        -- Nếu key không tồn tại hoặc là null, trả về false
        IF v_current->>v_path[v_i] IS NULL THEN
            RETURN FALSE;
        END IF;
        
        -- Nếu đây là phần tử cuối cùng, kiểm tra giá trị boolean
        IF v_i = array_length(v_path, 1) THEN
            RETURN (v_current->>v_path[v_i])::BOOLEAN;
        END IF;
        
        -- Đi tiếp vào level con
        v_current := v_current->v_path[v_i];
    END LOOP;
    
    RETURN FALSE;
END;
$$;

-- Tạo function để lấy vai trò của user
CREATE OR REPLACE FUNCTION public.get_user_role(
    p_user_id UUID
) RETURNS TABLE (
    role_id INTEGER,
    role_name TEXT,
    permissions JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.name, r.permissions
    FROM public.users_profile up
    JOIN public.roles r ON r.id = up.role_id
    WHERE up.id = p_user_id;
END;
$$;
