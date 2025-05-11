'use client';

import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-bold text-blue-600">Net4Grad</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">
              Home
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">
              About
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">
              Contact
            </a>
          </div>

          {/* Future: Add login/register button here */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
