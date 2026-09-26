import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';
import { ADMIN_NAV_GROUPS } from '../../data/adminNav';

export const AdminSidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#111827] text-gray-300 border-r border-gray-800 shrink-0 min-h-screen">
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#C8102E] text-white rounded-xs flex items-center justify-center font-extrabold text-sm shadow-xs">
              JAC
            </div>
            <div>
              <span className="text-xs font-black tracking-wider text-white uppercase block">
                Dealership CMS
              </span>
              <span className="text-[10px] text-gray-400 font-mono">Management Portal</span>
            </div>
          </div>
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded-xs uppercase">
            CMS
          </span>
        </div>

        {/* Nav Groups List */}
        <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
          {ADMIN_NAV_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {group.groupLabel && (
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                  {group.groupLabel}
                </span>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xs text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#C8102E] text-white shadow-xs'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-gray-800 text-[11px] text-gray-400 space-y-1">
          <div className="flex items-center gap-1.5 text-gray-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C8102E]" /> Dealership CMS Engine
          </div>
          <p className="text-[10px]">Local Data • REST Ready</p>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        >
          <div
            className="w-64 bg-[#111827] text-gray-300 h-full flex flex-col shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase">CMS Menu</span>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
              {ADMIN_NAV_GROUPS.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-1">
                  {group.groupLabel && (
                    <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                      {group.groupLabel}
                    </span>
                  )}
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin'}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-xs text-xs font-semibold transition-colors ${
                            isActive
                              ? 'bg-[#C8102E] text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
