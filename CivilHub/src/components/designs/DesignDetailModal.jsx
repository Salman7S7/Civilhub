// src/components/designs/DesignDetailModal.jsx
// -----------------------------------------------------------------------------
// Detailed Architectural Specification modal showing full design rendering,
// dimensional requirements, structural breakdown, space utilization notes,
// and an in-place Edit Mode allowing landowners to view and customize specs.
// -----------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { updateDesign, deleteDesign } from "../../services/designService";
import {
  estimateConstructionCost,
  formatBDT,
} from "../../services/costEstimator";

export default function DesignDetailModal({
  visible,
  design,
  onClose,
  isFavorite = false,
  onToggleFavorite,
  onCheckFeasibility,
  onEstimateCost,
  onDesignUpdated,
  onDesignDeleted,
  onConsultExpert,
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form states
  const [editTitle, setEditTitle] = useState("");
  const [editStyle, setEditStyle] = useState("");
  const [editFloors, setEditFloors] = useState("");
  const [editMinKatha, setEditMinKatha] = useState("");
  const [editBuiltArea, setEditBuiltArea] = useState("");
  const [editUnitsPerFloor, setEditUnitsPerFloor] = useState("");
  const [editUnitSize, setEditUnitSize] = useState("");
  const [editBedrooms, setEditBedrooms] = useState("");
  const [editBathrooms, setEditBathrooms] = useState("");
  const [editBalconies, setEditBalconies] = useState("");
  const [editDiningSpace, setEditDiningSpace] = useState("");
  const [editDrawingSpace, setEditDrawingSpace] = useState("");
  const [editKitchenSpace, setEditKitchenSpace] = useState("");
  const [editHasBasement, setEditHasBasement] = useState(false);
  const [editHasGarage, setEditHasGarage] = useState(true);
  const [editParkingCapacity, setEditParkingCapacity] = useState("");
  const [editRooftopType, setEditRooftopType] = useState("Garden");

  // Sync draft edit states whenever design changes or modal opens
  useEffect(() => {
    if (design) {
      setEditTitle(design.title || "");
      setEditStyle(design.architectural_style || "");
      setEditFloors(design.floors ? String(design.floors) : "5");
      setEditMinKatha(design.min_katha ? String(design.min_katha) : "4.0");
      setEditBuiltArea(design.built_area_sqft ? String(design.built_area_sqft) : "12000");
      setEditUnitsPerFloor(design.units_per_floor ? String(design.units_per_floor) : "2");
      setEditUnitSize(design.unit_size_sqft ? String(design.unit_size_sqft) : "1500");
      setEditBedrooms(design.bedrooms ? String(design.bedrooms) : "3");
      setEditBathrooms(design.bathrooms ? String(design.bathrooms) : "3");
      setEditBalconies(design.balconies ? String(design.balconies) : "2");
      setEditDiningSpace(design.dining_space || "");
      setEditDrawingSpace(design.drawing_space || "");
      setEditKitchenSpace(design.kitchen_space || "");
      setEditHasBasement(Boolean(design.has_basement));
      setEditHasGarage(Boolean(design.has_garage));
      setEditParkingCapacity(design.parking_capacity ? String(design.parking_capacity) : "4");
      setEditRooftopType(design.rooftop_type || "Garden");
      setIsEditing(false);
    }
  }, [design, visible]);

  if (!design) return null;

  const parsedFloors = parseInt(editFloors, 10) || design.floors || 5;
  const parsedBuiltArea = parseInt(editBuiltArea, 10) || design.built_area_sqft;
  const perFloorSqft =
    parsedBuiltArea && parsedFloors
      ? Math.round(parsedBuiltArea / parsedFloors)
      : (design.units_per_floor || 2) * (design.unit_size_sqft || 1200) || 1200;

  const currentHasBasement = isEditing ? editHasBasement : Boolean(design.has_basement);
  const currentHasGarage = isEditing ? editHasGarage : Boolean(design.has_garage);

  const stdEstimate = estimateConstructionCost({
    floors: parsedFloors,
    floorAreaSqft: perFloorSqft,
    quality: "standard",
    hasBasement: currentHasBasement,
    hasGarage: currentHasGarage,
  });

  const luxEstimate = estimateConstructionCost({
    floors: parsedFloors,
    floorAreaSqft: perFloorSqft,
    quality: "luxury",
    hasBasement: currentHasBasement,
    hasGarage: currentHasGarage,
  });

  const isTenStory = parsedFloors >= 10;

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

  const handleSaveEdits = async () => {
    if (!editTitle.trim()) {
      Alert.alert("Error", "Design title cannot be empty.");
      return;
    }
    const parsedFloors = parseInt(editFloors, 10);
    if (isNaN(parsedFloors) || parsedFloors <= 0) {
      Alert.alert("Error", "Please enter a valid story/floor count.");
      return;
    }

    setSaving(true);
    try {
      const updatedData = {
        title: editTitle.trim(),
        architectural_style: editStyle.trim(),
        floors: parsedFloors,
        min_katha: parseFloat(editMinKatha) || design.min_katha,
        built_area_sqft: parseInt(editBuiltArea, 10) || design.built_area_sqft,
        units_per_floor: parseInt(editUnitsPerFloor, 10) || design.units_per_floor,
        unit_size_sqft: parseInt(editUnitSize, 10) || design.unit_size_sqft,
        bedrooms: parseInt(editBedrooms, 10) || design.bedrooms,
        bathrooms: parseInt(editBathrooms, 10) || design.bathrooms,
        balconies: parseInt(editBalconies, 10) || design.balconies,
        dining_space: editDiningSpace.trim(),
        drawing_space: editDrawingSpace.trim(),
        kitchen_space: editKitchenSpace.trim(),
        has_basement: editHasBasement,
        has_garage: editHasGarage,
        parking_capacity: editHasGarage ? parseInt(editParkingCapacity, 10) || 4 : 0,
        rooftop_type: editRooftopType,
      };

      const result = await updateDesign(design.id, updatedData);
      setSaving(false);
      setIsEditing(false);
      Alert.alert("Success", "Design specifications updated successfully!");
      if (onDesignUpdated) {
        onDesignUpdated(result);
      }
    } catch (err) {
      setSaving(false);
      Alert.alert("Error", err.message || "Failed to update design.");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Design",
      "Are you sure you want to delete this design from your catalog?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDesign(design.id);
              Alert.alert("Deleted", "Design has been removed.");
              if (onDesignDeleted) {
                onDesignDeleted(design.id);
              }
              onClose();
            } catch (err) {
              Alert.alert("Error", "Could not delete design.");
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
                colors={["rgba(15,23,42,0.65)", "transparent", "rgba(15,23,42,0.9)"]}
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
                    {/* Toggle Edit Button */}
                    <TouchableOpacity
                      style={[styles.iconCircle, isEditing && styles.iconCircleActive]}
                      onPress={() => setIsEditing(!isEditing)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={isEditing ? "eye-outline" : "create-outline"}
                        size={18}
                        color="#ffffff"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.iconCircle, { marginLeft: 8 }]}
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
                      {isEditing ? editFloors || design.floors : design.floors} Stories High
                    </Text>
                  </View>

                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>
                      {isEditing ? editStyle || design.architectural_style : design.architectural_style}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Content Body: Either Edit Form OR View Details */}
            {isEditing ? (
              /* ============================================================
                 EDIT MODE
                 ============================================================ */
              <View style={styles.editBody}>
                <View style={styles.editHeaderRow}>
                  <Text style={styles.editHeaderTitle}>✏️ Edit Design Details</Text>
                  <Text style={styles.editHeaderSubtitle}>
                    Customize floor count, rooms, and space descriptions
                  </Text>
                </View>

                {/* Edit Section 1: Title & Style */}
                <View style={styles.editCard}>
                  <Text style={styles.editCardHeading}>1. Title & Style</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Title</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editTitle}
                      onChangeText={setEditTitle}
                      placeholder="Design Title"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Architectural Style</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editStyle}
                      onChangeText={setEditStyle}
                      placeholder="e.g. Modern Tropical"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                </View>

                {/* Edit Section 2: Building Dimensions */}
                <View style={styles.editCard}>
                  <Text style={styles.editCardHeading}>2. Building Dimensions</Text>
                  <View style={styles.rowTwoCols}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Stories / Floors</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editFloors}
                        onChangeText={(t) => setEditFloors(t.replace(/[^0-9]/g, ""))}
                        keyboardType="number-pad"
                        placeholder="e.g. 8"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Min Katha (Plot)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editMinKatha}
                        onChangeText={(t) => setEditMinKatha(t.replace(/[^0-9.]/g, ""))}
                        keyboardType="decimal-pad"
                        placeholder="e.g. 4.5"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </View>

                  <View style={styles.rowTwoCols}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Built Area (sqft)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editBuiltArea}
                        onChangeText={(t) => setEditBuiltArea(t.replace(/[^0-9]/g, ""))}
                        keyboardType="number-pad"
                        placeholder="e.g. 18000"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Units per Floor</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editUnitsPerFloor}
                        onChangeText={(t) => setEditUnitsPerFloor(t.replace(/[^0-9]/g, ""))}
                        keyboardType="number-pad"
                        placeholder="e.g. 2"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </View>
                </View>

                {/* Edit Section 3: Room Counts (Per Unit) */}
                <View style={styles.editCard}>
                  <Text style={styles.editCardHeading}>3. Unit Layout Counts</Text>
                  <View style={styles.rowThreeCols}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Bedrooms</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editBedrooms}
                        onChangeText={(t) => setEditBedrooms(t.replace(/[^0-9]/g, ""))}
                        keyboardType="number-pad"
                        placeholder="3"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Bathrooms</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editBathrooms}
                        onChangeText={(t) => setEditBathrooms(t.replace(/[^0-9]/g, ""))}
                        keyboardType="number-pad"
                        placeholder="3"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Balconies</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editBalconies}
                        onChangeText={(t) => setEditBalconies(t.replace(/[^0-9]/g, ""))}
                        keyboardType="number-pad"
                        placeholder="2"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Unit Approx Size (sqft)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editUnitSize}
                      onChangeText={(t) => setEditUnitSize(t.replace(/[^0-9]/g, ""))}
                      keyboardType="number-pad"
                      placeholder="e.g. 1500"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                </View>

                {/* Edit Section 4: Dining, Living & Kitchen Descriptions */}
                <View style={styles.editCard}>
                  <Text style={styles.editCardHeading}>4. Space Descriptions</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>🍽️ Dining Space Description</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={editDiningSpace}
                      onChangeText={setEditDiningSpace}
                      multiline
                      numberOfLines={2}
                      placeholder="e.g. 14' × 12' separate formal dining space with wash corner"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>🛋️ Drawing / Living Lounge</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={editDrawingSpace}
                      onChangeText={setEditDrawingSpace}
                      multiline
                      numberOfLines={2}
                      placeholder="e.g. Spacious formal drawing room with front balcony"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>🍳 Kitchen & Utility</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={editKitchenSpace}
                      onChangeText={setEditKitchenSpace}
                      multiline
                      numberOfLines={2}
                      placeholder="e.g. Modular kitchen with exhaust duct and utility balcony"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                </View>

                {/* Edit Section 5: Amenities */}
                <View style={styles.editCard}>
                  <Text style={styles.editCardHeading}>5. Amenities</Text>
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Basement</Text>
                    <View style={styles.toggleButtonGroup}>
                      <TouchableOpacity
                        style={[styles.toggleBtn, editHasBasement && styles.toggleBtnActive]}
                        onPress={() => setEditHasBasement(true)}
                      >
                        <Text style={[styles.toggleBtnText, editHasBasement && styles.toggleBtnTextActive]}>Yes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.toggleBtn, !editHasBasement && styles.toggleBtnActive]}
                        onPress={() => setEditHasBasement(false)}
                      >
                        <Text style={[styles.toggleBtnText, !editHasBasement && styles.toggleBtnTextActive]}>No</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Car Garage</Text>
                    <View style={styles.toggleButtonGroup}>
                      <TouchableOpacity
                        style={[styles.toggleBtn, editHasGarage && styles.toggleBtnActive]}
                        onPress={() => setEditHasGarage(true)}
                      >
                        <Text style={[styles.toggleBtnText, editHasGarage && styles.toggleBtnTextActive]}>Yes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.toggleBtn, !editHasGarage && styles.toggleBtnActive]}
                        onPress={() => setEditHasGarage(false)}
                      >
                        <Text style={[styles.toggleBtnText, !editHasGarage && styles.toggleBtnTextActive]}>No</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {editHasGarage && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Parking Capacity (Bays)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editParkingCapacity}
                        onChangeText={(t) => setEditParkingCapacity(t.replace(/[^0-9]/g, ""))}
                        keyboardType="number-pad"
                        placeholder="4"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Rooftop Architecture</Text>
                    <View style={styles.segmentedRow}>
                      {["Garden", "Open Terrace", "Helipad"].map((rt) => (
                        <TouchableOpacity
                          key={rt}
                          style={[styles.segmentBtn, editRooftopType === rt && styles.segmentBtnActive]}
                          onPress={() => setEditRooftopType(rt)}
                        >
                          <Text style={[styles.segmentText, editRooftopType === rt && styles.segmentTextActive]}>
                            {rt}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Delete button option */}
                <TouchableOpacity
                  style={styles.deleteDesignBtn}
                  onPress={handleDelete}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  <Text style={styles.deleteDesignBtnText}>Delete this Design</Text>
                </TouchableOpacity>

                <View style={{ height: 120 }} />
              </View>
            ) : (
              /* ============================================================
                 VIEW MODE
                 ============================================================ */
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{design.title}</Text>
                    <Text style={styles.styleText}>{design.architectural_style}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editPillBtn}
                    onPress={() => setIsEditing(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="create-outline" size={14} color="#2563eb" />
                    <Text style={styles.editPillBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>

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
                <Text style={styles.sectionHeading}>Unit Interior & Space Layout (Per Flat)</Text>
                
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

                {/* Estimated Construction Cost Preview Card */}
                <View style={styles.costPreviewCard}>
                  <View style={styles.costPreviewHeader}>
                    <View style={styles.costPreviewIconWrap}>
                      <MaterialCommunityIcons
                        name="calculator-variant"
                        size={20}
                        color="#059669"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.costPreviewTitle}>Estimated Construction Cost</Text>
                      <Text style={styles.costPreviewSubtitle}>
                        Based on ~{perFloorSqft.toLocaleString()} sqft/floor • {parsedFloors} Stories
                      </Text>
                    </View>
                  </View>

                  <View style={styles.costRangeContainer}>
                    <View style={styles.costRangeBox}>
                      <Text style={styles.costRangeLabel}>Standard Quality</Text>
                      <Text style={styles.costRangeValue}>{formatBDT(stdEstimate.total)}</Text>
                      <Text style={styles.costRangeRate}>@ ৳2,200/sqft</Text>
                    </View>
                    <View style={styles.costRangeDivider} />
                    <View style={styles.costRangeBox}>
                      <Text style={styles.costRangeLabel}>Luxury Finish</Text>
                      <Text style={[styles.costRangeValue, { color: "#7c3aed" }]}>
                        {formatBDT(luxEstimate.total)}
                      </Text>
                      <Text style={styles.costRangeRate}>@ ৳3,600/sqft</Text>
                    </View>
                  </View>

                  <View style={styles.costDistributionRow}>
                    <View style={styles.costTagPill}>
                      <Text style={styles.costTagText}>🏗️ Structure ~45%</Text>
                    </View>
                    <View style={styles.costTagPill}>
                      <Text style={styles.costTagText}>🎨 Finishing ~30%</Text>
                    </View>
                    <View style={styles.costTagPill}>
                      <Text style={styles.costTagText}>⚡ MEP ~25%</Text>
                    </View>
                  </View>
                </View>

                {/* Space for Bottom Bar */}
                <View style={{ height: 110 }} />
              </View>
            )}
          </ScrollView>

          {/* Fixed Bottom Action Bar */}
          <View style={styles.bottomBar}>
            {isEditing ? (
              <View style={styles.editBottomBarRow}>
                <TouchableOpacity
                  style={styles.cancelEditBtn}
                  onPress={() => setIsEditing(false)}
                  disabled={saving}
                >
                  <Text style={styles.cancelEditBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveEditBtn}
                  onPress={handleSaveEdits}
                  disabled={saving}
                  activeOpacity={0.88}
                >
                  {saving ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-done" size={18} color="#ffffff" />
                      <Text style={styles.saveEditBtnText}>Save Changes</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                <TouchableOpacity
                  style={styles.feasibilityBtn}
                  activeOpacity={0.88}
                  onPress={() => {
                    onClose();
                    if (onCheckFeasibility) {
                      onCheckFeasibility(design);
                    }
                  }}
                >
                  <Ionicons name="business" size={18} color="#ffffff" />
                  <Text style={styles.feasibilityBtnText}>
                    Check Feasibility for this Model
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.estimateCostBtn}
                  activeOpacity={0.88}
                  onPress={() => {
                    onClose();
                    if (onEstimateCost) {
                      onEstimateCost(design, perFloorSqft);
                    }
                  }}
                >
                  <MaterialCommunityIcons name="calculator-variant" size={18} color="#ffffff" />
                  <Text style={styles.estimateCostBtnText}>
                    Estimate Cost & Customize
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.consultExpertBtn}
                  activeOpacity={0.88}
                  onPress={() => {
                    onClose();
                    if (onConsultExpert) {
                      onConsultExpert(design);
                    }
                  }}
                >
                  <MaterialCommunityIcons name="hard-hat" size={18} color="#ffffff" />
                  <Text style={styles.consultExpertBtnText}>
                    Ask Expert about this Design
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
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
    height: 280,
    backgroundColor: "#0f172a",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 44 : 16,
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
  iconCircleActive: {
    backgroundColor: "#2563eb",
    borderColor: "#ffffff",
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
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 28,
  },
  styleText: {
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "600",
    marginTop: 3,
  },
  editPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  editPillBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563eb",
  },
  description: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginTop: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 22,
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

  /* Edit Mode Styles */
  editBody: {
    padding: 20,
  },
  editHeaderRow: {
    marginBottom: 16,
  },
  editHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  editHeaderSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  editCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  editCardHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  rowTwoCols: {
    flexDirection: "row",
    gap: 10,
  },
  rowThreeCols: {
    flexDirection: "row",
    gap: 8,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  toggleButtonGroup: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: "#2563eb",
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  toggleBtnTextActive: {
    color: "#ffffff",
  },
  segmentedRow: {
    flexDirection: "row",
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  segmentTextActive: {
    color: "#ffffff",
  },
  deleteDesignBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  deleteDesignBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ef4444",
  },

  /* Bottom Bar Styles */
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
  editBottomBarRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelEditBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelEditBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  saveEditBtn: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  saveEditBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  consultExpertBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e293b",
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  consultExpertBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  estimateCostBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  estimateCostBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  costPreviewCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#d1fae5",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  costPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  costPreviewIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
  },
  costPreviewTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  costPreviewSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  costRangeContainer: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  costRangeBox: {
    flex: 1,
    alignItems: "center",
  },
  costRangeDivider: {
    width: 1,
    backgroundColor: "#cbd5e1",
    marginHorizontal: 8,
  },
  costRangeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  costRangeValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#059669",
    marginTop: 4,
  },
  costRangeRate: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 2,
  },
  costDistributionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    justifyContent: "space-between",
  },
  costTagPill: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  costTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
  },
});
