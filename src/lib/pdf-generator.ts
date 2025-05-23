import { jsPDF } from "jspdf";
import { SopDocument } from "@/types/sop";
import { generatePdfFilename, registerInterFont } from "@/lib/pdf/utils";
import { addCoverPage } from "@/lib/pdf/cover-page";
import { addContentPageDesign, addPageFooters } from "@/lib/pdf/content-page";
import { renderSteps } from "@/lib/pdf/step-renderer";

// Add table of contents page
function addTableOfContents(
  pdf: any,
  sopDocument: SopDocument,
  width: number,
  height: number,
  margin: any,
  backgroundImage: string | null = null
) {
  // Add the background to the TOC page
  addContentPageDesign(pdf, width, height, margin, backgroundImage);
  
  const { steps } = sopDocument;
  
  // Modern title design
  try {
    pdf.setFont("Inter", "bold");
  } catch (fontError) {
    pdf.setFont("helvetica", "bold");
  }
  
  pdf.setFontSize(24);
  pdf.setTextColor(45, 45, 45); // Darker, more professional
  pdf.text("Table of Contents", margin.left, margin.top + 15);
  
  // Elegant header line with gradient effect
  pdf.setDrawColor(0, 122, 255);
  pdf.setLineWidth(2);
  pdf.line(margin.left, margin.top + 25, margin.left + 80, margin.top + 25);
  
  // Subtitle for context
  try {
    pdf.setFont("Inter", "normal");
  } catch (fontError) {
    pdf.setFont("helvetica", "normal");
  }
  
  pdf.setFontSize(11);
  pdf.setTextColor(120, 120, 120);
  pdf.text(`${steps.length} Step${steps.length !== 1 ? 's' : ''} • ${sopDocument.topic || 'Standard Operating Procedure'}`, margin.left, margin.top + 35);
  
  let currentY = margin.top + 55;
  
  // Add each step to the table of contents with modern card design
  steps.forEach((step, index) => {
    const stepNumber = index + 1;
    const stepTitle = step.title || `Step ${stepNumber}`;
    const pageNumber = stepNumber + 2; // +2 because cover page is 1, TOC is 2
    
    // Check if we need a new page
    if (currentY > height - margin.bottom - 30) {
      pdf.addPage();
      addContentPageDesign(pdf, width, height, margin, backgroundImage);
      currentY = margin.top + 20;
    }
    
    const itemHeight = 18;
    const cardPadding = 8;
    
    // Card background with subtle shadow
    pdf.setFillColor(0, 0, 0, 0.03); // Very subtle shadow
    pdf.roundedRect(margin.left + 1, currentY - cardPadding + 1, width - margin.left - margin.right, itemHeight, 6, 6, 'F');
    
    // Main card background
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin.left, currentY - cardPadding, width - margin.left - margin.right, itemHeight, 6, 6, 'F');
    
    // Card border
    pdf.setDrawColor(240, 240, 240);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin.left, currentY - cardPadding, width - margin.left - margin.right, itemHeight, 6, 6, 'S');
    
    // Step number with modern circle design
    const circleX = margin.left + 15;
    const circleY = currentY + 2;
    const circleRadius = 8;
    
    // Number background circle
    pdf.setFillColor(0, 122, 255);
    pdf.circle(circleX, circleY, circleRadius, "F");
    
    // White inner circle for depth
    pdf.setFillColor(255, 255, 255);
    pdf.circle(circleX, circleY, circleRadius - 2, "F");
    
    // Step number
    try {
      pdf.setFont("Inter", "bold");
    } catch (fontError) {
      pdf.setFont("helvetica", "bold");
    }
    pdf.setFontSize(11);
    pdf.setTextColor(0, 122, 255);
    
    const numberStr = String(stepNumber);
    let numberWidth;
    try {
      numberWidth = pdf.getStringUnitWidth(numberStr) * 11 / pdf.internal.scaleFactor;
    } catch (e) {
      numberWidth = numberStr.length * 2;
    }
    
    pdf.text(numberStr, circleX - (numberWidth / 2), circleY + 1.5);
    
    // Step title with modern typography
    try {
      pdf.setFont("Inter", "semibold");
    } catch (fontError) {
      pdf.setFont("helvetica", "bold");
    }
    pdf.setFontSize(12);
    pdf.setTextColor(55, 55, 55);
    
    const titleX = circleX + circleRadius + 10;
    
    // Truncate long titles more elegantly
    let displayTitle = stepTitle;
    const maxTitleLength = 55;
    if (stepTitle.length > maxTitleLength) {
      displayTitle = stepTitle.substring(0, maxTitleLength - 3) + "...";
    }
    
    pdf.text(displayTitle, titleX, currentY + 3);
    
    // Page number with modern styling
    try {
      pdf.setFont("Inter", "normal");
    } catch (fontError) {
      pdf.setFont("helvetica", "normal");
    }
    pdf.setFontSize(11);
    pdf.setTextColor(140, 140, 140);
    
    const pageNumText = String(pageNumber);
    let pageNumWidth;
    try {
      pageNumWidth = pdf.getStringUnitWidth(pageNumText) * 11 / pdf.internal.scaleFactor;
    } catch (e) {
      pageNumWidth = pageNumText.length * 2;
    }
    
    const pageNumX = width - margin.right - 15;
    
    // Page number background circle
    pdf.setFillColor(248, 249, 250);
    pdf.circle(pageNumX, circleY, 6, "F");
    
    pdf.setTextColor(95, 95, 95);
    pdf.text(pageNumText, pageNumX - (pageNumWidth / 2), circleY + 1.5);
    
    // Subtle connecting line
    pdf.setDrawColor(0, 122, 255, 0.15);
    pdf.setLineWidth(0.5);
    const lineStartX = titleX + pdf.getStringUnitWidth(displayTitle) * 12 / pdf.internal.scaleFactor + 8;
    const lineEndX = pageNumX - 12;
    if (lineEndX > lineStartX) {
      pdf.line(lineStartX, circleY, lineEndX, circleY);
    }
    
    currentY += itemHeight + 6; // Spacing between items
  });
}

