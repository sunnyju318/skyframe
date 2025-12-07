// ============================================================================
// Profile Screen — User Profile, Posts Grid, and Board Tab
// ============================================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import MasonryList from "@react-native-seoul/masonry-list";
import {
  getMyProfile,
  getMyPosts,
  getProfile,
  getUserPosts,
} from "../services/blueskyApi";
import { useInteraction } from "../contexts/InteractionContext";
import { formatCount } from "../utils/formatters";
import { useRoute, useNavigation } from "@react-navigation/native";
import { BlueskyFeedItem } from "../types";
import PostCard from "../components/PostCard";

// ============================================================================
// Component
// ============================================================================

export default function ProfileScreen() {
  // --------------------------------------------------------------------------
  // Navigation & Route params
  // --------------------------------------------------------------------------
  const navigation = useNavigation();
  const route = useRoute();
  const { followUser, unfollowUser, isFollowing, setFollowState } =
    useInteraction();
  const handle = (route.params as any)?.handle;
  const isMyProfile = !handle;
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<BlueskyFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"post" | "board">("post");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // --------------------------------------------------------------------------
  // Initial Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    loadProfileData();
  }, []);

  // --------------------------------------------------------------------------
  // Load Profile + User Posts
  // --------------------------------------------------------------------------
  const loadProfileData = async () => {
    try {
      // Load profile - conditional based on isMyProfile
      const profileData = isMyProfile
        ? await getMyProfile()
        : await getProfile(handle);
      setProfile(profileData);

      // Set follow state for visiting profile
      if (!isMyProfile && profileData.viewer && profileData.did) {
        setFollowState(profileData.did, profileData.viewer.following || null);
      }

      if (activeTab === "post") {
        // Load posts - conditional based on isMyProfile
        const postsData = isMyProfile
          ? await getMyPosts()
          : await getUserPosts(handle);
        setPosts(postsData.posts);
        setCursor(postsData.cursor);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Infinite Scroll — Load More Posts
  // --------------------------------------------------------------------------
  const loadMorePosts = async () => {
    if (loadingMore || !cursor) return;

    setLoadingMore(true);

    try {
      // Load more posts - conditional based on isMyProfile
      const response = isMyProfile
        ? await getMyPosts(cursor)
        : await getUserPosts(handle, cursor);

      if (!response || !response.posts || response.posts.length === 0) {
        setCursor(undefined); // No more posts
        return;
      }

      // Prevent duplicates
      const newPosts = response.posts.filter(
        (newPost) =>
          !posts.some(
            (existingPost) => existingPost.post.uri === newPost.post.uri
          )
      );

      setPosts([...posts, ...newPosts]);
      setCursor(response.cursor);
    } catch (error) {
      console.error("Error loading more:", error);
      setCursor(undefined);
    } finally {
      setLoadingMore(false);
    }
  };

  // --------------------------------------------------------------------------
  // Pull-to-refresh
  // --------------------------------------------------------------------------
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  // --------------------------------------------------------------------------
  // Handle Follow/Unfollow
  // --------------------------------------------------------------------------
  const handleFollowToggle = async () => {
    if (followLoading || !profile?.did) return;

    setFollowLoading(true);

    try {
      if (isFollowing(profile.did)) {
        // Unfollow
        await unfollowUser(profile.did);
      } else {
        // Follow
        await followUser(profile.did);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Render each post
  // --------------------------------------------------------------------------
  const renderItem = ({ item, i }: { item: any; i: number }) => {
    const feedItem = item as BlueskyFeedItem;
    const isLeftColumn = i % 2 === 0;

    return <PostCard feedItem={feedItem} isLeftColumn={isLeftColumn} />;
  };

  // --------------------------------------------------------------------------
  // Loading state
  // --------------------------------------------------------------------------
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4C4464" />
      </View>
    );
  }

  // ========================================================================
  // Main Render
  // ========================================================================
  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]} // Keeps tabs sticky
      >
        {/* -------------------------------------------------------------------
        Profile Header Section
        ------------------------------------------------------------------- */}
        <View className="items-center pt-60 pb-24 px-24 bg-white">
          {/* Avatar */}
          <Image
            source={{
              uri: profile?.avatar || "https://via.placeholder.com/150",
            }}
            style={{
              width: 90,
              height: 90,
              borderRadius: 100,
              marginBottom: 16,
            }}
          />

          {/* Name */}
          <Text className="text-h1 font-semibold text-gray-700">
            {profile?.name}
          </Text>

          {/* Handle */}
          <Text className="text-body text-gray-400 mt-8">
            {profile?.handle}
          </Text>

          {/* Stats */}
          <View className="flex-row items-center mt-12">
            <Text className="text-body text-gray-700">
              <Text className="font-semibold">
                {formatCount(profile?.postsCount || 0)}
              </Text>{" "}
              posts
            </Text>

            <Text className="text-body text-gray-300 mx-8">|</Text>

            <Text className="text-body text-gray-700">
              <Text className="font-semibold">
                {formatCount(profile?.followersCount || 0)}
              </Text>{" "}
              followers
            </Text>

            <Text className="text-body text-gray-300 mx-8">|</Text>

            <Text className="text-body text-gray-700">
              <Text className="font-semibold">
                {formatCount(profile?.followingCount || 0)}
              </Text>{" "}
              following
            </Text>
          </View>

          {/* Bio */}
          {profile?.bio && (
            <Text className="text-body text-gray-700 text-center mt-16 px-16">
              {profile.bio}
            </Text>
          )}

          {/* Action Buttons: Share / Edit Profile or Follow / More */}
          <View className="flex-row items-center gap-12 mt-20">
            <TouchableOpacity className="p-8">
              <Feather name="share-2" size={26} color="#221F32" />
            </TouchableOpacity>

            {isMyProfile ? (
              <TouchableOpacity className="bg-primary-900 rounded-20 px-40 py-12">
                <Text className="text-body font-semibold text-white">
                  Edit Profile
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className={`rounded-20 px-40 py-12 ${
                  isFollowing(profile?.did || "")
                    ? "bg-gray-200"
                    : "bg-primary-900"
                }`}
                onPress={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      isFollowing(profile?.did || "") ? "#343434" : "#FFFFFF"
                    }
                  />
                ) : (
                  <Text
                    className={`text-body font-semibold ${
                      isFollowing(profile?.did || "")
                        ? "text-gray-700"
                        : "text-white"
                    }`}
                  >
                    {isFollowing(profile?.did || "") ? "Following" : "Follow"}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity className="p-8">
              <Feather name="more-horizontal" size={26} color="#221F32" />
            </TouchableOpacity>
          </View>
        </View>

        {/* -------------------------------------------------------------------
           Tabs (Post / Board)
        ------------------------------------------------------------------- */}
        <View className="bg-white">
          <View className="flex-row px-16">
            {/* Posts Tab */}
            <TouchableOpacity
              className="flex-1 items-center pb-12"
              onPress={() => setActiveTab("post")}
            >
              <Text
                className={`text-body font-semibold ${
                  activeTab === "post" ? "text-gray-700" : "text-gray-500"
                }`}
              >
                Post
              </Text>

              {activeTab === "post" && (
                <View className="absolute bottom-0 left-0 right-0 h-1 bg-primary-300 rounded-full" />
              )}
            </TouchableOpacity>

            {/* Boards Tab */}
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

        {/* -------------------------------------------------------------------
           Content Area (Posts or Boards)
        ------------------------------------------------------------------- */}
        {activeTab === "post" ? (
          posts.length === 0 ? (
            // Empty State
            <View className="items-center justify-center py-60 px-24">
              <Text className="text-h2 font-semibold text-gray-500">
                No posts yet
              </Text>
              <Text className="text-body text-gray-400 mt-8 text-center">
                Share your first post to see it here
              </Text>
            </View>
          ) : (
            // Posts Grid
            <View style={{ minHeight: 400 }}>
              <MasonryList
                data={posts}
                keyExtractor={(item: any) => item.post.uri}
                numColumns={2}
                renderItem={renderItem}
                onEndReached={loadMorePosts}
                onEndReachedThreshold={0.5}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 24,
                  paddingBottom: 100,
                }}
              />
            </View>
          )
        ) : (
          // Boards Empty State
          <View className="items-center justify-center py-60 px-24">
            <Text className="text-h2 font-semibold text-gray-500">
              No boards yet
            </Text>
            <Text className="text-body text-gray-400 mt-8 text-center">
              Create boards to organize your saved posts
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Fixed Back Button - only show for visiting profile */}
      {!isMyProfile && (
        <View className="absolute top-58 left-20 z-10">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: "rgb(255, 255, 255)",
              borderRadius: 12,
              padding: 8,
            }}
          >
            <Feather name="chevron-left" size={28} color="#343434" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
