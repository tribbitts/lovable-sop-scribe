
import { SopStep } from "@/types/sop";

export function styleStep(
  pdf: any,
  step: SopStep,
  stepIndex: number,
  currentY: number,
  margin: any,
  width: number
): number {
  const stepNumber = stepIndex + 1;
  
  // SOPify branded step card background
  const cardHeight = 25;
  const cardY = currentY - 5;
  
  // Subtle card shadow for depth
  pdf.setFillColor(0, 0, 0, 0.04);
  pdf.roundedRect(margin.left + 1, cardY + 1, width - margin.left - margin.right, cardHeight, 6, 6, 'F');
  
  // Main card background with SOPify styling
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin.left, cardY, width - margin.left - margin.right, cardHeight, 6, 6, 'F');
  
  // SOPify blue card border
  pdf.setDrawColor(0, 122, 255, 0.2);
  pdf.setLineWidth(0.8);
  pdf.roundedRect(margin.left, cardY, width - margin.left - margin.right, cardHeight, 6, 6, 'S');
  
  // Step number with SOPify branding
  const circleX = margin.left + 18;
  const circleY = currentY + 8;
  const circleRadius = 10;
  
  // SOPify blue number background
  pdf.setFillColor(0, 122, 255);
  pdf.circle(circleX, circleY, circleRadius, "F");
  
  // White inner circle for contrast
  pdf.setFillColor(255, 255, 255);
  pdf.circle(circleX, circleY, circleRadius - 2, "F");
  
  // Step number text
  try {
    pdf.setFont("Inter", "bold");
  } catch (fontError) {
    pdf.setFont("helvetica", "bold");
  }
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 122, 255);
  
  const numberStr = String(stepNumber);
  let numberWidth;
  try {
    numberWidth = pdf.getStringUnitWidth(numberStr) * 12 / pdf.internal.scaleFactor;
  } catch (e) {
    numberWidth = numberStr.length * 2.2;
  }
  
  pdf.text(numberStr, circleX - (numberWidth / 2), circleY + 2);
  
  // Step title with SOPify typography
  try {
    pdf.setFont("Inter", "semibold");
  } catch (fontError) {
    pdf.setFont("helvetica", "bold");
  }
  
  pdf.setFontSize(14);
  pdf.setTextColor(44, 62, 80); // Professional dark gray
  
  const titleX = circleX + circleRadius + 12;
  const stepTitle = step.title || `Step ${stepNumber}`;
  
  // Enhanced title truncation for better layout
  let displayTitle = stepTitle;
  const maxTitleLength = 60;
  if (stepTitle.length > maxTitleLength) {
    displayTitle = stepTitle.substring(0, maxTitleLength - 3) + "...";
  }
  
  pdf.text(displayTitle, titleX, currentY + 6);
  
  // Step description with improved typography
  if (step.description && step.description.trim()) {
    try {
      pdf.setFont("Inter", "normal");
    } catch (fontError) {
      pdf.setFont("helvetica", "normal");
    }
    
    pdf.setFontSize(10);
    pdf.setTextColor(52, 73, 94); // Readable dark gray
    
    const descriptionX = titleX;
    const descriptionY = currentY + 16;
    
    // Enhanced description truncation
    let displayDescription = step.description;
    const maxDescLength = 80;
    if (step.description.length > maxDescLength) {
      displayDescription = step.description.substring(0, maxDescLength - 3) + "...";
    }
    
    pdf.text(displayDescription, descriptionX, descriptionY);
  }
  
  // Add subtle completion indicator if step is completed
  if (step.completed) {
    // SOPify green checkmark
    const checkX = width - margin.right - 15;
    const checkY = currentY + 8;
    
    pdf.setFillColor(39, 174, 96); // SOPify success green
    pdf.circle(checkX, checkY, 6, "F");
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text("✓", checkX - 2, checkY + 1);
  }
  
  return currentY + cardHeight + 8; // Return bottom Y position with spacing
}
