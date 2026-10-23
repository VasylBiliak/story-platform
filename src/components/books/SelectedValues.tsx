interface SelectedValuesProps {
  values: string[];
  className?: string;
}

/**
 * Read-only badges for a list of values, e.g. a book's genres or the selection in a closed FilterDropdown
 */
export function SelectedValues({ values, className = "mt-2" }: SelectedValuesProps) {
  if (values.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {values.map((value) => (
        <span
          key={value}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-bg-secondary text-text-secondary border border-border whitespace-nowrap"
        >
          {value}
        </span>
      ))}
    </div>
  );
}
