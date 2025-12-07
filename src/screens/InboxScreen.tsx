// ============================================================================
// 📥 InboxScreen — Bluesky notifications (All / Board tabs)
// ============================================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { getNotifications } from "../services/blueskyApi";

// ============================================================================
// Component
// ============================================================================

export default function InboxScreen() {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "board">("all");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);

  // ========================================================================
  // Initial load / tab change
  // ========================================================================
  useEffect(() => {
    if (activeTab === "all") {
      loadNotifications();
    }
  }, [activeTab]);

  // ========================================================================
  // Load notifications (first page)
  // ========================================================================
  const loadNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.notifications);
      setCursor(response.cursor);
    } catch (error: any) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // Load more notifications (pagination)
  // ========================================================================
  const loadMoreNotifications = async () => {
    if (loadingMore || !cursor) return;

    setLoadingMore(true);

    try {
      const response = await getNotifications(cursor);

      if (
        !response ||
        !response.notifications ||
        response.notifications.length === 0
      ) {
        setCursor(undefined);
        return;
      }

      setNotifications((prev) => [...prev, ...response.notifications]);
      setCursor(response.cursor);
    } catch (error: any) {
      console.error("Error loading more notifications:", error);
      setCursor(undefined); // stop further pagination on error
    } finally {
      setLoadingMore(false);
    }
  };

  // ========================================================================
  // Pull-to-refresh
  // ========================================================================
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  // ========================================================================
  // Format Time
  // ========================================================================
  const formatTimeAgo = (
    dateString: string
  ): { text: string; isNow: boolean } => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);

    if (diffMin < 1) return { text: "Now", isNow: true };
    if (diffMin < 60) return { text: `${diffMin}m`, isNow: false };
    if (diffHour < 24) return { text: `${diffHour}h`, isNow: false };
    if (diffDay < 7) return { text: `${diffDay}d`, isNow: false };
    if (diffWeek < 4) return { text: `${diffWeek}w`, isNow: false };
    return { text: `${diffMonth}mo`, isNow: false };
  };

  // ========================================================================
  // Render single notification row
  // ========================================================================
  const renderNotification = ({ item }: { item: any }) => {
    const author = item.author;
    const timeAgo = formatTimeAgo(item.indexedAt);
    const isUnread = !item.isRead;

    // 액션 텍스트
    let actionText = "";
    if (item.reason === "follow") actionText = "followed you";
    if (item.reason === "like") actionText = "liked your post";
    if (item.reason === "repost") actionText = "reposted your post";
    if (item.reason === "mention") actionText = "mentioned you";
    if (item.reason === "reply") actionText = "replied to your post";

    // 오른쪽 요소 (Follow 버튼 or 포스트 이미지)
    const showFollowButton = item.reason === "follow";
    const showPostImage =
      item.reason === "repost" ||
      item.reason === "like" ||
      item.reason === "reply";
    const postImage = item.record?.embed?.images?.[0]?.thumb;

    return (
      <View
        className={`flex-row px-16 py-12 ${
          isUnread ? "bg-gray-100" : "bg-white"
        }`}
      >
        {/* Avatar */}
        <Image
          source={{ uri: author.avatar || "https://via.placeholder.com/48" }}
          className="w-36 h-36 rounded-full self-center"
        />

        {/* Content */}
        <View className="flex-1 ml-12 justify-center">
          {/* Name */}
          <Text className="text-body font-semibold text-gray-700">
            {author.displayName || author.handle}
          </Text>

          {/* Action + Time */}
          <View className="flex-row items-center mt-4">
            <Text className="text-body-small text-gray-500">{actionText}</Text>
            <Text className="text-body-small mx-4 text-gray-500">.</Text>
            <Text
              className={`text-body-small ${
                timeAgo.isNow ? "text-blue" : "text-gray-500"
              }`}
            >
              {timeAgo.text}
            </Text>
          </View>
        </View>

        {/* Right Element */}
        {showFollowButton &&
          (author.viewer?.following ? (
            <TouchableOpacity className="bg-gray-200 rounded-20 px-16 py-8 self-center">
              <Text className="text-body-small text-gray-700">Following</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity className="bg-primary-700 rounded-20 px-16 py-8 self-center">
              <Text className="text-body-small text-white font-semibold">
                Follow +
              </Text>
            </TouchableOpacity>
          ))}

        {showPostImage && postImage && (
          <Image
            source={{ uri: postImage }}
            className="w-48 h-48 rounded-lg self-center"
            resizeMode="cover"
          />
        )}
      </View>
    );
  };

  // ========================================================================
  // Loading state
  // ========================================================================
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4C4464" />
        <Text className="text-body text-gray-500 mt-16">Loading...</Text>
      </View>
    );
  }

  // ========================================================================
  // UI Layout
  // ========================================================================
  return (
    <View className="flex-1 bg-white">
      {/* ================================================================
          Header
          ================================================================ */}
      <View className="bg-white  pt-58">
        {/* Title */}
        <View className="px-16 py-16">
          <Text className="text-h2 font-semibold text-gray-700">Inbox</Text>
        </View>

        {/* Tabs */}
        <View className="flex-row px-16">
          {/* All Tab */}
          <TouchableOpacity
            className="flex-1 items-center pb-12"
            onPress={() => setActiveTab("all")}
          >
            <Text
              className={`text-body font-semibold ${
                activeTab === "all" ? "text-gray-700" : "text-gray-500"
              }`}
            >
              All
            </Text>
            {activeTab === "all" && (
              <View className="absolute bottom-0 left-0 right-0 h-1 bg-primary-300 rounded-full" />
            )}
          </TouchableOpacity>

          {/* Board Tab */}
          <TouchableOpacity
            className="flex-1 items-center pb-12"
            onPress={() => setActiveTab("board")}
          >
            <Text
              className={`text-body font-semibold ${
                activeTab === "board" ? "text-gray-700" : "text-gray-500"
              }`}
            >
              Board
            </Text>
            {activeTab === "board" && (
              <View className="absolute bottom-0 left-0 right-0 h-1 bg-primary-300 rounded-full" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ================================================================
          Content — All vs Board tab
          ================================================================ */}
      {activeTab === "all" ? (
        notifications.length === 0 ? (
          // Empty state — All tab
          <View className="flex-1 items-center justify-center px-24">
            <Text className="text-h2 font-semibold text-gray-500">
              No notifications yet
            </Text>
            <Text className="text-body text-gray-400 mt-8 text-center">
              You'll see notifications here when someone interacts with you
            </Text>
          </View>
        ) : (
          // List of notifications
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item, index) => `${item.uri}-${index}`}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onEndReached={loadMoreNotifications}
            onEndReachedThreshold={0.5}
          />
        )
      ) : (
        // Placeholder for future "Board" notifications
        <View className="flex-1 items-center justify-center px-24">
          <Text className="text-h2 font-semibold text-gray-500">
            No board notifications
          </Text>
          <Text className="text-body text-gray-400 mt-8 text-center">
            Board notifications will appear here
          </Text>
        </View>
      )}
    </View>
  );
}
