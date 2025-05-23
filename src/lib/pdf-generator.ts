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
  
  // Set font for title
  try {
    pdf.setFont("Inter", "bold");
  } catch (fontError) {
    pdf.setFont("helvetica", "bold");
  }
  
  pdf.setFontSize(20);
  pdf.setTextColor(40, 40, 40);
  pdf.text("Table of Contents", margin.left, margin.top + 10);
  
  // Draw a line under the title
  pdf.setDrawColor(0, 122, 255);
  pdf.setLineWidth(0.5);
  pdf.line(margin.left, margin.top + 15, width - margin.right, margin.top + 15);
  
  let currentY = margin.top + 30;
  
  // Set font for items
  try {
    pdf.setFont("Inter", "normal");
  } catch (fontError) {
    pdf.setFont("helvetica", "normal");
  }
  
  pdf.setFontSize(12);
  pdf.setTextColor(60, 60, 60);
  
  // Add each step to the table of contents
  steps.forEach((step, index) => {
    const stepNumber = index + 1;
    const stepTitle = step.title || `Step ${stepNumber}`;
    const pageNumber = stepNumber + 2; // +2 because cover page is 1, TOC is 2
    
    // Check if we need a new page
    if (currentY > height - margin.bottom - 20) {
      pdf.addPage();
      addContentPageDesign(pdf, width, height, margin, backgroundImage);
      currentY = margin.top + 10;
    }
    
    // Draw step number circle
    const circleX = margin.left + 5;
    const circleY = currentY - 3;
    
    pdf.setFillColor(0, 122, 255);
    pdf.circle(circleX, circleY, 3, "F");
    
    // Add step number text
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text(String(stepNumber), circleX - 1.5, circleY + 1.5);
    
    // Add step title
    pdf.setTextColor(60, 60, 60);
    pdf.setFontSize(12);
    const titleX = margin.left + 15;
    
    // Truncate long titles
    let displayTitle = stepTitle;
    if (stepTitle.length > 60) {
      displayTitle = stepTitle.substring(0, 57) + "...";
    }
    
    pdf.text(displayTitle, titleX, currentY);
    
    // Add dots and page number
    const dotsStartX = titleX + pdf.getStringUnitWidth(displayTitle) * 12 / pdf.internal.scaleFactor + 5;
    const pageNumX = width - margin.right - 10;
    const pageNumText = String(pageNumber);
    
    // Draw dots
    pdf.setTextColor(150, 150, 150);
    let dotX = dotsStartX;
    while (dotX < pageNumX - 15) {
      pdf.text(".", dotX, currentY);
      dotX += 3;
    }
    
    // Add page number
    pdf.setTextColor(60, 60, 60);
    pdf.text(pageNumText, pageNumX, currentY);
    
    currentY += 8;
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

