// src/screens/DesignSuggestionsScreen.jsx
// -----------------------------------------------------------------------------
// Main screen for Feature 2: "Smart Design Suggestions (Pinterest-based Filter Gallery)".
// Features:
//   - Hero banner with architectural theme & gradient styling
//   - Keyword search bar & filter drawer trigger with active badges
//   - Quick filter chip bar (5 Story, 10 Story, Garden, Garage, Basement, etc.)
//   - 2-Column Pinterest-style staggered masonry card gallery
//   - Favorites / Bookmarking system
//   - Integrated DesignFilterModal & DesignDetailModal
//   - Seamless cross-linking to Feasibility Checker
// -----------------------------------------------------------------------------

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ImageBackground,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import DesignCard from "../components/designs/DesignCard";
import QuickFilterBar from "../components/designs/QuickFilterBar";
import DesignFilterModal, {
  DEFAULT_FILTERS,
} from "../components/designs/DesignFilterModal";
import DesignDetailModal from "../components/designs/DesignDetailModal";
import { searchDesigns } from "../services/designService";
import { MOCK_DESIGNS } from "../services/mockDesigns";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80";

export default function DesignSuggestionsScreen({ navigation }) {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [activePreset, setActivePreset] = useState("all");
  const [modalFilters, setModalFilters] = useState(DEFAULT_FILTERS);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Gallery data & loading
  const [designs, setDesigns] = useState(MOCK_DESIGNS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState(new Set([1, 5]));
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Detail Modal state
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Calculate active filter count for badge
  const getActiveFilterCount = () => {
    let count = 0;
    if (modalFilters.floors !== "all") count++;
    if (modalFilters.has_basement !== "all") count++;
    if (modalFilters.has_garage !== "all") count++;
    if (modalFilters.rooftop_type !== "all") count++;
    if (modalFilters.min_katha !== "all") count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Fetch / filter designs
  const loadDesigns = useCallback(
    async (overrideFilters = null) => {
      const currentFilters = overrideFilters || modalFilters;
      const combined = {
        ...currentFilters,
        searchQuery,
      };

      try {
        const results = await searchDesigns(combined);
        setDesigns(results);
      } catch (err) {
        console.error("Failed to filter designs:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [modalFilters, searchQuery]
  );

  // Re-run search when query or modal filters change
  useEffect(() => {
    loadDesigns();
  }, [loadDesigns]);

  // Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    loadDesigns();
  };

  // Preset chips handler
  const handleSelectPreset = (presetId) => {
    setActivePreset(presetId);

    let newFilters = { ...DEFAULT_FILTERS };

    switch (presetId) {
      case "5-story":
        newFilters.floors = "5";
        break;
      case "10-story":
        newFilters.floors = "10";
        break;
      case "garden":
        newFilters.rooftop_type = "Garden";
        break;
      case "garage":
        newFilters.has_garage = true;
        break;
      case "basement":
        newFilters.has_basement = true;
        break;
      case "terrace":
        newFilters.rooftop_type = "Open Terrace";
        break;
      case "helipad":
        newFilters.rooftop_type = "Helipad";
        break;
      case "small-plot":
        newFilters.min_katha = "3.5";
        break;
      case "all":
      default:
        newFilters = { ...DEFAULT_FILTERS };
        break;
    }

    setModalFilters(newFilters);
    loadDesigns(newFilters);
  };

  // Toggle favorite bookmark
  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSearchQuery("");
    setActivePreset("all");
    setModalFilters(DEFAULT_FILTERS);
    setShowOnlyFavorites(false);
    loadDesigns(DEFAULT_FILTERS);
  };

  // Handle card click
  const handleOpenDetail = (design) => {
    setSelectedDesign(design);
    setDetailModalVisible(true);
  };

  // Cross-link to Feasibility Screen
  const handleCheckFeasibility = (design) => {
    setDetailModalVisible(false);
    if (navigation && navigation.navigate) {
      navigation.navigate("Feasibility", {
        floors: design.floors,
        katha: design.min_katha,
      });
    }
  };

  // Filter list by favorites if active
  const displayedDesigns = showOnlyFavorites
    ? designs.filter((d) => favorites.has(d.id))
    : designs;

  // Split into 2 columns for Pinterest staggered masonry grid
  const column1 = displayedDesigns.filter((_, idx) => idx % 2 === 0);
  const column2 = displayedDesigns.filter((_, idx) => idx % 2 === 1);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563eb"]}
            tintColor="#2563eb"
          />
        }
      >
        {/* Hero Banner */}
        <ImageBackground
          source={{ uri: HERO_IMAGE_URL }}
          style={styles.heroImage}
          imageStyle={styles.heroImageRadius}
        >
          <LinearGradient
            colors={["rgba(15,23,42,0.5)", "rgba(15,23,42,0.85)", "#1e293b"]}
            style={styles.heroGradient}
          >
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroEyebrow}>CIVILHUB ARCHITECTURE</Text>
                <Text style={styles.heroTitle}>Smart Design Gallery</Text>
              </View>
              <View style={styles.heroIconWrap}>
                <MaterialCommunityIcons
                  name="floor-plan"
                  size={24}
                  color="#ffffff"
                />
              </View>
            </View>

            <Text style={styles.heroSubtitle}>
              Pinterest-inspired 5 to 10-story architectural models tailored for
              Bangladesh plot sizes, parking rules, and rooftop options.
            </Text>

            {/* Gallery Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBadge}>
                <Text style={styles.statNumber}>{MOCK_DESIGNS.length}</Text>
                <Text style={styles.statLabel}>Architectural Concepts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBadge}>
                <Text style={styles.statNumber}>5 & 10</Text>
                <Text style={styles.statLabel}>Stories Optimized</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBadge}>
                <Text style={styles.statNumber}>3-7+</Text>
                <Text style={styles.statLabel}>Katha Plots</Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Search Bar & Filter Controls Container */}
        <View style={styles.controlsCard}>
          <View style={styles.searchRow}>
            {/* Search Input */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#64748b" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search style, rooftop, area..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={18} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Modal Trigger Button */}
            <TouchableOpacity
              style={[
                styles.filterTriggerButton,
                activeFilterCount > 0 && styles.activeFilterTrigger,
              ]}
              activeOpacity={0.8}
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons
                name="options-outline"
                size={18}
                color={activeFilterCount > 0 ? "#ffffff" : "#1e293b"}
              />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Preset Filter Bar */}
          <QuickFilterBar
            activePreset={activePreset}
            onSelectPreset={handleSelectPreset}
          />

          {/* Tabs: All Designs vs Saved Favorites */}
          <View style={styles.viewToggleRow}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                !showOnlyFavorites && styles.activeTabButton,
              ]}
              onPress={() => setShowOnlyFavorites(false)}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  !showOnlyFavorites && styles.activeTabButtonText,
                ]}
              >
                All Models ({designs.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                showOnlyFavorites && styles.activeTabButton,
              ]}
              onPress={() => setShowOnlyFavorites(true)}
            >
              <Ionicons
                name="heart"
                size={14}
                color={showOnlyFavorites ? "#2563eb" : "#ef4444"}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  showOnlyFavorites && styles.activeTabButtonText,
                ]}
              >
                Favorites ({favorites.size})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCountText}>
            Showing {displayedDesigns.length}{" "}
            {displayedDesigns.length === 1 ? "design" : "designs"}
          </Text>

          {(activeFilterCount > 0 || searchQuery || showOnlyFavorites) && (
            <TouchableOpacity
              onPress={resetAllFilters}
              style={styles.clearAllBtn}
            >
              <Ionicons name="refresh" size={13} color="#2563eb" />
              <Text style={styles.clearAllText}>Reset Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Finding optimal designs...</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && displayedDesigns.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="home-search-outline"
              size={56}
              color="#94a3b8"
            />
            <Text style={styles.emptyTitle}>No matching designs found</Text>
            <Text style={styles.emptySubtitle}>
              Try clearing some filter criteria (such as rooftop type or katha
              threshold) to see more architectural options.
            </Text>
            <TouchableOpacity
              style={styles.emptyResetBtn}
              onPress={resetAllFilters}
            >
              <Text style={styles.emptyResetBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pinterest-style 2-Column Staggered Masonry Grid */}
        {!loading && displayedDesigns.length > 0 && (
          <View style={styles.gridContainer}>
            {/* Column 1 */}
            <View style={styles.column}>
              {column1.map((item) => (
                <DesignCard
                  key={item.id}
                  design={item}
                  onPress={handleOpenDetail}
                  isFavorite={favorites.has(item.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </View>

            {/* Column 2 */}
            <View style={styles.column}>
              {column2.map((item) => (
                <DesignCard
                  key={item.id}
                  design={item}
                  onPress={handleOpenDetail}
                  isFavorite={favorites.has(item.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </View>
          </View>
        )}

        {/* Bottom spacing for smooth tab clearance */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Multi-Parameter Filter Modal */}
      <DesignFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        initialFilters={modalFilters}
        onApply={(newFilters) => {
          setModalFilters(newFilters);
          setActivePreset("custom");
          loadDesigns(newFilters);
        }}
      />

      {/* Architectural Design Detail Modal */}
      <DesignDetailModal
        visible={detailModalVisible}
        design={selectedDesign}
        onClose={() => setDetailModalVisible(false)}
        isFavorite={selectedDesign ? favorites.has(selectedDesign.id) : false}
        onToggleFavorite={toggleFavorite}
        onCheckFeasibility={handleCheckFeasibility}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroImage: {
    width: "100%",
    height: 250,
  },
  heroImageRadius: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroGradient: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 18,
    paddingTop: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroEyebrow: {
    color: "#93c5fd",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(37, 99, 235, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  heroSubtitle: {
    color: "#e2e8f0",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    maxWidth: "95%",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  statBadge: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  controlsCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 18,
    paddingTop: 14,
    paddingBottom: 8,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    gap: 8,
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#1e293b",
    marginLeft: 8,
  },
  filterTriggerButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    position: "relative",
  },
  activeFilterTrigger: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  filterBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  viewToggleRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
    gap: 8,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: "#eff6ff",
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  activeTabButtonText: {
    color: "#2563eb",
    fontWeight: "700",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
  },
  resultsCountText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  clearAllText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 6,
  },
  emptyResetBtn: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyResetBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  gridContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 12,
  },
  column: {
    flex: 1,
  },
});
