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
      console.log("Generating clean standard PDF");
      
      // Create PDF with standard settings
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm", 
        format: "a4",
        compress: true
      });

      // Initialize fonts
      initializePdfFonts(pdf);

      // PDF dimensions
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      const margin = { top: 20, right: 20, bottom: 20, left: 20 };

      let currentY = margin.top;

      // Simple header
      setFontSafe(pdf, "helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(0, 0, 0);
      
      const title = sopDocument.title || "Standard Operating Procedure";
      pdf.text(title, margin.left, currentY);
      currentY += 15;

      // Subtitle
      if (sopDocument.topic) {
        setFontSafe(pdf, "helvetica", "normal");
        pdf.setFontSize(14);
        pdf.setTextColor(100, 100, 100);
        pdf.text(sopDocument.topic, margin.left, currentY);
        currentY += 10;
      }

      // Simple line separator
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin.left, currentY, width - margin.right, currentY);
      currentY += 15;

      // Render steps
      for (let i = 0; i < sopDocument.steps.length; i++) {
        const step = sopDocument.steps[i];
        const stepNumber = i + 1;

        // Check if we need a new page
        if (currentY > height - margin.bottom - 60) {
          pdf.addPage();
          currentY = margin.top;
        }

        // Step number and title
        setFontSafe(pdf, "helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        
        const stepTitle = `${stepNumber}. ${step.title || `Step ${stepNumber}`}`;
        pdf.text(stepTitle, margin.left, currentY);
        currentY += 8;

        // Step description
        if (step.description) {
          setFontSafe(pdf, "helvetica", "normal");
          pdf.setFontSize(11);
          pdf.setTextColor(60, 60, 60);
          
          const descLines = pdf.splitTextToSize(step.description, width - margin.left - margin.right);
          descLines.forEach((line: string) => {
            if (currentY > height - margin.bottom - 20) {
              pdf.addPage();
              currentY = margin.top;
            }
            pdf.text(line, margin.left, currentY);
            currentY += 5;
          });
          currentY += 5;
        }

        // Handle screenshots
        const screenshots = step.screenshots || (step.screenshot ? [step.screenshot] : []);
        
        for (const screenshot of screenshots) {
          if (screenshot.dataUrl) {
            try {
              // Check if we need a new page for the image
              if (currentY > height - margin.bottom - 80) {
                pdf.addPage();
                currentY = margin.top;
              }

              // Add image with proper sizing
              const imgWidth = Math.min(120, width - margin.left - margin.right);
              const imgHeight = 80; // Fixed height for consistency
              
              pdf.addImage(screenshot.dataUrl, 'JPEG', margin.left, currentY, imgWidth, imgHeight);
              currentY += imgHeight + 5;

              // Add screenshot title if available
              if (screenshot.title) {
                setFontSafe(pdf, "helvetica", "italic");
                pdf.setFontSize(9);
                pdf.setTextColor(120, 120, 120);
                pdf.text(screenshot.title, margin.left, currentY);
                currentY += 5;
              }
            } catch (imageError) {
              console.warn("Failed to add image to PDF:", imageError);
              // Continue without the image
            }
          }
        }

        currentY += 10; // Space between steps
      }

      // Footer
      const totalPages = (pdf.internal.pages as any[]).length - 1; // Subtract 1 for the empty first page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        pdf.setPage(pageNum);
        
        setFontSafe(pdf, "helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        
        const footerText = `Created with SOPify - Page ${pageNum} of ${totalPages}`;
        const footerWidth = getStringWidthSafe(pdf, footerText, 8);
        pdf.text(footerText, (width - footerWidth) / 2, height - 10);
      }

      const pdfBase64 = pdf.output('datauristring');
      
      // Save the PDF
      const base64Data = pdfBase64.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const filename = generatePdfFilename(sopDocument);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log("Standard PDF saved successfully");
      resolve(pdfBase64);
    } catch (error) {
      console.error("Standard PDF generation error:", error);
      reject(new Error(`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
}

// New function for HTML-to-PDF generation (preserves exact demo styling)
export async function generatePDFFromHTML(sopDocument: SopDocument): Promise<string> {
  try {
    console.log("Starting HTML-to-PDF generation with exact demo styling");
    
    // Import the HTML-to-PDF generator
    const { generateHtmlToPdf } = await import("./pdf/html-to-pdf-generator");
    
    // Use HTML-to-PDF generator for perfect styling preservation
    const result = await generateHtmlToPdf(sopDocument, {
      includeTableOfContents: false,
      includeProgressInfo: true
    });
    
    console.log("HTML-to-PDF generation initiated");
    return result;
  } catch (error) {
    console.error("HTML-to-PDF generation failed:", error);
    throw error;
  }
}

// Function for direct download with browser print dialog (exact demo styling)
export async function downloadPDFWithBrowserPrint(sopDocument: SopDocument): Promise<void> {
  try {
    console.log("Starting browser print PDF generation with exact demo styling");
    
    // Import the HTML-to-PDF generator
    const { generateAndDownloadPdf } = await import("./pdf/html-to-pdf-generator");
    
    await generateAndDownloadPdf(sopDocument, {
      includeTableOfContents: false,
      includeProgressInfo: true
    });
    
    console.log("Browser print PDF generation initiated");
  } catch (error) {
    console.error("Browser print PDF generation failed:", error);
    throw error;
  }
}
