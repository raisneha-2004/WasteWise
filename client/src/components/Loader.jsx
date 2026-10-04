import React from 'react';

export function Loader({ size = 'md', text = 'Loading...' }) {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full border-eco-500/20 border-t-eco-400 animate-spin`}
      />
      {text && <p className="text-xs text-gray-400 font-medium tracking-wide animate-pulse">{text}</p>}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-panel p-5 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}
