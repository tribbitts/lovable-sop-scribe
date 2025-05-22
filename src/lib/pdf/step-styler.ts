import { SopStep } from "@/types/sop";
import { addWrappedText } from "./utils";

/**
 * Adds a professional, clean styling for a step in the PDF
 */
export function styleStep(
  pdf: any,
  step: SopStep,
  index: number,
  currentY: number,
  margin: any,
  width: number
): number {
  const stepNumber = index + 1;
  const contentWidth = width - margin.left - margin.right;
  
  const fontSize = 8; // Slightly smaller font for tighter fit
  const pillPaddingY = 1.5; 
  const textHeight = fontSize * 0.3528; // Conversion from points to mm (approx)
  const headerHeight = Math.max(10, textHeight + (pillPaddingY * 2)); // Ensure min height, make it snug
  const pillRadius = headerHeight / 2;

  // Draw the main white pill background first
  pdf.setFillColor(255, 255, 255); // White background
  pdf.roundedRect(
    margin.left, 
    currentY, 
    contentWidth, 
    headerHeight,
    pillRadius, 
    pillRadius,
    'F'
  );
  
  // Draw the blue part on the left, also rounded, but only on its left side
  // To make it appear as one shape, its right edge should be straight and align with white's start
  const blueWidth = contentWidth * 0.1;
  pdf.setFillColor(0, 122, 255); // Apple Blue background
  // We want left corners rounded, right corners square (0 radius)
  pdf.roundedRect(
    margin.left, 
    currentY, 
    blueWidth, 
    headerHeight,
    [pillRadius, 0, 0, pillRadius], // TL, TR, BR, BL radii
    // pillRadius, // If only one radius, it applies to all. For specific, need array.
    // pillRadius, 
    'F'
  );
  
  // Add step number in the blue section
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(fontSize);
  pdf.setTextColor(255, 255, 255); 
  const stepText = `STEP ${stepNumber}`;
  // Calculate text Y for vertical centering
  const textY = currentY + (headerHeight / 2) + (textHeight / 2) - pillPaddingY * 0.5; // Adjusted for better centering

  pdf.text(
    stepText, 
    margin.left + pillPaddingY * 2, // Add some horizontal padding
    textY
  );
  
  // Add the step description in the white section
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(fontSize);
  pdf.setTextColor(0, 0, 0); 
  
  const descriptionX = margin.left + blueWidth + pillPaddingY * 2; 
  const descriptionY = textY; 
  const availableWidthForDesc = contentWidth - blueWidth - (pillPaddingY * 4); 
  
  let descriptionFirstLine = step.description;
  if (pdf.getStringUnitWidth(descriptionFirstLine) * fontSize / pdf.internal.scaleFactor > availableWidthForDesc) {
    // Trim description if too long for the header space
    // This is a more robust way than just character length
    let trimmedDesc = step.description;
    while (pdf.getStringUnitWidth(trimmedDesc + '...') * fontSize / pdf.internal.scaleFactor > availableWidthForDesc && trimmedDesc.length > 0) {
        trimmedDesc = trimmedDesc.substring(0, trimmedDesc.length - 1);
    }
    descriptionFirstLine = trimmedDesc + (step.description.length > trimmedDesc.length ? '...' : '');
  }
  
  pdf.text(descriptionFirstLine, descriptionX, descriptionY);
  
  return currentY + headerHeight + 4; 
}
