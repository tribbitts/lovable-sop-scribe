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
  let stepCounterOnPage = 0; // Track steps on the current page

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    stepCounterOnPage++;
    try {
      // Style the step header with improved design
      currentY = styleStep(pdf, step, i, currentY, margin, width);
      
      // Add spacing between step header and content
      currentY += 5;
      
      // Add the screenshot
      if (step.screenshot) {
        const isFirstOrSecondPage = pageNumber <= 2;
        currentY = await addScreenshot(
          pdf, 
          step, 
          currentY, 
          margin, 
          contentWidth, 
          width, 
          height, 
          i,
          addPageDesignFn,
          isFirstOrSecondPage,
          stepCounterOnPage // Pass step position on page
        );
      } else {
        // Add spacing if no screenshot
        currentY += 10;
      }
      
      // Add a new page after every two steps or if it's the last step and it's the first on a new page
      if (stepCounterOnPage === 2 && i < steps.length - 1) {
        pdf.addPage();
        pageNumber++;
        stepCounterOnPage = 0; // Reset step counter for the new page
        if (addPageDesignFn) {
          addPageDesignFn(pdf, width, height, margin, backgroundImage);
        }
        currentY = margin.top;
      } else if (i < steps.length - 1 && stepCounterOnPage === 1 && i === steps.length -1) {
        // This case should ideally not be hit if logic is correct but as a safeguard
        currentY = margin.top;
      } else if (i < steps.length - 1) {
        // Add some space between steps on the same page
        currentY += 10; 
      }
      
    } catch (error) {
      console.error(`Error rendering step ${i + 1}:`, error);
      // Continue with next step even if this one fails
      currentY += 20;
    }
  }
}
