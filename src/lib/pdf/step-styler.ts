
import { SopStep } from "@/types/sop";

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
  pdf.setFontSize(14);
  
  // Center the number in the circle
  const stepNumber = (index + 1).toString();
  const textWidth = pdf.getStringUnitWidth(stepNumber) * 14 / pdf.internal.scaleFactor;
  pdf.text(stepNumber, circleX - (textWidth / 2), circleY + 5);
  
  // Step title/description - using 18pt as specified
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(44, 44, 46); // Dark gray (Apple-style)
  
  // Add step description with proper indent
  const stepText = pdf.text(
    step.description, 
    margin.left + (circleRadius * 2) + 10, 
    currentY + circleRadius
  );
  
  // Get width of step description text for the line
  const descWidth = Math.min(
    pdf.getStringUnitWidth(step.description) * 18 / pdf.internal.scaleFactor,
    width - margin.left - margin.right - 60
  );
  
  // Add subtle separator line under step description (thin black line)
  pdf.setDrawColor(44, 44, 46); // Dark gray/black
  pdf.setLineWidth(0.5);
  pdf.line(
    margin.left + (circleRadius * 2) + 10,
    currentY + (circleRadius * 2) + 5,
    margin.left + (circleRadius * 2) + 10 + descWidth,
    currentY + (circleRadius * 2) + 5
  );
  
  // Move currentY below the step header with appropriate spacing
  currentY += (circleRadius * 2) + 25;
  
  return currentY;
}
