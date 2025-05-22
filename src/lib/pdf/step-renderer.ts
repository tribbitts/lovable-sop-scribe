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
  let firstImageHeight = 0; // Store height of the first image in a pair

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    stepCounterOnPage++;

    // For setting pdf.isNextImagePartOfPair in addScreenshot
    if (typeof pdf.isNextImagePartOfPair !== 'undefined') delete pdf.isNextImagePartOfPair;
    if (typeof pdf.currentImageHeight !== 'undefined') delete pdf.currentImageHeight;

    if (stepCounterOnPage === 1 && i + 1 < steps.length) {
        // Check if the next step will also be on this page
        // This assumes no steps are skipped and all have screenshots for simplicity here
        pdf.isNextImagePartOfPair = true; 
    }

    let yPositionForThisStep = currentY;
    if (stepCounterOnPage === 2 && firstImageHeight > 0) {
        // If this is the second image of a pair, its Y should be same as the first one's start Y
        // This requires currentY to not have advanced after the first image.
        // This logic is getting complex and might need a rethink on how Y is managed globally vs locally for pairs.
    }

    try {
      // Style the step header with improved design
      currentY = styleStep(pdf, step, i, currentY, margin, width);
      
      // Add spacing between step header and content
      currentY += 5;
      
      const screenshotYStart = currentY;

      // Add the screenshot
      if (step.screenshot) {
        const isFirstOrSecondPage = pageNumber <= 2;
        const result = await addScreenshot(
          pdf, 
          step, 
          screenshotYStart, // Pass Y before potential first image of pair
          margin, 
          contentWidth, 
          width, 
          height, 
          i,
          addPageDesignFn,
          isFirstOrSecondPage,
          stepCounterOnPage 
        );
        
        if (stepCounterOnPage === 1 && pdf.isNextImagePartOfPair) {
            firstImageHeight = result.y - screenshotYStart; // Calculate height of first image
            // currentY does not advance yet, it will be set by the taller of the two images
        } else if (stepCounterOnPage === 2) {
            const secondImageHeight = result.y - screenshotYStart;
            currentY = screenshotYStart + Math.max(firstImageHeight, secondImageHeight);
            firstImageHeight = 0; // Reset for next pair
        } else {
            // Single image on page, or last image
            currentY = result.y;
        }
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
        firstImageHeight = 0; // Reset
      } else if (i < steps.length - 1) {
        // If it was a single image on a page that can fit more, or first of a pair, prepare for next step on same page.
        if (stepCounterOnPage === 1 && !pdf.isNextImagePartOfPair) {
             // It was a single image, but not the last step overall, so add page if needed (e.g. if it was large)
             // This part of logic might need review based on how addScreenshot determined single vs pair placement for height
        } else if (stepCounterOnPage === 1 && pdf.isNextImagePartOfPair) {
            // It is the first of a pair, currentY has been managed. Add small horizontal space if needed by addScreenshot directly
        } else {
            currentY += 10; // Default spacing between items on same page if not a pair being formed
        }
      }
      
    } catch (error) {
      console.error(`Error rendering step ${i + 1}:`, error);
      // Continue with next step even if this one fails
      currentY += 20;
    }
  }
}
