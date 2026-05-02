'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, X, CheckCircle2, XCircle, Clock, Home, ChevronRight, Loader2, RefreshCw } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import toast from 'react-hot-toast'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

interface Inquiry {
  id: number
  property_id: number
  property_title: string
  property_city?: string
  buyer_name?: string
  buyer_email?: string
  owner_name?: string
  owner_email?: string | null
  status: 'pending' | 'accepted' | 'rejected'
  message: string
  created_at: string
}

export default function NotificationBell() {
  const { user, isAuthenticated } = useAppStore()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'received' | 'sent'>('received')
  const [received, setReceived] = useState<Inquiry[]>([])
  const [sent, setSent] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const [ownerRes, buyerRes] = await Promise.all([
        fetch(`${BACKEND}/api/inquiries/owner/${user.id}`),
        fetch(`${BACKEND}/api/inquiries/buyer/${user.id}`),
      ])
      if (ownerRes.ok) setReceived(await ownerRes.json())
      if (buyerRes.ok) setSent(await buyerRes.json())
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [user])

  useEffect(() => {
    if (open && isAuthenticated) fetchNotifications()
  }, [open, isAuthenticated, fetchNotifications])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleAction = async (inquiryId: number, status: 'accepted' | 'rejected') => {
    setUpdating(inquiryId)
    try {
      const res = await fetch(`${BACKEND}/api/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, owner_id: user!.id })
      })
      if (!res.ok) throw new Error()
      setReceived(prev => prev.map(i => i.id === inquiryId ? { ...i, status } : i))
      toast.success(status === 'accepted' ? 'Request accepted! Buyer will be notified.' : 'Request rejected.')
    } catch { toast.error('Failed to update') }
    finally { setUpdating(null) }
  }

  const pendingCount = received.filter(i => i.status === 'pending').length

  const statusBadge = (status: string) => {
    if (status === 'accepted') return <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" />Accepted</span>
    if (status === 'rejected') return <span className="flex items-center gap-1 text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" />Rejected</span>
    return <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" />Pending</span>
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  if (!isAuthenticated) {
    return (
      <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
        <Bell className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-nexus-600 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {pendingCount > 0 && !open && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 ring-2 ring-white">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              <button onClick={fetchNotifications} className="p-1 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
                <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setTab('received')}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === 'received' ? 'text-nexus-600 border-b-2 border-nexus-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Received {pendingCount > 0 && <span className="ml-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
            </button>
            <button
              onClick={() => setTab('sent')}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === 'sent' ? 'text-nexus-600 border-b-2 border-nexus-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sent {sent.length > 0 && <span className="ml-1 bg-gray-200 text-gray-600 text-[9px] px-1.5 py-0.5 rounded-full">{sent.length}</span>}
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-nexus-600" />
              </div>
            ) : tab === 'received' ? (
              received.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No interest requests yet</p>
                </div>
              ) : (
                received.map(inq => (
                  <div key={inq.id} className="p-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-nexus-100 flex items-center justify-center text-nexus-600 font-bold text-sm flex-shrink-0">
                          {inq.buyer_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{inq.buyer_name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Home className="w-3 h-3" />
                            <span className="truncate">{inq.property_title}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                        {statusBadge(inq.status)}
                        <span className="text-[10px] text-gray-400">{timeAgo(inq.created_at)}</span>
                      </div>
                    </div>

                    {inq.message && (
                      <p className="text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2 mb-2 italic">"{inq.message}"</p>
                    )}

                    {inq.status === 'accepted' && (
                      <p className="text-xs text-emerald-600 bg-emerald-50 rounded-xl px-3 py-2 mb-2">
                        📧 Buyer's email: <strong>{inq.buyer_email}</strong>
                      </p>
                    )}

                    {inq.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(inq.id, 'accepted')}
                          disabled={updating === inq.id}
                          className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1"
                        >
                          {updating === inq.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                          Accept
                        </button>
                        <button
                          onClick={() => handleAction(inq.id, 'rejected')}
                          disabled={updating === inq.id}
                          className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )
            ) : (
              /* Sent Tab */
              sent.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <ChevronRight className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No requests sent yet</p>
                </div>
              ) : (
                sent.map(inq => (
                  <div key={inq.id} className="p-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1">
                          <Home className="w-3.5 h-3.5 text-nexus-400 flex-shrink-0" />
                          {inq.property_title}
                        </p>
                        <p className="text-xs text-gray-500">{inq.property_city}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                        {statusBadge(inq.status)}
                        <span className="text-[10px] text-gray-400">{timeAgo(inq.created_at)}</span>
                      </div>
                    </div>

                    {inq.message && (
                      <p className="text-xs text-gray-500 italic truncate">"{inq.message}"</p>
                    )}

                    {inq.status === 'accepted' && inq.owner_email && (
                      <div className="mt-2 p-3 bg-emerald-50 rounded-xl">
                        <p className="text-xs font-semibold text-emerald-700 mb-1">🎉 Request Accepted!</p>
                        <p className="text-xs text-emerald-600">Owner: <strong>{inq.owner_name}</strong></p>
                        <p className="text-xs text-emerald-600">Contact: <strong>{inq.owner_email}</strong></p>
                        <p className="text-[10px] text-emerald-500 mt-1">You can now contact the owner directly.</p>
                      </div>
                    )}

                    {inq.status === 'rejected' && (
                      <p className="text-xs text-red-400 mt-1">The owner has declined this request.</p>
                    )}
                  </div>
                ))
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
