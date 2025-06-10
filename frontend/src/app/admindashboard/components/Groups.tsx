'use client';

import { useState } from 'react';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black">Manage Groups</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Create Group
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search groups..."
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading groups...</p>
          </div>
        ) : groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Map through groups data here */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">Example Group</h3>
                <p className="text-gray-600 mb-4">A group for example purposes</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Members: 25</span>
                  <span className="text-sm text-gray-500">Created: May 15, 2023</span>
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
            <p className="text-gray-600">No groups found. Create a group to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}