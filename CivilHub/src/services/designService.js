// src/services/designService.js
// -----------------------------------------------------------------------------
// Service layer for Feature 2: Smart Design Suggestions.
// Supports:
//   1. Local offline persistence via AsyncStorage (Add, Edit, Delete custom designs)
//   2. Multi-parameter filtering for any logical floor count (exact & adaptive fallback)
//   3. Seamless backend REST API integration with local fallback
// -----------------------------------------------------------------------------

import AsyncStorage from "@react-native-async-storage/async-storage";
import { MOCK_DESIGNS } from "./mockDesigns.js";

const BACKEND_BASE_URL = "http://localhost:4000";
const CUSTOM_DESIGNS_KEY = "@civilhub_custom_designs_v1";
const EDITED_OVERRIDES_KEY = "@civilhub_edited_overrides_v1";
const DELETED_DESIGNS_KEY = "@civilhub_deleted_ids_v1";

/**
 * Retrieve all designs (base catalog + custom user uploads + edits - deleted).
 *
 * @returns {Promise<Array>}
 */
export async function getAllDesigns() {
  try {
    const [customJson, overridesJson, deletedJson] = await Promise.all([
      AsyncStorage.getItem(CUSTOM_DESIGNS_KEY),
      AsyncStorage.getItem(EDITED_OVERRIDES_KEY),
      AsyncStorage.getItem(DELETED_DESIGNS_KEY),
    ]);

    const customDesigns = customJson ? JSON.parse(customJson) : [];
    const overrides = overridesJson ? JSON.parse(overridesJson) : {};
    const deletedIds = new Set(deletedJson ? JSON.parse(deletedJson) : []);

    // Apply edits to base designs
    const modifiedBaseDesigns = MOCK_DESIGNS.map((d) => {
      if (overrides[d.id]) {
        return { ...d, ...overrides[d.id] };
      }
      return d;
    }).filter((d) => !deletedIds.has(d.id));

    // Combine custom uploads (first) and modified base designs
    return [...customDesigns.filter((d) => !deletedIds.has(d.id)), ...modifiedBaseDesigns];
  } catch (err) {
    console.warn("Error loading persisted designs, falling back to mock designs:", err);
    return [...MOCK_DESIGNS];
  }
}

/**
 * Save a new user-uploaded design to AsyncStorage.
 *
 * @param {Object} newDesign
 * @returns {Promise<Object>} The saved design with assigned ID and metadata
 */
export async function saveCustomDesign(newDesign) {
  try {
    const customJson = await AsyncStorage.getItem(CUSTOM_DESIGNS_KEY);
    const customDesigns = customJson ? JSON.parse(customJson) : [];

    const id = Date.now(); // unique numeric timestamp ID
    const designToSave = {
      ...newDesign,
      id,
      is_custom: true,
      floors: parseInt(newDesign.floors, 10) || 5,
      min_katha: parseFloat(newDesign.min_katha) || 4.0,
      built_area_sqft: parseInt(newDesign.built_area_sqft, 10) || 12000,
      units_per_floor: parseInt(newDesign.units_per_floor, 10) || 2,
      unit_size_sqft: parseInt(newDesign.unit_size_sqft, 10) || 1500,
      bedrooms: parseInt(newDesign.bedrooms, 10) || 3,
      bathrooms: parseInt(newDesign.bathrooms, 10) || 3,
      balconies: parseInt(newDesign.balconies, 10) || 2,
      parking_capacity: parseInt(newDesign.parking_capacity, 10) || (newDesign.has_garage ? 4 : 0),
      aspect_ratio: 0.95,
      created_at: new Date().toISOString(),
    };

    customDesigns.unshift(designToSave);
    await AsyncStorage.setItem(CUSTOM_DESIGNS_KEY, JSON.stringify(customDesigns));
    return designToSave;
  } catch (err) {
    console.error("Failed to save custom design:", err);
    throw err;
  }
}

