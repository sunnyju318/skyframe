// Bluesky (AT Protocol) API client
import { AtpAgent } from "@atproto/api";
import Constants from "expo-constants";
import { BlueskyFeedItem, BlueskyPost, BlueskyImageEmbed } from "../types";

// Create Bluesky agent instance
const agent = new AtpAgent({
  service: "https://bsky.social",
});

// Authentication credentials from environment variables
const BLUESKY_IDENTIFIER = Constants.expoConfig?.extra?.blueskyIdentifier;
const BLUESKY_PASSWORD = Constants.expoConfig?.extra?.blueskyPassword;

// Check environment variables
if (!BLUESKY_IDENTIFIER || !BLUESKY_PASSWORD) {
  console.error("Bluesky credentials not found in environment variables");
}

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

// Login function
export const loginToBluesky = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    await agent.login({
      identifier: BLUESKY_IDENTIFIER,
      password: BLUESKY_PASSWORD,
    });
    console.log("Bluesky login successful");
    return { success: true };
  } catch (error: any) {
    console.error("Bluesky login failed:", error);
    return { success: false, error: error.message };
  }
};

// Get timeline feed
export const getTimelineFeed = async (): Promise<BlueskyFeedItem[]> => {
  try {
    // Login if not already logged in
    if (!agent.session) {
      const loginResult = await loginToBluesky();
      if (!loginResult.success) {
        throw new Error("Login failed");
      }
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
    // Login if not already logged in
    if (!agent.session) {
      const loginResult = await loginToBluesky();
      if (!loginResult.success) {
        throw new Error("Login failed");
      }
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
    // Login if not already logged in
    if (!agent.session) {
      const loginResult = await loginToBluesky();
      if (!loginResult.success) {
        throw new Error("Login failed");
      }
    }

    // Check if session exists after login
    if (!agent.session) {
      throw new Error("No active session");
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
