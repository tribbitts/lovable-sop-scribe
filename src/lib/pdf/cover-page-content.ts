
import { SopDocument } from "@/types/sop";

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
  
  // Main Title - SOPify branded styling
  try {
    pdf.setFont("Inter", "bold");
  } catch (fontError) {
    pdf.setFont("helvetica", "bold");
  }
  
  pdf.setFontSize(36);
  pdf.setTextColor(0, 122, 255); // SOPify blue
  
  const title = sopDocument.title || "Untitled SOP";
  
  // Center title with proper measurement
  let titleWidth;
  try {
    titleWidth = pdf.getStringUnitWidth(title) * 36 / pdf.internal.scaleFactor;
  } catch (e) {
    titleWidth = title.length * 7; // Estimate for fallback
  }
  
  const titleX = (width - titleWidth) / 2;
  const titleY = centerY - logoOffset + 10;
  pdf.text(title, titleX, titleY);
  
  // Subtitle line with SOPify professional styling
  try {
    pdf.setFont("Inter", "normal");
  } catch (fontError) {
    pdf.setFont("helvetica", "normal");
  }
  
  pdf.setFontSize(16);
  pdf.setTextColor(44, 62, 80); // Professional dark gray
  
  const subtitle = `${sopDocument.topic ? sopDocument.topic.toUpperCase() : 'STANDARD OPERATING PROCEDURE'}`;
  
  let subtitleWidth;
  try {
    subtitleWidth = pdf.getStringUnitWidth(subtitle) * 16 / pdf.internal.scaleFactor;
  } catch (e) {
    subtitleWidth = subtitle.length * 3;
  }
  
  const subtitleX = (width - subtitleWidth) / 2;
  const subtitleY = titleY + 22;
  pdf.text(subtitle, subtitleX, subtitleY);
  
  // SOPify branded divider line with gradient effect
  addDividerLine(pdf, width, subtitleY);
  
  // Date and company info
  addDateAndCompanyInfo(pdf, sopDocument, width, subtitleY);
}

/**
 * Add decorative divider line with SOPify branding
 */
function addDividerLine(pdf: any, width: number, subtitleY: number) {
  pdf.setDrawColor(0, 122, 255); // SOPify blue
  pdf.setLineWidth(3);
  const lineWidth = Math.min(120, width * 0.3);
  const lineY = subtitleY + 18;
  pdf.line((width - lineWidth) / 2, lineY, (width + lineWidth) / 2, lineY);
  
  // Add subtle accent dots in SOPify blue
  pdf.setFillColor(0, 122, 255);
  const dotY = lineY + 8;
  pdf.circle((width - lineWidth) / 2 - 5, dotY, 1.5, 'F');
  pdf.circle((width + lineWidth) / 2 + 5, dotY, 1.5, 'F');
  pdf.circle(width / 2, dotY, 2, 'F');
}

/**
 * Add date and company information to cover page
 */
function addDateAndCompanyInfo(pdf: any, sopDocument: SopDocument, width: number, subtitleY: number) {
  const lineY = subtitleY + 18;
  
  // Date and version info with enhanced styling
  try {
    pdf.setFont("Inter", "normal");
  } catch (fontError) {
    pdf.setFont("helvetica", "normal");
  }
  
  pdf.setFontSize(12);
  pdf.setTextColor(127, 140, 141); // Professional light gray
  
  const dateText = sopDocument.date || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  let dateWidth;
  try {
    dateWidth = pdf.getStringUnitWidth(dateText) * 12 / pdf.internal.scaleFactor;
  } catch (e) {
    dateWidth = dateText.length * 2.2;
  }
  
  const dateX = (width - dateWidth) / 2;
  const dateY = lineY + 35;
  pdf.text(dateText, dateX, dateY);
  
  // Company name with SOPify branding
  if (sopDocument.companyName) {
    pdf.setFontSize(11);
    pdf.setTextColor(160, 160, 160);
    
    const companyText = sopDocument.companyName.toUpperCase();
    let companyWidth;
    try {
      companyWidth = pdf.getStringUnitWidth(companyText) * 11 / pdf.internal.scaleFactor;
    } catch (e) {
      companyWidth = companyText.length * 2;
    }
    
    const companyX = (width - companyWidth) / 2;
    pdf.text(companyText, companyX, dateY + 15);
  }
}
