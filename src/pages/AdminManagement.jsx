import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { createAdminHelperClient, supabase } from '../services/supabase'
import { showToast } from '../components/Toast'
import ConfirmationModal from '../components/ConfirmationModal'
import Loader from '../components/Loader'
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Mail, 
  User, 
  Lock, 
  ShieldCheck, 
  Database,
  Search
} from 'lucide-react'
import { format } from 'date-fns'

const AdminManagement = () => {
  const { isConfigured, profile: currentAdmin } = useAuth()

  // States
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Form States
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'bronze' })
  const [submitting, setSubmitting] = useState(false)

  // Delete Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState(null)

  // Mock Admin seeding for Demo Mode
  const getLocalAdmins = () => {
    const raw = localStorage.getItem('kbc_mock_admins')
    if (raw) return JSON.parse(raw)

    const initialAdmins = [
      { id: 'mock-sa-id', name: 'Keshav Sharma', email: 'admin@keshavam.com', role: 'super_admin', created_at: new Date().toISOString() },
      { id: 'mock-plt-id', name: 'Rajesh Kumar', email: 'platinum@keshavam.com', role: 'platinum', created_at: new Date().toISOString() },
      { id: 'mock-gld-id', name: 'Amit Singh', email: 'gold@keshavam.com', role: 'gold', created_at: new Date().toISOString() },
      { id: 'mock-slr-id', name: 'Vijay Sharma', email: 'silver@keshavam.com', role: 'silver', created_at: new Date().toISOString() },
      { id: 'mock-brz-id', name: 'Rohan Gupta', email: 'bronze@keshavam.com', role: 'bronze', created_at: new Date().toISOString() },
    ]
    localStorage.setItem('kbc_mock_admins', JSON.stringify(initialAdmins))
    return initialAdmins
  }

  const saveLocalAdmins = (list) => {
    localStorage.setItem('kbc_mock_admins', JSON.stringify(list))
  }

  // Load admins
  const loadAdmins = async () => {
    try {
      setLoading(true)
      if (isConfigured) {
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setAdmins(data || [])
      } else {
        setAdmins(getLocalAdmins())
      }
    } catch (err) {
      console.error('Failed to load admins:', err)
      showToast.error('Could not fetch administrator list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [isConfigured])

  // Handle create Admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    const { name, email, password, role } = newAdmin

    if (!name || !email || !password) {
      showToast.error('Please fill in all details.')
      return
    }

    if (password.length < 6) {
      showToast.error('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)
    try {
      if (isConfigured) {
        // Instantiate the secondary client to sign up the new user
        const helperClient = createAdminHelperClient()
        
        // SignUp new admin in auth.users
        const { data: signUpData, error: signUpError } = await helperClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role
            }
          }
        })

        if (signUpError) throw signUpError

        showToast.success(`Administrator ${name} registered successfully!`)
        setNewAdmin({ name: '', email: '', password: '', role: 'bronze' })
        loadAdmins()
      } else {
        // Local Demo Mode Add
        const list = getLocalAdmins()
        if (list.some(a => a.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('An administrator with this email already exists.')
        }

        const added = {
          id: `mock-id-${Date.now()}`,
          name,
          email,
          role,
          created_at: new Date().toISOString()
        }

        const updatedList = [added, ...list]
        saveLocalAdmins(updatedList)
        setAdmins(updatedList)

        showToast.success(`Admin ${name} created (Demo Mode).`)
        setNewAdmin({ name: '', email: '', password: '', role: 'bronze' })
      }
    } catch (err) {
      console.error(err)
      showToast.error(err.message || 'Failed to register new administrator.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete admin trigger
  const triggerDeleteAdmin = (admin) => {
    if (admin.id === currentAdmin?.id) {
      showToast.error('You cannot delete your own active supervisor account!')
      return
    }
    setAdminToDelete(admin)
    setDeleteModalOpen(true)
  }

  // Confirm delete Admin
  const handleConfirmDelete = async () => {
    if (!adminToDelete) return

    try {
      if (isConfigured) {
        // Deleting from public.admins will automatically fire our database trigger
        // which deletes the authentication user from auth.users (via security definer).
        const { error } = await supabase
          .from('admins')
          .delete()
          .eq('id', adminToDelete.id)

        if (error) throw error

        showToast.success('Admin deleted successfully.')
        loadAdmins()
      } else {
        // Local Demo Mode Delete
        const list = getLocalAdmins()
        const updated = list.filter(a => a.id !== adminToDelete.id)
        saveLocalAdmins(updated)
        setAdmins(updated)
        showToast.success('Admin profile removed (Demo Mode).')
      }
    } catch (err) {
      console.error(err)
      showToast.error(err.message || 'Failed to remove admin profile.')
    } finally {
      setAdminToDelete(null)
    }
  }

  // Filter admins list based on search query
  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const roleColors = {
    super_admin: 'text-luxury-gold bg-luxury-gold/5 border-luxury-gold/30',
    platinum: 'text-white bg-[#E5E4E2]/5 border-[#E5E4E2]/30',
    gold: 'text-[#FFD700] bg-[#FFD700]/5 border-[#FFD700]/30',
    silver: 'text-[#C0C0C0] bg-[#C0C0C0]/5 border-[#C0C0C0]/30',
    bronze: 'text-[#CD7F32] bg-[#CD7F32]/5 border-[#CD7F32]/30',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl lg:text-2xl font-serif font-bold text-white uppercase tracking-wider">
          Admin Management
        </h2>
        <p className="text-xs text-luxury-gray mt-1 font-sans">
          Configure security credentials and checkpoints for gate staff.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Panel: Add Admin */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-luxury-card p-6 rounded-xl border border-white/5 shadow-2xl space-y-6"
          >
            <h3 className="text-sm font-serif font-bold uppercase tracking-widest text-luxury-gold-light border-b border-luxury-gold/10 pb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-luxury-gold" />
              Register Staff User
            </h3>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest text-luxury-gray font-semibold block">
                  Staff Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-luxury-gold/65">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    placeholder="E.g. Ramesh Kumar"
                    disabled={submitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest text-luxury-gray font-semibold block">
                  Staff Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-luxury-gold/65">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    placeholder="E.g. ramesh@gmail.com"
                    disabled={submitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest text-luxury-gray font-semibold block">
                  Assign Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-luxury-gold/65">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    placeholder="Min 6 characters"
                    disabled={submitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest text-luxury-gray font-semibold block">
                  Checkpoint / Gate Role
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-luxury-gold/65">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <select
                    value={newAdmin.role}
                    onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                    disabled={submitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-xs appearance-none cursor-pointer focus:outline-none focus:border-luxury-gold"
                  >
                    <option value="super_admin" className="bg-luxury-bg">Super Admin (Full Access)</option>
                    <option value="platinum" className="bg-luxury-bg">Platinum Gate (PLT001-450)</option>
                    <option value="gold" className="bg-luxury-bg">Gold Gate (GLD001-450)</option>
                    <option value="silver" className="bg-luxury-bg">Silver Gate (SLR001-450)</option>
                    <option value="bronze" className="bg-luxury-bg">Bronze Gate (BRZ001-450)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-luxury-gold hover:bg-luxury-gold-light text-luxury-bg font-serif font-bold uppercase tracking-widest text-xs rounded transition-all duration-300 transform active:scale-98 flex items-center justify-center space-x-2"
              >
                {submitting ? <span>Registering...</span> : <span>Create Account</span>}
              </button>
            </form>
          </motion.div>
        </div>

        {/* List Panel: Admins List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Box */}
          <div className="bg-luxury-card p-4 rounded-xl border border-white/5 flex items-center space-x-3.5 shadow-xl">
            <Search className="w-5 h-5 text-luxury-gold" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search admin name, email, or role..."
              className="flex-1 bg-transparent text-sm focus:outline-none border-none text-white placeholder-luxury-gray/60 font-sans"
            />
          </div>

          {/* Admins Table Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-luxury-card rounded-xl border border-white/5 overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-luxury-gold/15 flex justify-between items-center bg-luxury-bg/40">
              <h3 className="text-sm font-serif font-bold uppercase tracking-widest text-luxury-gold-light flex items-center gap-2">
                <Users className="w-4 h-4 text-luxury-gold" />
                Active Gate Supervisors ({filteredAdmins.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader text="Retrieving administrative listings..." />
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="p-12 text-center text-luxury-gray text-xs font-sans">
                No administrators found matching search filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-luxury-gold/10 text-luxury-gray font-semibold uppercase tracking-widest text-[9px] bg-luxury-bg/20">
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Email</th>
                      <th className="py-4 px-6">Role</th>
                      <th className="py-4 px-6">Registered At</th>
                      <th className="py-4 px-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {filteredAdmins.map((admin) => (
                      <tr 
                        key={admin.id}
                        className="hover:bg-luxury-card/25 transition-colors"
                      >
                        <td className="py-4 px-6 font-medium text-white font-serif tracking-wide uppercase">
                          {admin.name}
                        </td>
                        <td className="py-4 px-6 text-luxury-gray">
                          {admin.email}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-block py-0.5 px-2.5 border rounded-full text-[9px] font-bold uppercase tracking-widest ${roleColors[admin.role] || 'border-white/10 text-white'}`}>
                            {admin.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-luxury-gray/70">
                          {admin.created_at ? format(new Date(admin.created_at), 'dd MMM yyyy') : 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => triggerDeleteAdmin(admin)}
                            className="p-1.5 border border-luxury-error/20 hover:border-luxury-error text-luxury-error hover:bg-luxury-error/5 rounded transition-all focus:outline-none"
                            title="Remove Admin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Revoke Staff Credentials"
        message={`Are you sure you want to revoke credentials for ${adminToDelete?.name}? This will delete their login accounts from Supabase Auth and prevent them from verifying any tickets. This action is final.`}
        confirmText="Revoke Access"
        isDanger={true}
      />
    </div>
  )
}

export default AdminManagement
