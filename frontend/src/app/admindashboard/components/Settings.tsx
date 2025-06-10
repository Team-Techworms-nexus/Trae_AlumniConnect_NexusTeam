'use client';

import { useState } from 'react';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [collegeInfo, setCollegeInfo] = useState({
    name: 'Example College',
    email: 'admin@example.edu',
    phone: '+91 1234567890',
    address: '123 College Road, Example City, State - 123456',
    website: 'www.examplecollege.edu',
    logo: '/placeholder-logo.png'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('College info updated:', collegeInfo);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCollegeInfo(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-black">Settings</h2>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">College Information</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
              <input 
                type="text" 
                name="name"
                value={collegeInfo.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={collegeInfo.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                type="text" 
                name="phone"
                value={collegeInfo.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input 
                type="text" 
                name="website"
                value={collegeInfo.website}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea 
              name="address"
              value={collegeInfo.address}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College Logo</label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-500 text-xs">Logo Preview</span>
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  Upload Logo
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="pt-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}