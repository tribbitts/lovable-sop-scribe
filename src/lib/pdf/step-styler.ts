
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
  
  // Add a subtle gradient background for the step header
  pdf.setFillColor(0, 122, 255); // Apple Blue background
  pdf.rect(
    margin.left, 
    currentY, 
    contentWidth, 
    10, // Height of the header
    'F'
  );
  
  // Add step number with professional styling
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255); // White text for better contrast
  const stepText = `STEP ${stepNumber}`;
  pdf.text(
    stepText, 
    margin.left + 7, // Indented after the accent line
    currentY + 6.5 // Vertically centered
  );
  
  // Calculate the width of the step text to position the description
  const stepTextWidth = pdf.getStringUnitWidth(stepText) * 9 / pdf.internal.scaleFactor;
  
  // Add the step description on the same line as step number
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255); // Keep white text for description in the header
  
  // Position the description text after the step number with some padding
  const descriptionX = margin.left + stepTextWidth + 15; // Add padding after step number
  const descriptionY = currentY + 6.5; // Same vertical alignment as step number
  const availableWidth = contentWidth - stepTextWidth - 20; // Adjusted width for description
  
  // Only add the first line of description in the header
  let descriptionFirstLine = step.description;
  if (descriptionFirstLine.length > 70) {
    descriptionFirstLine = descriptionFirstLine.substring(0, 70) + "...";
  }
  
  pdf.text(descriptionFirstLine, descriptionX, descriptionY);
  
  // Return the Y position after the header
  return currentY + 12; // Small spacing after header
}
