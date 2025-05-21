
import { SopDocument } from "@/types/sop";
import { compressImage } from "./utils";

export async function addCoverPage(pdf: any, sopDocument: SopDocument, width: number, height: number, margin: any) {
  // Add minimal, elegant background elements
  addCoverPageDesign(pdf, width, height, margin);
  
  // Add logo to the cover page with proper aspect ratio and positioning
  if (sopDocument.logo) {
    await addLogoToCover(pdf, sopDocument, width, height);
  }
  
  // Center-aligned title (large and bold)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  pdf.setTextColor(40, 40, 40); // Dark charcoal
  
  const title = sopDocument.title;
  const titleWidth = pdf.getStringUnitWidth(title) * 28 / pdf.internal.scaleFactor;
  pdf.text(title, (width - titleWidth) / 2, height / 2);
  
  // Subtitle with topic and date in small caps
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100); // Medium gray
  
  const subtitle = `${sopDocument.topic.toUpperCase()} · ${sopDocument.date}`;
  const subtitleWidth = pdf.getStringUnitWidth(subtitle) * 12 / pdf.internal.scaleFactor;
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
}

// Add logo to the cover page with proper aspect ratio
async function addLogoToCover(pdf: any, sopDocument: SopDocument, width: number, height: number) {
  if (sopDocument.logo) {
    try {
      // Preserve original logo without compression
      const logoUrl = sopDocument.logo;
      
      // Create a temporary image to get the natural dimensions
      const img = new Image();
      img.src = logoUrl;
      
      await new Promise<void>((resolve) => {
        img.onload = () => {
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
          resolve();
        };
      });
    } catch(e) {
      console.error("Error adding logo to cover page", e);
    }
  }
}
