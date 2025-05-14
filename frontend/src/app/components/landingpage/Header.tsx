'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';

export default function Header() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 shadow-sm">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 group">
            <img src="/logo.png" alt="Net4Grad Logo" className="w-12 h-12 object-contain" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Net4Grad</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => scrollToSection('features')}
            className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('success-stories')}
            className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium"
          >
            Success Stories
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium"
          >
            Pricing
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <button className="px-5 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium">
            Book Demo
          </button>
          <Link href="/login" className="px-5 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium">
            Login
          </Link>
          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium">
            Sign Up
          </button>
        </div>

        <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>
    </header>
  );
}