
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getUserSubscription } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

type SubscriptionTier = "free" | "pro" | null;

interface SubscriptionContextType {
  tier: SubscriptionTier;
  isPro: boolean;
  loading: boolean;
  pdfCount: number;
  pdfLimit: number;
  canGeneratePdf: boolean;
  refreshSubscription: () => Promise<void>;
  incrementPdfCount: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  tier: null,
  isPro: false,
  loading: true,
  pdfCount: 0,
  pdfLimit: 0,
  canGeneratePdf: false,
  refreshSubscription: async () => {},
  incrementPdfCount: () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pdfCount, setPdfCount] = useState<number>(0);
  
  // PDF limits based on tier
  const pdfLimit = tier === "pro" ? Infinity : 1;
  const isPro = tier === "pro";
  const canGeneratePdf = tier === "pro" || pdfCount < pdfLimit;
  
  // Fetch user's subscription data
  const fetchSubscription = async () => {
    try {
      if (!user) {
        setTier("free");
        return;
      }
      
      setLoading(true);
      const subscription = await getUserSubscription(user.id);
      
      // Check if user has an active pro subscription
      if (subscription && subscription.status === "active") {
        setTier("pro");
      } else {
        setTier("free");
        
        // Get today's usage count for free tier
        const today = new Date().toISOString().split('T')[0];
        const { data, count } = await supabase
          .from('pdf_usage')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00`)
          .lt('created_at', `${today}T23:59:59`);
          
        setPdfCount(count || 0);
      }
    } catch (error: any) {
      console.error("Error fetching subscription:", error);
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
    fetchSubscription();
  }, [user]);
  
  const value = {
    tier,
    isPro,
    loading,
    pdfCount,
    pdfLimit,
    canGeneratePdf,
    refreshSubscription,
    incrementPdfCount,
  };
  
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
