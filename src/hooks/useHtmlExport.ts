
import { useState } from "react";
import { SopDocument } from "@/types/sop";
import { exportSopAsHtml } from "@/lib/html-export";
import { toast } from "@/hooks/use-toast";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";

export const useHtmlExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | Error | null>(null);
  const { canUseHtmlExport, incrementDailyHtmlExport, isAdmin } = useSubscription();
  const { user } = useAuth();

  const handleExportHtml = async (sopDocument: SopDocument) => {
    // Super user access check
    const isSuperUser = user?.email === 'tribbit@tribbit.gg';
    
    if (!canUseHtmlExport && !isSuperUser && !isAdmin) {
      toast({
        title: "Subscription Required",
        description: "HTML export requires a Pro HTML subscription.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportProgress("Preparing HTML");
    setExportError(null);

    try {
      // Validate document
      if (!sopDocument.steps.length) {
        throw new Error("Cannot export an empty SOP. Add at least one step.");
      }

      setExportProgress("Creating ZIP file");
      await exportSopAsHtml(sopDocument);
      
      // Only increment counter for regular users (not admin or super user)
      if (!isAdmin && !isSuperUser) {
        incrementDailyHtmlExport();
      }
      
      setExportProgress(null);
      toast({
        title: "Export Complete",
        description: "Your SOP has been exported as HTML.",
      });
    } catch (error) {
      console.error("HTML export error:", error);
      setExportError(error instanceof Error ? error : new Error("Unknown error during export"));
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error during export",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportProgress,
    exportError,
    handleExportHtml,
  };
};
