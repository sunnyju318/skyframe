// ============================================================================
// BoardDetailScreen — View board details with posts
// ============================================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import MasonryList from "@react-native-seoul/masonry-list";
import { useRoute, useNavigation } from "@react-navigation/native";
import { BoardWithPosts } from "../types";
import { useAuth } from "../contexts/AuthContext";
import PostCard from "../components/PostCard";
import EditBoardModal from "../components/EditBoardModal";
import DeleteBoardModal from "../components/DeleteBoardModal";

export default function BoardDetailScreen() {
  // --------------------------------------------------------------------------
  // Navigation & Route
  // --------------------------------------------------------------------------
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { user } = useAuth();
  const board = (route.params as any)?.board as BoardWithPosts;

  // Check if this is user's own board
  const isMyBoard = user?.did === board.user_id;

  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --------------------------------------------------------------------------
  // Get unique authors
  // --------------------------------------------------------------------------
  const authors = Array.from(
    new Map(board.posts.map((post) => [post.author.did, post.author])).values()
  ).slice(0, 10); // Show max 10 authors

  // --------------------------------------------------------------------------
  // Handle delete success
  // --------------------------------------------------------------------------
  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    setShowEditModal(false);
    navigation.goBack(); // Go back to profile
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="items-center pb-24 px-32" style={{ paddingTop: 130 }}>
          {/* Title */}
          <Text className="text-h1 font-semibold text-gray-700">
            {board.title}
          </Text>

          {/* Post Count */}
          <Text className="text-body text-gray-700 mt-8">
            {board.posts.length} {board.posts.length === 1 ? "post" : "posts"}
          </Text>

          {/* Description */}
          {board.description && (
            <Text className="text-body text-gray-700 text-center mt-16 px-16">
              {board.description}
            </Text>
          )}

          {/* Authors Profile Pictures */}
          {authors.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-32"
            >
              {authors.map((author, index) => (
                <TouchableOpacity
                  key={author.did}
                  onPress={() =>
                    navigation.push("Profile", { handle: author.handle })
                  }
                  style={{ marginRight: index === authors.length - 1 ? 0 : 8 }}
                >
                  <Image
                    source={{
                      uri: author.avatar || "https://via.placeholder.com/40",
                    }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Posts Grid */}
        {board.posts.length === 0 ? (
          <View className="items-center justify-center py-60 px-24">
            <Text className="text-h2 font-semibold text-gray-500">
              No posts yet
            </Text>
            <Text className="text-body text-gray-400 mt-8 text-center">
              Save posts to this board to see them here
            </Text>
          </View>
        ) : (
          <View style={{ minHeight: 400 }}>
            <MasonryList
              data={board.posts}
              keyExtractor={(item: any) => item.uri}
              numColumns={2}
              renderItem={({ item, i }: { item: any; i: number }) => {
                const feedItem = { post: item };
                const isLeftColumn = i % 2 === 0;
                return (
                  <PostCard feedItem={feedItem} isLeftColumn={isLeftColumn} />
                );
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 24,
                paddingBottom: 100,
              }}
            />
          </View>
        )}
      </ScrollView>

      {/* Fixed Header Buttons */}
      <View className="absolute top-58 left-0 right-0 flex-row justify-between items-center px-20 z-10">
        {/* Back Button */}
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

        {/* Right Buttons */}
        <View className="flex-row items-center  gap-8">
          {/* Edit Button - Only show for own board */}
          {isMyBoard && (
            <TouchableOpacity
              className="bg-primary-900 rounded-xl px-16"
              style={{ height: 32 }}
              onPress={() => setShowEditModal(true)}
            >
              <View className="flex-1 items-center justify-center">
                <Text className="text-body font-body text-white">Edit</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Share Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "rgb(255, 255, 255)",
              borderRadius: 12,
              padding: 8,
            }}
          >
            <Feather name="share-2" size={26} color="#343434" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Board Modal */}
      <EditBoardModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        board={board}
        onDelete={() => {
          setShowEditModal(false);
          setShowDeleteModal(true);
        }}
      />

      {/* Delete Board Modal */}
      <DeleteBoardModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        board={board}
        onSuccess={handleDeleteSuccess}
      />
    </View>
  );
}
