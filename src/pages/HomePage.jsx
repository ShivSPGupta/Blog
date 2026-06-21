import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import FeaturedPost from '../components/FeaturedPost';
import BlogCard from '../components/BlogCard';
import CategoryList from '../components/CategoryList';
import { useBlogPosts } from '../hooks/useBlogPosts';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { posts, isLoading } = useBlogPosts();
  const searchQuery = searchParams.get('search') || '';

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return posts;
    }

    return posts.filter((post) =>
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();

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
  
  // Get featured post (most recent)
  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  // Get remaining posts
  const remainingPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

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
      
      {!searchQuery && !featuredPost && remainingPosts.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No Posts Yet</h2>
          <p className="text-muted-foreground mb-6">
            Be the first to create a blog post and share your thoughts!
          </p>
        </div>
      )}
      
      {searchQuery && filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find any posts matching your search query.
          </p>
          <Button onClick={() => setSearchParams({})}>Clear Search</Button>
        </div>
      )}
      
      {remainingPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            {searchQuery ? 'Search Results' : 'Latest Posts'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remainingPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
