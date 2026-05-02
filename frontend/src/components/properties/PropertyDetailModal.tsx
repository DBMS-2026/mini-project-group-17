'use client'
import { useState, useEffect, useCallback } from 'react'
import { X, Star, MapPin, BedDouble, Bath, Maximize2, Calendar, Shield, Zap, Car, ArrowUpDown, CheckCircle2, XCircle, Send, Loader2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import toast from 'react-hot-toast'

interface PropertyDetailModalProps {
  property: any
  onClose: () => void
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export default function PropertyDetailModal({ property, onClose }: PropertyDetailModalProps) {
  const { user, isAuthenticated } = useAppStore()
  const [ratingData, setRatingData] = useState({ avg_rating: 0, rating_count: 0, user_rating: null as number | null })
  const [hoverStar, setHoverStar] = useState(0)
  const [submittingRating, setSubmittingRating] = useState(false)
  const [inquirySent, setInquirySent] = useState(false)
  const [sendingInquiry, setSendingInquiry] = useState(false)
  const [inquiryMessage, setInquiryMessage] = useState('')
  const [showInquiryBox, setShowInquiryBox] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  const isOwnProperty = isAuthenticated && user?.id === property.owner_id

  // Fetch rating on mount
  useEffect(() => {
    const pid = property.property_id || property.id
    const url = user?.id
      ? `${BACKEND}/api/ratings/${pid}?userId=${user.id}`
      : `${BACKEND}/api/ratings/${pid}`
    fetch(url).then(r => r.json()).then(setRatingData).catch(() => {})
  }, [property, user])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleRate = async (star: number) => {
    if (!isAuthenticated) { toast.error('Please login to rate properties'); return }
    setSubmittingRating(true)
    try {
      const res = await fetch(`${BACKEND}/api/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: property.property_id || property.id, user_id: user!.id, rating: star })
      })
      const data = await res.json()
      setRatingData(prev => ({ ...prev, avg_rating: data.avg_rating, rating_count: data.rating_count, user_rating: star }))
      toast.success('Rating submitted!')
    } catch { toast.error('Failed to submit rating') }
    finally { setSubmittingRating(false) }
  }

  const handleSendInquiry = async () => {
    if (!isAuthenticated) { toast.error('Please login to contact the owner'); return }
    if (!inquiryMessage.trim()) { toast.error('Please write a message'); return }
    setSendingInquiry(true)
    try {
      const res = await fetch(`${BACKEND}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.property_id || property.id,
          buyer_id: user!.id,
          owner_id: property.owner_id,
          message: inquiryMessage
        })
      })
      if (res.status === 409) { toast.error('You already sent a request for this property'); return }
      if (!res.ok) throw new Error()
      setInquirySent(true)
      setShowInquiryBox(false)
      toast.success('Interest request sent to owner!')
    } catch { toast.error('Failed to send request') }
    finally { setSendingInquiry(false) }
  }

  const rawImages = property.images
  const images = Array.isArray(rawImages) && rawImages.length > 0
    ? rawImages
    : typeof rawImages === 'string' && rawImages !== '[]'
    ? (() => { try { const p = JSON.parse(rawImages); return Array.isArray(p) && p.length > 0 ? p : null; } catch { return null; } })()
    : null
  const displayImages = images || (property.image ? [property.image] : ['https://placehold.co/1200x800/1e293b/94a3b8?text=No+Image'])
  const price = parseFloat(String(property.price))
  const isRent = property.listing_type === 'rent'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition">
          <X className="w-4 h-4 text-gray-700" />
        </button>

        {/* Image Carousel */}
        <div className="relative h-64 sm:h-80 rounded-t-3xl overflow-hidden bg-gray-100">
          <img src={displayImages[activeImage]} alt={property.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Listing type badge */}
          <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold ${isRent ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
            {isRent ? 'For Rent' : 'For Sale'}
          </span>

          {/* Image dots */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {displayImages.map((_: string, i: number) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeImage ? 'bg-white w-4' : 'bg-white/50'}`} />
              ))}
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          {/* Title & Price */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{property.title}</h2>
              <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>{property.address || property.location || property.city}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-nexus-600">
                ₹{price.toLocaleString('en-IN')}
                {isRent && <span className="text-base font-medium text-gray-500">/mo</span>}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
            {property.bedrooms && (
              <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-3">
                <BedDouble className="w-5 h-5 text-nexus-600 mb-1" />
                <p className="font-bold text-gray-900 text-sm">{property.bedrooms}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Beds</p>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-3">
                <Bath className="w-5 h-5 text-nexus-600 mb-1" />
                <p className="font-bold text-gray-900 text-sm">{property.bathrooms}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Baths</p>
              </div>
            )}
            {property.area && (
              <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-3">
                <Maximize2 className="w-5 h-5 text-nexus-600 mb-1" />
                <p className="font-bold text-gray-900 text-sm">{property.area}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Sq.ft</p>
              </div>
            )}
            {property.year_built && (
              <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-3">
                <Calendar className="w-5 h-5 text-nexus-600 mb-1" />
                <p className="font-bold text-gray-900 text-sm">{property.year_built}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Built</p>
              </div>
            )}
            <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-3">
              <Star className="w-5 h-5 text-amber-400 mb-1 fill-amber-400" />
              <p className="font-bold text-gray-900 text-sm">{ratingData.avg_rating > 0 ? ratingData.avg_rating.toFixed(1) : 'New'}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">{ratingData.rating_count} Ratings</p>
            </div>
          </div>

          {/* Amenities */}
          {(property.parking || property.elevator || property.power_backup || property.amenities?.length) && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.parking && <span className="flex items-center gap-1.5 px-3 py-1.5 bg-nexus-50 text-nexus-700 rounded-full text-xs font-medium"><Car className="w-3.5 h-3.5" />Parking</span>}
                {property.elevator && <span className="flex items-center gap-1.5 px-3 py-1.5 bg-nexus-50 text-nexus-700 rounded-full text-xs font-medium"><ArrowUpDown className="w-3.5 h-3.5" />Elevator</span>}
                {property.power_backup && <span className="flex items-center gap-1.5 px-3 py-1.5 bg-nexus-50 text-nexus-700 rounded-full text-xs font-medium"><Zap className="w-3.5 h-3.5" />Power Backup</span>}
                {property.amenities?.map((a: string) => (
                  <span key={a} className="px-3 py-1.5 bg-nexus-50 text-nexus-700 rounded-full text-xs font-medium">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">About This Property</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Property History */}
          <div className="mb-6 bg-gray-50 rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-nexus-600" /> Property History
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-500">City</p><p className="font-medium text-gray-900">{property.city}</p></div>
              <div><p className="text-gray-500">Type</p><p className="font-medium text-gray-900 capitalize">{property.type || property.property_type || 'Residential'}</p></div>
              <div><p className="text-gray-500">Status</p><p className="font-medium text-gray-900 capitalize">{property.status?.replace('-', ' ') || 'Available'}</p></div>
              <div><p className="text-gray-500">Facing</p><p className="font-medium text-gray-900">{property.facing || 'East'}</p></div>
              <div><p className="text-gray-500">Furnishing</p><p className="font-medium text-gray-900">{property.furnishing || 'Semi-Furnished'}</p></div>
              <div><p className="text-gray-500">Listing Type</p><p className="font-medium text-gray-900 capitalize">{isRent ? 'Rental' : 'Sale'}</p></div>
            </div>
          </div>

          {/* Star Rating */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Rate This Property</h3>
            {!isAuthenticated ? (
              <p className="text-sm text-gray-500">Please <a href="/auth" className="text-nexus-600 underline">login</a> to rate this property.</p>
            ) : (
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(0)}
                    disabled={submittingRating}
                    className="transition-transform hover:scale-110"
                  >
                    <Star className={`w-7 h-7 transition-colors ${
                      star <= (hoverStar || ratingData.user_rating || 0)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300'
                    }`} />
                  </button>
                ))}
                {ratingData.user_rating && (
                  <span className="text-sm text-gray-500 ml-2">You rated {ratingData.user_rating}/5</span>
                )}
                {submittingRating && <Loader2 className="w-4 h-4 animate-spin text-nexus-600 ml-2" />}
              </div>
            )}
            {ratingData.rating_count > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                Average: {ratingData.avg_rating.toFixed(1)} ⭐ from {ratingData.rating_count} {ratingData.rating_count === 1 ? 'person' : 'people'}
              </p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-5">
            {isOwnProperty ? (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl text-blue-700">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">This is your property listing.</p>
              </div>
            ) : inquirySent ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl text-emerald-700">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">Your interest request has been sent! The owner will review and respond.</p>
              </div>
            ) : (
              <>
                {showInquiryBox ? (
                  <div className="space-y-3">
                    <textarea
                      value={inquiryMessage}
                      onChange={e => setInquiryMessage(e.target.value)}
                      placeholder="Hi, I'm interested in this property. I'd like to know more about..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-nexus-400 resize-none"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleSendInquiry}
                        disabled={sendingInquiry}
                        className="flex-1 flex items-center justify-center gap-2 bg-nexus-600 hover:bg-nexus-700 text-white py-3 rounded-2xl text-sm font-semibold transition-colors"
                      >
                        {sendingInquiry ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send Interest Request
                      </button>
                      <button onClick={() => setShowInquiryBox(false)} className="px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) { toast.error('Please login to contact the owner'); return }
                      setShowInquiryBox(true)
                    }}
                    className="w-full bg-nexus-600 hover:bg-nexus-700 text-white py-3.5 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Contact Owner
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
