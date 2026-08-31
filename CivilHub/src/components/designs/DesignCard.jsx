// src/components/designs/DesignCard.jsx
// -----------------------------------------------------------------------------
// Pinterest-style architectural building card. Displays high-impact imagery,
// story badges, rooftop features, land area, and quick favorite toggling.
// -----------------------------------------------------------------------------

import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function DesignCard({
  design,
  onPress,
  isFavorite = false,
  onToggleFavorite,
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const isTenStory = design.floors === 10;

  // Icon & label for rooftop type
  const getRooftopInfo = (type) => {
    switch (type) {
      case "Garden":
        return { icon: "leaf", label: "Garden", color: "#16a34a" };
      case "Helipad":
        return { icon: "airplane", label: "Helipad", color: "#dc2626" };
      default:
        return { icon: "sunny", label: "Terrace", color: "#d97706" };
    }
  };

  const rooftop = getRooftopInfo(design.rooftop_type);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => onPress && onPress(design)}
    >
      {/* Image Container with Badges */}
      <View style={styles.imageContainer}>
        {imageLoading && !imageError && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="small" color="#2563eb" />
          </View>
        )}

        <Image
          source={{
            uri:
              imageError || !design.image_url
                ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
                : design.image_url,
          }}
          style={[
            styles.image,
            { aspectRatio: design.aspect_ratio || 0.95 },
          ]}
          resizeMode="cover"
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
        />

        {/* Story Count Badge (Top-Left) */}
        <View
          style={[
            styles.storyBadge,
            isTenStory ? styles.tenStoryBadge : styles.fiveStoryBadge,
          ]}
        >
          <MaterialCommunityIcons
            name="office-building"
            size={12}
            color="#ffffff"
          />
          <Text style={styles.storyBadgeText}>{design.floors} Story</Text>
        </View>

        {/* Favorite Button (Top-Right) */}
        <TouchableOpacity
          style={styles.favoriteButton}
          activeOpacity={0.8}
          onPress={() => onToggleFavorite && onToggleFavorite(design.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={18}
            color={isFavorite ? "#ef4444" : "#ffffff"}
          />
        </TouchableOpacity>

        {/* Min Katha Tag (Bottom-Right overlay) */}
        <View style={styles.kathaTag}>
          <Text style={styles.kathaTagText}>📐 {design.min_katha} Katha</Text>
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={2}>
          {design.title}
        </Text>

        <Text style={styles.styleSubtitle} numberOfLines={1}>
          {design.architectural_style || "Modern Architectural"}
        </Text>

        {/* Feature Badges Row */}
        <View style={styles.tagsRow}>
          {/* Rooftop Pill */}
          <View style={styles.tagPill}>
            <Ionicons name={rooftop.icon} size={11} color={rooftop.color} />
            <Text style={[styles.tagText, { color: rooftop.color }]}>
              {rooftop.label}
            </Text>
          </View>

          {/* Garage Pill */}
          {design.has_garage && (
            <View style={styles.tagPill}>
              <Ionicons name="car-sport" size={11} color="#2563eb" />
              <Text style={[styles.tagText, { color: "#2563eb" }]}>Garage</Text>
            </View>
          )}

          {/* Basement Pill */}
          {design.has_basement && (
            <View style={styles.tagPill}>
              <MaterialCommunityIcons
                name="arrow-down-bold-box"
                size={11}
                color="#7c3aed"
              />
              <Text style={[styles.tagText, { color: "#7c3aed" }]}>Basement</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
    backgroundColor: "#f1f5f9",
  },
  image: {
    width: "100%",
  },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  storyBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  fiveStoryBadge: {
    backgroundColor: "#2563eb",
  },
  tenStoryBadge: {
    backgroundColor: "#059669",
  },
  storyBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 3,
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  kathaTag: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  kathaTagText: {
    color: "#f8fafc",
    fontSize: 10,
    fontWeight: "600",
  },
  cardBody: {
    padding: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
    lineHeight: 18,
  },
  styleSubtitle: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "500",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 4,
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 3,
  },
});
