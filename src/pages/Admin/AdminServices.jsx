import React, { useState, useEffect } from 'react';
import { Wrench, Eye, Trash2, Calendar, Phone, Mail, User, ShieldCheck } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { apiFetch } from '../../services/api';

export const AdminServices = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/leads');
      if (res && res.success && Array.isArray(res.data)) {
        // Filter leads for service requests
        const filtered = res.data
          .filter((ld) => {
            const dept = (ld.department || '').toLowerCase();
            const subj = (ld.subject || '').toLowerCase();
            const msg = (ld.message || '').toLowerCase();
            return dept.includes('service') || subj.includes('service') || msg.includes('service') || dept.includes('workshop');
          })
          .map((ld) => ({
            id: ld.id,
            rawLead: ld,
            customerName: ld.name,
            phone: ld.phone,
            email: ld.email || 'N/A',
            department: ld.department || 'Authorized 3S Workshop',
            assignedTo: '3S Service Desk',
            vehicle: ld.vehicleInterest || ld.department || 'JAC Workshop Inquiry',
            serviceType: ld.subject || 'Routine Periodic Maintenance',
            message: ld.message || 'No additional notes',
            date: ld.createdAt ? new Date(ld.createdAt).toISOString().split('T')[0] : 'Today',
            status: ld.status || 'New',
          }));
        setServiceRequests(filtered);
      } else {
        setServiceRequests([]);
      }
    } catch (err) {
      console.warn('Failed to fetch service requests:', err);
      setServiceRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Service Requests | Admin CRM';
    fetchServiceRequests();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiFetch(`/leads/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setServiceRequests((prev) =>
        prev.map((sr) => (sr.id === id ? { ...sr, status: newStatus } : sr))
      );
    } catch (err) {
      console.error('Failed to update service request status:', err);
    }
  };

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;
    setDeleting(true);
    try {
      await apiFetch(`/leads/${requestToDelete.id}`, {
        method: 'DELETE',
      });
      setServiceRequests((prev) => prev.filter((sr) => sr.id !== requestToDelete.id));
      if (selectedRequest?.id === requestToDelete.id) {
        setSelectedRequest(null);
      }
      setRequestToDelete(null);
    } catch (err) {
      console.error('Failed to delete service request:', err);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cell: (row) => <span className="font-mono text-gray-400 text-[11px]">{row.id.slice(0, 8)}</span>,
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      cell: (row) => (
        <div>
          <strong className="text-gray-900 block font-bold text-xs">{row.customerName}</strong>
          <span className="text-[10px] text-gray-500 font-mono">{row.phone}</span>
        </div>
      ),
    },
    {
      header: 'Assigned Representative',
      accessor: 'assignedTo',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="text-xs font-semibold text-gray-800">{row.assignedTo}</span>
        </div>
      ),
    },
    {
      header: 'Service Requested',
      accessor: 'serviceType',
      cell: (row) => <span className="text-xs text-gray-800 font-medium">{row.serviceType}</span>,
    },
    {
      header: 'Date',
      accessor: 'date',
      cell: (row) => <span className="font-mono text-xs text-gray-600 font-semibold">{row.date}</span>,
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
            { value: 'Confirmed', label: 'Confirmed' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Cancelled', label: 'Cancelled' },
          ]}
          className="py-1 text-[11px] bg-white border-gray-200"
        />
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedRequest(row)}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-xs transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setRequestToDelete(row)}
            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors"
            title="Delete Service Request"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold uppercase text-gray-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#C8102E]" /> 3S Workshop Service Requests ({serviceRequests.length})
          </h2>
          <p className="text-xs text-gray-500">
            Track periodic maintenance bookings, diagnostic appointments, and workshop job status.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400">Loading service requests...</div>
      ) : (
        <DataTable
          columns={columns}
          data={serviceRequests}
          searchKey="customerName"
          searchPlaceholder="Search by customer name, phone, or service type..."
          filterOptions={['New', 'Confirmed', 'In Progress', 'Completed', 'Cancelled']}
          filterKey="status"
          filterLabel="Status"
          pageSize={8}
        />
      )}

      {/* Service Details Modal */}
      <Modal
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title="Service Request Details"
      >
        {selectedRequest && (
          <div className="space-y-4 text-xs">
            <div className="bg-gray-50 p-4 rounded-xs border border-gray-200 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="font-bold text-gray-900 text-sm">{selectedRequest.customerName}</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">
                  {selectedRequest.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{selectedRequest.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{selectedRequest.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Assigned: <strong>{selectedRequest.assignedTo}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Date: {selectedRequest.date}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-2 space-y-1">
                <span className="font-bold text-gray-900 block">Service Requested:</span>
                <p className="text-gray-700 font-semibold">{selectedRequest.serviceType}</p>
              </div>

              <div className="border-t border-gray-200 pt-2 space-y-1">
                <span className="font-bold text-gray-900 block">Details & Notes:</span>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed bg-white p-2.5 rounded-xs border border-gray-200 font-mono text-[11px]">
                  {selectedRequest.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="xs"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setRequestToDelete(selectedRequest)}
              >
                Delete Request
              </Button>
              <Button variant="primary" size="xs" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(requestToDelete)}
        onClose={() => setRequestToDelete(null)}
        onConfirm={handleDeleteRequest}
        title="Delete Service Request"
        message={`Are you sure you want to permanently delete the service request for "${requestToDelete?.customerName}"? This action cannot be undone.`}
        confirmText={deleting ? 'Deleting...' : 'Delete Permanently'}
        confirmVariant="danger"
      />
    </div>
  );
};

export default AdminServices;
