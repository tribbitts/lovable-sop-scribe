
import { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { MoonIcon, SunIcon, Home, LogOut, User } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { seoPages } from "@/lib/seo";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { tier, pdfCount, pdfLimit, isPro, isAdmin } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await signOut();
      // Navigation is now handled inside the signOut function
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  // Generate breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://sopify.app/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "SOP Creator",
        "item": "https://sopify.app/app"
      }
    ]
  };
  
  return (
    <div className="min-h-screen bg-[#121212] text-[#F1F1F1] dark">
      <SEOHead 
        metadata={{
          ...seoPages["/app"],
          schemaMarkup: breadcrumbSchema
        }} 
        path="/app" 
      />
      
      {/* App Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-[#121212]/80 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            title="SOPify - Go to Homepage"
          >
            <span className="text-2xl font-medium tracking-tight text-white">SOP</span>
            <span className="text-2xl font-light tracking-tight text-[#007AFF]">ify</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
              title="Return to SOPify Homepage"
            >
              <Home className="h-4 w-4" />
              <span className="hidden md:inline">Home</span>
            </Link>
            
            {/* User info and subscription status */}
            {user && (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-zinc-800 text-xs">
                  <span className={`w-2 h-2 rounded-full mr-1.5 ${isPro ? "bg-green-500" : isAdmin ? "bg-blue-500" : "bg-amber-400"}`}></span>
                  <span className="mr-1.5 text-zinc-300">
                    {isAdmin ? "Admin" : (isPro ? "Pro" : "Free")}
                  </span>
                  {!isPro && !isAdmin && (
                    <span className="text-zinc-400">
                      {pdfCount}/{pdfLimit} PDFs today
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-sm text-zinc-400">
                  <User className="h-3 w-3" />
                  <span className="hidden md:inline truncate max-w-[120px]">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                
                <Button 
                  variant="outline" 
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-xl text-sm flex items-center gap-2"
                  onClick={handleSignOut}
                  title="Sign out of SOPify"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Log Out</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleTheme} 
                  className="rounded-full" 
                  aria-label="Toggle theme"
                  title="Toggle dark/light theme"
                >
                  {theme === "dark" ? (
                    <SunIcon className="h-[1.2rem] w-[1.2rem] text-zinc-400" />
                  ) : (
                    <MoonIcon className="h-[1.2rem] w-[1.2rem] text-zinc-400" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* App Content */}
      <main className="pt-20 pb-10">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
