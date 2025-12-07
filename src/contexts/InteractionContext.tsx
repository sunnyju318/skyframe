// ============================================================================
// 🎯 InteractionContext — Global state for user interactions
// (Follow, Like, Repost, Save, etc.)
// ============================================================================

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  followUser as followUserApi,
  unfollowUser as unfollowUserApi,
  likePost as likePostApi,
  unlikePost as unlikePostApi,
  repostPost as repostPostApi,
  unrepostPost as unrepostPostApi,
} from "../services/blueskyApi";
// ============================================================================
// Types
// ============================================================================

interface InteractionContextType {
  // Follow state
  followedUsers: Map<string, string>; // Map<did, followUri>
  followUser: (did: string) => Promise<void>;
  unfollowUser: (did: string) => Promise<void>;
  isFollowing: (did: string) => boolean;
  getFollowUri: (did: string) => string | null;
  setFollowState: (did: string, followUri: string | null) => void;

  // Like state
  likedPosts: Map<string, string>; // Map<postUri, likeUri>
  likePost: (uri: string, cid: string) => Promise<void>;
  unlikePost: (uri: string) => Promise<void>;
  isLiked: (uri: string) => boolean;
  getLikeUri: (uri: string) => string | null;
  setLikeState: (uri: string, likeUri: string | null) => void;

  // Repost state
  repostedPosts: Map<string, string>; // Map<postUri, repostUri>
  repostPost: (uri: string, cid: string) => Promise<void>;
  unrepostPost: (uri: string) => Promise<void>;
  isReposted: (uri: string) => boolean;
  getRepostUri: (uri: string) => string | null;
  setRepostState: (uri: string, repostUri: string | null) => void;
}

interface InteractionProviderProps {
  children: ReactNode;
}

// ============================================================================
// Context
// ============================================================================

const InteractionContext = createContext<InteractionContextType | undefined>(
  undefined
);

// ============================================================================
// Provider
// ============================================================================

