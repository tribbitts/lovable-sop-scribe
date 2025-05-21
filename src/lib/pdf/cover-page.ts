
import { SopDocument } from "@/types/sop";
import { compressImage } from "./utils";

export async function addCoverPage(pdf: any, sopDocument: SopDocument, width: number, height: number, margin: any) {
  // Add minimal, elegant background elements
  addCoverPageDesign(pdf, width, height, margin);
  
  // Add logo to the cover page with proper aspect ratio
  if (sopDocument.logo) {
    await addLogoToCover(pdf, sopDocument, width, height);
  }
  
  // Center-aligned title (large and bold)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  pdf.setTextColor(40, 40, 40); // Dark charcoal
  
  const title = sopDocument.title;
  const titleWidth = pdf.getStringUnitWidth(title) * 28 / pdf.internal.scaleFactor;
  pdf.text(title, (width - titleWidth) / 2, height / 2.5);
  
  // Subtitle with topic and date in small caps
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100); // Medium gray
  
  const subtitle = `${sopDocument.topic.toUpperCase()} · ${sopDocument.date}`;
  const subtitleWidth = pdf.getStringUnitWidth(subtitle) * 12 / pdf.internal.scaleFactor;
  pdf.text(subtitle, (width - subtitleWidth) / 2, height / 2.5 + 15);
  
  // Add subtle divider line
  pdf.setDrawColor(0, 122, 255); // Apple Blue
  pdf.setLineWidth(0.5);
  const lineWidth = Math.min(120, width / 3);
  pdf.line((width - lineWidth) / 2, height / 2.5 + 25, (width + lineWidth) / 2, height / 2.5 + 25);
  
  // Add single footer to cover page
  addCoverPageFooter(pdf, sopDocument, width, height, margin);
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
          // Maximum dimensions to prevent oversized logos
          const maxLogoWidth = width * 0.4;  // 40% of page width
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

// Add clean, minimal footer to the cover page
function addCoverPageFooter(pdf: any, sopDocument: SopDocument, width: number, height: number, margin: any) {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(140, 140, 140); // Light gray
  
  const currentYear = new Date().getFullYear();
  const footerText = `For internal use only | © ${currentYear} ${sopDocument.companyName}`;
  const footerWidth = pdf.getStringUnitWidth(footerText) * 9 / pdf.internal.scaleFactor;
  pdf.text(
    footerText,
    (width - footerWidth) / 2,
    height - margin.bottom
  );
}
