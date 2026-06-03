import { useCallback, useEffect, useMemo, useState } from 'react'
import PageLayout from '../components/layout/PageLayout'
import Toast from '../components/common/Toast'
import ConfirmModal from '../components/common/ConfirmModal'
import LoadingScreen from '../components/common/LoadingScreen'
import api from '../api/axios'
import {
  Search, Plus, Pencil, Trash2, X, Eye, EyeOff,
  User, Mail, Phone, Shield
} from 'lucide-react'

const ROLES = ['ADMIN', 'HSA', 'SRC_STAFF']

const ROLE_LABELS = {
  ADMIN: 'Admin',
  HSA: 'HSA',
  SRC_STAFF: 'SRC Staff',
}

const ROLE_COLORS = {
  ADMIN: 'bg-gray-900 text-white',
  HSA: 'bg-red-100 text-red-700',
  SRC_STAFF: 'bg-blue-100 text-blue-700',
}

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'SRC_STAFF',
  designation: '',
  contactNumber: '',
}

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-700'}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}

function UserFormModal({ isOpen, onClose, onSaved, onError, editUser }) {
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
        role: editUser.role ?? 'SRC_STAFF',
        designation: editUser.designation ?? '',
        contactNumber: editUser.contactNumber ?? '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError('')
    setShowPassword(false)
  }, [editUser, isOpen])

  if (!isOpen) return null

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Name is required')
    if (!form.email.trim()) return setError('Email is required')
    if (!editUser && !form.password.trim()) return setError('Password is required for new users')

    try {
      setSaving(true)
      const payload = {
        ...form,
        password: form.password || undefined,
      }
      if (editUser) await api.put(`/users/${editUser.id}`, payload)
      else await api.post('/users', payload)
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">
            {editUser ? 'Edit User' : 'Add User'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Winnie Koh"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="user@codered.sg"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => set('role', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {ROLES.map(role => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
            <input
              type="text"
              value={form.designation}
              onChange={e => set('designation', e.target.value)}
              placeholder="e.g. System Administrator"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

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
            {saving ? 'Saving...' : editUser ? 'Save Changes' : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchUsers = useCallback(async () => {
    const { data } = await api.get('/users')
    setUsers(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => {
    fetchUsers().finally(() => setLoading(false))
  }, [fetchUsers])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter(user => {
      const matchesRole = roleFilter === 'All' || user.role === roleFilter
      const matchesSearch = !q ||
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.designation?.toLowerCase().includes(q)
      return matchesRole && matchesSearch
    })
  }, [users, roleFilter, search])

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    hsa: users.filter(u => u.role === 'HSA').length,
    src: users.filter(u => u.role === 'SRC_STAFF').length,
  }

  const handleSaved = async () => {
    const wasEdit = Boolean(editUser)
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

  if (loading) {
    return (
      <PageLayout title="Users" subtitle="Manage application users and roles">
        <LoadingScreen variant="general" />
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Users" subtitle="Manage application users and roles">
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
        editUser={editUser}
        onClose={() => { setModalOpen(false); setEditUser(null) }}
        onSaved={handleSaved}
        onError={message => setToast({ type: 'error', title: 'Unable to save user', message })}
      />

      {deleteTarget && (
        <ConfirmModal
          icon="delete"
          title="Delete this user?"
          message={`This will permanently remove ${deleteTarget.name}.`}
          confirmLabel="Delete"
          confirmClass="bg-red-600 hover:bg-red-700 text-white"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          ['Total Users', stats.total, 'text-gray-900'],
          ['Admins', stats.admins, 'text-gray-900'],
          ['HSA Users', stats.hsa, 'text-primary'],
          ['SRC Staff', stats.src, 'text-blue-600'],
        ].map(([label, value, color]) => (
          <div key={label} className="card p-4">
            <div className="text-xs text-gray-500 font-medium">{label}</div>
            <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden overflow-x-auto">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3 justify-between min-w-[320px]">
          <div className="flex items-center gap-2 flex-1 min-w-[260px]">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="All">All roles</option>
              {ROLES.map(role => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
            </select>
          </div>
          <button
            onClick={() => { setEditUser(null); setModalOpen(true) }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-medium text-xs">Name</th>
              <th className="text-left px-4 py-3 font-medium text-xs">Email</th>
              <th className="text-left px-4 py-3 font-medium text-xs">Role</th>
              <th className="text-left px-4 py-3 font-medium text-xs">Designation</th>
              <th className="text-left px-4 py-3 font-medium text-xs">Contact</th>
              <th className="text-right px-4 py-3 font-medium text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                <td className="px-4 py-3 text-gray-600">{user.designation || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{user.contactNumber || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setEditUser(user); setModalOpen(true) }}
                      className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      title="Edit user"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(user)}
                      className="p-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="font-medium text-gray-500">No users found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search or role filter.</p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
