import type { Metadata } from 'next';
import HomeContent from './HomeContent';
import Hero from '@/components/sections/Hero/Hero';
import Library from '@/components/sections/Library/Library';

export const metadata: Metadata = {
  title: 'Story Platform - Discover Amazing Stories',
  description: 'Explore our collection of captivating books. Read free chapters and unlock premium content from talented authors.',
};

export default function Page() {
  return (
    <main>
      <Hero />
      <Library />
    </main>
  );
}