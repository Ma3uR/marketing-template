import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  prefix?: string;
  suffix?: string;
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  prefix,
  suffix,
}: StatsCardProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {prefix}
            {typeof value === 'number' ? value.toLocaleString('uk-UA') : value}
            {suffix}
          </p>
          {trend && (
            <p
              className={`mt-2 text-sm ${
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%{' '}
              <span className="text-gray-500">за місяць</span>
            </p>
          )}
        </div>
        <div className="p-3 bg-purple-500/20 rounded-lg">
          <Icon className="w-6 h-6 text-purple-400" />
        </div>
      </div>
    </div>
  );
}
