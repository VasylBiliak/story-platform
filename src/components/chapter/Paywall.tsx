'use client';

import { Chapter } from '@/lib/types';
import { LockIcon } from '@/components/ui/LockIcon';

interface PaywallProps {
  chapter: Chapter;
}

export function Paywall({ chapter }: PaywallProps) {
  const handlePurchase = () => {
    // Placeholder for Stripe integration
    // In the future, this will:
    // 1. Check if user is authenticated
    // 2. Create Stripe checkout session
    // 3. Handle payment success/failure
    // 4. Update user's purchase record
    alert(
      `Stripe integration coming soon! This would initiate purchase for "${chapter.title}" at $${chapter.price?.toFixed(2)}`
    );
  };

  // Extract preview (first 3 paragraphs)
  const content = chapter.content;
  const paragraphs = content.split('\n\n');
  const previewParagraphs = paragraphs.slice(0, 3);
  const preview = previewParagraphs.join('\n\n');

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Preview Content - Faded */}
      <div className="p-8 relative">
        <div className="prose prose-lg max-w-none">
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
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent" />
      </div>

      {/* Paywall CTA */}
      <div className="px-8 pb-8">
        <div className="bg-status-warning-bg border border-status-warning/30 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-status-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockIcon className="w-6 h-6 text-status-warning" />
          </div>
          <h3 className="text-lg font-bold mb-2">
            This chapter is locked
          </h3>
          <p className=" mb-4">
            Purchase this chapter to continue reading
          </p>
          <button
            onClick={handlePurchase}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-status-warning text-white font-semibold rounded-lg hover:bg-status-warning/80 transition-colors focus:outline-none focus:ring-2 focus:ring-status-warning focus:ring-offset-2"
          >
            Buy for ${chapter.price?.toFixed(2)}
          </button>
          <p className="mt-4 text-xs text-text-tertiary">
            Secure payment powered by Stripe • Instant access after purchase
          </p>
        </div>
      </div>
    </div>
  );
}
