
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
  // Add stylized step number (Apple-inspired) inside the header area
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 122, 255); // Apple Blue
  pdf.setFontSize(18);
  
  // Format step number with leading zero for single digits
  const stepNumber = (index + 1).toString().padStart(2, '0');
  
  // Draw a light gray header background with rounded corners
  pdf.setFillColor(242, 242, 247); // Light gray background
  pdf.roundedRect(margin.left - 10, currentY - 10, width - margin.left - margin.right + 20, 30, 5, 5, 'F');
  
  // Add step number and description inline in the header area
  pdf.text(stepNumber, margin.left, currentY + 5);
  
  // Step title/description
  pdf.setFont("helvetica", "semibold");
  pdf.setFontSize(14);
  pdf.setTextColor(44, 44, 46); // Dark gray
  
  // Add step description with indent in the header
  pdf.text(step.description, margin.left + 20, currentY + 5);
  
  // Move currentY below the header
  currentY += 25;
  
  return currentY;
}
