// ============================================================================
// Bluesky (AT Protocol) API Client
// Centralized API calls for timeline, discover feed, search, profile, hashtags
// ============================================================================

import { agent } from "./authService"; // Shared authenticated agent
import {
  BlueskyFeedItem,
  BlueskyPost,
  BlueskyImageEmbed,
  ProfileData,
} from "../types";

// ============================================================================
// Type Guard — Check if embed contains images
// ============================================================================

/**
 * Determines whether a given embed contains valid image data.
 */
function hasImages(embed: any): embed is BlueskyImageEmbed {
  return (
    embed &&
    typeof embed === "object" &&
    "images" in embed &&
    Array.isArray(embed.images) &&
    embed.images.length > 0
  );
}

// ============================================================================
// Timeline Feed — Home Feed
// ============================================================================

/**
 * Fetches the user's timeline feed.
 * Filters results so only posts that contain images are returned.
 */
export const getTimelineFeed = async (
  cursor?: string
): Promise<{ feed: BlueskyFeedItem[]; cursor?: string }> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    const response = await agent.getTimeline({
      limit: 30,
      cursor,
    });

    // Only include posts that contain images
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

// ============================================================================
// Discover Feed (What's Hot)
// ============================================================================

/**
 * Fetches the "What's Hot" discover feed.
 * Filters results to only include posts with images.
 */
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
      cursor,
    });

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

// ============================================================================
// Search Posts
// ============================================================================

/**
 * Searches Bluesky posts by keyword.
 * Returns only posts that contain image data.
 */
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
      cursor,
    });

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

// ============================================================================
// My Profile
// ============================================================================

/**
 * Fetches and returns the authenticated user's profile info.
 */
export const getMyProfile = async (): Promise<ProfileData> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    const myDid = agent.session.did;

    const response = await agent.getProfile({
      actor: myDid,
    });

    console.log("My profile loaded:", response.data.handle);

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

// ============================================================================
// Get Other User's Profile (Visiting Profile)
// ============================================================================
export const getProfile = async (handle: string): Promise<ProfileData> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    const response = await agent.getProfile({
      actor: handle,
    });

    console.log("Profile loaded:", response.data.handle);

    return {
      name: response.data.displayName || response.data.handle,
      handle: "@" + response.data.handle,
      avatar: response.data.avatar || "https://via.placeholder.com/150",
      bio: response.data.description || "",
      postsCount: response.data.postsCount || 0,
      followersCount: response.data.followersCount || 0,
      followingCount: response.data.followsCount || 0,
      did: response.data.did, // Add DID for follow
      viewer: response.data.viewer, // Add viewer info
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

// ============================================================================
// Get my posts (author feed)
// ============================================================================
export const getMyPosts = async (
  cursor?: string
): Promise<{
  posts: BlueskyFeedItem[];
  cursor?: string;
}> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    // Get current user's DID
    const myDid = agent.session.did;

    const response = await agent.getAuthorFeed({
      actor: myDid,
      limit: 30,
      cursor: cursor,
    });

    // Filter posts with images only
    const postsWithImages = response.data.feed.filter((item) =>
      hasImages(item.post.embed)
    );

    console.log("My posts with images:", postsWithImages.length);

    return {
      posts: postsWithImages,
      cursor: response.data.cursor,
    };
  } catch (error) {
    console.error("Error fetching my posts:", error);
    throw error;
  }
};

// ============================================================================
// Get Other User's Posts (Author Feed)
// ============================================================================
export const getUserPosts = async (
  handle: string,
  cursor?: string
): Promise<{
  posts: BlueskyFeedItem[];
  cursor?: string;
}> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    const response = await agent.getAuthorFeed({
      actor: handle,
      limit: 30,
      cursor: cursor,
    });

    // Filter posts with images only
    const postsWithImages = response.data.feed.filter((item) =>
      hasImages(item.post.embed)
    );

    console.log("User posts with images:", postsWithImages.length);

    return {
      posts: postsWithImages,
      cursor: response.data.cursor,
    };
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
};

// ============================================================================
// #️Trending Hashtags  (short-term)
// ============================================================================

