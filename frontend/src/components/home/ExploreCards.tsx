'use client'
import Link from 'next/link'
import { TrendingUp, Home, MapPin, BarChart3, ArrowRight, Building2, ArrowLeftRight } from 'lucide-react'

const exploreCards = [
  {
    icon: Home,
    title: 'Buy a Home',
    description: 'Explore apartments, villas, plots across India',
    href: '/properties',
    color: 'from-nexus-600 to-nexus-800',
    bg: 'bg-nexus-50',
    iconColor: 'text-nexus-600',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80',
  },
  {
    icon: Building2,
    title: 'Rent a Home',
    description: 'Find your perfect rental across top cities',
    href: '/rent',
    color: 'from-emerald-500 to-teal-700',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80',
  },
  {
    icon: TrendingUp,
    title: 'Invest in Real Estate',
    description: 'AI-backed insights for smart investments',
    href: '/insights',
    color: 'from-amber-500 to-orange-700',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
  },
  {
    icon: Home,
    title: 'Sell / Rent Your Property',
    description: 'List your property to millions of buyers',
    href: '/sell',
    color: 'from-purple-500 to-violet-700',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80',
  },
  {
    icon: ArrowLeftRight,
    title: 'City Swap',
    description: 'Swap your lease across cities seamlessly',
    href: '/swap',
    color: 'from-cyan-500 to-blue-700',
    bg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80',
    isNew: true,
  },
]

export default function ExploreCards() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-nexus-600 text-sm font-semibold tracking-widest uppercase mb-3">GET STARTED</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Explore Real Estate Options</h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            Everything you need to find, buy, rent, or invest in Indian real estate
          </p>
        </div>

        {/* Updated grid: changed lg:grid-cols-6 to lg:grid-cols-5 and added justify-center */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 justify-center">
          {exploreCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer bg-gray-100"
            >
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Changed bg-linear-to-t to bg-gradient-to-t for standard Tailwind support */}
              <div className={`absolute inset-0 bg-gradient-to-t ${card.color} opacity-80 group-hover:opacity-90 transition-opacity`} />

              <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                <card.icon className="w-6 h-6 text-white mb-2" />
                <h3 className="text-white font-semibold text-sm md:text-base leading-tight">
                  {card.title}
                </h3>
                {card.isNew && (
                  <span className="mt-1 inline-block bg-yellow-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase w-fit">
                    New
                  </span>
                )}
              </div>

              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}