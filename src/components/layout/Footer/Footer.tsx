"use client";

import React from "react";

const Footer = () => {
  return (
    <footer
      id="contact"
      className="overflow-hidden relative z-10 flex flex-col items-center border-t border-border"
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row justify-between lg:items-start px-6 py-20 gap-16 lg:gap-10">
        <div className="flex flex-col items-center lg:items-start gap-6 w-full lg:flex-1 text-center lg:text-left">
          <h2 className="font-base text-accent-primary tracking-wider capitalize text-3xl 2xl:text-4xl">
            Contact Us
          </h2>
          <address className="not-italic space-y-2 text-text-secondary">
            <p className="font-alt hover:text-text-primary transition-colors">
              <a href="mailto:hello@storyplatform.com">hello@storyplatform.com</a>
            </p>
          </address>
        </div>

        <div className="flex flex-col items-center gap-6 w-full lg:flex-1 order-first lg:order-none">
          <div className="w-48 md:w-56">
            <span className="font-[Oswald] text-2xl font-bold tracking-[3px] text-text-primary uppercase">
              Story<span className="text-accent-primary">Platform</span>
            </span>
          </div>

          <p className="font-alt text-text-secondary italic max-w-xs text-center pb-4">
            Discover amazing stories from talented authors
          </p>
        </div>

        <div className="flex flex-col items-center lg:items-end gap-6 w-full lg:flex-1 text-center lg:text-right">
          <h2 className="font-base text-accent-primary tracking-wider capitalize text-3xl 2xl:text-4xl">
            Read Anytime
          </h2>

          <div className="space-y-6 text-text-secondary">
            <p className="font-alt">Free chapters available</p>
            <p className="font-alt">Premium content unlocked</p>
          </div>
        </div>
      </div>

      <div className="w-full border-t border-border py-8 text-center">
        <p className="font-alt text-text-secondary/50 text-sm">
          © {new Date().getFullYear()} Story Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;