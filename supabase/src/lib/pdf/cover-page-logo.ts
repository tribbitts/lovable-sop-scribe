
import { SopDocument } from "@/types/sop";

/**
 * Add logo to the cover page with proper aspect ratio and SOPify branding
 */
export async function addLogoToCover(pdf: any, sopDocument: SopDocument, width: number, height: number): Promise<number> {
  if (!sopDocument.logo) {
    return 0; // No logo to add, return 0 offset
  }
  
  // Validate logo data
  if (typeof sopDocument.logo !== 'string' || !sopDocument.logo.startsWith('data:')) {
    console.error("Invalid logo data format, skipping logo");
    return 0;
  }
  
  try {
    // Preserve original logo without compression
    const logoUrl = sopDocument.logo;
    
    // Create a temporary image to get the natural dimensions
    const img = new Image();
    
    return await new Promise<number>((resolve, reject) => {
      // Set error handler first
      img.onerror = (error) => {
        console.error("Failed to load logo image:", error);
        reject(new Error("Failed to load logo image"));
      };
      
      img.onload = () => {
        try {
          // Check for valid dimensions
          if (img.width <= 0 || img.height <= 0) {
            console.error("Invalid logo dimensions:", img.width, img.height);
            reject(new Error("Invalid logo dimensions"));
            return;
          }
          
          // Optimized logo sizing for SOPify brand presence
          const maxLogoWidth = Math.min(200, width * 0.4); // Reduced for better balance
          const maxLogoHeight = height * 0.12; // 12% of page height
          
          // Calculate scaled dimensions while preserving aspect ratio
          let logoWidth, logoHeight;
          const imgAspectRatio = img.width / img.height;
          
          if (img.width / maxLogoWidth > img.height / maxLogoHeight) {
            // Width is the limiting factor
            logoWidth = maxLogoWidth;
            logoHeight = logoWidth / imgAspectRatio;
          } else {
            // Height is the limiting factor
            logoHeight = maxLogoHeight;
            logoWidth = logoHeight * imgAspectRatio;
          }
          
          // Center horizontally and position at the top with SOPify styling
          const logoX = (width - logoWidth) / 2;
          const logoY = height / 6 - logoHeight / 2; // Position in upper area with better spacing
          
          // Add subtle shadow effect for logo
          pdf.setFillColor(0, 0, 0, 0.1);
          pdf.roundedRect(logoX + 2, logoY + 2, logoWidth, logoHeight, 5, 5, 'F');
          
          // Add the logo with proper proportions
          pdf.addImage(
            logoUrl, 
            "PNG", 
            logoX,
            logoY,
            logoWidth, 
            logoHeight
          );
          console.log("Logo added successfully with SOPify branding:", logoWidth, "x", logoHeight);
          
          // Return the logo offset for content positioning
          resolve(50); // Standard offset for logo presence
        } catch (error) {
          console.error("Error processing logo dimensions:", error);
          reject(error);
        }
      };
      
      // Set img.src to start loading the image
      img.src = logoUrl;
      // Set crossOrigin for CORS issues
      img.crossOrigin = "anonymous";
    });
  } catch(e) {
    console.error("Error adding logo to cover page", e);
    throw e; // Re-throw to allow proper error handling upstream
  }
}
