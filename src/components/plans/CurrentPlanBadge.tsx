import React from "react";

export function CurrentPlanBadge() {
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent-tertiary/20 border border-accent-tertiary/50">
      <span className="text-accent-tertiary text-xs font-semibold uppercase tracking-wider">
        Current Plan
      </span>
    </div>
  );
}
