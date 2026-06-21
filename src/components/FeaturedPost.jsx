import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { formatDate } from '../lib/utils';

const FeaturedPost = ({ post }) => {
  const { id, title, excerpt, coverImage, category, createdAt, readTime } = post;

  return (
    <div className="relative overflow-hidden rounded-xl shadow-lg mb-12">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10" />
      <img src={coverImage} alt={title} className="w-full h-[500px] object-cover" />

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20 text-white">
        <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
          <div className="flex items-center gap-1"><Calendar size={14} className="text-primary" /><span>{formatDate(createdAt)}</span></div>
          <div className="flex items-center gap-1"><Clock size={14} className="text-primary" /><span>{readTime} min read</span></div>
          {post.status && (
            <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-white">
              {post.status === 'draft' ? 'Draft' : 'Published'}
            </span>
          )}
          <Link to={`/category/${category}`} className="inline-flex items-center gap-1 bg-primary/20 backdrop-blur-sm px-3 py-1 rounded-full hover:bg-primary/30 transition-colors"><Tag size={14} />{category}</Link>
        </div>

        <Link to={`/post/${id}`}>
          <h1 className="text-2xl md:text-4xl font-bold mb-4 hover:text-primary transition-colors">{title}</h1>
        </Link>

        <p className="text-white mb-6 max-w-3xl">{excerpt}</p>

        <Link to={`/post/${id}`}>
          <Button size="lg" className="bg-primary hover:bg-blue-900 text-primary-foreground">Read Article</Button>
        </Link>
      </div>
    </div>
  );
};

export default FeaturedPost;
