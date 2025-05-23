import { SopDocument } from "@/types/sop";

export function addContentPageDesign(
  pdf: any, 
  width: number, 
  height: number, 
  margin: any,
  backgroundImage: string | null = null
) {
  // Warm, business-appropriate background
  pdf.setFillColor(252, 251, 249); // Very light warm beige
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
      
      // Professional overlay for readability with warm tone
      pdf.setFillColor(252, 251, 249);
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
  // Very subtle header accent line in warm gray
  pdf.setDrawColor(160, 155, 150, 0.15); // Warm gray with very low opacity
  pdf.setLineWidth(1);
  pdf.line(margin.left, margin.top - 8, width - margin.right, margin.top - 8);
  
  // Subtle flowing organic shapes in earth tones
  pdf.setFillColor(205, 195, 185, 0.03); // Warm beige, very subtle
  
  // Organic flowing shape in top-right (inspired by your image)
  const topRightPath = [
    [width - 45, 0],
    [width, 0],
    [width, 35],
    [width - 25, 45],
    [width - 45, 25]
  ];
  
  try {
    pdf.setFillColor(205, 195, 185, 0.03);
    // Create a curved organic shape
    pdf.lines(topRightPath, width - 45, 0, [1, 1], 'F');
  } catch (e) {
    // Fallback to simple rectangle if path drawing fails
    pdf.roundedRect(width - 40, 0, 40, 30, 15, 15, 'F');
  }
  
  // Subtle flowing element in bottom-left
  pdf.setFillColor(185, 175, 165, 0.025); // Slightly darker warm gray
  
  const bottomLeftPath = [
    [0, height - 25],
    [35, height - 30],
    [40, height],
    [0, height]
  ];
  
  try {
    pdf.setFillColor(185, 175, 165, 0.025);
    pdf.lines(bottomLeftPath, 0, height - 25, [1, 1], 'F');
  } catch (e) {
    // Fallback to simple rectangle
    pdf.roundedRect(0, height - 20, 35, 20, 10, 10, 'F');
  }
  
  // Very subtle flowing accent in the middle area
  pdf.setFillColor(195, 185, 175, 0.015); // Ultra-subtle warm tone
  
  // Create a gentle S-curve accent
  const midPath = [
    [width * 0.7, height * 0.3],
    [width * 0.85, height * 0.35],
    [width * 0.9, height * 0.5],
    [width * 0.75, height * 0.55],
    [width * 0.65, height * 0.45]
  ];
  
  try {
    pdf.setFillColor(195, 185, 175, 0.015);
    pdf.lines(midPath, width * 0.7, height * 0.3, [1, 1], 'F');
  } catch (e) {
    // Skip this element if it fails
  }
  
  // Replace the dotted pattern with very subtle organic texture
  pdf.setFillColor(190, 180, 170, 0.008); // Extremely subtle
  
  // Add just a few organic dots in a flowing pattern
  const organicDots = [
    { x: width * 0.15, y: height * 0.25, r: 1.5 },
    { x: width * 0.25, y: height * 0.35, r: 1 },
    { x: width * 0.35, y: height * 0.28, r: 1.2 },
    { x: width * 0.65, y: height * 0.65, r: 1 },
    { x: width * 0.75, y: height * 0.75, r: 1.3 },
    { x: width * 0.85, y: height * 0.68, r: 0.8 }
  ];
  
  organicDots.forEach(dot => {
    pdf.circle(dot.x, dot.y, dot.r, 'F');
  });
}

export function addPageFooters(pdf: any, sopDocument: SopDocument, width: number, height: number, margin: any) {
  const pageCount = pdf.internal.getNumberOfPages();
  const currentYear = new Date().getFullYear();
  const companyNameToUse = sopDocument.companyName || "SOPify";

  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    const footerY = height - margin.bottom + 5;
    
    // Modern footer design with subtle warm-toned line
    pdf.setDrawColor(160, 155, 150, 0.3); // Warm gray instead of blue
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
    
    // Right side - Page number with warm-toned styling
    const pageText = `${i} of ${pageCount}`;
    let pageTextWidth;
    try {
      pageTextWidth = pdf.getStringUnitWidth(pageText) * 8 / pdf.internal.scaleFactor;
    } catch (e) {
      pageTextWidth = pageText.length * 1.5;
    }
    
    const pageX = width - margin.right - pageTextWidth;
    
    // Page number background with warm tone
    if (i > 1) { // Skip page number background on cover
      pdf.setFillColor(248, 246, 244); // Warm beige background
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
