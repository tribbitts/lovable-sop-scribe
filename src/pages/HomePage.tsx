
import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import DemoSection from "@/components/home/DemoSection";
import Testimonials from "@/components/home/Testimonials";
import Pricing from "@/components/home/Pricing";
import Footer from "@/components/home/Footer";
import SEOHead from "@/components/SEOHead";
import { seoPages } from "@/lib/seo";

const HomePage = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is SOPify?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SOPify is a professional SOP (Standard Operating Procedure) creation tool that helps businesses create step-by-step documentation with screenshots and annotations for clear, professional procedures."
        }
      },
      {
        "@type": "Question", 
        "name": "How much does SOPify cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SOPify offers a free tier with basic features, SOP Essentials at $20/month, and SOPify Business at $40/month with advanced features and customization options."
        }
      },
      {
        "@type": "Question",
        "name": "Can I export my SOPs to PDF?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, SOPify allows you to export your Standard Operating Procedures to professional PDF documents and HTML formats for easy sharing and distribution."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#F1F1F1] dark">
      <SEOHead 
        metadata={{
          ...seoPages["/"],
          schemaMarkup: faqSchema
        }} 
        path="/" 
      />
      <Header />
      <main>
        <Hero />
        <Features />
        <DemoSection />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
