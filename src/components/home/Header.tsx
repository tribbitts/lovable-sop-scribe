
import { Link } from "react-router-dom";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-[#121212]/80 border-b border-zinc-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <span className="text-2xl font-medium tracking-tight text-white">SOP</span>
          <span className="text-2xl font-light tracking-tight text-[#007AFF]">ify</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" aria-label="Toggle theme">
            {theme === "dark" ? <SunIcon className="h-[1.2rem] w-[1.2rem] text-zinc-400" /> : <MoonIcon className="h-[1.2rem] w-[1.2rem] text-zinc-400" />}
          </Button>
          <Link to="/app">
            <Button className="bg-[#007AFF] text-white hover:bg-[#0062CC] rounded-xl">
              Start Now
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
