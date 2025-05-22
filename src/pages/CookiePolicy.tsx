
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cookie } from "lucide-react";

const CookiePolicy = () => {
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
          <div className="flex items-center gap-3 mb-8">
            <Cookie className="h-8 w-8 text-[#007AFF]" />
            <h1 className="text-3xl font-semibold">Cookie Policy</h1>
          </div>
          
          <div className="space-y-6 text-zinc-300">
            <p>Last Updated: May 22, 2025</p>
            
            <h2 className="text-xl font-medium text-white mt-6">1. Introduction</h2>
            <p>
              This Cookie Policy explains how SOPify ("we", "us", or "our") uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>
            
            <h2 className="text-xl font-medium text-white mt-6">2. What are cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
            </p>
            <p className="mt-3">
              Cookies set by the website owner (in this case, SOPify) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.
            </p>
            
            <h2 className="text-xl font-medium text-white mt-6">3. Why do we use cookies?</h2>
            <p>
              We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our website. Third parties serve cookies through our website for advertising, analytics, and other purposes.
            </p>
            
            <h2 className="text-xl font-medium text-white mt-6">4. Types of cookies we use</h2>
            <p>
              The specific types of first and third-party cookies served through our website and the purposes they perform include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <strong>Essential website cookies:</strong> These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas.
              </li>
              <li>
                <strong>Performance and functionality cookies:</strong> These cookies are used to enhance the performance and functionality of our website but are non-essential to its use. However, without these cookies, certain functionality may become unavailable.
              </li>
              <li>
                <strong>Analytics and customization cookies:</strong> These cookies collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, or to help us customize our website for you.
              </li>
              <li>
                <strong>Advertising cookies:</strong> These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests.
              </li>
            </ul>
            
            <h2 className="text-xl font-medium text-white mt-6">5. How can you control cookies?</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by clicking on the appropriate opt-out links provided in the cookie banner on our website.
            </p>
            <p className="mt-3">
              You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted. As the means by which you can refuse cookies through your web browser controls vary from browser-to-browser, you should visit your browser's help menu for more information.
            </p>
            
            <h2 className="text-xl font-medium text-white mt-6">6. How often will we update this Cookie Policy?</h2>
            <p>
              We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
            </p>
            <p className="mt-3">
              The date at the top of this Cookie Policy indicates when it was last updated.
            </p>
            
            <h2 className="text-xl font-medium text-white mt-6">7. Where can you get further information?</h2>
            <p>
              If you have any questions about our use of cookies or other technologies, please contact us at:
            </p>
            <p className="mt-2">
              Email: privacy@sopify.com
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

export default CookiePolicy;
