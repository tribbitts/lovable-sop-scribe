
import { Link } from "react-router-dom";
import { MoonIcon, SunIcon, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { tier, isAdmin } = useSubscription();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getTierBadge = () => {
    if (isAdmin) return { name: "Admin", color: "bg-blue-600" };
    if (tier === "pro") return { name: "Pro", color: "bg-green-600" };
    if (tier === "pro-learning") return { name: "Business", color: "bg-purple-600" };
    return { name: "Free", color: "bg-zinc-600" };
  };

  const tierBadge = getTierBadge();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-[#121212]/80 border-b border-zinc-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <span className="text-2xl font-medium tracking-tight text-white">SOP</span>
          <span className="text-2xl font-light tracking-tight text-[#007AFF]">ify</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">How It Works</a>
          <a href="#demos" className="text-sm text-zinc-400 hover:text-white transition-colors">Live Demos</a>
          <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" aria-label="Toggle theme">
            {theme === "dark" ? <SunIcon className="h-[1.2rem] w-[1.2rem] text-zinc-400" /> : <MoonIcon className="h-[1.2rem] w-[1.2rem] text-zinc-400" />}
          </Button>
          
          {user ? (
            <div className="flex items-center gap-3">
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-zinc-300 hover:text-white">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden md:inline truncate max-w-[120px]">
                        {user.email?.split('@')[0]}
                      </span>
                      <Badge className={`${tierBadge.color} text-white text-xs hidden sm:inline-flex`}>
                        {tierBadge.name}
                      </Badge>
                    </div>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#1E1E1E] border-zinc-800">
                  <div className="px-2 py-1.5">
                    <p className="text-sm text-zinc-400">Signed in as</p>
                    <p className="text-sm font-medium text-white truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-zinc-700" />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 text-zinc-300 hover:text-white">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-700" />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-zinc-300 hover:text-white cursor-pointer"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Go to App Button */}
              <Link to="/app">
                <Button className="bg-[#007AFF] text-white hover:bg-[#0062CC] rounded-xl">
                  Go to App
                </Button>
              </Link>
            </div>
          ) : (
            <Link to="/app">
              <Button className="bg-[#007AFF] text-white hover:bg-[#0062CC] rounded-xl">
                Start Now
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
