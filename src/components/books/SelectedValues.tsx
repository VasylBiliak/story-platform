interface SelectedValuesProps {
  values: string[];
}

/**
 * Read-only badges showing what is selected in a closed FilterDropdown
 */
export function SelectedValues({ values }: SelectedValuesProps) {
  if (values.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
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
