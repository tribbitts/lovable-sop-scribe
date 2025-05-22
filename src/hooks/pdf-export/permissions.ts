
import { toast } from "@/hooks/use-toast";
import { createPdfUsageRecord } from "@/lib/supabase";

/**
 * Checks if user can export PDF
 */
export const checkUserPermissions = (
  user: any,
  canGeneratePdf: boolean,
  showUpgradePrompt: () => void
): boolean => {
  if (!user) {
    toast({
      title: "Authentication Required",
      description: "Please sign in to export PDFs.",
      variant: "destructive"
    });
    return false;
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
  refreshSubscription: () => Promise<void>
) => {
  if (user) {
    try {
      await createPdfUsageRecord(user.id);
      incrementPdfCount();
      await refreshSubscription();
    } catch (err) {
      console.error("Error recording PDF usage:", err);
      // Continue even if usage recording fails
    }
  }
};
