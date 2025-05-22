import { SopStep } from "@/types/sop";
import { prepareScreenshotImage, createImageWithStyling } from "./image-processor";

/**
 * Adds screenshots with callouts to the PDF
 * Handles one image per page with consistent sizing
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
  stepCounterOnPage: number // 1 for first image on page, 2 for second
): Promise<{y: number, imageId: string | null}> { // Return Y and an ID for the image
  let imageId = null; // Store a unique ID for the image if needed for positioning next one
  try {
    // Skip if no screenshot data
    if (!step.screenshot || !step.screenshot.dataUrl) {
      console.log(`No screenshot for step ${stepIndex + 1}, skipping`);
      return { y: currentY, imageId };
    }
    
    // Validate image data before processing
    if (!step.screenshot.dataUrl.startsWith('data:')) {
      console.error(`Invalid screenshot data for step ${stepIndex + 1}`);
      return { y: currentY + 10, imageId };
    }
    
    console.log(`Processing screenshot for step ${stepIndex + 1}`);
    
    // Handle main screenshot with additional error handling
    try {
      // Preprocess the image with higher quality setting
      const mainImage = await prepareScreenshotImage(step.screenshot.dataUrl, 0.95);
      
      // Adjust image width based on number of screenshots on the page
      const paddingBetweenImages = 5; // 5mm padding
      let effectiveContentWidth = contentWidth;
      let maxImageWidth;

      if (stepCounterOnPage === 1 && pdf.isNextImagePartOfPair) { // Hypothetical flag set by renderSteps
        maxImageWidth = (effectiveContentWidth - paddingBetweenImages) / 2;
      } else if (stepCounterOnPage === 2) {
        maxImageWidth = (effectiveContentWidth - paddingBetweenImages) / 2;
      } else { // Single image on the page
        maxImageWidth = effectiveContentWidth * 0.8; 
      }
      
      console.log(`Creating main image with styling for step ${stepIndex + 1}`);
      // Create first image with improved quality and shadow effect
      const { imageData: mainImageData, aspectRatio: mainAspectRatio } = 
        await createImageWithStyling(mainImage, step.screenshot.callouts);
      
      if (!mainImageData) {
        throw new Error(`Failed to process main image for step ${stepIndex + 1}`);
      }
      
      // Calculate dimensions while preserving aspect ratio and limiting width
      let imgWidth = maxImageWidth;
      let imgHeight = imgWidth / mainAspectRatio;
      
      // Check if the image is too tall for the page
      const maxAvailableHeight = height - currentY - margin.bottom - 20; // 20px buffer
      if (imgHeight > maxAvailableHeight) {
        // Scale down to fit available height
        imgHeight = maxAvailableHeight;
        imgWidth = imgHeight * mainAspectRatio;
      }
      
      // Calculate X position
      let imageX;
      if (stepCounterOnPage === 1 && pdf.isNextImagePartOfPair) { // First of a pair
        imageX = margin.left;
        pdf.currentImageHeight = imgHeight; // Store height for the next image
      } else if (stepCounterOnPage === 2) { // Second of a pair
        imageX = margin.left + (effectiveContentWidth + paddingBetweenImages) / 2;
        // Ensure Y aligns with the first image of the pair, if heights differ significantly this might need adjustment
        // currentY might need to be passed as the Y of the first image of the pair.
      } else { // Single image, centered
        imageX = (width - imgWidth) / 2;
      }
      
      // Add the main image to PDF with error handling
      try {
        console.log(`Adding main image to PDF for step ${stepIndex + 1} at position (${imageX}, ${currentY})`);
        pdf.addImage(
          mainImageData, 
          'JPEG', 
          imageX, 
          currentY, 
          imgWidth, 
          imgHeight
        );
        imageId = `step_${stepIndex}_main`;
        
        // Move Y position below the first image
        // If it's the first of a pair, Y should not advance yet, renderSteps will handle it.
        if (!(stepCounterOnPage === 1 && pdf.isNextImagePartOfPair)) {
            currentY += imgHeight + 15;
        }
      } catch (imageError) {
        console.error(`Error adding main image to PDF for step ${stepIndex + 1}:`, imageError);
        return { y: currentY + 10, imageId: null };
      }
      
      // If there's a secondary image, add it on a new page
      // For now, secondary images will still get their own new page to simplify layout.
      // This part needs to be refactored if secondary images should also be on the same page.
      if (step.screenshot.secondaryDataUrl && step.screenshot.secondaryDataUrl.startsWith('data:')) {
        try {
          console.log(`Processing secondary image for step ${stepIndex + 1}`);
          // Always add a new page for the secondary image
          pdf.addPage();
          addContentPageDesign(pdf, width, height, margin, null);
          let secondaryCurrentY = margin.top; // Reset Y for new page
          
          // Use higher quality for secondary image too
          const secondaryImage = await prepareScreenshotImage(step.screenshot.secondaryDataUrl, 0.95);
          
          const { imageData: secondaryImageData, aspectRatio: secondaryAspectRatio } = 
            await createImageWithStyling(secondaryImage, step.screenshot.secondaryCallouts || []);
          
          if (!secondaryImageData) {
            throw new Error(`Failed to process secondary image for step ${stepIndex + 1}`);
          }
          
          // Calculate dimensions for secondary image
          let secondaryImgWidth = maxImageWidth;
          let secondaryImgHeight = secondaryImgWidth / secondaryAspectRatio;
          
          // Check if the image is too tall for the page
          if (secondaryImgHeight > maxAvailableHeight) {
            // Scale down to fit available height
            secondaryImgHeight = maxAvailableHeight;
            secondaryImgWidth = secondaryImgHeight * secondaryAspectRatio;
          }
          
          // Center the image horizontally
          const secondaryImageX = (width - secondaryImgWidth) / 2;
          
          // Add the secondary image to PDF
          console.log(`Adding secondary image to PDF for step ${stepIndex + 1}`);
          pdf.addImage(
            secondaryImageData, 
            'JPEG', 
            secondaryImageX, 
            secondaryCurrentY, // Use reset Y for new page
            secondaryImgWidth, 
            secondaryImgHeight
          );
          
          // Move Y position below the secondary image
          secondaryCurrentY += secondaryImgHeight + 15;
        } catch (secondaryImgError) {
          console.error(`Error processing secondary image for step ${stepIndex + 1}:`, secondaryImgError);
          // Continue with next step even if secondary image fails
        }
      }
      
    } catch (mainImgError) {
      console.error(`Error processing main image for step ${stepIndex + 1}:`, mainImgError);
      return { y: currentY + 10, imageId: null };
    }
  } catch (e) {
    console.error(`Error in screenshot handling for step ${stepIndex + 1}:`, e);
    currentY += 5;
  }
  
  return { y: currentY, imageId };
}
