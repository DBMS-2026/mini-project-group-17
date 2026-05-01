// ─── Realistic Real Estate Mock Data Generator ──────────────────────────────
// Generates event-driven, year-by-year property price data for Mumbai localities.
// Designed for consumption by Recharts <LineChart>.

export interface MarketTrendYearData {
  year: string;
  Andheri: number;
  Bandra: number;
  Colaba: number;
  Juhu: number;
  Powai: number;
  Worli: number;
}

type LocalityKey = "Andheri" | "Bandra" | "Colaba" | "Juhu" | "Powai" | "Worli";

const LOCALITIES: LocalityKey[] = ["Andheri", "Bandra", "Colaba", "Juhu", "Powai", "Worli"];

/**
 * Returns a random number between min and max (inclusive of min, exclusive of max).
 */
function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Generates a highly realistic array of objects representing average property
 * prices per sq ft (INR) across 6 Mumbai localities from 2010 to 2025.
 *
 * The model uses sequential year-by-year calculations with event-driven logic:
 *   - 2010:       Baseline prices reflecting real market conditions
 *   - 2011–2019:  Steady 4–8% annual appreciation
 *   - 2020:       COVID-19 crash (12–15% drop)
 *   - 2021:       Stagnant recovery (flat 2% growth)
 *   - 2022–2025:  Post-COVID boom (8–12% aggressive growth)
 */
export function generateMarketTrendData(): MarketTrendYearData[] {
  // ── 2010 Baseline Prices (₹/sqft) ──
  const basePrices: Record<LocalityKey, number> = {
    Powai: 15000,
    Andheri: 18000,
    Juhu: 30000,
    Bandra: 35000,
    Worli: 40000,
    Colaba: 45000,
  };

  const result: MarketTrendYearData[] = [];

  // Track current prices for sequential calculation
  const current: Record<LocalityKey, number> = { ...basePrices };

  for (let year = 2010; year <= 2025; year++) {
    if (year === 2010) {
      // Baseline year — use starting prices directly
      result.push({
        year: String(year),
        Andheri: current.Andheri,
        Bandra: current.Bandra,
        Colaba: current.Colaba,
        Juhu: current.Juhu,
        Powai: current.Powai,
        Worli: current.Worli,
      });
      continue;
    }

    // Determine the growth multiplier range based on the year
    for (const locality of LOCALITIES) {
      let multiplier: number;

      if (year >= 2011 && year <= 2019) {
        // Steady growth: 4% to 8%
        multiplier = randomBetween(1.04, 1.08);
      } else if (year === 2020) {
        // COVID-19 crash: 12% to 15% drop
        multiplier = randomBetween(0.85, 0.88);
      } else if (year === 2021) {
        // Stagnant recovery: flat 2%
        multiplier = 1.02;
      } else {
        // 2022–2025: Post-COVID boom: 8% to 12%
        multiplier = randomBetween(1.08, 1.12);
      }

      current[locality] = Math.floor(current[locality] * multiplier);
    }

    result.push({
      year: String(year),
      Andheri: current.Andheri,
      Bandra: current.Bandra,
      Colaba: current.Colaba,
      Juhu: current.Juhu,
      Powai: current.Powai,
      Worli: current.Worli,
    });
  }

  return result;
}

/** Pre-generated stable dataset for consistent renders (avoids re-randomizing on each render) */
export const MUMBAI_TREND_DATA: MarketTrendYearData[] = generateMarketTrendData();
