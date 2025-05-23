import { SopDocument } from "@/types/sop";
import { compressImage } from "./utils";

export async function addCoverPage(
  pdf: any,
  sopDocument: SopDocument, 
  width: number, 
  height: number, 
  margin: any,
  backgroundImage: string | null = null
) {
  // Add sophisticated background design
  addCoverPageDesign(pdf, width, height, margin, backgroundImage || sopDocument.backgroundImage);
  
  // Add logo with refined positioning
  if (sopDocument.logo) {
    try {
      console.log("Adding logo to cover page");
      await addLogoToCover(pdf, sopDocument, width, height);
      console.log("Logo added successfully");
    } catch (logoError) {
      console.error("Failed to add logo to cover page:", logoError);
    }
  }
  
  // Calculate vertical positioning for professional layout
  const centerY = height / 2;
  const logoOffset = sopDocument.logo ? 40 : 0;
  
  // Main Title - Large and bold
  try {
    pdf.setFont("Inter", "bold");
  } catch (fontError) {
    pdf.setFont("helvetica", "bold");
  }
  
  pdf.setFontSize(32);
  pdf.setTextColor(45, 45, 45); // Rich dark gray
  
  const title = sopDocument.title || "Untitled SOP";
  
  // Center title with proper measurement
  let titleWidth;
  try {
    titleWidth = pdf.getStringUnitWidth(title) * 32 / pdf.internal.scaleFactor;
  } catch (e) {
    titleWidth = title.length * 6; // Estimate for fallback
  }
  
  const titleX = (width - titleWidth) / 2;
  const titleY = centerY - logoOffset;
  pdf.text(title, titleX, titleY);
  
  // Subtitle line with improved typography
  try {
    pdf.setFont("Inter", "normal");
  } catch (fontError) {
    pdf.setFont("helvetica", "normal");
  }
  
  pdf.setFontSize(14);
  pdf.setTextColor(95, 95, 95); // Medium gray
  
  const subtitle = `${sopDocument.topic ? sopDocument.topic.toUpperCase() : 'STANDARD OPERATING PROCEDURE'}`;
  
  let subtitleWidth;
  try {
    subtitleWidth = pdf.getStringUnitWidth(subtitle) * 14 / pdf.internal.scaleFactor;
  } catch (e) {
    subtitleWidth = subtitle.length * 2.5;
  }
  
  const subtitleX = (width - subtitleWidth) / 2;
  const subtitleY = titleY + 18;
  pdf.text(subtitle, subtitleX, subtitleY);
  
  // Elegant divider line with gradient effect
  pdf.setDrawColor(0, 122, 255); // Apple Blue
  pdf.setLineWidth(1.5);
  const lineWidth = Math.min(80, width * 0.2);
  const lineY = subtitleY + 15;
  pdf.line((width - lineWidth) / 2, lineY, (width + lineWidth) / 2, lineY);
  
  // Date and version info
  try {
    pdf.setFont("Inter", "normal");
  } catch (fontError) {
    pdf.setFont("helvetica", "normal");
  }
  
  pdf.setFontSize(11);
  pdf.setTextColor(130, 130, 130); // Light gray
  
  const dateText = sopDocument.date || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  let dateWidth;
  try {
    dateWidth = pdf.getStringUnitWidth(dateText) * 11 / pdf.internal.scaleFactor;
  } catch (e) {
    dateWidth = dateText.length * 2;
  }
  
  const dateX = (width - dateWidth) / 2;
  const dateY = lineY + 25;
  pdf.text(dateText, dateX, dateY);
  
  // Company name if available
  if (sopDocument.companyName) {
    pdf.setFontSize(10);
    pdf.setTextColor(160, 160, 160);
    
    const companyText = sopDocument.companyName.toUpperCase();
    let companyWidth;
    try {
      companyWidth = pdf.getStringUnitWidth(companyText) * 10 / pdf.internal.scaleFactor;
    } catch (e) {
      companyWidth = companyText.length * 1.8;
    }
    
    const companyX = (width - companyWidth) / 2;
    pdf.text(companyText, companyX, dateY + 12);
  }
  
  // Footer with professional branding
  addCoverFooter(pdf, width, height, margin);
}

// Add minimal background elements for the cover page
function addCoverPageDesign(
  pdf: any, 
  width: number, 
  height: number, 
  margin: any,
  backgroundImage: string | null = null
) {
  // Modern gradient background
  pdf.setFillColor(250, 250, 252); // Very light blue-gray
  pdf.rect(0, 0, width, height, 'F');
  
  // Add subtle geometric patterns
  addGeometricBackground(pdf, width, height);
  
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
      
      // Professional overlay for text readability
      pdf.setFillColor(250, 250, 252);
      pdf.setGState(new pdf.GState({ opacity: 0.85 })); // 85% opacity overlay
      pdf.rect(0, 0, width, height, 'F');
      pdf.setGState(new pdf.GState({ opacity: 1 })); // Reset opacity
      
      console.log("Background image added to cover design successfully");
    } catch (error) {
      console.error("Error adding background image to cover:", error);
    }
  }
}

// Add subtle geometric patterns for visual interest
function addGeometricBackground(pdf: any, width: number, height: number) {
  // Very subtle circle patterns
  pdf.setFillColor(245, 247, 250, 0.3); // Ultra-light blue with transparency
  
  // Large background circles
  pdf.circle(width * 0.15, height * 0.2, 60, 'F');
  pdf.circle(width * 0.85, height * 0.8, 80, 'F');
  
  // Smaller accent circles
  pdf.setFillColor(0, 122, 255, 0.05); // Very light blue accent
  pdf.circle(width * 0.75, height * 0.25, 40, 'F');
  pdf.circle(width * 0.25, height * 0.75, 35, 'F');
  
  // Subtle lines for modern feel
  pdf.setDrawColor(0, 122, 255, 0.1);
  pdf.setLineWidth(0.5);
  
  // Diagonal accent lines
  pdf.line(width * 0.05, height * 0.15, width * 0.25, height * 0.05);
  pdf.line(width * 0.75, height * 0.95, width * 0.95, height * 0.85);
}

// Add professional footer to cover page
function addCoverFooter(pdf: any, width: number, height: number, margin: any) {
  const footerY = height - margin.bottom - 15;
  
  // Footer line
  pdf.setDrawColor(0, 122, 255, 0.3);
  pdf.setLineWidth(0.5);
  pdf.line(margin.left, footerY - 5, width - margin.right, footerY - 5);
  
  // Footer text
  try {
    pdf.setFont("Inter", "normal");
  } catch (fontError) {
    pdf.setFont("helvetica", "normal");
  }
  
  pdf.setFontSize(8);
  pdf.setTextColor(140, 140, 140);
  
  const footerText = "Generated by SOPify • Professional SOP Management";
  let footerWidth;
  try {
    footerWidth = pdf.getStringUnitWidth(footerText) * 8 / pdf.internal.scaleFactor;
  } catch (e) {
    footerWidth = footerText.length * 1.5;
  }
  
  const footerX = (width - footerWidth) / 2;
  pdf.text(footerText, footerX, footerY);
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
