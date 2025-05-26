
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { seoPages } from "@/lib/seo";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#121212] text-[#F1F1F1]">
      <SEOHead metadata={seoPages["/privacy-policy"]} path="/privacy-policy" />
      
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-8 text-zinc-400 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        
        <div className="flex items-center gap-1 mb-8">
          <span className="text-2xl font-medium tracking-tight text-white">SOP</span>
          <span className="text-2xl font-light tracking-tight text-[#007AFF]">ify</span>
        </div>
        
        <div className="max-w-4xl mx-auto bg-[#1E1E1E] rounded-2xl p-8 mb-12">
          <h1 className="text-3xl font-semibold mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-zinc-300">
            <p>Last Updated: May 22, 2025</p>
            
            <h2 className="text-xl font-medium text-white mt-6">1. Introduction</h2>
            <p>
              Welcome to SOPify ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>
            
            <h2 className="text-xl font-medium text-white mt-6">2. The Data We Collect</h2>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
              <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
            </ul>
            
            <h2 className="text-xl font-medium text-white mt-6">3. How We Collect Your Data</h2>
            <p>
              We use different methods to collect data from and about you including through:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Direct interactions.</strong> You may give us your Identity and Contact Data by filling in forms or by corresponding with us by email or otherwise.</li>
              <li><strong>Automated technologies or interactions.</strong> As you interact with our website, we may automatically collect Technical Data about your equipment, browsing actions and patterns.</li>
            </ul>
            
            <h2 className="text-xl font-medium text-white mt-6">4. How We Use Your Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>
            
            <h2 className="text-xl font-medium text-white mt-6">5. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>
            
            <h2 className="text-xl font-medium text-white mt-6">6. Data Retention</h2>
            <p>
              We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting or reporting requirements.
            </p>
            
            <h2 className="text-xl font-medium text-white mt-6">7. Your Legal Rights</h2>
            <p>
              Under certain circumstances, you have rights under data protection laws in relation to your personal data including the right to request access, correction, erasure, restriction, transfer, or to object to processing, or to withdraw consent.
            </p>
            
            <h2 className="text-xl font-medium text-white mt-6">8. Contact Us</h2>
            <p className="text-zinc-300 leading-relaxed mt-4">
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <p className="text-zinc-300 mt-2">
              Email: support@sopifyapp.com
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-6 bg-[#121212] border-t border-zinc-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-zinc-500">© 2025 SOPify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
