import React, { useState, useEffect } from 'react';
import {
  Building2,
  Phone,
  Clock,
  Bell,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe,
  Loader2,
  Users,
  ShieldCheck,
  Plus,
  KeyRound,
  Trash2,
  Edit2,
  History,
  Lock,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { contentService } from '../../services/contentService';
import { DEFAULT_CONTACT_CONTENT } from '../../data/dealership';
import { useContact } from '../../context/useContact';
import { useAuth } from '../../context/useAuth';
import { apiFetch } from '../../services/api';

export const AdminSettings = () => {
  const { updateContactData } = useContact();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [contactData, setContactData] = useState(DEFAULT_CONTACT_CONTENT);
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: true,
    leadAssignments: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  // Admin Users & Login History State
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('ADMIN');
  const [submittingNewUser, setSubmittingNewUser] = useState(false);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('ADMIN');
  const [submittingEditUser, setSubmittingEditUser] = useState(false);

  // Change Password Modal State
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Delete User Confirmation State
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Login History Drawer State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    document.title = 'Dealership Settings | Admin CRM';
    let isMounted = true;
    const loadContent = async () => {
      try {
        const data = await contentService.getContactContent();
        if (data && isMounted) {
          setContactData((prev) => ({
            ...prev,
            ...data,
            social: {
              facebook: data.social?.facebook || prev.social?.facebook || '',
              instagram: data.social?.instagram || prev.social?.instagram || '',
              whatsapp: data.social?.whatsapp || prev.social?.whatsapp || '',
              linkedin: data.social?.linkedin || prev.social?.linkedin || '',
              youtube: data.social?.youtube || prev.social?.youtube || '',
            },
          }));
        }
      } catch (err) {
        console.warn('Failed loading contact content:', err);
      }
    };
    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchAdminUsers = async () => {
    setLoadingUsers(true);
    setUserError('');
    try {
      const res = await apiFetch('/auth/users');
      if (res && res.success && Array.isArray(res.data)) {
        setAdminUsers(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch admin users:', err);
      setUserError(err.message || 'Failed to fetch admin users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchLoginHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await apiFetch('/auth/login-history');
      if (res && res.success && Array.isArray(res.data)) {
        setLoginHistory(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch login history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin-users') {
      fetchAdminUsers();
    }
  }, [activeTab]);

  const updateField = (key, val) => {
    setContactData((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const updateSocialField = (key, val) => {
    setContactData((prev) => ({
      ...prev,
      social: {
        ...(prev.social || {}),
        [key]: val,
      },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      const updated = await contentService.saveContactContent(contactData);
      if (updated) {
        setContactData((prev) => ({
          ...prev,
          ...updated,
        }));
        updateContactData(updated);
        setSaveSuccessMsg('Contact & Footer configuration saved successfully to PostgreSQL database!');
      }
    } catch (err) {
      console.error('Save Contact Settings Error:', err);
      setSaveErrorMsg(err.message || 'Failed to save configuration to database.');
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveSuccessMsg('');
      }, 5000);
    }
  };

  // Add New Admin User Handler
  const handleCreateAdminUser = async (e) => {
    e.preventDefault();
    setSubmittingNewUser(true);
    setUserError('');
    setUserSuccess('');

    try {
      const res = await apiFetch('/auth/users', {
        method: 'POST',
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
        }),
      });

      if (res && res.success) {
        setUserSuccess(`Admin account created for ${newUserEmail}`);
        setIsAddUserModalOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('ADMIN');
        fetchAdminUsers();
        setTimeout(() => setUserSuccess(''), 4000);
      }
    } catch (err) {
      setUserError(err.message || 'Failed to create admin user');
    } finally {
      setSubmittingNewUser(false);
    }
  };

  // Edit Admin User Handler
  const handleUpdateAdminUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmittingEditUser(true);
    setUserError('');
    setUserSuccess('');

    try {
      const res = await apiFetch(`/auth/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          role: editRole,
        }),
      });

      if (res && res.success) {
        setUserSuccess(`Admin details updated for ${editEmail}`);
        setEditingUser(null);
        fetchAdminUsers();
        setTimeout(() => setUserSuccess(''), 4000);
      }
    } catch (err) {
      setUserError(err.message || 'Failed to update admin user');
    } finally {
      setSubmittingEditUser(false);
    }
  };

  // Toggle Admin User Active Status
  const handleToggleAdminStatus = async (userToToggle) => {
    setUserError('');
    setUserSuccess('');
    try {
      const res = await apiFetch(`/auth/users/${userToToggle.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          isActive: !userToToggle.isActive,
        }),
      });

      if (res && res.success) {
        setUserSuccess(`Account status updated for ${userToToggle.email}`);
        fetchAdminUsers();
        setTimeout(() => setUserSuccess(''), 4000);
      }
    } catch (err) {
      setUserError(err.message || 'Failed to update user status');
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordUser) return;
    setSubmittingPassword(true);
    setUserError('');
    setUserSuccess('');

    try {
      const res = await apiFetch(`/auth/users/${passwordUser.id}/password`, {
        method: 'PUT',
        body: JSON.stringify({
          newPassword: newPasswordVal,
        }),
      });

      if (res && res.success) {
        setUserSuccess(`Password updated for ${passwordUser.email}`);
        setPasswordUser(null);
        setNewPasswordVal('');
        setTimeout(() => setUserSuccess(''), 4000);
      }
    } catch (err) {
      setUserError(err.message || 'Failed to update password');
    } finally {
      setSubmittingPassword(false);
    }
  };

  // Delete Admin User Handler
  const handleDeleteAdminUser = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    setUserError('');
    setUserSuccess('');

    try {
      const res = await apiFetch(`/auth/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      if (res && res.success) {
        setUserSuccess(`Admin account ${deletingUser.email} deleted successfully.`);
        setDeletingUser(null);
        fetchAdminUsers();
        setTimeout(() => setUserSuccess(''), 4000);
      }
    } catch (err) {
      setUserError(err.message || 'Failed to delete admin account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-lg font-extrabold uppercase text-gray-900 tracking-tight">
          Dealership Settings & Configuration
        </h2>
        <p className="text-xs text-gray-500">
          Configure dealership profile information, public contact numbers, footer text, social links, admin users, and access control.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap border-b border-gray-200 bg-white rounded-xs p-1 gap-1 border shadow-2xs">
        {[
          { id: 'profile', label: 'Dealership Profile', icon: Building2 },
          { id: 'contact', label: 'Contact & Footer Info', icon: Phone },
          { id: 'social', label: 'Social Media Links', icon: Globe },
          { id: 'hours', label: 'Business Hours', icon: Clock },
          { id: 'notifications', label: 'Notification Preferences', icon: Bell },
          { id: 'admin-users', label: 'Admin Users & Access', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xs transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#111827] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Save Toast Feedback */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center gap-2 text-xs text-emerald-800 font-bold animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {saveErrorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xs flex items-center gap-2 text-xs text-red-800 font-bold animate-fadeIn shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* Tab Panels */}
      <Card className="p-6 border border-gray-200/80 bg-white shadow-xs">
        {activeTab !== 'admin-users' ? (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Profile Section */}
            {activeTab === 'profile' && (
              <div className="space-y-4 animate-fadeIn motion-reduce:animate-none">
                <h3 className="text-sm font-bold uppercase text-gray-900 border-b border-gray-100 pb-2">
                  Dealership Facility Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Dealership Name"
                    value={contactData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                  />

                  <Input
                    label="Short Name / Alias"
                    value={contactData.shortName || ''}
                    onChange={(e) => updateField('shortName', e.target.value)}
                  />
                </div>

                <Input
                  label="Status Designation"
                  value={contactData.status || ''}
                  onChange={(e) => updateField('status', e.target.value)}
                />

                <Input
                  label="Dealership Tagline"
                  value={contactData.tagline || ''}
                  onChange={(e) => updateField('tagline', e.target.value)}
                />
              </div>
            )}

            {/* Contact & Footer Info */}
            {activeTab === 'contact' && (
              <div className="space-y-4 animate-fadeIn motion-reduce:animate-none">
                <h3 className="text-sm font-bold uppercase text-gray-900 border-b border-gray-100 pb-2">
                  Public Contact Numbers & Footer Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Landline Phone"
                    value={contactData.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />

                  <Input
                    label="Sales Direct Contact"
                    value={contactData.salesDirect || ''}
                    onChange={(e) => updateField('salesDirect', e.target.value)}
                  />

                  <Input
                    label="3S Service Direct Contact"
                    value={contactData.serviceDirect || ''}
                    onChange={(e) => updateField('serviceDirect', e.target.value)}
                  />

                  <Input
                    label="WhatsApp Hotline"
                    value={contactData.whatsapp || ''}
                    onChange={(e) => updateField('whatsapp', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="General Email"
                    value={contactData.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                  />

                  <Input
                    label="Sales Email"
                    value={contactData.salesEmail || ''}
                    onChange={(e) => updateField('salesEmail', e.target.value)}
                  />

                  <Input
                    label="Service Email"
                    value={contactData.serviceEmail || ''}
                    onChange={(e) => updateField('serviceEmail', e.target.value)}
                  />
                </div>

                <Textarea
                  label="Full Physical Address"
                  rows={2}
                  value={contactData.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                />

                <Textarea
                  label="Footer Short Description"
                  rows={2}
                  value={contactData.footerText || ''}
                  onChange={(e) => updateField('footerText', e.target.value)}
                />
              </div>
            )}

            {/* Social Links */}
            {activeTab === 'social' && (
              <div className="space-y-4 animate-fadeIn motion-reduce:animate-none">
                <h3 className="text-sm font-bold uppercase text-gray-900 border-b border-gray-100 pb-2">
                  Official Social Media Channels
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Facebook Page URL"
                    placeholder="https://facebook.com/khybermotors"
                    value={contactData.social?.facebook || ''}
                    onChange={(e) => updateSocialField('facebook', e.target.value)}
                  />

                  <Input
                    label="Instagram Page URL"
                    placeholder="https://instagram.com/khybermotors"
                    value={contactData.social?.instagram || ''}
                    onChange={(e) => updateSocialField('instagram', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="WhatsApp Direct Chat URL"
                    placeholder="https://wa.me/923000000000"
                    value={contactData.social?.whatsapp || ''}
                    onChange={(e) => updateSocialField('whatsapp', e.target.value)}
                  />

                  <Input
                    label="LinkedIn Profile URL"
                    placeholder="https://linkedin.com/company/khybermotors"
                    value={contactData.social?.linkedin || ''}
                    onChange={(e) => updateSocialField('linkedin', e.target.value)}
                  />
                </div>

                <Input
                  label="YouTube Channel URL"
                  placeholder="https://youtube.com/khybermotors"
                  value={contactData.social?.youtube || ''}
                  onChange={(e) => updateSocialField('youtube', e.target.value)}
                />
              </div>
            )}

            {/* Business Hours */}
            {activeTab === 'hours' && (
              <div className="space-y-4 animate-fadeIn motion-reduce:animate-none">
                <h3 className="text-sm font-bold uppercase text-gray-900 border-b border-gray-100 pb-2">
                  Showroom & Workshop Operating Hours
                </h3>

                {(contactData.businessHours || []).map((h, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-100 pb-3">
                    <Input
                      label={`Operating Days #${i + 1}`}
                      value={h.days || ''}
                      onChange={(e) => {
                        const updated = [...(contactData.businessHours || [])];
                        updated[i] = { ...updated[i], days: e.target.value };
                        updateField('businessHours', updated);
                      }}
                    />
                    <Input
                      label={`Operating Hours #${i + 1}`}
                      value={h.hours || ''}
                      onChange={(e) => {
                        const updated = [...(contactData.businessHours || [])];
                        updated[i] = { ...updated[i], hours: e.target.value };
                        updateField('businessHours', updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Notifications Section */}
            {activeTab === 'notifications' && (
              <div className="space-y-4 animate-fadeIn motion-reduce:animate-none">
                <h3 className="text-sm font-bold uppercase text-gray-900 border-b border-gray-100 pb-2">
                  Admin Notification Preferences
                </h3>

                <div className="space-y-3 pt-2">
                  <Checkbox
                    id="emailAlerts"
                    label="Receive instant email alerts for new lead submissions"
                    checked={notifications.emailAlerts}
                    onChange={(e) => setNotifications((prev) => ({ ...prev, emailAlerts: e.target.checked }))}
                  />

                  <Checkbox
                    id="smsAlerts"
                    label="Receive SMS alerts for priority customer inquiries"
                    checked={notifications.smsAlerts}
                    onChange={(e) => setNotifications((prev) => ({ ...prev, smsAlerts: e.target.checked }))}
                  />

                  <Checkbox
                    id="leadAssignments"
                    label="Notify sales representatives upon lead reassignment"
                    checked={notifications.leadAssignments}
                    onChange={(e) => setNotifications((prev) => ({ ...prev, leadAssignments: e.target.checked }))}
                  />
                </div>
              </div>
            )}

            {/* Form Save Trigger */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isSaving}
                leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                className="uppercase font-bold tracking-wider"
              >
                {isSaving ? 'Saving to Database...' : 'Save Configuration Changes'}
              </Button>
            </div>
          </form>
        ) : (
          /* Admin Users & Access Control Tab */
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-sm font-bold uppercase text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C8102E]" /> Admin User Accounts &amp; Audit Logs
                </h3>
                <p className="text-xs text-gray-500">
                  Manage administrator accounts, roles, password resets, account activation, and view system login history.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  leftIcon={<History className="w-4 h-4" />}
                  onClick={() => {
                    fetchLoginHistory();
                    setIsHistoryModalOpen(true);
                  }}
                >
                  View Login Audit History
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="xs"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsAddUserModalOpen(true)}
                >
                  + Add Admin User
                </Button>
              </div>
            </div>

            {userSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xs flex items-center gap-2 animate-fadeIn shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{userSuccess}</span>
              </div>
            )}

            {userError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-xs flex items-center gap-2 animate-fadeIn shadow-xs">
                <AlertCircle className="w-4 h-4 text-[#C8102E] shrink-0" />
                <span>{userError}</span>
              </div>
            )}

            {loadingUsers ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading admin accounts...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 uppercase text-[10px] font-bold tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-3">Administrator</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Created</th>
                      <th className="py-3 px-3">Last Login</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {adminUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase">
                              {u.name?.charAt(0) || 'A'}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {u.isPrimary && (
                                  <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs uppercase">
                                    Primary
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-500 font-mono">{u.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {u.isActive ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">
                              <UserCheck className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">
                              <UserX className="w-3 h-3" /> Deactivated
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-gray-500">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                        </td>

                        <td className="py-3 px-3 text-right space-x-1">
                          {/* Edit User Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser(u);
                              setEditName(u.name);
                              setEditEmail(u.email);
                              setEditRole(u.role);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 rounded-xs hover:bg-gray-100 transition-colors"
                            title="Edit Account"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Password Reset Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setPasswordUser(u);
                              setNewPasswordVal('');
                            }}
                            className="p-1 text-gray-500 hover:text-amber-600 rounded-xs hover:bg-gray-100 transition-colors"
                            title="Change Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Toggle Active/Deactivate Button */}
                          <button
                            type="button"
                            disabled={u.isPrimary || u.id === currentUser?.id}
                            onClick={() => handleToggleAdminStatus(u)}
                            className={`p-1 rounded-xs transition-colors ${
                              u.isPrimary || u.id === currentUser?.id
                                ? 'text-gray-300 cursor-not-allowed'
                                : u.isActive
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.isActive ? 'Deactivate Account' : 'Activate Account'}
                          >
                            {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>

                          {/* Delete Account Button */}
                          <button
                            type="button"
                            disabled={u.isPrimary || u.id === currentUser?.id}
                            onClick={() => setDeletingUser(u)}
                            className={`p-1 rounded-xs transition-colors ${
                              u.isPrimary || u.id === currentUser?.id
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                            }`}
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Add Admin User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Create New Admin Account"
      >
        <form onSubmit={handleCreateAdminUser} className="space-y-4 pt-2">
          <Input
            label="Full Name"
            placeholder="e.g. Sales Manager"
            required
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
          />

          <Input
            label="Admin Email"
            type="email"
            placeholder="e.g. manager@khybermotors.com.pk"
            required
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            required
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
          />

          <Select
            label="Administrator Role"
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value)}
            options={[
              { value: 'ADMIN', label: 'Admin (Standard Administrator)' },
              { value: 'SUPER_ADMIN', label: 'Super Admin (Full Rights)' },
            ]}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="xs" onClick={() => setIsAddUserModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="xs" disabled={submittingNewUser}>
              {submittingNewUser ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Admin User Modal */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title={`Edit Admin: ${editingUser?.email}`}
      >
        <form onSubmit={handleUpdateAdminUser} className="space-y-4 pt-2">
          <Input
            label="Full Name"
            required
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />

          <Input
            label="Admin Email"
            type="email"
            required
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
          />

          <Select
            label="Administrator Role"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            options={[
              { value: 'ADMIN', label: 'Admin (Standard Administrator)' },
              { value: 'SUPER_ADMIN', label: 'Super Admin (Full Rights)' },
            ]}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="xs" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="xs" disabled={submittingEditUser}>
              {submittingEditUser ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={Boolean(passwordUser)}
        onClose={() => setPasswordUser(null)}
        title={`Change Password for ${passwordUser?.email}`}
      >
        <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
          <Input
            label="New Password"
            type="password"
            placeholder="Enter at least 6 characters"
            required
            value={newPasswordVal}
            onChange={(e) => setNewPasswordVal(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="xs" onClick={() => setPasswordUser(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="xs" disabled={submittingPassword}>
              {submittingPassword ? 'Updating Password...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Login History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="System Login Audit History"
      >
        <div className="space-y-4 pt-2 text-xs">
          {loadingHistory ? (
            <div className="py-8 text-center text-gray-400">Loading audit history...</div>
          ) : loginHistory.length === 0 ? (
            <div className="py-8 text-center text-gray-400">No login history records found.</div>
          ) : (
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-xs">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase text-[9px] font-bold tracking-wider sticky top-0 border-b border-gray-200">
                  <tr>
                    <th className="py-2 px-3">Date / Time</th>
                    <th className="py-2 px-3">Email</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">User Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                  {loginHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-900 font-semibold">
                        {new Date(h.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-gray-800">{h.email}</td>
                      <td className="py-2 px-3 font-sans">
                        {h.status === 'SUCCESS' ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs uppercase">
                            SUCCESS
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs uppercase">
                            FAILED
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-gray-500 truncate max-w-xs">{h.userAgent || 'Unknown'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button variant="outline" size="xs" onClick={() => setIsHistoryModalOpen(false)}>
              Close Audit Log
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Admin Account Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteAdminUser}
        title="Delete Admin Account"
        message={`Are you sure you want to permanently delete the admin account for "${deletingUser?.email}"? They will no longer have access to the Admin CMS.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Account'}
        confirmVariant="danger"
      />
    </div>
  );
};

export default AdminSettings;
