import { SopStep } from "@/types/sop";
import { styleStep } from "./step-styler";
import { addScreenshot } from "./screenshot-placement";

export async function renderSteps(
  pdf: any,
  steps: SopStep[],
  width: number,
  height: number,
  margin: any,
  contentWidth: number,
  addPageDesignFn: (pdf: any, width: number, height: number, margin: any, backgroundImage: string | null) => void,
  backgroundImage: string | null = null
) {
  let currentY = margin.top;
  let pageNumber = 1;
  let stepsOnCurrentPage = 0;
  
  // Calculate available space for two step+screenshot pairs per page
  const availableHeight = height - margin.top - margin.bottom;
  const spacePerStepPair = availableHeight / 2;
  const maxImageHeight = spacePerStepPair * 0.7; // 70% of space for image, 30% for step header

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    
    // Check if we need a new page (after every 2 steps)
    if (stepsOnCurrentPage >= 2) {
      pdf.addPage();
      pageNumber++;
      stepsOnCurrentPage = 0;
      currentY = margin.top;
      if (addPageDesignFn) {
        addPageDesignFn(pdf, width, height, margin, backgroundImage);
      }
    }

    // Style the step header
    const styledHeaderBottomY = styleStep(pdf, step, i, currentY, margin, width);
    let nextY = styledHeaderBottomY + 5;

    // Add screenshot if it exists
    if (step.screenshot && step.screenshot.dataUrl) {
      const result = await addScreenshot(
        pdf, 
        step, 
        nextY, 
        margin, 
        contentWidth, 
        width, 
        height, 
        i,
        addPageDesignFn,
        pageNumber <= 2,
        'vertical', // Use new vertical mode
        maxImageHeight
      );
      nextY = result.y;
    }

    stepsOnCurrentPage++;
    
    // Calculate position for next step
    if (stepsOnCurrentPage === 1) {
      // First step on page - position second step in lower half
      currentY = margin.top + spacePerStepPair;
    } else {
      // Second step on page - will trigger new page on next iteration
      currentY = nextY;
    }
  }
}
