import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import Loader from '../components/Loader'
import { showToast } from '../components/Toast'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Calendar, 
  RefreshCw, 
  TicketCheck 
} from 'lucide-react'
import { format, startOfHour, parseISO } from 'date-fns'

const Analytics = () => {
  const { isConfigured } = useAuth()
  
  // States
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState([])
  const [pieData, setPieData] = useState([])
  const [barData, setBarData] = useState([])
  const [hourlyData, setHourlyData] = useState([])
  const [summary, setSummary] = useState({ totalCheckedIn: 0, totalRemaining: 1800, efficiency: 0 })

  // Mock DB data generator
  const getLocalTickets = () => {
    const raw = localStorage.getItem('kbc_mock_tickets')
    if (raw) return JSON.parse(raw)
    return []
  }

  // Fetch all tickets to perform clientside aggregations for charts
  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      let ticketsList = []

      if (isConfigured) {
        // Query database in parallel pages to bypass PostgREST max-rows server limit
        const [res1, res2] = await Promise.all([
          supabase
            .from('tickets')
            .select('category, checked_in, checked_in_at')
            .range(0, 999),
          supabase
            .from('tickets')
            .select('category, checked_in, checked_in_at')
            .range(1000, 1999)
        ])

        if (res1.error) throw res1.error
        if (res2.error) throw res2.error

        ticketsList = [...(res1.data || []), ...(res2.data || [])]
      } else {
        ticketsList = getLocalTickets()
      }

      setTickets(ticketsList)
      processData(ticketsList)
    } catch (err) {
      console.error(err)
      showToast.error('Failed to aggregate analytics.')
    } finally {
      setLoading(false)
    }
  }

  const processData = (list) => {
    // 1. Calculate General Summary
    const checked = list.filter(t => t.checked_in)
    const totalCheckedIn = checked.length
    const totalRemaining = list.length - totalCheckedIn
    const efficiency = list.length > 0 ? Math.round((totalCheckedIn / list.length) * 100) : 0
    setSummary({ totalCheckedIn, totalRemaining, efficiency })

    // 2. Pie Chart Process: Checked In tickets by category
    const categories = ['platinum', 'gold', 'silver', 'bronze']
    const catLabels = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' }
    
    const pieCounts = categories.map(cat => {
      const count = list.filter(t => t.category === cat && t.checked_in).length
      return {
        name: catLabels[cat],
        value: count
      }
    }).filter(c => c.value > 0) // Only show categories with entries in pie
    
    setPieData(pieCounts.length > 0 ? pieCounts : categories.map(cat => ({ name: catLabels[cat], value: 0 })))

    // 3. Bar Chart Process: Total vs Checked In by category
    const barCounts = categories.map(cat => {
      const catTickets = list.filter(t => t.category === cat)
      const checkedCount = catTickets.filter(t => t.checked_in).length
      const remainingCount = catTickets.length - checkedCount
      return {
        name: catLabels[cat],
        'Checked In': checkedCount,
        'Remaining': remainingCount
      }
    })
    setBarData(barCounts)

    // 4. Hourly Timeline Process
    // Group checked_in_at timestamps by hour
    const hourlyCounts = {}

    // Seed default hours for the event timeframe (e.g. 5 PM to 11 PM)
    // If database contains entries outside this range, they will be added dynamically.
    const defaultHours = ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
    defaultHours.forEach(h => {
      hourlyCounts[h] = 0
    })

    checked.forEach(t => {
      if (t.checked_in_at) {
        try {
          const dt = new Date(t.checked_in_at)
          const hourStr = format(dt, 'HH:00') // 24h format e.g. "18:00"
          if (hourlyCounts[hourStr] !== undefined) {
            hourlyCounts[hourStr]++
          } else {
            hourlyCounts[hourStr] = 1
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    })

    // If mock data is running and all hours are 0, synthesize a nice progression curve for visual premiumness!
    const isMockDataEmpty = Object.values(hourlyCounts).every(v => v === 0)
    if (!isConfigured && isMockDataEmpty && totalCheckedIn > 0) {
      // Allocate checked-in tickets across hours in a realistic curve
      let remainingAlloc = totalCheckedIn
      const hourKeys = Object.keys(hourlyCounts)
      
      // Alloc curves: 5%, 15%, 35%, 25%, 12%, 6%, 2%
      const multipliers = [0.05, 0.15, 0.35, 0.25, 0.12, 0.06, 0.02]
      hourKeys.forEach((key, idx) => {
        const count = Math.min(remainingAlloc, Math.round(totalCheckedIn * (multipliers[idx] || 0.01)))
        hourlyCounts[key] = count
        remainingAlloc -= count
      })
      if (remainingAlloc > 0 && hourKeys.length > 0) {
        hourlyCounts[hourKeys[2]] += remainingAlloc // add remainder to peak
      }
    }

    const hourlyChartData = Object.keys(hourlyCounts).sort().map(key => {
      // Convert to 12h format for display, e.g. "06:00 PM"
      const [h, m] = key.split(':')
      const hourNum = parseInt(h, 10)
      const label = hourNum >= 12 
        ? `${hourNum === 12 ? 12 : hourNum - 12} PM` 
        : `${hourNum === 0 ? 12 : hourNum} AM`

      return {
        time: label,
        'Entries': hourlyCounts[key]
      }
    })

    setHourlyData(hourlyChartData)
  }

  useEffect(() => {
    loadAnalyticsData()
  }, [isConfigured])

  // Colors for cells in Recharts Pie
  const COLORS = {
    Platinum: '#E5E4E2',
    Gold: '#D4AF37',
    Silver: '#C0C0C0',
    Bronze: '#CD7F32'
  }

  const PIE_COLORS = ['#D4AF37', '#F5E6A3', '#10284F', '#0B1F3F']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader text="Compiling metric arrays..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-serif font-bold text-white uppercase tracking-wider">
            Gate Analytics
          </h2>
          <p className="text-xs text-luxury-gray mt-1 font-sans">
            Realtime data visualization of check-in throughput and category ingress.
          </p>
        </div>
        <button
          onClick={loadAnalyticsData}
          className="self-start px-4 py-2 border border-luxury-gold/30 hover:border-luxury-gold hover:bg-luxury-gold/5 text-luxury-gold-light hover:text-luxury-gold text-xs font-serif uppercase tracking-widest rounded transition-all duration-300 flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Mini Stats Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-luxury-gold/10 flex items-center space-x-3.5">
          <div className="p-2.5 rounded bg-luxury-success/10 text-luxury-success">
            <TicketCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-luxury-gray uppercase tracking-wider font-semibold font-sans">Total Checked In</p>
            <p className="text-xl font-bold font-serif text-white mt-0.5">{summary.totalCheckedIn} / 1800</p>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-luxury-gold/10 flex items-center space-x-3.5">
          <div className="p-2.5 rounded bg-luxury-gold/10 text-luxury-gold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-luxury-gray uppercase tracking-wider font-semibold font-sans">Arrival Rate</p>
            <p className="text-xl font-bold font-serif text-white mt-0.5">{summary.efficiency}%</p>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-luxury-gold/10 flex items-center space-x-3.5">
          <div className="p-2.5 rounded bg-luxury-error/10 text-luxury-error">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-luxury-gray uppercase tracking-wider font-semibold font-sans">Remaining Attendees</p>
            <p className="text-xl font-bold font-serif text-white mt-0.5">{summary.totalRemaining}</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line/Area Chart: Ingress over time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-xl border border-luxury-gold/15 shadow-xl flex flex-col h-[380px]"
        >
          <h3 className="text-sm font-serif font-bold uppercase tracking-widest text-luxury-gold-light border-b border-luxury-gold/10 pb-3 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-luxury-gold" />
            Hourly Entry Ingress
          </h3>
          <div className="flex-1 w-full text-xs font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.08)" vertical={false} />
                <XAxis dataKey="time" stroke="#C8CDD8" fontSize={9} dy={10} />
                <YAxis stroke="#C8CDD8" fontSize={9} dx={-10} />
                <Tooltip contentStyle={{ backgroundColor: '#10284F', borderColor: '#D4AF37', borderRadius: 8 }} />
                <Area type="monotone" dataKey="Entries" stroke="#D4AF37" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEntries)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart: Checked In vs Remaining */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-xl border border-luxury-gold/15 shadow-xl flex flex-col h-[380px]"
        >
          <h3 className="text-sm font-serif font-bold uppercase tracking-widest text-luxury-gold-light border-b border-luxury-gold/10 pb-3 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-luxury-gold" />
            Gate Capacity Performance
          </h3>
          <div className="flex-1 w-full text-xs font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#C8CDD8" fontSize={9} dy={10} />
                <YAxis stroke="#C8CDD8" fontSize={9} dx={-10} />
                <Tooltip contentStyle={{ backgroundColor: '#10284F', borderColor: '#D4AF37', borderRadius: 8 }} />
                <Bar dataKey="Checked In" stackId="a" fill="#16C784" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Remaining" stackId="a" fill="#10284F" stroke="rgba(212,175,55,0.25)" strokeWidth={1} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart: Checked In Category Mix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-panel p-6 rounded-xl border border-luxury-gold/15 shadow-xl flex flex-col h-[380px] lg:col-span-2"
        >
          <h3 className="text-sm font-serif font-bold uppercase tracking-widest text-luxury-gold-light border-b border-luxury-gold/10 pb-3 mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-luxury-gold" />
            Attendee Category Proportion (Check-ins)
          </h3>
          <div className="flex-1 flex flex-col md:flex-row items-center justify-around gap-6">
            <div className="w-[200px] h-[200px] font-sans text-xs">
              {pieData.reduce((acc, curr) => acc + curr.value, 0) === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-luxury-gray/60 italic">
                  Waiting for first entry...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#10284F', borderColor: '#D4AF37', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Legends */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center space-x-2.5">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length] }} 
                  />
                  <div>
                    <span className="text-white font-serif uppercase tracking-wider font-semibold">{entry.name}</span>
                    <span className="block text-[10px] text-luxury-gray">{entry.value} Check-ins</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default Analytics
