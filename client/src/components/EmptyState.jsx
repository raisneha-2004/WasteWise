import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No Data Found',
  description = 'Nothing here yet. Start scanning to see live data.',
  actionLabel,
  onAction
}) {
  return (
    <div className="glass-panel p-8 md:p-12 rounded-3xl text-center max-w-md mx-auto my-6 flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-eco-500/10 border border-eco-500/20 text-eco-400 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg md:text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-eco-600 to-emerald-500 hover:from-eco-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-glow-sm transition-all duration-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
