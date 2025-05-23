
// Main entry point for PDF export functionality
import { useState } from "react";
import { SopDocument } from "@/types/sop";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { handleExport, handlePreview } from "./export-functions";

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
    showUpgradePrompt
  } = useSubscription();
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const exportPdf = async (sopDocument: SopDocument) => {
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
      setExportError
    );
  };

  const previewPdf = async (sopDocument: SopDocument) => {
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
      setIsPreviewOpen
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
