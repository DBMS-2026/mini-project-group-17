'use client'

import { useState } from 'react'
import {
  Send, Phone, Mail, MapPin, MessageCircle,
  CheckCircle2, Clock, ChevronDown, ChevronUp,
  Headphones, Building2, ArrowRight
} from 'lucide-react'

// ── FAQ Data ──────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'How quickly will I get a response?',
    a: 'Our team typically responds within 1 business hour on weekdays. For urgent property inquiries, use the WhatsApp button for instant support.',
  },
  {
    q: 'Can I schedule a property site visit?',
    a: 'Yes! Mention the property name in your message and we\'ll coordinate a free site visit at your convenience within 24 hours.',
  },
  {
    q: 'Do you charge any brokerage fee?',
    a: 'Zero brokerage for direct buyer-seller connections. For agent-assisted transactions, fees are clearly disclosed upfront.',
  },
  {
    q: 'How does the City Swap service work?',
    a: 'City Swap lets you exchange your current lease with someone in another city. Contact our swap advisors and they\'ll match you within 48 hours.',
  },
]

// ── Contact Channels ──────────────────────────────────────────────────────────
const CHANNELS = [
  {
    icon: <Phone className="w-5 h-5" />,
    label: 'Call Us',
    value: '+91 98765 43210',
    sub: 'Mon–Sat, 9am–7pm',
    href: 'tel:+919876543210',
    color: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
    text: 'text-cyan-700',
  },
  {
    icon: <MessageCircle className="w-5 h-5" />,
    label: 'WhatsApp',
    value: '+91 98765 43210',
    sub: 'Instant response',
    href: 'https://wa.me/919876543210?text=Hi%2C%20I%20need%20help%20with%20a%20property%20on%20NexusEstate',
    color: 'from-emerald-400 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    text: 'text-emerald-700',
  },
  {
    icon: <Mail className="w-5 h-5" />,
    label: 'Email Us',
    value: 'hello@nexusestate.in',
    sub: 'Reply within 2 hours',
    href: 'mailto:hello@nexusestate.in',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    text: 'text-blue-700',
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    label: 'Visit Us',
    value: 'Koramangala, Bangalore',
    sub: '560034, Karnataka',
    href: 'https://maps.google.com',
    color: 'from-violet-500 to-purple-700',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    text: 'text-violet-700',
  },
]

// ── Topic options ─────────────────────────────────────────────────────────────
const TOPICS = [
  'Buy a Property', 'Rent a Property', 'Sell / List Property',
  'City Swap', 'Price Valuation', 'Agent Support', 'Other',
]

