import { SopDocument } from "@/types/sop";

export function addContentPageDesign(pdf: any, width: number, height: number, margin: any) {
  // Keep the design extremely minimal to maximize content space
  // Just a small light circle in bottom left corner
  pdf.setFillColor(245, 245, 247, 0.5); // Very light gray with transparency
  pdf.circle(margin.left, height - margin.bottom, 30, 'F');
  
  // If there's a background image, add it (will be implemented later)
  if (pdf.backgroundImage) {
    pdf.addImage(
      pdf.backgroundImage,
      'PNG',
      0,
      0,
      width,
      height
    );
  }
}

export function addPageFooters(pdf: any, sopDocument: SopDocument, width: number, height: number, margin: any) {
  // Add stylized footers on each page - only one footer per page as requested
  const pageCount = pdf.getNumberOfPages();
  const currentYear = new Date().getFullYear();
  
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100); // Medium gray
    
    // Consolidated footer: "For internal use only | © Company Year | Page X of Y"
    let footerText = "For internal use only";
    
    // Add company and year in middle section if available
    if (sopDocument.companyName) {
      footerText += ` | © ${sopDocument.companyName} ${currentYear}`;
    }
    
    // Add page numbers for all pages except cover
    if (i > 1) {
      footerText += ` | Page ${i-1} of ${pageCount-1}`;
    }
    
    // Center the footer
    const footerWidth = pdf.getStringUnitWidth(footerText) * 9 / pdf.internal.scaleFactor;
    pdf.text(
      footerText,
      (width - footerWidth) / 2,
      height - 10
    );
  }
}
