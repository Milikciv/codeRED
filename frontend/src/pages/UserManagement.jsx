import { useState, useEffect, useCallback } from 'react'
import PageLayout from '../components/layout/PageLayout'
import Toast from '../components/common/Toast'
import ConfirmModal from '../components/common/ConfirmModal'
import LoadingScreen from '../components/common/LoadingScreen'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import {
  Search, Plus, Pencil, Trash2, X, Eye, EyeOff,
  User, Mail, Phone, Building2, Shield
} from 'lucide-react'

const ROLE_LABELS = {
  HSA: 'HSA',
  HOSPITAL_ADMIN: 'Hospital Admin',
  HOSPITAL_STAFF: 'Hospital Staff',
}

const ROLE_COLORS = {
  HSA: 'bg-red-100 text-red-700',
  HOSPITAL_ADMIN: 'bg-purple-100 text-purple-700',
  HOSPITAL_STAFF: 'bg-blue-100 text-blue-700',
}

const EMPTY_FORM = {
  name: '', email: '', password: '', role: 'HOSPITAL_STAFF',
  designation: '', contactNumber: '', hospitalId: '',
}

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-700'}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}

function UserFormModal({ isOpen, onClose, onSaved, onError, editUser, hospitals, callerRole }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editUser) {
      setForm({
        name: editUser.name ?? '',
        email: editUser.email ?? '',
        password: '',
        role: editUser.role ?? 'HOSPITAL_STAFF',
        designation: editUser.designation ?? '',
        contactNumber: editUser.contactNumber ?? '',
        hospitalId: editUser.hospitalId ?? '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError('')
    setShowPassword(false)
  }, [editUser, isOpen])

  if (!isOpen) return null

  const isHsaCaller = callerRole === 'HSA'

  const availableRoles = isHsaCaller
    ? ['HSA', 'HOSPITAL_ADMIN', 'HOSPITAL_STAFF']
    : ['HOSPITAL_ADMIN', 'HOSPITAL_STAFF']

  const needsHospital = form.role === 'HOSPITAL_STAFF' || form.role === 'HOSPITAL_ADMIN'

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Name is required')
    if (!form.email.trim()) return setError('Email is required')
    if (!editUser && !form.password.trim()) return setError('Password is required for new users')
    if (needsHospital && !form.hospitalId) return setError('Hospital is required for this role')

    try {
      setSaving(true)
      const payload = {
        ...form,
        hospitalId: needsHospital ? Number(form.hospitalId) : null,
        password: form.password || undefined,
      }
      if (editUser) {
        await api.put(`/users/${editUser.id}`, payload)
      } else {
        await api.post('/users', payload)
      }
      onSaved()
    } catch (err) {
      const msg = err.response?.data?.message ?? err.response?.data ?? 'Something went wrong'
      setError(msg)
      onError?.(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">
            {editUser ? 'Edit User' : 'Add New User'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Dr. Sarah Lim"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="user@hospital.sg"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {editUser ? 'New Password (leave blank to keep current)' : 'Password'}
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder={editUser ? '(unchanged)' : 'Min. 8 characters'}
                className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => set('role', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {availableRoles.map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>

          {/* Hospital */}
          {needsHospital && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hospital</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={form.hospitalId}
                  onChange={e => set('hospitalId', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select hospital</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Designation */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
            <input
              type="text"
              value={form.designation}
              onChange={e => set('designation', e.target.value)}
              placeholder="e.g. Head, Emergency Dept"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Contact Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.contactNumber}
                onChange={e => set('contactNumber', e.target.value)}
                placeholder="+65 9123 4567"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : editUser ? 'Save Changes' : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UserManagement() {
  const { user: caller } = useAuth()
  const [users, setUsers] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')

  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchUsers = useCallback(async () => {
    const { data } = await api.get('/users')
    setUsers(data)
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [usersRes, hospitalsRes] = await Promise.all([
          api.get('/users'),
          api.get('/users/hospitals'),
        ])
        setUsers(usersRes.data)
        setHospitals(hospitalsRes.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingScreen />

  const isHsa = caller?.role === 'HSA'

  const filtered = users.filter(u => {
    const matchesRole = roleFilter === 'All' || u.role === roleFilter
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.designation?.toLowerCase().includes(q) ||
      u.hospitalName?.toLowerCase().includes(q)
    return matchesRole && matchesSearch
  })

  const roleFilters = isHsa
    ? ['All', 'HSA', 'HOSPITAL_ADMIN', 'HOSPITAL_STAFF']
    : ['All', 'HOSPITAL_ADMIN', 'HOSPITAL_STAFF']

  const stats = {
    total: users.length,
    hsa: users.filter(u => u.role === 'HSA').length,
    admins: users.filter(u => u.role === 'HOSPITAL_ADMIN').length,
    staff: users.filter(u => u.role === 'HOSPITAL_STAFF').length,
  }

  const handleSaved = async () => {
    const wasEdit = !!editUser
    setModalOpen(false)
    setEditUser(null)
    await fetchUsers()
    setToast({ type: 'success', title: wasEdit ? 'User updated successfully' : 'User created successfully' })
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteTarget.id}`)
      setDeleteTarget(null)
      await fetchUsers()
      setToast({ type: 'success', title: 'User deleted successfully' })
    } catch (err) {
      setDeleteTarget(null)
      setToast({ type: 'error', title: 'Failed to delete user', message: err.response?.data?.message })
    }
  }

  return (
    <PageLayout title="User Management">
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <UserFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditUser(null) }}
        onSaved={handleSaved}
        onError={msg => setToast({ type: 'error', title: editUser ? 'Failed to update user' : 'Failed to create user', message: msg })}
        editUser={editUser}
        hospitals={hospitals.filter(h => h.code !== 'HSA')}
        callerRole={caller?.role}
      />

      {deleteTarget && (
        <ConfirmModal
          title={`Delete ${deleteTarget.name}?`}
          message="This action cannot be undone. The user will lose all access."
          confirmLabel="Delete"
          confirmClass="bg-red-600 hover:bg-red-700 text-white"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      <div className="p-6 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Users', value: stats.total, color: 'text-gray-800' },
            ...(isHsa ? [{ label: 'HSA', value: stats.hsa, color: 'text-red-600' }] : []),
            { label: 'Hospital Admins', value: stats.admins, color: 'text-purple-600' },
            { label: 'Hospital Staff', value: stats.staff, color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {roleFilters.map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  roleFilter === r
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {r === 'All' ? 'All' : ROLE_LABELS[r]}
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button
              onClick={() => { setEditUser(null); setModalOpen(true) }}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Role</th>
                    {isHsa && (
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Hospital</th>
                    )}
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Designation</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Contact</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-primary">
                              {u.name?.[0]?.toUpperCase() ?? '?'}
                            </span>
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={u.role} />
                      </td>
                      {isHsa && (
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {u.hospitalName ?? '—'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-gray-500 text-xs">{u.designation ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{u.contactNumber ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditUser(u); setModalOpen(true) }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-right">
          Showing {filtered.length} of {users.length} users
        </p>
      </div>
    </PageLayout>
  )
}
