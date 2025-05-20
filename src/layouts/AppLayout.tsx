
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { MoonIcon, SunIcon, Home, LogOut } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="min-h-screen bg-[#121212] text-[#F1F1F1] dark">
      {/* App Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-[#121212]/80 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-medium tracking-tight text-white">SOP</span>
            <span className="text-2xl font-light tracking-tight text-[#007AFF]">ify</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden md:inline">Home</span>
            </Link>
            
            {/* Placeholder for auth - will connect to Supabase later */}
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-xl text-sm flex items-center gap-2"
                onClick={() => console.log("Logout clicked - will integrate with Supabase")}
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
              >
                {theme === "dark" ? (
                  <SunIcon className="h-[1.2rem] w-[1.2rem] text-zinc-400" />
                ) : (
                  <MoonIcon className="h-[1.2rem] w-[1.2rem] text-zinc-400" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* App Content */}
      <div className="pt-20 pb-10">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
