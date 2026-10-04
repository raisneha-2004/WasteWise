import L from 'leaflet';
import { getCategoryTheme, getPrimaryCategory } from '../../utils/categoryTheme.js';

/**
 * Creates a custom glassy round marker with SVG category icon and dynamic glow
 * @param {Object} options
 * @param {string[]} options.categories
 * @param {boolean} options.isSelected
 * @param {number} options.index
 * @returns {L.DivIcon}
 */
export function createCenterDivIcon({ categories = [], isSelected = false, index = 0 }) {
  const primaryCat = getPrimaryCategory(categories);
  const theme = getCategoryTheme(primaryCat);
  const color = theme.color || '#10b981';
  const shadow = theme.shadow || 'rgba(16, 185, 129, 0.4)';
  const svgPath = theme.svgPath || '<circle cx="12" cy="12" r="10"/>';

  const size = isSelected ? 44 : 36;
  const iconSize = isSelected ? 20 : 16;
  const pulseClass = isSelected ? 'marker-selected-pulse' : '';
  const delay = (index % 12) * 0.05;

  const html = `
    <div class="custom-center-marker-wrapper ${pulseClass}" style="animation-delay: ${delay}s;">
      <div class="marker-pin-body" style="
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, rgba(15,23,28,0.85) 75%);
        border: 2px solid ${color};
        box-shadow: 0 0 ${isSelected ? '24px' : '14px'} ${shadow}, inset 0 0 10px rgba(255,255,255,0.15);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          ${svgPath}
        </svg>
      </div>
      <div class="marker-pin-tip" style="border-top-color: ${color};"></div>
      <div class="marker-ground-shadow" style="background: radial-gradient(ellipse, ${shadow} 0%, transparent 70%);"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-center-leaflet-pin',
    iconSize: [size, size + 10],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 10)]
  });
}

/**
 * Creates custom cluster icon with emerald gradient bubble
 * @param {Object} cluster
 * @returns {L.DivIcon}
 */
export function createClusterCustomIcon(cluster) {
  const count = cluster.getChildCount();
  let size = 40;
  let textSize = 'text-xs';

  if (count > 20) {
    size = 52;
    textSize = 'text-sm font-black';
  } else if (count > 10) {
    size = 46;
    textSize = 'text-xs font-bold';
  }

  const html = `
    <div class="cluster-bubble-outer" style="width: ${size}px; height: ${size}px;">
      <div class="cluster-bubble-ring"></div>
      <div class="cluster-bubble-core ${textSize}">
        <span>${count}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-cluster-leaflet-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}
