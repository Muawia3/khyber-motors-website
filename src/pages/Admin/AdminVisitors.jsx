import React, { useState, useEffect } from 'react';
import {
  Globe,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  RotateCcw,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { WebsiteAnalyticsSection } from '../../components/admin/WebsiteAnalyticsSection';
import { analyticsService } from '../../services/analyticsService';

export const AdminVisitors = () => {
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState(null); // { period: 'today'|'week'|'month'|'all'|'range', label: string }
  const [isResetting, setIsResetting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    document.title = 'Website Visitors & Reset Manager | Admin CMS';
  }, []);

  const handleOpenResetModal = (period, label) => {
    setResetTarget({ period, label });
    setResetModalOpen(true);
  };

  const executeReset = async () => {
    if (!resetTarget) return;

    setIsResetting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await analyticsService.resetAnalytics(resetTarget.period);
      if (res && res.success) {
        setSuccessMessage(`Success! ${resetTarget.label} visits have been reset to 0 (${res.count || 0} records cleared).`);
        setRefreshKey((prev) => prev + 1);
        setResetModalOpen(false);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(res?.error || 'Failed to reset analytics records.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error occurred while resetting analytics.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xs border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#C8102E]" /> Website Visitors &amp; Analytics Manager
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Dedicated panel for monitoring public website traffic and resetting visitor counters for today, week, month, or all-time.
          </p>
        </div>
      </div>

      {/* Success / Error Messages */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xs flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-xs flex items-center gap-3 animate-fadeIn">
          <ShieldAlert className="w-5 h-5 text-[#C8102E] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Reset Operations Toolbar */}
      <Card className="p-5 border border-gray-200/80 bg-white space-y-4 shadow-xs">
        <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-extrabold uppercase text-gray-900 tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#C8102E]" /> Visitor Counter Reset Controls (Zero Out Data)
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Select an option below to zero out website visitor telemetry records in PostgreSQL database.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => handleOpenResetModal('today', "Today's")}
            className="p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xs text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[#C8102E] font-bold text-xs">
              <span>Reset Today's Visits</span>
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[10px] text-gray-600 mt-1">Zero out all visitor views logged today.</p>
          </button>

          <button
            type="button"
            onClick={() => handleOpenResetModal('week', "This Week's")}
            className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xs text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-amber-800 font-bold text-xs">
              <span>Reset This Week</span>
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[10px] text-gray-600 mt-1">Clear all visitor views from the past 7 days.</p>
          </button>

          <button
            type="button"
            onClick={() => handleOpenResetModal('month', "This Month's")}
            className="p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xs text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-orange-800 font-bold text-xs">
              <span>Reset This Month</span>
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[10px] text-gray-600 mt-1">Clear all visitor views from the past 30 days.</p>
          </button>

          <button
            type="button"
            onClick={() => handleOpenResetModal('all', 'All Time')}
            className="p-3 bg-gray-900 hover:bg-black text-white border border-gray-800 rounded-xs text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-red-400 font-bold text-xs">
              <span>Clear All Analytics</span>
              <Trash2 className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Permanently erase all visitor history records.</p>
          </button>
        </div>
      </Card>

      {/* Embedded Website Analytics Section with Live Refresh Key */}
      <WebsiteAnalyticsSection key={refreshKey} />

      {/* Confirmation Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={`Confirm Reset: ${resetTarget?.label || ''} Visitor Data`}
      >
        <div className="space-y-4 pt-1">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xs text-xs text-red-800 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#C8102E] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Are you sure you want to zero out {resetTarget?.label} visits?</p>
              <p className="mt-1 text-[11px] text-gray-600">
                This operation will delete the corresponding page view records from the PostgreSQL database. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResetModalOpen(false)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={executeReset}
              isLoading={isResetting}
              leftIcon={<Trash2 className="w-4 h-4" />}
              className="bg-[#C8102E] hover:bg-red-700"
            >
              Confirm Zero Out ({resetTarget?.label})
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
