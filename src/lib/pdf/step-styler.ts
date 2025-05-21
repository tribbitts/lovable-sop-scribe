
import { SopStep } from "@/types/sop";

/**
 * Adds styling for a step in the PDF
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
  
  // Create a clean circular step number indicator
  const circleRadius = 8;
  const circleX = margin.left + circleRadius;
  const circleY = currentY + circleRadius;
  
  // Draw circle with Apple Blue
  pdf.setFillColor(0, 122, 255); // Apple Blue #007AFF
  pdf.circle(circleX, circleY, circleRadius, 'F');
  
  // Add step number in white text
  pdf.setTextColor(255, 255, 255); // White text
  pdf.setFontSize(14);
  
  // Center the number in the circle
  const stepNumber = (index + 1).toString();
  const textWidth = pdf.getStringUnitWidth(stepNumber) * 14 / pdf.internal.scaleFactor;
  pdf.text(stepNumber, circleX - (textWidth / 2), circleY + 5);
  
  // Step title/description
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(44, 44, 46); // Dark gray (Apple-style)
  
  // Add step description with proper indent
  pdf.text(step.description, margin.left + (circleRadius * 2) + 10, currentY + circleRadius);
  
  // Add subtle separator line under step description
  const descWidth = Math.min(
    pdf.getStringUnitWidth(step.description) * 14 / pdf.internal.scaleFactor,
    width - margin.left - margin.right - 40
  );
  pdf.setDrawColor(200, 200, 200); // Light gray
  pdf.setLineWidth(0.5);
  pdf.line(
    margin.left + (circleRadius * 2) + 10,
    currentY + (circleRadius * 2) + 5,
    margin.left + (circleRadius * 2) + 10 + descWidth,
    currentY + (circleRadius * 2) + 5
  );
  
  // Move currentY below the step header with appropriate spacing
  currentY += (circleRadius * 2) + 15;
  
  return currentY;
}
