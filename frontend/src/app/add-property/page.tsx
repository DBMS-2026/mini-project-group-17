'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddPropertyPage() {
  const router = useRouter();
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    city: 'Mumbai',
    price: '',
    locality: '',
    desiredCity: 'Delhi',
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('http://localhost:3001/api/listings/create-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1, // Mock user ID for demo
          title: formData.title,
          city: formData.city,
          price: Number(formData.price),
          locality: formData.locality,
          desiredCity: formData.desiredCity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Trigger Error from PostgreSQL
        setErrorMsg(data.message || 'An error occurred while listing the property.');
      } else {
        setSuccessMsg('Property successfully listed and Swap Request created!');
        setFormData({ title: '', city: 'Mumbai', price: '', locality: '', desiredCity: 'Delhi' });
      }
    } catch (err) {
      setErrorMsg('Network error. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-12 px-6 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
          List Your Property for Swap
        </h1>
        <p className="text-gray-400 mb-8">
          Enter your property details below. NexusEstate automatically verifies listings to protect the community.
        </p>

        {/* PostgreSQL Trigger Error Display */}
        {errorMsg && (
          <div className="mb-8 p-4 bg-red-900/40 border border-red-500/50 rounded-xl flex items-start space-x-3">
            <div className="text-red-400 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-red-400 text-lg">Transaction Blocked by Database</h3>
              <p className="text-red-200 mt-1 font-mono text-sm">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="mb-8 p-4 bg-green-900/40 border border-green-500/50 rounded-xl">
            <p className="text-green-400 font-medium">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#111111] p-8 rounded-2xl border border-white/10 shadow-2xl">
          <div className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Property Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. Beautiful Sea View Apartment"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Current City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Locality</label>
                <input
                  type="text"
                  name="locality"
                  required
                  value={formData.locality}
                  onChange={handleChange}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. Bandra West"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Monthly Rent / Value (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500">₹</span>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter realistic market price"
                />
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 mt-6">
              <h3 className="text-xl font-semibold mb-4 text-white">Swap Preferences</h3>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Desired Swap City</label>
                <select
                  name="desiredCity"
                  value={formData.desiredCity}
                  onChange={handleChange}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Delhi">Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-semibold text-white mt-4 transition-all duration-300 ${
                loading 
                  ? 'bg-blue-600/50 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]'
              }`}
            >
              {loading ? 'Processing Transaction...' : 'List Property & Open Swap Request'}
            </button>

          </div>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This action is secured by ACID-compliant PostgreSQL transactions and live fraud detection triggers.</p>
        </div>
      </div>
    </div>
  );
}
