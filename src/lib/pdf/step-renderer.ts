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
  let stepCounterOnPage = 0;
  let firstImageHeightInfo = { height: 0, yStart: 0 };
  let yForNextAlignedHeader = 0; // Store Y for aligning headers of a pair

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    stepCounterOnPage++;
    let imageLayoutMode: 'single' | 'firstOfPair' | 'secondOfPair' = 'single';

    const hasNextStep = i + 1 < steps.length;
    const nextStepHasScreenshot = hasNextStep && steps[i+1]?.screenshot?.dataUrl;
    if (stepCounterOnPage === 1 && nextStepHasScreenshot && steps[i]?.screenshot?.dataUrl) { // Current and next have screenshot
      imageLayoutMode = 'firstOfPair';
    } else if (stepCounterOnPage === 2 && steps[i]?.screenshot?.dataUrl) { // Current is second of a pair with screenshot
      imageLayoutMode = 'secondOfPair';
    } // Default is 'single'

    let headerActualStartY = currentY;
    if (imageLayoutMode === 'secondOfPair') {
      headerActualStartY = yForNextAlignedHeader; // Align this header with the first of the pair
    }
    if (imageLayoutMode === 'firstOfPair') {
      yForNextAlignedHeader = headerActualStartY; // Save for the next step in the pair
    }

    let styledHeaderBottomY = styleStep(pdf, step, i, headerActualStartY, margin, width);
    const screenshotContentStartY = styledHeaderBottomY + 5; // Y where screenshot content (image) begins

    if (step.screenshot && step.screenshot.dataUrl) {
      let yPosForAddScreenshot = screenshotContentStartY;
      if (imageLayoutMode === 'secondOfPair') {
        // Ensure second image aligns with where the first image started its content drawing
        yPosForAddScreenshot = firstImageHeightInfo.yStart;
      }
      
      const isFirstOrSecondPage = pageNumber <= 2;
      const result = await addScreenshot(
        pdf, 
        step, 
        yPosForAddScreenshot, 
        margin, 
        contentWidth, 
        width, 
        height, 
        i,
        addPageDesignFn,
        isFirstOrSecondPage,
        imageLayoutMode 
      );
      
      const imageActualHeight = result.y - yPosForAddScreenshot; // This includes addScreenshot's internal bottom padding

      if (imageLayoutMode === 'firstOfPair') {
          firstImageHeightInfo = { height: imageActualHeight, yStart: yPosForAddScreenshot };
          // For the first image of a pair, currentY for page flow doesn't advance yet.
          // It will be determined by the max height of the pair.
          // currentY for the *next iteration* (second step of pair) is handled by headerActualStartY logic.
      } else if (imageLayoutMode === 'secondOfPair') {
          // Finished a pair. Advance currentY by the maximum extent of the pair.
          // Max extent is from the aligned header start, to the bottom of the taller image block.
          const firstImageBlockEndY = firstImageHeightInfo.yStart + firstImageHeightInfo.height;
          const secondImageBlockEndY = yPosForAddScreenshot + imageActualHeight;
          currentY = Math.max(firstImageBlockEndY, secondImageBlockEndY);
          firstImageHeightInfo = { height: 0, yStart: 0 };
      } else { // Single image
          currentY = result.y; 
      }
    } else { // No screenshot for this step
      currentY = styledHeaderBottomY + 10; // Advance currentY past header + some padding
    }
      
    // Page breaking logic
    const isLastStep = i === steps.length - 1;
    if (!isLastStep) {
      // If we just processed the second item of a pair, or a single item, then break page.
      if (imageLayoutMode === 'secondOfPair' || imageLayoutMode === 'single') {
        pdf.addPage();
        pageNumber++;
        stepCounterOnPage = 0; 
        yForNextAlignedHeader = 0; // Reset
        if (addPageDesignFn) {
          addPageDesignFn(pdf, width, height, margin, backgroundImage);
        }
        currentY = margin.top;
      } 
      // If it was 'firstOfPair', loop continues, stepCounterOnPage becomes 2, 
      // and headerActualStartY for the next step will use yForNextAlignedHeader.
    }
  }
}
