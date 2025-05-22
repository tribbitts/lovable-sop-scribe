
import { SopDocument } from "@/types/sop";
import { toast } from "@/hooks/use-toast";
import { generatePDF } from "@/lib/pdf-generator";
import { checkUserPermissions, recordPdfUsage } from "./permissions";
import { validateDocument } from "./validation";
import { setupProgressTracking } from "./progress-tracking";
import { handleExportError } from "./error-handling";

/**
 * Handles PDF export
 */
export const handleExport = async (
  sopDocument: SopDocument,
  user: any,
  canGeneratePdf: boolean,
  showUpgradePrompt: () => void,
  isPro: boolean,
  incrementPdfCount: () => void,
  refreshSubscription: () => Promise<void>,
  setIsExporting: (isExporting: boolean) => void,
  setExportProgress: (progress: string | null) => void,
  setExportError: (error: string | null) => void
) => {
  // Check permissions before starting
  if (!checkUserPermissions(user, canGeneratePdf, showUpgradePrompt)) return;
  
  // Clear previous errors and progress
  setExportError(null);
  setExportProgress(null);
  
  // Validate document before starting
  if (!validateDocument(sopDocument, isPro)) return;
  
  try {
    setIsExporting(true);
    setExportProgress("Preparing document...");
    
    toast({
      title: "Creating PDF",
      description: "Please wait while your PDF is being generated..."
    });
    
    console.log("Starting PDF export");
    
    // Track progress with console logs
    const originalConsoleLog = setupProgressTracking(setExportProgress);
    
    const pdfDataUrl = await generatePDF(sopDocument);
    
    // Restore console.log
    console.log = originalConsoleLog;
    
    if (!pdfDataUrl) {
      throw new Error("PDF generation returned empty result");
    }
    
    setExportProgress("Recording usage...");
    
    // Record PDF usage in database
    await recordPdfUsage(user, incrementPdfCount, refreshSubscription);
    
    setExportProgress(null);
    toast({
      title: "PDF Generated",
      description: "Your SOP has been successfully generated and downloaded."
    });
  } catch (error) {
    handleExportError(error, setExportError);
  } finally {
    setIsExporting(false);
    setExportProgress(null);
  }
};

/**
 * Handles PDF preview generation
 */
export const handlePreview = async (
  sopDocument: SopDocument,
  user: any,
  canGeneratePdf: boolean,
  showUpgradePrompt: () => void,
  isPro: boolean,
  setIsExporting: (isExporting: boolean) => void,
  setExportProgress: (progress: string | null) => void,
  setExportError: (error: string | null) => void,
  setPdfPreviewUrl: (url: string | null) => void,
  setIsPreviewOpen: (isOpen: boolean) => void
) => {
  if (!checkUserPermissions(user, canGeneratePdf, showUpgradePrompt)) return;
  
  if (!sopDocument.title || !sopDocument.topic) {
    toast({
      title: "Missing Information",
      description: "Please provide a title and topic before previewing.",
      variant: "destructive"
    });
    return;
  }
  
  // Verify Pro status for background image
  if (sopDocument.backgroundImage && !isPro) {
    toast({
      title: "Pro Feature Required",
      description: "Custom backgrounds are only available with a Pro subscription.",
      variant: "destructive"
    });
    return;
  }
  
  // Clear previous errors and progress
  setExportError(null);
  setExportProgress(null);
  setPdfPreviewUrl(null);
  
  try {
    // Show loading toast
    toast({
      title: "Generating Preview",
      description: "Creating PDF preview..."
    });
    
    setIsExporting(true);
    setExportProgress("Preparing preview...");
    
    // Track progress with console logs
    const originalConsoleLog = setupProgressTracking(setExportProgress);
    
    // Generate PDF and get base64 data URL
    const pdfDataUrl = await generatePDF(sopDocument);
    
    // Restore console.log
    console.log = originalConsoleLog;
    
    if (!pdfDataUrl) {
      throw new Error("PDF preview generation returned empty result");
    }
    
    // Set the preview URL and open modal
    setPdfPreviewUrl(pdfDataUrl);
    setIsPreviewOpen(true);
    setExportProgress(null);
    
    toast({
      title: "Preview Ready",
      description: "PDF preview has been generated."
    });
  } catch (error) {
    handleExportError(error, setExportError, true);
  } finally {
    setIsExporting(false);
    setExportProgress(null);
  }
};
