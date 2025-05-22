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
    const contentWidth = width - margin.left - margin.right;
    const stepNumber = stepIndex + 1;
    const stepLabel = `STEP ${stepNumber}`;
    const description = step.description || "";

    // Colors (Apple-like)
    const lightGreyBg = [240, 240, 240]; // #F0F0F0
    const appleBlueText = [0, 122, 255]; // #007AFF
    const primaryTextColor = [50, 50, 50]; // Dark grey for description #323232
    const stepLabelColor = [0,0,0]; // Black for "STEP X"

    // Fonts & Sizes (ensure font is registered, e.g., helvetica)
    const stepLabelFontSize = 10;
    const descriptionFontSize = 9;
    const FONT_FAMILY = "helvetica"; // Ensure this font is available/registered

    // Calculate text heights for dynamic header height
    // Approximate height: fontSize * 0.3528 (pt to mm) * 1.2 (line height factor)
    const stepLabelTextHeight = stepLabelFontSize * 0.3528 * 1.2;
    const descriptionTextHeight = descriptionFontSize * 0.3528 * 1.2;
    
    const verticalPadding = 3; // Padding above and below text block
    let headerHeight = verticalPadding * 2;
    let stepLabelY, descriptionY;

    // Layout: STEP X and Description on the same line if description is short, otherwise stacked.
    pdf.setFont(FONT_FAMILY, "bold");
    pdf.setFontSize(stepLabelFontSize);
    const stepLabelWidth = pdf.getStringUnitWidth(stepLabel) * stepLabelFontSize / pdf.internal.scaleFactor;
    
    pdf.setFont(FONT_FAMILY, "normal");
    pdf.setFontSize(descriptionFontSize);
    const descriptionWidth = pdf.getStringUnitWidth(description) * descriptionFontSize / pdf.internal.scaleFactor;

    const combinedWidth = stepLabelWidth + 10 + descriptionWidth; // 10 for spacing

    if (description && combinedWidth < contentWidth * 0.9) { // Single line layout
      headerHeight += Math.max(stepLabelTextHeight, descriptionTextHeight);
      stepLabelY = currentY + verticalPadding + (headerHeight - verticalPadding * 2) / 2 + stepLabelTextHeight / 3.5;
      descriptionY = stepLabelY; // Align baseline
    } else { // Stacked layout or no description
      headerHeight += stepLabelTextHeight + (description ? verticalPadding/2 + descriptionTextHeight : 0);
      stepLabelY = currentY + verticalPadding + stepLabelTextHeight / 2 + stepLabelTextHeight / 3.5;
      descriptionY = stepLabelY + stepLabelTextHeight / 2 + descriptionTextHeight / 2 + verticalPadding /2;
    }
    
    const borderRadius = 3;

    // Draw background rounded rectangle
    pdf.setFillColor(...lightGreyBg);
    pdf.roundedRect(margin.left, currentY, contentWidth, headerHeight, borderRadius, borderRadius, 'F');

    // Draw STEP X text
    pdf.setFont(FONT_FAMILY, "bold");
    pdf.setFontSize(stepLabelFontSize);
    pdf.setTextColor(...stepLabelColor);
    pdf.text(stepLabel, margin.left + 5, stepLabelY);

    // Draw description text
    if (description) {
      pdf.setFont(FONT_FAMILY, "normal");
      pdf.setFontSize(descriptionFontSize);
      pdf.setTextColor(...primaryTextColor);
      let descX = margin.left + 5;
      if (combinedWidth < contentWidth * 0.9) { // Single line if it fits
        descX = margin.left + stepLabelWidth + 10;
      }
      // Add text wrapping for description if it's in stacked mode or too long for single line.
      const descMaxWidth = contentWidth - 10; // Max width for description with padding
      const splitDescription = pdf.splitTextToSize(description, (descX === margin.left + 5) ? descMaxWidth : descMaxWidth - stepLabelWidth -10);
      pdf.text(splitDescription, descX, (descX === margin.left + 5) ? descriptionY : stepLabelY );
    }

    return currentY + headerHeight + 5; // Add 5mm spacing after the header

  } catch (error) {
    console.error("Error styling step:", error);
    return currentY + 15; // Fallback to ensure flow continues
  }
}

