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
export const getTimelineFeed = async (): Promise<BlueskyFeedItem[]> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    const response = await agent.getTimeline({
      limit: 100,
    });

    // Filter posts with images only
    const postsWithImages = response.data.feed.filter((item) =>
      hasImages(item.post.embed)
    );

    console.log("Posts with images:", postsWithImages.length);
    return postsWithImages;
  } catch (error) {
    console.error("Error fetching timeline:", error);
    throw error;
  }
};

// Search posts
export const searchPosts = async (query: string): Promise<BlueskyPost[]> => {
  try {
    if (!agent.session) {
      throw new Error("Not authenticated. Please login first.");
    }

    const response = await agent.app.bsky.feed.searchPosts({
      q: query,
      limit: 50,
    });

    // Filter posts with images only
    const postsWithImages = response.data.posts.filter((item) =>
      hasImages(item.embed)
    );

    console.log("Search results:", response.data.posts.length, "posts");
    return postsWithImages;
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
