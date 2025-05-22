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

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    stepCounterOnPage++;
    let imageLayoutMode: 'single' | 'firstOfPair' | 'secondOfPair' = 'single';

    const hasNextStep = i + 1 < steps.length;
    const nextStepHasScreenshot = hasNextStep && steps[i+1]?.screenshot?.dataUrl;

    if (stepCounterOnPage === 1 && steps[i]?.screenshot?.dataUrl && nextStepHasScreenshot) {
      imageLayoutMode = 'firstOfPair';
    } else if (stepCounterOnPage === 2 && steps[i]?.screenshot?.dataUrl && firstImageHeightInfo.yStart > 0) {
      imageLayoutMode = 'secondOfPair';
    } else {
      imageLayoutMode = 'single';
    }

    let headerActualStartY = currentY;

    let styledHeaderBottomY = styleStep(pdf, step, i, headerActualStartY, margin, width);
    const screenshotContentStartY = styledHeaderBottomY + 5;

    if (step.screenshot && step.screenshot.dataUrl) {
      let yPosForAddScreenshot = screenshotContentStartY;
      if (imageLayoutMode === 'secondOfPair') {
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
      
      const imageActualHeight = result.y - yPosForAddScreenshot;

      if (imageLayoutMode === 'firstOfPair') {
          firstImageHeightInfo = { height: imageActualHeight, yStart: yPosForAddScreenshot };
          currentY = styledHeaderBottomY; 
      } else if (imageLayoutMode === 'secondOfPair') {
          const firstImageBlockEndY = firstImageHeightInfo.yStart + firstImageHeightInfo.height;
          const secondImageBlockEndY = yPosForAddScreenshot + imageActualHeight;
          currentY = Math.max(styledHeaderBottomY, firstImageBlockEndY, secondImageBlockEndY);
          firstImageHeightInfo = { height: 0, yStart: 0 }; 
      } else { // Single image
          currentY = result.y; 
          firstImageHeightInfo = { height: 0, yStart: 0 }; // Reset if it was a single image
      }
    } else { // No screenshot for this step
      currentY = styledHeaderBottomY + 10; 
      // If this step was expected to be part of a pair but has no screenshot,
      // or it's a single step, reset firstImageHeightInfo.
      // The imageLayoutMode is determined *before* this 'else' block.
      // If it was 'firstOfPair' but no screenshot, it won't behave as 'firstOfPair' for image placement.
      // If it was 'secondOfPair' but no screenshot, then mode detection logic is flawed (as it checks for screenshot).
      // Thus, we primarily care about resetting if a pair was *initiated by a previous step*.
      if (imageLayoutMode !== 'firstOfPair') { // if not starting a new pair (which it can't without a screenshot)
        firstImageHeightInfo = { height: 0, yStart: 0 };
      }
      // If imageLayoutMode was 'firstOfPair' BUT we are in this else block (no screenshot),
      // then firstImageHeightInfo would not have been set in the 'if' block above.
      // It retains its value from previous iteration (or initial state).
      // The crucial reset for a *completed* or *broken* pair happens correctly
      // in 'secondOfPair' or 'single' (in the if block), or here if no screenshot.
    }
      
    const isLastStep = i === steps.length - 1;
    if (!isLastStep) {
      if (imageLayoutMode === 'secondOfPair' || imageLayoutMode === 'single') {
        pdf.addPage();
        pageNumber++;
        stepCounterOnPage = 0; 
        currentY = margin.top;
        firstImageHeightInfo = { height: 0, yStart: 0 };
        if (addPageDesignFn) {
          addPageDesignFn(pdf, width, height, margin, backgroundImage);
        }
      } 
    }
  }
}
