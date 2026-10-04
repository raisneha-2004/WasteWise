import React from 'react';
import { getCategoryTheme } from '../utils/categoryTheme.js';

export default function CategoryBadge({ category = 'Other', size = 'md', showIcon = false, className = '' }) {
  const theme = getCategoryTheme(category);
  const IconComponent = theme.icon;

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 gap-1 font-semibold',
    sm: 'text-xs px-2.5 py-0.5 gap-1.5 font-medium',
    md: 'text-sm px-3 py-1 gap-2 font-medium',
    lg: 'text-base px-4 py-1.5 gap-2.5 font-semibold'
  }[size] || 'text-sm px-3 py-1 gap-2 font-medium';

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size] || 'w-4 h-4';

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all duration-200 ${theme.badgeBg || theme.bg} ${sizeClasses} ${className}`}
    >
      {showIcon && IconComponent ? (
        <IconComponent className={`${iconSizes} shrink-0`} style={{ color: theme.color }} />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${theme.dot}`} />
      )}
      <span className="truncate">{theme.name || category}</span>
    </span>
  );
}
