import { toast } from "@/hooks/use-toast";
import { createPdfUsageRecord } from "@/lib/supabase";
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if the user is an admin
 */
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  // Special case for our designated admin email
  const { data: userData } = await supabase.auth.getUser(userId);
  if (userData?.user?.email === 'Onoki82@gmail.com') {
    return true;
  }
  
  try {
    // Direct query without using RLS
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    return !!data && !error;
  } catch (err) {
    console.error("Error checking admin status:", err);
    return false;
  }
};

/**
 * Checks if user can export PDF
 */
export const checkUserPermissions = async (
  user: any,
  canGeneratePdf: boolean,
  showUpgradePrompt: () => void,
  isAdmin: boolean = false
): Promise<boolean> => {
  if (!user) {
    toast({
      title: "Authentication Required",
      description: "Please sign in to export PDFs.",
      variant: "destructive"
    });
    return false;
  }

  // Special case for our admin user
  if (user.email === 'Onoki82@gmail.com') {
    return true;
  }

  // Admins can always generate PDFs
  if (isAdmin) {
    return true;
  }

  if (!canGeneratePdf) {
    // Show upgrade prompt with link to subscription options
    showUpgradePrompt();
    return false;
  }
  
  return true;
};

/**
 * Records PDF usage in database
 */
export const recordPdfUsage = async (
  user: any,
  incrementPdfCount: () => void,
  refreshSubscription: () => Promise<void>,
  isAdmin: boolean = false
) => {
  if (user) {
    try {
      // Special case for our admin user or admins - don't track usage
      if (user.email === 'Onoki82@gmail.com' || isAdmin) {
        // Skip tracking
      } else {
        await createPdfUsageRecord(user.id);
        incrementPdfCount();
      }
      await refreshSubscription();
    } catch (err) {
      console.error("Error recording PDF usage:", err);
      // Continue even if usage recording fails
    }
  }
};
