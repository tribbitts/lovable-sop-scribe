import jsPDF from "jspdf";
import 'jspdf-autotable';
import { SopDocument, SopStep } from "@/types/sop";
import { toast } from "@/hooks/use-toast";
import { generatePDF } from "@/lib/pdf-generator";

const generatePdf = async (sopDocument: SopDocument, setExportProgress: (value: string | null) => void) => {
  return new Promise<Blob>((resolve, reject) => {
    try {
      setExportProgress("Initializing PDF generation...");
      
      // Use the enhanced PDF generator
      generatePDF(sopDocument)
        .then((pdfBase64) => {
          setExportProgress("Converting to blob...");
          
          // Convert base64 to blob
          const byteCharacters = atob(pdfBase64.split(',')[1]);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
          
          resolve(pdfBlob);
        })
        .catch((error) => {
          console.error("Enhanced PDF generation failed:", error);
          reject(error);
        });

    } catch (error) {
      console.error("Error generating PDF:", error);
      reject(error);
    }
  });
};

export const handleExport = async (
  sopDocument: SopDocument,
  user: any,
  canGeneratePdf: boolean,
  showUpgradePrompt: () => void,
  isPro: boolean,
  incrementPdfCount: () => void,
  refreshSubscription: () => Promise<void>,
  setIsExporting: (value: boolean) => void,
  setExportProgress: (value: string | null) => void,
  setExportError: (value: string | null) => void,
  isAdmin: boolean = false
) => {
  setIsExporting(true);
  setExportProgress("Starting export...");
  setExportError(null);

  try {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to export PDFs.",
        variant: "destructive"
      });
      setIsExporting(false);
      return;
    }

    if (!isAdmin && !canGeneratePdf) {
      showUpgradePrompt();
      setIsExporting(false);
      return;
    }

    // Generate the PDF
    setExportProgress("Generating enhanced SOPify PDF...");
    await generatePdf(sopDocument, setExportProgress)
    
    if (!isAdmin) {
      incrementPdfCount();
    }
    await refreshSubscription();

    toast({
      title: "SOP Exported",
      description: "Your SOP has been successfully exported as a PDF.",
    });
  } catch (error: any) {
    console.error("Error during PDF export:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during export.";
    setExportError(errorMessage);
    toast({
      title: "Export Failed",
      description: `There was an error exporting the SOP: ${errorMessage}`,
      variant: "destructive",
    });
  } finally {
    setIsExporting(false);
    setExportProgress(null);
  }
};

export const handlePreview = async (
  sopDocument: SopDocument,
  user: any,
  canGeneratePdf: boolean,
  showUpgradePrompt: () => void,
  isPro: boolean,
  setIsExporting: (value: boolean) => void,
  setExportProgress: (value: string | null) => void,
  setExportError: (value: string | null) => void,
  setPdfPreviewUrl: (value: string | null) => void,
  setIsPreviewOpen: (value: boolean) => void,
  isAdmin: boolean = false
) => {
  setIsExporting(true);
  setExportProgress("Starting preview generation...");
  setExportError(null);

  try {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to preview PDFs.",
        variant: "destructive"
      });
      setIsExporting(false);
      return;
    }

    if (!isAdmin && !canGeneratePdf) {
      showUpgradePrompt();
      setIsExporting(false);
      return;
    }

    // Generate the PDF
    setExportProgress("Generating enhanced SOPify PDF preview...");
    const pdfBlob = await generatePdf(sopDocument, setExportProgress);

    // Create a URL for the blob
    setExportProgress("Creating preview URL...");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPdfPreviewUrl(pdfUrl);
    setIsPreviewOpen(true);

    toast({
      title: "SOP Preview Ready",
      description: "Your SOP preview has been successfully generated.",
    });
  } catch (error: any) {
    console.error("Error during PDF preview:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during preview.";
    setExportError(errorMessage);
    toast({
      title: "Preview Failed",
      description: `There was an error generating the SOP preview: ${errorMessage}`,
      variant: "destructive",
    });
  } finally {
    setIsExporting(false);
    setExportProgress(null);
  }
};
