"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, TrendingDown, MapPin, Building, Clock, Percent,
  IndianRupee, Sparkles, BarChart3, Brain, ArrowUpRight,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  fetchMarketKPIs, fetchMarketTrends, fetchMarketOpportunities, CITY_OPTIONS,
  type CityKey, type MarketType, type MarketKPI, type TrendPoint,
  type LocalityData, type UndervaluedProperty,
} from "@/lib/market-data";

function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatPriceSqft(n: number, type: MarketType): string {
  return type === "rent" ? `₹${n}/sqft/mo` : `₹${n.toLocaleString("en-IN")}/sqft`;
}

/* ── KPI Card ─────────────────────────────────────────────────────────────── */

const kpiAccents = [
  { border: "border-l-blue-500", bg: "bg-blue-50", text: "text-blue-600" },
  { border: "border-l-emerald-500", bg: "bg-emerald-50", text: "text-emerald-600" },
  { border: "border-l-amber-500", bg: "bg-amber-50", text: "text-amber-600" },
  { border: "border-l-violet-500", bg: "bg-violet-50", text: "text-violet-600" },
];

function KPICard({ title, value, icon: Icon, trend, suffix, accent }: {
  title: string; value: string; icon: React.ComponentType<{ className?: string }>;
  trend?: number; suffix?: string; accent: typeof kpiAccents[0];
}) {
  const isPositive = (trend ?? 0) >= 0;
  return (
    <Card className={`border-l-4 ${accent.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <p className="text-sm font-bold uppercase tracking-wider text-gray-600">{title}</p>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent.bg}`}>
          <Icon className={`h-5 w-5 ${accent.text}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {value}
          {suffix && <span className="ml-1.5 text-base font-medium text-gray-400">{suffix}</span>}
        </div>
        {trend !== undefined && (
          <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
          }`}>
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {isPositive ? "+" : ""}{trend}% vs last year
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Chart Tooltip ────────────────────────────────────────────────────────── */

function ChartTooltip({ active, payload, label, isBuy }: {
  active?: boolean; payload?: Array<{ value: number; name: string; color: string }>;
  label?: string; isBuy: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-2xl">
      <p className="text-xs font-bold text-gray-900 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm mb-1">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-500 font-medium">{entry.name}:</span>
          <span className="font-bold text-gray-900">
            {isBuy ? `₹${entry.value.toLocaleString("en-IN")}` : `₹${entry.value}/sqft`}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Opportunity Card ─────────────────────────────────────────────────────── */

function OpportunityCard({ property }: { property: UndervaluedProperty }) {
  const savings = property.aiPredictedPrice - property.askingPrice;
  const savingsPercent = ((savings / property.aiPredictedPrice) * 100).toFixed(1);
  return (
    <Card className="group overflow-hidden border-gray-200 hover:shadow-xl hover:border-nexus-300 transition-all duration-300 hover:-translate-y-1">
      <div className="flex gap-4 p-5">
        <div className="h-28 w-32 shrink-0 overflow-hidden rounded-xl relative">
          <img src={property.thumbnail} alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute top-2 left-2">
            <Badge variant="success" className="text-[11px] font-bold shadow-md">
              <ArrowUpRight className="mr-0.5 h-3 w-3" />{savingsPercent}% below
            </Badge>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-bold text-gray-900 mb-1">{property.title}</h4>
          <div className="mb-2 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 text-nexus-500" />{property.locality}
          </div>
          <div className="flex gap-3 text-sm text-gray-600 font-medium mb-3">
            <span className="bg-gray-100 px-2.5 py-0.5 rounded-lg">{property.bhk} BHK</span>
            <span className="bg-gray-100 px-2.5 py-0.5 rounded-lg">{property.sqft.toLocaleString()} sqft</span>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <div>
              <span className="text-gray-400 text-xs">Asking</span>
              <p className="font-bold text-gray-800 text-base">{formatINR(property.askingPrice)}</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <span className="text-gray-400 text-xs flex items-center gap-1">
                <Brain className="h-3 w-3 text-nexus-500" />AI Value
              </span>
              <p className="font-bold text-emerald-600 text-base">{formatINR(property.aiPredictedPrice)}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */

export default function MarketInsightsPage() {
  const [marketType, setMarketType] = useState<MarketType>("buy");
  const [city, setCity] = useState<CityKey>("mumbai");
  const [timeframe, setTimeframe] = useState("1y");
  const [kpis, setKpis] = useState<MarketKPI | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [localities, setLocalities] = useState<LocalityData[]>([]);
  const [opportunities, setOpportunities] = useState<UndervaluedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [kpiRes, trendRes, oppRes] = await Promise.all([
        fetchMarketKPIs(city, marketType),
        fetchMarketTrends(city, marketType, timeframe),
        fetchMarketOpportunities(city),
      ]);
      if (kpiRes.success) setKpis(kpiRes.data);
      if (trendRes.success) { setTrends(trendRes.data.trendPoints); setLocalities(trendRes.data.localities); }
      if (oppRes.success) setOpportunities(oppRes.data.properties);
    } catch (error) { console.error("Failed to load market data:", error); }
    finally { setLoading(false); }
  }, [city, marketType, timeframe]);

  useEffect(() => { loadData(); }, [loadData]);

  // The ML JSON already has properties formatted correctly, so we can use trends directly.
  const forecastData = trends;
  const localityNames = localities.map(l => l.name);
  const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6"];

  const expensiveLocalities = localities.filter((l) => l.category === "expensive").sort((a, b) => b.avgPrice - a.avgPrice);
  const affordableLocalities = localities.filter((l) => l.category === "affordable").sort((a, b) => a.avgPrice - b.avgPrice);
  const localityChartData = [...expensiveLocalities, ...affordableLocalities];

  const cityLabel = CITY_OPTIONS.reduce((acc, c) => { acc[c.value] = c.label; return acc; }, {} as Record<string, string>);
  const isBuy = marketType === "buy";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero Header ── */}
      <div className="nexus-gradient">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/10">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Market Insights
                </h1>
                <p className="mt-1 text-base text-nexus-100">
                  AI-powered analytics for <span className="text-white font-bold">{cityLabel[city]}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Tabs value={marketType} onValueChange={(v) => setMarketType(v as MarketType)}>
                <TabsList className="bg-white/15 backdrop-blur-sm border border-white/10 p-1">
                  <TabsTrigger value="buy" className="text-white/80 data-[state=active]:text-black font-bold px-5">
                    Buy Market
                  </TabsTrigger>
                  <TabsTrigger value="rent" className="text-white/80 data-[state=active]:text-black font-bold px-5">
                    Rent Market
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={city} onValueChange={(v) => setCity(v as CityKey)} className="w-44">
                {CITY_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </Select>
              <Select value={timeframe} onValueChange={setTimeframe} className="w-32">
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="3y">3 Years</SelectItem>
                <SelectItem value="5y">5 Years</SelectItem>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 -mt-6 pb-16">
        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* KPI Cards */}
        {!loading && kpis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            <KPICard title="Avg Price / Sqft" value={formatPriceSqft(kpis.avgPricePerSqft, marketType)}
              icon={IndianRupee} trend={kpis.yoyGrowth} accent={kpiAccents[0]} />
            <KPICard title="YoY Growth" value={`${kpis.yoyGrowth > 0 ? "+" : ""}${kpis.yoyGrowth}%`}
              icon={kpis.yoyGrowth >= 0 ? TrendingUp : TrendingDown} accent={kpiAccents[1]} />
            <KPICard title="Arbitrage Yield" value={`${kpis.avgArbitrageYield}%`}
              icon={Percent} accent={kpiAccents[3]} />
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Area Chart */}
          <Card className="lg:col-span-2 border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="h-5 w-5 text-amber-500" />Price Trends & AI Forecast
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    Historical prices with ML-predicted trajectory for {cityLabel[city]}
                  </CardDescription>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-8 rounded-full bg-blue-500" />
                    <span className="text-gray-600">Historical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-8 rounded-full bg-amber-500" />
                    <span className="text-gray-600">AI Predicted</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => isBuy ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`} />
                    <Tooltip content={<ChartTooltip isBuy={isBuy} />} />
                    
                    {localityNames.flatMap((loc, i) => [
                        <Line key={`${loc}-hist`} type="monotone" dataKey={`${loc} Historical`} name={loc} stroke={COLORS[i % COLORS.length]} strokeWidth={3}
                          dot={{ r: 3, fill: COLORS[i % COLORS.length], strokeWidth: 1, stroke: "#fff" }}
                          activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }} connectNulls={false} />,
                        
                        <Line key={`${loc}-pred`} type="monotone" dataKey={`${loc} Predicted`} name={`${loc} (AI)`} stroke={COLORS[i % COLORS.length]} strokeWidth={2.5}
                          strokeDasharray="5 5" dot={{ r: 2.5, fill: COLORS[i % COLORS.length], strokeWidth: 1, stroke: "#fff" }}
                          activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }} connectNulls={false} />
                    ])}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Building className="h-5 w-5 text-nexus-500" />Locality Breakdown
              </CardTitle>
              <CardDescription>Most expensive vs affordable areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={localityChartData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#334155", fontWeight: 600 }}
                      axisLine={false} tickLine={false} width={100} />
                    <Tooltip formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}/sqft`, "Avg Price"]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", fontSize: "13px", fontWeight: 600 }} />
                    <Bar dataKey="avgPrice" radius={[0, 8, 8, 0]} barSize={20}>
                      {localityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.category === "expensive" ? "#3b82f6" : "#22c55e"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-center gap-6 text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-6 rounded-full bg-blue-500" />
                  <span className="text-gray-600">Premium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-6 rounded-full bg-emerald-500" />
                  <span className="text-gray-600">Affordable</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Undervalued Properties */}
        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Brain className="h-5 w-5 text-nexus-500" />Most Undervalued Properties
                </CardTitle>
                <CardDescription className="mt-1 text-sm">
                  AI detected these listings priced below market value in {cityLabel[city]}
                </CardDescription>
              </div>
              <Badge variant="default" className="hidden sm:inline-flex text-sm px-3 py-1">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />AI Picks
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {opportunities.map((p) => <OpportunityCard key={p.id} property={p} />)}
            </div>
          </CardContent>
        </Card>

        <p className="mt-10 text-center text-sm text-gray-400 font-medium">
          Market data is refreshed daily. AI predictions are directional estimates and should not be treated as financial advice.
          <br />Powered by NexusEstate ML Engine.
        </p>
      </div>
    </div>
  );
}
