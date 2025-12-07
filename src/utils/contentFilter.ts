// ============================================================================
// Content Filter — Filter inappropriate content using Bluesky labels
// ============================================================================

import { BlueskyPost } from "../types";

// --------------------------------------------------------------------------
// Bluesky Content Labels (Official moderation labels)
// --------------------------------------------------------------------------
const BLOCKED_LABELS = ["porn", "sexual", "nudity", "graphic-media", "!hide"];

// --------------------------------------------------------------------------
// Backup blocklist for hashtags (common explicit terms)
// --------------------------------------------------------------------------
const BLOCKED_HASHTAG_WORDS = [
  "nsfw",
  "porn",
  "xxx",
  "adult",
  "nude",
  "naked",
  "onlyfans",
  "sex",
  "sexy",
];

// --------------------------------------------------------------------------
// Check if post has blocked labels
// --------------------------------------------------------------------------
const hasBlockedLabels = (post: BlueskyPost): boolean => {
  if (!post.labels || post.labels.length === 0) return false;

  return post.labels.some((label) =>
    BLOCKED_LABELS.includes(label.val?.toLowerCase() || "")
  );
};

// --------------------------------------------------------------------------
// Check if hashtag contains blocked words
// --------------------------------------------------------------------------
const containsBlockedWord = (tag: string): boolean => {
  const lowerTag = tag.toLowerCase();
  return BLOCKED_HASHTAG_WORDS.some((word) => lowerTag.includes(word));
};

// --------------------------------------------------------------------------
// Validate hashtag quality
// --------------------------------------------------------------------------
const isValidHashtag = (tag: string): boolean => {
  const cleanTag = tag.startsWith("#") ? tag.slice(1) : tag;

  // Minimum length
  if (cleanTag.length < 2) return false;

  // Maximum length
  if (cleanTag.length > 30) return false;

  // Must contain at least one letter
  if (!/[a-zA-Z가-힣]/.test(cleanTag)) return false;

  // Check blocklist
  if (containsBlockedWord(cleanTag)) return false;

  return true;
};

// --------------------------------------------------------------------------
// Filter posts array (remove posts with blocked labels)
// --------------------------------------------------------------------------
export const filterPosts = (posts: BlueskyPost[]): BlueskyPost[] => {
  return posts.filter((post) => !hasBlockedLabels(post));
};

// --------------------------------------------------------------------------
// Filter hashtags array
// --------------------------------------------------------------------------
export const filterHashtags = (tags: string[]): string[] => {
  return tags.filter((tag) => isValidHashtag(tag));
};

// --------------------------------------------------------------------------
// Check if single post is safe
// --------------------------------------------------------------------------
export const isSafePost = (post: BlueskyPost): boolean => {
  return !hasBlockedLabels(post);
};

// --------------------------------------------------------------------------
// Check if single hashtag is safe
// --------------------------------------------------------------------------
export const isSafeHashtag = (tag: string): boolean => {
  return isValidHashtag(tag);
};
