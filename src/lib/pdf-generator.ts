
import { jsPDF } from "jspdf";
import { SopDocument } from "../types/sop";
import { generatePdfFilename } from "./pdf/utils";
import { addCoverPage } from "./pdf/cover-page";
import { addContentPageDesign, addPageFooters } from "./pdf/content-page";
import { renderSteps } from "./pdf/step-renderer";

export async function generatePDF(sopDocument: SopDocument): Promise<void> {
  try {
    console.log("Starting PDF generation process");
    
    // Create a new PDF with better initial settings
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    
    // Get PDF dimensions
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    
    // Set better margins (Apple-inspired spacious design)
    const margin = {
      top: 30,
      right: 25,
      bottom: 30,
      left: 25
    };
    
    // Calculate content width
    const contentWidth = width - (margin.left + margin.right);
    
    console.log("Creating cover page");
    // Create cover page - with error handling
    try {
      await addCoverPage(pdf, sopDocument, width, height, margin);
      console.log("Cover page created successfully");
    } catch (error) {
      console.error("Error creating cover page:", error);
      // Continue anyway to attempt to generate the rest of the PDF
    }
    
    // Add new page for steps content
    pdf.addPage();
    addContentPageDesign(pdf, width, height, margin);
    
    console.log(`Rendering ${sopDocument.steps.length} steps`);
    // Render all steps with better error handling
    try {
      await renderSteps(
        pdf, 
        sopDocument.steps, 
        width, 
        height, 
        margin, 
        contentWidth,
        addContentPageDesign
      );
      console.log("Steps rendered successfully");
    } catch (error) {
      console.error("Error rendering steps:", error);
      // Continue to attempt to complete the PDF
    }
    
    // Add page footers
    addPageFooters(pdf, sopDocument, width, height, margin);
    
    // Save the PDF with a standardized filename
    const filename = generatePdfFilename(sopDocument);
    console.log(`Saving PDF as: ${filename}`);
    
    // Use a different approach for saving
    pdf.save(filename);
    console.log("PDF saved successfully");
    
    return Promise.resolve();
  } catch (error) {
    console.error("PDF generation error:", error);
    return Promise.reject(error);
  }
}
