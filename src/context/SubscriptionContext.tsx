
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getUserSubscription, supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

type SubscriptionTier = "free" | "pro" | "admin" | null;

interface SubscriptionContextType {
  tier: SubscriptionTier;
  isPro: boolean;
  isAdmin: boolean;
  loading: boolean;
  pdfCount: number;
  pdfLimit: number;
  canGeneratePdf: boolean;
  refreshSubscription: () => Promise<void>;
  incrementPdfCount: () => void;
  showUpgradePrompt: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  tier: null,
  isPro: false,
  isAdmin: false,
  loading: true,
  pdfCount: 0,
  pdfLimit: 0,
  canGeneratePdf: false,
  refreshSubscription: async () => {},
  incrementPdfCount: () => {},
  showUpgradePrompt: () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pdfCount, setPdfCount] = useState<number>(0);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(true);
  
  // PDF limits based on tier - strictly enforce 1 per day for free tier
  const pdfLimit = tier === "pro" || tier === "admin" ? Infinity : 1;
  const isPro = tier === "pro" || tier === "admin";
  const isAdmin = tier === "admin";
  const canGeneratePdf = tier === "pro" || tier === "admin" || pdfCount < pdfLimit;
  
  // Show upgrade prompt when limit is reached
  const showUpgradePrompt = () => {
    toast({
      title: "Daily PDF Limit Reached",
      description: "Upgrade to Pro for unlimited PDF exports.",
      variant: "destructive",
      action: (
        <a 
          href="#pricing" 
          className="bg-[#007AFF] hover:bg-[#0069D9] text-white px-3 py-2 rounded-md text-xs"
          onClick={() => {
            // If on home page anchor to pricing, otherwise navigate to home page
            if (!window.location.pathname.includes('/app')) return;
            window.location.href = '/#pricing';
          }}
        >
          Upgrade to Pro
        </a>
      ),
    });
  };
  
  // Check if Supabase is properly connected
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        // Simple query to check connection
        const { error } = await supabase.from('pdf_usage').select('count', { count: 'exact', head: true });
        setSupabaseConnected(error === null || (error && error.message !== 'FetchError: fetch failed'));
      } catch (error) {
        console.error("Supabase connection check failed:", error);
        setSupabaseConnected(false);
        
        toast({
          title: "Connection Error",
          description: "Failed to connect to database. Some features may be limited.",
          variant: "destructive",
        });
      }
    };
    
    checkSupabaseConnection();
  }, []);
  
  // Fetch user's subscription data with proper error handling
  const fetchSubscription = async () => {
    try {
      if (!user || !supabaseConnected) {
        setTier("free");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      console.log("Fetching subscription for user:", user.id);
      
      // First check if user has a subscription record
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching subscription:", error);
        throw error;
      }
      
      // If no subscription record found, create a free tier one
      if (!subscription) {
        console.log("No subscription found, creating free tier record");
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            tier: 'free',
            status: 'active',
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error("Error creating subscription record:", insertError);
          throw insertError;
        }
        
        setTier("free");
      } else {
        // Check if user has an active pro or admin subscription
        console.log("Found subscription:", subscription);
        if (subscription.status === "active") {
          if (subscription.tier === "admin") {
            setTier("admin");
          } else if (subscription.tier === "pro") {
            setTier("pro");
          } else {
            setTier("free");
          }
          
          // If free tier, get today's usage count
          if (subscription.tier === "free") {
            // Get today's usage count for free tier
            const today = new Date().toISOString().split('T')[0];
            try {
              const { count } = await supabase
                .from('pdf_usage')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id)
                .gte('created_at', `${today}T00:00:00`)
                .lt('created_at', `${today}T23:59:59`);
                
              setPdfCount(count || 0);
              console.log(`User has created ${count} PDFs today (limit: ${pdfLimit})`);
            } catch (error) {
              console.error("Error fetching PDF usage count:", error);
              setPdfCount(0);
            }
          }
        } else {
          setTier("free");
        }
      }
    } catch (error: any) {
      console.error("Error in fetchSubscription:", error);
      toast({
        title: "Error",
        description: "Failed to load your subscription information",
        variant: "destructive",
      });
      setTier("free"); // Default to free on error
    } finally {
      setLoading(false);
    }
  };
  
  // Increment PDF count when a PDF is generated
  const incrementPdfCount = () => {
    setPdfCount((prev) => prev + 1);
  };
  
  // Refresh subscription data
  const refreshSubscription = async () => {
    await fetchSubscription();
  };
  
  // Fetch subscription when user changes
  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setTier(null);
      setPdfCount(0);
    }
  }, [user, supabaseConnected]);
  
  const value = {
    tier,
    isPro,
    isAdmin,
    loading,
    pdfCount,
    pdfLimit,
    canGeneratePdf,
    refreshSubscription,
    incrementPdfCount,
    showUpgradePrompt,
  };
  
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;
