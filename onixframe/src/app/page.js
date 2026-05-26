import Navbar       from '@/components/layout/Navbar';
import HeroSection  from '@/components/landing/HeroSection';
import FeatureCards from '@/components/landing/FeatureCards';
import HowItWorks   from '@/components/landing/HowItWorks';
import Footer       from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeatureCards />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
