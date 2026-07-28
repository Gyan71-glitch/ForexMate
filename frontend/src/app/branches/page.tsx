"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getActiveBranches } from '@/lib/api-public';

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    getActiveBranches()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBranches(data);
          const uniqueCities = Array.from(new Set(data.map((b: any) => b.branchCity))).sort();
          setCities(uniqueCities as string[]);
        }
      })
      .catch(err => console.error("Failed to load branches:", err));
  }, []);

  const filteredBranches = branches.filter(b => {
    const matchesSearch = b.branchName.toLowerCase().includes(search.toLowerCase()) || 
                          b.branchAddress.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter === 'All' || b.branchCity === cityFilter;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold mb-4">Our Branch Network</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find a Forexmate branch near you. We have a growing network of branches across India to serve your currency exchange needs.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Left Column: Search & List */}
            <div className="w-full md:w-1/3 flex flex-col h-[700px]">
              {/* Filters */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 space-y-4">
                <input 
                  type="text"
                  placeholder="Search branch or address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select 
                  className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="All">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-grow overflow-y-auto">
                {filteredBranches.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No branches found matching your search.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredBranches.map(branch => (
                      <div key={branch.id} className="p-4 hover:bg-blue-50 transition-colors cursor-pointer group">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 mb-1">{branch.branchName}</h3>
                        <p className="text-sm text-gray-600 mb-2">{branch.branchAddress}</p>
                        <div className="flex items-center text-xs text-gray-500 mb-3 space-x-4">
                          <span className="flex items-center">
                            <span className="mr-1">🕒</span> {branch.workingHours || '10:00 AM - 6:00 PM'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-1.5 px-3 rounded flex-1">
                            Call Branch
                          </button>
                          <a 
                            href={`https://maps.google.com/?q=${encodeURIComponent(branch.branchAddress)}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-1.5 px-3 rounded flex-1 text-center"
                          >
                            Get Directions
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Map Placeholder */}
            <div className="w-full md:w-2/3 h-[700px] bg-white rounded-xl shadow-sm border border-gray-100 p-2 relative overflow-hidden">
              {/* Replace with actual Google Maps Embed or Mapbox */}
              <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[url('https://maps.gstatic.com/mapfiles/maps_lite/images/2x/map_error.png')] opacity-30 bg-cover bg-center"></div>
                <div className="bg-white p-6 rounded-xl shadow-lg z-10 text-center max-w-sm">
                  <div className="text-4xl mb-4">🗺️</div>
                  <h3 className="font-bold text-lg mb-2">Interactive Map View</h3>
                  <p className="text-sm text-gray-600">Select a branch from the list to view its exact location and get directions.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
