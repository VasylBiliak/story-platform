/**
 * Centralized pricing service for all pricing calculations.
 * This is the SINGLE SOURCE OF TRUTH for pricing logic.
 * Frontend must NOT calculate pricing independently.
 */

/**
 * Calculate the final price after discount.
 * Formula: finalPrice = price * (1 - discount / 100)
 * 
 * @param price - Base price in USD
 * @param discount - Discount percentage (0-100)
 * @returns Final price rounded to 2 decimal places, minimum 0
 */
export function calculateFinalPrice(price: number, discount: number = 0): number {
  const finalPrice = price * (1 - discount / 100);
  return Math.max(0, Math.round(finalPrice * 100) / 100);
}

/**
 * Determine if a chapter is free based on price.
 * A chapter is free if its price is exactly 0.
 * 
 * @param price - Base price in USD
 * @returns true if price is 0, false otherwise
 */
export function calculateIsFree(price: number): boolean {
  return price === 0;
}

/**
 * Normalize chapter pricing data to ensure consistency.
 * Enforces business rules:
 * - Free chapters must have price = 0 and discount = 0
 * - Discount must be between 0 and 100
 * - Price must be non-negative
 * 
 * @param isFree - Whether the chapter is marked as free
 * @param price - Base price in USD
 * @param discount - Discount percentage (0-100)
 * @returns Normalized pricing data
 */
export function normalizeChapterPricing(
  isFree: boolean | undefined,
  price: number | undefined,
  discount: number | undefined
): { price: number; discount: number; isFree: boolean } {
  // If explicitly marked as free, enforce free chapter rules
  if (isFree) {
    return {
      isFree: true,
      price: 0,
      discount: 0,
    };
  }

  // Otherwise, use provided values with defaults
  const normalizedPrice = price ?? 0;
  
  // Clamp discount to valid range [0, 100]
  const normalizedDiscount = Math.max(0, Math.min(100, discount ?? 0));

  // Determine isFree based on final price
  const calculatedIsFree = calculateIsFree(normalizedPrice);

  return {
    isFree: calculatedIsFree,
    price: normalizedPrice,
    discount: calculatedIsFree ? 0 : normalizedDiscount,
  };
}

/**
 * Apply computed pricing fields to a chapter object.
 * This adds isFree and finalPrice to the chapter without modifying the database.
 * 
 * @param chapter - Chapter object from Prisma
 * @returns Chapter with computed fields
 */
export function applyComputedPricing<T extends { price: number; discount?: number | null }>(
  chapter: T
): T & { isFree: boolean; finalPrice: number } {
  const isFree = calculateIsFree(chapter.price);
  const finalPrice = calculateFinalPrice(chapter.price, chapter.discount ?? 0);

  return {
    ...chapter,
    isFree,
    finalPrice,
  };
}

/**
 * Apply computed pricing fields to an array of chapters.
 * 
 * @param chapters - Array of chapter objects from Prisma
 * @returns Chapters with computed fields
 */
export function applyComputedPricingToChapters<
  T extends { price: number; discount?: number | null }
>(chapters: T[]): (T & { isFree: boolean; finalPrice: number })[] {
  return chapters.map(applyComputedPricing);
}
