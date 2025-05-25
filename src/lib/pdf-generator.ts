
import { jsPDF } from "jspdf";
import { SopDocument } from "@/types/sop";
import { generatePdfFilename, registerInterFont } from "@/lib/pdf/utils";
import { addCoverPage } from "@/lib/pdf/cover-page";
import { addContentPageDesign, addPageFooters } from "@/lib/pdf/content-page";
import { renderSteps } from "@/lib/pdf/step-renderer";

// Add enhanced table of contents page with SOPify branding
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
  try {
    pdf.setFont("Inter", "bold");
  } catch (fontError) {
    pdf.setFont("helvetica", "bold");
  }
  
  pdf.setFontSize(28);
  pdf.setTextColor(0, 122, 255); // SOPify blue
  pdf.text("Table of Contents", margin.left, margin.top + 18);
  
  // SOPify branded header line with enhanced styling
  pdf.setDrawColor(0, 122, 255);
  pdf.setLineWidth(3);
  pdf.line(margin.left, margin.top + 28, margin.left + 100, margin.top + 28);
  
  // Enhanced subtitle with SOPify styling
  try {
    pdf.setFont("Inter", "normal");
  } catch (fontError) {
    pdf.setFont("helvetica", "normal");
  }
  
  pdf.setFontSize(12);
  pdf.setTextColor(127, 140, 141); // Professional gray
  pdf.text(`${steps.length} Step${steps.length !== 1 ? 's' : ''} • ${sopDocument.topic || 'Standard Operating Procedure'}`, margin.left, margin.top + 40);
  
  let currentY = margin.top + 60;
  
  // Add each step to the table of contents with enhanced SOPify design
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
    
    const itemHeight = 22; // Increased for better spacing
    const cardPadding = 10;
    
    // Enhanced card design with SOPify styling
    pdf.setFillColor(0, 0, 0, 0.02); // Very subtle shadow
    pdf.roundedRect(margin.left + 1, currentY - cardPadding + 1, width - margin.left - margin.right, itemHeight, 8, 8, 'F');
    
    // Main card background
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin.left, currentY - cardPadding, width - margin.left - margin.right, itemHeight, 8, 8, 'F');
    
    // SOPify blue card border
    pdf.setDrawColor(0, 122, 255, 0.15);
    pdf.setLineWidth(0.6);
    pdf.roundedRect(margin.left, currentY - cardPadding, width - margin.left - margin.right, itemHeight, 8, 8, 'S');
    
    // Enhanced step number with SOPify branding
    const circleX = margin.left + 18;
    const circleY = currentY + 2;
    const circleRadius = 9;
    
    // SOPify blue background circle
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
    
    pdf.text(numberStr, circleX - (numberWidth / 2), circleY + 2);
    
    // Enhanced step title with SOPify typography
    try {
      pdf.setFont("Inter", "semibold");
    } catch (fontError) {
      pdf.setFont("helvetica", "bold");
    }
    pdf.setFontSize(12);
    pdf.setTextColor(44, 62, 80); // Professional dark gray
    
    const titleX = circleX + circleRadius + 12;
    
    // Improved title truncation
    let displayTitle = stepTitle;
    const maxTitleLength = 65; // Increased for better readability
    if (stepTitle.length > maxTitleLength) {
      displayTitle = stepTitle.substring(0, maxTitleLength - 3) + "...";
    }
    
    pdf.text(displayTitle, titleX, currentY + 4);
    
    // Enhanced page number with SOPify styling
    try {
      pdf.setFont("Inter", "normal");
    } catch (fontError) {
      pdf.setFont("helvetica", "normal");
    }
    pdf.setFontSize(10);
    
    const pageNumText = String(pageNumber);
    let pageNumWidth;
    try {
      pageNumWidth = pdf.getStringUnitWidth(pageNumText) * 10 / pdf.internal.scaleFactor;
    } catch (e) {
      pageNumWidth = pageNumText.length * 1.8;
    }
    
    const pageNumX = width - margin.right - 18;
    
    // SOPify branded page number background
    pdf.setFillColor(0, 122, 255, 0.1);
    pdf.circle(pageNumX, circleY, 8, "F");
    
    pdf.setTextColor(0, 122, 255);
    pdf.text(pageNumText, pageNumX - (pageNumWidth / 2), circleY + 1.5);
    
    // Enhanced connecting line with SOPify styling
    pdf.setDrawColor(0, 122, 255, 0.2);
    pdf.setLineWidth(0.5);
    const lineStartX = titleX + pdf.getStringUnitWidth(displayTitle) * 12 / pdf.internal.scaleFactor + 10;
    const lineEndX = pageNumX - 15;
    if (lineEndX > lineStartX) {
      // Leader dots for professional appearance
      const dotSpacing = 3;
      const numDots = Math.floor((lineEndX - lineStartX) / dotSpacing);
      
      pdf.setFillColor(0, 122, 255, 0.3);
      for (let i = 0; i < numDots; i++) {
        const dotX = lineStartX + (i * dotSpacing);
        pdf.circle(dotX, circleY, 0.3, 'F');
      }
    }
    
    currentY += itemHeight + 8; // Enhanced spacing between items
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

      // Try to register custom fonts but fallback gracefully to system fonts
      try {
        await registerInterFont(pdf);
        console.log("SOPify custom fonts registered successfully");
      } catch (error) {
        console.error("Using system fonts instead of custom fonts due to error:", error);
        // Explicitly set a system font to ensure we have a font to use
        pdf.setFont("helvetica", "normal");
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
        
        // Use high quality settings for SOPify professional output
        const options = {
          quality: 0.98,
          compression: 'FAST'
        };
        
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
        reject(error);
      }
    } catch (error) {
      console.error("SOPify PDF generation error:", error);
      reject(error);
    }
  });
}
