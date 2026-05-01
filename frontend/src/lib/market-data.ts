// ─── Market Insights: API Contract & Types ────────────────────────────────────

import aiMarketData from "../data/market_trends.json";

export interface MarketKPI {
  avgPricePerSqft: number;
  yoyGrowth: number;
  avgDaysOnMarket: number;
  avgArbitrageYield: number;
}

export interface LocalityData {
  name: string;
  avgPrice: number;
  category: "expensive" | "affordable";
}

export interface TrendPoint {
  year: string;
  [key: string]: any;
}

export interface UndervaluedProperty {
  id: string;
  title: string;
  thumbnail: string;
  bhk: number;
  sqft: number;
  askingPrice: number;
  aiPredictedPrice: number;
  locality: string;
}

export interface MarketKPIResponse {
  success: boolean;
  data: MarketKPI;
}

export interface MarketTrendsResponse {
  success: boolean;
  data: {
    trendPoints: any[]; // Using any[] to accommodate dynamic locality keys (e.g., "Bandra Historical")
    localities: LocalityData[];
  };
}

export interface MarketOpportunitiesResponse {
  success: boolean;
  data: {
    properties: UndervaluedProperty[];
  };
}

export type CityKey = "mumbai" | "bangalore" | "delhi-ncr" | "hyderabad" | "pune" | "chennai" | "gurgaon" | "noida";
export type MarketType = "buy" | "rent";

export const CITY_OPTIONS: { value: CityKey; label: string }[] = [
  { value: "mumbai", label: "Mumbai" },
  { value: "bangalore", label: "Bangalore" },
  { value: "delhi-ncr", label: "Delhi NCR" },
  { value: "hyderabad", label: "Hyderabad" },
  { value: "pune", label: "Pune" },
  { value: "chennai", label: "Chennai" },
  { value: "gurgaon", label: "Gurgaon" },
  { value: "noida", label: "Noida" },
];

// ─── Opportunities Mock (Since our ML model only did trends for now) ────────

