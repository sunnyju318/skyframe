// ============================================================================
// Search Screen — Trending, Categories, and Search Results
// ============================================================================

import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import MasonryList from "@react-native-seoul/masonry-list";
import {
  searchPosts,
  getTrendingHashtags,
  getPopularCategories,
} from "../services/blueskyApi";
import { BlueskyPost } from "../types";
import PostCard from "../components/PostCard";
import { filterPosts, filterHashtags } from "../utils/contentFilter";

// ============================================================================
// Component State & Mode
// ============================================================================

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"discover" | "results">(
    "discover"
  );
  const [searchResults, setSearchResults] = useState<BlueskyPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [relatedTags, setRelatedTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryPosts, setCategoryPosts] = useState<
    Record<string, BlueskyPost[]>
  >({});
  const [loadingCategories, setLoadingCategories] = useState(true);

  // ========================================================================
  // Initial Data Load (Trending tags + Category sections)
  // ========================================================================

  useEffect(() => {
    loadTrendingTags();
    loadCategoryPosts();
  }, []);

  // ========================================================================
  // Trending Hashtags
  // ========================================================================

  const loadTrendingTags = async () => {
    try {
      const tags = await getTrendingHashtags();
      const safeTags = filterHashtags(tags);
      setTrendingTags(safeTags);
    } catch (error) {
      console.error("Error loading trending tags:", error);
    }
  };

  // ========================================================================
  // Category Sections (Discover mode)
  // ========================================================================
  // Load popular categories and fetch 7 preview posts for each in parallel

  const loadCategoryPosts = async () => {
    setLoadingCategories(true);

    try {
      const popularCategories = await getPopularCategories();
      const safeCategories = filterHashtags(popularCategories);
      setCategories(safeCategories);

      const searchPromises = safeCategories.map(async (category) => {
        const response = await searchPosts(category);
        const safePosts = filterPosts(response.posts);
        return { category, posts: safePosts.slice(0, 7) };
      });

      const results = await Promise.all(searchPromises);

      const categoryData: Record<string, BlueskyPost[]> = {};
      results.forEach(({ category, posts }) => {
        categoryData[category] = posts;
      });

      setCategoryPosts(categoryData);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // ========================================================================
  // Related Tags Extraction (from search results)
  // ========================================================================

  const extractRelatedTags = (posts: BlueskyPost[]) => {
    const tagCounts = new Map<string, number>();

    posts.forEach((post) => {
      const text = post.record.text || "";
      if (!text || typeof text !== "string") return;

      const hashtags = text.match(/#\w+/g) || [];

      hashtags.forEach((tag) => {
        const cleanTag = tag.slice(1).toLowerCase();

        // Skip the original search query
        if (cleanTag === searchQuery.toLowerCase()) return;

        tagCounts.set(cleanTag, (tagCounts.get(cleanTag) || 0) + 1);
      });
    });

    const related = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([tag]) => tag);

    setRelatedTags(related);
  };

  // ========================================================================
  // Search Logic (initial search + mode toggle)
  // ========================================================================

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setSearchMode("results");
    setSearchQuery(query);

    try {
      const response = await searchPosts(query);
      const safePosts = filterPosts(response.posts);
      setSearchResults(safePosts);
      setCursor(response.cursor);

      extractRelatedTags(safePosts);
    } catch (error: any) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // Load More Results (infinite scroll)
  // ========================================================================

  const loadMoreResults = async () => {
    if (loadingMore || !cursor || !searchQuery.trim()) return;

    setLoadingMore(true);

    try {
      const response = await searchPosts(searchQuery, cursor);
      const safePosts = filterPosts(response.posts);

      const newPosts = safePosts.filter(
        (newPost) =>
          !searchResults.some(
            (existingPost) => existingPost.uri === newPost.uri
          )
      );

      setSearchResults([...searchResults, ...newPosts]);
      setCursor(response.cursor);
    } catch (error: any) {
      console.error("Error loading more:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // ========================================================================
  // Clear Search & Reset to Discover Mode
  // ========================================================================

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchMode("discover");
  };

  // ========================================================================
  // Masonry Render Item (wrap post into feedItem for PostCard)
  // ========================================================================

  const renderItem = ({ item, i }: { item: any; i: number }) => {
    const post = item as BlueskyPost;
    const isLeftColumn = i % 2 === 0;

    // Minimal BlueskyFeedItem-like structure for PostCard
    const feedItem = {
      post: post,
    };

    return <PostCard feedItem={feedItem} isLeftColumn={isLeftColumn} />;
  };

  // ========================================================================
  // UI — Layout & Sections
  // ========================================================================

  return (
    <View className="flex-1 bg-white">
      {/* ================================================================
          🔹 Header with Search Bar
          ================================================================ */}
      <View className="pt-58 pb-12 px-16">
        <View className="flex-row items-center gap-12">
          {/* Back Button (only in results mode) */}
          {searchMode === "results" && (
            <TouchableOpacity onPress={clearSearch}>
              <Feather name="chevron-left" size={30} color="#343434" />
            </TouchableOpacity>
          )}

          {/* Search Bar */}
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-30 px-16 py-8">
            <TextInput
              className="flex-1 text-body font-semibold text-gray-700"
              placeholder="What's on your mind?"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearch(searchQuery)}
              returnKeyType="search"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={clearSearch}>
                <Feather name="x" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            ) : (
              <Feather name="search" size={22} color="#9CA3AF" />
            )}
          </View>
        </View>

        {/* Related search tags (chips under the search bar) */}
        {searchMode === "results" && relatedTags.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-20"
            contentContainerStyle={{ gap: 8 }}
          >
            {relatedTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                className="bg-white border border-gray-700 rounded-20 px-16 py-8"
                onPress={() => handleSearch(tag)}
              >
                <Text className="text-body text-gray-700">{tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* ================================================================
          Main Content — Discover vs Results
          ================================================================ */}
      {searchMode === "discover" ? (
        // ------------------------------------------------------------
        // Discover Mode
        // ------------------------------------------------------------
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Trending Now Section */}
          <View className="px-16 py-20">
            <Text className="text-h3 font-semibold text-gray-700 mb-12">
              Trending now
            </Text>

            {trendingTags.length > 0 ? (
              <View className="flex-row flex-wrap gap-8">
                {trendingTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    className="bg-white border border-gray-700 rounded-20 px-16 py-8"
                    onPress={() => handleSearch(tag)}
                  >
                    <Text className="text-body text-gray-700">{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ActivityIndicator size="small" color="#4C4464" />
            )}
          </View>

          {/* Category Grids */}
          {loadingCategories ? (
            <View className="flex-1 items-center justify-center py-40">
              <ActivityIndicator size="large" color="#4C4464" />
              <Text className="text-body text-gray-500 mt-16">
                Loading categories...
              </Text>
            </View>
          ) : (
            categories.map((category) => (
              <View key={category} className="mt-20 mb-16">
                {/* Category Header */}
                <View className="flex-row items-center justify-between px-16 mb-12">
                  <TouchableOpacity onPress={() => handleSearch(category)}>
                    <Text className="text-h3 font-medium text-gray-700 capitalize">
                      {category}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleSearch(category)}>
                    <Feather name="search" size={20} color="#6C757D" />
                  </TouchableOpacity>
                </View>

                {/* Horizontal Image Grid */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                >
                  {categoryPosts[category]?.map((post) => {
                    const embed = post.embed;

                    // Guard: ensure post has images
                    if (
                      !embed ||
                      !("images" in embed) ||
                      !embed.images ||
                      embed.images.length === 0
                    ) {
                      return null;
                    }

                    const image = embed.images[0];
                    if (!image) return null;

                    return (
                      <TouchableOpacity
                        key={post.uri}
                        className="bg-white rounded-xl overflow-hidden"
                        style={{ width: 109, height: 146 }}
                        activeOpacity={0.9}
                        onPress={() => navigation.push("PostDetail", { post })}
                      >
                        <Image
                          source={{ uri: image.thumb }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        // ------------------------------------------------------------
        // Results Mode
        // ------------------------------------------------------------
        <View className="flex-1">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#4C4464" />
            </View>
          ) : searchResults.length === 0 ? (
            <View className="flex-1 items-center justify-center px-24">
              <Text className="text-h2 font-semibold text-gray-700">
                No results found
              </Text>
              <Text className="text-body text-gray-500 mt-8 text-center">
                Try different keywords
              </Text>
            </View>
          ) : (
            <MasonryList
              data={searchResults}
              keyExtractor={(item: any) => item.uri}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              onEndReached={loadMoreResults}
              onEndReachedThreshold={0.5}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 20,
                paddingBottom: 24,
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}
