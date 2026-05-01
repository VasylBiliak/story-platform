"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

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
    { label: 'Create Book', href: '/dashboard/books' },
  ];

  const handleNavigate = (href: string) => {
    router.push(href);
    closeMobileMenu();
  };

  const baseDesktopBtn =
    'relative font-[Oswald] text-xs font-semibold uppercase tracking-[2px] bg-transparent py-2 cursor-pointer text-text-primary transition-colors duration-300 hover:text-accent-primary after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-accent-primary after:transition-all after:duration-300 hover:after:w-full';

  const baseMobileBtn =
    'relative font-[Oswald] text-[28px] font-semibold uppercase tracking-[2px] text-text-primary bg-transparent py-2 cursor-pointer transition-all duration-300 hover:text-accent-primary hover:scale-105 after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:h-[2px] after:w-0 after:bg-accent-primary after:transition-all after:duration-300 hover:after:w-full';

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
            Story<span>Platform</span>
          </button>

          <div className="flex items-center">
            <div className="hidden md:flex items-center gap-6 md:gap-8 lg:gap-12">
              {navItems.map(item => (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.href)}
                  className={baseDesktopBtn}
                >
                  {item.label}
                </button>
              ))}
            </div>

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

            <nav className="flex flex-col justify-center items-center gap-4 w-full h-full text-center">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={() => handleNavigate(item.href)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 + index * 0.05, ease: 'easeOut' }}
                  className={baseMobileBtn}
                >
                  {item.label}
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;