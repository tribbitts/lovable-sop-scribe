import { SopStep } from "@/types/sop";

/**
 * Styles a step with modern card-based design
 * Professional healthcare-focused aesthetic
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
    
    // Modern color palette
    const colors = {
      primaryBlue: [0, 122, 255],
      darkGray: [45, 45, 45],
      mediumGray: [85, 85, 85],
      lightGray: [245, 247, 250],
      white: [255, 255, 255],
      shadowGray: [0, 0, 0, 0.08],
      accentGreen: [52, 199, 89],
      borderGray: [235, 235, 235]
    };
    
    const FONT_FAMILY = "Inter";
    const FALLBACK_FONT = "helvetica";
    
    // Calculate content areas
    const cardPadding = 15;
    const headerHeight = 35;
    const stepTitle = step.title || `Step ${stepNumber}`;
    const description = step.description || "";
    
    // Calculate total card height based on content
    let descriptionHeight = 0;
    if (description) {
      try {
        pdf.setFont(FONT_FAMILY, "normal");
      } catch {
        pdf.setFont(FALLBACK_FONT, "normal");
      }
      pdf.setFontSize(10);
      
      const wrappedDescription = pdf.splitTextToSize(description, contentWidth - (cardPadding * 2));
      descriptionHeight = Array.isArray(wrappedDescription) ? wrappedDescription.length * 5 : 5;
    }
    
    const totalCardHeight = headerHeight + (description ? descriptionHeight + 10 : 0) + cardPadding;
    
    // Add subtle shadow effect
    pdf.setFillColor(...colors.shadowGray);
    pdf.roundedRect(margin.left + 1, currentY + 1, contentWidth, totalCardHeight, 8, 8, 'F');
    
    // Main card background
    pdf.setFillColor(...colors.white);
    pdf.roundedRect(margin.left, currentY, contentWidth, totalCardHeight, 8, 8, 'F');
    
    // Add border
    pdf.setDrawColor(...colors.borderGray);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin.left, currentY, contentWidth, totalCardHeight, 8, 8, 'S');
    
    // Header section with gradient-like effect
    pdf.setFillColor(248, 250, 252); // Very light blue
    pdf.roundedRect(margin.left, currentY, contentWidth, headerHeight, 8, 8, 'F');
    
    // Trim bottom corners of header to create clean separation
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin.left, currentY + headerHeight - 8, contentWidth, 8, 'F');
    
    // Step number circle
    const circleX = margin.left + cardPadding;
    const circleY = currentY + (headerHeight / 2);
    const circleRadius = 12;
    
    // Step number background with gradient effect
    pdf.setFillColor(...colors.primaryBlue);
    pdf.circle(circleX, circleY, circleRadius, 'F');
    
    // White inner circle for depth
    pdf.setFillColor(...colors.white);
    pdf.circle(circleX, circleY, circleRadius - 2, 'F');
    
    // Step number
    try {
      pdf.setFont(FONT_FAMILY, "bold");
    } catch {
      pdf.setFont(FALLBACK_FONT, "bold");
    }
    pdf.setFontSize(14);
    pdf.setTextColor(...colors.primaryBlue);
    
    // Center the number in the circle
    const numberStr = String(stepNumber);
    let numberWidth;
    try {
      numberWidth = pdf.getStringUnitWidth(numberStr) * 14 / pdf.internal.scaleFactor;
    } catch (e) {
      numberWidth = numberStr.length * 2.5;
    }
    
    pdf.text(numberStr, circleX - (numberWidth / 2), circleY + 2);
    
    // Step title with modern typography
    try {
      pdf.setFont(FONT_FAMILY, "semibold");
    } catch {
      pdf.setFont(FALLBACK_FONT, "bold");
    }
    pdf.setFontSize(13);
    pdf.setTextColor(...colors.darkGray);
    
    const titleX = circleX + circleRadius + 12;
    const titleY = circleY + 2;
    
    // Wrap title if too long
    const maxTitleWidth = contentWidth - (titleX - margin.left) - cardPadding;
    const wrappedTitle = pdf.splitTextToSize(stepTitle, maxTitleWidth);
    
    if (Array.isArray(wrappedTitle)) {
      wrappedTitle.forEach((line: string, index: number) => {
        pdf.text(line, titleX, titleY + (index * 6));
      });
    } else {
      pdf.text(wrappedTitle, titleX, titleY);
    }
    
    // Tags (if any)
    if (step.tags && step.tags.length > 0) {
      const tagsY = circleY + 10;
      let tagX = titleX;
      
      step.tags.forEach((tag, index) => {
        if (index < 3) { // Limit to 3 tags for space
          try {
            pdf.setFont(FONT_FAMILY, "normal");
          } catch {
            pdf.setFont(FALLBACK_FONT, "normal");
          }
          pdf.setFontSize(7);
          
          const tagWidth = pdf.getStringUnitWidth(tag) * 7 / pdf.internal.scaleFactor + 6;
          
          // Tag background
          pdf.setFillColor(240, 248, 255);
          pdf.roundedRect(tagX, tagsY - 3, tagWidth, 8, 2, 2, 'F');
          
          // Tag border
          pdf.setDrawColor(...colors.primaryBlue);
          pdf.setLineWidth(0.3);
          pdf.roundedRect(tagX, tagsY - 3, tagWidth, 8, 2, 2, 'S');
          
          // Tag text
          pdf.setTextColor(...colors.primaryBlue);
          pdf.text(tag, tagX + 3, tagsY + 1);
          
          tagX += tagWidth + 4;
        }
      });
    }
    
    // Description section
    if (description) {
      const descY = currentY + headerHeight + 8;
      
      try {
        pdf.setFont(FONT_FAMILY, "normal");
      } catch {
        pdf.setFont(FALLBACK_FONT, "normal");
      }
      pdf.setFontSize(10);
      pdf.setTextColor(...colors.mediumGray);
      
      const wrappedDescription = pdf.splitTextToSize(description, contentWidth - (cardPadding * 2));
      
      if (Array.isArray(wrappedDescription)) {
        wrappedDescription.forEach((line: string, index: number) => {
          pdf.text(line, margin.left + cardPadding, descY + (index * 5));
        });
      } else {
        pdf.text(wrappedDescription, margin.left + cardPadding, descY);
      }
    }
    
    // Add detailed instructions section if available
    if (step.detailedInstructions) {
      const instructionsY = currentY + headerHeight + (description ? descriptionHeight + 15 : 8);
      
      // Instructions header
      try {
        pdf.setFont(FONT_FAMILY, "semibold");
      } catch {
        pdf.setFont(FALLBACK_FONT, "bold");
      }
      pdf.setFontSize(9);
      pdf.setTextColor(...colors.darkGray);
      pdf.text("DETAILED INSTRUCTIONS", margin.left + cardPadding, instructionsY);
      
      // Instructions content
      try {
        pdf.setFont(FONT_FAMILY, "normal");
      } catch {
        pdf.setFont(FALLBACK_FONT, "normal");
      }
      pdf.setFontSize(9);
      pdf.setTextColor(...colors.mediumGray);
      
      const wrappedInstructions = pdf.splitTextToSize(step.detailedInstructions, contentWidth - (cardPadding * 2));
      const instructionsTextY = instructionsY + 6;
      
      if (Array.isArray(wrappedInstructions)) {
        wrappedInstructions.forEach((line: string, index: number) => {
          pdf.text(line, margin.left + cardPadding, instructionsTextY + (index * 4.5));
        });
      } else {
        pdf.text(wrappedInstructions, margin.left + cardPadding, instructionsTextY);
      }
    }
    
    return currentY + totalCardHeight + 12; // Add spacing between cards

  } catch (error) {
    console.error("Error styling step:", error);
    return currentY + 20; // Fallback spacing
  }
}

