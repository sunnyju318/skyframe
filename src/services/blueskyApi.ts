// Bluesky (AT Protocol) API client
import { agent } from "./authService"; // Use shared agent
import { BlueskyFeedItem, BlueskyPost, BlueskyImageEmbed } from "../types";

// Type guard to check if embed has images
function hasImages(embed: any): embed is BlueskyImageEmbed {
  return (
    embed &&
    typeof embed === "object" &&
    "images" in embed &&
    Array.isArray(embed.images) &&
    embed.images.length > 0
  );
}

// Get timeline feed
export const getTimelineFeed = async (
  cursor?: string
): Promise<{ feed: BlueskyFeedItem[]; cursor?: string }> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    const response = await agent.getTimeline({
      limit: 30,
      cursor: cursor,
    });

    // Filter posts with images only
    const postsWithImages = response.data.feed.filter((item) =>
      hasImages(item.post.embed)
    );

    console.log("Posts with images:", postsWithImages.length);

    return {
      feed: postsWithImages,
      cursor: response.data.cursor,
    };
  } catch (error) {
    console.error("Error fetching timeline:", error);
    throw error;
  }
};

// Get discover/popular feed
export const getDiscoverFeed = async (
  cursor?: string
): Promise<{ feed: BlueskyFeedItem[]; cursor?: string }> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    const response = await agent.app.bsky.feed.getFeed({
      feed: "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot",
      limit: 30,
      cursor: cursor,
    });

    // Filter posts with images only
    const postsWithImages = response.data.feed.filter((item) =>
      hasImages(item.post.embed)
    );

    console.log("Discover posts with images:", postsWithImages.length);

    return {
      feed: postsWithImages,
      cursor: response.data.cursor,
    };
  } catch (error) {
    console.error("Error fetching discover feed:", error);
    throw error;
  }
};

// Search posts
export const searchPosts = async (
  query: string,
  cursor?: string
): Promise<{ posts: BlueskyPost[]; cursor?: string }> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    const response = await agent.app.bsky.feed.searchPosts({
      q: query,
      limit: 30,
      cursor: cursor,
    });

    // Filter posts with images only
    const postsWithImages = response.data.posts.filter((item) =>
      hasImages(item.embed)
    );

    console.log("Search results:", postsWithImages.length);

    return {
      posts: postsWithImages,
      cursor: response.data.cursor,
    };
  } catch (error) {
    console.error("Error searching posts:", error);
    throw error;
  }
};

// Get my profile
export const getMyProfile = async () => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    // Get current user's DID
    const myDid = agent.session.did;

    // Fetch profile
    const response = await agent.getProfile({
      actor: myDid,
    });

    console.log("My profile loaded:", response.data.handle);

    // Return formatted profile data
    return {
      name: response.data.displayName || response.data.handle,
      handle: "@" + response.data.handle,
      avatar: response.data.avatar || "https://via.placeholder.com/150",
      bio: response.data.description || "",
      postsCount: response.data.postsCount || 0,
      followersCount: response.data.followersCount || 0,
      followingCount: response.data.followsCount || 0,
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

// Get trending hashtags from What's Hot feed
export const getTrendingHashtags = async (): Promise<string[]> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    // Get What's Hot feed (more posts for better analysis)
    const response = await agent.app.bsky.feed.getFeed({
      feed: "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot",
      limit: 100,
    });

    // Extract hashtags from all posts
    const hashtagCounts = new Map<string, number>();

    response.data.feed.forEach((item) => {
      const text = item.post.record.text || "";

      if (!text || typeof text !== "string") return;

      // Find all hashtags (#word)
      const hashtags = text.match(/#[\w가-힣]+/g) || [];

      hashtags.forEach((tag) => {
        // Remove # and convert to lowercase
        const cleanTag = tag.slice(1).toLowerCase();

        // Count frequency
        hashtagCounts.set(cleanTag, (hashtagCounts.get(cleanTag) || 0) + 1);
      });
    });

    // Sort by frequency and get top 8
    const trending = Array.from(hashtagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);

    console.log("Trending hashtags:", trending);
    return trending;
  } catch (error) {
    console.error("Error fetching trending hashtags:", error);

    // Fallback keywords if API fails
    return [
      "art",
      "photography",
      "design",
      "illustration",
      "nature",
      "cats",
      "food",
      "travel",
    ];
  }
};