export function InteractionProvider({ children }: InteractionProviderProps) {
  // Global interaction state
  const [followedUsers, setFollowedUsers] = useState<Map<string, string>>(
    new Map()
  );
  const [likedPosts, setLikedPosts] = useState<Map<string, string>>(new Map());
  const [repostedPosts, setRepostedPosts] = useState<Map<string, string>>(
    new Map()
  );

  // --------------------------------------------------------------------------
  // Follow User
  // --------------------------------------------------------------------------
  const followUser = async (did: string): Promise<void> => {
    try {
      const followUri = await followUserApi(did);
      setFollowedUsers((prev) => new Map(prev).set(did, followUri));
      console.log("Followed user:", did);
    } catch (error) {
      console.error("Error following user:", error);
      throw error;
    }
  };

  // --------------------------------------------------------------------------
  // Unfollow User
  // --------------------------------------------------------------------------
  const unfollowUser = async (did: string): Promise<void> => {
    try {
      const followUri = followedUsers.get(did);
      if (!followUri) {
        console.warn("No follow URI found for:", did);
        return;
      }

      await unfollowUserApi(followUri);
      setFollowedUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(did);
        return newMap;
      });
      console.log("Unfollowed user:", did);
    } catch (error) {
      console.error("Error unfollowing user:", error);
      throw error;
    }
  };

  // --------------------------------------------------------------------------
  // Like Post
  // --------------------------------------------------------------------------
  const likePost = async (uri: string, cid: string): Promise<void> => {
    try {
      const likeUri = await likePostApi(uri, cid);
      setLikedPosts((prev) => new Map(prev).set(uri, likeUri));
      console.log("Liked post:", uri);
    } catch (error) {
      console.error("Error liking post:", error);
      throw error;
    }
  };

  // --------------------------------------------------------------------------
  // Unlike Post
  // --------------------------------------------------------------------------
  const unlikePost = async (uri: string): Promise<void> => {
    try {
      const likeUri = likedPosts.get(uri);
      if (!likeUri) {
        console.warn("⚠️ No like URI found for:", uri);
        return;
      }

      await unlikePostApi(likeUri);
      setLikedPosts((prev) => {
        const newMap = new Map(prev);
        newMap.delete(uri);
        return newMap;
      });
      console.log("Unliked post:", uri);
    } catch (error) {
      console.error("Error unliking post:", error);
      throw error;
    }
  };

  // --------------------------------------------------------------------------
  // Check if liked
  // --------------------------------------------------------------------------
  const isLiked = (uri: string): boolean => {
    return likedPosts.has(uri);
  };

  // --------------------------------------------------------------------------
  // Get like URI
  // --------------------------------------------------------------------------
  const getLikeUri = (uri: string): string | null => {
    return likedPosts.get(uri) || null;
  };

  // --------------------------------------------------------------------------
  // Set like state (for initialization from API)
  // --------------------------------------------------------------------------
  const setLikeState = (uri: string, likeUri: string | null): void => {
    if (likeUri) {
      setLikedPosts((prev) => new Map(prev).set(uri, likeUri));
    } else {
      setLikedPosts((prev) => {
        const newMap = new Map(prev);
        newMap.delete(uri);
        return newMap;
      });
    }
  };

  // --------------------------------------------------------------------------
  // Repost Post
  // --------------------------------------------------------------------------
  const repostPost = async (uri: string, cid: string): Promise<void> => {
    try {
      const repostUri = await repostPostApi(uri, cid);
      setRepostedPosts((prev) => new Map(prev).set(uri, repostUri));
      console.log("Reposted post:", uri);
    } catch (error) {
      console.error("Error reposting post:", error);
      throw error;
    }
  };

  // --------------------------------------------------------------------------
  // Unrepost Post
  // --------------------------------------------------------------------------
  const unrepostPost = async (uri: string): Promise<void> => {
    try {
      const repostUri = repostedPosts.get(uri);
      if (!repostUri) {
        console.warn("⚠️ No repost URI found for:", uri);
        return;
      }

      await unrepostPostApi(repostUri);
      setRepostedPosts((prev) => {
        const newMap = new Map(prev);
        newMap.delete(uri);
        return newMap;
      });
      console.log("Unreposted post:", uri);
    } catch (error) {
      console.error("Error unreposting post:", error);
      throw error;
    }
  };

  // --------------------------------------------------------------------------
  // Check if reposted
  // --------------------------------------------------------------------------
  const isReposted = (uri: string): boolean => {
    return repostedPosts.has(uri);
  };

  // --------------------------------------------------------------------------
  // Get repost URI
  // --------------------------------------------------------------------------
  const getRepostUri = (uri: string): string | null => {
    return repostedPosts.get(uri) || null;
  };

  // --------------------------------------------------------------------------
  // Set repost state (for initialization from API)
  // --------------------------------------------------------------------------
  const setRepostState = (uri: string, repostUri: string | null): void => {
    if (repostUri) {
      setRepostedPosts((prev) => new Map(prev).set(uri, repostUri));
    } else {
      setRepostedPosts((prev) => {
        const newMap = new Map(prev);
        newMap.delete(uri);
        return newMap;
      });
    }
  };

  // --------------------------------------------------------------------------
  // Check if following
  // --------------------------------------------------------------------------
  const isFollowing = (did: string): boolean => {
    return followedUsers.has(did);
  };

  // --------------------------------------------------------------------------
  // Get follow URI
  // --------------------------------------------------------------------------
  const getFollowUri = (did: string): string | null => {
    return followedUsers.get(did) || null;
  };

  // --------------------------------------------------------------------------
  // Set follow state (for initialization from API)
  // --------------------------------------------------------------------------
  const setFollowState = (did: string, followUri: string | null): void => {
    if (followUri) {
      setFollowedUsers((prev) => new Map(prev).set(did, followUri));
    } else {
      setFollowedUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(did);
        return newMap;
      });
    }
  };

  // --------------------------------------------------------------------------
  // Context value
  // --------------------------------------------------------------------------
  const value: InteractionContextType = {
    followedUsers,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowUri,
    setFollowState,

    likedPosts,
    likePost,
    unlikePost,
    isLiked,
    getLikeUri,
    setLikeState,

    repostedPosts,
    repostPost,
    unrepostPost,
    isReposted,
    getRepostUri,
    setRepostState,
  };

  return (
    <InteractionContext.Provider value={value}>
      {children}
    </InteractionContext.Provider>
  );
}

// ============================================================================
// Hook — useInteraction
// ============================================================================

export function useInteraction(): InteractionContextType {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error("useInteraction must be used within InteractionProvider");
  }
  return context;
}
