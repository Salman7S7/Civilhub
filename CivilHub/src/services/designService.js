// src/services/designService.js
// -----------------------------------------------------------------------------
// Service layer for Feature 2: Smart Design Suggestions.
// Handles multi-parameter filtering (floors, basement, garage, rooftop, min_katha, search)
// as well as custom user-entered values (exact Katha, custom story count, units, parking)
// with seamless fallback to curated local mock data when backend is offline.
// -----------------------------------------------------------------------------

import { MOCK_DESIGNS } from "./mockDesigns.js";

const BACKEND_BASE_URL = "http://localhost:4000";

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

  return list.filter((item) => {
    // 1. Exact Custom Floor Input (takes precedence if entered)
    if (custom_floors && custom_floors.trim() !== "") {
      const customFloorNum = parseInt(custom_floors.trim(), 10);
      if (!isNaN(customFloorNum)) {
        if (item.floors !== customFloorNum) return false;
      }
    } else if (floors !== "all") {
      // Standard Floor Filter (5 or 10)
      if (parseInt(floors, 10) !== item.floors) {
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
}

/**
 * Searches and filters building designs.
 * Attempts to query backend REST API first, falling back to instant local filtering.
 *
 * @param {Object} filters - Filter criteria including custom user values
 * @returns {Promise<Array>} - List of matching designs
 */
export async function searchDesigns(filters = {}) {
  const queryParams = new URLSearchParams();

  const activeFloors = filters.custom_floors || (filters.floors !== "all" ? filters.floors : null);
  if (activeFloors) {
    queryParams.append("floors", activeFloors);
  }

  const activeKatha = filters.custom_katha || (filters.min_katha !== "all" ? filters.min_katha : null);
  if (activeKatha) {
    queryParams.append("min_katha", activeKatha);
  }

  if (filters.has_basement !== undefined && filters.has_basement !== "all") {
    queryParams.append(
      "basement",
      String(filters.has_basement === true || filters.has_basement === "yes")
    );
  }
  if (filters.has_garage !== undefined && filters.has_garage !== "all") {
    queryParams.append(
      "garage",
      String(filters.has_garage === true || filters.has_garage === "yes")
    );
  }
  if (filters.rooftop_type && filters.rooftop_type !== "all") {
    queryParams.append("rooftop", filters.rooftop_type);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s fast fallback

    const url = `${BACKEND_BASE_URL}/api/designs/search?${queryParams.toString()}`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.designs) && data.designs.length > 0) {
        return filterDesignsLocally(data.designs, filters);
      }
    }
  } catch (_err) {
    // Backend offline or endpoint not yet configured — fallback to local curated data
  }

  // Local fallback filtering
  return filterDesignsLocally(MOCK_DESIGNS, filters);
}

/**
 * Get design details by ID.
 *
 * @param {number|string} id
 * @returns {Object|null}
 */
export function getDesignById(id) {
  return MOCK_DESIGNS.find((d) => String(d.id) === String(id)) || null;
}
