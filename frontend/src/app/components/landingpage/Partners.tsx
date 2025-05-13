'use client';

export default function Partners() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Leading Institutions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Join hundreds of educational institutions that are transforming their alumni networks with our platform.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {/* Placeholder college logos */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-20 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-gray-400 font-semibold">College {index + 1}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-blue-50 rounded-xl">
            <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-600">Partner Colleges</div>
          </div>
          <div className="p-6 bg-blue-50 rounded-xl">
            <div className="text-4xl font-bold text-blue-600 mb-2">1M+</div>
            <div className="text-gray-600">Connected Alumni</div>
          </div>
          <div className="p-6 bg-blue-50 rounded-xl">
            <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
            <div className="text-gray-600">Mentorship Connections</div>
          </div>
        </div>
      </div>
    </section>
  );
}