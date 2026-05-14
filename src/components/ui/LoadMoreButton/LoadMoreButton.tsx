/**
 * LoadMoreButton component
 * A reusable button for loading more paginated content
 */

import { Button } from "@/components/ui/Button/Button";

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
  hasMore: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function LoadMoreButton({
  onClick,
  isLoading,
  hasMore,
  disabled = false,
  children = "Load More",
}: LoadMoreButtonProps) {
  if (!hasMore) {
    return null;
  }

  return (
    <div className="flex justify-center mt-8">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        variant="secondary"
        className="min-w-[150px]"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </Button>
    </div>
  );
}