// ── FAQ Item ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden
        ${open ? 'border-cyan-200 bg-cyan-50/50' : 'border-gray-100 bg-white hover:border-cyan-100'}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
      >
        <span className={`text-sm font-medium transition-colors ${open ? 'text-cyan-700' : 'text-gray-800'}`}>
          {q}
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-cyan-500 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-gray-600 leading-6">{a}</p>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', topic: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  const u = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const canSubmit = form.name && form.email && form.message

  const handleSubmit = () => {
    if (!canSubmit) return
    setSubmitted(true)
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200
    ${focused === field
      ? 'border-cyan-400 ring-2 ring-cyan-100 bg-white'
      : 'border-gray-200 bg-gray-50 hover:border-cyan-200'}`

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 30%, #ffffff 70%)' }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-16 pb-12 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-blue-200/20 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-700 text-xs font-semibold mb-6">
            <Headphones className="w-3.5 h-3.5" />
            We're here to help · Usually responds in 1hr
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Let's find your<br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #0891b2, #2563eb)' }}>
              perfect home together
            </span>
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto leading-7">
            Reach out for property inquiries, swap support, or personalized recommendations from our local experts.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-8">

        {/* ── Contact Channels ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CHANNELS.map(ch => (
            <a key={ch.label} href={ch.href}
              target={ch.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className={`group flex flex-col gap-3 p-4 rounded-2xl border ${ch.bg} ${ch.border} hover:shadow-md transition-all hover:-translate-y-0.5`}
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center text-white shadow-sm`}>
                {ch.icon}
              </div>
              <div>
                <p className={`text-xs font-semibold ${ch.text}`}>{ch.label}</p>
                <p className="text-xs text-gray-700 font-medium mt-0.5 leading-tight">{ch.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{ch.sub}</p>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 ${ch.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </a>
          ))}
        </div>

        {/* ── Form + Side Info ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-cyan-50 border-4 border-cyan-100 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-8 h-8 text-cyan-500" />
                </div>
                <h2 className="font-display font-bold text-xl text-gray-900 mb-2">Message Sent!</h2>
                <p className="text-gray-500 text-sm max-w-xs leading-6">
                  Thanks <span className="font-semibold text-gray-700">{form.name}</span>! We'll get back to you at <span className="font-semibold text-gray-700">{form.email}</span> within 1 hour.
                </p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', topic: '', message: '' }) }}
                  className="mt-6 px-5 py-2.5 rounded-xl border border-cyan-200 text-cyan-700 text-sm font-medium hover:bg-cyan-50 transition">
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="font-display font-bold text-xl text-gray-900">Send us a message</h2>
                  <p className="text-gray-400 text-xs mt-1">All fields marked * are required</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Name <span className="text-cyan-500">*</span>
                      </label>
                      <input placeholder="Rajesh Kumar" value={form.name}
                        onChange={e => u('name', e.target.value)}
                        onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                        className={inputClass('name')} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Email <span className="text-cyan-500">*</span>
                      </label>
                      <input placeholder="you@example.com" type="email" value={form.email}
                        onChange={e => u('email', e.target.value)}
                        onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                        className={inputClass('email')} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone</label>
                      <input placeholder="+91 98765 43210" type="tel" value={form.phone}
                        onChange={e => u('phone', e.target.value)}
                        onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                        className={inputClass('phone')} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Topic</label>
                      <select value={form.topic} onChange={e => u('topic', e.target.value)}
                        onFocus={() => setFocused('topic')} onBlur={() => setFocused(null)}
                        className={inputClass('topic')}>
                        <option value="">Select a topic</option>
                        {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Message <span className="text-cyan-500">*</span>
                    </label>
                    <textarea rows={5} placeholder="Tell us what you're looking for — property type, city, budget, or any specific questions..."
                      value={form.message} onChange={e => u('message', e.target.value)}
                      onFocus={() => setFocused('message')} onBlur={() => setFocused(null)}
                      className={`${inputClass('message')} resize-none`} />
                    <p className="text-right text-[10px] text-gray-300">{form.message.length} chars</p>
                  </div>

                  <button onClick={handleSubmit} disabled={!canSubmit}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all
                      disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: canSubmit
                        ? 'linear-gradient(135deg, #0891b2, #2563eb)'
                        : '#e5e7eb',
                      color: canSubmit ? 'white' : '#9ca3af',
                      boxShadow: canSubmit ? '0 4px 20px rgba(8,145,178,0.3)' : 'none',
                    }}>
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Side Info */}
          <div className="lg:col-span-2 space-y-4">

            {/* Office hours */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-cyan-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Office Hours</h3>
              </div>
              <div className="space-y-2">
                {[
                  { day: 'Monday – Friday', time: '9:00 AM – 7:00 PM' },
                  { day: 'Saturday', time: '10:00 AM – 5:00 PM' },
                  { day: 'Sunday', time: 'WhatsApp only' },
                ].map(({ day, time }) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{day}</span>
                    <span className="text-xs font-medium text-gray-800">{time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Our offices */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Our Offices</h3>
              </div>
              <div className="space-y-3">
                {[
                  { city: 'Bangalore (HQ)', addr: 'Koramangala, 560034' },
                  { city: 'Mumbai', addr: 'Bandra West, 400050' },
                  { city: 'Delhi NCR', addr: 'Cyber City, Gurgaon' },
                ].map(({ city, addr }) => (
                  <div key={city} className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{city}</p>
                      <p className="text-[10px] text-gray-400">{addr}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a href="https://wa.me/919876543210?text=Hi%2C%20I%20need%20help%20with%20a%20property"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 transition text-white group">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Chat on WhatsApp</p>
                <p className="text-[10px] text-emerald-100">Instant support · No waiting</p>
              </div>
              <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </a>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="mb-6">
            <p className="text-cyan-600 text-xs font-semibold tracking-widest uppercase mb-2">Quick Answers</p>
            <h2 className="font-display font-bold text-xl text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </div>

      </div>
    </main>
  )
}
