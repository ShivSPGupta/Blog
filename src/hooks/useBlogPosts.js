import { useSyncExternalStore } from 'react';
import { samplePosts } from '../lib/sample-data';
import {
  getApiConfig,
  fetchPosts as fetchPostsFromApi,
  createPost as createPostOnApi,
  updatePost as updatePostOnApi,
  deletePost as deletePostOnApi,
} from '../lib/blog-api';

const STORAGE_KEY = 'blog-posts';
const apiConfig = getApiConfig();

function readInitialPosts() {
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

let state = {
  posts: readInitialPosts(),
  isLoading: true,
  source: apiConfig.enabled ? 'api' : 'local',
};

const listeners = new Set();
let bootstrapPromise = null;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function persistPosts(posts) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Error saving posts:', error);
  }
}

function setState(nextState) {
  state = { ...state, ...nextState };
  emitChange();
}

function setPosts(nextPosts, source = state.source) {
  state = { ...state, posts: nextPosts, source };
  persistPosts(nextPosts);
  emitChange();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

function normalizePost(postData, fallbackId = null) {
  const title = String(postData.title || '').trim();
  const now = new Date().toISOString();

  return {
    id: postData.id || fallbackId || crypto.randomUUID(),
    title,
    excerpt: String(postData.excerpt || '').trim(),
    content: String(postData.content || '').trim(),
    category: String(postData.category || 'General').trim(),
    coverImage: String(postData.coverImage || postData.cover_image || '').trim(),
    readTime: Number.parseInt(postData.readTime ?? postData.read_time ?? 5, 10) || 5,
    status: postData.status === 'published' ? 'published' : 'draft',
    slug: postData.slug || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    createdAt: postData.createdAt || now,
    updatedAt: now,
    publishedAt: postData.status === 'published' ? (postData.publishedAt || now) : null,
  };
}

async function bootstrapPosts() {
  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  bootstrapPromise = (async () => {
    if (!apiConfig.enabled) {
      setState({
        posts: readInitialPosts(),
        isLoading: false,
        source: 'local',
      });
      return;
    }

    try {
      const remotePosts = await fetchPostsFromApi();
      setPosts(remotePosts, 'api');
      setState({ isLoading: false });
      return;
    } catch (error) {
      console.error('Error loading posts from API:', error);
    }

    setState({
      posts: readInitialPosts(),
      isLoading: false,
      source: 'local',
    });
  })();

  return bootstrapPromise;
}

void bootstrapPosts();

async function createPost(postData) {
  const normalized = normalizePost(postData);

  if (apiConfig.enabled) {
    try {
      const created = await createPostOnApi(normalized);
      const nextPosts = [created, ...state.posts];
      setPosts(nextPosts, 'api');
      return created;
    } catch (error) {
      console.error('Error creating post through API:', error);
    }
  }

  const nextPosts = [normalized, ...state.posts];
  setPosts(nextPosts, 'local');
  return normalized;
}

async function updatePost(id, postData) {
  const currentPost = state.posts.find((post) => post.id === id);
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
    try {
      const updated = await updatePostOnApi(id, normalized);
      const nextPosts = state.posts.map((post) => (post.id === id ? updated : post));
      setPosts(nextPosts, 'api');
      return updated;
    } catch (error) {
      console.error('Error updating post through API:', error);
    }
  }

  const nextPosts = state.posts.map((post) => (post.id === id ? normalized : post));
  setPosts(nextPosts, 'local');
  return normalized;
}

async function deletePost(id) {
  if (apiConfig.enabled) {
    try {
      await deletePostOnApi(id);
      const nextPosts = state.posts.filter((post) => post.id !== id);
      setPosts(nextPosts, 'api');
      return;
    } catch (error) {
      console.error('Error deleting post through API:', error);
    }
  }

  const nextPosts = state.posts.filter((post) => post.id !== id);
  setPosts(nextPosts, 'local');
}

function getPost(id) {
  return state.posts.find((post) => post.id === id);
}

export function useBlogPosts() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    posts: snapshot.posts,
    isLoading: snapshot.isLoading,
    source: snapshot.source,
    createPost,
    updatePost,
    deletePost,
    getPost,
  };
}
