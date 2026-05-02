"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Grid3X3, List, Loader2, Sparkles, Waves, Dumbbell, Users, Map } from "lucide-react";
import { fetchProperties, rankProperties } from "@/lib/api";
import type { Property } from "@/lib/data";
import PropertyCard from "@/components/properties/PropertyCard";
import FilterSidebar, { FilterState, defaultFilters } from "@/components/properties/FilterSidebar";

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "area-asc", label: "Area: Low to High" },
];

export default function PropertiesPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sort, setSort] = useState("relevance");
  const [searchQ, setSearchQ] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [rankedIds, setRankedIds] = useState<string[]>([]);
  const [isRanking, setIsRanking] = useState(false);

  useEffect(() => {
    // Read search params from URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      const city = params.get('city');
      if (q) setSearchQ(q);
      if (city) setFilters(prev => ({ ...prev, city }));
    }

    fetchProperties({ listing_type: 'sale' }).then(data => {
      setProperties(data.properties as Property[]);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedAmenities.length > 0 && properties.length > 0) {
      setIsRanking(true);
      const propsToSend = properties.map(p => ({
        id: String(p.id),
        has_pool: Boolean(p.has_pool),
        has_gym: Boolean(p.has_gym),
        has_clubhouse: Boolean(p.has_clubhouse),
        has_sports_ground: Boolean(p.has_sports_ground),
        dist_metro_km: p.dist_metro_km != null ? Number(p.dist_metro_km) : 10.0
      }));
      rankProperties(propsToSend, selectedAmenities)
        .then(res => setRankedIds(res.ranked_ids))
        .catch(console.error)
        .finally(() => setIsRanking(false));
    } else {
      setRankedIds([]);
    }
  }, [selectedAmenities, properties]);

  const filtered = useMemo(() => {
    let props = [...properties];

    if (filters.city) {
      props = props.filter((p) =>
        p.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.type) {
      props = props.filter((p) => p.type === filters.type);
    }

    if (filters.status) {
      props = props.filter((p) => p.status === filters.status);
    }

    if (filters.bedrooms.length > 0) {
      props = props.filter((p) =>
        filters.bedrooms.some((b) =>
          b === "5+"
            ? (p.bedrooms ?? 0) >= 5
            : p.bedrooms === parseInt(b)
        )
      );
    }

    props = props.filter(
      (p) => parseFloat(String(p.price)) >= filters.minPrice && parseFloat(String(p.price)) <= filters.maxPrice
    );

    if (searchQ) {
      props = props.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQ.toLowerCase()) ||
          p.location.toLowerCase().includes(searchQ.toLowerCase()) ||
          (p.city && p.city.toLowerCase().includes(searchQ.toLowerCase()))
      );
    }

    if (rankedIds.length > 0) {
      props.sort((a, b) => {
        const indexA = rankedIds.indexOf(String(a.id));
        const indexB = rankedIds.indexOf(String(b.id));
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    } else if (sort === "price-asc") {
      props.sort((a, b) => parseFloat(String(a.price)) - parseFloat(String(b.price)));
    } else if (sort === "price-desc") {
      props.sort((a, b) => parseFloat(String(b.price)) - parseFloat(String(a.price)));
    } else if (sort === "area-asc") {
      props.sort((a, b) => (a.area ?? 0) - (b.area ?? 0));
    }

    return props;
  }, [filters, sort, searchQ, properties, rankedIds]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search locality, project, society..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-nexus-400 focus:ring-2 focus:ring-nexus-50 outline-none text-sm"
              />
            </div>

            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="hidden sm:block px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-nexus-400 outline-none bg-white"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="hidden sm:flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-nexus-600"
                    : "text-gray-500"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-nexus-600"
                    : "text-gray-500"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="font-display text-xl font-bold text-gray-900">
                  Properties for Sale
                  {filters.city && (
                    <span className="text-nexus-600"> in {filters.city}</span>
                  )}
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">{filtered.length} properties found</p>
              </div>
            </div>

            {/* AI Smart Sort Bar */}
            <div className="bg-nexus-50 border border-nexus-100 rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full shadow-sm">
                  <Sparkles className="w-5 h-5 text-nexus-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-nexus-900">AI Smart Sorting</h3>
                  <p className="text-xs text-nexus-600">Select amenities to rank properties by ML Desirability Score</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'pool', icon: Waves, label: 'Pool' },
                  { id: 'gym', icon: Dumbbell, label: 'Gym' },
                  { id: 'clubhouse', icon: Users, label: 'Clubhouse' },
                  { id: 'sports', icon: Map, label: 'Sports Ground' }
                ].map(amenity => (
                  <button
                    key={amenity.id}
                    onClick={() => setSelectedAmenities(prev => 
                      prev.includes(amenity.id) 
                        ? prev.filter(a => a !== amenity.id)
                        : [...prev, amenity.id]
                    )}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      selectedAmenities.includes(amenity.id)
                        ? 'bg-nexus-600 text-white border-nexus-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-nexus-300'
                    }`}
                  >
                    <amenity.icon className="w-3.5 h-3.5" />
                    {amenity.label}
                  </button>
                ))}
              </div>
            </div>

            {loading || isRanking ? (
              <div className="flex flex-col items-center justify-center py-20 text-nexus-600">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading properties from database...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-700 font-semibold mb-2">No properties found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                <button
                  onClick={() => setFilters(defaultFilters)}
                  className="mt-4 nexus-btn-primary text-sm"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                    : "flex flex-col gap-4"
                }
              >
                {filtered.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
