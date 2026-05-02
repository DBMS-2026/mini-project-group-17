'use client'
import { X, MapPin, ShieldCheck, Phone, MessageCircle } from 'lucide-react'
import type { Property } from '@/lib/data'
import { formatPrice } from '@/lib/utils'

interface ContactModalProps {
  property: Property
  onClose: () => void
}

export default function ContactModal({ property, onClose }: ContactModalProps) {
  const ownerName = property.ownerName ?? 'Property Owner'
  const ownerPhone = property.ownerPhone ?? ''
  const ownerEmail = property.ownerEmail ?? ''
  const ownerType = property.ownerType ?? 'Owner'

  const initials = ownerName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const whatsappLink = `https://wa.me/${ownerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi, I'm interested in your property "${property.title}" listed on NexusEstate. Please share more details.`
  )}`

  const gmailLink = `mailto:${ownerEmail}?subject=${encodeURIComponent(
    `Inquiry: ${property.title} - NexusEstate`
  )}&body=${encodeURIComponent(
    `Hi ${ownerName},\n\nI'm interested in your property "${property.title}" located at ${property.location}.\n\nPlease share more details.\n\nThank you.`
  )}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Contact seller for</p>
            <h2 className="font-display font-semibold text-gray-900 text-sm leading-tight">
              {property.title}
            </h2>
            <div className="flex items-center gap-1 mt-1 text-gray-400 text-xs">
              <MapPin className="w-3 h-3 text-nexus-400" />
              <span>{property.location}</span>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Owner Card */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <div className="w-12 h-12 rounded-full bg-nexus-100 flex items-center justify-center
              text-nexus-700 font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{ownerName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-400">{ownerType}</span>
                {property.isRera && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-green-600 font-medium">
                      <ShieldCheck className="w-3 h-3" /> RERA Verified
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* No agent disclaimer */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs text-emerald-700 font-medium">
              Direct seller contact · No agent · No brokerage
            </p>
          </div>
          
          {ownerEmail && (
            <div className="rounded-xl border border-gray-100 px-4 py-3">
              <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Email</p>
              <p className="text-sm font-medium text-gray-800 truncate">{ownerEmail}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {ownerPhone ? (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600
                  text-white text-sm font-semibold rounded-xl transition">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            ) : (
              <button disabled className="flex items-center justify-center gap-2 py-3 bg-gray-100
                text-gray-400 text-sm font-semibold rounded-xl cursor-not-allowed">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </button>
            )}

            {ownerEmail ? (
              <a href={gmailLink}
                className="flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600
                  text-white text-sm font-semibold rounded-xl transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.73l8.073-6.237C21.69 2.28 24 3.434 24 5.457z"/>
                </svg>
                Email
              </a>
            ) : (
              <button disabled className="flex items-center justify-center gap-2 py-3 bg-gray-100
                text-gray-400 text-sm font-semibold rounded-xl cursor-not-allowed">
                Email
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}