"use client";

import { useState } from "react";
import {
  BarChart3, MapPin, ArrowUpRight, ArrowDownRight,
  Newspaper, ExternalLink, Brain, Loader2, CheckCircle2,
  AlertTriangle, Sparkles, Home,
} from "lucide-react";
import { MARKET_STATS, PRICE_TREND_DATA, INDIAN_CITIES } from "@/lib/data";
import {
  predictValuation, getDesirabilityScore, analyzeFraud,
  type ValuationFeatures,
} from "@/lib/api";
import toast from "react-hot-toast";

const newsArticles = [
  { id: 1, title: "Indian real estate market sees record Rs 2.1 lakh crore transactions in Q1 2026", source: "Economic Times", date: "Apr 13, 2026", category: "Market News", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80" },
  { id: 2, title: "Hyderabad overtakes Bengaluru in new home launches for the first time since 2020", source: "Business Standard", date: "Apr 11, 2026", category: "City Report", image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80" },
  { id: 3, title: "RBI keeps repo rate unchanged; home loan EMIs remain stable", source: "Mint", date: "Apr 09, 2026", category: "Finance", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80" },
  { id: 4, title: "Mumbai luxury segment leads with 15 percent year-over-year price appreciation", source: "Times of India", date: "Apr 07, 2026", category: "Luxury Segment", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80" },
];

const categoryColors: Record<string, string> = {
  "Market News": "bg-nexus-100 text-nexus-700",
  "City Report": "bg-emerald-100 text-emerald-700",
  Finance: "bg-amber-100 text-amber-700",
  "Luxury Segment": "bg-purple-100 text-purple-700",
};

const defaultFeatures: ValuationFeatures = {
  city: "Mumbai", bedrooms: 2, bathrooms: 2, square_feet: 1000,
  year_built: 2015, has_swimming_pool: 0, has_gym: 0,
  has_clubhouse: 0, has_sports_ground: 0,
  dist_metro_km: 3, dist_bus_km: 1, dist_highway_km: 5,
};

interface AIResult {
  predicted_value: number;
  desirability_score: number;
  amenity_bonus: number;
  proximity_penalty: number;
  is_anomaly: boolean;
}

function formatINR(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function InsightsPage() {
  const maxTrendValue = Math.max(...PRICE_TREND_DATA.flatMap((p) => [p.Mumbai, p.Bangalore, p.Delhi, p.Hyderabad]));
  const maxListings = Math.max(...MARKET_STATS.map((s) => s.listings));

  const [features, setFeatures] = useState<ValuationFeatures>(defaultFeatures);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);

  function setF<K extends keyof ValuationFeatures>(key: K, val: ValuationFeatures[K]) {
    setFeatures((f) => ({ ...f, [key]: val }));
  }

  async function runValuation() {
    setLoading(true);
    setResult(null);
    try {
      const [val, des, fraud] = await Promise.all([
        predictValuation(features),
        getDesirabilityScore(features),
        analyzeFraud(features.square_feet * 8000, features.city),
      ]);
      setResult({
        predicted_value: val.predicted_value,
        desirability_score: des.desirability_score,
        amenity_bonus: des.breakdown.amenity_bonus,
        proximity_penalty: des.breakdown.proximity_penalty,
        is_anomaly: fraud.is_anomaly,
      });
      toast.success("AI valuation complete!");
    } catch {
      toast.error("AI Service unavailable. Make sure ai-service is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="nexus-gradient py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-4 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-nexus-300" />
            <div>
              <h1 className="font-display text-4xl font-bold text-white">Market Insights</h1>
              <p className="mt-1 text-nexus-200">AI-powered real estate analytics and news across India</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Mumbai Avg. Price", value: "Rs 25,000/sqft", change: "+8.5%", up: true },
              { label: "Bangalore Growth", value: "12.3% YoY", change: "Best performer", up: true },
              { label: "Delhi NCR Demand", value: "+18% QoQ", change: "High demand", up: true },
              { label: "Hyderabad Launches", value: "4,200 units", change: "Q1 2026", up: true },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
                <p className="mb-2 text-xs text-nexus-300">{stat.label}</p>
                <p className="font-display text-xl font-bold text-white">{stat.value}</p>
                <p className={`mt-1 flex items-center gap-1 text-xs ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
                  {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left col */}
          <div className="space-y-8 lg:col-span-2">
            {/* Price Trend Chart */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="font-display text-xl font-bold text-gray-900">Price Trends by City</h2>
              <p className="text-sm text-gray-500">Average price per sqft over the last 6 months</p>
              <div className="mt-6 space-y-5">
                {[
                  { key: "Mumbai", color: "bg-nexus-600" },
                  { key: "Bangalore", color: "bg-emerald-500" },
                  { key: "Delhi", color: "bg-amber-500" },
                  { key: "Hyderabad", color: "bg-violet-500" },
                ].map((series) => (
                  <div key={series.key}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-800">{series.key}</span>
                      <span className="text-gray-500">
                        {PRICE_TREND_DATA[0][series.key as keyof (typeof PRICE_TREND_DATA)[number]].toLocaleString()} → {" "}
                        {PRICE_TREND_DATA[PRICE_TREND_DATA.length - 1][series.key as keyof (typeof PRICE_TREND_DATA)[number]].toLocaleString()} Rs/sqft
                      </span>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {PRICE_TREND_DATA.map((point) => {
                        const value = point[series.key as keyof typeof point] as number;
                        const height = Math.max(18, Math.round((value / maxTrendValue) * 120));
                        return (
                          <div key={`${series.key}-${point.month}`} className="flex flex-col items-center gap-2">
                            <div className="flex h-32 items-end">
                              <div className={`${series.color} w-8 rounded-t-lg`} style={{ height }} title={`${point.month}: ${value.toLocaleString()} Rs/sqft`} />
                            </div>
                            <span className="text-xs text-gray-500">{point.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* City Listings */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="font-display text-xl font-bold text-gray-900">City-wise Active Listings</h2>
              <p className="mb-6 text-sm text-gray-500">Total property listings across major cities</p>
              <div className="space-y-4">
                {MARKET_STATS.map((stat) => (
                  <div key={stat.city}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-800">{stat.city}</span>
                      <span className="text-gray-500">{stat.listings.toLocaleString()} listings</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-nexus-600" style={{ width: `${(stat.listings / maxListings) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── AI VALUATION WIDGET ─────────────────────────────────────── */}
            <div className="rounded-2xl border-2 border-nexus-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-600">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-gray-900">AI Property Valuation</h2>
                  <p className="text-sm text-gray-500">Powered by RandomForest ML model (100k+ training rows)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* City */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">City</label>
                  <select value={features.city} onChange={(e) => setF("city", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-nexus-400">
                    {INDIAN_CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                {/* Bedrooms */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Bedrooms</label>
                  <input type="number" min={1} max={10} value={features.bedrooms}
                    onChange={(e) => setF("bedrooms", +e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-nexus-400" />
                </div>
                {/* Bathrooms */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Bathrooms</label>
                  <input type="number" min={1} max={10} value={features.bathrooms}
                    onChange={(e) => setF("bathrooms", +e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-nexus-400" />
                </div>
                {/* Square feet */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Area (sq ft)</label>
                  <input type="number" min={200} max={20000} value={features.square_feet}
                    onChange={(e) => setF("square_feet", +e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-nexus-400" />
                </div>
                {/* Year built */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Year Built</label>
                  <input type="number" min={1970} max={2025} value={features.year_built}
                    onChange={(e) => setF("year_built", +e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-nexus-400" />
                </div>
                {/* Metro distance */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Dist. to Metro (km)</label>
                  <input type="number" min={0} max={30} step={0.5} value={features.dist_metro_km}
                    onChange={(e) => setF("dist_metro_km", +e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-nexus-400" />
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-gray-600">Amenities</p>
                <div className="flex flex-wrap gap-3">
                  {([
                    ["has_swimming_pool", "Swimming Pool"],
                    ["has_gym", "Gym"],
                    ["has_clubhouse", "Clubhouse"],
                    ["has_sports_ground", "Sports Ground"],
                  ] as [keyof ValuationFeatures, string][]).map(([key, label]) => (
                    <label key={key} className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
                      <input type="checkbox" checked={features[key] === 1}
                        onChange={(e) => setF(key, e.target.checked ? 1 : 0)}
                        className="h-4 w-4 rounded accent-nexus-600" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={runValuation} disabled={loading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-nexus-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-nexus-700 disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Running ML Model..." : "Get AI Valuation"}
              </button>

              {/* Result */}
              {result && (
                <div className="mt-5 rounded-2xl border border-nexus-100 bg-nexus-50 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-nexus-600" />
                    <p className="font-semibold text-nexus-800">Valuation Complete</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-xl bg-white p-3 text-center shadow-sm">
                      <p className="text-xs text-gray-500">Predicted Value</p>
                      <p className="mt-1 text-lg font-bold text-nexus-700">{formatINR(result.predicted_value)}</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 text-center shadow-sm">
                      <p className="text-xs text-gray-500">Desirability</p>
                      <p className="mt-1 text-lg font-bold text-emerald-600">{result.desirability_score}/100</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 text-center shadow-sm">
                      <p className="text-xs text-gray-500">Amenity Bonus</p>
                      <p className="mt-1 text-lg font-bold text-amber-600">+{result.amenity_bonus} pts</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 text-center shadow-sm">
                      <p className="text-xs text-gray-500">Fraud Risk</p>
                      <p className={`mt-1 flex items-center justify-center gap-1 text-sm font-bold ${result.is_anomaly ? "text-red-600" : "text-emerald-600"}`}>
                        {result.is_anomaly ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        {result.is_anomaly ? "Anomaly" : "Normal"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-center text-xs text-gray-400">
                    AI predictions are directional estimates. Not financial advice.
                  </p>
                </div>
              )}
            </div>

            {/* News */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-gray-900">Latest Real Estate News</h2>
                <span className="text-sm font-medium text-nexus-500">Live feed</span>
              </div>
              <div className="space-y-4">
                {newsArticles.map((article) => (
                  <div key={article.id} className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex gap-4 p-4">
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                        <img src={article.image} alt={article.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[article.category]}`}>{article.category}</span>
                          <span className="text-xs text-gray-400">{article.date}</span>
                        </div>
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800 transition-colors group-hover:text-nexus-600">{article.title}</h3>
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
                          <Newspaper className="h-3 w-3" />{article.source}<ExternalLink className="ml-1 h-3 w-3" />
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-display font-bold text-gray-900">City Price Summary</h3>
              <div className="space-y-3">
                {MARKET_STATS.map((stat) => (
                  <div key={stat.city} className="flex items-center justify-between border-b border-gray-50 py-2 last:border-0">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-nexus-400" />
                      <span className="text-sm font-medium text-gray-800">{stat.city}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">Rs {stat.avgPrice.toLocaleString()}/sqft</p>
                      <p className={`flex items-center justify-end gap-0.5 text-xs ${stat.change > 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {stat.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {stat.change}% YoY
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-display font-bold text-gray-900">Market Sentiment</h3>
              {[
                { label: "Buyer Demand", value: 78, color: "bg-nexus-500" },
                { label: "New Supply", value: 62, color: "bg-emerald-500" },
                { label: "Price Growth", value: 85, color: "bg-amber-500" },
                { label: "Investor Interest", value: 91, color: "bg-purple-500" },
              ].map((item) => (
                <div key={item.label} className="mb-4 last:mb-0">
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-bold text-gray-900">{item.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-nexus-100 bg-nexus-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Home className="h-5 w-5 text-nexus-600" />
                <span className="text-sm font-semibold text-nexus-800">Quick Tip</span>
              </div>
              <p className="text-sm text-nexus-700">
                Use the AI Valuation tool to check if a listed property price matches its true market value before making an offer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
