
import { SopDocument } from "@/types/sop";
import { compressImage } from "./utils";

export function addCoverPage(pdf: any, sopDocument: SopDocument, width: number, height: number, margin: any) {
  // Add decorative background elements (Apple-inspired)
  addCoverPageDesign(pdf, width, height, margin);
  
  // Center-aligned title (large and bold)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.setTextColor(40, 40, 40); // Dark charcoal
  
  const title = sopDocument.title;
  const titleWidth = pdf.getStringUnitWidth(title) * 24 / pdf.internal.scaleFactor;
  pdf.text(title, (width - titleWidth) / 2, height / 3);
  
  // Subtitle with topic and date
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(60, 60, 60); // Medium gray
  
  const subtitle = `Topic: ${sopDocument.topic} · ${sopDocument.date}`;
  const subtitleWidth = pdf.getStringUnitWidth(subtitle) * 12 / pdf.internal.scaleFactor;
  pdf.text(subtitle, (width - subtitleWidth) / 2, height / 3 + 15);
  
  // Add logo to cover page if available
  addLogoToCover(pdf, sopDocument, width, height);
  
  // Add footer to cover page
  addCoverPageFooter(pdf, sopDocument, width, height, margin);
}

// Add decorative background elements for the cover page
function addCoverPageDesign(pdf: any, width: number, height: number, margin: any) {
  // Subtle background shapes
  // Light circle in top right
  pdf.setFillColor(245, 245, 247); // Very light blue-gray
  pdf.circle(width - margin.right - 40, margin.top + 20, 80, 'F');
  
  // Light rectangle along bottom
  pdf.setFillColor(245, 245, 247); // Very light blue-gray
  pdf.rect(margin.left - 5, height - margin.bottom - 40, width - margin.left - margin.right + 10, 50, 'F');
  
  // Add thin accent divider
  pdf.setDrawColor(0, 122, 255); // Apple Blue
  pdf.setLineWidth(0.5);
  pdf.line(margin.left + 40, margin.top + 90, width - margin.right - 40, margin.top + 90);
}

// Add logo to the cover page
async function addLogoToCover(pdf: any, sopDocument: SopDocument, width: number, height: number) {
  if (sopDocument.logo) {
    try {
      // Compress and center the logo
      const compressedLogoUrl = await compressImage(sopDocument.logo, 0.8);
      
      // Make the logo larger and centered at the top
      const logoSize = 40; // Larger size
      
      // Center horizontally
      const logoX = (width - logoSize) / 2;
      
      pdf.addImage(
        compressedLogoUrl, 
        "JPEG", 
        logoX,
        height / 4 - logoSize,
        logoSize, 
        logoSize
      );
    } catch(e) {
      console.error("Error adding logo to cover page", e);
    }
  }
}

// Add footer to the cover page
function addCoverPageFooter(pdf: any, sopDocument: SopDocument, width: number, height: number, margin: any) {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150); // Light gray
  
  const footerText = `For internal use only | © 2025 | ${sopDocument.companyName}`;
  const footerWidth = pdf.getStringUnitWidth(footerText) * 8 / pdf.internal.scaleFactor;
  pdf.text(
    footerText,
    (width - footerWidth) / 2,
    height - 20
  );
}
