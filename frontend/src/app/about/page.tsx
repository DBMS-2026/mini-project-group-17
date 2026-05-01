'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Building2, Users, TrendingUp, Shield, MapPin, Star,
  ArrowRight, CheckCircle2, Zap, Heart, Globe, Award
} from 'lucide-react'

// ── Counter animation hook ────────────────────────────────────────────────────
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(ease * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

// ── Intersection observer hook ─────────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// ── Stats data ─────────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Properties Listed', value: 12000, suffix: '+', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Happy Customers', value: 100000, suffix: '+', icon: <Users className="w-5 h-5" /> },
  { label: 'Cities Covered', value: 40, suffix: '+', icon: <MapPin className="w-5 h-5" /> },
  { label: 'Avg. Rating', value: 48, suffix: '/5', icon: <Star className="w-5 h-5" />, decimal: true },
]

// ── Team data ──────────────────────────────────────────────────────────────────
const TEAM = [
  { name: 'Rajan Patil', role: 'Co-founder & CEO', initials: 'AM', color: 'bg-nexus-100 text-nexus-700' },
  { name: 'Ajay Bole', role: 'Head of Product', initials: 'PS', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Kundan Band', role: 'Lead Engineer', initials: 'RV', color: 'bg-purple-100 text-purple-700' },
  { name: 'Milan Chopda', role: 'Sales Director', initials: 'RG', color: 'bg-rose-100 text-rose-700' },
  { name: 'Sayan Biswas', role: 'Head of Design', initials: 'SK', color: 'bg-amber-100 text-amber-700' },
]

// ── Values data ────────────────────────────────────────────────────────────────
const VALUES = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Trust First',
    desc: 'Every listing is verified. Every agent is screened. We protect buyers and sellers equally.',
    color: 'text-nexus-600', bg: 'bg-nexus-50', border: 'border-nexus-100',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Move Fast',
    desc: 'From search to site visit in hours. Our platform removes friction at every step.',
    color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'People Centric',
    desc: 'A home is more than a transaction. We listen, guide, and stay with you till you move in.',
    color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Pan-India Reach',
    desc: 'From metro high-rises to Tier-2 city plots — we cover every corner of India.',
    color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100',
  },
]

// ── Timeline data ──────────────────────────────────────────────────────────────
const TIMELINE = [
  { year: '2020', title: 'Founded', desc: 'NexusEstate started as a small proptech startup in Bangalore.' },
  { year: '2021', title: 'First 1,000 listings', desc: 'Expanded to Mumbai and Delhi NCR within 12 months.' },
  { year: '2022', title: 'AI Integration', desc: 'Launched AI price estimator and smart property recommendations.' },
  { year: '2023', title: 'City Swap Launch', desc: 'Introduced lease swaps for remote workers and urban nomads.' },
  { year: '2024', title: '1 Lakh users', desc: 'Crossed 1 lakh active users across 40+ Indian cities.' },
]

