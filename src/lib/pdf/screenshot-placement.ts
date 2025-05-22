import { SopStep } from "@/types/sop";
import { prepareScreenshotImage, createImageWithStyling } from "./image-processor";

/**
 * Adds screenshots with callouts to the PDF
 * Handles vertical layout with proper sizing for two per page
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
  imageLayoutMode: 'single' | 'firstOfPair' | 'secondOfPair' | 'vertical' = 'single',
  maxImageHeight?: number
): Promise<{y: number, imageId: string | null}> { 
  let imageId = null; 
  
  try {
    // Skip if no screenshot data
    if (!step.screenshot || !step.screenshot.dataUrl) {
      return { y: currentY, imageId };
    }
    
    // Validate image data before processing
    if (!step.screenshot.dataUrl.startsWith('data:')) {
      return { y: currentY + 10, imageId };
    }
    
    // Handle main screenshot with additional error handling
    try {
      const mainImage = await prepareScreenshotImage(step.screenshot.dataUrl, 0.95);
      
      // For vertical layout, use full content width and respect maxImageHeight
      let maxImageWidth;
      if (imageLayoutMode === 'vertical') {
        maxImageWidth = contentWidth * 0.90; // Increased from 85% to 90% for larger images
      } else if (imageLayoutMode === 'firstOfPair' || imageLayoutMode === 'secondOfPair') {
        const pairPadding = 5;
        maxImageWidth = (contentWidth - pairPadding) / 2;
      } else { // single
        maxImageWidth = contentWidth * 0.80;
      }

      const { imageData: mainImageData, aspectRatio: mainAspectRatio } = 
        await createImageWithStyling(mainImage, step.screenshot.callouts);
      
      if (!mainImageData) {
        throw new Error(`Failed to process main image for step ${stepIndex + 1}`);
      }
      
      // Calculate image dimensions
      let imgWidth = maxImageWidth;
      let imgHeight = imgWidth / mainAspectRatio;
      
      if (imgHeight === Infinity || imgHeight === 0) {
        imgHeight = imgWidth; // Default to square if aspect ratio is bad
      }
      
      // Apply height constraints
      let maxAvailableHeight;
      if (imageLayoutMode === 'vertical' && maxImageHeight) {
        maxAvailableHeight = maxImageHeight;
      } else if (imageLayoutMode === 'single') {
        maxAvailableHeight = height - currentY - margin.bottom - 20; 
      } else if (imageLayoutMode === 'firstOfPair') {
        maxAvailableHeight = height - currentY - margin.bottom - 15;
      } else { // secondOfPair
        maxAvailableHeight = height - currentY - margin.bottom - 15; 
      }

      if (imgHeight > maxAvailableHeight) {
        imgHeight = maxAvailableHeight;
        imgWidth = imgHeight * mainAspectRatio;
        if (imgWidth === Infinity || imgWidth === 0) imgWidth = imgHeight;
      }
      
      // Calculate X position
      let imageX;
      if (imageLayoutMode === 'firstOfPair') {
        imageX = margin.left;
      } else if (imageLayoutMode === 'secondOfPair') {
        const pairPadding = 5;
        imageX = margin.left + (contentWidth + pairPadding) / 2;
      } else { // single or vertical - center the image
        imageX = margin.left + (contentWidth - imgWidth) / 2;
      }
      
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
        
        // Add appropriate padding after image
        const yPadding = imageLayoutMode === 'vertical' ? 5 : // Reduced from 10 to 5
                        imageLayoutMode === 'firstOfPair' ? 8 : 15;
        currentY += imgHeight + yPadding;
        
      } catch (imageError) {
        console.error(`[addScreenshot] Step ${stepIndex + 1}: Error adding main image to PDF:`, imageError);
        return { y: currentY + 10, imageId: null };
      }
      
      // Handle secondary images (if any)
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
          
          let secondaryImgWidth = contentWidth * 0.80;
          let secondaryImgHeight = secondaryImgWidth / secondaryAspectRatio;
          
          if (secondaryImgHeight === Infinity || secondaryImgHeight === 0) {
            secondaryImgHeight = secondaryImgWidth;
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
  
  return { y: currentY, imageId };
}
