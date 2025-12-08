// ============================================================================
// EditBoardModal — Edit board details
// ============================================================================

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useBoardContext } from "../contexts/BoardContext";
import { BoardWithPosts } from "../types";

interface EditBoardModalProps {
  visible: boolean;
  onClose: () => void;
  board: BoardWithPosts;
  onDelete: () => void; // Trigger delete modal
}

export default function EditBoardModal({
  visible,
  onClose,
  board,
  onDelete,
}: EditBoardModalProps) {
  const { updateBoard } = useBoardContext();
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description || "");
  const [isPrivate, setIsPrivate] = useState(board.is_private);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;

    setSaving(true);
    try {
      await updateBoard(board.id, {
        title: title.trim(),
        description: description.trim(),
        is_private: isPrivate,
      });
      onClose();
    } catch (error) {
      console.error("Error updating board:", error);
      alert("Failed to update board");
    } finally {
      setSaving(false);
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
          className="bg-white pt-24 pb-40"
          style={{
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <View className="px-32 pb-20 pt-4">
            <Text className="text-h3 font-semibold text-gray-700 text-center">
              Edit board
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-32 top-4"
            >
              <Feather name="x" size={24} color="#343434" />
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <View className="px-32 pb-16">
            <View className="border border-gray-700 rounded-30 px-24 py-12">
              <Text className="text-h3 font-medium text-gray-700 mb-8">
                Name
              </Text>
              <TextInput
                className="text-body text-gray-700"
                placeholder="Board name"
                placeholderTextColor="#ADB5BD"
                value={title}
                onChangeText={setTitle}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Description Input */}
          <View className="px-32 pb-12">
            <View className="border border-gray-700 rounded-30 px-24 py-20">
              <Text className="text-h3 font-medium text-gray-700 mb-8">
                Description
              </Text>
              <TextInput
                className="text-body text-gray-700"
                placeholder="Tell us a bit about yourself"
                placeholderTextColor="#ADB5BD"
                value={description}
                onChangeText={(text) => {
                  if (text.length <= 300) setDescription(text);
                }}
                multiline
                numberOfLines={3}
                maxLength={300}
                style={{ height: 60 }}
              />
            </View>

            {/* Character Count - Outside input box */}
            <View className="flex-row justify-between items-center px-8 mt-8">
              <Text className="text-body-small text-gray-600">
                300 Characters max
              </Text>
              <Text className="text-body-small text-gray-600">
                {description.length}/300
              </Text>
            </View>
          </View>

          {/* Private Toggle */}
          <View className="px-32 pt-12 flex-row justify-between items-center border-t border-gray-200">
            <Text className="text-h3 font-semibold text-gray-700">
              Private Board
            </Text>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: "#D1D5DB", true: "#4C4464" }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            className="px-32 py-12 flex-row justify-between items-center"
            onPress={onDelete}
          >
            <Text className="text-h3 font-semibold text-gray-700">Delete</Text>
            <Feather name="chevron-right" size={24} color="#343434" />
          </TouchableOpacity>

          {/* Cancel / Save Buttons */}
          <View className="px-32 flex-row gap-12 mt-auto">
            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-xl items-center justify-center"
              style={{ height: 44 }}
              onPress={onClose}
            >
              <Text className="text-body font-semibold text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-primary-900 rounded-xl items-center justify-center"
              style={{
                height: 44,
              }}
              onPress={handleSave}
              disabled={!title.trim() || saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-body font-semibold text-white">Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
