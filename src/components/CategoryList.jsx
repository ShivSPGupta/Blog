import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';

const CategoryList = () => {
  const { categories } = useCategories();

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-4 text-[hsl(var(--foreground))]">Categories</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link key={category} to={`/category/${category}`}>
            <div className="px-4 py-2 rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--primary))] hover:text-white transition-colors cursor-pointer">
              {category}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
