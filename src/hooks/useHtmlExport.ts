
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { exportSopAsHtml, HtmlExportOptions } from "@/lib/html-export";
import { SopDocument } from "@/types/sop";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";

export const useHtmlExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | Error | null>(null);
  const [exportMode, setExportMode] = useState<'standalone' | 'zip'>('standalone');
  const { canUseHtmlExport, incrementDailyHtmlExport, isAdmin } = useSubscription();
  const { user } = useAuth();

  const handleExportHtml = async (
    sopDocument: SopDocument,
    options?: HtmlExportOptions & { 
      enhanced?: boolean; 
      enhancedOptions?: any; 
      trainingOptions?: any;
      includeFeedback?: boolean;
      feedbackEmail?: string;
    }
  ) => {
    // Super user access check - multiple emails for Timothy
    const isSuperUser = user?.email === 'tribbit@tribbit.gg' || 
                       user?.email === 'TimothyHolsborg@primarypartnercare.com' ||
                       user?.email?.toLowerCase().includes('timothyholsborg') ||
                       user?.email?.toLowerCase().includes('primarypartnercare') ||
                       user?.email === 'Onoki82@gmail.com';
    
    if (!canUseHtmlExport && !isSuperUser && !isAdmin) {
      toast({
        title: "Subscription Required",
        description: "HTML export requires a Pro HTML subscription.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportProgress("Preparing HTML export...");
    setExportError(null);

    try {
      // Validate document
      if (!sopDocument.steps.length) {
        throw new Error("Cannot export an empty SOP. Add at least one step.");
      }

      const exportOptions: HtmlExportOptions = {
        mode: options?.mode || exportMode,
        quality: options?.quality || 0.85,
        enhanced: options?.enhanced || false,
        enhancedOptions: options?.enhancedOptions,
        feedback: options?.includeFeedback ? {
          enableSupabaseIntegration: true,
          emailAddress: options?.feedbackEmail || "feedback@sopify.com",
          companyName: sopDocument.companyName || "SOPify"
        } : undefined
      };

      if (exportOptions.enhanced) {
        setExportProgress("Creating enhanced training module with feedback system...");
      } else if (exportOptions.mode === 'standalone') {
        setExportProgress("Processing screenshots with callouts...");
      } else {
        setExportProgress("Creating ZIP file with assets...");
      }

      await exportSopAsHtml(sopDocument, exportOptions);
      
      // Only increment counter for regular users (not admin or super user)
      if (!isAdmin && !isSuperUser) {
        incrementDailyHtmlExport();
      }
      
      setExportProgress(null);
      
      const exportType = exportOptions.enhanced ? 'enhanced training module' : 
                        (exportOptions.mode === 'standalone' ? 'standalone HTML file' : 'ZIP package');
      toast({
        title: "Export Complete",
        description: `Your SOP has been exported as a ${exportType}${options?.includeFeedback ? ' with feedback system' : ''}.`,
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
    exportMode,
    setExportMode,
    handleExportHtml,
  };
};
