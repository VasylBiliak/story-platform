"use client";

interface SelectAllChaptersControlProps {
  selectedCount: number;
  eligibleCount: number;
  onToggle: () => void;
  className?: string;
}

export function SelectAllChaptersControl({
  selectedCount,
  eligibleCount,
  onToggle,
  className = "",
}: SelectAllChaptersControlProps) {
  return (
    <div className={`${className} flex items-center gap-3`}>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={selectedCount === eligibleCount}
          onChange={onToggle}
          className="w-5 h-5 rounded border-border text-accent-primary focus:ring-accent-primary cursor-pointer"
          aria-label="Select all purchasable chapters"
        />
        <span className="text-sm font-medium text-text-primary">Select All</span>
      </label>
      <span className="text-xs text-text-tertiary">
        ({eligibleCount} premium chapters available)
      </span>
    </div>
  );
}
