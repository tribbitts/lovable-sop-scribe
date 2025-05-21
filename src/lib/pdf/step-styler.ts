
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
  
  // Create a clean circular step number indicator with Apple Blue
  const circleRadius = 10;
  const circleX = margin.left + circleRadius;
  const circleY = currentY + circleRadius;
  
  // Draw circle with Apple Blue
  pdf.setFillColor(0, 122, 255); // Apple Blue #007AFF
  pdf.circle(circleX, circleY, circleRadius, 'F');
  
  // Add step number in white text (centered in circle)
  pdf.setTextColor(255, 255, 255); // White text
  pdf.setFontSize(12); // Smaller font for better centering
  
  // Better center the number in the circle
  const stepNumber = (index + 1).toString();
  const textWidth = pdf.getStringUnitWidth(stepNumber) * 12 / pdf.internal.scaleFactor;
  const textHeight = 12 / pdf.internal.scaleFactor;
  pdf.text(stepNumber, circleX - (textWidth / 2), circleY + (textHeight / 2));
  
  // Step description - using smaller 14pt font for better readability
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14); // Reduced from 18pt to 14pt
  pdf.setTextColor(44, 44, 46); // Dark gray (Apple-style)
  
  // Add step description with proper indent and text wrapping
  const descriptionX = margin.left + (circleRadius * 2) + 10;
  const availableWidth = width - margin.left - margin.right - 60; // Ensure description fits
  currentY = addWrappedText(
    pdf,
    step.description,
    descriptionX,
    currentY + circleRadius,
    availableWidth,
    7 // Line height
  );
  
  // Get width of step description text for the line (capped by available width)
  const descWidth = Math.min(
    pdf.getStringUnitWidth(step.description) * 14 / pdf.internal.scaleFactor,
    availableWidth
  );
  
  // Add subtle separator line under step description (thin black line)
  pdf.setDrawColor(44, 44, 46); // Dark gray/black
  pdf.setLineWidth(0.5);
  pdf.line(
    descriptionX,
    currentY + 5, // Add line below the text with spacing
    descriptionX + descWidth,
    currentY + 5
  );
  
  // Move currentY below the step header with appropriate spacing
  currentY += 15;
  
  return currentY;
}