// ── Stat Counter Card ──────────────────────────────────────────────────────────
function StatCard({ stat, start }: { stat: typeof STATS[0]; start: boolean }) {
  const count = useCounter(stat.decimal ? stat.value : stat.value, 2000, start)
  const display = stat.decimal
    ? (count / 10).toFixed(1)
    : count >= 1000 ? `${(count / 1000).toFixed(0)}K` : count

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-xl bg-nexus-50 flex items-center justify-center text-nexus-600">
        {stat.icon}
      </div>
      <div className="text-center">
        <p className="text-3xl font-display font-bold text-gray-900">
          {display}{stat.suffix}
        </p>
        <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'mission' | 'vision' | 'story'>('mission')
  const { ref: statsRef, inView: statsInView } = useInView()
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const tabContent = {
    mission: {
      heading: 'Our Mission',
      text: 'Make modern real estate discovery accessible through smarter search, better market transparency, and seamless customer support — for every Indian, in every city.',
      icon: <TrendingUp className="w-5 h-5 text-nexus-600" />,
      points: ['Zero brokerage for direct buyers', 'RERA-verified listings only', 'AI-powered price transparency'],
    },
    vision: {
      heading: 'Our Vision',
      text: 'Build the leading digital destination for home seekers, listing professionals, and city swap travelers — making property search as simple as booking a flight.',
      icon: <Globe className="w-5 h-5 text-nexus-600" />,
      points: ['100+ cities by 2026', 'End-to-end digital transactions', 'India\'s most trusted proptech'],
    },
    story: {
      heading: 'Our Story',
      text: 'Born in Bangalore in 2020, NexusEstate was built by a team frustrated with opaque property deals. We believed buyers deserved better — so we built it.',
      icon: <Heart className="w-5 h-5 text-nexus-600" />,
      points: ['Founded by ex-IIIT engineers', 'Backed by leading VCs', 'Profitable since 2022'],
    },
  }

  const active = tabContent[activeTab]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-gray-50 relative">
      {/* Interactive background gradient */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div 
          className="absolute w-96 h-96 rounded-full bg-nexus-500/20 blur-3xl transition-transform duration-500 ease-out"
          style={{
            left: `${mousePosition.x - 200}px`,
            top: `${mousePosition.y - 200}px`,
          }}
        />
      </div>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-nexus-950 text-white py-24 px-6">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-nexus-700/20 blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-nexus-600/20 blur-3xl -translate-x-1/2 translate-y-1/2" />
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block text-nexus-300 text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full border border-nexus-700 bg-nexus-900/50">
            About NexusEstate
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-6">
            India's Most Trusted<br />
            <span className="text-nexus-300">Property Platform</span>
          </h1>
          <p className="text-nexus-200 text-lg leading-8 max-w-2xl mx-auto mb-10">
            We bring buyers, renters, sellers, and urban nomads together in one verified marketplace — making every property decision smarter, faster, and safer.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-5xl mx-auto px-6 -mt-8 relative z-10 bg-gradient-to-b from-transparent via-white/50 to-white rounded-3xl backdrop-blur-sm py-8 -mx-6 px-6" ref={statsRef}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(stat => (
            <StatCard key={stat.label} stat={stat} start={statsInView} />
          ))}
        </div>
      </section>

      {/* ── Mission / Vision / Story Tabs ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 bg-gradient-to-b from-blue-50/50 to-transparent rounded-3xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Tab switcher */}
          <div>
            <p className="text-nexus-600 text-xs font-semibold tracking-widest uppercase mb-4">Who We Are</p>
            <div className="flex gap-2 mb-8">
              {(['mission', 'vision', 'story'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize
                    ${activeTab === tab
                      ? 'bg-nexus-600 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-nexus-300'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 transition-all">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-nexus-50 flex items-center justify-center">
                  {active.icon}
                </div>
                <h2 className="font-display font-bold text-xl text-gray-900">{active.heading}</h2>
              </div>
              <p className="text-gray-600 text-sm leading-7 mb-6">{active.text}</p>
              <ul className="space-y-2">
                {active.points.map(pt => (
                  <li key={pt} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-nexus-500 shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Visual card */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden h-80 bg-nexus-950 relative">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
                alt="NexusEstate office"
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-nexus-600 flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">India's #1 Proptech</p>
                    <p className="text-nexus-300 text-xs">As rated by users, 2024</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['RERA Verified', 'Zero Brokerage', 'AI-Powered'].map(badge => (
                    <span key={badge} className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl border border-gray-100 shadow-lg p-4 w-44">
              <p className="text-xs text-gray-400 mb-1">Founded</p>
              <p className="font-display font-bold text-gray-900 text-lg">2020</p>
              <p className="text-xs text-nexus-600 mt-1">Bangalore, India</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-gradient-to-br from-white via-emerald-50/30 to-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-nexus-600 text-xs font-semibold tracking-widest uppercase mb-3">What Drives Us</p>
            <h2 className="font-display text-3xl font-bold text-gray-900">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES.map((val, i) => (
              <div
                key={val.title}
                onMouseEnter={() => setHoveredValue(i)}
                onMouseLeave={() => setHoveredValue(null)}
                className={`rounded-2xl border p-6 cursor-default transition-all duration-300
                  ${hoveredValue === i ? `${val.bg} ${val.border} shadow-md scale-[1.02]` : 'border-gray-100 bg-gray-50'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors
                  ${hoveredValue === i ? 'bg-white' : val.bg}`}>
                  <span className={val.color}>{val.icon}</span>
                </div>
                <h3 className="font-display font-semibold text-gray-900 text-lg mb-2">{val.title}</h3>
                <p className="text-sm text-gray-600 leading-6">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 bg-gradient-to-t from-amber-50/50 to-transparent rounded-3xl">
        <div className="text-center mb-12">
          <p className="text-nexus-600 text-xs font-semibold tracking-widest uppercase mb-3">Our Journey</p>
          <h2 className="font-display text-3xl font-bold text-gray-900">How We Got Here</h2>
        </div>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-nexus-100 hidden sm:block" />
          <div className="space-y-6">
            {TIMELINE.map((item, i) => (
              <div key={item.year} className="flex gap-6 items-start group">
                <div className="shrink-0 w-12 h-12 rounded-full bg-white border-2 border-nexus-200 group-hover:border-nexus-600 group-hover:bg-nexus-50 flex items-center justify-center transition-all z-10">
                  <span className="text-xs font-bold text-nexus-600">{item.year.slice(2)}</span>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-1 group-hover:border-nexus-200 group-hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-nexus-600">{item.year}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="bg-gradient-to-br from-white via-purple-50/20 to-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-nexus-600 text-xs font-semibold tracking-widest uppercase mb-3">The People</p>
            <h2 className="font-display text-3xl font-bold text-gray-900">Meet the Team</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {TEAM.map(member => (
              <div key={member.name}
                className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md hover:border-nexus-200 transition-all group">
                <div className={`w-16 h-16 rounded-2xl ${member.color} flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-110 transition-transform`}>
                  {member.initials}
                </div>
                <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
                <p className="text-xs text-gray-500 mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 bg-gradient-to-b from-slate-50 to-gray-50 rounded-3xl">
        <div className="rounded-3xl bg-nexus-950 p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }} />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-nexus-600/20 blur-3xl" />
          <div className="relative">
            <p className="text-nexus-300 text-xs font-semibold tracking-widest uppercase mb-4">Join Us</p>
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              Ready to find your next home?
            </h2>
            <p className="text-nexus-200 text-sm max-w-md mx-auto mb-8">
              Join over 1 lakh Indians who trust NexusEstate for buying, renting, selling, and swapping properties.
            </p>
          </div>
        </div>
      </section>

    </main>
  )
}