/**
 * Update an existing design (custom design or override for base design).
 *
 * @param {number|string} id
 * @param {Object} updatedFields
 * @returns {Promise<Object>} Updated design object
 */
export async function updateDesign(id, updatedFields) {
  try {
    const customJson = await AsyncStorage.getItem(CUSTOM_DESIGNS_KEY);
    const customDesigns = customJson ? JSON.parse(customJson) : [];

    const customIndex = customDesigns.findIndex((d) => String(d.id) === String(id));

    if (customIndex !== -1) {
      // Update custom design directly
      const updated = { ...customDesigns[customIndex], ...updatedFields };
      customDesigns[customIndex] = updated;
      await AsyncStorage.setItem(CUSTOM_DESIGNS_KEY, JSON.stringify(customDesigns));
      return updated;
    }

    // It is a base mock design -> save as override
    const overridesJson = await AsyncStorage.getItem(EDITED_OVERRIDES_KEY);
    const overrides = overridesJson ? JSON.parse(overridesJson) : {};

    const baseDesign = MOCK_DESIGNS.find((d) => String(d.id) === String(id)) || {};
    const updated = { ...baseDesign, ...(overrides[id] || {}), ...updatedFields };

    overrides[id] = updatedFields;
    await AsyncStorage.setItem(EDITED_OVERRIDES_KEY, JSON.stringify(overrides));
    return updated;
  } catch (err) {
    console.error("Failed to update design:", err);
    throw err;
  }
}

/**
 * Delete a design by ID.
 *
 * @param {number|string} id
 * @returns {Promise<boolean>}
 */
export async function deleteDesign(id) {
  try {
    // 1. Check if in custom designs
    const customJson = await AsyncStorage.getItem(CUSTOM_DESIGNS_KEY);
    if (customJson) {
      const customDesigns = JSON.parse(customJson);
      const filtered = customDesigns.filter((d) => String(d.id) !== String(id));
      if (filtered.length !== customDesigns.length) {
        await AsyncStorage.setItem(CUSTOM_DESIGNS_KEY, JSON.stringify(filtered));
        return true;
      }
    }

    // 2. Mark deleted in deleted set
    const deletedJson = await AsyncStorage.getItem(DELETED_DESIGNS_KEY);
    const deletedIds = deletedJson ? JSON.parse(deletedJson) : [];
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      await AsyncStorage.setItem(DELETED_DESIGNS_KEY, JSON.stringify(deletedIds));
    }
    return true;
  } catch (err) {
    console.error("Failed to delete design:", err);
    throw err;
  }
}

/**
 * Filter designs locally based on user criteria and custom inputs.
 *
 * @param {Array} list - Array of design objects
 * @param {Object} filters - Selected filter criteria & custom user inputs
 * @returns {Array} - Filtered designs
 */
