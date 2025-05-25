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
      console.log("Starting SOPify-enhanced PDF generation process");
      
      // Create a new PDF with optimal settings for SOPify branding
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
      
      // Get PDF dimensions
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      
      // SOPify optimized margins for better layout
      const margin = {
        top: 28,
        right: 22,
        bottom: 28,
        left: 22
      };
      
      // Calculate content width
      const contentWidth = width - (margin.left + margin.right);
      
      // Get background image
      const backgroundImage = sopDocument.backgroundImage || null;
      
      console.log("Creating SOPify-branded cover page");
      
      try {
        // Create enhanced SOPify cover page with error handling
        await addCoverPage(pdf, sopDocument, width, height, margin, backgroundImage);
        console.log("SOPify cover page created successfully");
        
        // Add enhanced table of contents if enabled
        if (sopDocument.tableOfContents && sopDocument.steps.length > 0) {
          pdf.addPage();
          console.log("Adding SOPify-branded table of contents");
          addTableOfContents(pdf, sopDocument, width, height, margin, backgroundImage);
          console.log("SOPify table of contents added successfully");
        }
        
        // Add new page for steps content
        pdf.addPage();
        
        // Add the SOPify branded background to the content page
        addContentPageDesign(pdf, width, height, margin, backgroundImage);
        
        console.log(`Rendering ${sopDocument.steps.length} steps with SOPify styling`);
        
        // Render all steps with enhanced SOPify styling
        await renderSteps(
          pdf, 
          sopDocument.steps, 
          width, 
          height, 
          margin, 
          contentWidth,
          addContentPageDesign,
          backgroundImage
        );
        
        console.log("Steps rendered successfully with SOPify branding");
        
        // Add enhanced SOPify footer on each page
        addPageFooters(pdf, sopDocument, width, height, margin);
        
        // Generate base64 string for preview
        const pdfBase64 = pdf.output('datauristring');
        
        // Save the PDF with SOPify standardized filename
        const filename = generatePdfFilename(sopDocument);
        console.log(`Saving SOPify PDF as: ${filename}`);
        
        try {
          pdf.save(filename);
          console.log("SOPify PDF saved successfully");
          resolve(pdfBase64);
        } catch (saveError) {
          console.error("Error saving SOPify PDF:", saveError);
          // Even if saving fails, try to return the base64 for preview
          resolve(pdfBase64);
        }
      } catch (error) {
        console.error("Error in SOPify PDF creation process:", error);
        reject(new Error(`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`));
      }
    } catch (error) {
      console.error("SOPify PDF generation error:", error);
      reject(new Error(`PDF initialization failed: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
}
