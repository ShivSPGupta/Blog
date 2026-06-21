CREATE TABLE IF NOT EXISTS posts (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  cover_image TEXT NULL,
  read_time INT NOT NULL DEFAULT 5,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  published_at DATETIME NULL
);
