import React from 'react';

export function CenterCardSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3 relative overflow-hidden">
      {/* Shimmer sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="w-24 h-4 rounded-full bg-white/10 animate-pulse" />
          <div className="w-3/4 h-5 rounded-lg bg-white/15 animate-pulse" />
        </div>
        <div className="w-16 h-6 rounded-xl bg-white/10 animate-pulse" />
      </div>

      <div className="w-5/6 h-3 rounded bg-white/5 animate-pulse" />

      <div className="flex gap-2 pt-1">
        <div className="w-14 h-5 rounded-full bg-white/10 animate-pulse" />
        <div className="w-16 h-5 rounded-full bg-white/10 animate-pulse" />
        <div className="w-12 h-5 rounded-full bg-white/10 animate-pulse" />
      </div>

      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="w-32 h-4 rounded bg-white/5 animate-pulse" />
        <div className="w-20 h-7 rounded-xl bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}

export function CentersLoadingState() {
  return (
    <div className="space-y-3">
      <CenterCardSkeleton />
      <CenterCardSkeleton />
      <CenterCardSkeleton />
      <CenterCardSkeleton />
    </div>
  );
}
