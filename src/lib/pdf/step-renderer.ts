
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
  let pageNumber = 1; // Track which page we're on

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const isLastStep = i === steps.length - 1;

    try {
      // Style the step header with simplified design - just colored text
      currentY = styleStep(pdf, step, i, currentY, margin, width);
      
      // Add minimal spacing between step header and content
      currentY += 3;
      
      const screenshotYStart = currentY;

      // Add the screenshot - always in 'single' mode now
      if (step.screenshot && step.screenshot.dataUrl) {
        console.log(`[renderSteps] Step ${i+1}: Processing screenshot. Has dataUrl: ${!!step.screenshot.dataUrl}`);
        
        const isFirstOrSecondPage = pageNumber <= 2;
        const result = await addScreenshot(
          pdf, 
          step, 
          screenshotYStart, 
          margin, 
          contentWidth, 
          width, 
          height, 
          i,
          addPageDesignFn,
          isFirstOrSecondPage,
          'single' // Always use single mode
        );
        
        console.log(`[renderSteps] Step ${i+1}: addScreenshot returned y = ${result.y}`);
        currentY = result.y; // Update Y position after screenshot
      } else {
        console.log(`[renderSteps] Step ${i+1}: No screenshot or no dataUrl.`);
        currentY += 5; // Minimal spacing if no screenshot
      }
      
      // Always start a new page for the next step (unless this is the last step)
      if (!isLastStep) {
        pdf.addPage();
        pageNumber++;
        if (addPageDesignFn) {
          addPageDesignFn(pdf, width, height, margin, backgroundImage);
        }
        currentY = margin.top;
      }
      
    } catch (error) {
      console.error(`Error rendering step ${i + 1}:`, error);
      // Continue with next step even if this one fails
      currentY += 20;
    }
  }
}
