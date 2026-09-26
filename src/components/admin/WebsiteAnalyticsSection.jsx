import React, { useState, useEffect } from 'react';
import {
  Globe,
  Users,
  Eye,
  Calendar,
  BarChart3,
  RefreshCw,
  TrendingUp,
  Filter,
  CheckCircle2,
  Clock,
  FileText
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { analyticsService } from '../../services/analyticsService';

export const WebsiteAnalyticsSection = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [datePreset, setDatePreset] = useState('7days'); // '7days' | '14days' | '30days' | 'custom'

  // Calculate default dates for 7 days
  const getInitialDates = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  const [dateRange, setDateRange] = useState(getInitialDates());

  const fetchAnalytics = async (start = dateRange.startDate, end = dateRange.endDate) => {
    try {
      setRefreshing(true);
      const data = await analyticsService.getAnalyticsStats(start, end);
      if (data) {
        setStats(data);
      }
    } catch (err) {
      console.warn('Error fetching website analytics stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(dateRange.startDate, dateRange.endDate);
  }, []);

  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    const end = new Date();
    const start = new Date();

    if (preset === '7days') {
      start.setDate(start.getDate() - 6);
    } else if (preset === '14days') {
      start.setDate(start.getDate() - 13);
    } else if (preset === '30days') {
      start.setDate(start.getDate() - 29);
    }

    const sStr = start.toISOString().split('T')[0];
    const eStr = end.toISOString().split('T')[0];

    setDateRange({ startDate: sStr, endDate: eStr });
    fetchAnalytics(sStr, eStr);
  };

  const handleCustomDateChange = (key, value) => {
    setDatePreset('custom');
    const updated = { ...dateRange, [key]: value };
    setDateRange(updated);
    if (updated.startDate && updated.endDate) {
      fetchAnalytics(updated.startDate, updated.endDate);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 border border-gray-200/80 bg-white space-y-4 shadow-xs">
        <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-[#C8102E]" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading Real Website Analytics...</span>
        </div>
      </Card>
    );
  }

  const dailyData = stats?.dailyHistory || [];
  const maxVisitors = Math.max(...dailyData.map((d) => d.visitors), 1);
  const maxPageViews = Math.max(...dailyData.map((d) => d.pageViews), 1);
  const chartHeight = 160;

  return (
    <Card className="p-5 sm:p-6 border border-gray-200/80 bg-white space-y-6 shadow-xs">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold uppercase text-gray-900 tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#C8102E]" /> Website Analytics &amp; Visitor Intelligence
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live DB
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real visitor telemetry tracked from public website pages (PostgreSQL Database).
          </p>
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={() => fetchAnalytics(dateRange.startDate, dateRange.endDate)}
          isLoading={refreshing}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Data
        </Button>
      </div>

      {/* 6 Real Analytics KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-red-50/50 border border-red-100 rounded-xs space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Visitors Today</span>
          <div className="text-xl font-extrabold text-[#C8102E] font-mono">{stats?.visitorsToday ?? 0}</div>
          <span className="text-[10px] text-gray-400">Unique IPs / IDs</span>
        </div>

        <div className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-xs space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Visitors This Week</span>
          <div className="text-xl font-extrabold text-gray-900 font-mono">{stats?.visitorsThisWeek ?? 0}</div>
          <span className="text-[10px] text-gray-400">Last 7 Days</span>
        </div>

        <div className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-xs space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Visitors This Month</span>
          <div className="text-xl font-extrabold text-gray-900 font-mono">{stats?.visitorsThisMonth ?? 0}</div>
          <span className="text-[10px] text-gray-400">Last 30 Days</span>
        </div>

        <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xs space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Unique Visitors</span>
          <div className="text-xl font-extrabold text-emerald-700 font-mono">{stats?.totalUniqueVisitors ?? 0}</div>
          <span className="text-[10px] text-gray-400">All Time Unique</span>
        </div>

        <div className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-xs space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Page Views Today</span>
          <div className="text-xl font-extrabold text-gray-900 font-mono">{stats?.pageViewsToday ?? 0}</div>
          <span className="text-[10px] text-gray-400">Hits Today</span>
        </div>

        <div className="p-3.5 bg-gray-900 text-white rounded-xs space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Page Views</span>
          <div className="text-xl font-extrabold text-white font-mono">{stats?.totalPageViews ?? 0}</div>
          <span className="text-[10px] text-gray-400">All Time Views</span>
        </div>
      </div>

      {/* Date / Date-Range Selector & Daily Visitors History Chart */}
      <div className="space-y-4 pt-2 border-t border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gray-50 p-3 rounded-xs border border-gray-200/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C8102E]" />
            <h3 className="text-xs font-extrabold uppercase text-gray-900 tracking-wider">
              Daily Visitor History &amp; Traffic Graph
            </h3>
          </div>

          {/* Controls: Preset Buttons + Date Picker */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xs border border-gray-300 p-0.5 bg-white">
              {[
                { id: '7days', label: 'Last 7 Days' },
                { id: '14days', label: 'Last 14 Days' },
                { id: '30days', label: 'Last 30 Days' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => handlePresetChange(btn.id)}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-colors rounded-xs cursor-pointer ${
                    datePreset === btn.id
                      ? 'bg-[#C8102E] text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-mono">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                className="px-2 py-1 bg-white border border-gray-300 rounded-xs text-[11px] text-gray-800 font-medium focus:outline-none focus:border-[#C8102E]"
              />
              <span>to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                className="px-2 py-1 bg-white border border-gray-300 rounded-xs text-[11px] text-gray-800 font-medium focus:outline-none focus:border-[#C8102E]"
              />
            </div>
          </div>
        </div>

        {/* Daily History Interactive SVG Chart */}
        <div className="p-4 bg-gray-900 rounded-xs text-white space-y-3">
          <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#C8102E]" /> Unique Visitors
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-cyan-400" /> Page Views
              </span>
            </div>
            <span className="font-mono text-[10px]">
              Range: {dateRange.startDate} — {dateRange.endDate}
            </span>
          </div>

          {dailyData.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500 font-mono">
              No traffic records available for the selected date range.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[500px] pt-4 pb-2">
                <svg viewBox={`0 0 ${dailyData.length * 60} ${chartHeight}`} className="w-full h-auto overflow-visible">
                  {/* Grid Lines */}
                  {[0.25, 0.5, 0.75, 1].map((r, i) => {
                    const y = chartHeight - 24 - r * (chartHeight - 40);
                    return (
                      <line
                        key={i}
                        x1="0"
                        y1={y}
                        x2={dailyData.length * 60}
                        y2={y}
                        stroke="#374151"
                        strokeDasharray="2 2"
                      />
                    );
                  })}

                  {/* Bars & Labels */}
                  {dailyData.map((item, idx) => {
                    const groupWidth = 60;
                    const centerX = idx * groupWidth + groupWidth / 2;
                    const maxScale = Math.max(maxVisitors, maxPageViews, 1);

                    const visitorBarH = (item.visitors / maxScale) * (chartHeight - 40);
                    const pageViewBarH = (item.pageViews / maxScale) * (chartHeight - 40);

                    const yVisitor = chartHeight - 24 - visitorBarH;
                    const yPageView = chartHeight - 24 - pageViewBarH;

                    const dateFormatted = item.date.slice(5); // MM-DD

                    return (
                      <g key={item.date} className="group cursor-pointer">
                        {/* Page Views Bar (Cyan) */}
                        <rect
                          x={centerX - 12}
                          y={yPageView}
                          width="10"
                          height={Math.max(pageViewBarH, 2)}
                          fill="#38bdf8"
                          rx="2"
                          className="opacity-80 group-hover:opacity-100 transition-opacity"
                        />

                        {/* Unique Visitors Bar (Red) */}
                        <rect
                          x={centerX + 2}
                          y={yVisitor}
                          width="10"
                          height={Math.max(visitorBarH, 2)}
                          fill="#C8102E"
                          rx="2"
                          className="opacity-90 group-hover:opacity-100 transition-opacity"
                        />

                        {/* Date Label */}
                        <text
                          x={centerX}
                          y={chartHeight - 6}
                          textAnchor="middle"
                          className="text-[9px] fill-gray-400 font-mono"
                        >
                          {dateFormatted}
                        </text>

                        {/* Tooltip on Hover */}
                        <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <rect
                            x={centerX - 45}
                            y={Math.min(yVisitor, yPageView) - 32}
                            width="90"
                            height="28"
                            fill="#1f2937"
                            stroke="#4b5563"
                            rx="4"
                          />
                          <text
                            x={centerX}
                            y={Math.min(yVisitor, yPageView) - 20}
                            textAnchor="middle"
                            className="text-[9px] fill-white font-bold"
                          >
                            {item.date}
                          </text>
                          <text
                            x={centerX}
                            y={Math.min(yVisitor, yPageView) - 9}
                            textAnchor="middle"
                            className="text-[8px] fill-gray-300 font-mono"
                          >
                            {item.visitors} Vis | {item.pageViews} Views
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Most Visited Pages Breakdown Table */}
      <div className="pt-2 border-t border-gray-100 space-y-3">
        <h3 className="text-xs font-extrabold uppercase text-gray-900 tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#C8102E]" /> Most Visited Public Pages
        </h3>

        {!stats?.mostVisitedPages || stats.mostVisitedPages.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">No page view data recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700 border border-gray-200/80 rounded-xs">
              <thead className="bg-gray-100/80 text-[10px] font-bold text-gray-500 uppercase">
                <tr>
                  <th className="px-3.5 py-2.5">Page Path</th>
                  <th className="px-3.5 py-2.5">Total Page Views</th>
                  <th className="px-3.5 py-2.5">Traffic Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {stats.mostVisitedPages.map((page, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-3.5 py-2.5 font-mono text-gray-900 font-bold">
                      {page.path}
                    </td>
                    <td className="px-3.5 py-2.5 font-bold text-gray-900">
                      {page.count} <span className="text-[10px] font-normal text-gray-400">views</span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="grow bg-gray-100 h-2 rounded-full overflow-hidden max-w-[140px]">
                          <div
                            className="bg-[#C8102E] h-full rounded-full transition-all duration-300"
                            style={{ width: `${page.percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold font-mono text-gray-600">
                          {page.percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
};
