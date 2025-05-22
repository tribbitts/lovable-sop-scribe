
import { SopStep } from "@/types/sop";

/**
 * Styles a step header with an improved, more compact design
 * Uses a blue bar for 10% of the width and white for 90%
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
    const whiteColor = [255, 255, 255];
    const blackTextColor = [0, 0, 0];
    
    // Step bar dimensions - more compact
    const barHeight = 8; // Compact height for the bar
    const barPadding = 8; // Padding around text
    const textY = currentY + barPadding; // Text Y position
    
    // Calculate text width and full bar width
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    
    // Blue section width - 10% of the content width
    const blueWidth = contentWidth * 0.1; 
    
    // Draw the blue part (10%)
    pdf.setFillColor(...blueColor);
    pdf.rect(margin.left, currentY, blueWidth, barHeight + (barPadding * 2), "F");
    
    // Draw the white part (90%)
    pdf.setFillColor(...whiteColor);
    pdf.rect(margin.left + blueWidth, currentY, contentWidth - blueWidth, barHeight + (barPadding * 2), "F");
    
    // Add step number (centered in the blue part)
    pdf.setTextColor(255, 255, 255); // White text for step number
    pdf.setFontSize(10);
    
    const stepNumberWidth = pdf.getStringUnitWidth(stepNumberStr) * 10 / pdf.internal.scaleFactor;
    const stepNumberX = margin.left + (blueWidth - stepNumberWidth) / 2;
    
    pdf.text(stepNumberStr, stepNumberX, textY);
    
    // Add step description
    pdf.setTextColor(...blackTextColor); // Black text for description
    const stepTextX = margin.left + blueWidth + barPadding;
    
    // Check if text would overflow
    const maxStepTextWidth = contentWidth - blueWidth - (barPadding * 2);
    const stepTextWidth = pdf.getStringUnitWidth(stepText) * 10 / pdf.internal.scaleFactor;
    
    if (stepTextWidth > maxStepTextWidth) {
      // Text would overflow, truncate and add ellipsis
      let truncatedText = stepText;
      while (pdf.getStringUnitWidth(truncatedText + "...") * 10 / pdf.internal.scaleFactor > maxStepTextWidth && truncatedText.length > 0) {
        truncatedText = truncatedText.slice(0, -1);
      }
      truncatedText += "...";
      pdf.text(truncatedText, stepTextX, textY);
    } else {
      pdf.text(stepText, stepTextX, textY);
    }
    
    // Return the new Y position
    return currentY + barHeight + (barPadding * 2);
  } catch (error) {
    console.error("Error styling step:", error);
    return currentY + 15; // Return a default value to continue
  }
}
