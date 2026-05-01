"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Global loading component
 * Displayed while translations are loading to prevent flicker of translation keys
 */
const Loader: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg-primary"
    >
      {/* Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
        className="w-12 h-12 border-2 border-border border-t-accent-primary rounded-full"
      />

      {/* Loading text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-sm text-text-secondary font-alt tracking-wide"
      >
        Loading...
      </motion.p>
    </motion.div>
  );
};

export default Loader;
