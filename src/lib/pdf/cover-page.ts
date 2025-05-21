
import { SopDocument } from "@/types/sop";
import { compressImage } from "./utils";

export async function addCoverPage(pdf: any, sopDocument: SopDocument, width: number, height: number, margin: any) {
  // Add minimal, elegant background elements
  addCoverPageDesign(pdf, width, height, margin);
  
  // Add logo to the cover page with proper aspect ratio and positioning
  if (sopDocument.logo) {
    try {
      console.log("Adding logo to cover page");
      await addLogoToCover(pdf, sopDocument, width, height);
      console.log("Logo added successfully");
    } catch (logoError) {
      console.error("Failed to add logo to cover page:", logoError);
      // Continue without logo
    }
  }
  
  // Set a default font first in case custom font fails
  try {
    pdf.setFont("Inter", "bold");
  } catch (fontError) {
    console.warn("Using fallback font due to error:", fontError);
    pdf.setFont("helvetica", "bold");
  }
  
  pdf.setFontSize(28);
  pdf.setTextColor(40, 40, 40); // Dark charcoal
  
  const title = sopDocument.title || "Untitled SOP";
  
  // Calculate title positioning - handle font measurement safely
  let titleWidth;
  try {
    titleWidth = pdf.getStringUnitWidth(title) * 28 / pdf.internal.scaleFactor;
  } catch (e) {
    console.log("Font measurement error, using estimate:", e);
    // Use an estimated width if font measurement fails
    titleWidth = title.length * 4;
  }
  
  pdf.text(title, (width - titleWidth) / 2, height / 2);
  
  // Subtitle with topic and date in small caps
  try {
    pdf.setFont("Inter", "normal");
  } catch (fontError) {
    console.warn("Using fallback font due to error:", fontError);
    pdf.setFont("helvetica", "normal");
  }
  
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100); // Medium gray
  
  const subtitle = `${sopDocument.topic ? sopDocument.topic.toUpperCase() : 'STANDARD OPERATING PROCEDURE'} · ${sopDocument.date}`;
  
  // Handle subtitle positioning safely
  let subtitleWidth;
  try {
    subtitleWidth = pdf.getStringUnitWidth(subtitle) * 12 / pdf.internal.scaleFactor;
  } catch (e) {
    console.log("Font measurement error, using estimate:", e);
    // Use an estimated width if font measurement fails
    subtitleWidth = subtitle.length * 1.5;
  }
  
  pdf.text(subtitle, (width - subtitleWidth) / 2, height / 2 + 15);
  
  // Add subtle divider line
  pdf.setDrawColor(0, 122, 255); // Apple Blue
  pdf.setLineWidth(0.5);
  const lineWidth = Math.min(120, width / 3);
  pdf.line((width - lineWidth) / 2, height / 2 + 25, (width + lineWidth) / 2, height / 2 + 25);
}

// Add minimal background elements for the cover page
function addCoverPageDesign(pdf: any, width: number, height: number, margin: any) {
  // Very subtle light gray background
  pdf.setFillColor(248, 248, 248); // Almost white
  pdf.rect(0, 0, width, height, 'F');
  
  // If there's a background image, add it without resizing
  if (pdf.backgroundImage) {
    try {
      // Validate image format before adding
      if (typeof pdf.backgroundImage !== 'string' || !pdf.backgroundImage.startsWith('data:')) {
        console.error("Invalid background image format, skipping");
        return;
      }
      
      // Add the background image using natural dimensions
      // Let it bleed off the page if too large - no fitting
      pdf.addImage(
        pdf.backgroundImage,
        'PNG',
        0,
        0,
        width,
        height
      );
      console.log("Background image added to cover design successfully");
    } catch (error) {
      console.error("Error adding background image to cover:", error);
      // Continue without the background image
    }
  }
}

// Add logo to the cover page with proper aspect ratio
async function addLogoToCover(pdf: any, sopDocument: SopDocument, width: number, height: number) {
  if (!sopDocument.logo) {
    return; // No logo to add
  }
  
  // Validate logo data
  if (typeof sopDocument.logo !== 'string' || !sopDocument.logo.startsWith('data:')) {
    console.error("Invalid logo data format, skipping logo");
    return;
  }
  
  try {
    // Preserve original logo without compression
    const logoUrl = sopDocument.logo;
    
    // Create a temporary image to get the natural dimensions
    const img = new Image();
    
    await new Promise<void>((resolve, reject) => {
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
          
          // Maximum width limited to 300px as specified
          const maxLogoWidth = Math.min(300, width * 0.5);
          const maxLogoHeight = height * 0.15; // 15% of page height
          
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
          
          // Center horizontally and position at the top with proper spacing
          const logoX = (width - logoWidth) / 2;
          const logoY = height / 5 - logoHeight / 2; // Position in the upper area
          
          // Add the logo with proper proportions
          pdf.addImage(
            logoUrl, 
            "PNG", 
            logoX,
            logoY,
            logoWidth, 
            logoHeight
          );
          console.log("Logo added successfully with dimensions:", logoWidth, "x", logoHeight);
          resolve();
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
