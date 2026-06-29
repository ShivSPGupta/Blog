import { samplePosts } from './sample-data';
import {
  getApiConfig,
  fetchPosts as fetchPostsFromApi,
  searchPosts as searchPostsFromApi,
  createPost as createPostOnApi,
  updatePost as updatePostOnApi,
  deletePost as deletePostOnApi,
} from './blog-api';

const STORAGE_KEY = 'blog-posts';
const apiConfig = getApiConfig();

function toSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizePost(postData, fallbackId = null) {
  const title = String(postData.title || '').trim();
  const now = new Date().toISOString();

  return {
    id: postData.id || fallbackId || crypto.randomUUID(),
    authorId: postData.authorId || postData.author_id || null,
    authorEmail: postData.authorEmail || postData.author_email || null,
    authorDisplayName: postData.authorDisplayName || postData.author_display_name || null,
    title,
    excerpt: String(postData.excerpt || '').trim(),
    content: String(postData.content || '').trim(),
    category: String(postData.category || 'General').trim(),
    coverImage: String(postData.coverImage || postData.cover_image || '').trim(),
    readTime: Number.parseInt(postData.readTime ?? postData.read_time ?? 5, 10) || 5,
    status: postData.status === 'published' ? 'published' : 'draft',
    slug: postData.slug || toSlug(title),
    createdAt: postData.createdAt || now,
    updatedAt: now,
    publishedAt: postData.status === 'published' ? (postData.publishedAt || now) : null,
  };
}

function persistLocalPosts(posts) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Error saving posts:', error);
  }
}

export function readLocalPosts() {
  if (typeof window === 'undefined') {
    return samplePosts;
  }

  try {
    const storedPosts = localStorage.getItem(STORAGE_KEY);
    if (!storedPosts) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(samplePosts));
      return samplePosts;
    }

    const parsedPosts = JSON.parse(storedPosts);
    return Array.isArray(parsedPosts) ? parsedPosts : samplePosts;
  } catch (error) {
    console.error('Error loading posts:', error);
    return samplePosts;
  }
}

function writeLocalPosts(posts) {
  persistLocalPosts(posts);
  return {
    posts,
    source: 'local',
  };
}

export function getPostsSource() {
  return apiConfig.enabled ? 'supabase' : 'local';
}

export function filterPostsByQuery(posts, searchQuery) {
  const query = String(searchQuery || '').trim().toLowerCase();

  if (!query) {
    return posts;
  }

  return posts.filter((post) =>
    post.title.toLowerCase().includes(query)
    || post.excerpt.toLowerCase().includes(query)
    || post.content.toLowerCase().includes(query)
    || post.category.toLowerCase().includes(query)
    || post.slug.toLowerCase().includes(query)
  );
}

export async function fetchPosts() {
  if (!apiConfig.enabled) {
    return {
      posts: readLocalPosts(),
      source: 'local',
    };
  }

  try {
    const posts = await fetchPostsFromApi();
    persistLocalPosts(posts);

    return {
      posts,
      source: 'supabase',
    };
  } catch (error) {
    console.error('Error loading posts from Supabase:', error);
    throw error;
  }
}

export async function searchPosts(searchQuery) {
  const trimmedQuery = String(searchQuery || '').trim();

  if (!trimmedQuery) {
    return fetchPosts();
  }

  if (!apiConfig.enabled) {
    return {
      posts: filterPostsByQuery(readLocalPosts(), trimmedQuery),
      source: 'local',
    };
  }

  const posts = await searchPostsFromApi(trimmedQuery);
  return {
    posts,
    source: 'supabase',
  };
}

export async function createPost(postData, currentPosts = []) {
  const normalized = normalizePost(postData);

  if (apiConfig.enabled) {
    const post = await createPostOnApi(normalized);
    return { post, source: 'supabase' };
  }

  writeLocalPosts([normalized, ...currentPosts]);
  return { post: normalized, source: 'local' };
}

export async function updatePost(id, postData, currentPosts = []) {
  const currentPost = currentPosts.find((post) => post.id === id);
  if (!currentPost) {
    throw new Error('Post not found');
  }

  const normalized = normalizePost(
    {
      ...currentPost,
      ...postData,
      id,
      createdAt: currentPost.createdAt,
      slug: currentPost.slug,
      publishedAt:
        postData.status === 'published' || currentPost.status === 'published'
          ? currentPost.publishedAt || new Date().toISOString()
          : null,
    },
    id
  );

  if (apiConfig.enabled) {
    const post = await updatePostOnApi(id, normalized);
    return { post, source: 'supabase' };
  }

  writeLocalPosts(currentPosts.map((post) => (post.id === id ? normalized : post)));
  return { post: normalized, source: 'local' };
}

export async function deletePost(id, currentPosts = []) {
  if (apiConfig.enabled) {
    try {
      await deletePostOnApi(id);
      return { id, source: 'supabase' };
    } catch (error) {
      console.error('Error deleting post through Supabase:', error);
      throw error;
    }
  }

  writeLocalPosts(currentPosts.filter((post) => post.id !== id));
  return { id, source: 'local' };
}
