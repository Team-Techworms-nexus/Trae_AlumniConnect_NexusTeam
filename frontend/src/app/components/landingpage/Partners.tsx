'use client';

import { useEffect, useState } from 'react';

export default function Partners() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const logoWidth = 224; // width(192) + gap(32) = 224px
  const totalWidth = logoWidth * 8; // 8 logos

  const collegeNames = [
    "Harvard University",
    "Stanford University",
    "MIT",
    "Oxford University",
    "Cambridge University",
    "JSCOE",
    "JSPM University",
    "JSPM Pharmacy"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        if (prev >= totalWidth) {
          return 0;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [totalWidth]);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Leading Institutions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join hundreds of educational institutions that are transforming their alumni networks with our platform.
          </p>
        </div>

        {/* Scrolling carousel */}
        <div className="relative overflow-hidden mb-16">
          <div
            className="flex gap-8 transition-transform duration-300 ease-linear"
            style={{
              transform: `translateX(-${scrollPosition}px)`,
              width: 'max-content',
            }}
          >
            {/* First set of logos */}
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`logo-${index}`}
                className="w-48 h-24 bg-gray-50 rounded-lg flex-shrink-0 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow p-2"
              >
                <img
                  src={`/partners/college-${index + 1}.png`}
                  alt={`${collegeNames[index]} Logo`}
                  className="w-36 h-12 object-contain mb-2"
                />
                <p className="text-sm text-gray-700 font-medium">{collegeNames[index]}</p>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`logo-dup-${index}`}
                className="w-48 h-24 bg-gray-50 rounded-lg flex-shrink-0 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow p-2"
              >
                <img
                  src={`/partners/college-${index + 1}.png`}
                  alt={`${collegeNames[index]} Logo`}
                  className="w-36 h-12 object-contain mb-2"
                />
                <p className="text-sm text-gray-700 font-medium">{collegeNames[index]}</p>
              </div>
            ))}
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>
        </div>

        {/* Additional grid content placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* You can insert cards or features here */}
          <div className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">500+</h3>
            <p className="text-gray-600">Partner Colleges</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">1M+</h3>
            <p className="text-gray-600">Connected Alumni</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">50k+</h3>
            <p className="text-gray-600">Mentorship Connections</p>
          </div>
        </div>
      </div>
    </section>
  );
}
