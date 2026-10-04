import { findNearbyCenters } from '../services/centers.service.js';

/**
 * Controller to fetch recycling centers with geo-distance, filters, and pagination
 */
export async function getCenters(req, res, next) {
  try {
    const { lat, lng, category, radiusKm, page, limit } = req.query;

    const parsedLat = lat !== undefined && lat !== '' ? parseFloat(lat) : undefined;
    const parsedLng = lng !== undefined && lng !== '' ? parseFloat(lng) : undefined;
    const parsedRadius = radiusKm !== undefined && radiusKm !== '' ? parseFloat(radiusKm) : undefined;
    const parsedPage = page !== undefined && page !== '' ? parseInt(page, 10) : 1;
    const parsedLimit = limit !== undefined && limit !== '' ? parseInt(limit, 10) : 10;

    const result = findNearbyCenters({
      lat: parsedLat,
      lng: parsedLng,
      category,
      radiusKm: parsedRadius,
      page: parsedPage,
      limit: parsedLimit
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}
