
import { SopStep } from "@/types/sop";
import { addWrappedText } from "./utils";

/**
 * Adds Apple-inspired styling for a step in the PDF
 */
export function styleStep(
  pdf: any,
  step: SopStep,
  index: number,
  currentY: number,
  margin: any,
  width: number
): number {
  // Add clean Apple-inspired styling for step number
  pdf.setFont("helvetica", "bold");
  
  // Create a smaller circular step number indicator
  const circleRadius = 6; // Reduced from 8 to 6 for even more compact layout
  const circleX = margin.left + circleRadius;
  const circleY = currentY + circleRadius;
  
  // Draw circle with Apple Blue
  pdf.setFillColor(0, 122, 255); // Apple Blue #007AFF
  pdf.circle(circleX, circleY, circleRadius, 'F');
  
  // Add step number in white text (centered in circle)
  pdf.setTextColor(255, 255, 255); // White text
  pdf.setFontSize(8); // Smaller font for better centering in smaller circle
  
  // Better center the number in the circle
  const stepNumber = (index + 1).toString();
  const textWidth = pdf.getStringUnitWidth(stepNumber) * 8 / pdf.internal.scaleFactor;
  const textHeight = 8 / pdf.internal.scaleFactor;
  pdf.text(stepNumber, circleX - (textWidth / 2), circleY + (textHeight / 2));
  
  // Step description - using smaller 12pt font for better readability
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11); // Further reduced from 12pt to 11pt for space efficiency
  pdf.setTextColor(44, 44, 46); // Dark gray (Apple-style)
  
  // Add step description with proper indent and text wrapping
  const descriptionX = margin.left + (circleRadius * 2) + 6; // Reduced spacing
  const availableWidth = width - margin.left - margin.right - 30; // Ensure description fits
  currentY = addWrappedText(
    pdf,
    step.description,
    descriptionX,
    currentY + circleRadius - 1, // Slightly raise text for better alignment with smaller circle
    availableWidth,
    5 // Reduced line height for more compact text
  );
  
  // Add subtle separator line under step description
  pdf.setDrawColor(44, 44, 46); // Dark gray/black
  pdf.setLineWidth(0.3); // Thinner line
  pdf.line(
    descriptionX,
    currentY + 2, // Reduced spacing after text
    descriptionX + availableWidth * 0.8, // Shorter line
    currentY + 2
  );
  
  // Move currentY below the step header with minimal spacing
  currentY += 6; // Further reduced from 8 to 6
  
  return currentY;
}
