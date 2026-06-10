'use client';

import { Chapter } from '@/lib/types';
import { LockIcon } from '@/components/ui/LockIcon';
import { BookOpenIcon } from "@/components/ui/BookOpenIcon";
import { useState } from 'react';

interface PaywallProps {
  chapter: Chapter;
}

export function Paywall({ chapter }: PaywallProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterId: chapter.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate purchase');
    } finally {
      setIsLoading(false);
    }
  };

  // Content should be empty for non-purchased paid chapters (backend enforces this)
  // But we'll show a preview if any content exists
  const content = chapter.content || "";
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  const previewParagraphs = paragraphs.slice(0, 2);
  const preview = previewParagraphs.join('\n\n');

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Preview Content - Faded */}
      {preview && (
        <div className="p-8 relative">
          <div className="prose prose-lg max-w-none opacity-50">
            {preview.split('\n\n').map((paragraph, index) => (
              <p
                key={index}
                className="leading-relaxed mb-4 text-lg"
              >
                {paragraph}
              </p>
            ))}
          </div>
          {/* Fade gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-secondary to-transparent" />
        </div>
      )}

      {/* Paywall CTA */}
      <div className="rounded-xl p-6 text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
          <LockIcon className="w-6 h-6 text-status-warning" />
        </div>
        <h3 className="text-lg font-bold mb-2">
          This chapter is locked
        </h3>
        <p className="mb-4 text-text-secondary">
          Purchase this chapter to continue reading
        </p>
        {error && (
          <div className="mb-4 p-3 bg-status-error-bg text-status-error rounded-lg text-sm">
            {error}
          </div>
        )}
        <button
          onClick={handlePurchase}
          disabled={isLoading}
          className="inline-flex items-center justify-center text-lg 
                      cursor-pointer overflow-hidden border-2 border-accent-primary 
                      px-8 py-4 tracking-[0.15em] text-accent-primary transition-all 
                      duration-200 
                      hover:bg-accent-primary hover:text-bg-primary hover:border-accent-primary
                      active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
        >
          {isLoading ? (
            'Processing...'
          ) : (
            <>
              Buy for ${(chapter.finalPrice || 0).toFixed(2)}
              {chapter.price && chapter.discount && chapter.discount > 0 && (
                <span className="ml-2 text-sm line-through text-accent-primary">
                  ${chapter.price.toFixed(2)}
                </span>
              )}
            </>
          )}
        </button>
        <p className="mt-4 text-xs text-text-tertiary">
          Secure payment powered by Stripe • Instant access after purchase
        </p>
      </div>
    </div>
  );
}
