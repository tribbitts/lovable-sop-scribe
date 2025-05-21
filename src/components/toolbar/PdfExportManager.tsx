
import { useState } from "react";
import { useSopContext } from "@/context/SopContext";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { toast } from "@/hooks/use-toast";
import { generatePDF } from "@/lib/pdf-generator";
import { createPdfUsageRecord } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import PreviewButton from "./PreviewButton";
import ExportButton from "./ExportButton";
import PdfPreviewDialog from "./PdfPreviewDialog";

const PdfExportManager = () => {
  const { sopDocument } = useSopContext();
  const { user } = useAuth();
  const { canGeneratePdf, incrementPdfCount, refreshSubscription } = useSubscription();
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  
  const validateDocument = () => {
    if (!sopDocument.title) {
      toast({
        title: "SOP Title Required",
        description: "Please provide a title for your SOP document.",
        variant: "destructive"
      });
      return false;
    }

    if (!sopDocument.topic) {
      toast({
        title: "Topic Required",
        description: "Please provide a topic for your SOP document.",
        variant: "destructive"
      });
      return false;
    }

    // Validate that at least one step exists
    if (sopDocument.steps.length === 0) {
      toast({
        title: "No Steps Found",
        description: "Please add at least one step to your SOP document.",
        variant: "destructive"
      });
      return false;
    }

    // Validate that all steps have descriptions
    for (let i = 0; i < sopDocument.steps.length; i++) {
      const step = sopDocument.steps[i];
      if (!step.description) {
        toast({
          title: "Step Description Required",
          description: `Please provide a description for step ${i + 1}.`,
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleExport = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to export PDFs.",
        variant: "destructive"
      });
      return;
    }

    if (!canGeneratePdf) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily PDF export limit. Upgrade to Pro for unlimited exports.",
        variant: "destructive"
      });
      return;
    }

    // Clear previous errors and progress
    setExportError(null);
    setExportProgress(null);
    
    // Validate document before starting
    if (!validateDocument()) return;
    
    try {
      setIsExporting(true);
      setExportProgress("Preparing document...");
      
      toast({
        title: "Creating PDF",
        description: "Please wait while your PDF is being generated..."
      });
      
      console.log("Starting PDF export");
      
      // Track progress with console logs
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
      
      const pdfDataUrl = await generatePDF(sopDocument);
      
      // Restore console.log
      console.log = originalConsoleLog;
      
      if (!pdfDataUrl) {
        throw new Error("PDF generation returned empty result");
      }
      
      setExportProgress("Recording usage...");
      
      // Record PDF usage in database
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
      
      setExportProgress(null);
      toast({
        title: "PDF Generated",
        description: "Your SOP has been successfully generated and downloaded."
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      setExportError(error instanceof Error ? error.message : "Unknown error");
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Failed to generate PDF: ${error.message}` 
          : "Failed to generate PDF. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const handlePreview = async () => {
    if (!sopDocument.title || !sopDocument.topic) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and topic before previewing.",
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
      
      // Track progress with console logs for preview too
      const originalConsoleLog = console.log;
      console.log = (message, ...args) => {
        originalConsoleLog(message, ...args);
        if (typeof message === 'string') {
          if (message.includes("Creating cover page")) {
            setExportProgress("Creating cover page...");
          } else if (message.includes("Rendering")) {
            setExportProgress("Rendering steps...");
          } else if (message.includes("Steps rendered")) {
            setExportProgress("Finalizing preview...");
          }
        }
      };
      
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
      console.error("PDF preview error:", error);
      setExportError(error instanceof Error ? error.message : "Unknown error");
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Failed to generate PDF preview: ${error.message}` 
          : "Failed to generate PDF preview. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <PreviewButton 
        onClick={handlePreview} 
        disabled={sopDocument.steps.length === 0} 
        isExporting={isExporting}
        exportProgress={exportProgress}
      />
      
      <ExportButton 
        onClick={handleExport} 
        isExporting={isExporting} 
        exportProgress={exportProgress} 
        disabled={sopDocument.steps.length === 0}
      />
      
      <PdfPreviewDialog
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        isExporting={isExporting}
        exportProgress={exportProgress}
        pdfPreviewUrl={pdfPreviewUrl}
        exportError={exportError}
      />
      
      {exportError && !isPreviewOpen && (
        <Alert variant="destructive" className="w-full mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {exportError}. Check browser console for details.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PdfExportManager;
