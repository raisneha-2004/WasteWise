import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateDistanceKm } from '../utils/haversine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load centers dataset
const centersFilePath = path.join(__dirname, '../../data/recyclingCenters.json');
const recyclingCenters = JSON.parse(fs.readFileSync(centersFilePath, 'utf-8'));

/**
 * Returns all centers
 */
export function getAllCenters() {
  return recyclingCenters;
}

/**
 * Finds recycling centers with filtering, haversine distance calculation, sorting, and pagination
 * @param {Object} options
 * @param {number} [options.lat]
 * @param {number} [options.lng]
 * @param {string} [options.category]
 * @param {number} [options.radiusKm]
 * @param {number} [options.page=1]
 * @param {number} [options.limit=10]
 */
export function findNearbyCenters({ lat, lng, category, radiusKm, page = 1, limit = 10 }) {
  const hasCoordinates = typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);

  let results = recyclingCenters.map((center) => {
    let distanceKm = null;
    if (hasCoordinates) {
      distanceKm = calculateDistanceKm(lat, lng, center.lat, center.lng);
    }
    return {
      ...center,
      distanceKm
    };
  });

  // Filter by category if specified
  if (category && typeof category === 'string') {
    const filterCat = category.trim().toLowerCase();
    results = results.filter((c) =>
      c.acceptedCategories.some((cat) => cat.toLowerCase() === filterCat)
    );
  }

  // Filter by radius if coordinates and radiusKm specified
  if (hasCoordinates && radiusKm && !isNaN(radiusKm)) {
    results = results.filter((c) => c.distanceKm !== null && c.distanceKm <= radiusKm);
  }

  // Sort: by distance if coordinates available, otherwise by name
  if (hasCoordinates) {
    results.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  } else {
    results.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Pagination
  const total = results.length;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCenters = results.slice(startIndex, startIndex + pageSize);

  return {
    centers: paginatedCenters,
    pagination: {
      total,
      page: currentPage,
      limit: pageSize,
      totalPages
    }
  };
}

/**
 * Returns top N nearest matching centers for a location & category
 * @param {number} lat
 * @param {number} lng
 * @param {string} [category]
 * @param {number} [limit=3]
 */
export function getTopNearestCenters(lat, lng, category, limit = 3) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return [];
  }

  const { centers } = findNearbyCenters({
    lat,
    lng,
    category,
    page: 1,
    limit
  });

  return centers;
}
