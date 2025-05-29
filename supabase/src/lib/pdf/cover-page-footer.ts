
import { setFontSafe, getStringWidthSafe } from "./font-handler";

/**
 * Add professional SOPify branded footer to cover page
 */
export function addSopifyBrandedFooter(pdf: any, width: number, height: number, margin: any) {
  const footerY = height - margin.bottom - 15;
  
  // SOPify branded footer line
  pdf.setDrawColor(0, 122, 255, 0.6); // SOPify blue
  pdf.setLineWidth(1);
  pdf.line(margin.left, footerY - 8, width - margin.right, footerY - 8);
  
  // Footer text with SOPify branding
  setFontSafe(pdf, "helvetica", "normal");
  
  pdf.setFontSize(9);
  pdf.setTextColor(0, 122, 255); // SOPify blue
  
  const footerText = "Powered by SOPify • Professional SOP Management Platform";
  const footerWidth = getStringWidthSafe(pdf, footerText, 9);
  const footerX = (width - footerWidth) / 2;
  pdf.text(footerText, footerX, footerY);
}

/**
 * Add SOPify watermark to cover page
 */
export function addSopifyWatermark(pdf: any, width: number, height: number) {
  // Add subtle SOPify text watermark in bottom right
  setFontSafe(pdf, "helvetica", "normal");
  
  pdf.setFontSize(8);
  pdf.setTextColor(0, 122, 255, 0.3); // Very subtle SOPify blue
  
  const watermarkText = "SOPify";
  const watermarkWidth = getStringWidthSafe(pdf, watermarkText, 8);
  pdf.text(watermarkText, width - watermarkWidth - 15, height - 10);
}
