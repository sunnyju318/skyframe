// ============================================================================
// DeleteBoardModal — Confirm board deletion
// ============================================================================

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import { useBoardContext } from "../contexts/BoardContext";
import { BoardWithPosts } from "../types";

interface DeleteBoardModalProps {
  visible: boolean;
  onClose: () => void;
  board: BoardWithPosts;
  onSuccess: () => void;
}

export default function DeleteBoardModal({
  visible,
  onClose,
  board,
  onSuccess,
}: DeleteBoardModalProps) {
  const { deleteBoard } = useBoardContext();
  const [deleting, setDeleting] = useState(false);

  // Get first 5 thumbnails (same logic as BoardCard)
  const thumbnails = board.posts.slice(0, 5).map((post) => {
    if (post.embed && "images" in post.embed) {
      return post.embed.images?.[0]?.thumb;
    }
    return undefined;
  });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBoard(board.id);
      onSuccess();
    } catch (error) {
      console.error("Error deleting board:", error);
      alert("Failed to delete board");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View
          className="bg-white pt-32 pb-40"
          style={{
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            overflow: "hidden",
          }}
        >
          {/* Title */}
          <Text className="text-h1 font-semibold text-gray-700 text-center px-32 mb-24">
            Delete this board?
          </Text>

          {/* Board Info */}
          <View className="px-32 mb-32">
            <Text className="text-h3 font-medium text-gray-700 mb-12">
              {board.title}
            </Text>

            {/* Thumbnail Preview */}
            <View className="flex-row" style={{ height: 150 }}>
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
                    className="w-full h-full bg-gray-200"
                    style={{
                      borderTopLeftRadius: 20,
                      borderBottomLeftRadius: 20,
                    }}
                  />
                )}
              </View>

              {/* Right: 4 small thumbnails */}
              <View style={{ width: "45%" }}>
                <View className="flex-row" style={{ height: "50%" }}>
                  <View className="flex-1 border-l border-white">
                    {thumbnails[1] ? (
                      <Image
                        source={{ uri: thumbnails[1] }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full bg-gray-200" />
                    )}
                  </View>
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
                        className="w-full h-full bg-gray-200"
                        style={{ borderTopRightRadius: 20 }}
                      />
                    )}
                  </View>
                </View>

                <View
                  className="flex-row border-t border-white"
                  style={{ height: "50%" }}
                >
                  <View className="flex-1 border-l border-white">
                    {thumbnails[3] ? (
                      <Image
                        source={{ uri: thumbnails[3] }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full bg-gray-200" />
                    )}
                  </View>
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
                        className="w-full h-full bg-gray-200"
                        style={{ borderBottomRightRadius: 20 }}
                      />
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Cancel / Delete Buttons */}
          <View className="px-32 flex-row gap-12">
            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-xl items-center justify-center"
              style={{ height: 44 }}
              onPress={onClose}
              disabled={deleting}
            >
              <Text className="text-body font-semibold text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-primary-900 rounded-xl items-center justify-center"
              style={{ height: 44 }}
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-body font-semibold text-red">Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
