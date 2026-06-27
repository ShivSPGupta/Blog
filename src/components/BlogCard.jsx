import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Tag, User } from 'lucide-react';
import { formatDate } from '../lib/utils';

const BlogCard = ({ post }) => {
  const { id, title, excerpt, coverImage, category, createdAt, readTime, authorDisplayName, authorEmail } = post;
  const authorName = authorDisplayName || authorEmail?.split('@')[0] || 'Author';

  return (
    <article className="group overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-card shadow-sm hover:shadow-md transition-all duration-300">
      <Link to={`/post/${id}`} className="block">
        <div className="aspect-video w-full overflow-hidden">
          <img src={coverImage} alt={title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
      </Link>

      <div className="p-6">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1"><Calendar size={14} /><span>{formatDate(createdAt)}</span></div>
          <div className="flex items-center gap-1"><Clock size={14} /><span>{readTime} min read</span></div>
          {post.status && (
            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {post.status === 'draft' ? 'Draft' : 'Published'}
            </span>
          )}
        </div>

        <Link to={`/post/${id}`}><h2 className="text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors">{title}</h2></Link>
        <p className="text-muted-foreground mb-4 line-clamp-2">{excerpt}</p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <User size={14} />
          <span>{authorName}</span>
        </div>

        <div className="flex items-center justify-between">
          <Link to={`/category/${category}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><Tag size={14} />{category}</Link>
          <Link to={`/post/${id}`} className="text-sm font-medium text-primary hover:underline">Read more</Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