export async function generatePDF(sopDocument: SopDocument): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Starting PDF generation process");
      
      // Create a new PDF with optimal settings
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
        putOnlyUsedFonts: true, 
        floatPrecision: "smart"
      });

      // Try to register custom fonts but fallback gracefully to system fonts
      try {
        await registerInterFont(pdf);
        console.log("Custom fonts registered successfully");
      } catch (error) {
        console.error("Using system fonts instead of custom fonts due to error:", error);
        // Explicitly set a system font to ensure we have a font to use
        pdf.setFont("helvetica", "normal");
      }
      
      // Get PDF dimensions
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      
      // Adjust margins for better layout
      const margin = {
        top: 25,
        right: 20,
        bottom: 25,
        left: 20
      };
      
      // Calculate content width
      const contentWidth = width - (margin.left + margin.right);
      
      // Get background image
      const backgroundImage = sopDocument.backgroundImage || null;
      
      console.log("Creating cover page");
      
      try {
        // Create elegant cover page with error handling
        await addCoverPage(pdf, sopDocument, width, height, margin, backgroundImage);
        console.log("Cover page created successfully");
        
        // Add table of contents if enabled
        if (sopDocument.tableOfContents && sopDocument.steps.length > 0) {
          pdf.addPage();
          console.log("Adding table of contents");
          addTableOfContents(pdf, sopDocument, width, height, margin, backgroundImage);
          console.log("Table of contents added successfully");
        }
        
        // Add new page for steps content
        pdf.addPage();
        
        // Add the background to the content page
        addContentPageDesign(pdf, width, height, margin, backgroundImage);
        
        console.log(`Rendering ${sopDocument.steps.length} steps`);
        
        // Render all steps with consistent styling
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
        
        console.log("Steps rendered successfully");
        
        // Add single consistent footer on each page
        addPageFooters(pdf, sopDocument, width, height, margin);
        
        // Generate base64 string for preview
        const pdfBase64 = pdf.output('datauristring');
        
        // Save the PDF with a standardized filename
        const filename = generatePdfFilename(sopDocument);
        console.log(`Saving PDF as: ${filename}`);
        
        // Use high quality settings for better output
        const options = {
          quality: 0.98,
          compression: 'FAST'
        };
        
        try {
          pdf.save(filename);
          console.log("PDF saved successfully");
          resolve(pdfBase64);
        } catch (saveError) {
          console.error("Error saving PDF:", saveError);
          // Even if saving fails, try to return the base64 for preview
          resolve(pdfBase64);
        }
      } catch (error) {
        console.error("Error in PDF creation process:", error);
        reject(error);
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      reject(error);
    }
  });
}

