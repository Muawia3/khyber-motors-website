import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Building2,
  MessageSquare,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  User,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { departmentService } from '../../../services/departmentService';
import { contentService } from '../../../services/contentService';
import { useContact } from '../../../context/useContact';
import { DEFAULT_CONTACT_CONTENT } from '../../../data/dealership';

export const ContactCMS = () => {
  const { refetchContactData } = useContact();

  // Department Contacts State
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  // Footer / Dealership General Contact State
  const [generalContact, setGeneralContact] = useState(DEFAULT_CONTACT_CONTENT);
  const [loadingGeneral, setLoadingGeneral] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);

  // Success / Error notification messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Add / Edit Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState(null);
  const [deptName, setDeptName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [deptPhone, setDeptPhone] = useState('');
  const [deptWhatsapp, setDeptWhatsapp] = useState('');
  const [deptEmail, setDeptEmail] = useState('');
  const [deptOrder, setDeptOrder] = useState(0);
  const [deptIsActive, setDeptIsActive] = useState(true);
  const [deptFormError, setDeptFormError] = useState('');
  const [savingDept, setSavingDept] = useState(false);

  // Delete Department Modal State
  const [deleteDeptId, setDeleteDeptId] = useState(null);
  const [isDeletingDept, setIsDeletingDept] = useState(false);

  const fetchAllData = async () => {
    setLoadingDepts(true);
    setLoadingGeneral(true);
    setErrorMsg('');

    try {
      const [depts, general] = await Promise.all([
        departmentService.getDepartments(false),
        contentService.getContactContent(),
      ]);
      setDepartments(depts || []);
      if (general) {
        setGeneralContact({ ...DEFAULT_CONTACT_CONTENT, ...general });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load contact data.');
    } finally {
      setLoadingDepts(false);
      setLoadingGeneral(false);
    }
  };

  useEffect(() => {
    document.title = 'Contact & Department Management | Admin CMS';
    fetchAllData();
  }, []);

  // Department Modal Handlers
  const openAddDeptModal = () => {
    setEditingDeptId(null);
    setDeptName('');
    setContactPerson('');
    setDeptPhone('');
    setDeptWhatsapp('');
    setDeptEmail('');
    setDeptOrder(departments.length);
    setDeptIsActive(true);
    setDeptFormError('');
    setIsDeptModalOpen(true);
  };

  const openEditDeptModal = (item) => {
    setEditingDeptId(item.id);
    setDeptName(item.name || '');
    setContactPerson(item.contactPerson || '');
    setDeptPhone(item.phone || '');
    setDeptWhatsapp(item.whatsapp || '');
    setDeptEmail(item.email || '');
    setDeptOrder(typeof item.displayOrder === 'number' ? item.displayOrder : 0);
    setDeptIsActive(item.isActive !== false);
    setDeptFormError('');
    setIsDeptModalOpen(true);
  };

  const handleSaveDeptForm = async (e) => {
    e.preventDefault();
    setDeptFormError('');

    if (!deptName.trim()) {
      setDeptFormError('Department name is required.');
      return;
    }

    if (!deptPhone.trim()) {
      setDeptFormError('Phone number is required.');
      return;
    }

    setSavingDept(true);
    try {
      const payload = {
        name: deptName.trim(),
        contactPerson: contactPerson ? contactPerson.trim() : null,
        phone: deptPhone.trim(),
        whatsapp: deptWhatsapp ? deptWhatsapp.trim() : null,
        email: deptEmail ? deptEmail.trim() : null,
        displayOrder: Number(deptOrder),
        isActive: deptIsActive,
      };

      if (editingDeptId) {
        await departmentService.updateDepartment(editingDeptId, payload);
        setSuccessMsg('Department contact updated successfully.');
      } else {
        await departmentService.createDepartment(payload);
        setSuccessMsg('New department contact added successfully.');
      }
      setIsDeptModalOpen(false);
      fetchAllData();
      refetchContactData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setDeptFormError(err.message || 'Failed to save department contact.');
    } finally {
      setSavingDept(false);
    }
  };

  const handleToggleDeptActive = async (item) => {
    try {
      const updated = await departmentService.updateDepartment(item.id, {
        isActive: !item.isActive,
      });
      setDepartments((prev) => prev.map((d) => (d.id === item.id ? updated : d)));
      refetchContactData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to toggle department status.');
    }
  };

  const handleMoveDept = async (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= departments.length) return;

    const newArr = [...departments];
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;

    setDepartments(newArr);

    try {
      await departmentService.updateDepartment(newArr[index].id, { displayOrder: index });
      await departmentService.updateDepartment(newArr[targetIdx].id, { displayOrder: targetIdx });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to persist reordering.');
      fetchAllData();
    }
  };

  const handleDeleteDeptConfirm = async () => {
    if (!deleteDeptId) return;
    setIsDeletingDept(true);
    try {
      await departmentService.deleteDepartment(deleteDeptId);
      setSuccessMsg('Department contact deleted successfully.');
      setDeleteDeptId(null);
      fetchAllData();
      refetchContactData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete department contact.');
    } finally {
      setIsDeletingDept(false);
    }
  };

  // Save Footer & General Contact Form Handler
  const handleSaveGeneralContact = async (e) => {
    e.preventDefault();
    setSavingGeneral(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await contentService.saveContactContent(generalContact);
      await refetchContactData();
      setSuccessMsg('Footer & Dealership contact information updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save contact information.');
    } finally {
      setSavingGeneral(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xs border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link to="/admin" className="hover:text-[#C8102E]">
              Admin
            </Link>
            <span>/</span>
            <span>Content</span>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Contact Management</span>
          </div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#C8102E]" /> Contact & Department Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Dynamically manage department contacts and footer dealership details.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-center gap-2 animate-fadeIn shadow-xs">
          <AlertCircle className="w-4 h-4 text-[#C8102E] shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: DEPARTMENT CONTACTS */}
      <Card className="p-6 bg-white border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#C8102E]" /> Department Contacts
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Add, edit, or disable department contacts displayed on the public Contact Us page.
            </p>
          </div>

          <Button
            onClick={openAddDeptModal}
            className="bg-[#C8102E] hover:bg-red-700 text-white flex items-center gap-2 text-xs uppercase font-bold tracking-wider"
          >
            <Plus className="w-4 h-4" /> Add Department
          </Button>
        </div>

        {loadingDepts ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
            <span className="text-xs font-medium">Loading department contacts...</span>
          </div>
        ) : departments.length === 0 ? (
          <div className="py-10 text-center text-gray-500 space-y-2">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold text-gray-700">No departments added yet.</p>
            <p className="text-xs text-gray-400">Click "Add Department" above to configure your first contact desk.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {departments.map((dept, index) => (
              <div
                key={dept.id}
                className={`py-4 px-3 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xs transition-colors ${
                  dept.isActive ? 'hover:bg-gray-50/80' : 'bg-gray-50/50 opacity-70'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-gray-900">{dept.name}</span>

                    {dept.contactPerson && (
                      <span className="text-xs font-medium text-gray-600 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-xs border border-gray-200">
                        <User className="w-3 h-3 text-gray-500" /> {dept.contactPerson}
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-widest ${
                        dept.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {dept.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-600 pt-1">
                    <span className="flex items-center gap-1 text-[#C8102E] font-bold">
                      <Phone className="w-3.5 h-3.5" /> {dept.phone}
                    </span>

                    {dept.whatsapp && (
                      <span className="flex items-center gap-1 text-emerald-700">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WA: {dept.whatsapp}
                      </span>
                    )}

                    {dept.email && (
                      <span className="flex items-center gap-1 text-gray-500">
                        <Mail className="w-3.5 h-3.5" /> {dept.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {/* Ordering */}
                  <div className="flex items-center bg-gray-100 rounded-xs border border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleMoveDept(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-gray-400 px-1.5 border-x border-gray-200">
                      {dept.displayOrder + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleMoveDept(index, 'down')}
                      disabled={index === departments.length - 1}
                      className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Active Toggle */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleDeptActive(dept)}
                    className="text-xs px-2.5 py-1 flex items-center gap-1"
                  >
                    {dept.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {dept.isActive ? 'Disable' : 'Enable'}
                  </Button>

                  {/* Edit */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDeptModal(dept)}
                    className="text-xs px-2.5 py-1 flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </Button>

                  {/* Delete */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteDeptId(dept.id)}
                    className="text-xs px-2.5 py-1 text-red-600 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* SECTION 2: FOOTER & GENERAL DEALERSHIP CONTACT INFO */}
      <Card className="p-6 bg-white border border-gray-200/80 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#C8102E]" /> Footer & Dealership Contact Information
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage company name, address, main phone, WhatsApp, and email displayed in the public footer.
          </p>
        </div>

        {loadingGeneral ? (
          <div className="py-8 flex items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#C8102E] mr-2" />
            <span className="text-xs font-medium">Loading dealership details...</span>
          </div>
        ) : (
          <form onSubmit={handleSaveGeneralContact} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company / Dealership Name"
                required
                value={generalContact.name || ''}
                onChange={(e) => setGeneralContact({ ...generalContact, name: e.target.value })}
              />

              <Input
                label="Short Name"
                placeholder="e.g. Khyber Motors"
                value={generalContact.shortName || ''}
                onChange={(e) => setGeneralContact({ ...generalContact, shortName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Main Phone Number"
                required
                placeholder="+92 (091) 5840900"
                value={generalContact.phone || ''}
                onChange={(e) => setGeneralContact({ ...generalContact, phone: e.target.value })}
              />

              <Input
                label="Secondary / Direct Sales Phone"
                placeholder="+92 300 1234567"
                value={generalContact.salesDirect || ''}
                onChange={(e) => setGeneralContact({ ...generalContact, salesDirect: e.target.value })}
              />

              <Input
                label="WhatsApp Number"
                placeholder="+92 300 0000000"
                value={generalContact.whatsapp || ''}
                onChange={(e) => setGeneralContact({ ...generalContact, whatsapp: e.target.value })}
              />
            </div>

            <Input
              label="General Contact Email"
              type="email"
              required
              placeholder="info@khybermotors.com.pk"
              value={generalContact.email || ''}
              onChange={(e) => setGeneralContact({ ...generalContact, email: e.target.value })}
            />

            <Textarea
              label="Full Dealership Address"
              rows={2}
              required
              value={generalContact.address || ''}
              onChange={(e) => setGeneralContact({ ...generalContact, address: e.target.value })}
            />

            <Textarea
              label="Footer Tagline / Short Description"
              rows={2}
              value={generalContact.footerText || ''}
              onChange={(e) => setGeneralContact({ ...generalContact, footerText: e.target.value })}
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={savingGeneral}
                className="bg-[#C8102E] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                {savingGeneral ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Footer & Contact Info
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Add / Edit Department Modal */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title={editingDeptId ? 'Edit Department Contact' : 'Add Department Contact'}
      >
        <form onSubmit={handleSaveDeptForm} className="space-y-4 pt-2">
          {deptFormError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{deptFormError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department Name"
              placeholder="e.g. Sales, Service, Parts"
              required
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
            />

            <Input
              label="Contact Person Name"
              placeholder="e.g. Ahmad, Ali, Hamza"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="e.g. 0300 1234567"
              required
              value={deptPhone}
              onChange={(e) => setDeptPhone(e.target.value)}
            />

            <Input
              label="WhatsApp Number (Optional)"
              placeholder="e.g. 0300 1234567"
              value={deptWhatsapp}
              onChange={(e) => setDeptWhatsapp(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address (Optional)"
              type="email"
              placeholder="e.g. sales@khybermotors.com.pk"
              value={deptEmail}
              onChange={(e) => setDeptEmail(e.target.value)}
            />

            <Input
              label="Display Order"
              type="number"
              min="0"
              value={deptOrder}
              onChange={(e) => setDeptOrder(e.target.value)}
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
              <input
                type="checkbox"
                checked={deptIsActive}
                onChange={(e) => setDeptIsActive(e.target.checked)}
                className="w-4 h-4 text-[#C8102E] rounded border-gray-300 focus:ring-[#C8102E]"
              />
              <span>Enable this department on public Contact Us page</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeptModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={savingDept}
              className="bg-[#C8102E] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              {savingDept ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingDeptId ? 'Save Changes' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Department Modal */}
      <Modal
        isOpen={!!deleteDeptId}
        onClose={() => setDeleteDeptId(null)}
        title="Confirm Delete Department Contact"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-gray-600 leading-relaxed">
            Are you sure you want to delete this department contact? It will be removed from the public website.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setDeleteDeptId(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteDeptConfirm}
              disabled={isDeletingDept}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              {isDeletingDept ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContactCMS;
