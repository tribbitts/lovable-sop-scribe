import { SopDocument } from "@/types/sop";

export function addContentPageDesign(pdf: any, width: number, height: number, margin: any) {
  // Keep the design minimal at the top to allow content to start higher
  // Light circle in bottom left only
  pdf.setFillColor(245, 245, 247); // Very light gray
  pdf.circle(margin.left, height - margin.bottom, 60, 'F');
  
  // Remove the top accent bar to save vertical space
}

export function addPageFooters(pdf: any, sopDocument: SopDocument, width: number, height: number, margin: any) {
  // Add stylized footers on each page
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(161, 161, 166); // Apple light gray
    
    // Left side: For internal use only
    pdf.text(
      "For internal use only",
      margin.left,
      height - 15
    );
    
    if (i > 1) { // Don't show page numbers on cover
      // Right side: Page number
      const pageText = `Page ${i} of ${pageCount}`;
      pdf.text(
        pageText,
        width - margin.right - (pdf.getStringUnitWidth(pageText) * 8 / pdf.internal.scaleFactor),
        height - 15
      );
    }
    
    // Center: Company name with copyright symbol
    const companyText = `© ${sopDocument.companyName}`;
    const companyTextWidth = pdf.getStringUnitWidth(companyText) * 8 / pdf.internal.scaleFactor;
    pdf.text(
      companyText,
      (width - companyTextWidth) / 2,
      height - 15
    );
  }
}
