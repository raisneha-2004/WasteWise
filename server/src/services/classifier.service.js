import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load waste categories dataset
const categoriesFilePath = path.join(__dirname, '../../data/wasteCategories.json');
const wasteCategories = JSON.parse(fs.readFileSync(categoriesFilePath, 'utf-8'));

export const VALID_CATEGORIES = wasteCategories.map((c) => c.id);

/**
 * Returns all available waste categories
 */
export function getAllCategories() {
  return wasteCategories;
}

/**
 * Finds category by ID (case-insensitive)
 * @param {string} id
 */
export function getCategoryById(id) {
  if (!id) return null;
  const normalized = id.trim().toLowerCase();
  return wasteCategories.find((c) => c.id.toLowerCase() === normalized) || null;
}

/**
 * Normalizes input string to a valid category ID, or falls back to "Other"
 * @param {string} rawCategory
 * @returns {string}
 */
export function normalizeCategory(rawCategory) {
  if (!rawCategory || typeof rawCategory !== 'string') return 'Other';

  const clean = rawCategory.trim().toLowerCase();

  // Direct match (case-insensitive)
  const match = wasteCategories.find((c) => c.id.toLowerCase() === clean);
  if (match) return match.id;

  // ── Expanded keyword synonym matching ──
  if (
    clean.includes('plastic') || clean.includes('bottle') ||
    clean.includes('pet ') || clean.includes('pvc') ||
    clean.includes('polythene') || clean.includes('polypropylene') ||
    clean.includes('nylon') || clean.includes('packaging')
  ) return 'Plastic';

  if (
    clean.includes('paper') || clean.includes('cardboard') ||
    clean.includes('carton') || clean.includes('box') ||
    clean.includes('newspaper') || clean.includes('magazine') ||
    clean.includes('envelope') || clean.includes('kraft')
  ) return 'Paper';

  if (
    clean.includes('glass') || clean.includes('mirror') ||
    clean.includes('cullet') || clean.includes('jar') ||
    clean.includes('window pane')
  ) return 'Glass';

  if (
    clean.includes('metal') || clean.includes('aluminum') ||
    clean.includes('aluminium') || clean.includes('can') ||
    clean.includes('tin') || clean.includes('steel') ||
    clean.includes('iron') || clean.includes('copper') ||
    clean.includes('brass') || clean.includes('scrap metal') ||
    clean.includes('foil')
  ) return 'Metal';

  if (
    clean.includes('organic') || clean.includes('food') ||
    clean.includes('wet waste') || clean.includes('peel') ||
    clean.includes('compost') || clean.includes('biodegradable') ||
    clean.includes('vegetable') || clean.includes('fruit') ||
    clean.includes('kitchen') || clean.includes('leftover') ||
    clean.includes('leaf') || clean.includes('garden')
  ) return 'Organic';

  if (
    clean.includes('e-waste') || clean.includes('ewaste') ||
    clean.includes('electronic') || clean.includes('phone') ||
    clean.includes('laptop') || clean.includes('computer') ||
    clean.includes('cable') || clean.includes('charger') ||
    clean.includes('circuit') || clean.includes('pcb') ||
    clean.includes('battery') || clean.includes('bulb') ||
    clean.includes('printer') || clean.includes('monitor')
  ) return 'E-waste';

  if (
    clean.includes('hazard') || clean.includes('sanitary') ||
    clean.includes('chemical') || clean.includes('medical') ||
    clean.includes('medicine') || clean.includes('syringe') ||
    clean.includes('paint') || clean.includes('pesticide') ||
    clean.includes('bleach') || clean.includes('acid') ||
    clean.includes('toxic') || clean.includes('biohazard')
  ) return 'Hazardous';

  if (
    clean.includes('textile') || clean.includes('cloth') ||
    clean.includes('garment') || clean.includes('fabric') ||
    clean.includes('shirt') || clean.includes('clothes') ||
    clean.includes('clothing') || clean.includes('jeans') ||
    clean.includes('fabric') || clean.includes('wool') ||
    clean.includes('cotton') || clean.includes('uniform')
  ) return 'Textile';

  return 'Other';
}

/**
 * Determines whether user confirmation is required based on confidence threshold
 * @param {number} confidence
 * @returns {boolean}
 */
export function needsUserConfirmation(confidence) {
  return typeof confidence === 'number' && confidence < 0.5;
}