const mockOpportunities: Record<CityKey, UndervaluedProperty[]> = {
  mumbai: [
    { id: "uv-1", title: "Sea-facing 3BHK", thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80", bhk: 3, sqft: 1450, askingPrice: 18500000, aiPredictedPrice: 22800000, locality: "Versova" },
    { id: "uv-2", title: "Renovated 2BHK", thumbnail: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80", bhk: 2, sqft: 980, askingPrice: 12000000, aiPredictedPrice: 14500000, locality: "Andheri" },
    { id: "uv-3", title: "Corner Unit 2BHK", thumbnail: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80", bhk: 2, sqft: 890, askingPrice: 6800000, aiPredictedPrice: 8200000, locality: "Thane" },
  ],
  bangalore: [
    { id: "uv-1", title: "Garden-view 3BHK", thumbnail: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80", bhk: 3, sqft: 1600, askingPrice: 14200000, aiPredictedPrice: 17800000, locality: "HSR Layout" },
    { id: "uv-2", title: "Compact 1BHK", thumbnail: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80", bhk: 1, sqft: 650, askingPrice: 4500000, aiPredictedPrice: 5600000, locality: "Marathahalli" },
    { id: "uv-3", title: "Duplex Villa", thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80", bhk: 4, sqft: 2200, askingPrice: 19500000, aiPredictedPrice: 24000000, locality: "Sarjapur" },
  ],
  "delhi-ncr": [
    { id: "uv-1", title: "Builder Floor", thumbnail: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=400&q=80", bhk: 3, sqft: 1350, askingPrice: 11000000, aiPredictedPrice: 13500000, locality: "Dwarka" },
    { id: "uv-2", title: "Studio Apartment", thumbnail: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80", bhk: 1, sqft: 520, askingPrice: 3200000, aiPredictedPrice: 4100000, locality: "Noida" },
    { id: "uv-3", title: "Premium 4BHK", thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80", bhk: 4, sqft: 2400, askingPrice: 28000000, aiPredictedPrice: 34500000, locality: "Saket" },
  ],
  hyderabad: [
    { id: "uv-1", title: "Modern 3BHK", thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80", bhk: 3, sqft: 1650, askingPrice: 13500000, aiPredictedPrice: 15800000, locality: "Gachibowli" },
    { id: "uv-2", title: "Luxury 4BHK", thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80", bhk: 4, sqft: 2800, askingPrice: 32000000, aiPredictedPrice: 38000000, locality: "Jubilee Hills" },
    { id: "uv-3", title: "Compact 2BHK", thumbnail: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80", bhk: 2, sqft: 1100, askingPrice: 6500000, aiPredictedPrice: 7800000, locality: "Kukatpally" },
  ],
  pune: [
    { id: "uv-1", title: "Hilltop 3BHK", thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80", bhk: 3, sqft: 1500, askingPrice: 9500000, aiPredictedPrice: 12200000, locality: "Baner" },
    { id: "uv-2", title: "Garden 2BHK", thumbnail: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80", bhk: 2, sqft: 1100, askingPrice: 6800000, aiPredictedPrice: 8400000, locality: "Kharadi" },
    { id: "uv-3", title: "Smart 1BHK", thumbnail: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80", bhk: 1, sqft: 620, askingPrice: 3200000, aiPredictedPrice: 4100000, locality: "Hinjewadi" },
  ],
  chennai: [
    { id: "uv-1", title: "Sea-facing 3BHK", thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80", bhk: 3, sqft: 1800, askingPrice: 22000000, aiPredictedPrice: 26500000, locality: "Adyar" },
    { id: "uv-2", title: "IT Corridor 2BHK", thumbnail: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80", bhk: 2, sqft: 1050, askingPrice: 5800000, aiPredictedPrice: 7200000, locality: "OMR" },
    { id: "uv-3", title: "Premium 4BHK", thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80", bhk: 4, sqft: 2600, askingPrice: 38000000, aiPredictedPrice: 45000000, locality: "Boat Club" },
  ],
  gurgaon: [
    { id: "uv-1", title: "Golf Course 4BHK", thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80", bhk: 4, sqft: 3200, askingPrice: 45000000, aiPredictedPrice: 52000000, locality: "Golf Course Road" },
    { id: "uv-2", title: "Luxury 3BHK", thumbnail: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=400&q=80", bhk: 3, sqft: 2100, askingPrice: 28000000, aiPredictedPrice: 33500000, locality: "Cyber City" },
    { id: "uv-3", title: "Affordable 2BHK", thumbnail: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80", bhk: 2, sqft: 1200, askingPrice: 9500000, aiPredictedPrice: 11500000, locality: "Sohna Road" },
  ],
  noida: [
    { id: "uv-1", title: "Premium 3BHK", thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80", bhk: 3, sqft: 1750, askingPrice: 16500000, aiPredictedPrice: 19800000, locality: "Sector 15" },
    { id: "uv-2", title: "Park View 2BHK", thumbnail: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80", bhk: 2, sqft: 1150, askingPrice: 8200000, aiPredictedPrice: 10500000, locality: "Sector 50" },
    { id: "uv-3", title: "Extension 2BHK", thumbnail: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80", bhk: 2, sqft: 950, askingPrice: 4200000, aiPredictedPrice: 5500000, locality: "Noida Extension" },
  ],
};


// ─── API Fetchers ──────────────────────────────────────────────────────────

export async function fetchMarketKPIs(city: CityKey, type: MarketType): Promise<MarketKPIResponse> {
  await new Promise((r) => setTimeout(r, 100)); // Simulating network
  
  // Calculate dynamic KPIs from the AI dataset
  const cityData = (aiMarketData as any)[city];
  const localities = cityData?.localities || [];
  
  // Average price across top 6 localities
  const avgPrice = localities.reduce((sum: number, l: any) => sum + l.avgPrice, 0) / (localities.length || 1);
  
  return {
    success: true,
    data: {
      avgPricePerSqft: Math.round(type === "rent" ? avgPrice / 300 : avgPrice),
      yoyGrowth: city === "mumbai" ? 8.5 : city === "bangalore" ? 12.3 : 7.4, // Keep some hardcoded logic for KPIs not in dataset
      avgDaysOnMarket: 42,
      avgArbitrageYield: 12.4
    },
  };
}

export async function fetchMarketTrends(city: CityKey, type: MarketType, timeframe: string): Promise<MarketTrendsResponse> {
  await new Promise((r) => setTimeout(r, 100)); // Simulating network
  
  const cityData = (aiMarketData as any)[city];
  
  if (!cityData) {
    return { success: false, data: { trendPoints: [], localities: [] } };
  }

  // If "rent", we just divide prices by 300 to simulate rental yields for the chart
  let trendPoints = cityData.trendPoints;
  let localities = cityData.localities;
  
  if (type === "rent") {
    trendPoints = trendPoints.map((tp: any) => {
      const newTp = { ...tp };
      for (const key in newTp) {
        if (key !== "year" && typeof newTp[key] === "number") {
          newTp[key] = Math.round(newTp[key] / 300);
        }
      }
      return newTp;
    });
    
    localities = localities.map((l: any) => ({
      ...l,
      avgPrice: Math.round(l.avgPrice / 300)
    }));
  }

  return {
    success: true,
    data: {
      trendPoints: trendPoints,
      localities: localities,
    },
  };
}

export async function fetchMarketOpportunities(city: CityKey): Promise<MarketOpportunitiesResponse> {
  await new Promise((r) => setTimeout(r, 100)); // Simulating network
  return {
    success: true,
    data: {
      properties: mockOpportunities[city] || mockOpportunities.mumbai,
    },
  };
}
