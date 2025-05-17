'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/landingpage/Header';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'students', label: 'Manage Students', icon: '👨‍🎓' },
    { id: 'alumni', label: 'Manage Alumni', icon: '🎓' },
    { id: 'admins', label: 'Manage Admins', icon: '👥' },
    { id: 'groups', label: 'Manage Groups', icon: '👥' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'achievement', label: 'Achievement', icon: '🏆' },
    { id: 'donations', label: 'Donations', icon: '💸' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle the Excel file upload here
      console.log('File uploaded:', file.name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      {/* Add spacing after header */}
      <div className="h-8"></div>
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-md h-screen sticky top-100">
          <div className="p-7">
            <div className="flex items-center space-x-2 mb-6">
            </div>
            
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === item.id ? 'bg-blue-100 text-blue-600' : 'text-black hover:bg-gray-100'}`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-black">
              {navigationItems.find(item => item.id === activeTab)?.label}
            </h1>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-black">Add New Student</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add Student
                </button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label
                    htmlFor="excel-upload"
                    className="w-full cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block text-center"
                  >
                    Upload Excel
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-black">Add New Alumni</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add Alumni
                </button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label
                    htmlFor="excel-upload"
                    className="w-full cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block text-center"
                  >
                    Upload Excel
                  </label>
                </div>
              </div>
            </div>

            
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-black mb-2">Total Students</h3>
              <p className="text-3xl font-bold text-black">1,234</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-black mb-2">Total Alumni</h3>
              <p className="text-3xl font-bold text-black">5,678</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-black mb-2">Total Achievements</h3>
              <p className="text-3xl font-bold text-black">892</p>
              <p className="text-sm text-black mt-1">↑ 12% this month</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-black mb-2">Total Donations</h3>
              <p className="text-3xl font-bold text-black">₹12.5M</p>
              <p className="text-sm text-black mt-1">↑ 8% this month</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-black mb-2">Active Groups</h3>
              <p className="text-3xl font-bold text-black">42</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-black mb-2">Upcoming Events</h3>
              <p className="text-3xl font-bold text-black">7</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-black mb-2">Recent Achievements</h3>
              <p className="text-3xl font-bold text-black">24</p>
              <p className="text-sm text-black mt-1">This month</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-black mb-2">Recent Donations</h3>
              <p className="text-3xl font-bold text-black">₹2.8M</p>
              <p className="text-sm text-black mt-1">This month</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}