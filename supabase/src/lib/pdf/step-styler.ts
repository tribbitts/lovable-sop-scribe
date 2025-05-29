
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

  let bottomY = currentY + cardHeight + 8;

  // Add healthcare-specific content styling
  if (step.healthcareContent && step.healthcareContent.length > 0) {
    bottomY = renderHealthcareContent(pdf, step.healthcareContent, bottomY, margin, width);
  }

  // Add individual healthcare fields for backward compatibility
  if (step.patientSafetyNote) {
    bottomY = renderHealthcareAlert(pdf, "Critical Patient Safety Note", step.patientSafetyNote, "critical-safety", bottomY, margin, width);
  }
  
  if (step.hipaaAlert) {
    bottomY = renderHealthcareAlert(pdf, "HIPAA Alert", step.hipaaAlert, "hipaa-alert", bottomY, margin, width);
  }
  
  if (step.communicationTip) {
    bottomY = renderHealthcareAlert(pdf, "Patient Communication Tip", step.communicationTip, "patient-communication", bottomY, margin, width);
  }
  
  return bottomY; // Return bottom Y position with spacing
}

function renderHealthcareContent(
  pdf: any,
  healthcareContent: any[],
  currentY: number,
  margin: any,
  width: number
): number {
  let y = currentY + 5; // Add some spacing

  healthcareContent.forEach((content) => {
    y = renderHealthcareAlert(pdf, getHealthcareTypeLabel(content.type), content.content, content.type, y, margin, width);
  });

  return y;
}

function renderHealthcareAlert(
  pdf: any,
  label: string,
  content: string,
  type: string,
  currentY: number,
  margin: any,
  width: number
): number {
  const alertHeight = 20;
  const alertY = currentY;
  
  // Get colors based on type
  const colors = getHealthcareColors(type);
  
  // Alert background
  pdf.setFillColor(colors.background.r, colors.background.g, colors.background.b, colors.background.a);
  pdf.roundedRect(margin.left, alertY, width - margin.left - margin.right, alertHeight, 4, 4, 'F');
  
  // Alert border
  pdf.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  pdf.setLineWidth(1.5);
  pdf.roundedRect(margin.left, alertY, width - margin.left - margin.right, alertHeight, 4, 4, 'S');
  
  // Alert icon and label
  try {
    pdf.setFont("helvetica", "bold");
  } catch (fontError) {
    pdf.setFont("helvetica", "bold");
  }
  
  pdf.setFontSize(10);
  pdf.setTextColor(colors.text.r, colors.text.g, colors.text.b);
  
  // Icon (simple character for now)
  const icon = getHealthcareIcon(type);
  pdf.text(icon, margin.left + 8, currentY + 8);
  
  // Label
  pdf.text(label, margin.left + 20, currentY + 8);
  
  // Content
  try {
    pdf.setFont("helvetica", "normal");
  } catch (fontError) {
    pdf.setFont("helvetica", "normal");
  }
  
  pdf.setFontSize(9);
  pdf.setTextColor(colors.content.r, colors.content.g, colors.content.b);
  
  // Truncate content if too long
  let displayContent = content;
  const maxContentLength = 90;
  if (content.length > maxContentLength) {
    displayContent = content.substring(0, maxContentLength - 3) + "...";
  }
  
  pdf.text(displayContent, margin.left + 8, currentY + 15);
  
  return currentY + alertHeight + 8;
}

function getHealthcareTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    "critical-safety": "Critical Patient Safety Note",
    "hipaa-alert": "HIPAA Alert",
    "patient-communication": "Patient Communication Tip",
    "standard": "Note"
  };
  return labels[type] || "Note";
}

function getHealthcareColors(type: string) {
  const colorMaps: Record<string, any> = {
    "critical-safety": {
      background: { r: 254, g: 242, b: 242, a: 0.8 }, // Light red
      border: { r: 220, g: 38, b: 38 }, // Red
      text: { r: 153, g: 27, b: 27 }, // Dark red
      content: { r: 69, g: 26, b: 26 } // Very dark red
    },
    "hipaa-alert": {
      background: { r: 239, g: 246, b: 255, a: 0.8 }, // Light blue
      border: { r: 37, g: 99, b: 235 }, // Blue
      text: { r: 29, g: 78, b: 216 }, // Dark blue
      content: { r: 30, g: 58, b: 138 } // Very dark blue
    },
    "patient-communication": {
      background: { r: 240, g: 253, b: 244, a: 0.8 }, // Light green
      border: { r: 22, g: 163, b: 74 }, // Green
      text: { r: 21, g: 128, b: 61 }, // Dark green
      content: { r: 20, g: 83, b: 45 } // Very dark green
    },
    "standard": {
      background: { r: 249, g: 250, b: 251, a: 0.8 }, // Light gray
      border: { r: 107, g: 114, b: 128 }, // Gray
      text: { r: 75, g: 85, b: 99 }, // Dark gray
      content: { r: 55, g: 65, b: 81 } // Very dark gray
    }
  };
  
  return colorMaps[type] || colorMaps["standard"];
}

function getHealthcareIcon(type: string): string {
  const icons: Record<string, string> = {
    "critical-safety": "⚠",
    "hipaa-alert": "🔒",
    "patient-communication": "💬",
    "standard": "ℹ"
  };
  return icons[type] || "ℹ";
}
