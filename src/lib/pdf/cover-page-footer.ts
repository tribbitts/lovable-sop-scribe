
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

/**
 * Add SOPify watermark to cover page
 */
export function addSopifyWatermark(pdf: any, width: number, height: number) {
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
