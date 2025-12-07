// ============================================================================
// Post Detail Screen — Single post view with interactions
// ============================================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  StackActions,
} from "@react-navigation/native";
import { searchPosts } from "../services/blueskyApi";
import { BlueskyPost } from "../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation.types";
import MasonryList from "@react-native-seoul/masonry-list";
import { getDiscoverFeed } from "../services/blueskyApi";
import PostCard from "../components/PostCard";

const { width } = Dimensions.get("window");

export default function PostDetailScreen() {
  // --------------------------------------------------------------------------
  // Navigation & Route
  // --------------------------------------------------------------------------
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { post } = route.params as any;

  // Extract post data (handle both BlueskyPost and BlueskyFeedItem)
  const postData = "post" in post ? post.post : post;
  const author = postData.author;
  const record = postData.record;
  const embed = postData.embed;

  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<BlueskyPost[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [relatedCursor, setRelatedCursor] = useState<string | undefined>(
    undefined
  );
  const [loadingMoreRelated, setLoadingMoreRelated] = useState(false);

  // --------------------------------------------------------------------------
  // Load related posts based on hashtags
  // --------------------------------------------------------------------------
  useEffect(() => {
    // Reset state when navigating to new post
    setRelatedPosts([]);
    setRelatedCursor(undefined);
    setLoadingRelated(false);
    setLoadingMoreRelated(false);

    loadRelatedPosts();
  }, [postData.uri]);

  const loadRelatedPosts = async () => {
    setLoadingRelated(true);

    try {
      const text = record.text || "";
      const hashtags = text.match(/#[\w가-힣]+/g) || [];

      let posts: BlueskyPost[] = [];
      let cursor: string | undefined;

      if (hashtags.length > 0) {
        const searchTag = hashtags[0].slice(1);
        const response = await searchPosts(searchTag);
        posts = response.posts;
        cursor = response.cursor; // ← cursor 저장
      } else {
        const response = await getDiscoverFeed();
        posts = response.feed.map((item) => item.post);
        cursor = response.cursor; // ← cursor 저장
      }

      const filtered = posts.filter((p) => p.uri !== postData.uri).slice(0, 10);

      setRelatedPosts(filtered);
      setRelatedCursor(cursor); // ← state 저장
    } catch (error) {
      console.error("Error loading related posts:", error);
    } finally {
      setLoadingRelated(false);
    }
  };

  // --------------------------------------------------------------------------
  // Load More Related
  // --------------------------------------------------------------------------

  const loadMoreRelated = async () => {
    if (loadingMoreRelated || !relatedCursor) return;

    setLoadingMoreRelated(true);

    try {
      const text = record.text || "";
      const hashtags = text.match(/#[\w가-힣]+/g) || [];

      let posts: BlueskyPost[] = [];
      let cursor: string | undefined;

      if (hashtags.length > 0) {
        const searchTag = hashtags[0].slice(1);
        const response = await searchPosts(searchTag, relatedCursor);
        posts = response.posts;
        cursor = response.cursor;
      } else {
        const response = await getDiscoverFeed(relatedCursor);
        posts = response.feed.map((item) => item.post);
        cursor = response.cursor;
      }

      // Filter duplicates and current post
      const newPosts = posts.filter(
        (newPost) =>
          newPost.uri !== postData.uri &&
          !relatedPosts.some((existing) => existing.uri === newPost.uri)
      );

      setRelatedPosts([...relatedPosts, ...newPosts]);
      setRelatedCursor(cursor);
    } catch (error) {
      console.error("Error loading more related:", error);
      setRelatedCursor(undefined);
    } finally {
      setLoadingMoreRelated(false);
    }
  };

  // --------------------------------------------------------------------------
  // Extract image
  // --------------------------------------------------------------------------
  const image =
    embed && "images" in embed && embed.images?.[0] ? embed.images[0] : null;

  // --------------------------------------------------------------------------
  // Format counts
  // --------------------------------------------------------------------------
  const likeCount = postData.likeCount || 0;
  const replyCount = postData.replyCount || 0;
  const repostCount = postData.repostCount || 0;

  // --------------------------------------------------------------------------
  // Format time
  // --------------------------------------------------------------------------
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDay = Math.floor(diffHour / 24);

    if (diffHour < 24) return `${diffHour}h`;
    if (diffDay < 7) return `${diffDay}d`;
    return `${Math.floor(diffDay / 7)}w`;
  };

  const timeAgo = formatTimeAgo(postData.indexedAt);

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 500;

          if (isCloseToBottom && !loadingMoreRelated && relatedCursor) {
            loadMoreRelated();
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={{ paddingTop: 90, paddingBottom: 12 }} />

        {/* Profile Header */}
        <View className="flex-row items-center justify-between px-16 py-12 pt-70">
          <View className="flex-row items-center flex-1">
            {/* Avatar */}
            <Image
              source={{
                uri: author.avatar || "https://via.placeholder.com/48",
              }}
              className="w-28 h-28 rounded-full"
            />

            {/* Name + Handle */}
            <View className="ml-16 flex-1">
              <Text className="text-body font-semibold text-gray-700">
                {author.displayName || author.handle}
              </Text>
              <Text className="text-body-small text-gray-400">
                @{author.handle}
              </Text>
            </View>
          </View>

          {/* Follow Button */}
          <TouchableOpacity
            className={`rounded-20 px-16 py-8 ${
              isFollowing ? "bg-gray-200" : "bg-primary-900"
            }`}
            onPress={() => setIsFollowing(!isFollowing)}
          >
            <Text
              className={`text-caption font-body ${
                isFollowing ? "text-gray-700" : "text-white"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Post Image */}
        {image && (
          <View className="px-16">
            <Image
              source={{ uri: image.fullsize }}
              style={{
                width: width - 32,
                aspectRatio:
                  image.aspectRatio?.width && image.aspectRatio?.height
                    ? image.aspectRatio.width / image.aspectRatio.height
                    : 1, // fallback to square
                borderRadius: 20,
              }}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Interaction Bar */}
        <View className="flex-row items-center justify-between px-16 py-16">
          <View className="flex-row items-center gap-20">
            {/* Like */}
            <View className="flex-row items-center gap-4">
              <Feather name="heart" size={24} color="#343434" />
              <Text className="text-body text-gray-700">{likeCount}</Text>
            </View>

            {/* Comment */}
            <View className="flex-row items-center gap-4">
              <Feather name="message-circle" size={24} color="#343434" />
              <Text className="text-body text-gray-700">{replyCount}</Text>
            </View>

            {/* Repost */}
            <View className="flex-row items-center gap-4">
              <Feather name="repeat" size={24} color="#343434" />
              <Text className="text-body text-gray-700">{repostCount}</Text>
            </View>

            {/* Share */}
            <TouchableOpacity>
              <Feather name="share-2" size={24} color="#343434" />
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity className="bg-primary-900 rounded-20 px-24 py-8">
            <Text className="text-body font-body text-white">Save</Text>
          </TouchableOpacity>
        </View>

        {/* Post Text */}
        {record.text && (
          <View className="px-16 pb-12">
            {showFullText ? (
              // Full text with See less on right
              <View>
                <Text className="text-body text-gray-700">{record.text}</Text>
                <View className="flex-row justify-end mt-8">
                  <TouchableOpacity onPress={() => setShowFullText(false)}>
                    <Text className="text-body font-semibold text-gray-900">
                      See less
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // One line with See more on right
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-body text-gray-700 flex-1"
                  numberOfLines={1}
                >
                  {record.text}
                </Text>
                {record.text.length > 50 && (
                  <TouchableOpacity
                    onPress={() => setShowFullText(true)}
                    className="ml-12"
                  >
                    <Text className="text-body font-semibold text-gray-900">
                      See more
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* Time */}
        <View className="px-16 pb-20">
          <Text className="text-body-small text-gray-500">{timeAgo}</Text>
        </View>

        {/* More to explore */}
        <View className="pb-100">
          <Text className="text-h3 font-semibold text-gray-700 mb-12 px-16">
            More to explore
          </Text>

          {loadingRelated ? (
            <View className="items-center py-20">
              <ActivityIndicator size="small" color="#4C4464" />
            </View>
          ) : relatedPosts.length === 0 ? (
            <Text className="text-body text-gray-500 px-16">
              No related posts found
            </Text>
          ) : (
            <>
              <MasonryList
                data={relatedPosts}
                keyExtractor={(item: any) => item.uri}
                numColumns={2}
                scrollEnabled={false}
                renderItem={({ item, i }: { item: any; i: number }) => {
                  const post = item as BlueskyPost;
                  const isLeftColumn = i % 2 === 0;
                  const feedItem = { post: post };
                  return (
                    <PostCard feedItem={feedItem} isLeftColumn={isLeftColumn} />
                  );
                }}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                }}
              />

              {/* Loading More Indicator */}
              {loadingMoreRelated && (
                <View className="items-center py-32">
                  <ActivityIndicator size="small" color="#4C4464" />
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Fixed Back Button */}
      <View className="absolute top-58 left-20 z-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: 50,
            padding: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Feather name="chevron-left" size={28} color="#343434" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
