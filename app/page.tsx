import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import ProductShowcase from "@/components/home/ProductShowcase";
import Gallery from "@/components/home/Gallery";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <HowItWorks />
      <ProductShowcase />
      <Gallery />
      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  );
}
