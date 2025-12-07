// ============================================================================
// 🎯 InteractionContext — Global state for user interactions
// (Follow, Like, Repost, Save, etc.)
// ============================================================================

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  followUser as followUserApi,
  unfollowUser as unfollowUserApi,
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
