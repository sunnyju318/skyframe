// ============================================================================
// Number Formatters - Format large numbers for display
// ============================================================================

/**
 * Format count numbers (likes, comments, reposts, followers, etc.)
 * Examples:
 * - 999 → "999"
 * - 1000 → "1k"
 * - 4567 → "4.6k"
 * - 45678 → "45.7k"
 * - 1234567 → "1.2M"
 */
export const formatCount = (count: number): string => {
  if (count < 1000) {
    return count.toString();
  }

  if (count < 10000) {
    // 1k - 9.9k (show decimal)
    return `${(count / 1000).toFixed(1)}k`;
  }

  if (count < 1000000) {
    // 10k - 999k (no decimal)
    return `${Math.floor(count / 1000)}k`;
  }

  // 1M+ (show decimal)
  return `${(count / 1000000).toFixed(1)}M`;
};
