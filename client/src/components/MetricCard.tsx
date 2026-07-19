import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string; // e.g. 'bg-blue-500 text-white' or 'text-blue-500 bg-blue-50'
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  colorClass,
  subtext,
  trend,
}) => {
  return (
    <div className="premium-card p-6 relative overflow-hidden">
      {/* Decorative gradient overlay inside card */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none dark:from-white/5" />

      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-3xl font-extrabold mt-3 text-slate-900 dark:text-white tracking-tight leading-none">
            {value}
          </h3>
        </div>
        <div className={`p-3.5 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="flex items-center gap-2 mt-5 text-[11px] font-bold relative z-10">
          {trend && (
            <span
              className={`px-2 py-0.5 rounded-full ${
                trend.isPositive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.value}
            </span>
          )}
          {subtext && <span className="text-slate-500 dark:text-slate-400">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
