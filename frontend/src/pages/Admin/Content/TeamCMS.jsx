import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Upload,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building,
  RefreshCw,
  GitFork,
  Table as TableIcon,
  Layers,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/common/Badge';
import { teamService } from '../../../services/teamService';
import { TeamHierarchy } from '../../../components/team/TeamHierarchy';

const DEFAULT_DEPARTMENTS = [
  'Executive Management',
  'Sales & Commercial Fleet',
  'After-Sales Service',
  'Spare Parts & Accessories',
  'Finance & Customer Support',
];

export const TeamCMS = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // View Mode: 'visual' (Visual Org Tree) vs 'table' (Tabular List)
  const [viewMode, setViewMode] = useState('visual');

  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', message: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    designation: '',
    department: 'Sales & Commercial Fleet',
    shortDescription: '',
    imageUrl: '',
    parentId: '',
    displayOrder: 0,
    isActive: true,
  });

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    document.title = 'Profiles / Our Team Builder | Admin Panel';
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    setLoading(true);
    try {
      const data = await teamService.getTeamMembers(false);
      setTeamMembers(data || []);
    } catch (err) {
      console.error('Failed to load team members:', err);
      setFeedbackMsg({ type: 'error', message: 'Failed to load team profiles.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = (parentMember = null) => {
    setEditingMember(null);
    const maxOrder =
      teamMembers.length > 0 ? Math.max(...teamMembers.map((m) => m.displayOrder || 0)) + 1 : 0;

    // Default to General Manager if available so new profiles attach under GM
    const defaultGM = teamMembers.find((m) =>
      (m.designation || '').toLowerCase().includes('general manager')
    );

    let defaultParentId = '';
    if (parentMember) {
      defaultParentId = parentMember.id;
    } else if (defaultGM) {
      defaultParentId = defaultGM.id;
    }

    setForm({
      name: '',
      designation: '',
      department: parentMember ? parentMember.department : 'Sales & Commercial Fleet',
      shortDescription: '',
      imageUrl: '',
      parentId: defaultParentId,
      displayOrder: maxOrder,
      isActive: true,
    });
    setFeedbackMsg({ type: '', message: '' });
    setIsModalOpen(true);
  };


  const handleOpenEditModal = (member) => {
    setEditingMember(member);
    setForm({
      name: member.name || '',
      designation: member.designation || '',
      department: member.department || 'Sales & Commercial Fleet',
      shortDescription: member.shortDescription || '',
      imageUrl: member.imageUrl || '',
      parentId: member.parentId || '',
      displayOrder: member.displayOrder ?? 0,
      isActive: member.isActive ?? true,
    });
    setFeedbackMsg({ type: '', message: '' });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFeedbackMsg({ type: '', message: '' });
    try {
      const uploadedUrl = await teamService.uploadImageFile(file);
      setForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      setFeedbackMsg({ type: 'success', message: 'Image uploaded successfully.' });
    } catch (err) {
      console.error('File upload error:', err);
      setFeedbackMsg({ type: 'error', message: err.message || 'Image upload failed.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFeedbackMsg({ type: 'error', message: 'Name is required.' });
      return;
    }
    if (!form.designation.trim()) {
      setFeedbackMsg({ type: 'error', message: 'Designation is required.' });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg({ type: '', message: '' });

    try {
      const payload = {
        name: form.name.trim(),
        designation: form.designation.trim(),
        department: form.department ? form.department.trim() : 'Team',
        shortDescription: form.shortDescription ? form.shortDescription.trim() : '',
        imageUrl: form.imageUrl ? form.imageUrl.trim() : '',
        parentId: form.parentId ? form.parentId.trim() : null,
        displayOrder: parseInt(form.displayOrder, 10) || 0,
        isActive: form.isActive,
      };


      if (editingMember) {
        await teamService.updateTeamMember(editingMember.id, payload);
        setFeedbackMsg({ type: 'success', message: 'Team profile updated successfully.' });
      } else {
        await teamService.createTeamMember(payload);
        setFeedbackMsg({ type: 'success', message: 'New team profile added successfully.' });
      }

      setIsModalOpen(false);
      loadTeamMembers();
    } catch (err) {
      console.error('Save profile error:', err);
      setFeedbackMsg({ type: 'error', message: err.message || 'Failed to save team profile.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await teamService.toggleTeamMember(id);
      loadTeamMembers();
    } catch (err) {
      console.error('Toggle status error:', err);
      setFeedbackMsg({ type: 'error', message: err.message || 'Failed to update status.' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await teamService.deleteTeamMember(deleteTarget.id);
      setFeedbackMsg({
        type: 'success',
        message: `Profile for ${deleteTarget.name} deleted successfully.`,
      });
      setDeleteTarget(null);
      loadTeamMembers();
    } catch (err) {
      console.error('Delete error:', err);
      setFeedbackMsg({ type: 'error', message: err.message || 'Failed to delete team member.' });
    }
  };

  // Helper map for parent names
  const memberMap = new Map(teamMembers.map((m) => [m.id, m]));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-sm border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#C8102E]" />
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-gray-900">
              Profiles & Organizational Hierarchy Builder
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Build any organizational hierarchy dynamically. Click "+ Add Subordinate" on any manager card or select "Reports To" to re-assign reporting lines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Switcher */}
          <div className="bg-gray-100 p-1 rounded-xs flex items-center border border-gray-200">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'visual'
                  ? 'bg-white text-[#C8102E] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Visual Org Builder</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#C8102E] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadTeamMembers}
            disabled={loading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenAddModal(null)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Profile
          </Button>
        </div>
      </div>

      {/* Global Toast / Feedback Notice */}
      {feedbackMsg.message && (
        <div
          className={`p-4 rounded-xs border text-xs font-semibold flex items-center justify-between gap-3 ${
            feedbackMsg.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMsg.message}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg({ type: '', message: '' })}
            className="text-gray-400 hover:text-gray-600 font-bold text-sm"
          >
            ×
          </button>
        </div>
      )}

      {loading ? (
        <Card className="p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C8102E] mx-auto" />
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
            Loading Organizational Hierarchy...
          </p>
        </Card>
      ) : teamMembers.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-700 uppercase">No Profiles Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Click "Add Profile" above to create team members and set up reporting relationships.
          </p>
          <Button variant="primary" size="sm" onClick={() => handleOpenAddModal(null)}>
            Add First Profile
          </Button>
        </Card>
      ) : viewMode === 'visual' ? (
        /* VISUAL ORG CHART VIEW */
        <Card className="p-6 bg-gray-50/50 overflow-hidden space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
              <GitFork className="w-4 h-4 text-[#C8102E]" />
              <span>Interactive Visual Org Hierarchy Chart ({teamMembers.length} Members)</span>
            </div>
            <span className="text-[11px] text-gray-500">
              Click "+ Add Subordinate" on any card to append reporting team members
            </span>
          </div>

          <TeamHierarchy
            teamMembers={teamMembers}
            hideHeader={true}
            isAdmin={true}
            onAddSubordinate={(parent) => handleOpenAddModal(parent)}
            onEdit={(member) => handleOpenEditModal(member)}
            onDelete={(member) => setDeleteTarget(member)}
            onToggleActive={(id) => handleToggleActive(id)}
          />
        </Card>
      ) : (
        /* TABLE VIEW */
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
              Team Profiles ({teamMembers.length})
            </h2>
            <span className="text-[11px] text-gray-400">
              Display order controls node sorting at each reporting level
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Reports To (Parent)</th>
                  <th className="py-3 px-4 text-center">Order</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs">
                {teamMembers.map((member) => {
                  const parentMember = member.parentId ? memberMap.get(member.parentId) : null;

                  return (
                    <tr key={member.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Member Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {member.imageUrl ? (
                            <img
                              src={member.imageUrl}
                              alt={member.name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0 border border-gray-200">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900">{member.name}</div>
                            {member.shortDescription && (
                              <div className="text-[11px] text-gray-500 line-clamp-1 max-w-xs">
                                {member.shortDescription}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {member.designation}
                      </td>

                      {/* Reports To */}
                      <td className="py-3 px-4">

                        {parentMember ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-xs text-[11px] font-semibold text-blue-800">
                            <Layers className="w-3 h-3 text-blue-600" />
                            <span>{parentMember.name}</span>
                            <span className="text-blue-500 text-[10px]">({parentMember.designation})</span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                            Top Level Manager
                          </span>
                        )}
                      </td>

                      {/* Display Order */}
                      <td className="py-3 px-4 text-center font-semibold text-gray-700">
                        {member.displayOrder}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(member.id)}
                          className="cursor-pointer"
                        >
                          <Badge variant={member.isActive ? 'emerald' : 'gray'}>
                            {member.isActive ? 'Active' : 'Disabled'}
                          </Badge>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAddModal(member)}
                            className="p-1.5 text-gray-600 hover:text-[#C8102E] hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                            title="Add Subordinate"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(member)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xs transition-colors cursor-pointer"
                            title="Edit Profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(member)}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? `Edit Profile: ${editingMember.name}` : 'Add New Team Member Profile'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Image Preview & Upload */}
          <div className="bg-gray-50 p-4 rounded-xs border border-gray-200 space-y-3">
            <label className="block text-xs font-bold uppercase text-gray-700">
              Profile Image
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#C8102E] shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center shrink-0 border-2 border-gray-300">
                  <User className="w-8 h-8" />
                </div>
              )}

              <div className="space-y-2 flex-1 w-full">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="https://example.com/photo.jpg"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="flex-1 text-xs"
                  />
                  <label className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploading}
                      leftIcon={
                        isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#C8102E]" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )
                      }
                      onClick={() => document.getElementById('team-image-upload-input')?.click()}
                    >
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                    <input
                      id="team-image-upload-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                <p className="text-[11px] text-gray-500">
                  Upload profile picture or paste image URL.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Tariq Khan"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. General Manager, Sales Manager, Service Advisor"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Reports To (Parent selector) */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Reports To (Parent Manager)
            </label>
            <select
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xs text-xs focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E]"
            >
              <option value="">-- Top Level Manager (No Parent) --</option>
              {teamMembers
                .filter((m) => !editingMember || m.id !== editingMember.id)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.designation})
                  </option>
                ))}
            </select>
          </div>


          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Short Description / Bio
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of responsibilities, experience, or role..."
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              className="w-full p-3 bg-white border border-gray-300 rounded-xs text-xs focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Display Order */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Display Order
              </label>
              <Input
                type="number"
                min="0"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
              />
            </div>

            {/* Is Active toggle */}
            <div className="flex items-center gap-3 pt-4">
              <input
                id="form-is-active"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E] rounded-xs border-gray-300 cursor-pointer"
              />
              <label htmlFor="form-is-active" className="text-xs font-bold uppercase text-gray-700 cursor-pointer">
                Enable Profile (Visible on Website)
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : null}
            >
              {isSubmitting ? 'Saving...' : editingMember ? 'Update Profile' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Delete Profile"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Are you sure you want to delete profile for{' '}
            <strong className="text-gray-900">{deleteTarget?.name}</strong> (
            {deleteTarget?.designation})? Any reporting team members will be reassigned to its parent.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Delete Profile
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeamCMS;
