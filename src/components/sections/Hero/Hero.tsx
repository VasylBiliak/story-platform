"use client";

import React from 'react';
import { scrollToWithOffset } from '@/lib/scroll';

const Hero = () => {
  const scrollToBooks = () => {
    scrollToWithOffset('books');
  };

  return (
    <section className="relative flex justify-center items-center py-20 md:py-32">
      <div className="text-center flex flex-col justify-center items-center m-4 gap-8 max-w-4xl">
        <h1 className="font-[Oswald] font-bold text-5xl leading-tight text-text-primary capitalize tracking-wide sm:text-6xl md:text-7xl">
          Discover Amazing <span className="text-accent-primary">Stories</span>
        </h1>

        <p className="text-lg text-text-secondary max-w-2xl">
          Explore our collection of captivating books. Read free chapters and unlock premium content from talented authors.
        </p>

        <button
          type="button"
          className="group relative text-lg cursor-pointer overflow-hidden border-2 border-accent-primary px-8 py-4 tracking-[0.15em] text-accent-primary transition-all duration-200 hover:bg-accent-primary hover:text-bg-primary active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          onClick={scrollToBooks}
        >
          Explore Library
        </button>
      </div>
    </section>
  );
};

export default Hero;