import { getSupabaseClient, getSupabaseConfig } from './supabase-client';

const DATA_MODE = (import.meta.env.VITE_BLOG_DATA_MODE || 'local').trim().toLowerCase();
const POSTS_TABLE = 'posts';

function mapPostForDb(postData) {
  return {
    id: postData.id,
    author_id: postData.authorId,
    author_email: postData.authorEmail,
    author_display_name: postData.authorDisplayName,
    title: postData.title,
    excerpt: postData.excerpt,
    content: postData.content,
    category: postData.category,
    cover_image: postData.coverImage,
    read_time: postData.readTime,
    status: postData.status,
    slug: postData.slug,
    created_at: postData.createdAt,
    updated_at: postData.updatedAt,
    published_at: postData.publishedAt,
  };
}

function isConfigured() {
  return DATA_MODE === 'supabase' && getSupabaseConfig().enabled;
}

async function getClient() {
  if (!isConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client could not be created');
  }

  return client;
}

function ensureSuccess(result, action) {
  if (result.error) {
    throw new Error(result.error.message || `Supabase ${action} failed`);
  }

  return result.data;
}

export function getApiConfig() {
  const config = getSupabaseConfig();
  return {
    mode: DATA_MODE,
    provider: 'supabase',
    baseUrl: config.url || null,
    enabled: isConfigured(),
  };
}

function mapPostFromDb(postData) {
  return {
    id: postData.id,
    authorId: postData.author_id,
    authorEmail: postData.author_email,
    authorDisplayName: postData.author_display_name,
    title: postData.title,
    excerpt: postData.excerpt,
    content: postData.content,
    category: postData.category,
    coverImage: postData.cover_image,
    readTime: postData.read_time,
    status: postData.status,
    slug: postData.slug,
    createdAt: postData.created_at,
    updatedAt: postData.updated_at,
    publishedAt: postData.published_at,
  };
}

export async function fetchPosts() {
  const supabase = await getClient();
  const result = await supabase
    .from(POSTS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  return ensureSuccess(result, 'select').map(mapPostFromDb);
}

export async function createPost(postData) {
  const supabase = await getClient();
  const result = await supabase
    .from(POSTS_TABLE)
    .insert(mapPostForDb(postData))
    .select()
    .single();

  return mapPostFromDb(ensureSuccess(result, 'insert'));
}

export async function updatePost(postId, postData) {
  const supabase = await getClient();
  const result = await supabase
    .from(POSTS_TABLE)
    .update(mapPostForDb(postData))
    .eq('id', postId)
    .select()
    .single();

  return mapPostFromDb(ensureSuccess(result, 'update'));
}

export async function deletePost(postId) {
  const supabase = await getClient();
  const result = await supabase
    .from(POSTS_TABLE)
    .delete()
    .eq('id', postId);

  ensureSuccess(result, 'delete');
}
