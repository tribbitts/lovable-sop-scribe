import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-[#121212] text-[#F1F1F1]">
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
          <h1 className="text-3xl font-semibold mb-8">Terms of Service</h1>
          
          <div className="space-y-6 text-zinc-300">
            <p>Last Updated: May 22, 2025</p>
            
            <h2 className="text-xl font-medium text-white mt-6">1. Introduction</h2>
            <p>
              Welcome to SOPify. These Terms of Service govern your use of our website and services. By accessing or using our services, you agree to be bound by these Terms.
            </p>
            
            <h2 className="text-xl font-medium text-white mt-6">2. Definitions</h2>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>"SOPify"</strong> refers to our company, our website, and our services.</li>
              <li><strong>"Service"</strong> refers to the SOPify application, website, and other related services.</li>
              <li><strong>"User"</strong> refers to individuals who use our Service.</li>
              <li><strong>"Content"</strong> refers to text, images, videos, and other materials created using our Service.</li>
            </ul>
            
            <h2 className="text-xl font-medium text-white mt-6">3. Account Registration</h2>
            <p>
              When you create an account with us, you guarantee that the information you provide is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account.
            </p>
            <p className="mt-3">
              You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.
            </p>
            
            <h2 className="text-xl font-medium text-white mt-6">4. Service Usage</h2>
            <p>
              You may use our Service only for lawful purposes and in accordance with these Terms. You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Use the Service in any way that violates any applicable local, state, national, or international law or regulation.</li>
              <li>Use the Service to transmit or send unsolicited commercial communications.</li>
              <li>Impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity.</li>
              <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service.</li>
            </ul>
            
            <h2 className="text-xl font-medium text-white mt-6">5. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of SOPify and its licensors. The Service is protected by copyright, trademark, and other laws of the United States and foreign countries.
            </p>
            <p className="mt-3">
              The content you create using our Service is owned by you. However, by creating content using our Service, you grant us a non-exclusive, transferable, sub-licensable, royalty-free, worldwide license to use any content that you post using our Service.
            </p>
            
            <h2 className="text-xl font-medium text-white mt-6">6. Subscription and Payments</h2>
            <p>
              Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring basis, depending on the type of subscription plan you select.
            </p>
            <p className="mt-3">
              We reserve the right to change our subscription fees at any time, upon reasonable notice. Your continued use of the Service after the price change becomes effective constitutes your agreement to pay the changed amount.
            </p>
            
            <h2 className="text-xl font-medium text-white mt-6">7. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            
            <h2 className="text-xl font-medium text-white mt-6">8. Limitation of Liability</h2>
            <p>
              In no event shall SOPify, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
            
            <h2 className="text-xl font-medium text-white mt-6">9. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>
            
            <h2 className="text-xl font-medium text-white mt-6">10. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
            
            <h2 className="text-xl font-medium text-white mt-6">11. Contact Us</h2>
            <p className="text-zinc-300 leading-relaxed mt-4">
              If you have any questions about these Terms, please contact us at:
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

export default TermsOfService;
