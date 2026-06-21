import { useMemo } from 'react';
import { useBlogPosts } from './useBlogPosts';

export function useCategories() {
  const { posts } = useBlogPosts();
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(posts.map((post) => post.category).filter(Boolean))];

    if (uniqueCategories.length === 0) {
      return ['Technology', 'Travel', 'Food', 'Lifestyle', 'Health'];
    }

    return uniqueCategories;
  }, [posts]);

  return { categories };
}
