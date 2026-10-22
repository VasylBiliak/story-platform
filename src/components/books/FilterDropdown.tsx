"use client";

import React, { useState, useRef, useEffect } from "react";

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  maxSelections?: number;
  disabled?: boolean;
}

export function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
  onClear,
  maxSelections = 3,
  disabled = false,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const canAddMore = selected.length < maxSelections;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center justify-between w-full sm:w-64 px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-left transition-colors ${
          isOpen ? "border-accent-primary" : "hover:border-accent-primary-hover"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium text-text-secondary truncate">
            {label}
          </span>
          {selected.length > 0 && (
            <span className="text-xs text-accent-primary font-medium">
              ({selected.length})
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-text-tertiary transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full sm:w-64 mt-2 bg-bg-primary border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <div className="p-2">
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setIsOpen(false);
                }}
                className="w-full text-xs text-accent-primary hover:text-accent-primary-hover py-1.5 px-2 rounded transition-colors"
              >
                Clear all
              </button>
            )}
            {options.length === 0 ? (
              <p className="text-sm text-text-tertiary py-2 px-2">No options available</p>
            ) : (
              options.map((option) => {
                const isSelected = selected.includes(option);
                const canSelect = !isSelected && canAddMore;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      if (canSelect || isSelected) {
                        onToggle(option);
                      }
                    }}
                    disabled={!canSelect && !isSelected}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                      isSelected
                        ? "bg-accent-primary text-white"
                        : "text-text-secondary hover:bg-bg-secondary"
                    } ${!canSelect && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isSelected ? "bg-white border-white" : "border-border"
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-accent-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="truncate">{option}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
