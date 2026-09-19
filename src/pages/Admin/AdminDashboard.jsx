import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, UserCheck, Car, ArrowRight, TrendingUp, Bell } from 'lucide-react';
import { KPICard } from '../../components/admin/KPICard';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminLineChart } from '../../components/admin/AdminChart';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../services/api';
import { vehicleService } from '../../services/vehicleService';
import { notificationService } from '../../services/notificationService';
import { getLast12MonthsLeadTrajectory } from '../../utils/analytics';

export const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const [leadsRes, vehiclesRes, unreadCount] = await Promise.all([
        apiFetch('/leads').catch(() => null),
        vehicleService.getVehicles().catch(() => []),
        notificationService.getUnreadCount().catch(() => 0),
      ]);

      if (leadsRes && leadsRes.success && Array.isArray(leadsRes.data)) {
        setLeads(leadsRes.data);
      }
      if (Array.isArray(vehiclesRes)) {
        setVehiclesList(vehiclesRes);
      }
      setUnreadNotifCount(unreadCount || 0);
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    }
  };

  useEffect(() => {
    document.title = 'Admin Dashboard | Khyber Motors CRM';
    fetchDashboardData();
    const timer = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(timer);
  }, []);

  const leadTrajectoryData = getLast12MonthsLeadTrajectory(leads);

  return (
    <div className="space-y-6">
      {/* 3 KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="New Leads"
          value={leads.length}
          change={leads.length > 0 ? `+${leads.length}` : '0'}
          trend={leads.length > 0 ? 'up' : 'neutral'}
          icon={Users}
        />
        <KPICard
          title="Unread Alerts"
          value={unreadNotifCount}
          change={unreadNotifCount > 0 ? `+${unreadNotifCount}` : '0'}
          trend={unreadNotifCount > 0 ? 'up' : 'neutral'}
          icon={Bell}
        />
        <KPICard
          title="Vehicles in Lineup"
          value={vehiclesList.length}
          change="Catalog Live"
          trend="neutral"
          icon={Car}
        />
      </div>

      {/* Main Grid Row: Monthly Lead Trajectory Chart */}
      <div className="grid grid-cols-1 gap-6 items-start">
        <Card className="p-5 border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase text-gray-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#C8102E]" /> Monthly Lead Trajectory
              </h3>
              <p className="text-[11px] text-gray-500">Inbound customer inquiries across website and showroom</p>
            </div>
            <Link to="/admin/reports">
              <Button variant="secondary" size="xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Full Analytics
              </Button>
            </Link>
          </div>

          <AdminLineChart data={leadTrajectoryData} height={200} />
        </Card>
      </div>

      {/* Grid Row 2: Recent Leads & Vehicle Lineup Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Leads Table */}
        <div className="lg:col-span-7">
          <Card className="p-5 border border-gray-200/80 bg-white space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold uppercase text-gray-900 tracking-tight">
                Recent Lead Inquiries
              </h3>
              <Link to="/admin/leads" className="text-xs font-bold text-[#C8102E] hover:underline">
                Manage Leads
              </Link>
            </div>

            <div className="overflow-x-auto">
              {leads.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">No lead inquiries received yet.</p>
              ) : (
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-100/80 text-[10px] font-bold text-gray-500 uppercase">
                    <tr>
                      <th className="px-3 py-2">Customer</th>
                      <th className="px-3 py-2">Vehicle</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leads.slice(0, 5).map((ld) => (
                      <tr key={ld.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5">
                          <strong className="text-gray-900 block">{ld.name}</strong>
                          <span className="text-[10px] text-gray-400 font-mono">{ld.phone}</span>
                        </td>
                        <td className="px-3 py-2.5 font-medium">{ld.vehicleInterest || 'General'}</td>
                        <td className="px-3 py-2.5">
                          <StatusBadge status={ld.status || 'New'} />
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[10px] text-gray-500">
                          {ld.createdAt ? new Date(ld.createdAt).toISOString().split('T')[0] : 'Today'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>

        {/* Vehicle Lineup Overview */}
        <div className="lg:col-span-5">
          <Card className="p-5 border border-gray-200/80 bg-white space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold uppercase text-gray-900 tracking-tight">
                Active Vehicle Catalog
              </h3>
              <Link to="/admin/vehicles" className="text-xs font-bold text-[#C8102E] hover:underline">
                Manage Catalog
              </Link>
            </div>

            <div className="space-y-3">
              {vehiclesList.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No vehicles found in database.</p>
              ) : (
                vehiclesList.map((vh) => (
                  <div
                    key={vh.id}
                    className="p-3 bg-gray-50 rounded-xs border border-gray-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-gray-900 block">{vh.name}</span>
                      <span className="text-[11px] text-gray-500">{vh.categoryLabel || vh.tagline || vh.category}</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#C8102E] bg-red-50 px-2 py-1 rounded-xs border border-red-100">
                      {vh.categoryLabel || vh.category}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
