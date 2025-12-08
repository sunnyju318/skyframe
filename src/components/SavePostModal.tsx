// ============================================================================
// SavePostModal — Pinterest-style save to board modal
// ============================================================================

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useBoardContext } from "../contexts/BoardContext";
import { BlueskyPost } from "../types";
import CreateBoardModal from "./CreateBoardModal";

interface SavePostModalProps {
  visible: boolean;
  onClose: () => void;
  post: BlueskyPost;
}

export default function SavePostModal({
  visible,
  onClose,
  post,
}: SavePostModalProps) {
  const { boards, savePostToBoard, getBoardsWithPost } = useBoardContext();
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Get boards that already have this post
  const boardsWithPost = getBoardsWithPost(post.uri);

  const handleSaveToBoard = async (boardId: string) => {
    setSaving(true);
    try {
      await savePostToBoard(boardId, post);
      onClose();
    } catch (error) {
      console.error("Error saving to board:", error);
      alert("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBoardSuccess = () => {
    setShowCreateModal(false);
    // Modal will auto-refresh boards from context
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View
            className="bg-white pt-24 pb-40"
            style={{
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              overflow: "hidden",
              height: 350,
            }}
          >
            {/* Header */}
            <View className="px-32 pb-20 pt-4">
              <Text className="text-h3 font-semibold text-gray-700 text-center">
                Save to board
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="absolute right-32 top-4"
              >
                <Feather name="x" size={24} color="#343434" />
              </TouchableOpacity>
            </View>

            {/* Board List - Scrollable */}
            <FlatList
              data={boards}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingHorizontal: 32,
                paddingBottom: 80,
              }}
              style={{ flex: 1 }}
              renderItem={({ item }) => {
                const isSaved = boardsWithPost.some((b) => b.id === item.id);
                const firstPost = item.posts[0];
                let thumbnail: string | undefined;
                if (firstPost?.embed && "images" in firstPost.embed) {
                  thumbnail = firstPost.embed.images?.[0]?.thumb;
                }

                return (
                  <TouchableOpacity
                    className="flex-row items-center gap-16 py-12"
                    onPress={() => !isSaved && handleSaveToBoard(item.id)}
                    disabled={isSaved || saving}
                  >
                    <View className="w-60 h-60 rounded-20 bg-gray-200 overflow-hidden">
                      {thumbnail ? (
                        <Image
                          source={{ uri: thumbnail }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full items-center justify-center">
                          <Feather name="image" size={24} color="#9CA3AF" />
                        </View>
                      )}
                    </View>

                    <View className="flex-1">
                      <Text className="text-body font-semibold text-gray-700">
                        {item.title}
                      </Text>
                      <Text className="text-body-small text-gray-400">
                        {item.posts.length} posts
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text className="text-body text-gray-400 text-center py-40">
                  No boards yet.
                </Text>
              }
            />
            {/* Create Board - Fixed Footer */}
            <View
              className="absolute bottom-0 left-0 right-0 bg-white pt-8 pb-20"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <TouchableOpacity
                className="flex-row items-center gap-16 px-32 py-8"
                onPress={() => setShowCreateModal(true)}
              >
                <View className="w-58 h-58 rounded-20 border-2 border-gray-700 items-center justify-center">
                  <Feather name="plus" size={24} color="#343434" />
                </View>
                <Text className="text-h3 font-semibold text-gray-700">
                  Create board
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Board Modal */}
      <CreateBoardModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateBoardSuccess}
        post={post}
      />
    </>
  );
}
