'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Upload, X, MapPin, Home, CheckCircle2 } from 'lucide-react';

export default function SellPage() {
  const router = useRouter();
  const { user } = useAppStore();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Files to upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    street_address: '',
    locality: '',
    city: 'Mumbai',
    state: '',
    zip_code: '',
    price: '',
    type: 'apartment',
    bedrooms: '2',
    bathrooms: '2',
    area: '1000',
    furnishing_status: 'unfurnished',
    description: '',
    has_parking: false,
    has_power_backup: false,
    has_elevator: false,
    open_to_swap: true,
    listing_type: 'sale',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (selectedFiles.length + filesArray.length > 5) {
        setErrorMsg('Maximum 5 photos allowed.');
        return;
      }
      setSelectedFiles([...selectedFiles, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previewUrls];
    newPreviews.splice(index, 1);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrorMsg('You must be logged in to list a property.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      let uploadedImageUrls: string[] = [];

      // 1. Upload Images to Backend
      if (selectedFiles.length > 0) {
        const fileData = new FormData();
        selectedFiles.forEach(file => fileData.append('photos', file));

        const uploadRes = await fetch('http://localhost:3001/api/upload', {
          method: 'POST',
          body: fileData
        });
        
        if (!uploadRes.ok) throw new Error('Image upload failed');
        const uploadJson = await uploadRes.json();
        uploadedImageUrls = uploadJson.urls;
      }

      // 2. Save Property to Database
      const finalData = {
        ...formData,
        owner_id: user.id,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        images: uploadedImageUrls
      };

      const dbRes = await fetch('http://localhost:3001/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });

      if (!dbRes.ok) throw new Error('Failed to save property to database');

      // Success! Redirect to profile
      router.push('/profile');
      
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:px-10 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="mb-10 text-center space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-nexus-600 font-bold">List Your Property</p>
        <h1 className="text-4xl font-bold text-slate-900">Reach thousands of buyers & swappers</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white transition ${step === 1 ? 'bg-nexus-600' : 'bg-emerald-500'}`}>
            {step === 1 ? '1' : <CheckCircle2 size={20} />}
          </div>
          <div className={`h-1 w-20 rounded ${step === 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition ${step === 2 ? 'bg-nexus-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
            2
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: Details & Photos */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 border-b pb-2 flex items-center gap-2"><Home size={20} className="text-nexus-500"/> Core Details</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                I want to: *
                <select name="listing_type" value={formData.listing_type} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-nexus-500 bg-white font-semibold text-nexus-600">
                  <option value="sale">Sell my property</option>
                  <option value="rent">Rent out my property</option>
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Property Title *
                <input name="title" value={formData.title} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-nexus-500" placeholder="e.g. Luxury Sea View Apartment" />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Property Type
                <select name="type" value={formData.type} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-nexus-500 bg-white">
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa / Independent House</option>
                  <option value="builder-floor">Builder Floor</option>
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                {formData.listing_type === 'sale' ? 'Selling Price (₹) *' : 'Monthly Rent (₹) *'}
                <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-nexus-500" placeholder={formData.listing_type === 'sale' ? "e.g. 15000000" : "e.g. 50000"} />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Furnishing Status
                <select name="furnishing_status" value={formData.furnishing_status} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-nexus-500 bg-white">
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi">Semi-Furnished</option>
                  <option value="full">Fully Furnished</option>
                </select>
              </label>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3 mt-6">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Bedrooms
                <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-nexus-500" />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Bathrooms
                <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-nexus-500" />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Area (Sq. Ft)
                <input type="number" name="area" value={formData.area} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-nexus-500" />
              </label>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 border-b pb-2 flex items-center gap-2"><MapPin size={20} className="text-nexus-500"/> Location</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Street Address
                <input name="street_address" value={formData.street_address} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-nexus-500" placeholder="Flat No, Building Name, Street" />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Locality / Area
                <input name="locality" value={formData.locality} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-nexus-500" placeholder="e.g. Bandra West" />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                City *
                <input name="city" value={formData.city} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-nexus-500 bg-white" placeholder="e.g. Pune, Indore, etc." />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                PIN / Zip Code
                <input name="zip_code" value={formData.zip_code} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-nexus-500" />
              </label>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 border-b pb-2">Amenities & Features</h2>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input type="checkbox" name="has_parking" checked={formData.has_parking} onChange={handleChange} className="w-5 h-5 rounded text-nexus-600 focus:ring-nexus-500 border-gray-300" />
                Reserved Parking
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input type="checkbox" name="has_power_backup" checked={formData.has_power_backup} onChange={handleChange} className="w-5 h-5 rounded text-nexus-600 focus:ring-nexus-500 border-gray-300" />
                Power Backup
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input type="checkbox" name="has_elevator" checked={formData.has_elevator} onChange={handleChange} className="w-5 h-5 rounded text-nexus-600 focus:ring-nexus-500 border-gray-300" />
                Elevator
              </label>
            </div>

            <div className="mt-6 p-4 bg-nexus-50 border border-nexus-100 rounded-xl">
               <label className="flex items-center gap-3 cursor-pointer text-slate-900 font-semibold">
                <input type="checkbox" name="open_to_swap" checked={formData.open_to_swap} onChange={handleChange} className="w-5 h-5 rounded text-nexus-600 focus:ring-nexus-500 border-gray-300" />
                Open to Lease Swapping (NexusEngine)
              </label>
              <p className="text-sm text-slate-500 mt-1 ml-8">Allow other users to propose exchanging their lease with yours via our AI algorithm.</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 border-b pb-2">Property Photos</h2>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 transition cursor-pointer relative">
              <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-sm font-medium text-slate-900">Click or drag photos here to upload</p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB (Max 5 photos)</p>
            </div>
            
            {previewUrls.length > 0 && (
              <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
                    <img src={url} className="w-full h-full object-cover" alt="Preview" />
                    <button onClick={() => removeFile(i)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t flex justify-end">
            <button 
              onClick={() => {
                if(!formData.title || !formData.price || !formData.city) {
                  setErrorMsg("Please fill out the Title, Rent, and City.");
                  window.scrollTo(0,0);
                  return;
                }
                setStep(2);
                window.scrollTo(0,0);
              }}
              className="nexus-btn-primary px-8 py-3 text-lg font-semibold"
            >
              Continue to Review
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Review & Publish */}
      {step === 2 && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-right-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Review & Publish</h2>
          
          <div className="bg-slate-50 p-6 rounded-2xl mb-8">
            <h3 className="font-semibold text-lg text-slate-900">{formData.title}</h3>
            <p className="text-slate-600 mt-1">{formData.locality}, {formData.city}</p>
            <p className="text-2xl font-bold text-nexus-600 mt-4">
              ₹{Number(formData.price).toLocaleString()}
              {formData.listing_type === 'rent' && <span className="text-lg text-slate-500 font-medium">/mo</span>}
            </p>
            
            <div className="flex gap-4 mt-4 text-sm font-medium text-slate-700">
              <span className="bg-white px-3 py-1 border border-slate-200 rounded-lg">{formData.bedrooms} Beds</span>
              <span className="bg-white px-3 py-1 border border-slate-200 rounded-lg">{formData.bathrooms} Baths</span>
              <span className="bg-white px-3 py-1 border border-slate-200 rounded-lg">{formData.area} sqft</span>
              <span className="bg-white px-3 py-1 border border-slate-200 rounded-lg capitalize">{formData.furnishing_status.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <button onClick={() => setStep(1)} disabled={loading} className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition w-full md:w-auto">
              Back to Edit
            </button>
            <button onClick={handleSubmit} disabled={loading} className="nexus-btn-primary flex-1 py-3 text-lg font-semibold flex justify-center items-center">
              {loading ? (
                <span className="animate-pulse">Publishing securely to database...</span>
              ) : (
                'Go Live! Publish Listing'
              )}
            </button>
          </div>

          <p className="text-xs text-center text-slate-500 mt-4">
            By publishing, your listing will instantly be saved to the PostgreSQL database and processed by our fraud-detection triggers.
          </p>
        </div>
      )}

    </main>
  );
}
