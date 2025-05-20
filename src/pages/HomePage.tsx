
import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import Pricing from "@/components/home/Pricing";
import Footer from "@/components/home/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#121212] text-[#F1F1F1] dark">
      <Header />
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
};

export default HomePage;