// Get trending hashtags from What's Hot feed
export const getTrendingHashtags = async (): Promise<string[]> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    const response = await agent.app.bsky.feed.getFeed({
      feed: "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot",
      limit: 50,
    });

    const hashtagCounts = new Map<string, number>();

    response.data.feed.forEach((item) => {
      const text = item.post.record.text || "";
      if (!text || typeof text !== "string") return;

      const hashtags = text.match(/#[\w가-힣]+/g) || [];

      hashtags.forEach((tag) => {
        const cleanTag = tag.slice(1).toLowerCase();
        hashtagCounts.set(cleanTag, (hashtagCounts.get(cleanTag) || 0) + 1);
      });
    });

    const trending = Array.from(hashtagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([tag]) => tag);

    console.log("Trending hashtags (short-term):", trending);
    return trending;
  } catch (error) {
    console.error("Error fetching trending hashtags:", error);
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

// ============================================================================
// #️Trending Hashtags (long-term)
// ============================================================================

// Get popular categories from larger sample
export const getPopularCategories = async (): Promise<string[]> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    const hashtagCounts = new Map<string, number>();
    let cursor: string | undefined = undefined;

    for (let i = 0; i < 3; i++) {
      const response = await agent.app.bsky.feed.getFeed({
        feed: "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot",
        limit: 100,
        cursor: cursor,
      });

      response.data.feed.forEach((item) => {
        const text = item.post.record.text || "";
        if (!text || typeof text !== "string") return;

        const hashtags = text.match(/#[\w가-힣]+/g) || [];

        hashtags.forEach((tag) => {
          const cleanTag = tag.slice(1).toLowerCase();
          hashtagCounts.set(cleanTag, (hashtagCounts.get(cleanTag) || 0) + 1);
        });
      });

      cursor = response.data.cursor;
      if (!cursor) break;
    }

    const categories = Array.from(hashtagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([tag]) => tag);

    console.log("Popular categories (long-term):", categories);
    return categories;
  } catch (error) {
    console.error("Error fetching popular categories:", error);
    return [
      "art",
      "photography",
      "nature",
      "cats",
      "food",
      "design",
      "illustration",
    ];
  }
};

// ============================================================================
// Notifications
// ============================================================================

// Get notifications
export const getNotifications = async (
  cursor?: string
): Promise<{
  notifications: any[];
  cursor?: string;
}> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    const response = await agent.listNotifications({
      limit: 30,
      cursor: cursor,
    });

    console.log("Notifications:", response.data.notifications.length);

    return {
      notifications: response.data.notifications,
      cursor: response.data.cursor,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

// ============================================================================
// Follow User
// ============================================================================
export const followUser = async (did: string): Promise<string> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    const response = await agent.follow(did);
    console.log("Followed user:", did);

    return response.uri; // Return follow record URI
  } catch (error) {
    console.error("Error following user:", error);
    throw error;
  }
};

// ============================================================================
// Unfollow User
// ============================================================================
export const unfollowUser = async (followUri: string): Promise<void> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    await agent.deleteFollow(followUri);
    console.log("Unfollowed user");
  } catch (error) {
    console.error("Error unfollowing user:", error);
    throw error;
  }
};

// ============================================================================
// Like Post
// ============================================================================
export const likePost = async (uri: string, cid: string): Promise<string> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    const response = await agent.like(uri, cid);
    console.log("Liked post:", uri);

    return response.uri; // Return like record URI
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
};

// ============================================================================
// Unlike Post
// ============================================================================
export const unlikePost = async (likeUri: string): Promise<void> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    await agent.deleteLike(likeUri);
    console.log("Unliked post");
  } catch (error) {
    console.error("Error unliking post:", error);
    throw error;
  }
};

// ============================================================================
// Repost Post
// ============================================================================
export const repostPost = async (uri: string, cid: string): Promise<string> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    const response = await agent.repost(uri, cid);
    console.log("Reposted post:", uri);

    return response.uri; // Return repost record URI
  } catch (error) {
    console.error("Error reposting post:", error);
    throw error;
  }
};

// ============================================================================
// Unrepost Post
// ============================================================================
export const unrepostPost = async (repostUri: string): Promise<void> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    await agent.deleteRepost(repostUri);
    console.log("Unreposted post");
  } catch (error) {
    console.error("Error unreposting post:", error);
    throw error;
  }
};
