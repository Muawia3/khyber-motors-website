import React, { useState, useEffect } from 'react';
import { Plus, Eye, UserPlus, X, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { apiFetch } from '../../services/api';
import { VEHICLES } from '../../data/vehicles';
import { validatePakistaniPhone, validateRequired } from '../../utils/validation';

export const AdminLeads = () => {
  const [leadsList, setLeadsList] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    customerName: '',
    phone: '',
    email: '',
    vehicle: VEHICLES[0]?.name || 'JAC T9 4x4',
    source: 'Admin Manual',
    status: 'New',
    assignedTo: 'Hawad Khan Khalil (Sales Desk)',
    city: 'Peshawar',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const fetchLeads = async () => {
    try {
      const res = await apiFetch('/leads');
      if (res && res.success && Array.isArray(res.data)) {
        const formatted = res.data.map((item) => {
          const dept = (item.department || '').toLowerCase();
          let rep = item.assignedTo || 'Hawad Khan Khalil (Sales Desk)';
          if (!item.assignedTo) {
            if (dept.includes('service') || dept.includes('workshop')) {
              rep = 'Sikandar Hayat Jan (3S Service Desk)';
            } else if (dept.includes('parts')) {
              rep = 'Ismail (Spare Parts Desk)';
            } else {
              rep = 'Hawad Khan Khalil (Sales Desk)';
            }
          }
          return {
            id: item.id,
            customerName: item.name,
            phone: item.phone,
            email: item.email || 'N/A',
            vehicle: item.vehicleInterest || 'JAC Vehicle',
            source: item.department ? `Contact (${item.department})` : 'Website Form',
            status: item.status || 'New',
            date: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : 'Today',
            assignedTo: rep,
            city: 'Peshawar',
            notes: item.message || item.subject || '',
          };
        });
        setLeadsList(formatted);
      }
    } catch (err) {
      console.warn('Failed to load leads from backend:', err.message);
    }
  };

  useEffect(() => {
    document.title = 'Leads Directory | Admin CRM';
    fetchLeads();
  }, []);

  const handleAddLeadSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!validateRequired(newLead.customerName)) {
      errors.customerName = 'Customer Name is required';
    }
    if (!validateRequired(newLead.phone)) {
      errors.phone = 'Phone Number is required';
    } else if (!validatePakistaniPhone(newLead.phone)) {
      errors.phone = 'Enter a valid Pakistani phone format';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await apiFetch('/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: newLead.customerName,
          phone: newLead.phone,
          email: newLead.email,
          vehicleInterest: newLead.vehicle,
          message: newLead.notes,
        }),
      });

      setIsAddModalOpen(false);
      setNewLead({
        customerName: '',
        phone: '',
        email: '',
        vehicle: VEHICLES[0]?.name || 'JAC T9 4x4',
        source: 'Admin Manual',
        status: 'New',
        assignedTo: 'Hawad Khan Khalil (Sales Desk)',
        city: 'Peshawar',
        notes: '',
      });
      setFormErrors({});
      fetchLeads();
    } catch (err) {
      console.error('Failed to create lead:', err);
    }
  };

  const handleStatusChange = (leadId, newStatus) => {
    setLeadsList((prev) =>
      prev.map((ld) => (ld.id === leadId ? { ...ld, status: newStatus } : ld))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleConfirmDeleteLead = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/leads/${deleteTarget.id}`, { method: 'DELETE' });
      setLeadsList((prev) => prev.filter((ld) => ld.id !== deleteTarget.id));
      if (selectedLead && selectedLead.id === deleteTarget.id) {
        setSelectedLead(null);
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  // DataTable columns configuration
  const columns = [
    {
      header: 'Customer',
      accessor: 'customerName',
      cell: (row) => (
        <div>
          <strong className="text-gray-900 block font-semibold">{row.customerName}</strong>
          <span className="text-[10px] text-gray-400 font-mono">{row.id} • {row.city}</span>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
      cell: (row) => <span className="font-mono text-gray-700">{row.phone}</span>,
    },
    {
      header: 'Vehicle',
      accessor: 'vehicle',
      cell: (row) => <span className="font-medium text-gray-900">{row.vehicle}</span>,
    },
    {
      header: 'Source',
      accessor: 'source',
      cell: (row) => (
        <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-xs font-medium">
          {row.source}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Select
          value={row.status}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          options={[
            { value: 'New', label: 'New' },
            { value: 'Contacted', label: 'Contacted' },
            { value: 'Follow-up', label: 'Follow-up' },
            { value: 'Qualified', label: 'Qualified' },
            { value: 'Converted', label: 'Converted' },
            { value: 'Lost', label: 'Lost' },
          ]}
          className="py-1 text-[11px] bg-white border-gray-200"
        />
      ),
    },
    {
      header: 'Date',
      accessor: 'date',
      cell: (row) => <span className="font-mono text-[11px] text-gray-500">{row.date}</span>,
    },
    {
      header: 'Assigned To',
      accessor: 'assignedTo',
      cell: (row) => <span className="text-[11px] text-gray-600 font-medium">{row.assignedTo}</span>,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="xs"
            onClick={() => setSelectedLead(row)}
            leftIcon={<Eye className="w-3.5 h-3.5 text-gray-500" />}
          >
            Details
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => setDeleteTarget(row)}
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-600" />}
            className="text-red-600 hover:bg-red-50"
            title="Delete Lead"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold uppercase text-gray-900 tracking-tight">
            Leads Directory
          </h2>
          <p className="text-xs text-gray-500">
            Manage inbound customer leads, status pipelines, and assigned sales representatives.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
          className="uppercase font-bold tracking-wider"
        >
          Add New Lead
        </Button>
      </div>

      {/* Main Leads Data Table */}
      <DataTable
        columns={columns}
        data={leadsList}
        searchKey="customerName"
        searchPlaceholder="Search by customer name, phone, or vehicle..."
        filterOptions={['New', 'Contacted', 'Follow-up', 'Qualified', 'Converted', 'Lost']}
        filterKey="status"
        filterLabel="Status"
        pageSize={6}
      />

      {/* Lead Details Modal */}
      <Modal
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        title={selectedLead ? `Lead Details: ${selectedLead.id}` : ''}
      >
        {selectedLead && (
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">{selectedLead.customerName}</h3>
                <p className="text-xs text-gray-500 font-mono">{selectedLead.phone} • {selectedLead.email}</p>
              </div>
              <StatusBadge status={selectedLead.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-xs">
                <span className="text-gray-400 block">Vehicle Interest:</span>
                <strong className="text-gray-900 font-semibold">{selectedLead.vehicle}</strong>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xs">
                <span className="text-gray-400 block">Lead Source:</span>
                <strong className="text-gray-900 font-semibold">{selectedLead.source}</strong>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xs">
                <span className="text-gray-400 block">City / Location:</span>
                <strong className="text-gray-900 font-semibold">{selectedLead.city}</strong>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xs">
                <span className="text-gray-400 block">Assigned Representative:</span>
                <strong className="text-gray-900 font-semibold">{selectedLead.assignedTo}</strong>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xs border border-gray-200/80 text-xs">
              <span className="text-gray-400 font-bold block mb-1">Internal Notes:</span>
              <p className="text-gray-700 leading-relaxed">{selectedLead.notes || 'No notes provided.'}</p>
            </div>

            <div className="pt-3 flex justify-between items-center border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(selectedLead)}
                leftIcon={<Trash2 className="w-4 h-4 text-red-600" />}
                className="text-red-600 hover:bg-red-50 font-bold"
              >
                Delete Lead
              </Button>

              <Button variant="outline" size="sm" onClick={() => setSelectedLead(null)}>
                Close Window
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add New Lead Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer Lead"
      >
        <form onSubmit={handleAddLeadSubmit} className="space-y-4" noValidate>
          <Input
            label="Customer Name"
            placeholder="e.g. Asad Ali Khan"
            required
            value={newLead.customerName}
            onChange={(e) => setNewLead({ ...newLead, customerName: e.target.value })}
            error={formErrors.customerName}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              placeholder="e.g. 0300 1234567"
              required
              value={newLead.phone}
              onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
              error={formErrors.phone}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={newLead.email}
              onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Vehicle Interest"
              value={newLead.vehicle}
              onChange={(e) => setNewLead({ ...newLead, vehicle: e.target.value })}
              options={VEHICLES.map((v) => ({ value: v.name, label: v.name }))}
            />

            <Select
              label="Lead Source"
              value={newLead.source}
              onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
              options={[
                { value: 'Website Form', label: 'Website Form' },
                { value: 'Test Drive Request', label: 'Test Drive Request' },
                { value: 'WhatsApp Direct', label: 'WhatsApp Direct' },
                { value: 'Showroom Walk-in', label: 'Showroom Walk-in' },
                { value: 'Corporate Inquiry', label: 'Corporate Inquiry' },
              ]}
            />
          </div>

          <Textarea
            label="Lead Notes"
            placeholder="Enter customer preferences or specific inquiries..."
            rows={3}
            value={newLead.notes}
            onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
          />

          <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save New Lead
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteLead}
        title="Delete Customer Lead?"
        message={`Are you sure you want to delete lead for "${deleteTarget?.customerName}" (${deleteTarget?.phone}) permanently?`}
        confirmText="Delete Lead"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};
