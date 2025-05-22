
import { useState } from "react";
import { SopDocument } from "@/types/sop";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { toast } from "@/hooks/use-toast";
import { generatePDF } from "@/lib/pdf-generator";
import { createPdfUsageRecord } from "@/lib/supabase";

/**
 * Custom hook for PDF export functionality
 */
export function usePdfExport() {
  const { user } = useAuth();
  const { canGeneratePdf, incrementPdfCount, refreshSubscription, isPro } = useSubscription();
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Document validation functions
  
  /**
   * Validates SOP document before export
   */
  const validateDocument = (sopDocument: SopDocument): boolean => {
    if (!validateTitle(sopDocument)) return false;
    if (!validateTopic(sopDocument)) return false;
    if (!validateSteps(sopDocument)) return false;
    
    // Verify Pro status for background image
    if (sopDocument.backgroundImage && !isPro) {
      showValidationError(
        "Pro Feature Required", 
        "Custom backgrounds are only available with a Pro subscription."
      );
      return false;
    }
    
    return true;
  };
  
  /**
   * Validates document title
   */
  const validateTitle = (sopDocument: SopDocument): boolean => {
    if (!sopDocument.title) {
      showValidationError("SOP Title Required", "Please provide a title for your SOP document.");
      return false;
    }
    return true;
  };
  
  /**
   * Validates document topic
   */
  const validateTopic = (sopDocument: SopDocument): boolean => {
    if (!sopDocument.topic) {
      showValidationError("Topic Required", "Please provide a topic for your SOP document.");
      return false;
    }
    return true;
  };
  
  /**
   * Validates steps content
   */
  const validateSteps = (sopDocument: SopDocument): boolean => {
    // Validate that at least one step exists
    if (sopDocument.steps.length === 0) {
      showValidationError("No Steps Found", "Please add at least one step to your SOP document.");
      return false;
    }

    // Validate that all steps have descriptions
    for (let i = 0; i < sopDocument.steps.length; i++) {
      const step = sopDocument.steps[i];
      if (!step.description) {
        showValidationError(
          "Step Description Required", 
          `Please provide a description for step ${i + 1}.`
        );
        return false;
      }
    }
    
    return true;
  };
  
  /**
   * Shows validation error toast
   */
  const showValidationError = (title: string, description: string) => {
    toast({
      title,
      description,
      variant: "destructive"
    });
  };
  
  // Permission and usage handling
  
  /**
   * Checks if user can export PDF
   */
  const checkUserPermissions = (): boolean => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to export PDFs.",
        variant: "destructive"
      });
      return false;
    }

    if (!canGeneratePdf) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily PDF export limit. Upgrade to Pro for unlimited exports.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  /**
   * Records PDF usage in database
   */
  const recordPdfUsage = async () => {
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
  
  // Progress tracking
  
  /**
   * Sets up progress tracking via console.log
   */
  const setupProgressTracking = () => {
    const originalConsoleLog = console.log;
    console.log = (message, ...args) => {
      originalConsoleLog(message, ...args);
      if (typeof message === 'string') {
        if (message.includes("Creating cover page")) {
          setExportProgress("Creating cover page...");
        } else if (message.includes("Rendering")) {
          setExportProgress("Rendering steps...");
        } else if (message.includes("Steps rendered")) {
          setExportProgress("Finalizing document...");
        }
      }
    };
    
    return originalConsoleLog;
  };
  
  // Error handling
  
  /**
   * Handles export errors
   */
  const handleExportError = (error: unknown, isPreview = false) => {
    console.error(`PDF ${isPreview ? 'preview' : 'generation'} error:`, error);
    setExportError(error instanceof Error ? error.message : "Unknown error");
    toast({
      title: "Error",
      description: error instanceof Error 
        ? `Failed to generate PDF ${isPreview ? 'preview' : ''}: ${error.message}` 
        : `Failed to generate PDF ${isPreview ? 'preview' : ''}. Check console for details.`,
      variant: "destructive"
    });
  };
  
  // Core export functions
  
  /**
   * Handles PDF export
   */
  const handleExport = async (sopDocument: SopDocument) => {
    // Check permissions before starting
    if (!checkUserPermissions()) return;
    
    // Clear previous errors and progress
    setExportError(null);
    setExportProgress(null);
    
    // Validate document before starting
    if (!validateDocument(sopDocument)) return;
    
    try {
      setIsExporting(true);
      setExportProgress("Preparing document...");
      
      toast({
        title: "Creating PDF",
        description: "Please wait while your PDF is being generated..."
      });
      
      console.log("Starting PDF export");
      
      // Track progress with console logs
      const originalConsoleLog = setupProgressTracking();
      
      const pdfDataUrl = await generatePDF(sopDocument);
      
      // Restore console.log
      console.log = originalConsoleLog;
      
      if (!pdfDataUrl) {
        throw new Error("PDF generation returned empty result");
      }
      
      setExportProgress("Recording usage...");
      
      // Record PDF usage in database
      await recordPdfUsage();
      
      setExportProgress(null);
      toast({
        title: "PDF Generated",
        description: "Your SOP has been successfully generated and downloaded."
      });
    } catch (error) {
      handleExportError(error);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };
  
  /**
   * Handles PDF preview generation
   */
  const handlePreview = async (sopDocument: SopDocument) => {
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
      const originalConsoleLog = setupProgressTracking();
      
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
      handleExportError(error, true);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  return {
    isExporting,
    exportProgress,
    pdfPreviewUrl,
    exportError,
    isPreviewOpen,
    setIsPreviewOpen,
    handleExport,
    handlePreview
  };
}
