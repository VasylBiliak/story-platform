"use client";

import React from "react";

type SortOrder = "newest" | "oldest";

interface BooksSortRadioProps {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
  disabled?: boolean;
}

export function BooksSortRadio({
  value,
  onChange,
  disabled = false,
}: BooksSortRadioProps) {
  return (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-2 cursor-pointer group">
        <input
          type="radio"
          name="sort"
          value="newest"
          checked={value === "newest"}
          onChange={() => onChange("newest")}
          disabled={disabled}
          className="hidden"
        />
        <div 
          className={`
            w-5 h-5 border-2 rounded-full relative transition-all duration-300
            ${value === "newest" ? "border-accent-primary" : "border-text-primary"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <div 
            className={`
              absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
              w-3 h-3 bg-accent-primary rounded-full transition-all duration-300
              ${value === "newest" ? "opacity-100 scale-110" : "opacity-0 scale-50"}
            `}
          />
        </div>
        <span className="font-[Oswald] uppercase text-sm tracking-wider text-text-primary">
          Newest
        </span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer group">
        <input
          type="radio"
          name="sort"
          value="oldest"
          checked={value === "oldest"}
          onChange={() => onChange("oldest")}
          disabled={disabled}
          className="hidden"
        />
        <div 
          className={`
            w-5 h-5 border-2 rounded-full relative transition-all duration-300
            ${value === "oldest" ? "border-accent-primary" : "border-text-primary"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <div 
            className={`
              absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
              w-3 h-3 bg-accent-primary rounded-full transition-all duration-300
              ${value === "oldest" ? "opacity-100 scale-110" : "opacity-0 scale-50"}
            `}
          />
        </div>
        <span className="font-[Oswald] uppercase text-sm tracking-wider text-text-primary">
          Oldest
        </span>
      </label>
    </div>
  );
}