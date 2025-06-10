'use client';

import { useState } from 'react';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black">Manage Achievements</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Add Achievement
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search achievements..."
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading achievements...</p>
          </div>
        ) : achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Map through achievements data here */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="h-40 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Achievement Image</span>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">Example Achievement</h3>
                <p className="text-gray-600 mb-4">A description of the example achievement</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Student: John Doe</span>
                  <span className="text-sm text-gray-500">Date: May 15, 2023</span>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end space-x-2">
                <button className="text-blue-600 hover:text-blue-900">Edit</button>
                <button className="text-red-600 hover:text-red-900">Delete</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600">No achievements found. Add an achievement to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}