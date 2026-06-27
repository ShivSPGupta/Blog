import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import PostForm from '../components/PostForm';
import AuthGate from '../components/AuthGate';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { useAuth } from '../hooks/useAuth';
import { getRandomImage } from '../lib/utils';

const CreatePostPage = () => {
  const { createPost } = useBlogPosts();
  const { user, profile } = useAuth();
  
  const handleCreatePost = async (formData) => {
    const nextPost = { ...formData };

    // If no cover image is provided, generate one based on category
    if (!nextPost.coverImage) {
      nextPost.coverImage = getRandomImage(nextPost.category);
    }

    nextPost.authorId = user?.id || null;
    nextPost.authorEmail = user?.email || null;
    nextPost.authorDisplayName = profile?.displayName || user?.email?.split('@')[0] || 'Author';
    
    return createPost(nextPost);
  };

  return (
    <AuthGate title="Sign in to write" description="Only signed-in authors can create posts in Supabase mode.">
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
      
      <div>
        <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>
        <PostForm onSubmit={handleCreatePost} />
      </div>
      </div>
    </AuthGate>
  );
};

export default CreatePostPage;
