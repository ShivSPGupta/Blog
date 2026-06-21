import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, Tag, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { useToast } from '../components/ui/use-toast';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { formatDate } from '../lib/utils';

const BlogPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getPost, deletePost, isLoading } = useBlogPosts();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const post = useMemo(() => getPost(id), [getPost, id]);

  useEffect(() => {
    document.title = post ? `${post.title} | Modern Blog` : 'Modern Blog';

    return () => {
      document.title = 'Modern Blog';
    };
  }, [post]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-xl">Loading post...</div>
      </div>
    );
  }
  
  const handleDelete = () => {
    try {
      deletePost(id);
      toast({
        title: 'Post deleted',
        description: 'Your post has been deleted successfully.',
      });
      navigate('/');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete the post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The blog post you are looking for does not exist.
        </p>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <article>
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
      
      <div className="relative rounded-xl overflow-hidden mb-8">
        <img 
          src={post.coverImage} 
          alt={post.title}
          className="w-full h-[400px] object-cover"
        />
      </div>
      
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(post.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{post.readTime} min read</span>
          </div>
          <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            {post.status === 'draft' ? 'Draft' : 'Published'}
          </span>
          <Link 
            to={`/category/${post.category}`}
            className="inline-flex items-center gap-1 bg-secondary px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-colors"
          >
            <Tag size={14} />
            {post.category}
          </Link>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-6">{post.title}</h1>
        
        <div className="flex justify-end space-x-2 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <Link to={`/edit/${post.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          
          {!showDeleteConfirm ? (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDelete}
              >
                Confirm
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
        
        <Separator className="my-6" />
        
        <div className="prose prose-lg max-w-none blog-content whitespace-pre-wrap font-sans text-inherit">
          {post.content}
        </div>
      </div>
    </article>
  );
};

export default BlogPostPage;
