
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionTier } from "@/types/sop";
import { toast } from "@/hooks/use-toast";
import { checkIsAdmin } from "@/hooks/pdf-export/permissions";

interface SubscriptionContextType {
  tier: SubscriptionTier;
  loading: boolean;
  isAdmin: boolean;
  canGeneratePdf: boolean;
  canUseHtmlExport: boolean;
  refreshSubscription: () => Promise<void>;
  dailyPdfExports: number;
  incrementDailyPdfExport: () => void;
  dailyHtmlExports: number;
  incrementDailyHtmlExport: () => void;
  isPro: boolean;
  pdfCount: number;
  pdfLimit: number;
  incrementPdfCount: () => void;
  showUpgradePrompt: () => void;
}

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

// Create context with default values
const SubscriptionContext = createContext<SubscriptionContextType>({
  tier: "free",
  loading: false,
  isAdmin: false,
  canGeneratePdf: true,
  canUseHtmlExport: false,
  refreshSubscription: async () => {},
  dailyPdfExports: 0,
  incrementDailyPdfExport: () => {},
  dailyHtmlExports: 0,
  incrementDailyHtmlExport: () => {},
  isPro: false,
  pdfCount: 0,
  pdfLimit: 1,
  incrementPdfCount: () => {},
  showUpgradePrompt: () => {},
});

// Storage keys
const PDF_EXPORTS_KEY = "sop_daily_pdf_exports";
const HTML_EXPORTS_KEY = "sop_daily_html_exports";
const LAST_EXPORT_DATE_KEY = "sop_last_export_date";

// Export the provider component
export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [loading, setLoading] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [dailyPdfExports, setDailyPdfExports] = useState<number>(0);
  const [dailyHtmlExports, setDailyHtmlExports] = useState<number>(0);

  // Reset daily counters if date has changed
  const checkAndResetDailyCounters = () => {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem(LAST_EXPORT_DATE_KEY);
    
    if (lastDate !== today) {
      localStorage.setItem(LAST_EXPORT_DATE_KEY, today);
      localStorage.setItem(PDF_EXPORTS_KEY, "0");
      localStorage.setItem(HTML_EXPORTS_KEY, "0");
      setDailyPdfExports(0);
      setDailyHtmlExports(0);
    }
  };

  // Initialize daily exports from localStorage
  useEffect(() => {
    checkAndResetDailyCounters();
    
    const storedPdfExports = localStorage.getItem(PDF_EXPORTS_KEY);
    if (storedPdfExports) {
      setDailyPdfExports(parseInt(storedPdfExports, 10));
    }
    
    const storedHtmlExports = localStorage.getItem(HTML_EXPORTS_KEY);
    if (storedHtmlExports) {
      setDailyHtmlExports(parseInt(storedHtmlExports, 10));
    }
  }, []);

  // Fetch subscription data when user changes
  useEffect(() => {
    if (user) {
      refreshSubscription();
    } else {
      setTier("free");
      setIsAdmin(false);
    }
  }, [user]);

  // Function to refresh subscription data
  const refreshSubscription = async () => {
    if (!user) {
      setTier("free");
      setIsAdmin(false);
      return;
    }

    setLoading(true);
    try {
      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Determine admin status (local variable to avoid race condition)
      let userIsAdmin = !!adminData && !adminError;
      
            // Special case for our designated admin emails      if (user.email === 'Onoki82@gmail.com' ||           user.email === 'TimothyHolsborg@primarypartnercare.com' ||          user.email?.toLowerCase().includes('timothyholsborg') ||          user.email?.toLowerCase().includes('primarypartnercare')) {        userIsAdmin = true;      }

      // Set admin status
      setIsAdmin(userIsAdmin);

      // If user is admin, they have all permissions
      if (userIsAdmin) {
        setTier("pro-complete");
        setLoading(false);
        return;
      }

      // Get subscription for non-admin users
      const { data, error } = await supabase
        .from('subscriptions')
        .select('tier, status')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        setTier("free");
      } else if (data) {
        // Make sure status is active
        if (data.status === 'active') {
          // Validate that tier is one of the expected values
          const validTiers: SubscriptionTier[] = ["free", "pro-pdf", "pro-html", "pro-complete"];
          const validTier = validTiers.includes(data.tier as SubscriptionTier) 
            ? data.tier as SubscriptionTier 
            : "free";
          
          setTier(validTier);
          console.log(`Set subscription tier to ${validTier} for user ${user.id}`);
        } else {
          setTier("free");
          console.log(`User ${user.id} has inactive subscription, setting to free tier`);
        }
      } else {
        setTier("free");
        console.log(`No subscription found for user ${user.id}, setting to free tier`);
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      setTier("free");
    } finally {
      setLoading(false);
    }
  };

  // Increment daily PDF exports
  const incrementDailyPdfExport = () => {
    // Admins are not limited by daily exports
    if (isAdmin) return;
    
    checkAndResetDailyCounters();
    const newCount = dailyPdfExports + 1;
    setDailyPdfExports(newCount);
    localStorage.setItem(PDF_EXPORTS_KEY, newCount.toString());
  };

  // Increment daily HTML exports
  const incrementDailyHtmlExport = () => {
    // Admins are not limited by daily exports
    if (isAdmin) return;
    
    checkAndResetDailyCounters();
    const newCount = dailyHtmlExports + 1;
    setDailyHtmlExports(newCount);
    localStorage.setItem(HTML_EXPORTS_KEY, newCount.toString());
  };

  // Determine if user can generate PDF
  const canGeneratePdf = () => {
    if (isAdmin) return true;
    if (tier === "pro-pdf" || tier === "pro-complete") return true;
    if (tier === "free" && dailyPdfExports < 1) return true;
    return false;
  };

  // Determine if user can use HTML export
  const canUseHtmlExport = () => {
    if (isAdmin) return true; 
    if (tier === "pro-html" || tier === "pro-complete") return true;
    return false;
  };

  // Helper function to check if user has any pro tier
  const isPro = () => {
    return tier === "pro-pdf" || tier === "pro-html" || tier === "pro-complete" || isAdmin;
  };

  // Alias for incrementDailyPdfExport to match expected function name
  const incrementPdfCount = () => {
    incrementDailyPdfExport();
  };

  // Show upgrade prompt function
  const showUpgradePrompt = () => {
    toast({
      title: "Subscription Required",
      description: "Upgrade to a Pro plan to use this feature.",
      variant: "destructive"
    });
  };

  const value = {
    tier,
    loading,
    isAdmin,
    canGeneratePdf: canGeneratePdf(),
    canUseHtmlExport: canUseHtmlExport(),
    refreshSubscription,
    dailyPdfExports,
    incrementDailyPdfExport,
    dailyHtmlExports,
    incrementDailyHtmlExport,
    isPro: isPro(),
    pdfCount: dailyPdfExports,
    pdfLimit: tier === "free" ? 1 : 999,
    incrementPdfCount,
    showUpgradePrompt,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Custom hook to use the subscription context
export const useSubscription = () => useContext(SubscriptionContext);
