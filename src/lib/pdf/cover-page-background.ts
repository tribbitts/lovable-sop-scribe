
import { SopDocument } from "@/types/sop";

/**
 * Add SOPify-branded background elements and design to cover page
 */
export function addSopifyBrandedDesign(
  pdf: any, 
  width: number, 
  height: number, 
  margin: any,
  backgroundImage: string | null = null
) {
  // Clean, professional SOPify background
  pdf.setFillColor(250, 251, 252); // Clean, professional white-blue
  pdf.rect(0, 0, width, height, 'F');
  
  // Add SOPify branded cover accents
  addSopifyBrandedAccents(pdf, width, height);
  
  // If there's a background image, add it with SOPify branding overlay
  if (backgroundImage) {
    try {
      console.log("Adding background image to cover page");
      
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
      
      // SOPify branded overlay for text readability
      pdf.setFillColor(250, 251, 252);
      pdf.setGState(new pdf.GState({ opacity: 0.94 })); // High opacity for better contrast
      pdf.rect(0, 0, width, height, 'F');
      pdf.setGState(new pdf.GState({ opacity: 1 })); // Reset opacity
      
      console.log("Background image added to cover design successfully");
    } catch (error) {
      console.error("Error adding background image to cover:", error);
    }
  }
}

/**
 * Add SOPify branded cover accents and decorative elements
 */
function addSopifyBrandedAccents(pdf: any, width: number, height: number) {
  // SOPify blue gradient elements
  pdf.setFillColor(0, 122, 255, 0.08); // SOPify blue, very subtle
  
  // Modern top-right geometric accent
  pdf.roundedRect(width - 60, 0, 60, 40, 20, 20, 'F');
  
  // Complementary bottom-left accent
  pdf.setFillColor(39, 174, 96, 0.06); // Success green accent
  pdf.roundedRect(0, height - 30, 50, 30, 15, 15, 'F');
  
  // SOPify branded floating elements
  pdf.setFillColor(0, 122, 255, 0.04);
  const sopifyAccents = [
    { x: width * 0.15, y: height * 0.2, r: 2 },
    { x: width * 0.85, y: height * 0.8, r: 2.5 },
    { x: width * 0.1, y: height * 0.9, r: 1.5 },
    { x: width * 0.9, y: height * 0.1, r: 1.8 }
  ];
  
  sopifyAccents.forEach(accent => {
    pdf.circle(accent.x, accent.y, accent.r, 'F');
  });
  
  // Subtle SOPify geometric pattern
  pdf.setFillColor(0, 122, 255, 0.02);
  pdf.roundedRect(width * 0.7, height * 0.3, 15, 15, 3, 3, 'F');
  pdf.roundedRect(width * 0.25, height * 0.7, 12, 12, 2, 2, 'F');
}
