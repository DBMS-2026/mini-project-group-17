'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Heart, MapPin, BedDouble, Bath, Maximize2, TrendingUp, ShieldCheck, Dumbbell, Waves, Users, Map, Train, Bus, Car } from 'lucide-react'
import type { Property } from '@/lib/data'
import { formatPrice, formatArea } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import PropertyDetailModal from '@/components/properties/PropertyDetailModal'

interface PropertyCardProps {
  property: Property
  isRent?: boolean
}

const tagColors: Record<string, string> = {
  'NEW LAUNCH': 'bg-nexus-600 text-white',
  'NEW ARRIVAL': 'bg-emerald-500 text-white',
  'FEATURED': 'bg-purple-600 text-white',
  'HOT': 'bg-red-500 text-white',
}

export default function PropertyCard({ property, isRent }: PropertyCardProps) {
  const { wishlist, toggleWishlist } = useAppStore()
  const isWishlisted = wishlist.includes(property.id)
  const [showDetail, setShowDetail] = useState(false)

  const avgRating = parseFloat(String((property as any).avg_rating || 0))
  const ratingCount = parseInt(String((property as any).rating_count || 0))

  return (
    <>
      <div className="property-card group">
        <div className="relative h-52 overflow-hidden">
          <img
            src={property.images?.[0] ?? property.image ?? 'https://placehold.co/1200x800/1e293b/94a3b8?text=Property'}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

          {property.tag && (
            <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-lg ${tagColors[property.tag]}`}>
              {property.tag}
            </span>
          )}

          {property.isRera && (
            <span className="absolute top-3 right-12 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5" />RERA
            </span>
          )}

          <button
            onClick={() => toggleWishlist(property.id)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all shadow-sm"
          >
            <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </button>

          {property.priceChange && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-bold">{property.priceChange}% in 1yr</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <div className="text-xl font-bold text-gray-900 mb-1">
                {formatPrice(property.price)}
                {isRent && <span className="text-sm font-normal text-gray-500">/mo</span>}
              </div>
              <h3 className="font-display font-semibold text-gray-800 mb-1 line-clamp-1">{property.title}</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 text-nexus-400 shrink-0" />
            <span className="line-clamp-1">{property.location || (property as any).city}</span>
          </div>

          <div className="flex items-center gap-4 py-3 border-t border-gray-100 flex-wrap">
            {property.bedrooms && (
              <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                <BedDouble className="w-4 h-4 text-nexus-400" />
                <span>{property.bedrooms} BHK</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                <Bath className="w-4 h-4 text-nexus-400" />
                <span>{property.bathrooms} Bath</span>
              </div>
            )}
            {property.area && (
              <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                <Maximize2 className="w-4 h-4 text-nexus-400" />
                <span>{formatArea(property.area)}</span>
              </div>
            )}
            {property.year_built && (
              <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                <span className="w-4 h-4 bg-nexus-100 text-nexus-600 rounded flex items-center justify-center text-[10px] font-bold">Y</span>
                <span>{property.year_built}</span>
              </div>
            )}
          </div>

        {/* AI Amenities & Distances */}
        <div className="py-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 mb-2">
            {property.has_pool && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1"><Waves size={10}/> Pool</span>}
            {property.has_gym && <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1"><Dumbbell size={10}/> Gym</span>}
            {property.has_clubhouse && <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1"><Users size={10}/> Club</span>}
            {property.has_sports_ground && <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1"><Map size={10}/> Sports</span>}
          </div>
          
          <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
            {property.dist_metro_km !== undefined && property.dist_metro_km !== null && (
              <span className="flex items-center gap-1"><Train size={12} className="text-gray-400"/> {property.dist_metro_km}km</span>
            )}
            {property.dist_bus_km !== undefined && property.dist_bus_km !== null && (
              <span className="flex items-center gap-1"><Bus size={12} className="text-gray-400"/> {property.dist_bus_km}km</span>
            )}
            {property.dist_highway_km !== undefined && property.dist_highway_km !== null && (
              <span className="flex items-center gap-1"><Car size={12} className="text-gray-400"/> {property.dist_highway_km}km</span>
            )}
          </div>
        </div>

          {/* Buttons — View Details opens modal, Contact also opens modal to inquiry section */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setShowDetail(true)}
              className="flex-1 text-center py-2.5 bg-nexus-50 hover:bg-nexus-100 text-nexus-700 font-medium text-sm rounded-xl transition-colors"
            >
              View Details
            </button>
            <button
              onClick={() => setShowDetail(true)}
              className="flex-1 py-2.5 bg-nexus-600 hover:bg-nexus-700 text-white font-medium text-sm rounded-xl transition-colors"
            >
              Contact Owner
            </button>
          </div>
        </div>
      </div>

      {/* Property Detail Modal */}
      {showDetail && (
        <PropertyDetailModal
          property={property}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  )
}