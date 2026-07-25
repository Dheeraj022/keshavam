import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { showToast } from '../components/Toast'
import ConfirmationModal from '../components/ConfirmationModal'
import Loader from '../components/Loader'
import { 
  Search, 
  RefreshCcw, 
  Download, 
  RotateCcw, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Ticket 
} from 'lucide-react'
import { format } from 'date-fns'

const TicketSearch = () => {
  const { isConfigured } = useAuth()

  // States
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Reset Modal States
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [ticketToReset, setTicketToReset] = useState(null)
  const [resetting, setResetting] = useState(false)
  const [resetAllModalOpen, setResetAllModalOpen] = useState(false)

  // Local storage mock helpers
  const getLocalTickets = () => {
    const raw = localStorage.getItem('kbc_mock_tickets')
    if (raw) return JSON.parse(raw)
    return []
  }

  const saveLocalTickets = (list) => {
    localStorage.setItem('kbc_mock_tickets', JSON.stringify(list))
  }

  // Debounce search inputs to avoid rapid DB spamming
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load ticket entries
  const loadTickets = async () => {
    try {
      setLoading(true)
      if (isConfigured) {
        // If query parameters are empty and we request everything (1,800 rows),
        // we run parallel requests to bypass the PostgREST server-side limit of 1000.
        const requiresMultiPage = categoryFilter === 'all' && !debouncedSearch && statusFilter === 'all';

        if (requiresMultiPage) {
          const [res1, res2] = await Promise.all([
            supabase
              .from('tickets')
              .select(`
                id, 
                ticket_code, 
                category, 
                checked_in, 
                checked_in_at, 
                checked_in_by,
                admins!tickets_checked_in_by_fkey (name)
              `)
              .order('ticket_code', { ascending: true })
              .range(0, 999),
            supabase
              .from('tickets')
              .select(`
                id, 
                ticket_code, 
                category, 
                checked_in, 
                checked_in_at, 
                checked_in_by,
                admins!tickets_checked_in_by_fkey (name)
              `)
              .order('ticket_code', { ascending: true })
              .range(1000, 1999)
          ])

          if (res1.error) throw res1.error
          if (res2.error) throw res2.error

          setTickets([...(res1.data || []), ...(res2.data || [])])
        } else {
          // A single page query is sufficient since filtered results will yield under 1,000 items
          let query = supabase
            .from('tickets')
            .select(`
              id, 
              ticket_code, 
              category, 
              checked_in, 
              checked_in_at, 
              checked_in_by,
              admins!tickets_checked_in_by_fkey (name)
            `)

          if (debouncedSearch) {
            const cleanQuery = debouncedSearch.replace(/\s+/g, '').toUpperCase()
            query = query.ilike('ticket_code', `%${cleanQuery}%`)
          }

          if (categoryFilter !== 'all') {
            query = query.eq('category', categoryFilter)
          }

          if (statusFilter !== 'all') {
            query = query.eq('checked_in', statusFilter === 'checked_in')
          }

          const { data, error } = await query
            .order('ticket_code', { ascending: true })
            .range(0, 999)

          if (error) throw error
          setTickets(data || [])
        }
      } else {
        setTickets(getLocalTickets())
      }
    } catch (err) {
      console.error(err)
      showToast.error('Failed to load tickets.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [isConfigured, categoryFilter, statusFilter, debouncedSearch])

  // Trigger Reset Confirm Modal
  const triggerResetTicket = (ticket) => {
    setTicketToReset(ticket)
    setResetModalOpen(true)
  }

  // Confirm Reset Checkin
  const handleConfirmReset = async () => {
    if (!ticketToReset) return
    setResetting(true)

    try {
      if (isConfigured) {
        // Nullify check-in status in Supabase
        const { error } = await supabase
          .from('tickets')
          .update({
            checked_in: false,
            checked_in_at: null,
            checked_in_by: null,
            remarks: 'Reset by Supervisor'
          })
          .eq('id', ticketToReset.id)

        if (error) throw error
        showToast.success(`Ticket ${ticketToReset.ticket_code} has been reset successfully.`)
        loadTickets()
      } else {
        // Demo local storage updates
        const list = getLocalTickets()
        const idx = list.findIndex(t => t.ticket_code === ticketToReset.ticket_code)
        if (idx !== -1) {
          list[idx].checked_in = false
          list[idx].checked_in_at = null
          list[idx].checked_in_by_name = null
          saveLocalTickets(list)
          setTickets(list)
          showToast.success(`Ticket ${ticketToReset.ticket_code} reset (Demo).`)
        }
      }
    } catch (err) {
      console.error(err)
      showToast.error('Failed to reset ticket.')
    } finally {
      setResetting(false)
      setTicketToReset(null)
    }
  }

  // Confirm Reset ALL checkins
  const handleConfirmResetAll = async () => {
    setResetting(true)
    try {
      if (isConfigured) {
        // Bulk update Supabase database
        const { error } = await supabase
          .from('tickets')
          .update({
            checked_in: false,
            checked_in_at: null,
            checked_in_by: null,
            remarks: 'Bulk Reset All by Supervisor'
          })
          .neq('checked_in', false) // optimized to only target checked-in rows

        if (error) throw error
        showToast.success('All tickets have been successfully reset.')
        loadTickets()
      } else {
        // Mock LocalStorage clear-out
        const list = getLocalTickets()
        const cleared = list.map(t => ({
          ...t,
          checked_in: false,
          checked_in_at: null,
          checked_in_by_name: null
        }))
        saveLocalTickets(cleared)
        setTickets(cleared)
        showToast.success('All tickets reset (Demo Mode).')
      }
    } catch (err) {
      console.error(err)
      showToast.error(err.message || 'Failed to perform bulk reset.')
    } finally {
      setResetting(false)
    }
  }

  // Handle Export CSV
  const handleExportCSV = () => {
    if (filteredTickets.length === 0) {
      showToast.error('No records found to export.')
      return
    }

    try {
      const headers = ['Ticket Code', 'Category', 'Status', 'Checked In Time', 'Verified By']
      const rows = filteredTickets.map(t => [
        t.ticket_code,
        t.category.toUpperCase(),
        t.checked_in ? 'CHECKED IN' : 'REMAINING',
        t.checked_in_at ? format(new Date(t.checked_in_at), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
        t.admins?.name || t.checked_in_by_name || 'N/A'
      ])

      const csvString = [
        headers.join(','),
        ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `kbc_tickets_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      showToast.success('Export file download initiated.')
    } catch (e) {
      console.error('CSV Export Error:', e)
      showToast.error('Failed to parse CSV spreadsheet.')
    }
  }

  // Filtering Logic
  const filteredTickets = tickets.filter(ticket => {
    // 1. Query Match
    const cleanQuery = searchQuery.replace(/\s+/g, '').toLowerCase()
    const matchesQuery = cleanQuery === '' || ticket.ticket_code.toLowerCase().includes(cleanQuery)

    // 2. Category Match
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter

    // 3. Status Match
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'checked_in' && ticket.checked_in) ||
      (statusFilter === 'remaining' && !ticket.checked_in)

    return matchesQuery && matchesCategory && matchesStatus
  })

  // Theme labels mapping
  const categoryLabels = {
    platinum: 'border-white/20 text-white bg-white/5',
    gold: 'border-[#FFD700]/30 text-[#FFD700] bg-[#FFD700]/5',
    silver: 'border-[#C0C0C0]/30 text-[#C0C0C0] bg-[#C0C0C0]/5',
    bronze: 'border-[#CD7F32]/30 text-[#CD7F32] bg-[#CD7F32]/5',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-serif font-bold text-white uppercase tracking-wider">
            Ticket Ledger
          </h2>
          <p className="text-xs text-luxury-gray mt-1 font-sans">
            Audit checkpoints, reset codes, and export the database entries.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadTickets}
            className="p-2 border border-white/10 hover:border-white/35 text-luxury-gray hover:text-white rounded transition-all focus:outline-none flex items-center justify-center bg-luxury-card/30"
            title="Reload Database"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setResetAllModalOpen(true)}
            className="px-4 py-2.5 border border-luxury-error/35 hover:border-luxury-error text-luxury-error hover:bg-luxury-error/5 text-xs font-serif font-bold uppercase tracking-widest rounded transition-all duration-300 flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-luxury-gold hover:bg-luxury-gold-light text-luxury-bg font-serif font-bold uppercase tracking-widest text-xs rounded transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-luxury-gold/15"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Box */}
      <div className="glass-panel p-5 rounded-xl border border-luxury-gold/15 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Search */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-semibold block">
            Search Ticket Code
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-luxury-gold/65">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="E.g. GLD225"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-xs uppercase"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-semibold block">
            Filter Category
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-luxury-gold/65">
              <Filter className="w-4 h-4" />
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-xs appearance-none cursor-pointer focus:outline-none focus:border-luxury-gold"
            >
              <option value="all" className="bg-luxury-bg">All Categories</option>
              <option value="platinum" className="bg-luxury-bg">Platinum Series</option>
              <option value="gold" className="bg-luxury-bg">Gold Series</option>
              <option value="silver" className="bg-luxury-bg">Silver Series</option>
              <option value="bronze" className="bg-luxury-bg">Bronze Series</option>
            </select>
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-semibold block">
            Filter Status
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-luxury-gold/65">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-xs appearance-none cursor-pointer focus:outline-none focus:border-luxury-gold"
            >
              <option value="all" className="bg-luxury-bg">All Statuses</option>
              <option value="checked_in" className="bg-luxury-bg">Checked In Only</option>
              <option value="remaining" className="bg-luxury-bg">Remaining Only</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main Ledger Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl border border-luxury-gold/15 overflow-hidden shadow-xl"
      >
        {loading ? (
          <div className="p-16 flex justify-center">
            <Loader text="Auditing passes..." />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-16 text-center text-luxury-gray text-xs font-sans">
            No ticket records match current search filters.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-luxury-gold/10 text-luxury-gray font-semibold uppercase tracking-widest text-[9px] bg-luxury-bg-sec/90 backdrop-blur-md">
                  <th className="py-4 px-6">Ticket Code</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Entry Status</th>
                  <th className="py-4 px-6">Entry Time</th>
                  <th className="py-4 px-6">Staff Operator</th>
                  <th className="py-4 px-6 text-center">Reset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id || ticket.ticket_code}
                    className="hover:bg-luxury-card/20 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-white text-sm tracking-widest">
                      {ticket.ticket_code}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block py-0.5 px-2 border rounded text-[9px] font-bold uppercase tracking-wider ${categoryLabels[ticket.category] || 'border-white/10 text-white'}`}>
                        {ticket.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {ticket.checked_in ? (
                        <span className="flex items-center text-luxury-success space-x-1.5 font-semibold text-[10px] uppercase tracking-wide">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Checked In</span>
                        </span>
                      ) : (
                        <span className="flex items-center text-luxury-gray/50 space-x-1.5 text-[10px] uppercase tracking-wide">
                          <XCircle className="w-4 h-4" />
                          <span>Remaining</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-luxury-gray">
                      {ticket.checked_in_at ? format(new Date(ticket.checked_in_at), 'dd MMM yyyy, hh:mm a') : '—'}
                    </td>
                    <td className="py-4 px-6 text-white font-serif uppercase tracking-wider text-[10px]">
                      {ticket.admins?.name || ticket.checked_in_by_name || '—'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {ticket.checked_in ? (
                        <button
                          onClick={() => triggerResetTicket(ticket)}
                          disabled={resetting}
                          className="p-1.5 border border-luxury-gold/30 hover:border-luxury-gold text-luxury-gold-light hover:text-luxury-gold hover:bg-luxury-gold/5 rounded transition-all focus:outline-none"
                          title="Reset Check-in"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-luxury-gray/20">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Check-in Status"
        message={`Are you sure you want to reset check-in data for ticket ${ticketToReset?.ticket_code}? This will re-enable entry for this pass.`}
        confirmText="Reset Entry"
      />

      {/* Reset All Confirmation Modal */}
      <ConfirmationModal
        isOpen={resetAllModalOpen}
        onClose={() => setResetAllModalOpen(false)}
        onConfirm={handleConfirmResetAll}
        title="Reset All Tickets"
        message="Are you sure you want to reset ALL checked-in tickets? This will delete all arrival timestamps and checker profiles, re-enabling entry for all 1,800 passes. This action cannot be undone."
        confirmText="Reset All Passes"
        isDanger={true}
      />
    </div>
  )
}

export default TicketSearch
