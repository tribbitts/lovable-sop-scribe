
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
  // Add stylized step number (Apple-inspired)
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 122, 255); // Apple Blue
  pdf.setFontSize(18);
  
  // Format step number with leading zero for single digits
  const stepNumber = (index + 1).toString().padStart(2, '0');
  pdf.text(stepNumber, margin.left, currentY);
  
  // Step title/description
  pdf.setFont("helvetica", "semibold");
  pdf.setFontSize(14);
  pdf.setTextColor(44, 44, 46); // Dark gray
  
  // Add step description with indent
  pdf.text(step.description, margin.left + 15, currentY);
  currentY += 10;
  
  // Add a light gray separator line
  pdf.setDrawColor(230, 230, 230);
  pdf.setLineWidth(0.2);
  pdf.line(margin.left, currentY, width - margin.right, currentY);
  currentY += 10;
  
  return currentY;
}
