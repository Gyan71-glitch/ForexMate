"use client";

import { useEffect, useState } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { 
  UserCheck, 
  UserPlus, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Edit3, 
  Key, 
  Power, 
  Loader2, 
  Building2, 
  Phone, 
  Mail, 
  Shield, 
  Calendar, 
  Clock, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  PackageCheck,
  ShoppingBag,
  Trash2
} from 'lucide-react';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<any>({ page: 1, limit: 10, totalPages: 1, total: 0 });

  // Filter state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  // Selected employee for actions
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'BRANCH_CASHIER',
    branchId: '',
    temporaryPassword: '',
    status: 'ACTIVE'
  });

  const [tempPasswordResult, setTempPasswordResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch branches for filter and dropdowns
  useEffect(() => {
    authFetch(`${API_URL}/admin/branches`)
      .then(apiJson)
      .then((data: any) => {
        if (Array.isArray(data)) {
          setBranches(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, branchId: data[0].id }));
          }
        }
      })
      .catch(console.error);
  }, []);

  // Fetch employees list
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        ...(search ? { search } : {}),
        ...(roleFilter ? { role: roleFilter } : {}),
        ...(branchFilter ? { branchId: branchFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {})
      });

      const res = await authFetch(`${API_URL}/admin/employees?${params.toString()}`);
      if (res.ok) {
        const data = await apiJson(res);
        setEmployees(data.items || []);
        setMeta(data.meta || { page: 1, limit: 10, totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, roleFilter, branchFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };

  // Handle Create Employee
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_URL}/admin/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await apiJson(res);
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create employee');
      }
      setShowCreateModal(false);
      setTempPasswordResult(data.temporaryPassword);
      setFormData({
        name: '',
        phone: '',
        email: '',
        role: 'BRANCH_CASHIER',
        branchId: branches[0]?.id || '',
        temporaryPassword: '',
        status: 'ACTIVE'
      });
      fetchEmployees();
    } catch (err: any) {
      alert(err.message || 'Error creating employee');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Edit Employee
  const handleOpenEdit = (emp: any) => {
    setSelectedEmployee(emp);
    setFormData({
      name: emp.name,
      phone: emp.phone,
      email: emp.email || '',
      role: emp.role,
      branchId: emp.branchId,
      temporaryPassword: '',
      status: emp.status
    });
    setShowEditModal(true);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_URL}/admin/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          role: formData.role,
          branchId: formData.branchId,
          status: formData.status
        })
      });
      const data = await apiJson(res);
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update employee');
      }
      setShowEditModal(false);
      fetchEmployees();
    } catch (err: any) {
      alert(err.message || 'Error updating employee');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Toggle Active / Inactive Status
  const handleToggleStatus = async (emp: any) => {
    const nextStatus = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!confirm(`Are you sure you want to change status of ${emp.name} to ${nextStatus}?`)) {
      return;
    }
    try {
      const res = await authFetch(`${API_URL}/admin/employees/${emp.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      fetchEmployees();
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  // Handle Delete Employee
  const handleDeleteEmployee = async (emp: any) => {
    if (!confirm(`Are you sure you want to delete ${emp.name}? This action cannot be undone. If they have historical orders, you will not be able to delete them - deactivate them instead.`)) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_URL}/admin/employees/${emp.id}`, {
        method: 'DELETE'
      });
      const data = await apiJson(res);
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete employee');
      }
      fetchEmployees();
    } catch (err: any) {
      alert(err.message || 'Error deleting employee');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setActionLoading(true);
    try {
      const res = await authFetch(`${API_URL}/admin/employees/${selectedEmployee.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temporaryPassword: formData.temporaryPassword })
      });
      const data = await apiJson(res);
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      setTempPasswordResult(data.temporaryPassword);
      setFormData(prev => ({ ...prev, temporaryPassword: '' }));
    } catch (err: any) {
      alert(err.message || 'Error resetting password');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'BRANCH_CASHIER':
        return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-extrabold text-[10px]">Branch Cashier</Badge>;
      case 'DELIVERY_PARTNER':
        return <Badge className="bg-purple-50 text-purple-700 border border-purple-200 font-extrabold text-[10px]">Delivery Partner</Badge>;
      default:
        return <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-extrabold text-[10px]">{role}</Badge>;
    }
  };

  return (
    <div className="p-8 w-full min-h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-indigo-600" />
            Employee Management
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Single source of truth for branch cashiers, delivery partners, and mobile app operational staff.
          </p>
        </div>

        <Button
          onClick={() => {
            setFormData({
              name: '',
              phone: '',
              email: '',
              role: 'BRANCH_CASHIER',
              branchId: branches[0]?.id || '',
              temporaryPassword: '',
              status: 'ACTIVE'
            });
            setShowCreateModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-10 px-4 shadow-md rounded-xl flex items-center gap-2"
        >
          <UserPlus size={16} /> Add Employee
        </Button>
      </div>

      {/* Temporary Password Result Alert */}
      {tempPasswordResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div>
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider block">
              🔑 Temporary Password Issued
            </span>
            <p className="text-xs font-semibold text-emerald-700 mt-0.5">
              Copy and share this password with the employee. Employee will be forced to update password upon first login.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono font-black text-sm bg-white px-3 py-1 rounded-lg border border-emerald-300 text-emerald-900">
                {tempPasswordResult}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(tempPasswordResult)}
                className="h-8 text-xs font-extrabold bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setTempPasswordResult(null)}
            className="text-xs font-bold text-gray-400 hover:text-gray-600"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Filter Bar */}
      <Card className="rounded-2xl border-gray-200 shadow-sm bg-white p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <Input
              type="text"
              placeholder="Search name, phone, email, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs font-semibold h-10 rounded-xl bg-slate-50 border-gray-200 focus:bg-white"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="w-full text-xs font-bold h-10 px-3 rounded-xl bg-slate-50 border border-gray-200 text-gray-700 outline-none focus:bg-white"
            >
              <option value="">All Roles</option>
              <option value="CENTRAL_STAFF">Central Staff</option>
              <option value="BRANCH_MANAGER">Branch Manager</option>
              <option value="DELIVERY_PARTNER">Delivery Partner</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={branchFilter}
              onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
              className="w-full text-xs font-bold h-10 px-3 rounded-xl bg-slate-50 border border-gray-200 text-gray-700 outline-none focus:bg-white"
            >
              <option value="">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.branchName}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full text-xs font-bold h-10 px-3 rounded-xl bg-slate-50 border border-gray-200 text-gray-700 outline-none focus:bg-white"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </form>
      </Card>

      {/* Main Table */}
      <Card className="rounded-2xl border-gray-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-gray-50/70 border-b border-gray-100 px-6 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2">
            Employees Roster ({meta.total})
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchEmployees}
            disabled={loading}
            className="text-xs font-extrabold h-8 bg-white border-gray-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-extrabold uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-3">Employee ID</th>
                  <th className="px-6 py-3">Employee Name</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Branch</th>
                  <th className="px-6 py-3">Phone Number</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
                {loading && employees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                      Loading employees database...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      No employees found matching the filters.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-black text-indigo-600">
                        {emp.employeeCode}
                      </td>
                      <td className="px-6 py-4 font-black text-gray-900">
                        <div>
                          <p>{emp.name}</p>
                          {emp.email && <p className="text-[10px] text-gray-400 font-medium">{emp.email}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(emp.role)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {emp.branch?.branchName || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono">
                        {emp.phone}
                      </td>
                      <td className="px-6 py-4">
                        {emp.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-500 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            INACTIVE
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {format(new Date(emp.createdAt), 'PP')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            title="View Details"
                            onClick={() => { setSelectedEmployee(emp); setShowViewModal(true); }}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Eye size={15} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Edit Employee"
                            onClick={() => handleOpenEdit(emp)}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit3 size={15} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Reset Password"
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setFormData(prev => ({ ...prev, temporaryPassword: '' }));
                              setShowResetPasswordModal(true);
                            }}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                          >
                            <Key size={15} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title={emp.status === 'ACTIVE' ? 'Deactivate Employee' : 'Activate Employee'}
                            onClick={() => handleToggleStatus(emp)}
                            className={`h-8 w-8 p-0 rounded-lg ${
                              emp.status === 'ACTIVE' 
                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <Power size={15} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Delete Employee"
                            onClick={() => handleDeleteEmployee(emp)}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-700 hover:bg-red-100 rounded-lg"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-xs font-semibold text-gray-500">
              Showing Page {meta.page} of {meta.totalPages} ({meta.total} Total Employees)
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1 || loading}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="h-8 text-xs font-bold bg-white border-gray-200"
              >
                <ChevronLeft size={14} /> Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= meta.totalPages || loading}
                onClick={() => setPage(prev => Math.min(meta.totalPages, prev + 1))}
                className="h-8 text-xs font-bold bg-white border-gray-200"
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CREATE EMPLOYEE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 border border-gray-100">
            <div className="flex justify-between items-center border-b pb-3 border-gray-100">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                Add New Employee
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </Button>
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center gap-2.5 text-xs text-indigo-900 font-semibold">
              <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Employee ID will be <strong>auto-generated</strong> sequentially (e.g. <code>EMP-000001</code>).
              </span>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-xs font-semibold h-10 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="text-xs font-semibold h-10 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                    Email Address (Optional)
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g. rahul@forexmate.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="text-xs font-semibold h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                    Operational Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full text-xs font-bold h-10 px-3 rounded-xl bg-slate-50 border border-gray-200 text-gray-800 outline-none"
                  >
                    <option value="CENTRAL_STAFF">Central Staff</option>
                    <option value="BRANCH_MANAGER">Branch Manager</option>
                    <option value="DELIVERY_PARTNER">Delivery Partner</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                    Assign Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.branchId}
                    onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                    className="w-full text-xs font-bold h-10 px-3 rounded-xl bg-slate-50 border border-gray-200 text-gray-800 outline-none"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.branchName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                  Temporary Password (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="Leave blank for auto-generated password"
                  value={formData.temporaryPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, temporaryPassword: e.target.value }))}
                  className="text-xs font-semibold h-10 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs font-bold rounded-xl h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-9 px-5 rounded-xl shadow-md"
                >
                  {actionLoading ? 'Creating...' : 'Create Employee'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 border border-gray-100">
            <div className="flex justify-between items-center border-b pb-3 border-gray-100">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                Edit Employee ({selectedEmployee.employeeCode})
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                  Employee Code (Immutable)
                </label>
                <Input
                  disabled
                  value={selectedEmployee.employeeCode}
                  className="text-xs font-mono font-black bg-slate-100 text-gray-500 h-10 rounded-xl cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-xs font-semibold h-10 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="text-xs font-semibold h-10 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="text-xs font-semibold h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full text-xs font-bold h-10 px-2 rounded-xl bg-slate-50 border border-gray-200 text-gray-800 outline-none"
                  >
                    <option value="CENTRAL_STAFF">Central Staff</option>
                    <option value="BRANCH_MANAGER">Branch Manager</option>
                    <option value="DELIVERY_PARTNER">Delivery Partner</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                    Branch
                  </label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                    className="w-full text-xs font-bold h-10 px-2 rounded-xl bg-slate-50 border border-gray-200 text-gray-800 outline-none"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.branchName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full text-xs font-bold h-10 px-2 rounded-xl bg-slate-50 border border-gray-200 text-gray-800 outline-none"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="text-xs font-bold rounded-xl h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-9 px-5 rounded-xl shadow-md"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW EMPLOYEE DETAILS MODAL */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95 border border-gray-100">
            <div className="flex justify-between items-center border-b pb-3 border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-700 text-lg">
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 leading-tight">
                    {selectedEmployee.name}
                  </h3>
                  <span className="text-xs font-mono font-bold text-indigo-600 block">
                    {selectedEmployee.employeeCode}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </Button>
            </div>

            {/* Profile Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-0.5">Assigned Role</span>
                <p className="font-extrabold">{getRoleBadge(selectedEmployee.role)}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-0.5">Account Status</span>
                <p className="font-black">
                  {selectedEmployee.status === 'ACTIVE' ? (
                    <span className="text-emerald-600">● ACTIVE</span>
                  ) : (
                    <span className="text-slate-400">○ INACTIVE</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-0.5">Assigned Branch</span>
                <p className="font-bold text-gray-800 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  {selectedEmployee.branch?.branchName || 'Unassigned'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-0.5">Phone Contact</span>
                <p className="font-bold text-gray-800 flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {selectedEmployee.phone}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-0.5">Email Address</span>
                <p className="font-bold text-gray-800 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {selectedEmployee.email || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-0.5">Created Date</span>
                <p className="font-bold text-gray-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {format(new Date(selectedEmployee.createdAt), 'PP')}
                </p>
              </div>
            </div>

            {/* Future Order Assignment Stats (Placeholders) */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                Mobile Operational Statistics (Future Integration)
              </h4>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold block">Assigned Orders</span>
                  <span className="text-base font-black text-gray-800 mt-1 block">0</span>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold block">Completed Orders</span>
                  <span className="text-base font-black text-emerald-600 mt-1 block">0</span>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold block">Delivery Stats</span>
                  <span className="text-xs font-extrabold text-indigo-600 mt-1 block">0 Deliveries</span>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold block">Pickup Stats</span>
                  <span className="text-xs font-extrabold text-amber-600 mt-1 block">0 Pickups</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t pt-4 border-gray-100">
              <Button
                variant="outline"
                onClick={() => setShowViewModal(false)}
                className="text-xs font-bold rounded-xl h-9"
              >
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetPasswordModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 border border-gray-100">
            <div className="flex justify-between items-center border-b pb-3 border-gray-100">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                Reset Password ({selectedEmployee.employeeCode})
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowResetPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </Button>
            </div>

            <p className="text-xs font-semibold text-gray-600">
              Issue a new temporary password for <strong>{selectedEmployee.name}</strong>. The employee will be prompted to change password upon mobile login.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                  New Temporary Password
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter or generate password"
                    value={formData.temporaryPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, temporaryPassword: e.target.value }))}
                    className="text-xs font-mono font-bold h-10 rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const gen = `Pass@${Math.floor(1000 + Math.random() * 9000)}`;
                      setFormData(prev => ({ ...prev, temporaryPassword: gen }));
                    }}
                    className="text-xs font-extrabold shrink-0 h-10 rounded-xl bg-slate-50"
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="text-xs font-bold rounded-xl h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs h-9 px-5 rounded-xl shadow-md"
                >
                  {actionLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
