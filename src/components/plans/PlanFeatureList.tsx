import React from "react";

interface PlanFeatureListProps {
  features: string[];
}

export function PlanFeatureList({ features }: PlanFeatureListProps) {
  return (
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start text-text-secondary text-sm">
          <svg
            className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-accent-tertiary"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          {feature}
        </li>
      ))}
    </ul>
  );
}
