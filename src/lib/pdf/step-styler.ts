
import { SopStep } from "@/types/sop";

/**
 * Styles a step header with a simplified design
 * Uses blue text for the step number and clean black text for the description
 */
export function styleStep(
  pdf: any,
  step: SopStep,
  stepIndex: number,
  currentY: number,
  margin: any,
  width: number
): number {
  try {
    // Configuration
    const contentWidth = width - margin.left - margin.right;
    const stepNumber = stepIndex + 1;
    const stepNumberStr = stepNumber.toString();
    const stepText = step.description || `Step ${stepNumber}`;
    
    // Color definitions
    const blueColor = [0, 122, 255]; // #007AFF
    const blackTextColor = [0, 0, 0];
    
    // Compact step styling
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");

    // Calculate text dimensions
    const stepLabelText = "Step ";
    const stepLabelWidth = pdf.getStringUnitWidth(stepLabelText) * 11 / pdf.internal.scaleFactor;
    const stepNumberWidth = pdf.getStringUnitWidth(stepNumberStr) * 11 / pdf.internal.scaleFactor;
    const stepTextWidth = pdf.getStringUnitWidth(stepText) * 11 / pdf.internal.scaleFactor;
    
    // Vertical spacing
    const textPadding = 3;
    const verticalPadding = 4;
    const totalHeight = 11 / pdf.internal.scaleFactor + (verticalPadding * 2); // text height + padding
    
    // Add "Step" text in black
    pdf.setTextColor(...blackTextColor);
    pdf.text(
      stepLabelText, 
      margin.left, 
      currentY + verticalPadding + (11 / pdf.internal.scaleFactor)
    );
    
    // Add step number text in blue
    pdf.setTextColor(...blueColor);
    pdf.text(
      stepNumberStr, 
      margin.left + stepLabelWidth, 
      currentY + verticalPadding + (11 / pdf.internal.scaleFactor)
    );
    
    // Add step description text in black, positioned after the step number
    pdf.setTextColor(...blackTextColor);
    pdf.text(
      stepText, 
      margin.left + stepLabelWidth + stepNumberWidth + textPadding, 
      currentY + verticalPadding + (11 / pdf.internal.scaleFactor)
    );
    
    // Return the new Y position
    return currentY + totalHeight; // Add a little extra space after the step header
  } catch (error) {
    console.error("Error styling step:", error);
    return currentY + 15; // Return a default value to continue
  }
}

