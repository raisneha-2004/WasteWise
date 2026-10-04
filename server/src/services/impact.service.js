import { getCategoryById } from './classifier.service.js';

// Average CO2 absorbed by one mature tree per year in kg
const ANNUAL_TREE_CO2_KG = 21.77;

/**
 * Calculates environmental impact for a single item
 * @param {string} categoryId
 * @param {number} [weightKg]
 */
export function calculateItemImpact(categoryId, weightKg) {
  const category = getCategoryById(categoryId) || getCategoryById('Other');
  const actualWeight = typeof weightKg === 'number' && weightKg > 0 ? weightKg : (category.typicalWeightKg || 0.1);
  const factor = category.co2SavedPerKg || 0;
  const co2SavedKg = Math.round(actualWeight * factor * 1000) / 1000;
  const treesEquivalent = Math.round((co2SavedKg / ANNUAL_TREE_CO2_KG) * 1000) / 1000;

  return {
    estimatedWeightKg: actualWeight,
    co2SavedKg,
    factorPerKg: factor,
    treesEquivalent,
    unit: 'kg CO2e'
  };
}

/**
 * Assigns user badge and level based on total CO2 saved
 * @param {number} totalCo2Kg
 */
export function getEcoBadge(totalCo2Kg) {
  if (totalCo2Kg >= 50) {
    return {
      level: 5,
      badge: 'Planet Savior',
      title: 'Earth Protector Elite',
      nextTierCo2: null,
      progressPercent: 100
    };
  }
  if (totalCo2Kg >= 25) {
    return {
      level: 4,
      badge: 'Climate Hero',
      title: 'High-Impact Recycler',
      nextTierCo2: 50,
      progressPercent: Math.round(((totalCo2Kg - 25) / 25) * 100)
    };
  }
  if (totalCo2Kg >= 10) {
    return {
      level: 3,
      badge: 'Eco Warrior',
      title: 'Active Segregator',
      nextTierCo2: 25,
      progressPercent: Math.round(((totalCo2Kg - 10) / 15) * 100)
    };
  }
  if (totalCo2Kg >= 2) {
    return {
      level: 2,
      badge: 'Green Guardian',
      title: 'Conscious Consumer',
      nextTierCo2: 10,
      progressPercent: Math.round(((totalCo2Kg - 2) / 8) * 100)
    };
  }
  return {
    level: 1,
    badge: 'Eco Novice',
    title: 'Beginning the Green Journey',
    nextTierCo2: 2,
    progressPercent: Math.round((totalCo2Kg / 2) * 100)
  };
}

/**
 * Calculates aggregate impact summary from past scans array
 * @param {Array<{ category: string, weightKg?: number, date?: string }>} history
 */
export function calculateImpactSummary(history = []) {
  if (!Array.isArray(history) || history.length === 0) {
    return {
      totalItems: 0,
      totalWeightKg: 0,
      totalCo2SavedKg: 0,
      treesEquivalent: 0,
      categoryBreakdown: {},
      weeklyTrend: [],
      badge: getEcoBadge(0)
    };
  }

  let totalWeightKg = 0;
  let totalCo2SavedKg = 0;
  const breakdown = {};
  const dateMap = {};

  history.forEach((scan) => {
    const cat = getCategoryById(scan.category) || getCategoryById('Other');
    const weight = typeof scan.weightKg === 'number' && scan.weightKg > 0 ? scan.weightKg : (cat.typicalWeightKg || 0.1);
    const co2 = weight * (cat.co2SavedPerKg || 0);

    totalWeightKg += weight;
    totalCo2SavedKg += co2;

    // Category breakdown
    if (!breakdown[cat.id]) {
      breakdown[cat.id] = {
        name: cat.displayName,
        binColor: cat.binColor,
        count: 0,
        totalWeightKg: 0,
        co2SavedKg: 0
      };
    }
    breakdown[cat.id].count += 1;
    breakdown[cat.id].totalWeightKg += weight;
    breakdown[cat.id].co2SavedKg += co2;

    // Date / Trend grouping
    const scanDate = scan.date ? new Date(scan.date) : new Date();
    const dateKey = isNaN(scanDate.getTime())
      ? new Date().toISOString().split('T')[0]
      : scanDate.toISOString().split('T')[0];

    if (!dateMap[dateKey]) {
      dateMap[dateKey] = {
        date: dateKey,
        count: 0,
        co2SavedKg: 0,
        weightKg: 0
      };
    }
    dateMap[dateKey].count += 1;
    dateMap[dateKey].co2SavedKg += co2;
    dateMap[dateKey].weightKg += weight;
  });

  // Round summary numbers
  totalWeightKg = Math.round(totalWeightKg * 100) / 100;
  totalCo2SavedKg = Math.round(totalCo2SavedKg * 1000) / 1000;
  const treesEquivalent = Math.round((totalCo2SavedKg / ANNUAL_TREE_CO2_KG) * 100) / 100;

  // Format breakdown percentages
  Object.keys(breakdown).forEach((key) => {
    breakdown[key].totalWeightKg = Math.round(breakdown[key].totalWeightKg * 100) / 100;
    breakdown[key].co2SavedKg = Math.round(breakdown[key].co2SavedKg * 1000) / 1000;
    breakdown[key].percentage = totalCo2SavedKg > 0
      ? Math.round((breakdown[key].co2SavedKg / totalCo2SavedKg) * 100)
      : 0;
  });

  // Sort trend by date
  const weeklyTrend = Object.values(dateMap)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-14) // Last 14 entries
    .map((item) => ({
      ...item,
      co2SavedKg: Math.round(item.co2SavedKg * 1000) / 1000,
      weightKg: Math.round(item.weightKg * 100) / 100
    }));

  return {
    totalItems: history.length,
    totalWeightKg,
    totalCo2SavedKg,
    treesEquivalent,
    categoryBreakdown: breakdown,
    weeklyTrend,
    badge: getEcoBadge(totalCo2SavedKg)
  };
}
