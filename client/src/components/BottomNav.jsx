import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Camera, MapPin, BarChart3, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  const links = [
    { to: '/', label: t('nav.home', 'Home'), icon: Home },
    { to: '/centers', label: t('nav.centers', 'Centers'), icon: MapPin },
    { to: '/scan', label: t('nav.scan', 'Scan'), icon: Camera, isPrimary: true },
    { to: '/dashboard', label: t('nav.dashboard', 'Impact'), icon: BarChart3 },
    { to: '/history', label: t('nav.history', 'History'), icon: History }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/10 px-3 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {links.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative -top-5 flex flex-col items-center group"
                aria-label="Scan Waste"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-eco-600 to-emerald-400 p-1 shadow-glow-lg group-hover:scale-105 active:scale-95 transition-transform duration-200">
                  <div className="w-full h-full rounded-full bg-eco-500 flex items-center justify-center text-white">
                    <Camera className="w-6 h-6 stroke-[2.5]" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-eco-400 mt-1">Scan</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors duration-150 ${
                isActive ? 'text-eco-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
