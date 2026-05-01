"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface CategoryListProps {
  onClose?: () => void;
  className?: string;
}

const categories = [
  { id: 'all', label: 'All' },
  { id: 'fiction', label: 'Fiction' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'scifi', label: 'Sci-Fi' },
  { id: 'mystery', label: 'Mystery' },
];

const CategoryList: React.FC<CategoryListProps> = ({ onClose }) => {
  const router = useRouter();

  const handleCategoryClick = (categoryId: string) => {
    router.push("/#books");
    onClose?.();
  };

  return (
    <div className="flex flex-wrap justify-center items-center text-4xl 
    text-text-primary gap-0.4 md:gap-1">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.id)}
          className="relative bg-transparent border-none cursor-pointer font-[Oswald] uppercase tracking-[2px] transition-all duration-300 text-[24px] py-2 w-full text-center md:text-[12px] md:w-auto md:px-4 md:py-3 md:tracking-[1.5px] after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-0 after:bg-accent-primary after:transition-all after:duration-300 text-text-primary md:hover:text-accent-primary md:hover:after:w-full"
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryList;