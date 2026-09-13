// src/components/designs/DesignDetailModal.jsx
// -----------------------------------------------------------------------------
// Detailed Architectural Specification modal showing full design rendering,
// dimensional requirements, structural breakdown, and space utilization notes.
// -----------------------------------------------------------------------------

import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function DesignDetailModal({
  visible,
  design,
  onClose,
  isFavorite = false,
  onToggleFavorite,
  onCheckFeasibility,
}) {
  const [imageLoading, setImageLoading] = useState(true);

  if (!design) return null;

  const isTenStory = design.floors === 10;

  const handleShare = async () => {
    try {
      await Share.share({
        title: design.title,
        message: `Check out this ${design.floors}-story architectural design on CivilHub: "${design.title}" (${design.min_katha} Katha minimum plot, ${design.rooftop_type} rooftop).`,
      });
    } catch (_e) {
      // Ignore share dismissal
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Image Section */}
          <View style={styles.imageHeaderContainer}>
            {imageLoading && (
              <View style={styles.imageLoader}>
                <ActivityIndicator size="large" color="#2563eb" />
              </View>
            )}

            <Image
              source={{ uri: design.image_url }}
              style={styles.heroImage}
              resizeMode="cover"
              onLoadEnd={() => setImageLoading(false)}
            />

            {/* Gradient Scrim */}
            <LinearGradient
              colors={["rgba(15,23,42,0.6)", "transparent", "rgba(15,23,42,0.85)"]}
              style={styles.imageGradient}
            >
              {/* Floating Top Controls */}
              <View style={styles.topControls}>
                <TouchableOpacity
                  style={styles.iconCircle}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={20} color="#ffffff" />
                </TouchableOpacity>

                <View style={styles.rightControls}>
                  <TouchableOpacity
                    style={styles.iconCircle}
                    onPress={handleShare}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="share-social-outline" size={18} color="#ffffff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.iconCircle, { marginLeft: 8 }]}
                    onPress={() => onToggleFavorite && onToggleFavorite(design.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isFavorite ? "heart" : "heart-outline"}
                      size={20}
                      color={isFavorite ? "#ef4444" : "#ffffff"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bottom Image Overlay Badges */}
              <View style={styles.imageBottomOverlay}>
                <View
                  style={[
                    styles.storyBadge,
                    isTenStory ? styles.tenStoryBadge : styles.fiveStoryBadge,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="office-building"
                    size={14}
                    color="#ffffff"
                  />
                  <Text style={styles.storyBadgeText}>
                    {design.floors} Stories High
                  </Text>
                </View>

                <View style={styles.styleBadge}>
                  <Text style={styles.styleBadgeText}>
                    {design.architectural_style}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Details Body */}
          <View style={styles.body}>
            <Text style={styles.title}>{design.title}</Text>
            <Text style={styles.description}>{design.description}</Text>

            {/* Key Specifications Grid */}
            <Text style={styles.sectionHeading}>Building Specifications</Text>
            <View style={styles.grid}>
              {/* Metric 1: Floors */}
              <View style={styles.gridCard}>
                <MaterialCommunityIcons
                  name="office-building"
                  size={22}
                  color="#2563eb"
                />
                <Text style={styles.gridLabel}>Floors</Text>
                <Text style={styles.gridValue}>{design.floors} Story</Text>
              </View>

              {/* Metric 2: Land Requirement */}
              <View style={styles.gridCard}>
                <Ionicons name="resize-outline" size={22} color="#059669" />
                <Text style={styles.gridLabel}>Min Land</Text>
                <Text style={styles.gridValue}>{design.min_katha} Katha</Text>
              </View>

              {/* Metric 3: Built-Up Area */}
              <View style={styles.gridCard}>
                <MaterialCommunityIcons
                  name="floor-plan"
                  size={22}
                  color="#7c3aed"
                />
                <Text style={styles.gridLabel}>Total Built Area</Text>
                <Text style={styles.gridValue}>
                  {design.built_area_sqft ? `${design.built_area_sqft.toLocaleString()} sqft` : "N/A"}
                </Text>
              </View>

              {/* Metric 4: Units per Floor */}
              <View style={styles.gridCard}>
                <Ionicons name="home-outline" size={22} color="#d97706" />
                <Text style={styles.gridLabel}>Units / Floor</Text>
                <Text style={styles.gridValue}>
                  {design.units_per_floor ? `${design.units_per_floor} Units` : "1-2 Units"}
                </Text>
              </View>

              {/* Metric 5: Car Garage */}
              <View style={styles.gridCard}>
                <Ionicons name="car-sport-outline" size={22} color="#2563eb" />
                <Text style={styles.gridLabel}>Garage / Parking</Text>
                <Text style={styles.gridValue}>
                  {design.has_garage
                    ? `${design.parking_capacity || 4} Bays`
                    : "No Garage"}
                </Text>
              </View>

              {/* Metric 6: Basement */}
              <View style={styles.gridCard}>
                <MaterialCommunityIcons
                  name="arrow-down-bold-box-outline"
                  size={22}
                  color="#6366f1"
                />
                <Text style={styles.gridLabel}>Basement</Text>
                <Text style={styles.gridValue}>
                  {design.has_basement ? "Included" : "None"}
                </Text>
              </View>

              {/* Metric 7: Rooftop Type */}
              <View style={[styles.gridCard, { width: "100%" }]}>
                <Ionicons
                  name={
                    design.rooftop_type === "Garden"
                      ? "leaf-outline"
                      : design.rooftop_type === "Helipad"
                      ? "airplane-outline"
                      : "sunny-outline"
                  }
                  size={22}
                  color="#16a34a"
                />
                <Text style={styles.gridLabel}>Rooftop Architecture</Text>
                <Text style={styles.gridValue}>
                  {design.rooftop_type} Rooftop Layout
                </Text>
              </View>
            </View>

            {/* Unit Interior & Room Layout (Per Flat) */}
            <Text style={styles.sectionHeading}>Unit Interior & Room Layout (Per Flat)</Text>
            
            <View style={styles.unitSpecsGrid}>
              {/* Metric: Bedrooms */}
              <View style={styles.unitGridCard}>
                <Ionicons name="bed-outline" size={22} color="#2563eb" />
                <Text style={styles.gridLabel}>Bedrooms</Text>
                <Text style={styles.gridValue}>
                  {design.bedrooms ? `${design.bedrooms} Beds` : "3 Beds"}
                </Text>
              </View>

              {/* Metric: Bathrooms */}
              <View style={styles.unitGridCard}>
                <MaterialCommunityIcons name="shower" size={22} color="#0284c7" />
                <Text style={styles.gridLabel}>Bathrooms</Text>
                <Text style={styles.gridValue}>
                  {design.bathrooms ? `${design.bathrooms} Baths` : "3 Baths"}
                </Text>
              </View>

              {/* Metric: Balconies */}
              <View style={styles.unitGridCard}>
                <MaterialCommunityIcons name="balcony" size={22} color="#16a34a" />
                <Text style={styles.gridLabel}>Balconies</Text>
                <Text style={styles.gridValue}>
                  {design.balconies ? `${design.balconies} Balconies` : "2 Balconies"}
                </Text>
              </View>

              {/* Metric: Approx Unit Area */}
              <View style={styles.unitGridCard}>
                <Ionicons name="scan-outline" size={22} color="#7c3aed" />
                <Text style={styles.gridLabel}>Per Unit Area</Text>
                <Text style={styles.gridValue}>
                  ~{design.unit_size_sqft ? `${design.unit_size_sqft.toLocaleString()} sqft` : "1,500 sqft"}
                </Text>
              </View>
            </View>

            {/* Room & Dining Space Detail Cards */}
            <View style={styles.spaceDetailsSection}>
              {/* Dining Space Info */}
              <View style={styles.spaceCard}>
                <View style={styles.spaceCardHeader}>
                  <View style={[styles.spaceIconWrap, { backgroundColor: "#fef3c7" }]}>
                    <Ionicons name="restaurant" size={18} color="#d97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.spaceCardTitle}>Dining Space</Text>
                    <Text style={styles.spaceCardSubtitle}>Dedicated Meal & Family Space</Text>
                  </View>
                </View>
                <Text style={styles.spaceCardText}>
                  {design.dining_space || "Spacious dedicated dining area with direct kitchen service access and wash corner."}
                </Text>
              </View>

              {/* Drawing & Living Lounge */}
              <View style={styles.spaceCard}>
                <View style={styles.spaceCardHeader}>
                  <View style={[styles.spaceIconWrap, { backgroundColor: "#ede9fe" }]}>
                    <MaterialCommunityIcons name="sofa" size={18} color="#7c3aed" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.spaceCardTitle}>Drawing & Living Lounge</Text>
                    <Text style={styles.spaceCardSubtitle}>Formal Living & Guest Reception</Text>
                  </View>
                </View>
                <Text style={styles.spaceCardText}>
                  {design.drawing_space || "Large formal drawing room with abundant natural light and cross-ventilation verandas."}
                </Text>
              </View>

              {/* Kitchen & Utility */}
              <View style={styles.spaceCard}>
                <View style={styles.spaceCardHeader}>
                  <View style={[styles.spaceIconWrap, { backgroundColor: "#e0f2fe" }]}>
                    <MaterialCommunityIcons name="countertop" size={18} color="#0284c7" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.spaceCardTitle}>Kitchen & Utility Veranda</Text>
                    <Text style={styles.spaceCardSubtitle}>Culinary & Laundry Corner</Text>
                  </View>
                </View>
                <Text style={styles.spaceCardText}>
                  {design.kitchen_space || "Modern modular kitchen layout with gas piping, exhaust provision, and washing balcony."}
                </Text>
              </View>
            </View>

            {/* Architectural Features List */}
            {design.features && design.features.length > 0 && (
              <View style={styles.featuresSection}>
                <Text style={styles.sectionHeading}>Key Architectural Features</Text>
                {design.features.map((feat, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#10b981"
                      style={styles.featureIcon}
                    />
                    <Text style={styles.featureText}>{feat}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Space for Bottom Bar */}
            <View style={{ height: 90 }} />
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.feasibilityBtn}
            activeOpacity={0.88}
            onPress={() => {
              onClose();
              if (onCheckFeasibility) onCheckFeasibility(design);
            }}
          >
            <Ionicons name="business" size={18} color="#ffffff" />
            <Text style={styles.feasibilityBtnText}>
              Check Feasibility for this Model
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  imageHeaderContainer: {
    position: "relative",
    width: "100%",
    height: 320,
    backgroundColor: "#0f172a",
  },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e293b",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 20,
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rightControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  imageBottomOverlay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  storyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  fiveStoryBadge: {
    backgroundColor: "#2563eb",
  },
  tenStoryBadge: {
    backgroundColor: "#059669",
  },
  storyBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  styleBadge: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  styleBadgeText: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "600",
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 28,
  },
  description: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginTop: 8,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 24,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  gridLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 8,
    fontWeight: "500",
  },
  gridValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 2,
  },
  featuresSection: {
    marginTop: 10,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 10,
  },
  featureText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  feasibilityBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  feasibilityBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  unitSpecsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  unitGridCard: {
    width: "48%",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  spaceDetailsSection: {
    marginTop: 6,
    marginBottom: 10,
  },
  spaceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  spaceCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  spaceIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  spaceCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
  spaceCardSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
  },
  spaceCardText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 20,
  },
});
