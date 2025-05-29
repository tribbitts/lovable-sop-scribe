
import { SopDocument } from "@/types/sop";

/**
 * Add clean, professional background elements to cover page
 */
export function addSopifyBrandedDesign(
  pdf: any, 
  width: number, 
  height: number, 
  margin: any,
  backgroundImage: string | null = null
) {
  // Clean, professional white background
  pdf.setFillColor(255, 255, 255); // Pure white
  pdf.rect(0, 0, width, height, 'F');
  
  // Add minimal SOPify branded accents - blue only
  addMinimalBrandedAccents(pdf, width, height);
  
  // If there's a background image, add it with professional overlay
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
      
      // Professional white overlay for text readability
      pdf.setFillColor(255, 255, 255);
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
 * Add minimal SOPify branded accents - clean and professional, blue only
 */
function addMinimalBrandedAccents(pdf: any, width: number, height: number) {
  // Simple SOPify blue accent line at top
  pdf.setFillColor(0, 122, 255); // SOPify blue only
  pdf.rect(0, 0, width, 3, 'F'); // Thin top border
}
