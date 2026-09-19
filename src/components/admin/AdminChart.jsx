import React from 'react';

/**
 * Pure React SVG Bar / Line / Donut Charts for Dealership Reports.
 */
export const AdminLineChart = ({ data = [], height = 180 }) => {
  if (!data.length) return null;

  const maxVal = Math.max(...data.map((d) => d.count), 1) * 1.2;
  const padding = 30;
  const width = 500;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const points = data.map((d, idx) => {
    const x = padding + (idx / (data.length - 1)) * graphWidth;
    const y = height - padding - (d.count / maxVal) * graphHeight;
    return { x, y, count: d.count, month: d.month };
  });

  const pathD = points.reduce(
    (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  const fillD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = height - padding - ratio * graphHeight;
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#e5e7eb"
              strokeDasharray="3 3"
            />
          );
        })}

        {/* Gradient fill */}
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C8102E" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#C8102E" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <path d={fillD} fill="url(#chartGradient)" />
        <path d={pathD} fill="none" stroke="#C8102E" strokeWidth="3" strokeLinecap="round" />

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              className="fill-white stroke-[#C8102E] stroke-[3] group-hover:r-6 transition-all"
            />
            {/* Label below */}
            <text
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              className="text-[10px] fill-gray-500 font-semibold"
            >
              {p.month}
            </text>
            {/* Tooltip on hover */}
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              className="text-[10px] fill-gray-900 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {p.count}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export const AdminBarChart = ({ data = [] }) => {
  if (!data.length) return null;

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full space-y-3 pt-2">
      {data.map((item, idx) => {
        const pct = Math.round((item.value / maxVal) * 100);
        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-gray-700">
              <span>{item.stage}</span>
              <span className="font-mono text-gray-900">{item.value}% ({item.value} units)</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-xs overflow-hidden">
              <div
                className="bg-[#C8102E] h-full rounded-xs transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const AdminDonutChart = ({ data = [] }) => {
  if (!data.length) return null;

  const COLORS = ['#C8102E', '#111827', '#4B5563', '#9CA3AF'];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
      {/* Visual representation list */}
      <div className="space-y-2.5 text-xs">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-xs shrink-0"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="font-medium text-gray-800">{item.name}</span>
            </div>
            <span className="font-bold font-mono text-gray-900">{item.percentage}%</span>
          </div>
        ))}
      </div>

      {/* Donut progress bars */}
      <div className="space-y-2 bg-gray-50 p-4 rounded-xs border border-gray-200/80">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
          Market Segment Share
        </span>
        {data.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="w-full bg-gray-200 h-2 rounded-xs overflow-hidden">
              <div
                className="h-full rounded-xs"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: COLORS[idx % COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
