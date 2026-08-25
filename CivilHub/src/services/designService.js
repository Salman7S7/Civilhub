// src/services/designService.js
// -----------------------------------------------------------------------------
// Service layer for Feature 2: Smart Design Suggestions.
// Handles multi-parameter filtering (floors, basement, garage, rooftop, min_katha, search)
// with seamless fallback to curated local mock data when backend is offline.
// -----------------------------------------------------------------------------

import { MOCK_DESIGNS } from "./mockDesigns";

const BACKEND_BASE_URL = "http://localhost:4000";

/**
 * Filter designs locally based on user criteria.
 * Mirrors the SQL query:
 * SELECT * FROM designs WHERE floors=? AND has_basement=? AND has_garage=? AND rooftop_type=? AND min_katha<=?
 *
 * @param {Array} list - Array of design objects
 * @param {Object} filters - Selected filter criteria
 * @returns {Array} - Filtered designs
 */
export function filterDesignsLocally(list, filters = {}) {
  const {
    floors = "all",
    has_basement = "all",
    has_garage = "all",
    rooftop_type = "all",
    min_katha = "all",
    searchQuery = "",
  } = filters;

  return list.filter((item) => {
    // 1. Number of Floors filter (5 or 10)
    if (floors !== "all" && parseInt(floors, 10) !== item.floors) {
      return false;
    }

    // 2. Basement filter (true/false)
    if (has_basement !== "all") {
      const wantBasement = has_basement === true || has_basement === "true" || has_basement === "yes";
      if (item.has_basement !== wantBasement) return false;
    }

    // 3. Garage filter (true/false)
    if (has_garage !== "all") {
      const wantGarage = has_garage === true || has_garage === "true" || has_garage === "yes";
      if (item.has_garage !== wantGarage) return false;
    }

    // 4. Rooftop Type filter ('Garden', 'Open Terrace', 'Helipad')
    if (rooftop_type !== "all" && item.rooftop_type !== rooftop_type) {
      return false;
    }

    // 5. Min Katha filter (designs suitable for land area <= user's land or threshold)
    if (min_katha !== "all") {
      const kathaNum = parseFloat(min_katha);
      if (!isNaN(kathaNum)) {
        // Design requires at most this much katha (or is suitable for this plot size category)
        if (item.min_katha > kathaNum) return false;
      }
    }

    // 6. Free text search query (title, style, features)
    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchStyle = item.architectural_style?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchFeatures = item.features?.some((f) => f.toLowerCase().includes(q));

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
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} - List of matching designs
 */
export async function searchDesigns(filters = {}) {
  const queryParams = new URLSearchParams();

  if (filters.floors && filters.floors !== "all") {
    queryParams.append("floors", filters.floors);
  }
  if (filters.has_basement !== undefined && filters.has_basement !== "all") {
    queryParams.append("basement", String(filters.has_basement === true || filters.has_basement === "yes"));
  }
  if (filters.has_garage !== undefined && filters.has_garage !== "all") {
    queryParams.append("garage", String(filters.has_garage === true || filters.has_garage === "yes"));
  }
  if (filters.rooftop_type && filters.rooftop_type !== "all") {
    queryParams.append("rooftop", filters.rooftop_type);
  }
  if (filters.min_katha && filters.min_katha !== "all") {
    queryParams.append("min_katha", filters.min_katha);
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
        // Return backend results
        return filterDesignsLocally(data.designs, { searchQuery: filters.searchQuery });
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
