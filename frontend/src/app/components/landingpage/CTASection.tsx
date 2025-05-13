'use client';

export default function CTASection() {
  return (
    <section className="py-20 bg-blue-600">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Transform Your Alumni Network?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join hundreds of institutions already building stronger communities with Alumni Connect.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold">
            Book a Demo
          </button>
          <button className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
}