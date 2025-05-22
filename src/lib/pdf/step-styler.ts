
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
  pdf.setFillColor(248, 249, 250); // Very light gray background
  pdf.rect(
    margin.left, 
    currentY, 
    contentWidth, 
    10, // Height of the header
    'F'
  );
  
  // Draw a small accent line on the left
  pdf.setFillColor(0, 122, 255); // Apple Blue
  pdf.rect(
    margin.left, 
    currentY, 
    3, // Width of the accent line
    10, // Height matching the header
    'F'
  );
  
  // Add step number with professional styling
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(70, 70, 70); // Dark gray text
  pdf.text(
    `STEP ${stepNumber}`, 
    margin.left + 7, // Indented after the accent line
    currentY + 6.5 // Vertically centered
  );
  
  // Add the step description
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(44, 44, 46); // Dark gray text for description
  
  // Calculate new Y position after the header
  currentY += 12;
  
  // Add description text with proper wrapping
  const descriptionX = margin.left + 2;
  const availableWidth = contentWidth - 4;
  currentY = addWrappedText(
    pdf,
    step.description,
    descriptionX,
    currentY,
    availableWidth,
    5 // Line height
  );
  
  return currentY + 2; // Small spacing after text
}
