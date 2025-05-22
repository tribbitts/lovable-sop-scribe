import { SopStep } from "@/types/sop";

export async function renderSteps(
  pdf: any,
  steps: SopStep[],
  width: number,
  height: number,
  margin: any,
  contentWidth: number,
  addPageDesignFn: (pdf: any, width: number, height: number, margin: any) => void
) {
  let currentY = margin.top;
  const lineHeight = 7;
  const horizontalPadding = 5;
  const screenshotWidth = contentWidth;
  const screenshotHeight = 80; // Fixed height for screenshots

  for (const step of steps) {
    try {
      // Calculate the height required for the step description
      const textLines = pdf.splitTextToSize(step.description, contentWidth - 2 * horizontalPadding);
      const textHeight = textLines.length * lineHeight;
      const stepHeight = textHeight + screenshotHeight + 20; // 20 for spacing

      // Calculate remaining space on the current page
      const remainingY = height - currentY - margin.bottom;
      
      // If we need a new page, add it and apply the page design
      if (remainingY < stepHeight) {
        pdf.addPage();
        if (addPageDesignFn) {
          addPageDesignFn(pdf, width, height, margin);
        }
        currentY = margin.top;
      }
      
      // Step Description
      pdf.setFontSize(10);
      pdf.setFillColor(0);
      pdf.setTextColor(50);
      pdf.rect(margin.left, currentY, contentWidth, textHeight + 10, 'F');
      pdf.setTextColor(255);
      pdf.setFont('helvetica', 'normal');
      pdf.text(textLines, margin.left + horizontalPadding, currentY + 5 + lineHeight, {
        maxWidth: contentWidth - 2 * horizontalPadding,
        lineHeightFactor: 1
      });

      currentY += textHeight + 10;

      // Screenshot rendering
      if (step.screenshot && step.screenshot.dataUrl) {
        try {
          pdf.addImage(
            step.screenshot.dataUrl,
            'JPEG',
            margin.left,
            currentY,
            screenshotWidth,
            screenshotHeight
          );
        } catch (imageError) {
          console.error("Error adding image:", imageError);
          pdf.text(`Error rendering screenshot for step ${step.id}`, margin.left, currentY + 10);
        }
        currentY += screenshotHeight + 10;
      } else {
        pdf.setFontSize(9);
        pdf.setTextColor(100);
        pdf.text(`No screenshot for step ${step.id}`, margin.left, currentY + 10);
        currentY += 20;
      }

    } catch (error) {
      console.error(`Error rendering step ${step.id}:`, error);
      // Continue to next step even if this one fails
    }
  }
}
