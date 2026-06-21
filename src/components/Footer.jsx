import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

const Footer = () => {
  const { categories } = useCategories();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[hsl(var(--background))] border-t border-[hsl(var(--border))] py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-purple-600 bg-clip-text text-transparent">
              Modern Blog
            </span>
            <p className="mt-4 text-[hsl(var(--muted-foreground))]">
              A beautiful blog platform with a modern design and seamless user experience.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <span className="font-medium">Categories</span>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map(category => (
                <Link key={category} to={`/category/${category}`}>
                  <span className="inline-block px-3 py-1 bg-[hsl(var(--secondary))] rounded-full text-sm hover:bg-[hsl(var(--primary))] hover:text-white transition-colors">
                    {category}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <span className="font-medium">Quick Links</span>
            <nav className="mt-4 flex flex-col space-y-2">
              <Link to="/" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">Home</Link>
              <Link to="/create" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">Write a Post</Link>
            </nav>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          <p>© {currentYear} Modern Blog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
