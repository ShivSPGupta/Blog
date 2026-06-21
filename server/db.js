import mysql from 'mysql2/promise';
import { samplePosts } from './seed.js';

const {
  MYSQL_HOST,
  MYSQL_PORT = '3306',
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
} = process.env;

const pool = mysql.createPool({
  host: MYSQL_HOST,
  port: Number(MYSQL_PORT),
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  namedPlaceholders: true,
  waitForConnections: true,
  connectionLimit: 10,
});

function toSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizePost(row) {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    coverImage: row.cover_image,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
    readTime: Number(row.read_time),
    status: row.status,
    slug: row.slug,
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
  };
}

function mapPostInput(postData) {
  const now = new Date().toISOString();
  const title = String(postData.title || '').trim();
  const slug = postData.slug ? String(postData.slug).trim() : toSlug(title);

  return {
    id: postData.id || crypto.randomUUID(),
    title,
    excerpt: String(postData.excerpt || '').trim(),
    content: String(postData.content || '').trim(),
    category: String(postData.category || 'General').trim(),
    cover_image: String(postData.coverImage || postData.cover_image || '').trim(),
    read_time: Number.parseInt(postData.readTime ?? postData.read_time ?? 5, 10) || 5,
    status: postData.status === 'published' ? 'published' : 'draft',
    slug,
    created_at: postData.createdAt ? new Date(postData.createdAt) : new Date(now),
    updated_at: new Date(now),
    published_at:
      postData.status === 'published'
        ? (postData.publishedAt ? new Date(postData.publishedAt) : new Date(now))
        : null,
  };
}

export async function initializeDatabase() {
  await pool.query(`
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
    )
  `);

  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM posts');
  if (rows[0].count === 0) {
    const values = samplePosts.map((post) => mapPostInput(post));
    for (const value of values) {
      await pool.query(
        `
          INSERT INTO posts
            (id, title, excerpt, content, category, cover_image, read_time, status, slug, created_at, updated_at, published_at)
          VALUES
            (:id, :title, :excerpt, :content, :category, :cover_image, :read_time, :status, :slug, :created_at, :updated_at, :published_at)
        `,
        value
      );
    }
  }
}

export async function getAllPosts() {
  const [rows] = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
  return rows.map(normalizePost);
}

export async function getPostById(id) {
  const [rows] = await pool.query('SELECT * FROM posts WHERE id = :id LIMIT 1', { id });
  return rows.length > 0 ? normalizePost(rows[0]) : null;
}

export async function createPost(postData) {
  const value = mapPostInput(postData);
  await pool.query(
    `
      INSERT INTO posts
        (id, title, excerpt, content, category, cover_image, read_time, status, slug, created_at, updated_at, published_at)
      VALUES
        (:id, :title, :excerpt, :content, :category, :cover_image, :read_time, :status, :slug, :created_at, :updated_at, :published_at)
    `,
    value
  );

  return normalizePost(value);
}

export async function updatePost(id, postData) {
  const current = await getPostById(id);
  if (!current) {
    return null;
  }

  const merged = mapPostInput({
    ...current,
    ...postData,
    id,
    createdAt: current.createdAt,
    publishedAt:
      postData.status === 'published'
        ? current.publishedAt || new Date().toISOString()
        : null,
  });

  await pool.query(
    `
      UPDATE posts
      SET title = :title,
          excerpt = :excerpt,
          content = :content,
          category = :category,
          cover_image = :cover_image,
          read_time = :read_time,
          status = :status,
          slug = :slug,
          updated_at = :updated_at,
          published_at = :published_at
      WHERE id = :id
    `,
    merged
  );

  return normalizePost(merged);
}

export async function deletePost(id) {
  const [result] = await pool.query('DELETE FROM posts WHERE id = :id', { id });
  return result.affectedRows > 0;
}
