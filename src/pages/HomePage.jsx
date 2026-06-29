import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import FeaturedPost from '../components/FeaturedPost';
import BlogCard from '../components/BlogCard';
import CategoryList from '../components/CategoryList';
import { useBlogPosts, useSearchPosts } from '../hooks/useBlogPosts';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const trimmedQuery = searchQuery.trim();
  const allPostsQuery = useBlogPosts();
  const searchPostsQuery = useSearchPosts(trimmedQuery);
  const activeQuery = trimmedQuery ? searchPostsQuery : allPostsQuery;
  const { posts, isLoading, error } = activeQuery;

  const featuredPost = useMemo(() => (trimmedQuery ? null : posts[0] || null), [posts, trimmedQuery]);
  const listedPosts = useMemo(
    () => (trimmedQuery ? posts : posts.slice(1)),
    [posts, trimmedQuery]
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const query = trimmedQuery;

    if (query) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-xl">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
        <h1 className="text-2xl font-bold mb-2">Unable to load posts</h1>
        <p className="text-muted-foreground">
          {error.message || 'The blog could not reach Supabase. Check your environment variables and database access.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {searchQuery && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">
            Search Results for "{searchQuery}"
          </h1>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchParams(value.trim() ? { search: value } : {});
              }}
              className="max-w-md"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
          <Separator className="my-6" />
        </div>
      )}
      
      {!searchQuery && featuredPost && (
        <FeaturedPost post={featuredPost} />
      )}
      
      <CategoryList />
      
      {!trimmedQuery && !featuredPost && listedPosts.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No Posts Yet</h2>
          <p className="text-muted-foreground mb-6">
            Be the first to create a blog post and share your thoughts!
          </p>
        </div>
      )}
      
      {trimmedQuery && listedPosts.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find any posts matching your search query.
          </p>
          <Button onClick={() => setSearchParams({})}>Clear Search</Button>
        </div>
      )}
      
      {listedPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            {trimmedQuery ? 'Search Results' : 'Latest Posts'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listedPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
