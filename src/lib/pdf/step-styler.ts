
import { SopStep } from "@/types/sop";

/**
 * Styles a step header with an improved, more compact design
 * Uses a blue pill for the step number and clean black text for the description
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
    
    // More compact step styling
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");

    // Calculate text dimensions
    const stepTextWidth = pdf.getStringUnitWidth(stepText) * 11 / pdf.internal.scaleFactor;
    const numberWidth = pdf.getStringUnitWidth(stepNumberStr) * 11 / pdf.internal.scaleFactor;
    
    // Vertical spacing
    const textPadding = 3;
    const verticalPadding = 4;
    const totalHeight = 11 / pdf.internal.scaleFactor + (verticalPadding * 2); // text height + padding
    
    // Draw blue pill for step number - tight around the text
    const pillWidth = numberWidth + (textPadding * 2);
    const pillHeight = totalHeight;
    const pillRadius = pillHeight / 2;
    
    pdf.setFillColor(...blueColor);
    
    // Draw rounded rectangle for number
    pdf.roundedRect(
      margin.left, 
      currentY, 
      pillWidth, 
      pillHeight, 
      pillRadius, 
      pillRadius, 
      'F'
    );
    
    // Add step number text in white
    pdf.setTextColor(255, 255, 255);
    pdf.text(
      stepNumberStr, 
      margin.left + textPadding, 
      currentY + verticalPadding + (11 / pdf.internal.scaleFactor)
    );
    
    // Add step description text in black, positioned after the pill
    pdf.setTextColor(...blackTextColor);
    pdf.text(
      stepText, 
      margin.left + pillWidth + (textPadding * 2), 
      currentY + verticalPadding + (11 / pdf.internal.scaleFactor)
    );
    
    // Return the new Y position
    return currentY + pillHeight + 2; // Add a little extra space after the step header
  } catch (error) {
    console.error("Error styling step:", error);
    return currentY + 15; // Return a default value to continue
  }
}
