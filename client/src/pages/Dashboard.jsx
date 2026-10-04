import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Sector
} from 'recharts';
import {
  TrendingUp,
  Leaf,
  Award,
  CheckCircle,
  Lock,
  Sparkles,
  BarChart2,
  ShieldCheck,
  Camera,
  Layers
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/useApp.js';
import { impactApi } from '../services/api.js';
import { formatNumber, formatDate } from '../utils/formatters.js';
import StatCard from '../components/StatCard.jsx';
import AnimatedCounter from '../components/AnimatedCounter.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

// Vibrant category colors aligned with municipal & user guidelines
const CATEGORY_COLORS = {
  Plastic: '#3B82F6',   // Vibrant Blue
  Paper: '#F59E0B',     // Warm Amber
  Glass: '#14B8A6',     // Bright Teal
  Metal: '#94A3B8',     // Slate / Silver
  Organic: '#10B981',   // Emerald Green
  'E-waste': '#A855F7', // Deep Purple
  Hazardous: '#EF4444', // Red
  Textile: '#EC4899',   // Pink / Rose
  Other: '#6B7280'      // Slate Grey
};

// Date formatter for trend chart
function formatTrendDate(dateStr, lang = 'en') {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return formatDate(d, lang, { day: 'numeric', month: 'short' });
}

// Custom Sector shape for hovered segment zoom
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 7}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={8}
        style={{ filter: 'drop-shadow(0px 0px 8px rgba(255,255,255,0.25))' }}
      />
    </g>
  );
};

