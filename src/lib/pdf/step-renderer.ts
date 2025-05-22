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
  let firstImageHeightInfo = { height: 0, yStart: 0 }; // Store height and yStart of the first image in a pair
  let imageLayoutMode: 'single' | 'firstOfPair' | 'secondOfPair' = 'single'; // Declare here

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
    if (stepCounterOnPage === 2 && firstImageHeightInfo.height > 0) {
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
      if (step.screenshot && step.screenshot.dataUrl) {
        const hasNextStep = i + 1 < steps.length;
        const nextStepHasScreenshot = hasNextStep && steps[i+1]?.screenshot?.dataUrl;

        if (stepCounterOnPage === 1 && nextStepHasScreenshot) {
          imageLayoutMode = 'firstOfPair';
        } else if (stepCounterOnPage === 2) {
          imageLayoutMode = 'secondOfPair';
        } // Default is 'single' as initialized
        
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
          imageLayoutMode 
        );
        
        const imageHeightWithPadding = result.y - screenshotYStart; // This is actual height + 15 padding

        if (imageLayoutMode === 'firstOfPair') {
            firstImageHeightInfo = { height: imageHeightWithPadding, yStart: screenshotYStart };
            // currentY does not advance yet. It will be aligned with the second image.
        } else if (imageLayoutMode === 'secondOfPair') {
            currentY = firstImageHeightInfo.yStart + Math.max(firstImageHeightInfo.height, imageHeightWithPadding);
            firstImageHeightInfo = { height: 0, yStart: 0 }; // Reset for next pair
        } else { // Single image
            currentY = result.y; // Advances by image height + padding
        }
      } else {
        // Add spacing if no screenshot
        currentY += 10;
      }
      
      // Page breaking logic
      const isLastStep = i === steps.length - 1;
      if (!isLastStep) {
        if (stepCounterOnPage === 2 || 
           (stepCounterOnPage === 1 && (!steps[i+1]?.screenshot?.dataUrl || imageLayoutMode === 'single'))) {
          // Add page if: two steps are done, OR 
          // if one step is done AND it's a single image on this page (either no next screenshot or explicit single mode)
          pdf.addPage();
          pageNumber++;
          stepCounterOnPage = 0; 
          if (addPageDesignFn) {
            addPageDesignFn(pdf, width, height, margin, backgroundImage);
          }
          currentY = margin.top;
          firstImageHeightInfo = { height: 0, yStart: 0 }; // Reset
        } else if (stepCounterOnPage === 1) {
          // It was the first of a pair, so we are expecting another step on this page.
          // currentY has been set (or not advanced) by the firstOfPair logic.
          // We need to ensure currentY for the *next step's header* is correct.
          // The first image's Y was screenshotYStart. The header for the next step should start at screenshotYStart.
          currentY = screenshotYStart; // Reset Y for the next step's header to align with the first image of the pair
        }
      }
      
    } catch (error) {
      console.error(`Error rendering step ${i + 1}:`, error);
      // Continue with next step even if this one fails
      currentY += 20;
    }
  }
}
