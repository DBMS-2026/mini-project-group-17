'use client'
import { useEffect } from 'react'
import {
  X, Mail, Phone, MapPin, Clock,
  Instagram, Twitter, Linkedin, Globe
} from 'lucide-react'

interface ContactModalProps {
  onClose: () => void
}

export default function ContactModal({ onClose }: ContactModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header gradient banner */}
        <div className="bg-gradient-to-br from-nexus-700 via-nexus-600 to-indigo-600 px-8 pt-8 pb-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Contact NexusEstate</h2>
              <p className="text-white/70 text-sm">We're here to help you</p>
            </div>
          </div>
        </div>

        {/* Floating card overlap */}
        <div className="-mt-5 mx-6 bg-white rounded-2xl shadow-lg px-6 py-5 border border-gray-100">
          <p className="text-gray-600 text-sm leading-relaxed">
            Have a question about a property, listing, or our platform? Reach out — our team typically responds within 24 hours.
          </p>
        </div>

        {/* Contact details */}
        <div className="px-6 pt-5 pb-6 space-y-4">

          {/* Email */}
          <a
            href="mailto:nexusestate.platform@gmail.com"
            className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-nexus-200 hover:bg-nexus-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-nexus-100 flex items-center justify-center flex-shrink-0 group-hover:bg-nexus-200 transition-colors">
              <Mail className="w-4 h-4 text-nexus-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Email Us</p>
              <p className="text-sm font-semibold text-gray-900">nexusestate.platform@gmail.com</p>
            </div>
          </a>

          {/* Phone */}
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Call / WhatsApp</p>
              <p className="text-sm font-semibold text-gray-900">+91 98765 43210</p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Office</p>
              <p className="text-sm font-semibold text-gray-900">Nexus Tower, Koramangala, Bangalore – 560034</p>
            </div>
          </div>

          {/* Hours */}
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Working Hours</p>
              <p className="text-sm font-semibold text-gray-900">Mon – Sat, 10:00 AM – 7:00 PM IST</p>
            </div>
          </div>

          {/* Social links */}
          <div className="pt-1">
            <p className="text-xs text-gray-400 text-center mb-3">Follow us on</p>
            <div className="flex justify-center gap-3">
              {[
                { icon: Instagram, color: 'bg-pink-100 text-pink-600 hover:bg-pink-200', label: 'Instagram' },
                { icon: Twitter,   color: 'bg-sky-100 text-sky-600 hover:bg-sky-200',   label: 'Twitter'   },
                { icon: Linkedin,  color: 'bg-blue-100 text-blue-600 hover:bg-blue-200', label: 'LinkedIn'  },
                { icon: Globe,     color: 'bg-nexus-100 text-nexus-600 hover:bg-nexus-200', label: 'Website' },
              ].map(({ icon: Icon, color, label }) => (
                <button
                  key={label}
                  title={label}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${color}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
