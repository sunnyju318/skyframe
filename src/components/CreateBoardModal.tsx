// ============================================================================
// CreateBoardModal — Create new board modal
// ============================================================================

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useBoardContext } from "../contexts/BoardContext";
import { BlueskyPost } from "../types";

interface CreateBoardModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  post?: BlueskyPost;
}

export default function CreateBoardModal({
  visible,
  onClose,
  onSuccess,
  post,
}: CreateBoardModalProps) {
  const { createBoard, savePostToBoard } = useBoardContext();
  const [boardName, setBoardName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!boardName.trim()) return;

    setCreating(true);
    try {
      const newBoard = await createBoard(boardName.trim(), "", false); // isPrivate = false

      // If post is provided, save it to the new board
      if (post) {
        await savePostToBoard(newBoard.id, post);
      }

      setBoardName("");
      onSuccess();
    } catch (error) {
      console.error("Error creating board:", error);
      alert("Failed to create board");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
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
            {/* Centered Title */}
            <Text className="text-h3 font-semibold text-gray-700 text-center">
              Create board
            </Text>

            {/* X Button - Absolute positioned */}
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-32 top-4"
            >
              <Feather name="x" size={24} color="#343434" />
            </TouchableOpacity>
          </View>

          {/* Input */}
          <View className="px-32 pb-24 mt-12">
            <View className="border border-gray-700 rounded-30 px-24 py-20">
              <Text className="text-h3 font-semibold text-gray-700 mb-8">
                Board name
              </Text>
              <TextInput
                className="text-body text-gray-700"
                placeholder="Name your board"
                placeholderTextColor="#9CA3AF"
                value={boardName}
                onChangeText={setBoardName}
                autoCapitalize="words"
                autoFocus
              />
            </View>
          </View>

          {/* Post Button */}
          <View className="px-32 flex-row justify-end">
            <TouchableOpacity
              className="bg-primary-900 rounded-20 px-32 py-12 items-center"
              onPress={handleCreate}
              disabled={!boardName.trim() || creating}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-body font-semibold text-white">Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
