'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function AddPropertyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    city: 'Mumbai',
    price: '',
    locality: '',
    desiredCity: 'Delhi',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('nexus_token');
      const res = await fetch('http://localhost:3001/api/listings/create-swap', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          userId: 1,
          title: formData.title,
          city: formData.city,
          price: Number(formData.price),
          locality: formData.locality,
          desiredCity: formData.desiredCity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Error while listing property.');
      } else {
        setSuccessMsg('Property successfully listed!');
        setFormData({
          title: '',
          city: 'Mumbai',
          price: '',
          locality: '',
          desiredCity: 'Delhi',
        });
      }
    } catch {
      setErrorMsg('Network error. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e6f9f9] text-gray-900 py-12 px-6 relative overflow-hidden">

      {/* Subtle Background Glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute w-80 h-80 bg-cyan-200/30 blur-3xl rounded-full top-1/4 left-1/4"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          List Your Property for Swap
        </h1>

        <p className="text-gray-600 mb-8">
          Enter your property details below. NexusEstate ensures safe and verified listings.
        </p>

        {/* Error */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl">
            <p className="text-red-600">{errorMsg}</p>
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl">
            <p className="text-green-700">{successMsg}</p>
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg"
        >
          <div className="space-y-6">

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Title
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Beautiful Sea View Apartment"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            {/* City + Locality */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Current City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-cyan-400"
                >
                  <option>Mumbai</option>
                  <option>Delhi</option>
                  <option>Bangalore</option>
                  <option>Chennai</option>
                  <option>Hyderabad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Locality</label>
                <input
                  type="text"
                  name="locality"
                  required
                  value={formData.locality}
                  onChange={handleChange}
                  placeholder="Bandra West"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Monthly Rent (₹)</label>
              <input
                type="number"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="50000"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            {/* Swap */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Desired City</label>
              <select
                name="desiredCity"
                value={formData.desiredCity}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-cyan-400"
              >
                <option>Delhi</option>
                <option>Mumbai</option>
                <option>Bangalore</option>
                <option>Chennai</option>
                <option>Hyderabad</option>
              </select>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-white bg-blue-800 hover:bg-blue-900 transition-all"
            >
              {loading ? 'Processing...' : 'List Property'}
            </button>

          </div>
        </form>

      </div>
    </div>
  );
}