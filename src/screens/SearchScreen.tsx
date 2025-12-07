import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import MasonryList from "@react-native-seoul/masonry-list";
import { searchPosts, getTrendingHashtags } from "../services/blueskyApi";
import { BlueskyPost } from "../types";
import PostCard from "../components/PostCard";

export default function SearchScreen() {
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

  // Load trending tags on mount
  useEffect(() => {
    loadTrendingTags();
  }, []);

  const loadTrendingTags = async () => {
    try {
      const tags = await getTrendingHashtags();
      setTrendingTags(tags);
    } catch (error) {
      console.error("Error loading trending tags:", error);
    }
  };

  const extractRelatedTags = (posts: BlueskyPost[]) => {
    const tagCounts = new Map<string, number>();

    posts.forEach((post) => {
      const text = post.record.text || "";
      if (!text || typeof text !== "string") return;

      const hashtags = text.match(/#\w+/g) || [];

      hashtags.forEach((tag) => {
        const cleanTag = tag.slice(1).toLowerCase();

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

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setSearchMode("results");
    setSearchQuery(query);

    try {
      const response = await searchPosts(query);
      setSearchResults(response.posts);
      setCursor(response.cursor);

      extractRelatedTags(response.posts);
    } catch (error: any) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreResults = async () => {
    if (loadingMore || !cursor || !searchQuery.trim()) return;

    setLoadingMore(true);

    try {
      const response = await searchPosts(searchQuery, cursor);

      const newPosts = response.posts.filter(
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

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchMode("discover");
  };

  const renderItem = ({ item, i }: { item: any; i: number }) => {
    const post = item as BlueskyPost;
    const isLeftColumn = i % 2 === 0;

    // Convert BlueskyPost to BlueskyFeedItem format
    const feedItem = {
      post: post,
    };

    return <PostCard feedItem={feedItem} isLeftColumn={isLeftColumn} />;
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with SearchBar */}
      <View className="bg-white border-b border-gray-200 pt-58 pb-16 px-16">
        <View className="flex-row items-center gap-12">
          {/* Back Button  */}
          {searchMode === "results" && (
            <TouchableOpacity onPress={clearSearch}>
              <Feather name="arrow-left" size={24} color="#343434" />
            </TouchableOpacity>
          )}

          {/* SearchBar */}
          <View className="flex-1 flex-row items-center bg-gray-50 rounded-lg px-12 py-8">
            <TextInput
              className="flex-1 text-body"
              placeholder="What can you make?"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearch(searchQuery)}
              returnKeyType="search"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={clearSearch}>
                <Feather name="x" size={20} color="#6C757D" />
              </TouchableOpacity>
            ) : (
              <Feather name="search" size={20} color="#6C757D" />
            )}
          </View>
        </View>

        {/* Related Search Tags */}
        {searchMode === "results" &&
          relatedTags.length > 0 && ( // ← relatedTags로 변경
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-12"
              contentContainerStyle={{ gap: 8 }}
            >
              {relatedTags.map(
                (
                  tag // ← relatedTags로 변경
                ) => (
                  <TouchableOpacity
                    key={tag}
                    className="bg-white border border-gray-300 rounded-full px-16 py-8"
                    onPress={() => handleSearch(tag)}
                  >
                    <Text className="text-body-small text-gray-700">{tag}</Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>
          )}
      </View>

      {/* Content */}
      {searchMode === "discover" ? (
        // Discover Mode - will add Trending + Categories here
        <View className="flex-1 items-center justify-center">
          <Text className="text-body text-gray-500">Discover mode (WIP)</Text>
        </View>
      ) : (
        // Results Mode
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
