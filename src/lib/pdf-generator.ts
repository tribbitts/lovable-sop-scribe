import { jsPDF } from "jspdf";
import { SopDocument } from "@/types/sop";
import { generatePdfFilename } from "@/lib/pdf/utils";
import { addCoverPage } from "@/lib/pdf/cover-page";
import { addContentPageDesign, addPageFooters } from "@/lib/pdf/content-page";
import { renderSteps } from "@/lib/pdf/step-renderer";
import { initializePdfFonts, setFontSafe, getStringWidthSafe } from "@/lib/pdf/font-handler";

// Add enhanced table of contents page with SOPify branding - blue only, no red
function addTableOfContents(
  pdf: any,
  sopDocument: SopDocument,
  width: number,
  height: number,
  margin: any,
  backgroundImage: string | null = null
) {
  // Add the SOPify branded background to the TOC page
  addContentPageDesign(pdf, width, height, margin, backgroundImage);
  
  const { steps } = sopDocument;
  
  // SOPify branded title design
  setFontSafe(pdf, "helvetica", "bold");
  
  pdf.setFontSize(28);
  pdf.setTextColor(0, 122, 255); // SOPify blue
  pdf.text("Table of Contents", margin.left, margin.top + 18);
  
  // SOPify branded header line - blue only
  pdf.setDrawColor(0, 122, 255);
  pdf.setLineWidth(3);
  pdf.line(margin.left, margin.top + 28, margin.left + 100, margin.top + 28);
  
  // Clean subtitle with SOPify styling
  setFontSafe(pdf, "helvetica", "normal");
  
  pdf.setFontSize(12);
  pdf.setTextColor(127, 140, 141); // Professional gray
  pdf.text(`${steps.length} Step${steps.length !== 1 ? 's' : ''} • ${sopDocument.topic || 'Standard Operating Procedure'}`, margin.left, margin.top + 40);
  
  let currentY = margin.top + 60;
  
  // Add each step to the table of contents with clean SOPify design - no red elements
  steps.forEach((step, index) => {
    const stepNumber = index + 1;
    const stepTitle = step.title || `Step ${stepNumber}`;
    const pageNumber = stepNumber + 2; // +2 because cover page is 1, TOC is 2
    
    // Check if we need a new page
    if (currentY > height - margin.bottom - 40) {
      pdf.addPage();
      addContentPageDesign(pdf, width, height, margin, backgroundImage);
      currentY = margin.top + 30;
    }
    
    const itemHeight = 20;
    const cardPadding = 8;
    
    // Clean card design - white only, no red
    pdf.setFillColor(250, 250, 250); // Very light gray background
    pdf.roundedRect(margin.left, currentY - cardPadding, width - margin.left - margin.right, itemHeight, 6, 6, 'F');
    
    // Professional border - blue only
    pdf.setDrawColor(0, 122, 255, 0.15);
    pdf.setLineWidth(0.6);
    pdf.roundedRect(margin.left, currentY - cardPadding, width - margin.left - margin.right, itemHeight, 6, 6, 'S');
    
    // Clean step number with SOPify branding - blue only
    const circleX = margin.left + 15;
    const circleY = currentY + 2;
    const circleRadius = 8;
    
    // SOPify blue background circle only
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
    
    // Page number - blue only, no red background
    setFontSafe(pdf, "helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(0, 122, 255);
    
    const pageNumText = String(pageNumber);
    const pageNumWidth = getStringWidthSafe(pdf, pageNumText, 10);
    const pageNumX = width - margin.right - 15;
    
    pdf.text(pageNumText, pageNumX - (pageNumWidth / 2), currentY + 3);
    
    // Simple connecting line with SOPify styling - blue only
    pdf.setDrawColor(0, 122, 255, 0.2);
    pdf.setLineWidth(0.5);
    const lineStartX = titleX + getStringWidthSafe(pdf, displayTitle, 11) + 8;
    const lineEndX = pageNumX - 20;
    if (lineEndX > lineStartX) {
      pdf.line(lineStartX, circleY, lineEndX, circleY);
    }
    
    currentY += itemHeight + 6;
  });
}

export async function generatePDF(sopDocument: SopDocument): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Using beautiful enhanced PDF generator for consistent theme");
      
      // Import the enhanced PDF generator
      const { generateEnhancedPDF } = await import("./pdf/enhanced-generator");
      
      // Use the beautiful enhanced PDF generator with all the stunning features
      const enhancedOptions = {
        theme: 'professional',
        includeTableOfContents: sopDocument.tableOfContents || false,
        includeProgressInfo: true,
        quality: 'high' as const,
        branding: {
          companyColors: {
            primary: '#007AFF',
            secondary: '#5856D6'
          }
        }
      };
      
      console.log("Generating beautiful PDF with enhanced theme:", enhancedOptions);
      
      // Generate the beautiful PDF
      const pdfBase64 = await generateEnhancedPDF(sopDocument, enhancedOptions);
      
      // Extract the PDF blob from base64 for saving
      const base64Data = pdfBase64.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Save the beautiful PDF with SOPify standardized filename
      const filename = generatePdfFilename(sopDocument);
      console.log(`Saving beautiful SOPify PDF as: ${filename}`);
      
      try {
        // Create download link and trigger download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log("Beautiful SOPify PDF saved successfully");
        resolve(pdfBase64);
      } catch (saveError) {
        console.error("Error saving beautiful SOPify PDF:", saveError);
        // Even if saving fails, return the base64 for preview
        resolve(pdfBase64);
      }
    } catch (error) {
      console.error("Beautiful PDF generation error:", error);
      reject(new Error(`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
}
