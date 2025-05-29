
// Main entry point for PDF export functionality
import { useState } from "react";
import { SopDocument } from "@/types/sop";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { handleExport, handlePreview } from "./export-functions";
import { checkUserPermissions } from "./permissions";

/**
 * Custom hook for PDF export functionality
 */
export function usePdfExport() {
  const { user } = useAuth();
  const { 
    canGeneratePdf, 
    isPro,
    refreshSubscription,
    incrementPdfCount,
    showUpgradePrompt,
    isAdmin
  } = useSubscription();
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const exportPdf = async (sopDocument: SopDocument) => {
    // Check permissions first
    const hasPermission = await checkUserPermissions(
      user,
      canGeneratePdf,
      showUpgradePrompt,
      isAdmin
    );
    
    if (!hasPermission) return;
    
    await handleExport(
      sopDocument,
      user,
      canGeneratePdf,
      showUpgradePrompt,
      isPro,
      incrementPdfCount,
      refreshSubscription,
      setIsExporting,
      setExportProgress,
      setExportError,
      isAdmin
    );
  };

  const previewPdf = async (sopDocument: SopDocument) => {
    // Check permissions first
    const hasPermission = await checkUserPermissions(
      user,
      canGeneratePdf,
      showUpgradePrompt,
      isAdmin
    );
    
    if (!hasPermission) return;
    
    await handlePreview(
      sopDocument,
      user,
      canGeneratePdf,
      showUpgradePrompt,
      isPro,
      setIsExporting,
      setExportProgress,
      setExportError,
      setPdfPreviewUrl,
      setIsPreviewOpen,
      isAdmin
    );
  };

  return {
    isExporting,
    exportProgress,
    pdfPreviewUrl,
    exportError,
    isPreviewOpen,
    setIsPreviewOpen,
    handleExport: exportPdf,
    handlePreview: previewPdf
  };
}
