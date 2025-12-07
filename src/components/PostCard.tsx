// ============================================================================
// PostCard — Reusable feed image card with shimmer skeleton loader
// ============================================================================

import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { BlueskyFeedItem } from "../types";

interface PostCardProps {
  feedItem: BlueskyFeedItem;
  isLeftColumn: boolean;
  onPress?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export default function PostCard({
  feedItem,
  isLeftColumn,
  onPress,
}: PostCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  // ==========================================================================
  // Shimmer Animation Setup
  // ==========================================================================

  useEffect(() => {
    if (!imageLoading) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    // Stop animation on unmount or when loading is finished
    return () => {
      loop.stop();
    };
  }, [imageLoading, shimmerAnimation]);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  // ==========================================================================
  // Embed & Image Guard
  // ==========================================================================

  const embed = feedItem.post.embed;
  if (
    !embed ||
    !("images" in embed) ||
    !embed.images ||
    embed.images.length === 0
  ) {
    // Return an empty view instead of null (safer for lists)
    return <View />;
  }

  const image = embed.images[0];
  if (!image) return <View />;

  const aspectRatio =
    image.aspectRatio?.width && image.aspectRatio?.height
      ? image.aspectRatio.width / image.aspectRatio.height
      : 1;

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <TouchableOpacity
      className="bg-white rounded-xl overflow-hidden"
      style={{
        marginBottom: 12,
        marginRight: isLeftColumn ? 6 : 0,
        marginLeft: isLeftColumn ? 0 : 6,
      }}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* Container wrapping both the image and the skeleton loader */}
      <View
        style={{
          aspectRatio,
          minHeight: 200,
        }}
      >
        {/* Shimmer skeleton shown while the image is loading */}
        {imageLoading && (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: "#E5E5E5",
                overflow: "hidden",
              },
            ]}
          >
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "60%",
                transform: [{ translateX }],
              }}
            >
              <LinearGradient
                colors={["#D6D6D6", "#E6E6E6", "#D6D6D6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
          </View>
        )}

        {/* Actual image */}
        <ExpoImage
          source={{ uri: image.thumb }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
          onLoad={() => setImageLoading(false)}
        />
      </View>
    </TouchableOpacity>
  );
}
