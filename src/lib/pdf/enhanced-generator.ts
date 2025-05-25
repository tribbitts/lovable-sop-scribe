
import { jsPDF } from "jspdf";
import { SopDocument } from "@/types/sop";
import { PdfTheme, pdfThemes, getCustomTheme } from "./enhanced-themes";
import { initializePdfFonts, setFontSafe, getStringWidthSafe } from "./font-handler";
import { addCoverPage } from "./cover-page";
import { addContentPageDesign, addPageFooters } from "./content-page";
import { renderSteps } from "./step-renderer";

export interface EnhancedPdfOptions {
  theme?: string;
  customColors?: { primary?: string; secondary?: string };
  includeTableOfContents?: boolean;
  includeProgressInfo?: boolean;
  quality?: "low" | "medium" | "high";
}

export async function generateEnhancedPDF(
  sopDocument: SopDocument,
  options: EnhancedPdfOptions = {}
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Starting enhanced PDF generation with consistent styling");
      
      // Create PDF with enhanced settings
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm", 
        format: "a4",
        compress: true,
        putOnlyUsedFonts: true,
        floatPrecision: "smart"
      });

      // Initialize fonts with proper error handling
      const fontsInitialized = initializePdfFonts(pdf);
      if (!fontsInitialized) {
        console.warn("Font initialization failed, proceeding with defaults");
      }

      // PDF dimensions
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      const margin = { top: 28, right: 22, bottom: 28, left: 22 };

      // Use the same cover page as main PDF generator
      console.log("Creating consistent cover page");
      await addCoverPage(pdf, sopDocument, width, height, margin, sopDocument.backgroundImage);

      // Add table of contents if requested
      if (options.includeTableOfContents && sopDocument.steps.length > 0) {
        pdf.addPage();
        await addConsistentTableOfContents(pdf, sopDocument, width, height, margin);
      }

      // Add content pages using same styling as main generator
      pdf.addPage();
      addContentPageDesign(pdf, width, height, margin, sopDocument.backgroundImage);
      
      await renderSteps(
        pdf, 
        sopDocument.steps, 
        width, 
        height, 
        margin, 
        width - margin.left - margin.right,
        addContentPageDesign,
        sopDocument.backgroundImage
      );

      // Add consistent footers
      addPageFooters(pdf, sopDocument, width, height, margin);

      const pdfBase64 = pdf.output('datauristring');
      
      console.log("Enhanced PDF generated with consistent styling");
      resolve(pdfBase64);
    } catch (error) {
      console.error("Enhanced PDF generation error:", error);
      reject(error);
    }
  });
}

async function addConsistentTableOfContents(
  pdf: any,
  sopDocument: SopDocument,
  width: number,
  height: number,
  margin: any
) {
  // Use consistent styling with main PDF generator
  addContentPageDesign(pdf, width, height, margin, sopDocument.backgroundImage);
  
  const { steps } = sopDocument;
  
  // Professional title design
  setFontSafe(pdf, "helvetica", "bold");
  
  pdf.setFontSize(28);
  pdf.setTextColor(0, 122, 255); // SOPify blue only
  pdf.text("Table of Contents", margin.left, margin.top + 18);
  
  // Simple professional header line
  pdf.setDrawColor(0, 122, 255);
  pdf.setLineWidth(3);
  pdf.line(margin.left, margin.top + 28, margin.left + 100, margin.top + 28);
  
  // Clean subtitle
  setFontSafe(pdf, "helvetica", "normal");
  
  pdf.setFontSize(12);
  pdf.setTextColor(127, 140, 141); // Professional gray
  pdf.text(`${steps.length} Step${steps.length !== 1 ? 's' : ''} • ${sopDocument.topic || 'Standard Operating Procedure'}`, margin.left, margin.top + 40);
  
  let currentY = margin.top + 60;
  
  // Add each step with clean, professional design
  steps.forEach((step, index) => {
    const stepNumber = index + 1;
    const stepTitle = step.title || `Step ${stepNumber}`;
    const pageNumber = stepNumber + 2;
    
    // Check if we need a new page
    if (currentY > height - margin.bottom - 40) {
      pdf.addPage();
      addContentPageDesign(pdf, width, height, margin, sopDocument.backgroundImage);
      currentY = margin.top + 30;
    }
    
    const itemHeight = 20;
    const cardPadding = 8;
    
    // Clean card design
    pdf.setFillColor(250, 250, 250); // Very light gray background
    pdf.roundedRect(margin.left, currentY - cardPadding, width - margin.left - margin.right, itemHeight, 6, 6, 'F');
    
    // Professional border
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin.left, currentY - cardPadding, width - margin.left - margin.right, itemHeight, 6, 6, 'S');
    
    // Step number circle - blue only
    const circleX = margin.left + 15;
    const circleY = currentY + 2;
    const circleRadius = 8;
    
    pdf.setFillColor(0, 122, 255); // SOPify blue only
    pdf.circle(circleX, circleY, circleRadius, "F");
    
    // Step number text
    setFontSafe(pdf, "helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    
    const numberStr = String(stepNumber);
    const numberWidth = getStringWidthSafe(pdf, numberStr, 10);
    pdf.text(numberStr, circleX - (numberWidth / 2), circleY + 2);
    
    // Step title
    setFontSafe(pdf, "helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(44, 62, 80);
    
    const titleX = circleX + circleRadius + 10;
    
    let displayTitle = stepTitle;
    const maxTitleLength = 60;
    if (stepTitle.length > maxTitleLength) {
      displayTitle = stepTitle.substring(0, maxTitleLength - 3) + "...";
    }
    
    pdf.text(displayTitle, titleX, currentY + 3);
    
    // Page number
    setFontSafe(pdf, "helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    
    const pageNumText = String(pageNumber);
    const pageNumWidth = getStringWidthSafe(pdf, pageNumText, 10);
    const pageNumX = width - margin.right - 15;
    
    pdf.text(pageNumText, pageNumX - (pageNumWidth / 2), currentY + 3);
    
    // Simple connecting line
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    const lineStartX = titleX + getStringWidthSafe(pdf, displayTitle, 11) + 8;
    const lineEndX = pageNumX - 20;
    if (lineEndX > lineStartX) {
      pdf.line(lineStartX, circleY, lineEndX, circleY);
    }
    
    currentY += itemHeight + 6;
  });
}
