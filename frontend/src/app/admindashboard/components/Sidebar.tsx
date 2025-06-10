'use client';

import { useState } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navigationItems: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
}

export default function Sidebar({ activeTab, setActiveTab, navigationItems }: SidebarProps) {
  return (
    <aside className="w-64 bg-white shadow-md h-screen sticky top-100">
      <div className="p-7">
        <div className="flex items-center space-x-2 mb-6">
          {/* Logo or college name can go here */}
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
  );
}