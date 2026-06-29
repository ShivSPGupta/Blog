import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPost as createPostInService,
  deletePost as deletePostInService,
  fetchPosts,
  searchPosts as searchPostsInService,
  readLocalPosts,
  getPostsSource,
  filterPostsByQuery,
  updatePost as updatePostInService,
} from '../lib/posts-service';

const POSTS_QUERY_KEY = ['posts'];
const SEARCH_POSTS_QUERY_KEY = ['post-search'];

function mergePostIntoList(posts, nextPost) {
  const withoutCurrent = posts.filter((post) => post.id !== nextPost.id);
  return [nextPost, ...withoutCurrent].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export function useBlogPosts() {
  const queryClient = useQueryClient();
  const sourceHint = getPostsSource();
  const postsQuery = useQuery({
    queryKey: POSTS_QUERY_KEY,
    queryFn: fetchPosts,
    initialData: sourceHint === 'local'
      ? {
          posts: readLocalPosts(),
          source: 'local',
        }
      : undefined,
  });

  const posts = postsQuery.data?.posts || [];
  const source = postsQuery.data?.source || sourceHint;

  const createMutation = useMutation({
    mutationFn: (postData) => createPostInService(postData, posts),
    onSuccess: ({ post, source: nextSource }) => {
      queryClient.setQueryData(POSTS_QUERY_KEY, (current) => ({
        posts: mergePostIntoList(current?.posts || [], post),
        source: nextSource,
      }));
      void queryClient.invalidateQueries({ queryKey: SEARCH_POSTS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, postData }) => updatePostInService(id, postData, posts),
    onSuccess: ({ post, source: nextSource }) => {
      queryClient.setQueryData(POSTS_QUERY_KEY, (current) => ({
        posts: (current?.posts || []).map((item) => (item.id === post.id ? post : item)),
        source: nextSource,
      }));
      void queryClient.invalidateQueries({ queryKey: SEARCH_POSTS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePostInService(id, posts),
    onSuccess: ({ id, source: nextSource }) => {
      queryClient.setQueryData(POSTS_QUERY_KEY, (current) => ({
        posts: (current?.posts || []).filter((item) => item.id !== id),
        source: nextSource,
      }));
      void queryClient.invalidateQueries({ queryKey: SEARCH_POSTS_QUERY_KEY });
    },
  });

  return {
    posts,
    source,
    isLoading: postsQuery.isLoading,
    isFetching: postsQuery.isFetching,
    error: postsQuery.error,
    createPost: createMutation.mutateAsync,
    updatePost: (id, postData) => updateMutation.mutateAsync({ id, postData }),
    deletePost: deleteMutation.mutateAsync,
    getPost: (id) => posts.find((post) => post.id === id),
  };
}

export function useSearchPosts(searchQuery) {
  const sourceHint = getPostsSource();
  const trimmedQuery = String(searchQuery || '').trim();
  const searchQueryResult = useQuery({
    queryKey: [...SEARCH_POSTS_QUERY_KEY, trimmedQuery],
    queryFn: () => searchPostsInService(trimmedQuery),
    enabled: Boolean(trimmedQuery),
    initialData: sourceHint === 'local' && trimmedQuery
      ? {
          posts: filterPostsByQuery(readLocalPosts(), trimmedQuery),
          source: 'local',
        }
      : undefined,
  });

  return {
    posts: searchQueryResult.data?.posts || [],
    source: searchQueryResult.data?.source || sourceHint,
    isLoading: searchQueryResult.isLoading,
    isFetching: searchQueryResult.isFetching,
    error: searchQueryResult.error,
  };
}