// Custom Pie Donut Tooltip
const CustomPieTooltip = ({ active, payload, totalCount, t, language }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const pct = totalCount > 0 ? Math.round((data.value / totalCount) * 100) : 0;
    const color = CATEGORY_COLORS[data.name] || '#6B7280';
    const translatedName = t ? t(`category_names.${data.name}`, { defaultValue: data.name }) : data.name;
    return (
      <div className="glass-panel px-4 py-3 rounded-2xl border border-white/15 shadow-2xl backdrop-blur-2xl text-xs space-y-1.5 min-w-[150px]">
        <div className="flex items-center gap-2 pb-1 border-b border-white/10">
          <span className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20" style={{ backgroundColor: color }} />
          <span className="font-bold text-white text-sm">{translatedName}</span>
          <span className="ml-auto font-mono font-semibold text-eco-400 bg-eco-500/10 px-1.5 py-0.5 rounded text-[11px]">
            {formatNumber(pct, language)}%
          </span>
        </div>
        <div className="text-gray-300 flex items-center justify-between gap-4 pt-0.5">
          <span className="text-gray-400">{t ? t('dashboard_page.items_label', { defaultValue: 'Items:' }) : 'Items:'}</span>
          <span className="font-semibold text-white">{formatNumber(data.value, language)}</span>
        </div>
        {data.payload.co2 > 0 && (
          <div className="flex items-center justify-between gap-4 text-emerald-400 font-medium">
            <span>{t ? t('dashboard_page.co2_diverted', { defaultValue: 'CO2 Diverted:' }) : 'CO2 Diverted:'}</span>
            <span className="font-mono font-bold">+{formatNumber(data.payload.co2, language)} kg</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Custom Area Chart Tooltip
const CustomAreaTooltip = ({ active, payload, label, t, language }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="glass-panel px-4 py-3 rounded-2xl border border-emerald-500/30 shadow-2xl backdrop-blur-2xl text-xs space-y-1.5 min-w-[170px]">
        <p className="font-bold text-white flex items-center gap-2 pb-1 border-b border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{item.displayDate || label}</span>
        </p>
        <div className="flex items-center justify-between gap-4 text-emerald-300 pt-0.5">
          <span>{t ? t('dashboard_page.co2_prevented', { defaultValue: 'CO2 Prevented:' }) : 'CO2 Prevented:'}</span>
          <span className="font-bold font-mono text-white text-sm">
            {formatNumber(item.co2SavedKg, language)} kg
          </span>
        </div>
        {item.count > 0 && (
          <div className="flex items-center justify-between gap-4 text-gray-400 text-[11px]">
            <span>{t ? t('dashboard_page.items_segregated', { defaultValue: 'Items Segregated:' }) : 'Items Segregated:'}</span>
            <span className="font-medium text-gray-200">{formatNumber(item.count, language)}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { history, ecoPoints, streak, levelInfo, language } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePieIndex, setActivePieIndex] = useState(null);
  const [trendRange, setTrendRange] = useState('7D'); // '7D' | '30D' | 'ALL'

  // Smooth scroll to anchor target when navigating with #hash (e.g. #levels, #co2, #streak)
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const elem = document.getElementById(targetId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash, loading]);

  useEffect(() => {
    let isCancelled = false;
    async function loadImpact() {
      setLoading(true);
      try {
        const res = await impactApi.getSummary(history);
        if (!isCancelled) {
          setImpactData(res.data);
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn('Failed to load impact analytics:', err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadImpact();
    return () => {
      isCancelled = true;
    };
  }, [history]);

  // Format data for Donut PieChart
  const pieData = useMemo(() => {
    if (impactData?.categoryBreakdown) {
      return Object.keys(impactData.categoryBreakdown)
        .filter((catKey) => impactData.categoryBreakdown[catKey].count > 0)
        .map((catKey) => ({
          name: catKey,
          value: impactData.categoryBreakdown[catKey].count,
          co2: impactData.categoryBreakdown[catKey].co2SavedKg || 0
        }))
        .sort((a, b) => b.value - a.value);
    }
    return [];
  }, [impactData]);

  const totalItemsCount = useMemo(() => {
    return pieData.reduce((acc, curr) => acc + curr.value, 0) || history.length;
  }, [pieData, history]);

  // Compute trend data filtered by chosen range (7D / 30D / All)
  const filteredTrendData = useMemo(() => {
    if (!history || history.length === 0) {
      if (impactData?.weeklyTrend?.length > 0) {
        return impactData.weeklyTrend.map((item) => ({
          ...item,
          displayDate: formatTrendDate(item.date, language)
        }));
      }
      return [];
    }

    const dateMap = {};

    history.forEach((scan) => {
      const key = scan.date
        ? scan.date.split('T')[0]
        : 'recent';

      if (!dateMap[key]) {
        dateMap[key] = {
          date: key,
          displayDate: formatTrendDate(key, language),
          co2SavedKg: 0,
          count: 0
        };
      }
      const co2 = scan.impact?.co2SavedKg || 0.08;
      dateMap[key].co2SavedKg += co2;
      dateMap[key].count += 1;
    });

    const sorted = Object.values(dateMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        ...d,
        co2SavedKg: Math.round(d.co2SavedKg * 1000) / 1000
      }));

    const sliced = trendRange === '7D'
      ? sorted.slice(-7)
      : trendRange === '30D'
      ? sorted.slice(-30)
      : sorted;

    if (sliced.length === 0 && impactData?.weeklyTrend?.length > 0) {
      return impactData.weeklyTrend.map((item) => ({
        ...item,
        displayDate: formatTrendDate(item.date, language)
      }));
    }

    return sliced;
  }, [history, impactData, trendRange, language]);

  // Badges criteria
  const badges = [
    {
      id: 'first_scan',
      title: t('dashboard_page.badge_first_scan', { defaultValue: 'First Scan' }),
      desc: t('dashboard_page.badge_first_scan_desc', { defaultValue: 'Segregated your first waste item' }),
      icon: '🌱',
      unlocked: history.length >= 1
    },
    {
      id: 'ten_scans',
      title: t('dashboard_page.badge_ten_scans', { defaultValue: '10 Scans Club' }),
      desc: t('dashboard_page.badge_ten_scans_desc', { defaultValue: '10 items diverted from common dumpsters' }),
      icon: '⭐',
      unlocked: history.length >= 10
    },
    {
      id: 'ewaste_hero',
      title: t('dashboard_page.badge_ewaste', { defaultValue: 'E-Waste Hero' }),
      desc: t('dashboard_page.badge_ewaste_desc', { defaultValue: 'Safely separated toxic electronic waste' }),
      icon: '⚡',
      unlocked: history.some((item) => item.category === 'E-waste')
    },
    {
      id: 'streak_master',
      title: t('dashboard_page.badge_streak', { defaultValue: '7-Day Streak' }),
      desc: t('dashboard_page.badge_streak_desc', { defaultValue: 'Active waste segregation for 7 days' }),
      icon: '🔥',
      unlocked: streak >= 7
    },
    {
      id: 'tree_planter',
      title: t('dashboard_page.badge_tree', { defaultValue: 'Tree Saver' }),
      desc: t('dashboard_page.badge_tree_desc', { defaultValue: 'Diverted over 5 kg of greenhouse emissions' }),
      icon: '🌳',
      unlocked: (impactData?.totalCo2SavedKg || 0) >= 5
    },
    {
      id: 'compost_king',
      title: t('dashboard_page.badge_compost', { defaultValue: 'Compost Ally' }),
      desc: t('dashboard_page.badge_compost_desc', { defaultValue: 'Segregated organic kitchen wet waste' }),
      icon: '🥗',
      unlocked: history.some((item) => item.category === 'Organic')
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-8 pb-28">
      {/* Title Header with Glowing Accent */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-eco-500/10 border border-eco-500/25 text-eco-400 text-xs font-semibold mb-3 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <BarChart2 className="w-3.5 h-3.5 text-eco-400" />
            <span>{t('dashboard_page.badge', { defaultValue: 'Sustainability Analytics' })}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            {t('dashboard_page.title', { defaultValue: 'Environmental Impact Dashboard' })}
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1.5 max-w-2xl">
            {t('dashboard_page.subtitle', { defaultValue: 'Monitor emissions prevented, landfill diversion by material stream, and gamified sustainability achievements.' })}
          </p>
        </div>

        <button
          onClick={() => navigate('/scan')}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-eco-600 to-emerald-500 hover:from-eco-500 hover:to-emerald-400 text-white font-semibold text-xs shadow-glow-sm hover:shadow-glow-md transition-all active:scale-95"
        >
          <Camera className="w-4 h-4" />
          <span>{t('dashboard_page.scan_new', { defaultValue: 'Scan New Item' })}</span>
        </button>
      </motion.div>

      {/* Top 4 Summary Stat Cards with Count-up Animation & Glowing Borders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          title={t('dashboard_page.total_scans', { defaultValue: 'Total Scans' })}
          value={impactData?.totalItems || history.length}
          subtitle={t('dashboard_page.items_segregated_sub', { defaultValue: 'Items segregated' })}
          icon={TrendingUp}
          color="blue"
          delay={0.05}
        />
        <StatCard
          title={t('dashboard_page.co2_saved_title', { defaultValue: 'CO2 Saved' })}
          value={`${formatNumber(impactData?.totalCo2SavedKg || 0, language)} kg`}
          subtitle={t('dashboard_page.emissions_prevented', { defaultValue: 'Emissions prevented' })}
          icon={Leaf}
          color="eco"
          delay={0.1}
        />
        <StatCard
          title={t('dashboard_page.eco_points_title', { defaultValue: 'Total Eco Points' })}
          value={ecoPoints}
          subtitle={t('dashboard_page.reward_score', { defaultValue: 'Reward score' })}
          icon={Sparkles}
          color="amber"
          delay={0.15}
        />
        <StatCard
          title={t('dashboard_page.eco_level_title', { defaultValue: 'Eco Level' })}
          value={`${t('dashboard_page.tier', { defaultValue: 'Tier' })} ${levelInfo.level}`}
          subtitle={levelInfo.title}
          icon={Award}
          color="purple"
          delay={0.2}
        />
      </div>

      {/* Gamified Level Progression Bar Card */}
      <motion.div
        id="levels"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25 }}
        className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl hover:border-white/15 transition-all scroll-mt-24"
      >
        <div className="absolute top-0 right-0 w-80 h-32 bg-eco-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <span className="text-3xl p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
              {levelInfo.icon}
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-eco-400">
                {t('dashboard_page.current_rank', { defaultValue: 'Current Rank' })} • {t('dashboard_page.tier', { defaultValue: 'Tier' })} {levelInfo.level}
              </span>
              <h3 className="text-xl md:text-2xl font-black text-white">{levelInfo.title}</h3>
            </div>
          </div>

          <div className="text-right self-start sm:self-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatNumber(ecoPoints, language)} {t('dashboard_page.points', { defaultValue: 'Points' })}</span>
            </div>
            {levelInfo.nextPoints && (
              <p className="text-[11px] text-gray-400 mt-1 font-medium">
                {formatNumber(levelInfo.nextPoints - ecoPoints, language)} {t('dashboard_page.pts_to_next', { defaultValue: 'pts to next rank' })}
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar with smooth fill animation */}
        <div className="w-full bg-dark-bg/80 h-3.5 rounded-full overflow-hidden border border-white/10 p-0.5 relative z-10 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelInfo.progress}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-gradient-to-r from-eco-600 via-emerald-400 to-teal-300 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]"
          />
        </div>
        <div className="flex justify-between items-center text-[10px] md:text-[11px] text-gray-400 mt-2.5 font-medium relative z-10">
          <span className={levelInfo.level >= 1 ? 'text-eco-400 font-bold' : ''}>{t('dashboard_page.tier_1', { defaultValue: 'Tier 1: Seedling' })}</span>
          <span className={levelInfo.level >= 2 ? 'text-eco-400 font-bold' : ''}>{t('dashboard_page.tier_2', { defaultValue: 'Tier 2: Sprout' })}</span>
          <span className={levelInfo.level >= 3 ? 'text-eco-400 font-bold' : ''}>{t('dashboard_page.tier_3', { defaultValue: 'Tier 3: Tree' })}</span>
          <span className={levelInfo.level >= 4 ? 'text-eco-400 font-bold' : ''}>{t('dashboard_page.tier_4', { defaultValue: 'Tier 4: Forest Guardian' })}</span>
        </div>
      </motion.div>

      {history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-8 md:p-12 rounded-2xl border border-white/10 text-center relative overflow-hidden"
        >
          <div className="w-16 h-16 rounded-2xl bg-eco-500/10 border border-eco-500/20 text-eco-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Leaf className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t('dashboard_page.no_impact_title', { defaultValue: 'No Impact Data Yet' })}</h3>
          <p className="text-xs md:text-sm text-gray-400 max-w-md mx-auto mb-6">
            {t('dashboard_page.no_impact_desc', { defaultValue: 'Scan your first waste item to visualize interactive category stream breakdowns and live CO2 carbon offset charts.' })}
          </p>
          <button
            onClick={() => navigate('/scan')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-eco-600 hover:bg-eco-500 text-white font-semibold text-sm shadow-glow-sm hover:shadow-glow-md transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>{t('dashboard_page.scan_first_button', { defaultValue: 'Scan Your First Item' })}</span>
          </button>
        </motion.div>
      ) : loading ? (
        <div className="glass-panel p-12 rounded-2xl border border-white/10">
          <Loader text={t('dashboard_page.loading_charts', { defaultValue: 'Compiling sustainability charts...' })} />
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. Waste Stream Breakdown (Donut Chart - 5 Cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between shadow-xl hover:border-white/15 transition-all"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-eco-400" />
                    <span>{t('dashboard_page.waste_stream_title', { defaultValue: 'Waste Stream Breakdown' })}</span>
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">{t('dashboard_page.waste_stream_desc', { defaultValue: 'Distribution of items by material' })}</p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                  {formatNumber(pieData.length, language)} {t('dashboard_page.categories_count', { count: pieData.length, defaultValue: 'Categories' })}
                </span>
              </div>

              {/* Donut Chart with Center Text Overlay */}
              <div className="relative h-64 my-4 flex items-center justify-center">
                {pieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={68}
                          outerRadius={96}
                          paddingAngle={4}
                          cornerRadius={6}
                          dataKey="value"
                          activeIndex={activePieIndex}
                          activeShape={renderActiveShape}
                          onMouseEnter={(_, index) => setActivePieIndex(index)}
                          onMouseLeave={() => setActivePieIndex(null)}
                          isAnimationActive={true}
                          animationDuration={1200}
                          animationEasing="ease-out"
                        >
                          {pieData.map((entry) => (
                            <Cell
                              key={`cell-${entry.name}`}
                              fill={CATEGORY_COLORS[entry.name] || '#6B7280'}
                              stroke="rgba(11, 17, 20, 0.6)"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={<CustomPieTooltip totalCount={totalItemsCount} t={t} language={language} />}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Total Count in Center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                        <AnimatedCounter value={totalItemsCount} />
                      </span>
                      <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-gray-400 -mt-0.5">
                        {t('dashboard_page.items', { defaultValue: 'Items' })}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <p className="text-xs text-gray-400">{t('dashboard_page.no_category_data', { defaultValue: 'No category breakdown data.' })}</p>
                  </div>
                )}
              </div>

              {/* Enhanced Custom Legend with Colored Dots, Count & Percentage */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {pieData.map((item, idx) => {
                    const pct = totalItemsCount > 0 ? Math.round((item.value / totalItemsCount) * 100) : 0;
                    const color = CATEGORY_COLORS[item.name] || '#6B7280';
                    const isHovered = activePieIndex === idx;
                    const translatedCategory = t(`category_names.${item.name}`, { defaultValue: item.name });

                    return (
                      <div
                        key={item.name}
                        onMouseEnter={() => setActivePieIndex(idx)}
                        onMouseLeave={() => setActivePieIndex(null)}
                        className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer border ${
                          isHovered
                            ? 'bg-white/10 border-white/20 scale-[1.02]'
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs font-semibold text-gray-200 truncate">
                            {translatedCategory}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 pl-1">
                          <span className="text-xs text-gray-400">{formatNumber(item.value, language)}</span>
                          <span className="text-[10px] font-bold text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
                            {formatNumber(pct, language)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* 2. CO2 Reduction Trend (Smooth Glowing Area Chart - 7 Cols) */}
            <motion.div
              id="co2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between shadow-xl hover:border-white/15 transition-all scroll-mt-24"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    <span>{t('dashboard_page.co2_trend_title', { defaultValue: 'CO2 Reduction Trend' })}</span>
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">{t('dashboard_page.co2_trend_desc', { defaultValue: 'Kilograms of CO2 emissions prevented over time' })}</p>
                </div>

                {/* Range Filter Buttons: 7D / 30D / All */}
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
                  {['7D', '30D', 'ALL'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTrendRange(range)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        trendRange === range
                          ? 'bg-eco-600 text-white shadow-glow-sm'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Single Data Point Helper Banner */}
              {filteredTrendData.length === 1 && (
                <div className="mt-3 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('dashboard_page.great_start', { defaultValue: 'Great start! Scan items on different days to visualize your long-term multi-day curve.' })}</span>
                </div>
              )}

              {/* Area Chart Container */}
              <div className="h-72 my-4 w-full">
                {filteredTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={filteredTrendData}
                      margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.06)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="displayDate"
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />

                      <YAxis
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        unit="kg"
                      />

                      <Tooltip content={<CustomAreaTooltip t={t} language={language} />} />

                      <Area
                        type="monotone"
                        dataKey="co2SavedKg"
                        stroke="#10B981"
                        strokeWidth={3}
                        fill="url(#emeraldGradient)"
                        dot={{ fill: '#10B981', stroke: '#064e3b', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 7, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    {t('dashboard_page.no_trend_records', { defaultValue: 'No trend records available for this filter.' })}
                  </div>
                )}
              </div>

              {/* Footer with Shield Green Badge */}
              <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
                <span className="text-[11px] text-gray-400">
                  {t('dashboard_page.calc_footer', { defaultValue: 'Calculated via municipal emissions factors & vision AI telemetry' })}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold tracking-wide shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('dashboard_page.client_side_badge', { defaultValue: '100% Client-Side Analytics' })}</span>
                </span>
              </div>
            </motion.div>
          </div>

          {/* Badges Grid (Locked / Unlocked) with Pop Bounce Hover */}
          <div id="streak" className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl scroll-mt-24">
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>{t('dashboard_page.badges_title', { defaultValue: 'Eco Badges & Achievements' })}</span>
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {t('dashboard_page.badges_subtitle', { defaultValue: 'Unlock milestones and boost your sustainability profile by sorting waste responsibly.' })}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {badges.map((badge, idx) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.35 }}
                  whileHover={badge.unlocked ? { scale: 1.02, y: -2 } : {}}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    badge.unlocked
                      ? 'bg-amber-500/[0.04] border-amber-500/30 text-white shadow-[0_0_20px_rgba(245,158,11,0.08)]'
                      : 'bg-white/[0.02] border-white/5 text-gray-500 opacity-60'
                  }`}
                >
                  <span
                    className={`text-2xl p-2.5 rounded-xl bg-dark-bg/80 border border-white/10 shrink-0 ${
                      badge.unlocked ? 'shadow-glow-sm border-amber-500/30' : ''
                    }`}
                  >
                    {badge.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="font-bold text-sm text-white truncate">{badge.title}</h5>
                      {badge.unlocked ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{badge.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
