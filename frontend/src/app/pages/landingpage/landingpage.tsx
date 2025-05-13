import Header from '../../components/landingpage/Header';
import Hero from '../../components/landingpage/Hero';
import Partners from '../../components/landingpage/Partners';
import FeaturesSection from '../../components/landingpage/FeaturesSection';
import SuccessStoriesSection from '../../components/landingpage/SuccessStoriesSection';
import CTASection from '../../components/landingpage/CTASection';
import Footer from '../../components/landingpage/Footer';
import PricingSection from '../../components/landingpage/PricingSection';
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main>
        <Hero />
        <Partners />
        <FeaturesSection />
        <SuccessStoriesSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}