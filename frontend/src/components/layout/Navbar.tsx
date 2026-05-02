'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import { useAppStore } from '@/store/useAppStore'
import { ChevronDown, Menu, X, User, Heart,
  LogOut, ArrowLeftRight, BarChart3,
  Home, Building2, Key, TrendingUp, MapPin, Settings } from 'lucide-react'
import NotificationBell from '@/components/layout/NotificationBell'
import ContactModal from '@/components/layout/ContactModal'

const navLinks = [
  {
    label: 'Buy',
    href: '/properties',
    dropdown: [
      { label: 'Apartments', href: '/properties?type=apartment', icon: Building2 },
      { label: 'Villas', href: '/properties?type=villa', icon: Home },
      { label: 'Builder Floors', href: '/properties?type=builder-floor', icon: Building2 },
      { label: 'Plots & Land', href: '/properties?type=plot', icon: MapPin },
      { label: 'New Launches', href: '/properties?status=new-launch', icon: TrendingUp },
    ],
  },
  {
    label: 'Rent',
    href: '/rent',
    dropdown: [
      { label: 'Residential', href: '/rent?type=residential', icon: Home },
      { label: 'PG / Co-living', href: '/rent?type=pg', icon: Key },
      { label: 'Commercial', href: '/rent?type=commercial', icon: Building2 },
    ],
  },
  { label: 'City Swap', href: '/swap', icon: ArrowLeftRight, highlight: true, badge: 'AI' },
  { label: 'Market Insights', href: '/market-insights', icon: BarChart3 },
  { label: 'Sell Property', href: '/sell' },
  { label: 'List Property', href: '/add-property', highlight: true, badge: 'Demo' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAppStore()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    setProfileOpen(false)
    logout()
    router.push('/')
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-md border-b border-gray-100'
          : 'bg-white/98 backdrop-blur-md border-b border-gray-100'
      }`}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-[60px] gap-4">

            {/* ── Logo ── */}
            <div className="flex-shrink-0">
              <Logo variant="dark" size="md" />
            </div>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden lg:flex items-center flex-1 gap-0">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.dropdown && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all ${
                        link.highlight
                          ? 'text-nexus-600 hover:bg-nexus-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {link.icon && <link.icon className="w-3.5 h-3.5 flex-shrink-0" />}
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                          link.badge === 'AI'
                            ? 'bg-nexus-600 text-white'
                            : 'bg-amber-400 text-amber-900'
                        }`}>
                          {link.badge}
                        </span>
                      )}
                      {link.dropdown && (
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${
                          activeDropdown === link.label ? 'rotate-180' : ''
                        }`} />
                      )}
                    </Link>

                  {/* Dropdown */}
                  {link.dropdown && (
                    <div className={`absolute top-full left-0 pt-1.5 transition-all duration-150 ${
                      activeDropdown === link.label
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 -translate-y-1 pointer-events-none'
                    }`}>
                      <div className="w-52 bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 py-1.5">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-600 hover:text-nexus-600 hover:bg-nexus-50 transition-colors"
                          >
                            <item.icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── Right Actions (pushed to end) ── */}
            <div className="hidden lg:flex items-center gap-1.5 ml-auto flex-shrink-0">

              {isAuthenticated ? (
                <>
                  <NotificationBell />
                  {/* Wishlist */}
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>

                  {/* Profile Dropdown — Click-based */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-nexus-500 flex items-center justify-center text-white text-xs font-bold">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-[13px] font-semibold text-white max-w-[80px] truncate">
                        {user?.name?.split(' ')[0]}
                      </span>
                      <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {profileOpen && (
                      <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 py-1.5 overflow-hidden">
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="font-semibold text-sm text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                        </div>
                        <Link
                          href="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-nexus-600 hover:bg-nexus-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-400" /> My Profile
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-nexus-600 hover:bg-nexus-50 transition-colors"
                        >
                          <Building2 className="w-4 h-4 text-gray-400" /> My Properties
                        </Link>
                        <div className="border-t border-gray-50 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth"
                    className="text-[13px] font-semibold text-gray-700 hover:text-nexus-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth?mode=register"
                    className="text-[13px] font-semibold bg-nexus-600 hover:bg-nexus-700 text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    Register Free
                  </Link>
                </div>
              )}
            </div>

            {/* ── Mobile Hamburger ── */}
            <button
              className="lg:hidden ml-auto p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 py-3 px-4 space-y-0.5 max-h-[80vh] overflow-y-auto shadow-xl">
            {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    link.highlight ? 'text-nexus-600 hover:bg-nexus-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                  {link.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                      link.badge === 'AI' ? 'bg-nexus-600 text-white' : 'bg-amber-400 text-amber-900'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
            ))}

            <div className="pt-3 border-t border-gray-100 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-600 font-medium">
                    Signed in as <strong>{user?.name}</strong>
                  </div>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50">
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 w-full text-left">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth" onClick={() => setMobileOpen(false)} className="block text-center py-3 border border-nexus-300 text-nexus-600 rounded-xl text-sm font-semibold">
                    Login
                  </Link>
                  <Link href="/auth?mode=register" onClick={() => setMobileOpen(false)} className="block text-center py-3 bg-nexus-600 text-white rounded-xl text-sm font-semibold">
                    Register Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      <div className="h-[60px]" />

      {contactModalOpen && (
        <ContactModal onClose={() => setContactModalOpen(false)} />
      )}
    </>
  )
}
