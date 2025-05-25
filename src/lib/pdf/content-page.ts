
import { SopDocument } from "@/types/sop";

export function addContentPageDesign(
  pdf: any, 
  width: number, 
  height: number, 
  margin: any,
  backgroundImage: string | null = null
) {
  // SOPify branded professional background
  pdf.setFillColor(250, 251, 252); // Clean SOPify white-blue
  pdf.rect(0, 0, width, height, 'F');
  
  // Add subtle SOPify branded page elements
  addSopifyPageAccents(pdf, width, height, margin);
  
  // If there's a background image, add it with SOPify branding overlay
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
      
      // SOPify branded overlay for readability
      pdf.setFillColor(250, 251, 252);
      pdf.setGState(new pdf.GState({ opacity: 0.92 })); // Professional opacity
      pdf.rect(0, 0, width, height, 'F');
      pdf.setGState(new pdf.GState({ opacity: 1 })); // Reset opacity
      
      console.log("Background image applied to PDF page");
    } catch (error) {
      console.error("Error adding background image:", error);
    }
  }
  
  // Add SOPify watermark to content pages
  addContentPageWatermark(pdf, width, height);
}

// Add SOPify branded page accents for visual interest
function addSopifyPageAccents(pdf: any, width: number, height: number, margin: any) {
  // SOPify blue header accent line
  pdf.setDrawColor(0, 122, 255, 0.3); // SOPify blue with transparency
  pdf.setLineWidth(1.5);
  pdf.line(margin.left, margin.top - 10, width - margin.right, margin.top - 10);
  
  // Subtle SOPify branded flowing elements
  pdf.setFillColor(0, 122, 255, 0.04); // Very subtle SOPify blue
  
  // Modern geometric accent in top-right
  pdf.roundedRect(width - 35, 0, 35, 25, 12, 12, 'F');
  
  // Complementary bottom-left accent in success green
  pdf.setFillColor(39, 174, 96, 0.03); // SOPify success green, very subtle
  pdf.roundedRect(0, height - 20, 30, 20, 10, 10, 'F');
  
  // SOPify branded floating elements for texture
  pdf.setFillColor(0, 122, 255, 0.025);
  const sopifyTexture = [
    { x: width * 0.18, y: height * 0.22, r: 1.2 },
    { x: width * 0.82, y: height * 0.78, r: 1.5 },
    { x: width * 0.12, y: height * 0.88, r: 0.8 },
    { x: width * 0.88, y: height * 0.12, r: 1 }
  ];
  
  sopifyTexture.forEach(dot => {
    pdf.circle(dot.x, dot.y, dot.r, 'F');
  });
  
  // Subtle SOPify geometric pattern
  pdf.setFillColor(0, 122, 255, 0.015);
  pdf.roundedRect(width * 0.75, height * 0.25, 8, 8, 2, 2, 'F');
  pdf.roundedRect(width * 0.2, height * 0.75, 6, 6, 1, 1, 'F');
}

// Add SOPify watermark to content pages
function addContentPageWatermark(pdf: any, width: number, height: number) {
  try {
    pdf.setFont("Inter", "normal");
  } catch (fontError) {
    pdf.setFont("helvetica", "normal");
  }
  
  pdf.setFontSize(7);
  pdf.setTextColor(0, 122, 255, 0.15); // Very subtle SOPify blue
  
  const watermarkText = "SOPify";
  let watermarkWidth;
  try {
    watermarkWidth = pdf.getStringUnitWidth(watermarkText) * 7 / pdf.internal.scaleFactor;
  } catch (e) {
    watermarkWidth = watermarkText.length * 1.2;
  }
  
  pdf.text(watermarkText, width - watermarkWidth - 12, height - 8);
}

export function addPageFooters(pdf: any, sopDocument: SopDocument, width: number, height: number, margin: any) {
  const pageCount = pdf.internal.getNumberOfPages();
  const currentYear = new Date().getFullYear();
  const companyNameToUse = sopDocument.companyName || "SOPify"; // Fixed typo from "SOPity"

  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    const footerY = height - margin.bottom + 8;
    
    // SOPify branded footer design with professional line
    pdf.setDrawColor(0, 122, 255, 0.4); // SOPify blue
    pdf.setLineWidth(0.8);
    pdf.line(margin.left, footerY - 10, width - margin.right, footerY - 10);
    
    // Footer content layout with SOPify typography
    try {
      pdf.setFont("Inter", "normal");
    } catch (fontError) {
      pdf.setFont("helvetica", "normal");
    }
    
    pdf.setFontSize(8);
    pdf.setTextColor(127, 140, 141); // Professional gray
    
    // Left side - SOPify branded company info
    const leftText = `© ${currentYear} ${companyNameToUse}`;
    pdf.text(leftText, margin.left, footerY);
    
    // Center - Document title (if not cover page) with SOPify styling
    if (i > 1) {
      const centerText = sopDocument.title || "Standard Operating Procedure";
      const maxCenterTextLength = 45; // Increased for better readability
      const displayCenterText = centerText.length > maxCenterTextLength 
        ? centerText.substring(0, maxCenterTextLength - 3) + "..."
        : centerText;
      
      let centerTextWidth;
      try {
        centerTextWidth = pdf.getStringUnitWidth(displayCenterText) * 8 / pdf.internal.scaleFactor;
      } catch (e) {
        centerTextWidth = displayCenterText.length * 1.4;
      }
      
      const centerX = (width - centerTextWidth) / 2;
      pdf.setTextColor(44, 62, 80); // Darker for better readability
      pdf.text(displayCenterText, centerX, footerY);
    }
    
    // Right side - Page number with SOPify styling
    const pageText = `Page ${i} of ${pageCount}`;
    let pageTextWidth;
    try {
      pageTextWidth = pdf.getStringUnitWidth(pageText) * 8 / pdf.internal.scaleFactor;
    } catch (e) {
      pageTextWidth = pageText.length * 1.4;
    }
    
    const pageX = width - margin.right - pageTextWidth;
    
    // Page number background with SOPify branding
    if (i > 1) {
      pdf.setFillColor(0, 122, 255, 0.08); // Subtle SOPify blue background
      pdf.roundedRect(pageX - 4, footerY - 6, pageTextWidth + 8, 10, 3, 3, 'F');
    }
    
    pdf.setTextColor(0, 122, 255); // SOPify blue for page numbers
    pdf.text(pageText, pageX, footerY);
    
    // Add SOPify "Confidential" text for compliance
    if (i > 1) {
      pdf.setFontSize(7);
      pdf.setTextColor(160, 160, 160);
      const complianceText = "Confidential - SOPify Platform";
      
      let complianceWidth;
      try {
        complianceWidth = pdf.getStringUnitWidth(complianceText) * 7 / pdf.internal.scaleFactor;
      } catch (e) {
        complianceWidth = complianceText.length * 1.1;
      }
      
      const complianceX = (width - complianceWidth) / 2;
      pdf.text(complianceText, complianceX, footerY + 10);
    }
  }
}
