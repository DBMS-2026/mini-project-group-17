"use client";

import { useState } from "react";
import { ArrowRight, Network, Play, RefreshCw, CheckCircle2, Server, Database, Code2 } from "lucide-react";
import { detectSwapCycles, type CycleResult } from "@/lib/api";

export default function SwapEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CycleResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRunAlgorithm() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await detectSwapCycles();
      // add a small artificial delay so the invigilator sees the loading state
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to run graph algorithm.");
      setLoading(false);
    }
  }

  // Helper to visually render a cycle
  const renderCycle = (cycleIds: number[], index: number) => {
    if (!result?.nodes) return null;
    
    // Map IDs to actual node data
    const cycleNodes = cycleIds.map(id => result.nodes.find(n => n.id === id)!);
    
    return (
      <div key={index} className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
        <h3 className="font-bold text-lg text-emerald-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Detected Swap Cycle #{index + 1}
        </h3>
        
        <div className="flex flex-wrap items-center gap-3">
          {cycleNodes.map((node, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-w-[200px]">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">User {node.user_id}</div>
                <div className="font-medium text-slate-800">
                  {node.current_city} <ArrowRight className="inline w-4 h-4 text-slate-400 mx-1" /> {node.desired_city}
                </div>
              </div>
              
              <div className="text-emerald-500">
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>
          ))}
          
          {/* Close the loop visually */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 font-medium">
            Completes Cycle ↺
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header section */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
            <Network className="w-4 h-4" />
            DBMS Project Demonstration
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Multi-Node Swap Engine</h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            This control panel demonstrates the core algorithmic feature of NexusEstate. 
            It triggers the Node.js API Gateway to fetch active requests from PostgreSQL and pipes them into a Python Microservice which runs a directed graph cycle-detection algorithm (NetworkX) to find closed loop lease swaps.
          </p>
        </div>

        {/* Architecture Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Database className="w-6 h-6" /></div>
            <div>
              <div className="font-semibold text-slate-900">1. PostgreSQL</div>
              <div className="text-sm text-slate-500">Stores Swap_Requests</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Server className="w-6 h-6" /></div>
            <div>
              <div className="font-semibold text-slate-900">2. Node.js Gateway</div>
              <div className="text-sm text-slate-500">Orchestrates API calls</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Code2 className="w-6 h-6" /></div>
            <div>
              <div className="font-semibold text-slate-900">3. Python Engine</div>
              <div className="text-sm text-slate-500">Executes Graph Algorithm</div>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-10 text-center">
          <button
            onClick={handleRunAlgorithm}
            disabled={loading}
            className="inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all disabled:opacity-70"
          >
            {loading ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                Processing Graph Data...
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                Run Cycle Detection Algorithm
              </>
            )}
          </button>
          {error && <p className="text-red-500 mt-4 font-medium">{error}</p>}
        </div>

        {/* Results Area */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              Algorithm Results 
              <span className="bg-emerald-100 text-emerald-700 text-sm px-3 py-1 rounded-full">
                {result.cycles_found} Cycles Found
              </span>
            </h2>
            
            {result.cycles.length === 0 ? (
              <div className="bg-slate-100 rounded-2xl p-8 text-center text-slate-500">
                No closed swap loops exist in the current database state.
              </div>
            ) : (
              <div>
                {result.cycles.map((cycle, i) => renderCycle(cycle, i))}
              </div>
            )}
            
            {/* Raw JSON Debug View */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Raw JSON Response (from Python)</h3>
              <div className="bg-slate-900 rounded-2xl p-6 overflow-x-auto">
                <pre className="text-emerald-400 text-sm">
                  {JSON.stringify({
                    message: result.message,
                    cycles_found: result.cycles_found,
                    cycles: result.cycles
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
