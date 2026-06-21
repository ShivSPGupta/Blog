const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');

function isConfigured() {
  return Boolean(API_BASE_URL);
}

async function request(path, options = {}) {
  if (!isConfigured()) {
    throw new Error('API base URL is not configured');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getApiConfig() {
  return {
    baseUrl: API_BASE_URL,
    enabled: isConfigured(),
  };
}

export function fetchPosts() {
  return request('/api/posts');
}

export function createPost(postData) {
  return request('/api/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
}

export function updatePost(postId, postData) {
  return request(`/api/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  });
}

export function deletePost(postId) {
  return request(`/api/posts/${postId}`, {
    method: 'DELETE',
  });
}
