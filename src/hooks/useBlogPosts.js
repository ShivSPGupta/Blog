import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPost as createPostInService,
  deletePost as deletePostInService,
  fetchPosts,
  readLocalPosts,
  getPostsSource,
  updatePost as updatePostInService,
} from '../lib/posts-service';

const POSTS_QUERY_KEY = ['posts'];

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
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, postData }) => updatePostInService(id, postData, posts),
    onSuccess: ({ post, source: nextSource }) => {
      queryClient.setQueryData(POSTS_QUERY_KEY, (current) => ({
        posts: (current?.posts || []).map((item) => (item.id === post.id ? post : item)),
        source: nextSource,
      }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePostInService(id, posts),
    onSuccess: ({ id, source: nextSource }) => {
      queryClient.setQueryData(POSTS_QUERY_KEY, (current) => ({
        posts: (current?.posts || []).filter((item) => item.id !== id),
        source: nextSource,
      }));
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
