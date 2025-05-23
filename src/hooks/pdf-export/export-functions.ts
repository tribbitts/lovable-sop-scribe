import jsPDF from "jspdf";
import 'jspdf-autotable';
import { SopDocument, SopStep } from "@/types/sop";
import { toast } from "@/hooks/use-toast";

const generatePdf = async (sopDocument: SopDocument, setExportProgress: (value: string | null) => void) => {
  return new Promise<Blob>((resolve, reject) => {
    try {
      setExportProgress("Initializing PDF...");
      const doc = new jsPDF();

      // Set document properties
      doc.setProperties({
        title: sopDocument.title,
        subject: "Standard Operating Procedure",
        author: "SOPify",
        creator: "SOPify"
      });

      // Add title
      doc.setFontSize(24);
      doc.text(sopDocument.title, 10, 20);

      // Add subtitle
      doc.setFontSize(14);
      doc.setTextColor(100);
      doc.text("Standard Operating Procedure", 10, 30);

      let currentY = 40; // Starting Y position

      // Function to add a step to the PDF
      const addStep = (step: SopStep, index: number) => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 10;
        const availableWidth = pageWidth - 2 * margin;

        // Step Number
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text(`Step ${index + 1}: ${step.title}`, 10, currentY);
        currentY += 8;

        // Step Details
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);

        // Word wrap function - using description instead of details
        const wrappedText = doc.splitTextToSize(step.description, availableWidth);
        wrappedText.forEach((line: string) => {
          doc.text(line, 10, currentY);
          currentY += 6;
        });

        currentY += 4; // Add a little space after each step
      };

      // Loop through steps and add them to the PDF
      sopDocument.steps.forEach((step, index) => {
        if (currentY > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          currentY = 20; // Reset Y position on new page
        }
        setExportProgress(`Adding step ${index + 1} of ${sopDocument.steps.length}...`);
        addStep(step, index);
      });

      // Add current date to the footer
      const currentDate = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Generated on: ${currentDate}`, 10, doc.internal.pageSize.getHeight() - 10);

      setExportProgress("Finalizing PDF...");
      
      // Fix: Use 'blob' properly by using the output method correctly
      const pdfBlob = doc.output('blob');
      
      // Also save for download
      doc.save("sop.pdf");
      
      resolve(pdfBlob);

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
    setExportProgress("Generating PDF...");
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
    setExportError(error.message || "An unexpected error occurred during export.");
    toast({
      title: "Export Failed",
      description: "There was an error exporting the SOP as a PDF.",
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
    setExportProgress("Generating PDF...");
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
    setExportError(error.message || "An unexpected error occurred during preview.");
    toast({
      title: "Preview Failed",
      description: "There was an error generating the SOP preview.",
      variant: "destructive",
    });
  } finally {
    setIsExporting(false);
    setExportProgress(null);
  }
};
