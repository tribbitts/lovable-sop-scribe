
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
  // Add sophisticated SOPify-branded background design
  addSopifyBrandedDesign(pdf, width, height, margin, backgroundImage || sopDocument.backgroundImage);
  
  // Add logo with refined positioning and SOPify branding
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
  const logoOffset = sopDocument.logo ? 50 : 0;
  
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
  
  // Enhanced footer with proper SOPify branding
  addSopifyBrandedFooter(pdf, width, height, margin);
  
  // Add SOPify watermark
  addSopifyWatermark(pdf, width, height);
}

// Add SOPify-branded background elements
function addSopifyBrandedDesign(
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

// Add SOPify branded cover accents
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

// Add professional SOPify branded footer to cover page
function addSopifyBrandedFooter(pdf: any, width: number, height: number, margin: any) {
  const footerY = height - margin.bottom - 15;
  
  // SOPify branded footer line
  pdf.setDrawColor(0, 122, 255, 0.6); // SOPify blue
  pdf.setLineWidth(1);
  pdf.line(margin.left, footerY - 8, width - margin.right, footerY - 8);
  
  // Footer text with SOPify branding
  try {
    pdf.setFont("Inter", "normal");
  } catch (fontError) {
    pdf.setFont("helvetica", "normal");
  }
  
  pdf.setFontSize(9);
  pdf.setTextColor(0, 122, 255); // SOPify blue
  
  const footerText = "Powered by SOPify • Professional SOP Management Platform";
  let footerWidth;
  try {
    footerWidth = pdf.getStringUnitWidth(footerText) * 9 / pdf.internal.scaleFactor;
  } catch (e) {
    footerWidth = footerText.length * 1.6;
  }
  
  const footerX = (width - footerWidth) / 2;
  pdf.text(footerText, footerX, footerY);
}

// Add SOPify watermark
function addSopifyWatermark(pdf: any, width: number, height: number) {
  // Add subtle SOPify text watermark in bottom right
  try {
    pdf.setFont("Inter", "normal");
  } catch (fontError) {
    pdf.setFont("helvetica", "normal");
  }
  
  pdf.setFontSize(8);
  pdf.setTextColor(0, 122, 255, 0.3); // Very subtle SOPify blue
  
  const watermarkText = "SOPify";
  let watermarkWidth;
  try {
    watermarkWidth = pdf.getStringUnitWidth(watermarkText) * 8 / pdf.internal.scaleFactor;
  } catch (e) {
    watermarkWidth = watermarkText.length * 1.4;
  }
  
  pdf.text(watermarkText, width - watermarkWidth - 15, height - 10);
}

// Add logo to the cover page with proper aspect ratio and SOPify branding
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
