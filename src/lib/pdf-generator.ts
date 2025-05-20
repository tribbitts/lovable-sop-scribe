
import { jsPDF } from "jspdf";
import { SopDocument } from "../types/sop";
import { generatePdfFilename } from "./pdf/utils";
import { addCoverPage } from "./pdf/cover-page";
import { addContentPageDesign, addPageFooters } from "./pdf/content-page";
import { renderSteps } from "./pdf/step-renderer";

export async function generatePDF(sopDocument: SopDocument): Promise<void> {
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
  
  // Create cover page
  await addCoverPage(pdf, sopDocument, width, height, margin);
  
  // Add new page for steps content
  pdf.addPage();
  addContentPageDesign(pdf, width, height, margin);
  
  // Render all steps
  await renderSteps(
    pdf, 
    sopDocument.steps, 
    width, 
    height, 
    margin, 
    contentWidth,
    addContentPageDesign
  );
  
  // Add page footers
  addPageFooters(pdf, sopDocument, width, height, margin);
  
  // Save the PDF with a standardized filename
  const filename = generatePdfFilename(sopDocument);
  pdf.save(filename);
}
