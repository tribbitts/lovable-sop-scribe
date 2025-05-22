
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

  // Process steps in pairs to place two per page when possible
  for (let i = 0; i < steps.length; i += 2) {
    // Process first step in the pair
    const step1 = steps[i];
    const hasSecondStep = i + 1 < steps.length;
    const step2 = hasSecondStep ? steps[i + 1] : null;

    try {
      // First step header
      currentY = styleStep(pdf, step1, i, currentY, margin, width);
      currentY += 3; // Small spacing after header
      
      // Add first screenshot
      if (step1.screenshot && step1.screenshot.dataUrl) {
        console.log(`[renderSteps] Step ${i+1}: Processing screenshot. Has dataUrl: ${!!step1.screenshot.dataUrl}`);
        
        const result = await addScreenshot(
          pdf, 
          step1, 
          currentY, 
          margin, 
          contentWidth, 
          width, 
          height, 
          i,
          addPageDesignFn,
          pageNumber <= 2,
          hasSecondStep ? 'firstOfPair' : 'single' // Mark as first of pair if we have a second step
        );
        
        console.log(`[renderSteps] Step ${i+1}: addScreenshot returned y = ${result.y}`);
        currentY = result.y; // Update Y position after screenshot
      } else {
        console.log(`[renderSteps] Step ${i+1}: No screenshot or no dataUrl.`);
        currentY += 5; // Minimal spacing if no screenshot
      }
      
      // If we have a second step in this pair, add it below the first one
      if (hasSecondStep) {
        // Add some spacing between steps on the same page
        currentY += 10;
        
        // Second step header
        currentY = styleStep(pdf, step2, i + 1, currentY, margin, width);
        currentY += 3; // Small spacing after header
        
        // Add second screenshot
        if (step2.screenshot && step2.screenshot.dataUrl) {
          console.log(`[renderSteps] Step ${i+2}: Processing screenshot. Has dataUrl: ${!!step2.screenshot.dataUrl}`);
          
          const result = await addScreenshot(
            pdf, 
            step2, 
            currentY, 
            margin, 
            contentWidth, 
            width, 
            height, 
            i + 1,
            addPageDesignFn,
            pageNumber <= 2,
            'secondOfPair' // Mark as second of pair
          );
          
          console.log(`[renderSteps] Step ${i+2}: addScreenshot returned y = ${result.y}`);
          currentY = result.y;
        } else {
          console.log(`[renderSteps] Step ${i+2}: No screenshot or no dataUrl.`);
          currentY += 5;
        }
      }
      
      // Start a new page for the next pair of steps
      if (i + 2 < steps.length) {
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
