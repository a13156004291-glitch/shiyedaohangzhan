-- 网址分类表
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
);

-- 网址书签表
CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 全局配置表
CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- 初始默认配置
INSERT OR IGNORE INTO config (key, value) VALUES ('background_url', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop');
INSERT OR IGNORE INTO config (key, value) VALUES ('background_opacity', '0.4');
INSERT OR IGNORE INTO config (key, value) VALUES ('card_opacity', '0.6');
INSERT OR IGNORE INTO config (key, value) VALUES ('admin_username', 'admin');
INSERT OR IGNORE INTO config (key, value) VALUES ('admin_password', 'admin123');
INSERT OR IGNORE INTO config (key, value) VALUES ('site_name', '十夜导航系统');

-- 添加一个默认分类（防止首页空白）
INSERT OR IGNORE INTO categories (id, name, order_index) VALUES (1, '我的导航', 1);

-- 添加几个默认示例链接
INSERT OR IGNORE INTO links (id, category_id, title, url, icon, order_index) VALUES (1, 1, 'Google', 'https://www.google.com', 'https://www.google.com/favicon.ico', 1);
INSERT OR IGNORE INTO links (id, category_id, title, url, icon, order_index) VALUES (2, 1, 'GitHub', 'https://github.com', 'https://github.com/favicon.ico', 2);
