// ============================================================================
// 🔐 LoginScreen — Authenticate user using Bluesky App Password
// ============================================================================

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

// ============================================================================
// Component
// ============================================================================

export default function LoginScreen() {
  const { login } = useAuth(); // Global AuthContext
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================================================
  // Handle Login Submission
  // ==========================================================================
  const handleLogin = async () => {
    // Basic validation
    if (!identifier.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both handle and password");
      return;
    }

    setLoading(true);

    try {
      const result = await login(identifier, password);

      if (!result.success) {
        Alert.alert("Login Failed", result.error || "Invalid credentials");
      }

      // On success:
      // AuthContext sets isAuthenticated = true
      // Navigation switches to main app automatically
    } catch (error: any) {
      Alert.alert("Error", error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================================
  // UI Layout
  // ==========================================================================
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-24">
        {/* --------------------------------------------------------------
            App Title / Branding
        -------------------------------------------------------------- */}
        <View className="items-center mb-40">
          <Text className="text-display font-bold text-primary-700">
            SkyFrame
          </Text>
          <Text className="text-body text-gray-500 mt-8">
            Visual-first Bluesky client
          </Text>
        </View>

        {/* --------------------------------------------------------------
            Input Fields
        -------------------------------------------------------------- */}
        <View className="gap-16">
          {/* Handle or Email */}
          <View>
            <Text className="text-body-small font-medium text-gray-700 mb-8">
              Handle or Email
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-16 py-12 text-body"
              placeholder="yourname.bsky.social"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Password */}
          <View>
            <Text className="text-body-small font-medium text-gray-700 mb-8">
              Password
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-16 py-12 text-body"
              placeholder="App password recommended"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>
        </View>

        {/* --------------------------------------------------------------
            App Password Info
        -------------------------------------------------------------- */}
        <View className="mt-12 bg-primary-50 rounded-lg p-12">
          <Text className="text-caption text-primary-700">
            💡 For security, use an App Password instead of your main password.
            Create one in Bluesky Settings → App Passwords
          </Text>
        </View>

        {/* --------------------------------------------------------------
            Login Button
        -------------------------------------------------------------- */}
        <TouchableOpacity
          className={`mt-32 rounded-lg py-16 items-center ${
            loading ? "bg-primary-300" : "bg-primary-700"
          }`}
          disabled={loading}
          onPress={handleLogin}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-body-semibold text-white">Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
