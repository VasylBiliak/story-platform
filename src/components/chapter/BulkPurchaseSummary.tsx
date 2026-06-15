interface BulkPurchaseSummaryProps {
  selectedCount: number;
  totalCount: number;
  totalPrice: number;
  onPurchase: () => void;
  isPurchasing: boolean;
  error: string | null;
}

export function BulkPurchaseSummary({
  selectedCount,
  totalCount,
  totalPrice,
  onPurchase,
  isPurchasing,
  error,
}: BulkPurchaseSummaryProps) {
  return (
    <div className="mb-6 p-4 bg-bg-secondary rounded-xl border border-border">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="text-text-secondary">
            Selected: <span className="font-semibold text-text-primary">{selectedCount}</span> / {totalCount} chapters
          </div>
          <div className="text-text-secondary">
            Total: <span className="font-semibold text-accent-primary">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
        
        <button
          onClick={onPurchase}
          disabled={isPurchasing}
          className="inline-flex items-center justify-center text-lg 
                    cursor-pointer overflow-hidden border-2 border-accent-primary 
                    px-6 py-3 tracking-[0.15em] text-accent-primary transition-all 
                    duration-200 
                    hover:bg-accent-primary hover:text-bg-primary hover:border-accent-primary
                    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
        >
          {isPurchasing ? (
            'Processing...'
          ) : (
            <>Buy Selected (${totalPrice.toFixed(2)})</>
          )}
        </button>
      </div>
      
      {error && (
        <div className="mt-3 p-3 bg-status-error-bg text-status-error rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
