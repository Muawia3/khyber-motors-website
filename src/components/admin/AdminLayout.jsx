import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Bell, Search, ExternalLink, Database, CheckCircle2 } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { NotificationDropdown } from './NotificationDropdown';
import { ADMIN_NAV_GROUPS } from '../../data/adminNav';
import { Input } from '../ui/Input';
import { apiFetch } from '../../services/api';

export const AdminLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await apiFetch('/health');
        if (res && res.status === 'ok') {
          setDbConnected(true);
        }
      } catch (err) {
        console.warn('Backend health check failed:', err);
        setDbConnected(false);
      }
    };
    checkHealth();
  }, []);

  // Find current active page title across all navigation groups
  const allNavItems = ADMIN_NAV_GROUPS.flatMap((g) => g.items);
  const activeNavItem = allNavItems.find((item) =>
    item.path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(item.path)
  ) || { label: 'Dealership CMS' };

  return (
    <div className="flex h-screen bg-gray-100/90 font-sans text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xs border border-gray-200 text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-base font-extrabold uppercase text-gray-900 tracking-tight">
                {activeNavItem.label}
              </h1>
              <p className="text-[10px] text-gray-500 font-mono hidden sm:block">
                Khyber Motors • CMS Live API Sync
              </p>
            </div>
          </div>

          {/* Header Search & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:w-64 md:block">
              <Input
                placeholder="Global CRM search..."
                className="bg-gray-50 py-1.5 text-xs border-gray-200"
                leftIcon={<Search className="w-3.5 h-3.5 text-gray-400" />}
              />
            </div>

            {/* Notification Dropdown Component */}
            <NotificationDropdown />

            {/* View Public Website Link */}
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C8102E]" /> Main Site
            </Link>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
              <div className="w-7 h-7 bg-[#111827] text-white rounded-full flex items-center justify-center text-xs font-bold font-mono">
                AD
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-xs font-bold text-gray-900 block leading-tight">Admin Manager</span>
                <span className="text-[10px] text-gray-400">Peshawar Sales Desk</span>
              </div>
            </div>
          </div>
        </header>

        {/* Live Backend Connection Status Banner */}
        <div className={`border-b px-4 sm:px-6 py-1.5 text-[11px] font-semibold flex items-center justify-between shrink-0 ${
          dbConnected
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <span className="flex items-center gap-1.5">
            {dbConnected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                DATABASE CONNECTED: Real-time PostgreSQL/Prisma sync active. Changes persist permanently.
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                CONNECTING TO BACKEND DATABASE...
              </>
            )}
          </span>
          <span className="font-mono text-[10px] hidden md:inline text-emerald-700 font-bold">
            {dbConnected ? 'LIVE BACKEND REST API' : 'CHECKING CONNECTION'}
          </span>
        </div>

        {/* Scrollable Main View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gray-100/60">
          {children}
        </main>
      </div>
    </div>
  );
};
