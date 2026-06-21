import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import { useCategories } from '../hooks/useCategories';

const getDraftKey = (initialData) =>
  initialData?.id ? `blog-post-draft-${initialData.id}` : 'blog-post-draft-new';

const buildInitialFormData = (initialData, categories) => {
  if (typeof window !== 'undefined') {
    const draftKey = getDraftKey(initialData);
    const savedDraft = localStorage.getItem(draftKey);

    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        return {
          title: initialData?.title || draft.title || '',
          excerpt: initialData?.excerpt || draft.excerpt || '',
          content: initialData?.content || draft.content || '',
          category: initialData?.category || draft.category || categories[0] || 'General',
          coverImage: initialData?.coverImage || draft.coverImage || '',
          readTime: String(initialData?.readTime || draft.readTime || '5'),
          status: initialData?.status || draft.status || 'draft',
        };
      } catch {
        // Fall back to default form state below.
      }
    }
  }

  return {
    title: initialData?.title || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    category: initialData?.category || categories[0] || 'General',
    coverImage: initialData?.coverImage || '',
    readTime: String(initialData?.readTime || '5'),
    status: initialData?.status || 'draft',
  };
};

const PostForm = ({ initialData = null, onSubmit }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { categories } = useCategories();
  const draftKey = useMemo(() => getDraftKey(initialData), [initialData]);

  const [formData, setFormData] = useState(() => buildInitialFormData(initialData, categories));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      return;
    }

    setFormData(buildInitialFormData(initialData, categories));
  }, [categories, initialData]);

  useEffect(() => {
    if (typeof window === 'undefined' || isSubmitting) {
      return;
    }

    const timeout = window.setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify(formData));
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [draftKey, formData, isSubmitting]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(draftKey);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.content.trim()) {
        throw new Error('Content is required');
      }
      if (!formData.excerpt.trim()) {
        throw new Error('Excerpt is required');
      }

      const payload = {
        ...formData,
        readTime: Number.parseInt(formData.readTime, 10) || 5,
      };

      await onSubmit(payload);

      clearDraft();

      toast({
        title: initialData ? 'Post updated' : 'Post created',
        description: initialData
          ? 'Your post has been updated successfully.'
          : payload.status === 'draft'
            ? 'Your draft has been saved successfully.'
            : 'Your post has been published successfully.',
      });

      navigate(initialData ? `/post/${initialData.id}` : '/');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-6 items-start">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter post title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Brief summary of your post"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your post content here..."
              className="min-h-[300px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="readTime">Read Time (minutes)</Label>
              <Input
                id="readTime"
                name="readTime"
                type="number"
                min="1"
                max="60"
                value={formData.readTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="Enter image URL or leave empty for a default image"
            />
            {formData.coverImage && (
              <div className="mt-2 rounded-md overflow-hidden border">
                <img
                  src={formData.coverImage}
                  alt="Cover preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+Preview';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-lg border border-[hsl(var(--border))] bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Preview
            </h2>
            <span className="rounded-full bg-background px-3 py-1 text-xs font-medium border border-[hsl(var(--border))]">
              {formData.status}
            </span>
          </div>

          <div className="space-y-4">
            <div className="rounded-md overflow-hidden border bg-background">
              <img
                src={formData.coverImage || 'https://placehold.co/1200x800/e2e8f0/64748b?text=Preview'}
                alt="Post preview"
                className="h-44 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/1200x800/e2e8f0/64748b?text=Preview';
                }}
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                {formData.category}
              </p>
              <h3 className="text-lg font-bold leading-snug">
                {formData.title || 'Untitled post'}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {formData.excerpt || 'Your excerpt will appear here.'}
              </p>
            </div>

            <div className="rounded-md border bg-background p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Content
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {formData.content || 'Write content to preview it here.'}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving...'
            : initialData
              ? 'Update Post'
              : formData.status === 'draft'
                ? 'Save Draft'
                : 'Publish Post'}
        </Button>
      </div>
    </form>
  );
};

export default PostForm;
