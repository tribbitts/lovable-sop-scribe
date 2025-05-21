
import { SopDocument } from "@/types/sop";

export function addContentPageDesign(pdf: any, width: number, height: number, margin: any) {
  // If there's a background image, add it first (so it's behind everything)
  if (pdf.backgroundImage) {
    try {
      // Add the background image to fill the entire page
      // We don't restrict size - it will naturally bleed off the page if too large
      pdf.addImage(
        pdf.backgroundImage,
        'PNG',
        0,
        0,
        width,
        height
      );
    } catch (error) {
      console.error("Error adding background image:", error);
    }
  } else {
    // Keep the design extremely minimal to maximize content space
    // Just a small light circle in bottom left corner
    pdf.setFillColor(245, 245, 247, 0.5); // Very light gray with transparency
    pdf.circle(margin.left, height - margin.bottom, 30, 'F');
  }
}

export function addPageFooters(pdf: any, sopDocument: SopDocument, width: number, height: number, margin: any) {
  const pageCount = pdf.internal.getNumberOfPages(); // More reliable way to get page count
  const currentYear = new Date().getFullYear();
  const companyNameToUse = sopDocument.companyName || "SOP Creator App"; // Fallback for company name

  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFont("Inter", "normal"); // Use Inter font
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100); // Medium gray

    // Construct footer text
    let footerText = `For internal use only | © ${companyNameToUse} ${currentYear}`;

    // Add page numbers for all content pages (not the cover page)
    if (i > 1) {
      footerText += ` | Page ${i - 1} of ${pageCount - 1}`;
    }

    // Center the footer
    const fontSize = pdf.getFontSize();
    const footerWidth = pdf.getStringUnitWidth(footerText) * fontSize / pdf.internal.scaleFactor;
    pdf.text(
      footerText,
      (width - footerWidth) / 2,
      height - 10 // 10mm from the bottom of the page
    );
  }
}
