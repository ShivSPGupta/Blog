import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Tag } from 'lucide-react';
import { Button } from '../components/ui/button';
import BlogCard from '../components/BlogCard';
import { useBlogPosts } from '../hooks/useBlogPosts';

const CategoryPage = () => {
  const { category } = useParams();
  const { posts, isLoading } = useBlogPosts();
  const categoryPosts = useMemo(() => {
    if (!category) {
      return [];
    }

    return posts.filter((post) => post.category.toLowerCase() === category.toLowerCase());
  }, [category, posts]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-xl">Loading posts...</div>
      </div>
    );
  }

  return (
    <div>
      <Button 
        variant="ghost" 
        size="sm" 
        asChild 
        className="mb-6"
      >
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all posts
        </Link>
      </Button>
      
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Tag size={20} className="text-primary" />
          <h1 className="text-3xl font-bold">{category}</h1>
        </div>
        
        <p className="text-muted-foreground">
          {categoryPosts.length} {categoryPosts.length === 1 ? 'post' : 'posts'} in this category
        </p>
      </div>
      
      {categoryPosts.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-medium mb-2">No posts in this category yet</h2>
          <p className="text-muted-foreground mb-6">
            Be the first to create a post in the {category} category!
          </p>
          <Button asChild>
            <Link to="/create">Create a Post</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
