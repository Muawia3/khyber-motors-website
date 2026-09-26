import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { Card } from '../ui/Card';

export const KPICard = ({
  title,
  value,
  change,
  trend = 'up',
  icon: Icon,
  className = '',
}) => {
  const isUp = trend === 'up';

  return (
    <Card className={`p-5 border border-gray-200/80 bg-white shadow-xs relative overflow-hidden ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {title}
        </span>
        {Icon && (
          <div className="w-9 h-9 bg-red-50 text-[#C8102E] rounded-xs flex items-center justify-center font-bold">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono tracking-tight">
          {value}
        </span>

        {change && (
          <div
            className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-xs ${
              isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{change}</span>
          </div>
        )}
      </div>
    </Card>
  );
};
