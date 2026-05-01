"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollToWithOffset } from '@/lib/scroll';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

  const navItems = [
    { label: 'Library', href: '/#books' },
    { label: 'About', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Create', href: '/dashboard/books' },
  ];

  const handleNavigate = (href: string) => {
    // Handle hash navigation for same-page scrolling
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      scrollToWithOffset(id);
    } else {
      router.push(href);
    }
    closeMobileMenu();
  };

  const baseDesktopBtn =
    'relative font-[Oswald] text-xs font-semibold uppercase tracking-[2px] bg-transparent py-2 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary';

  const baseMobileBtn =
    'relative font-[Oswald] text-[28px] font-semibold uppercase tracking-[2px] bg-transparent py-2 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary';

  const NavLink = ({ href, children, isMobile = false }: { href: string; children: React.ReactNode; isMobile?: boolean }) => {
    const isActive = pathname === href || pathname.startsWith(href);
    const baseClasses = isMobile ? baseMobileBtn : baseDesktopBtn;
    
    return (
      <motion.button
        onClick={() => handleNavigate(href)}
        className={`${baseClasses} ${isActive ? 'text-accent-primary' : 'text-text-primary hover:text-accent-primary'} ${!isMobile ? 'hover:scale-105' : ''}`}
        whileHover={!isMobile ? { y: -1 } : undefined}
        transition={{ duration: 0.15 }}
      >
        <motion.span className="relative inline-block">
          {children}
          {isActive && (
            <motion.div
              layoutId="nav-underline"
              className={`absolute ${isMobile ? 'left-1/2 -translate-x-1/2' : 'left-0'} -bottom-1 h-[2px] w-full bg-accent-primary`}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.span>
      </motion.button>
    );
  };

  return (
    <>
      <motion.header
        className="sticky top-0 z-900 border-b border-border"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between px-4 sm:px-8 md:px-14 h-16">
          <button
            onClick={() => router.push('/')}
            className="font-[Oswald] text-xl font-bold tracking-[3px] uppercase bg-transparent transition-all duration-300 hover:scale-105 hover:text-accent-primary"
          >
            Story<span className="text-accent-primary hover:text-2xl">Platform</span>
          </button>

          <div className="flex items-center">
            <nav className="hidden md:flex items-center gap-6 md:gap-8 lg:gap-12" aria-label="Main navigation">
              {navItems.map(item => (
                <NavLink key={item.label} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button
              onClick={toggleMobileMenu}
              className="flex flex-col gap-[5px] p-1 bg-transparent md:hidden group"
              aria-label="Toggle menu"
            >
              <span className="block w-6 h-0.5 bg-text-primary transition-all duration-300 group-hover:bg-accent-primary" />
              <span className="block w-6 h-0.5 bg-text-primary transition-all duration-300 group-hover:bg-accent-primary" />
              <span className="block w-6 h-0.5 bg-text-primary transition-all duration-300 group-hover:bg-accent-primary" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[1500] flex flex-col justify-center bg-bg-primary items-center px-8 md:hidden"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <button
              onClick={closeMobileMenu}
              className="absolute top-5 right-6 bg-transparent text-[28px] cursor-pointer text-text-primary leading-none transition-colors hover:text-accent-primary"
            >
              ✕
            </button>

            <nav className="flex flex-col justify-center items-center gap-4 w-full h-full text-center" aria-label="Mobile navigation">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 + index * 0.05, ease: 'easeOut' }}
                >
                  <NavLink href={item.href} isMobile={true}>
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;