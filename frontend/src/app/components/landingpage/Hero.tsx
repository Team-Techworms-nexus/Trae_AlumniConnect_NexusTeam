'use client';

export default function Hero() {
  return (
    <section className="pt-32 pb-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Connect Your Alumni Network
              <span className="text-blue-600"> Like Never Before</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Empower your institution with a modern platform that brings alumni, students, and opportunities together in one seamless network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold">
                Book a Demo
              </button>
              <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="w-[600px] h-[400px] bg-gray-100 rounded-2xl overflow-hidden">
              <img 
                src="/hero.png" 
                alt="Hero Illustration"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}