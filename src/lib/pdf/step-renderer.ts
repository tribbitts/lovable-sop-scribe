
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
      
      // Calculate space needed for screenshot
      const screenshotEstimatedHeight = 
        step.screenshot ? (step.screenshot.secondaryDataUrl ? 200 : 120) : 10;
      
      // Check if we need a new page based on remaining space
      const remainingSpace = height - currentY - margin.bottom;
      if (remainingSpace < (screenshotEstimatedHeight + 10)) {
        pdf.addPage();
        pageNumber++;
        if (addPageDesignFn) {
          addPageDesignFn(pdf, width, height, margin, backgroundImage);
        }
        currentY = margin.top;
      }
      
      // Add the screenshot with the improved layout
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
      
      // Add spacing between steps
      currentY += 15;
      
    } catch (error) {
      console.error(`Error rendering step ${i + 1}:`, error);
      // Continue with next step even if this one fails
      currentY += 20;
    }
  }
}
