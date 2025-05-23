import { useState } from "react";
import { SopDocument } from "@/types/sop";
import { exportSopAsHtml, HtmlExportOptions } from "@/lib/html-export";
import { toast } from "@/hooks/use-toast";
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
    options?: HtmlExportOptions
  ) => {
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
    setExportProgress("Preparing HTML export...");
    setExportError(null);

    try {
      // Validate document
      if (!sopDocument.steps.length) {
        throw new Error("Cannot export an empty SOP. Add at least one step.");
      }

      const exportOptions: HtmlExportOptions = {
        mode: options?.mode || exportMode,
        quality: options?.quality || 0.85
      };

      if (exportOptions.mode === 'standalone') {
        setExportProgress("Processing screenshots with callouts...");
        // Additional progress updates will be handled by the export function
      } else {
        setExportProgress("Creating ZIP file with assets...");
      }

      await exportSopAsHtml(sopDocument, exportOptions);
      
      // Only increment counter for regular users (not admin or super user)
      if (!isAdmin && !isSuperUser) {
        incrementDailyHtmlExport();
      }
      
      setExportProgress(null);
      
      const modeText = exportOptions.mode === 'standalone' ? 'standalone HTML file' : 'ZIP package';
      toast({
        title: "Export Complete",
        description: `Your SOP has been exported as a ${modeText}.`,
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
