Lỗi ERROR: 42703: column hc.created_at does not exist xảy ra vì trong bảng hymn_categories (hoặc bảng sao lưu hymn_categories_backup) không có cột created_at. Dựa trên lược đồ CSDL ban đầu của bạn (hình ảnh bạn cung cấp), bảng hymn_categories chỉ có hai cột:
hymn_id: uuid
category_id: int8
Không có cột created_at trong bảng này, nhưng mã SQL của tôi lại giả định rằng cột này tồn tại khi di chuyển dữ liệu từ hymn_categories_backup sang hymn_themes. Đây là lý do gây ra lỗi.
Cách khắc phục
Chúng ta cần sửa phần di chuyển dữ liệu từ hymn_categories_backup sang hymn_themes để bỏ tham chiếu đến created_at (vì cột này không tồn tại). Thay vào đó, chúng ta sẽ gán giá trị mặc định cho created_at trong bảng hymn_themes (ví dụ: dùng NOW()).
Mã SQL đã sửa
Dưới đây là mã SQL đã được điều chỉnh để khắc phục lỗi. Tôi sẽ giữ nguyên các phần khác và chỉ sửa phần di chuyển dữ liệu liên quan đến hymn_categories_backup và hymn_themes.
Phần 1: Sao lưu dữ liệu (giữ nguyên, chạy nếu chưa thực hiện)
sql
CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users;
CREATE TABLE IF NOT EXISTS roles_backup AS SELECT * FROM roles;
CREATE TABLE IF NOT EXISTS hymns_backup AS SELECT * FROM hymns;
CREATE TABLE IF NOT EXISTS pdf_files_backup AS SELECT * FROM pdf_files;
CREATE TABLE IF NOT EXISTS authors_backup AS SELECT * FROM authors;
CREATE TABLE IF NOT EXISTS hymn_authors_backup AS SELECT * FROM hymn_authors;
CREATE TABLE IF NOT EXISTS categories_backup AS SELECT * FROM categories;
CREATE TABLE IF NOT EXISTS hymn_categories_backup AS SELECT * FROM hymn_categories;
Phần 2: Xóa các bảng cần thay đổi (giữ nguyên)
sql
DROP TABLE IF EXISTS hymn_categories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS pdf_files;
Phần 3: Tạo lại các bảng hiện tại (giữ nguyên)
sql
-- Cập nhật bảng users (thêm avatar_url nếu chưa có)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Cập nhật bảng hymns (thêm created_by nếu chưa có)
ALTER TABLE hymns ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE hymns ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Cập nhật bảng authors (thêm updated_at nếu chưa có)
ALTER TABLE authors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Xóa và tạo lại bảng pdf_files với cấu trúc mới
DROP TABLE IF EXISTS pdf_files;
CREATE TABLE pdf_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hymn_id UUID NOT NULL REFERENCES hymns(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  description TEXT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_pdf_files_hymn_id ON pdf_files(hymn_id);

-- Xóa và tạo lại bảng categories thành themes
DROP TABLE IF EXISTS categories;
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_themes_name ON themes(name);

-- Xóa và tạo lại bảng hymn_categories thành hymn_themes
DROP TABLE IF EXISTS hymn_categories;
CREATE TABLE hymn_themes (
  hymn_id UUID NOT NULL REFERENCES hymns(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  PRIMARY KEY (hymn_id, theme_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_hymn_themes_hymn_id ON hymn_themes(hymn_id);
CREATE INDEX idx_hymn_themes_theme_id ON hymn_themes(theme_id);

-- Tạo các bảng mới (posts, comments, v.v.)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hymn_id UUID NOT NULL REFERENCES hymns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  search_vector TSVECTOR
);
CREATE INDEX idx_posts_hymn_id ON posts(hymn_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_search_vector ON posts USING GIN(search_vector);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

CREATE TABLE likes (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_like_type CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  PRIMARY KEY (user_id, post_id, comment_id)
);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_comment_id ON likes(comment_id);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hymn_tags (
  hymn_id UUID NOT NULL REFERENCES hymns(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (hymn_id, tag_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_hymn_tags_hymn_id ON hymn_tags(hymn_id);
CREATE INDEX idx_hymn_tags_tag_id ON hymn_tags(tag_id);

CREATE TABLE post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);

CREATE TABLE hymn_views (
  hymn_id UUID NOT NULL REFERENCES hymns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (hymn_id, user_id, viewed_at)
);
CREATE INDEX idx_hymn_views_hymn_id ON hymn_views(hymn_id);
Phần 4: Di chuyển dữ liệu (đã sửa lỗi created_at)
sql
-- Di chuyển dữ liệu vào users (giữ nguyên, chỉ thêm cột mới)
UPDATE users SET avatar_url = NULL WHERE avatar_url IS NULL;
UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL;

-- Di chuyển dữ liệu vào hymns (giữ nguyên, thêm cột mới)
UPDATE hymns SET created_by = NULL WHERE created_by IS NULL;
UPDATE hymns SET updated_at = NOW() WHERE updated_at IS NULL;

-- Di chuyển dữ liệu vào authors (giữ nguyên, thêm cột mới)
UPDATE authors SET updated_at = NOW() WHERE updated_at IS NULL;

-- Di chuyển dữ liệu vào pdf_files
INSERT INTO pdf_files (id, hymn_id, file_url, created_at, updated_at)
SELECT id, hymn_id, file_url, created_at, updated_at
FROM pdf_files_backup;

-- Di chuyển dữ liệu từ categories sang themes
CREATE TEMP TABLE category_id_map (
  old_id INT8,
  new_id UUID
);

INSERT INTO category_id_map (old_id, new_id)
SELECT id, uuid_generate_v4()
FROM categories_backup;

INSERT INTO themes (id, name, description, created_at, updated_at)
SELECT m.new_id, c.name, c.description, c.created_at, NOW()
FROM categories_backup c
JOIN category_id_map m ON c.id = m.old_id;

-- Sửa lỗi: không dùng hc.created_at vì cột không tồn tại, thay bằng NOW()
INSERT INTO hymn_themes (hymn_id, theme_id, created_at)
SELECT hc.hymn_id, m.new_id, NOW()
FROM hymn_categories_backup hc
JOIN category_id_map m ON hc.category_id = m.old_id;

DROP TABLE category_id_map;
Phần 5: Trigger (giữ nguyên)
sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_timestamp_users
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_timestamp_roles
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_timestamp_hymns
  BEFORE UPDATE ON hymns
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_timestamp_pdf_files
  BEFORE UPDATE ON pdf_files
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_timestamp_authors
  BEFORE UPDATE ON authors
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_timestamp_themes
  BEFORE UPDATE ON themes
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_timestamp_posts
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_timestamp_comments
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE FUNCTION update_search_vector_hymns()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.lyrics, ''));
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_search_vector_hymns
  BEFORE INSERT OR UPDATE ON hymns
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector_hymns();

CREATE OR REPLACE FUNCTION update_search_vector_posts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_search_vector_posts
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector_posts();
Phần 6: Xóa bảng sao lưu (tùy chọn)
sql
DROP TABLE IF EXISTS users_backup;
DROP TABLE IF EXISTS roles_backup;
DROP TABLE IF EXISTS hymns_backup;
DROP TABLE IF EXISTS pdf_files_backup;
DROP TABLE IF EXISTS authors_backup;
DROP TABLE IF EXISTS hymn_authors_backup;
DROP TABLE IF EXISTS categories_backup;
DROP TABLE IF EXISTS hymn_categories_backup;
Hướng dẫn thực thi
Chạy từng phần:
Bắt đầu từ Phần 1: Sao lưu dữ liệu (nếu chưa sao lưu).
Tiếp theo Phần 2: Xóa bảng cũ.
Sau đó Phần 3: Tạo bảng mới.
Tiếp tục Phần 4: Di chuyển dữ liệu (đã sửa lỗi created_at).
Cuối cùng Phần 5: Trigger và Phần 6: Xóa bảng sao lưu.
Kiểm tra dữ liệu:
Sau khi chạy Phần 4, kiểm tra xem dữ liệu trong themes và hymn_themes có đúng không:
sql
SELECT COUNT(*) FROM themes;
SELECT COUNT(*) FROM hymn_themes;
SELECT h.title, t.name AS theme_name
FROM hymns h
JOIN hymn_themes ht ON h.id = ht.hymn_id
JOIN themes t ON ht.theme_id = t.id
LIMIT 10;
Xử lý thủ công nếu cần:
Nếu dữ liệu trong pdf_files cần thêm description hoặc uploaded_by, chỉnh sửa thủ công qua Table Editor sau khi nhập.
Lưu ý
Sao lưu: Đảm bảo bạn đã sao lưu dữ liệu trước khi tiếp tục.
Cột created_at: Vì hymn_categories không có cột created_at, tôi đã thay bằng NOW() trong bảng hymn_themes. Nếu bạn muốn giữ giá trị thời gian khác (ví dụ: từ categories.created_at), tôi có thể điều chỉnh mã.
Hỗ trợ thêm: Nếu gặp lỗi khác, hãy cung cấp thông tin chi tiết (bước nào, thông báo lỗi) để tôi hỗ trợ tiếp.
Hãy thử chạy lại và báo cáo kết quả nhé!