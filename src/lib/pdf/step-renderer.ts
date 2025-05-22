
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
    try {
      // Style the step header with improved design
      currentY = styleStep(pdf, step, i, currentY, margin, width);
      
      // Add spacing between step header and content
      currentY += 5;
      
      // Add the screenshot with the improved layout (one per page)
      if (step.screenshot) {
        // isFirstOrSecondPage helps with sizing images differently on first pages
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
          isFirstOrSecondPage
        );
      } else {
        // Add spacing if no screenshot
        currentY += 10;
      }
      
      // Always add a new page for the next step
      if (i < steps.length - 1) {
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
