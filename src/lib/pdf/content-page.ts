import { SopDocument } from "@/types/sop";

export function addContentPageDesign(
  pdf: any, 
  width: number, 
  height: number, 
  margin: any,
  backgroundImage: string | null = null
) {
  // Modern light background
  pdf.setFillColor(252, 253, 254); // Very light blue-gray
  pdf.rect(0, 0, width, height, 'F');
  
  // Add subtle page elements for visual interest
  addPageAccents(pdf, width, height, margin);
  
  // If there's a background image, add it with professional overlay
  if (backgroundImage) {
    try {
      console.log("Applying background image to PDF page");
      
      pdf.addImage({
        imageData: backgroundImage,
        format: 'JPEG',
        x: 0,
        y: 0,
        width: width,
        height: height,
        compression: 'FAST',
        rotation: 0
      });
      
      // Professional overlay for readability
      pdf.setFillColor(252, 253, 254);
      pdf.setGState(new pdf.GState({ opacity: 0.9 })); // 90% opacity overlay
      pdf.rect(0, 0, width, height, 'F');
      pdf.setGState(new pdf.GState({ opacity: 1 })); // Reset opacity
      
      console.log("Background image applied to PDF page");
    } catch (error) {
      console.error("Error adding background image:", error);
    }
  }
}

// Add subtle page accents for visual interest
function addPageAccents(pdf: any, width: number, height: number, margin: any) {
  // Header accent line
  pdf.setDrawColor(0, 122, 255, 0.2);
  pdf.setLineWidth(2);
  pdf.line(margin.left, margin.top - 10, width - margin.right, margin.top - 10);
  
  // Subtle corner elements
  pdf.setFillColor(0, 122, 255, 0.03);
  
  // Top-right corner accent
  pdf.roundedRect(width - 60, 0, 60, 40, 0, 0, 'F');
  
  // Bottom-left corner accent
  pdf.roundedRect(0, height - 30, 50, 30, 0, 0, 'F');
  
  // Very subtle dotted pattern
  pdf.setFillColor(0, 122, 255, 0.02);
  for (let x = margin.left; x < width - margin.right; x += 40) {
    for (let y = margin.top; y < height - margin.bottom; y += 40) {
      pdf.circle(x, y, 0.5, 'F');
    }
  }
}

export function addPageFooters(pdf: any, sopDocument: SopDocument, width: number, height: number, margin: any) {
  const pageCount = pdf.internal.getNumberOfPages();
  const currentYear = new Date().getFullYear();
  const companyNameToUse = sopDocument.companyName || "SOPify";

  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    const footerY = height - margin.bottom + 5;
    
    // Modern footer design with subtle line
    pdf.setDrawColor(0, 122, 255, 0.2);
    pdf.setLineWidth(0.5);
    pdf.line(margin.left, footerY - 8, width - margin.right, footerY - 8);
    
    // Footer content layout
    try {
      pdf.setFont("Inter", "normal");
    } catch (fontError) {
      pdf.setFont("helvetica", "normal");
    }
    
    pdf.setFontSize(8);
    pdf.setTextColor(130, 130, 130);
    
    // Left side - Company info
    const leftText = `© ${currentYear} ${companyNameToUse}`;
    pdf.text(leftText, margin.left, footerY);
    
    // Center - Document title (if not cover page)
    if (i > 1) {
      const centerText = sopDocument.title || "Standard Operating Procedure";
      const maxCenterTextLength = 40;
      const displayCenterText = centerText.length > maxCenterTextLength 
        ? centerText.substring(0, maxCenterTextLength - 3) + "..."
        : centerText;
      
      let centerTextWidth;
      try {
        centerTextWidth = pdf.getStringUnitWidth(displayCenterText) * 8 / pdf.internal.scaleFactor;
      } catch (e) {
        centerTextWidth = displayCenterText.length * 1.5;
      }
      
      const centerX = (width - centerTextWidth) / 2;
      pdf.text(displayCenterText, centerX, footerY);
    }
    
    // Right side - Page number with modern styling
    const pageText = `${i} of ${pageCount}`;
    let pageTextWidth;
    try {
      pageTextWidth = pdf.getStringUnitWidth(pageText) * 8 / pdf.internal.scaleFactor;
    } catch (e) {
      pageTextWidth = pageText.length * 1.5;
    }
    
    const pageX = width - margin.right - pageTextWidth;
    
    // Page number background for better visibility
    if (i > 1) { // Skip page number background on cover
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(pageX - 3, footerY - 5, pageTextWidth + 6, 8, 2, 2, 'F');
    }
    
    pdf.setTextColor(95, 95, 95);
    pdf.text(pageText, pageX, footerY);
    
    // Add "For Internal Use Only" text for compliance
    if (i > 1) {
      pdf.setFontSize(7);
      pdf.setTextColor(160, 160, 160);
      const complianceText = "For Internal Use Only";
      
      let complianceWidth;
      try {
        complianceWidth = pdf.getStringUnitWidth(complianceText) * 7 / pdf.internal.scaleFactor;
      } catch (e) {
        complianceWidth = complianceText.length * 1.2;
      }
      
      const complianceX = (width - complianceWidth) / 2;
      pdf.text(complianceText, complianceX, footerY + 8);
    }
  }
}
