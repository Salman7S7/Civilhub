// src/components/designs/AddDesignModal.jsx
// -----------------------------------------------------------------------------
// Interactive modal to upload & publish custom architectural building designs.
// Allows landowners/architects to submit images, stories, Katha size,
// rooms, bathrooms, balconies, and detailed dining/living space layouts.
// -----------------------------------------------------------------------------

import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { saveCustomDesign } from "../../services/designService";

const SAMPLE_IMAGE_PRESETS = [
  {
    label: "Modern Glass",
    url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
  },
  {
    label: "Red Brick Villa",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  },
  {
    label: "Luxury Duplex",
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  },
  {
    label: "Urban Tower",
    url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&q=80",
  },
];

export default function AddDesignModal({ visible, onClose, onDesignCreated }) {
  const [title, setTitle] = useState("");
  const [architecturalStyle, setArchitecturalStyle] = useState("Modern Contemporary");
  const [floors, setFloors] = useState("");
  const [minKatha, setMinKatha] = useState("");
  const [builtAreaSqft, setBuiltAreaSqft] = useState("");
  const [unitsPerFloor, setUnitsPerFloor] = useState("2");
  const [unitSizeSqft, setUnitSizeSqft] = useState("");
  const [bedrooms, setBedrooms] = useState("3");
  const [bathrooms, setBathrooms] = useState("3");
  const [balconies, setBalconies] = useState("3");
  const [diningSpace, setDiningSpace] = useState("");
  const [drawingSpace, setDrawingSpace] = useState("");
  const [kitchenSpace, setKitchenSpace] = useState("");
  const [hasBasement, setHasBasement] = useState(false);
  const [hasGarage, setHasGarage] = useState(true);
  const [parkingCapacity, setParkingCapacity] = useState("6");
  const [rooftopType, setRooftopType] = useState("Garden");
  const [imageUrl, setImageUrl] = useState(SAMPLE_IMAGE_PRESETS[0].url);
  const [featuresText, setFeaturesText] = useState("Natural Ventilation, Rooftop Garden, Covered Parking");
  const [saving, setSaving] = useState(false);

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant photo library access to upload photos.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUrl(result.assets[0].uri);
      }
    } catch (err) {
      console.warn("Image picker error:", err);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant camera access to take plot/building photos.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUrl(result.assets[0].uri);
      }
    } catch (err) {
      console.warn("Camera error:", err);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a title for the architectural design.");
      return;
    }
    if (!floors.trim() || isNaN(parseInt(floors, 10)) || parseInt(floors, 10) <= 0) {
      Alert.alert("Invalid Stories", "Please enter a valid positive number of floors.");
      return;
    }
    if (!minKatha.trim() || isNaN(parseFloat(minKatha)) || parseFloat(minKatha) <= 0) {
      Alert.alert("Invalid Katha", "Please enter a valid plot size in Katha (e.g. 4.5).");
      return;
    }

    setSaving(true);
    try {
      const featuresArray = featuresText
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);

      const newDesign = await saveCustomDesign({
        title: title.trim(),
        architectural_style: architecturalStyle.trim() || "Modern Architectural",
        floors: parseInt(floors.trim(), 10),
        min_katha: parseFloat(minKatha.trim()),
        built_area_sqft: builtAreaSqft ? parseInt(builtAreaSqft.trim(), 10) : parseInt(floors, 10) * 2200,
        units_per_floor: parseInt(unitsPerFloor.trim(), 10) || 2,
        unit_size_sqft: unitSizeSqft ? parseInt(unitSizeSqft.trim(), 10) : 1500,
        bedrooms: parseInt(bedrooms.trim(), 10) || 3,
        bathrooms: parseInt(bathrooms.trim(), 10) || 3,
        balconies: parseInt(balconies.trim(), 10) || 2,
        dining_space: diningSpace.trim() || "Dedicated separate dining area with wash basin.",
        drawing_space: drawingSpace.trim() || "Spacious formal drawing lounge with attached veranda.",
        kitchen_space: kitchenSpace.trim() || "Modern modular kitchen with utility balcony.",
        has_basement: hasBasement,
        has_garage: hasGarage,
        parking_capacity: hasGarage ? parseInt(parkingCapacity.trim(), 10) || 4 : 0,
        rooftop_type: rooftopType,
        image_url: imageUrl,
        description: `Custom architectural model featuring ${floors} stories on a ${minKatha} Katha plot with ${bedrooms} beds and dedicated dining space.`,
        features: featuresArray.length > 0 ? featuresArray : ["Custom Architectural Concept", "BNBC Compliant Ready"],
      });

      setSaving(false);
      Alert.alert("Success!", "Design has been uploaded and added to the gallery.");
      if (onDesignCreated) {
        onDesignCreated(newDesign);
      }
      onClose();
    } catch (err) {
      setSaving(false);
      Alert.alert("Upload Failed", err.message || "Failed to save design.");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Upload Design</Text>
              <Text style={styles.headerSubtitle}>
                Add your custom architectural model & specifications
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Image Preview & Upload Buttons */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionLabel}>1. Architectural Elevation Image</Text>
              <View style={styles.imagePreviewWrap}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlayBadge}>
                  <Text style={styles.imageOverlayText}>Preview</Text>
                </View>
              </View>

              <View style={styles.imageButtonsRow}>
                <TouchableOpacity
                  style={styles.imageActionBtn}
                  onPress={handlePickFromGallery}
                  activeOpacity={0.8}
                >
                  <Ionicons name="images-outline" size={16} color="#2563eb" />
                  <Text style={styles.imageActionBtnText}>Photo Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.imageActionBtn}
                  onPress={handleTakePhoto}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera-outline" size={16} color="#059669" />
                  <Text style={styles.imageActionBtnText}>Camera</Text>
                </TouchableOpacity>
              </View>

              {/* Sample Presets */}
              <Text style={styles.presetLabel}>Or select a sample image:</Text>
              <View style={styles.presetRow}>
                {SAMPLE_IMAGE_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset.label}
                    style={[
                      styles.presetChip,
                      imageUrl === preset.url && styles.activePresetChip,
                    ]}
                    onPress={() => setImageUrl(preset.url)}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        imageUrl === preset.url && styles.activePresetChipText,
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.urlInputWrap}>
                <Ionicons name="link-outline" size={16} color="#94a3b8" />
                <TextInput
                  style={styles.urlInput}
                  placeholder="Or paste direct image URL (https://...)"
                  placeholderTextColor="#94a3b8"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                />
              </View>
            </View>

            {/* Basic Specifications */}
            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>2. Basic Building Specs</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Building Title *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Uttara Lakeview Tower"
                  placeholderTextColor="#94a3b8"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Architectural Style</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Contemporary Biophilic / Exposed Brick"
                  placeholderTextColor="#94a3b8"
                  value={architecturalStyle}
                  onChangeText={setArchitecturalStyle}
                />
              </View>

              <View style={styles.rowTwoCols}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Stories / Floors *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 7"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    value={floors}
                    onChangeText={(t) => setFloors(t.replace(/[^0-9]/g, ""))}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Min Katha (Plot) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 4.5"
                    placeholderTextColor="#94a3b8"
                    keyboardType="decimal-pad"
                    value={minKatha}
                    onChangeText={(t) => setMinKatha(t.replace(/[^0-9.]/g, ""))}
                  />
                </View>
              </View>

              <View style={styles.rowTwoCols}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Built Area (sqft)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 16500"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    value={builtAreaSqft}
                    onChangeText={(t) => setBuiltAreaSqft(t.replace(/[^0-9]/g, ""))}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Units per Floor</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 2"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    value={unitsPerFloor}
                    onChangeText={(t) => setUnitsPerFloor(t.replace(/[^0-9]/g, ""))}
                  />
                </View>
              </View>
            </View>

            {/* Unit Layout & Room Specifications */}
            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>3. Unit Layout (Per Flat)</Text>

              <View style={styles.rowThreeCols}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Bedrooms</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 3"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    value={bedrooms}
                    onChangeText={(t) => setBedrooms(t.replace(/[^0-9]/g, ""))}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Bathrooms</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 3"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    value={bathrooms}
                    onChangeText={(t) => setBathrooms(t.replace(/[^0-9]/g, ""))}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Balconies</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 3"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    value={balconies}
                    onChangeText={(t) => setBalconies(t.replace(/[^0-9]/g, ""))}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Unit Approx Size (sqft)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 1450"
                  placeholderTextColor="#94a3b8"
                  keyboardType="number-pad"
                  value={unitSizeSqft}
                  onChangeText={(t) => setUnitSizeSqft(t.replace(/[^0-9]/g, ""))}
                />
              </View>

              {/* Detailed Space Descriptions */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🍽️ Dining Space Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="e.g. 14' × 12' formal dining area with wash basin and kitchen pass-through"
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={2}
                  value={diningSpace}
                  onChangeText={setDiningSpace}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🛋️ Drawing & Living Room Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="e.g. Spacious front drawing hall (18' × 14') with south-facing cross ventilation"
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={2}
                  value={drawingSpace}
                  onChangeText={setDrawingSpace}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🍳 Kitchen & Utility Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="e.g. Modular parallel kitchen with dry service balcony and gas line"
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={2}
                  value={kitchenSpace}
                  onChangeText={setKitchenSpace}
                />
              </View>
            </View>

            {/* Amenities & Structural Specs */}
            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>4. Amenities & Toggles</Text>

              {/* Basement Toggle */}
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Subterranean Basement</Text>
                <View style={styles.toggleButtonGroup}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, hasBasement && styles.toggleBtnActive]}
                    onPress={() => setHasBasement(true)}
                  >
                    <Text style={[styles.toggleBtnText, hasBasement && styles.toggleBtnTextActive]}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, !hasBasement && styles.toggleBtnActive]}
                    onPress={() => setHasBasement(false)}
                  >
                    <Text style={[styles.toggleBtnText, !hasBasement && styles.toggleBtnTextActive]}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Garage Toggle */}
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Car Garage / Parking</Text>
                <View style={styles.toggleButtonGroup}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, hasGarage && styles.toggleBtnActive]}
                    onPress={() => setHasGarage(true)}
                  >
                    <Text style={[styles.toggleBtnText, hasGarage && styles.toggleBtnTextActive]}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, !hasGarage && styles.toggleBtnActive]}
                    onPress={() => setHasGarage(false)}
                  >
                    <Text style={[styles.toggleBtnText, !hasGarage && styles.toggleBtnTextActive]}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {hasGarage && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Parking Capacity (Bays)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 8"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    value={parkingCapacity}
                    onChangeText={(t) => setParkingCapacity(t.replace(/[^0-9]/g, ""))}
                  />
                </View>
              )}

              {/* Rooftop Layout */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Rooftop Architecture</Text>
                <View style={styles.segmentedRow}>
                  {["Garden", "Open Terrace", "Helipad"].map((rt) => (
                    <TouchableOpacity
                      key={rt}
                      style={[styles.segmentBtn, rooftopType === rt && styles.segmentBtnActive]}
                      onPress={() => setRooftopType(rt)}
                    >
                      <Text style={[styles.segmentText, rooftopType === rt && styles.segmentTextActive]}>
                        {rt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Key Features Tags */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Key Features (Comma separated)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Rooftop Hydroponics, EV Charger, High-Speed Lift"
                  placeholderTextColor="#94a3b8"
                  value={featuresText}
                  onChangeText={setFeaturesText}
                />
              </View>
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Bottom Submit Bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={saving}
              activeOpacity={0.88}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={18} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Publish Design</Text>
                </>
              )}
            </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 54 : 20,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  imageSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 18,
  },
  imagePreviewWrap: {
    position: "relative",
    width: "100%",
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#e2e8f0",
    marginBottom: 12,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  imageOverlayBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageOverlayText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  imageButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  imageActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  imageActionBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  presetLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
    fontWeight: "500",
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  presetChip: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  activePresetChip: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  activePresetChipText: {
    color: "#2563eb",
  },
  urlInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  urlInput: {
    flex: 1,
    fontSize: 12,
    color: "#0f172a",
  },
  formSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 14,
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
    minHeight: 64,
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
    marginBottom: 14,
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
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  submitBtn: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
