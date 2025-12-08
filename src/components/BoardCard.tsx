// ============================================================================
// BoardCard — Board preview card with 5 thumbnails
// ============================================================================

import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BoardWithPosts } from "../types";

interface BoardCardProps {
  board: BoardWithPosts;
  onPress: () => void;
}

export default function BoardCard({ board, onPress }: BoardCardProps) {
  // Get first 5 thumbnails
  const thumbnails = board.posts.slice(0, 5).map((post) => {
    if (post.embed && "images" in post.embed) {
      return post.embed.images?.[0]?.thumb;
    }
    return undefined;
  });

  // Calculate placeholders
  const placeholderCount = Math.max(0, 5 - thumbnails.length);
  const placeholders = Array(placeholderCount).fill(null);

  return (
    <TouchableOpacity
      className="mb-20 bg-white rounded-20  overflow-hidden"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Board Title */}
      <View className="flex-row items-center gap-8 px-16 py-12">
        <Text className="text-h3 font-semibold text-gray-700">
          {board.title}
        </Text>
        <Text className="text-body-small text-gray-400 mt-4">
          {board.posts.length} {board.posts.length === 1 ? "post" : "posts"}
        </Text>
      </View>

      {/* Thumbnail Grid */}
      <View className="flex-row" style={{ height: 160 }}>
        {/* Left: Big thumbnail */}
        <View className="flex-1">
          {thumbnails[0] ? (
            <Image
              source={{ uri: thumbnails[0] }}
              className="w-full h-full"
              style={{
                borderTopLeftRadius: 20,
                borderBottomLeftRadius: 20,
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              className="w-full h-full bg-gray-200 items-center justify-center"
              style={{
                borderTopLeftRadius: 20,
                borderBottomLeftRadius: 20,
              }}
            >
              <Feather name="image" size={40} color="#9CA3AF" />
            </View>
          )}
        </View>

        {/* Right: 4 small thumbnails */}
        <View style={{ width: "45%" }}>
          <View className="flex-row" style={{ height: "50%" }}>
            {/* Top-left */}
            <View className="flex-1 border-l border-white">
              {thumbnails[1] ? (
                <Image
                  source={{ uri: thumbnails[1] }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-gray-200 items-center justify-center">
                  <Feather name="image" size={24} color="#9CA3AF" />
                </View>
              )}
            </View>

            {/* Top-right */}
            <View className="flex-1 border-l border-white">
              {thumbnails[2] ? (
                <Image
                  source={{ uri: thumbnails[2] }}
                  className="w-full h-full"
                  style={{ borderTopRightRadius: 20 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  className="w-full h-full bg-gray-200 items-center justify-center"
                  style={{ borderTopRightRadius: 20 }}
                >
                  <Feather name="image" size={24} color="#9CA3AF" />
                </View>
              )}
            </View>
          </View>

          <View
            className="flex-row border-t border-white"
            style={{ height: "50%" }}
          >
            {/* Bottom-left */}
            <View className="flex-1 border-l border-white">
              {thumbnails[3] ? (
                <Image
                  source={{ uri: thumbnails[3] }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-gray-200 items-center justify-center">
                  <Feather name="image" size={24} color="#9CA3AF" />
                </View>
              )}
            </View>

            {/* Bottom-right */}
            <View className="flex-1 border-l border-white">
              {thumbnails[4] ? (
                <Image
                  source={{ uri: thumbnails[4] }}
                  className="w-full h-full"
                  style={{ borderBottomRightRadius: 20 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  className="w-full h-full bg-gray-200 items-center justify-center"
                  style={{ borderBottomRightRadius: 20 }}
                >
                  <Feather name="image" size={24} color="#9CA3AF" />
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
