// ============================================================================
// 🏠 HomeScreen — Discover & Following Feed with Masonry Layout
// ============================================================================

import PostCard from "../components/PostCard";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
import { getTimelineFeed, getDiscoverFeed } from "../services/blueskyApi";
import { BlueskyFeedItem } from "../types";

// ============================================================================
// Component
// ============================================================================

export default function HomeScreen() {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  const [posts, setPosts] = useState<BlueskyFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"discover" | "following">(
    "discover"
  );
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);

  // --------------------------------------------------------------------------
  // Initial Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    loadFeed();
  }, []);

  // --------------------------------------------------------------------------
  // Load Feed (Discover or Following)
  // --------------------------------------------------------------------------
  const loadFeed = async () => {
    try {
      const response =
        activeTab === "discover"
          ? await getDiscoverFeed()
          : await getTimelineFeed();

      if (!response.feed || response.feed.length === 0) {
        setPosts([]);
        setCursor(undefined);
        console.log("No posts available in this feed");
      } else {
        setPosts(response.feed);
        setCursor(response.cursor);
      }
    } catch (error: any) {
      console.error("Error loading feed:", error);
      Alert.alert("Error", "Failed to load feed. Please try again.");
      setPosts([]);
      setCursor(undefined);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Pagination — Load More Posts
  // --------------------------------------------------------------------------
  const loadMorePosts = async () => {
    if (loadingMore || !cursor) return;

    setLoadingMore(true);
    try {
      const response =
        activeTab === "discover"
          ? await getDiscoverFeed(cursor)
          : await getTimelineFeed(cursor);

      if (!response.feed || response.feed.length === 0) {
        console.log("No more posts available");
        setCursor(undefined);
        return;
      }

      // Remove duplicates
      const newPosts = response.feed.filter(
        (newPost) =>
          !posts.some(
            (existingPost) => existingPost.post.uri === newPost.post.uri
          )
      );

      setPosts([...posts, ...newPosts]);
      setCursor(response.cursor);
    } catch (error: any) {
      console.error("Error loading more:", error);
      setCursor(undefined);
    } finally {
      setLoadingMore(false);
    }
  };

  // --------------------------------------------------------------------------
  // Pull to Refresh
  // --------------------------------------------------------------------------
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  // --------------------------------------------------------------------------
  // Render each masonry item
  // --------------------------------------------------------------------------
  const renderItem = ({ item, i }: { item: any; i: number }) => {
    const feedItem = item as BlueskyFeedItem;
    const isLeftColumn = i % 2 === 0;

    return <PostCard feedItem={feedItem} isLeftColumn={isLeftColumn} />;
  };

  // --------------------------------------------------------------------------
  // Loading State
  // --------------------------------------------------------------------------
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4C4464" />
        <Text className="text-body text-gray-500 mt-16">Loading feed...</Text>
      </View>
    );
  }

  // --------------------------------------------------------------------------
  // Empty State
  // --------------------------------------------------------------------------
  if (posts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-24">
        <Text className="text-h2 font-semibold text-gray-700">
          No posts found
        </Text>
        <Text className="text-body text-gray-500 mt-8 text-center">
          Follow some accounts or check back later
        </Text>
      </View>
    );
  }

  // ============================================================================
  // UI — Header + Tabs + Masonry Feed
  // ============================================================================

  return (
    <View className="flex-1 bg-gray-50">
      {/* ------------------------------------------------------------
          Header (Logo + Tabs)
          ------------------------------------------------------------ */}
      <View className="bg-white border-b border-gray-200 pt-58">
        {/* Logo */}
        <View className="items-center py-16">
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
        </View>

        {/* Tabs */}
        <View className="flex-row px-16">
          {/* Discover Tab */}
          <TouchableOpacity
            className="flex-1 items-center pb-12"
            onPress={() => {
              setActiveTab("discover");
              loadFeed();
            }}
          >
            <Text
              className={`text-body font-semibold ${
                activeTab === "discover" ? "text-gray-700" : "text-gray-500"
              }`}
            >
              Discover
            </Text>
            {activeTab === "discover" && (
              <View className="absolute bottom-0 left-0 right-0 h-1 bg-primary-300 rounded-full" />
            )}
          </TouchableOpacity>

          {/* Following Tab */}
          <TouchableOpacity
            className="flex-1 items-center pb-12"
            onPress={() => {
              setActiveTab("following");
              loadFeed();
            }}
          >
            <Text
              className={`text-body font-semibold ${
                activeTab === "following" ? "text-gray-700" : "text-gray-500"
              }`}
            >
              Following
            </Text>
            {activeTab === "following" && (
              <View className="absolute bottom-0 left-0 right-0 h-1 bg-primary-300 rounded-full" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ------------------------------------------------------------
          Masonry Feed
          ------------------------------------------------------------ */}
      <MasonryList
        key={activeTab}
        data={posts}
        keyExtractor={(item: any) => item.post.uri}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 24,
        }}
      />
    </View>
  );
}
