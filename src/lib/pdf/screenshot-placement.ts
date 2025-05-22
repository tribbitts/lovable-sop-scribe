import { SopStep } from "@/types/sop";
import { prepareScreenshotImage, createImageWithStyling } from "./image-processor";

/**
 * Adds screenshots with callouts to the PDF
 * Handles two images per page with consistent sizing
 */
export async function addScreenshot(
  pdf: any, 
  step: SopStep, 
  currentY: number, 
  margin: any, 
  contentWidth: number, 
  width: number, 
  height: number, 
  stepIndex: number,
  addContentPageDesign: Function,
  isFirstOrSecondPage: boolean = false,
  imageLayoutMode: 'single' | 'firstOfPair' | 'secondOfPair' = 'single' 
): Promise<{y: number, imageId: string | null}> { 
  let imageId = null; 
  // console.log(`[addScreenshot] Called for step ${stepIndex + 1} with mode: ${imageLayoutMode}, currentY: ${currentY}`); // Keep console logs minimal for now
  try {
    // Skip if no screenshot data
    if (!step.screenshot || !step.screenshot.dataUrl) {
      // console.log(`[addScreenshot] Step ${stepIndex + 1}: No screenshot data or dataUrl. Skipping.`);
      return { y: currentY, imageId };
    }
    
    // Validate image data before processing
    if (!step.screenshot.dataUrl.startsWith('data:')) {
      // console.error(`[addScreenshot] Step ${stepIndex + 1}: Invalid screenshot dataUrl format.`);
      return { y: currentY + 10, imageId };
    }
    
    // console.log(`[addScreenshot] Processing screenshot for step ${stepIndex + 1}`);
    
    // Handle main screenshot with additional error handling
    try {
      const mainImage = await prepareScreenshotImage(step.screenshot.dataUrl, 0.95);
      const maxImageWidth = contentWidth * (imageLayoutMode === 'single' ? 0.70 : 0.80);
      const { imageData: mainImageData, aspectRatio: mainAspectRatio } = 
        await createImageWithStyling(mainImage, step.screenshot.callouts);
      
      if (!mainImageData) {
        throw new Error(`Failed to process main image for step ${stepIndex + 1}`);
      }
      
      let imgWidth = maxImageWidth;
      let imgHeight = imgWidth / mainAspectRatio;
      if (imgHeight === Infinity || imgHeight === 0) { // Prevent division by zero or infinite height
          imgHeight = imgWidth; // Default to square if aspect ratio is bad
      }
      
      let maxAvailableHeight;
      if (imageLayoutMode === 'single') {
        maxAvailableHeight = height - currentY - margin.bottom - 20; 
      } else if (imageLayoutMode === 'firstOfPair') {
        maxAvailableHeight = (height - margin.top - margin.bottom - 40) / 2; 
      } else { 
        maxAvailableHeight = height - currentY - margin.bottom - 15; 
      }

      if (imgHeight > maxAvailableHeight) {
        imgHeight = maxAvailableHeight;
        imgWidth = imgHeight * mainAspectRatio;
        if (imgWidth === Infinity || imgWidth === 0) imgWidth = imgHeight; // Re-check after scaling height
      }
      
      const imageX = margin.left + (contentWidth - imgWidth) / 2;
      
      try {
        pdf.addImage(
          mainImageData, 
          'JPEG', 
          imageX, 
          currentY, 
          imgWidth, 
          imgHeight
        );

        imageId = `step_${stepIndex}_main`;
        const yPadding = imageLayoutMode === 'firstOfPair' ? 8 : 15;
        currentY += imgHeight + yPadding;
      } catch (imageError) {
        console.error(`[addScreenshot] Step ${stepIndex + 1}: Error adding main image to PDF:`, imageError);
        return { y: currentY + 10, imageId: null };
      }
      
      if (step.screenshot.secondaryDataUrl && step.screenshot.secondaryDataUrl.startsWith('data:')) {
        try {
          pdf.addPage();
          addContentPageDesign(pdf, width, height, margin, null);
          let secondaryCurrentY = margin.top; 
          
          const secondaryImage = await prepareScreenshotImage(step.screenshot.secondaryDataUrl, 0.95);
          const { imageData: secondaryImageData, aspectRatio: secondaryAspectRatio } = 
            await createImageWithStyling(secondaryImage, step.screenshot.secondaryCallouts || []);
          
          if (!secondaryImageData) {
            throw new Error(`Failed to process secondary image for step ${stepIndex + 1}`);
          }
          
          let secondaryImgWidth = maxImageWidth; 
          let secondaryImgHeight = secondaryImgWidth / secondaryAspectRatio;
          if (secondaryImgHeight === Infinity || secondaryImgHeight === 0) {
              secondaryImgHeight = secondaryImgWidth; // Default to square
          }
          
          const secondaryMaxAvailableHeight = height - secondaryCurrentY - margin.bottom - 20;
          if (secondaryImgHeight > secondaryMaxAvailableHeight) {
            secondaryImgHeight = secondaryMaxAvailableHeight;
            secondaryImgWidth = secondaryImgHeight * secondaryAspectRatio;
            if (secondaryImgWidth === Infinity || secondaryImgWidth === 0) secondaryImgWidth = secondaryImgHeight;
          }
          
          const secondaryImageX = (width - secondaryImgWidth) / 2;
          
          pdf.addImage(
            secondaryImageData, 
            'JPEG', 
            secondaryImageX, 
            secondaryCurrentY, 
            secondaryImgWidth, 
            secondaryImgHeight
          );

          secondaryCurrentY += secondaryImgHeight + 15;
        } catch (secondaryImgError) {
          console.error(`[addScreenshot] Step ${stepIndex + 1}: Error processing secondary image:`, secondaryImgError);
        }
      }
    } catch (mainImgError) {
      console.error(`[addScreenshot] Step ${stepIndex + 1}: Error processing main image:`, mainImgError);
      return { y: currentY + 10, imageId: null };
    }
  } catch (e) {
    console.error(`[addScreenshot] Step ${stepIndex + 1}: General error in addScreenshot:`, e);
    return { y: currentY + 5, imageId: null }; 
  }
  
  // console.log(`[addScreenshot] Step ${stepIndex + 1}: Returning y = ${currentY}`);
  return { y: currentY, imageId };
}

// Ensure addScreenshotDebug is NOT present or is commented out if it was for previous debugging
/*
export async function addScreenshotDebug(
  pdf: any, 
  step: SopStep, 
  currentY: number, 
  margin: any, 
  contentWidth: number, 
  width: number, 
  height: number, 
  stepIndex: number,
  addContentPageDesign: Function,
  isFirstOrSecondPage: boolean = false,
  imageLayoutMode: 'single' | 'firstOfPair' | 'secondOfPair' = 'single' 
): Promise<{y: number, imageId: string | null}> { 
  // ... debug code ...
}
*/
