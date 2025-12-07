// Home screen with masonry feed layout

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

export default function HomeScreen() {
  const [posts, setPosts] = useState<BlueskyFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"discover" | "following">(
    "discover"
  );
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load feed on mount
  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      // Load different feed based on active tab
      const response =
        activeTab === "discover"
          ? await getDiscoverFeed()
          : await getTimelineFeed();

      setPosts(response.feed);
      setCursor(response.cursor);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore || !cursor) return;

    setLoadingMore(true);

    try {
      const response =
        activeTab === "discover"
          ? await getDiscoverFeed(cursor)
          : await getTimelineFeed(cursor);

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
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  // Render individual post card
  const renderItem = ({ item, i }: { item: any; i: number }) => {
    const feedItem = item as BlueskyFeedItem;
    const isLeftColumn = i % 2 === 0;

    return <PostCard feedItem={feedItem} isLeftColumn={isLeftColumn} />;
  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4C4464" />
        <Text className="text-body text-gray-500 mt-16">Loading feed...</Text>
      </View>
    );
  }

  // Empty state
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

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
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

      {/* Masonry Feed */}
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
