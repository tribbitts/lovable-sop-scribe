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
  
  // Set the header height to be more compact - 6px tall
  const headerHeight = 6; // Reduced height for more compact look
  
  // Blue 10%, White 90% gradient background for the step header
  // First, create the blue section (10% of width)
  const blueWidth = contentWidth * 0.1;
  pdf.setFillColor(0, 122, 255); // Apple Blue background
  pdf.rect(
    margin.left, 
    currentY, 
    blueWidth, 
    headerHeight,
    'F'
  );
  
  // Then create the white section (90% of width)
  pdf.setFillColor(255, 255, 255); // White background
  pdf.rect(
    margin.left + blueWidth, 
    currentY, 
    contentWidth - blueWidth, 
    headerHeight,
    'F'
  );
  
  // Add step number with professional styling in the blue section
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255); // White text for better contrast on blue
  const stepText = `STEP ${stepNumber}`;
  pdf.text(
    stepText, 
    margin.left + 4, // Centered in blue section
    currentY + headerHeight/2 + 2.5 // Vertically centered
  );
  
  // Add the step description in the white section with black text
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0); // Black text for description
  
  // Position the description text in the white section
  const descriptionX = margin.left + blueWidth + 5; // Add padding from blue section
  const descriptionY = currentY + headerHeight/2 + 2.5; // Same vertical alignment as step number
  const availableWidth = contentWidth - blueWidth - 10; // Adjusted width for description
  
  // Only add the first line of description in the header
  let descriptionFirstLine = step.description;
  if (descriptionFirstLine.length > 70) {
    descriptionFirstLine = descriptionFirstLine.substring(0, 70) + "...";
  }
  
  pdf.text(descriptionFirstLine, descriptionX, descriptionY);
  
  // Return the Y position after the header
  return currentY + headerHeight + 4; // Small spacing after header
}
