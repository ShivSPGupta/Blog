import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import PostForm from '../components/PostForm';
import { useBlogPosts } from '../hooks/useBlogPosts';

const EditPostPage = () => {
  const { id } = useParams();
  const { getPost, updatePost, isLoading } = useBlogPosts();
  const post = useMemo(() => getPost(id), [getPost, id]);
  
  const handleUpdatePost = async (formData) => {
    return updatePost(id, formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-xl">Loading post...</div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The blog post you are trying to edit does not exist.
        </p>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
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
        <Link to={`/post/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to post
        </Link>
      </Button>
      
      <div>
        <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
        <PostForm initialData={post} onSubmit={handleUpdatePost} />
      </div>
    </div>
  );
};

export default EditPostPage;