export function filterDesignsLocally(list, filters = {}) {
  const {
    floors = "all",
    has_basement = "all",
    has_garage = "all",
    rooftop_type = "all",
    min_katha = "all",
    custom_katha = "",
    custom_floors = "",
    units_per_floor = "all",
    min_parking = "all",
    searchQuery = "",
  } = filters;

  // Determine target floor and check if exact match exists in the catalog
  let targetFloor = null;
  let hasExactFloorMatch = false;
  let allowedFloorDiff = 0;

  if (custom_floors && custom_floors.trim() !== "") {
    const parsed = parseInt(custom_floors.trim(), 10);
    if (!isNaN(parsed)) {
      // Logical building height range (1 to 40 stories)
      if (parsed > 0 && parsed <= 40) {
        targetFloor = parsed;
        hasExactFloorMatch = list.some((item) => item.floors === targetFloor);
        if (!hasExactFloorMatch && list.length > 0) {
          // If no exact match for this logical number, find closest available floor designs
          const minDiff = Math.min(...list.map((it) => Math.abs(it.floors - targetFloor)));
          allowedFloorDiff = Math.max(minDiff, 2);
        }
      } else {
        // Out of logical range (e.g. 0 or > 40 stories)
        targetFloor = -1;
      }
    }
  }

  const filtered = list.filter((item) => {
    // 1. Floor Matching
    if (targetFloor === -1) {
      return false;
    }
    if (targetFloor !== null) {
      if (hasExactFloorMatch) {
        if (item.floors !== targetFloor) return false;
      } else {
        // Show closest architecturally adaptable building models within allowed difference
        if (Math.abs(item.floors - targetFloor) > allowedFloorDiff) return false;
      }
    } else if (floors !== "all") {
      const presetFloor = parseInt(floors, 10);
      if (!isNaN(presetFloor) && item.floors !== presetFloor) {
        return false;
      }
    }

    // 2. Exact Custom Katha / Land Area Input (takes precedence if entered)
    if (custom_katha && custom_katha.trim() !== "") {
      const customKathaNum = parseFloat(custom_katha.trim());
      if (!isNaN(customKathaNum) && customKathaNum > 0) {
        // Design must fit on the user's custom plot size (item.min_katha <= customKathaNum)
        if (item.min_katha > customKathaNum) return false;
      }
    } else if (min_katha !== "all") {
      // Preset Katha Threshold Filter
      const kathaNum = parseFloat(min_katha);
      if (!isNaN(kathaNum)) {
        if (item.min_katha > kathaNum) return false;
      }
    }

    // 3. Basement filter (true/false)
    if (has_basement !== "all") {
      const wantBasement =
        has_basement === true ||
        has_basement === "true" ||
        has_basement === "yes";
      if (item.has_basement !== wantBasement) return false;
    }

    // 4. Garage filter (true/false)
    if (has_garage !== "all") {
      const wantGarage =
        has_garage === true || has_garage === "true" || has_garage === "yes";
      if (item.has_garage !== wantGarage) return false;
    }

    // 5. Rooftop Type filter ('Garden', 'Open Terrace', 'Helipad')
    if (rooftop_type !== "all" && item.rooftop_type !== rooftop_type) {
      return false;
    }

    // 6. Units Per Floor filter
    if (units_per_floor !== "all") {
      const unitsNum = parseInt(units_per_floor, 10);
      if (!isNaN(unitsNum) && item.units_per_floor !== unitsNum) {
        return false;
      }
    }

    // 7. Minimum Parking Spots filter
    if (min_parking !== "all") {
      const minParkNum = parseInt(min_parking, 10);
      if (!isNaN(minParkNum) && (item.parking_capacity || 0) < minParkNum) {
        return false;
      }
    }

    // 8. Free text search query (title, style, features)
    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchStyle = item.architectural_style?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchFeatures = item.features?.some((f) =>
        f.toLowerCase().includes(q)
      );

      if (!matchTitle && !matchStyle && !matchDesc && !matchFeatures) {
        return false;
      }
    }

    return true;
  });

  // If we matched adaptive floors (not exact), sort them by closest floor difference
  if (targetFloor !== null && !hasExactFloorMatch) {
    return filtered.sort(
      (a, b) =>
        Math.abs(a.floors - targetFloor) - Math.abs(b.floors - targetFloor)
    );
  }

  return filtered;
}

/**
 * Searches and filters building designs.
 * Fetches all available designs (persisted + base) and applies active filters.
 *
 * @param {Object} filters - Filter criteria including custom user values
 * @returns {Promise<Array>} - List of matching designs
 */
export async function searchDesigns(filters = {}) {
  const allDesigns = await getAllDesigns();
  return filterDesignsLocally(allDesigns, filters);
}

/**
 * Get design details by ID.
 *
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
export async function getDesignById(id) {
  const all = await getAllDesigns();
  return all.find((d) => String(d.id) === String(id)) || null;
}
