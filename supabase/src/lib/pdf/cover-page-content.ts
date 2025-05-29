
import { SopDocument } from "@/types/sop";
import { setFontSafe, getStringWidthSafe } from "./font-handler";

/**
 * Add main content (title, subtitle, date, company) to cover page
 */
export function addCoverPageContent(
  pdf: any,
  sopDocument: SopDocument,
  width: number,
  height: number,
  logoOffset: number = 0
) {
  // Calculate vertical positioning for professional layout
  const centerY = height / 2;
  
  // Main Title - Clean professional styling
  setFontSafe(pdf, "helvetica", "bold");
  
  pdf.setFontSize(36);
  pdf.setTextColor(0, 122, 255); // SOPify blue only
  
  const title = sopDocument.title || "Untitled SOP";
  
  // Center title with proper measurement
  const titleWidth = getStringWidthSafe(pdf, title, 36);
  const titleX = (width - titleWidth) / 2;
  const titleY = centerY - logoOffset + 10;
  pdf.text(title, titleX, titleY);
  
  // Subtitle line with professional styling
  setFontSafe(pdf, "helvetica", "normal");
  
  pdf.setFontSize(16);
  pdf.setTextColor(44, 62, 80); // Professional dark gray
  
  const subtitle = `${sopDocument.topic ? sopDocument.topic.toUpperCase() : 'STANDARD OPERATING PROCEDURE'}`;
  
  const subtitleWidth = getStringWidthSafe(pdf, subtitle, 16);
  const subtitleX = (width - subtitleWidth) / 2;
  const subtitleY = titleY + 22;
  pdf.text(subtitle, subtitleX, subtitleY);
  
  // Simple professional divider line
  addSimpleDividerLine(pdf, width, subtitleY);
  
  // Date and company info
  addDateAndCompanyInfo(pdf, sopDocument, width, subtitleY);
}

/**
 * Add simple professional divider line
 */
function addSimpleDividerLine(pdf: any, width: number, subtitleY: number) {
  pdf.setDrawColor(0, 122, 255); // SOPify blue only
  pdf.setLineWidth(2);
  const lineWidth = Math.min(100, width * 0.25);
  const lineY = subtitleY + 18;
  pdf.line((width - lineWidth) / 2, lineY, (width + lineWidth) / 2, lineY);
}

/**
 * Add date and company information to cover page
 */
function addDateAndCompanyInfo(pdf: any, sopDocument: SopDocument, width: number, subtitleY: number) {
  const lineY = subtitleY + 18;
  
  // Date and version info with clean styling
  setFontSafe(pdf, "helvetica", "normal");
  
  pdf.setFontSize(12);
  pdf.setTextColor(127, 140, 141); // Professional light gray
  
  const dateText = sopDocument.date || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const dateWidth = getStringWidthSafe(pdf, dateText, 12);
  const dateX = (width - dateWidth) / 2;
  const dateY = lineY + 35;
  pdf.text(dateText, dateX, dateY);
  
  // Company name with professional styling
  if (sopDocument.companyName) {
    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100); // Neutral gray
    
    const companyText = sopDocument.companyName.toUpperCase();
    const companyWidth = getStringWidthSafe(pdf, companyText, 11);
    const companyX = (width - companyWidth) / 2;
    pdf.text(companyText, companyX, dateY + 15);
  }
}
