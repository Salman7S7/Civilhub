// src/services/designService.js
// -----------------------------------------------------------------------------
// Service layer for Feature 2: Smart Design Suggestions.
// Directly queries and mutates MySQL database via Backend REST API.
// Supports local offline persistence as a resilient fallback.
// -----------------------------------------------------------------------------

import AsyncStorage from "@react-native-async-storage/async-storage";
import { MOCK_DESIGNS } from "./mockDesigns.js";
import { BACKEND_BASE_URL } from "./apiConfig";

const CUSTOM_DESIGNS_KEY = "@civilhub_custom_designs_v1";
const EDITED_OVERRIDES_KEY = "@civilhub_edited_overrides_v1";
const DELETED_DESIGNS_KEY = "@civilhub_deleted_ids_v1";

/**
 * Retrieve all designs directly from MySQL database (fallback to local if offline).
 *
 * @returns {Promise<Array>}
 */
export async function getAllDesigns() {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/designs`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.designs && Array.isArray(data.designs) && data.designs.length > 0) {
        return data.designs;
      }
    }
  } catch (err) {
    console.warn("Backend API not reachable, falling back to local storage:", err.message);
  }

  // Fallback to local AsyncStorage + mock designs
  try {
    const [customJson, overridesJson, deletedJson] = await Promise.all([
      AsyncStorage.getItem(CUSTOM_DESIGNS_KEY),
      AsyncStorage.getItem(EDITED_OVERRIDES_KEY),
      AsyncStorage.getItem(DELETED_DESIGNS_KEY),
    ]);

    const customDesigns = customJson ? JSON.parse(customJson) : [];
    const overrides = overridesJson ? JSON.parse(overridesJson) : {};
    const deletedIds = new Set(deletedJson ? JSON.parse(deletedJson) : []);

    const modifiedBaseDesigns = MOCK_DESIGNS.map((d) => {
      if (overrides[d.id]) {
        return { ...d, ...overrides[d.id] };
      }
      return d;
    }).filter((d) => !deletedIds.has(d.id));

    return [...customDesigns.filter((d) => !deletedIds.has(d.id)), ...modifiedBaseDesigns];
  } catch (_e) {
    return [...MOCK_DESIGNS];
  }
}

/**
 * Save a new user-uploaded design directly to MySQL database.
 *
 * @param {Object} newDesign
 * @returns {Promise<Object>} The saved design from database
 */
export async function saveCustomDesign(newDesign) {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/designs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDesign),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.design) {
        return data.design;
      }
    }
  } catch (err) {
    console.warn("Could not save to MySQL backend, saving to local storage:", err.message);
  }

  // Fallback to AsyncStorage
  const customJson = await AsyncStorage.getItem(CUSTOM_DESIGNS_KEY);
  const customDesigns = customJson ? JSON.parse(customJson) : [];

  const id = Date.now();
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
}

/**
 * Update an existing design directly in MySQL database.
 *
 * @param {number|string} id
 * @param {Object} updatedFields
 * @returns {Promise<Object>} Updated design object
 */
export async function updateDesign(id, updatedFields) {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/designs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.design) {
        return data.design;
      }
    }
  } catch (err) {
    console.warn("Could not update in MySQL backend, updating in local storage:", err.message);
  }

  // Fallback to local storage
  const customJson = await AsyncStorage.getItem(CUSTOM_DESIGNS_KEY);
  const customDesigns = customJson ? JSON.parse(customJson) : [];
  const customIndex = customDesigns.findIndex((d) => String(d.id) === String(id));

  if (customIndex !== -1) {
    const updated = { ...customDesigns[customIndex], ...updatedFields };
    customDesigns[customIndex] = updated;
    await AsyncStorage.setItem(CUSTOM_DESIGNS_KEY, JSON.stringify(customDesigns));
    return updated;
  }

  const overridesJson = await AsyncStorage.getItem(EDITED_OVERRIDES_KEY);
  const overrides = overridesJson ? JSON.parse(overridesJson) : {};
  const baseDesign = MOCK_DESIGNS.find((d) => String(d.id) === String(id)) || {};
  const updated = { ...baseDesign, ...(overrides[id] || {}), ...updatedFields };

  overrides[id] = updatedFields;
  await AsyncStorage.setItem(EDITED_OVERRIDES_KEY, JSON.stringify(overrides));
  return updated;
}

/**
 * Delete a design directly from MySQL database.
 *
 * @param {number|string} id
 * @returns {Promise<boolean>}
 */
export async function deleteDesign(id) {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/designs/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn("Could not delete from MySQL backend, recording deletion locally:", err.message);
  }

  // Fallback to local storage
  const customJson = await AsyncStorage.getItem(CUSTOM_DESIGNS_KEY);
  const customDesigns = customJson ? JSON.parse(customJson) : [];
  const filtered = customDesigns.filter((d) => String(d.id) !== String(id));

  if (filtered.length !== customDesigns.length) {
    await AsyncStorage.setItem(CUSTOM_DESIGNS_KEY, JSON.stringify(filtered));
  } else {
    const deletedJson = await AsyncStorage.getItem(DELETED_DESIGNS_KEY);
    const deletedIds = deletedJson ? JSON.parse(deletedJson) : [];
    deletedIds.push(id);
    await AsyncStorage.setItem(DELETED_DESIGNS_KEY, JSON.stringify(deletedIds));
  }
  return true;
}

/**
 * Filter designs locally based on user criteria (offline fallback).
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

  let targetFloor = null;
  let hasExactFloorMatch = false;
  let allowedFloorDiff = 0;

  if (custom_floors && custom_floors.trim() !== "") {
    const parsed = parseInt(custom_floors.trim(), 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 40) {
      targetFloor = parsed;
      hasExactFloorMatch = list.some((item) => item.floors === targetFloor);
      if (!hasExactFloorMatch && list.length > 0) {
        const minDiff = Math.min(...list.map((it) => Math.abs(it.floors - targetFloor)));
        allowedFloorDiff = Math.max(minDiff, 2);
      }
    } else {
      targetFloor = -1;
    }
  }

  const filtered = list.filter((item) => {
    if (targetFloor === -1) return false;
    if (targetFloor !== null) {
      if (hasExactFloorMatch) {
        if (item.floors !== targetFloor) return false;
      } else {
        if (Math.abs(item.floors - targetFloor) > allowedFloorDiff) return false;
      }
    } else if (floors !== "all") {
      const presetFloor = parseInt(floors, 10);
      if (!isNaN(presetFloor) && item.floors !== presetFloor) return false;
    }

    if (custom_katha && custom_katha.trim() !== "") {
      const customKathaNum = parseFloat(custom_katha.trim());
      if (!isNaN(customKathaNum) && customKathaNum > 0 && item.min_katha > customKathaNum) return false;
    } else if (min_katha !== "all") {
      const kathaNum = parseFloat(min_katha);
      if (!isNaN(kathaNum) && item.min_katha > kathaNum) return false;
    }

    if (has_basement !== "all") {
      const wantBasement = has_basement === true || has_basement === "true" || has_basement === "yes";
      if (item.has_basement !== wantBasement) return false;
    }

    if (has_garage !== "all") {
      const wantGarage = has_garage === true || has_garage === "true" || has_garage === "yes";
      if (item.has_garage !== wantGarage) return false;
    }

    if (rooftop_type !== "all" && item.rooftop_type !== rooftop_type) return false;

    if (units_per_floor !== "all") {
      const unitsNum = parseInt(units_per_floor, 10);
      if (!isNaN(unitsNum) && item.units_per_floor !== unitsNum) return false;
    }

    if (min_parking !== "all") {
      const minParkNum = parseInt(min_parking, 10);
      if (!isNaN(minParkNum) && (item.parking_capacity || 0) < minParkNum) return false;
    }

    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchStyle = item.architectural_style?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchFeatures = item.features?.some((f) => f.toLowerCase().includes(q));
      if (!matchTitle && !matchStyle && !matchDesc && !matchFeatures) return false;
    }

    return true;
  });

  if (targetFloor !== null && !hasExactFloorMatch) {
    return filtered.sort(
      (a, b) => Math.abs(a.floors - targetFloor) - Math.abs(b.floors - targetFloor)
    );
  }

  return filtered;
}

/**
 * Searches and filters building designs directly via MySQL query.
 *
 * @param {Object} filters - Filter criteria including custom user values
 * @returns {Promise<Array>} - List of matching designs
 */
export async function searchDesigns(filters = {}) {
  try {
    const params = [];
    if (filters.floors && filters.floors !== "all") params.push(`floors=${encodeURIComponent(filters.floors)}`);
    if (filters.custom_floors) params.push(`floors=${encodeURIComponent(filters.custom_floors)}`);
    if (filters.min_katha && filters.min_katha !== "all") params.push(`min_katha=${encodeURIComponent(filters.min_katha)}`);
    if (filters.custom_katha) params.push(`min_katha=${encodeURIComponent(filters.custom_katha)}`);
    if (filters.has_basement !== undefined && filters.has_basement !== "all") params.push(`basement=${encodeURIComponent(filters.has_basement)}`);
    if (filters.has_garage !== undefined && filters.has_garage !== "all") params.push(`garage=${encodeURIComponent(filters.has_garage)}`);
    if (filters.rooftop_type && filters.rooftop_type !== "all") params.push(`rooftop=${encodeURIComponent(filters.rooftop_type)}`);
    if (filters.searchQuery) params.push(`q=${encodeURIComponent(filters.searchQuery)}`);

    const queryString = params.length > 0 ? `?${params.join("&")}` : "";
    const res = await fetch(`${BACKEND_BASE_URL}/api/designs/search${queryString}`);

    if (res.ok) {
      const data = await res.json();
      if (data && data.designs && Array.isArray(data.designs)) {
        return data.designs;
      }
    }
  } catch (err) {
    console.warn("Backend MySQL search failed, using local filter fallback:", err.message);
  }

  const allDesigns = await getAllDesigns();
  return filterDesignsLocally(allDesigns, filters);
}

/**
 * Get design details by ID directly from MySQL.
 *
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
export async function getDesignById(id) {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/designs/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.design) {
        return data.design;
      }
    }
  } catch (_e) {}

  const all = await getAllDesigns();
  return all.find((d) => String(d.id) === String(id)) || null;
}
