
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";

const Hero = () => {
  const { user } = useAuth();
  const { tier, isAdmin } = useSubscription();

  return (
    <section className="pt-32 pb-20 container mx-auto px-4">
      <div className="max-w-4xl mx-auto text-center animate-fade-in">
        {user ? (
          <>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight text-gradient mb-6">
              Welcome back! Ready to create amazing SOPs?
            </h1>
            <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              Continue building professional Standard Operating Procedures with step-by-step instructions, 
              annotated screenshots, and interactive training modules. Your {isAdmin ? "Admin" : tier === "free" ? "Free" : "Pro"} account 
              gives you access to powerful features.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/app">
                <Button className="bg-[#007AFF] text-white hover:bg-[#0062CC] rounded-xl px-8 py-6 text-lg w-full sm:w-auto font-medium">
                  Continue Creating SOPs
                </Button>
              </Link>
              <Link to="/profile">
                <Button 
                  variant="outline" 
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-xl px-8 py-6 text-lg w-full sm:w-auto"
                >
                  View Profile
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight text-gradient mb-6">
              Create Professional SOPs with Screenshots & Training Modules
            </h1>
            <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your business processes into professional Standard Operating Procedures with step-by-step instructions, 
              annotated screenshots, and interactive training modules. Export to PDF, HTML, and create engaging learning experiences 
              for your team. All data stays secure in your browser.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/app">
                <Button className="bg-[#007AFF] text-white hover:bg-[#0062CC] rounded-xl px-8 py-6 text-lg w-full sm:w-auto font-medium">
                  Start Creating SOPs Free
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-xl px-8 py-6 text-lg w-full sm:w-auto"
                asChild
              >
                <a href="#how-it-works">
                  See How It Works
                </a>
              </Button>
            </div>
          </>
        )}
        
        {/* Trust indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Privacy-First Design</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Export to PDF & HTML</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
