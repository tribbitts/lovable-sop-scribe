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
  console.log(`[addScreenshot] Called for step ${stepIndex + 1} with mode: ${imageLayoutMode}, currentY: ${currentY}`);
  try {
    // Skip if no screenshot data
    if (!step.screenshot || !step.screenshot.dataUrl) {
      console.log(`[addScreenshot] Step ${stepIndex + 1}: No screenshot data or dataUrl. Skipping.`);
      return { y: currentY, imageId };
    }
    
    console.log(`[addScreenshot] Step ${stepIndex + 1}: Has dataUrl (first 30 chars): ${step.screenshot.dataUrl.substring(0,30)}`);
    
    // Validate image data before processing
    if (!step.screenshot.dataUrl.startsWith('data:')) {
      console.error(`[addScreenshot] Step ${stepIndex + 1}: Invalid screenshot dataUrl format.`);
      return { y: currentY + 10, imageId };
    }
    
    console.log(`[addScreenshot] Processing screenshot for step ${stepIndex + 1}`);
    
    // Handle main screenshot with additional error handling
    try {
      // Preprocess the image with higher quality setting
      const mainImage = await prepareScreenshotImage(step.screenshot.dataUrl, 0.95);
      
      // Calculate maximum image width - smaller for the two-per-page layout
      // Use 70% of content width for single images, 80% for paired images
      const maxImageWidth = contentWidth * (imageLayoutMode === 'single' ? 0.70 : 0.80);
      
      console.log(`[addScreenshot] Step ${stepIndex + 1}: maxImageWidth = ${maxImageWidth}`);
      
      console.log(`[addScreenshot] Creating main image with styling for step ${stepIndex + 1}`);
      // Create image with improved quality and shadow effect
      const { imageData: mainImageData, aspectRatio: mainAspectRatio } = 
        await createImageWithStyling(mainImage, step.screenshot.callouts);
      
      if (!mainImageData) {
        console.error(`[addScreenshot] Step ${stepIndex + 1}: Failed to process mainImage (mainImageData is null).`);
        throw new Error(`Failed to process main image for step ${stepIndex + 1}`);
      }
      
      // Calculate dimensions while preserving aspect ratio and limiting width
      let imgWidth = maxImageWidth;
      let imgHeight = imgWidth / mainAspectRatio;
      
      // Check if the image is too tall for the page
      // Adjust the available height based on whether this is a first or second image in a pair
      let maxAvailableHeight;
      if (imageLayoutMode === 'single') {
        maxAvailableHeight = height - currentY - margin.bottom - 20; // 20px buffer for single image
      } else if (imageLayoutMode === 'firstOfPair') {
        maxAvailableHeight = (height - margin.top - margin.bottom - 40) / 2; // First image gets ~50% of page minus spacing
      } else { // secondOfPair
        maxAvailableHeight = height - currentY - margin.bottom - 15; // Second image gets remaining space minus buffer
      }

      if (imgHeight > maxAvailableHeight) {
        console.log(`[addScreenshot] Step ${stepIndex + 1}: Image too tall (imgHeight: ${imgHeight} > maxAvailableHeight: ${maxAvailableHeight}). Scaling down.`);
        imgHeight = maxAvailableHeight;
        imgWidth = imgHeight * mainAspectRatio;
        console.log(`[addScreenshot] Step ${stepIndex + 1}: Scaled dimensions: imgWidth = ${imgWidth}, imgHeight = ${imgHeight}`);
      }
      
      // Center image horizontally
      const imageX = margin.left + (contentWidth - imgWidth) / 2;
      
      console.log(`[addScreenshot] Step ${stepIndex + 1}: Final image parameters: imageX = ${imageX}, currentY = ${currentY}, imgWidth = ${imgWidth}, imgHeight = ${imgHeight}`);
      
      // Add the main image to PDF with error handling
      try {
        console.log(`[addScreenshot] Step ${stepIndex + 1}: Attempting pdf.addImage()`);
        pdf.addImage(
          mainImageData, 
          'JPEG', 
          imageX, 
          currentY, 
          imgWidth, 
          imgHeight
        );
        console.log(`[addScreenshot] Step ${stepIndex + 1}: pdf.addImage() successful.`);
        imageId = `step_${stepIndex}_main`;
        
        // Advance Y position
        // Add less padding after the first image in a pair
        const yPadding = imageLayoutMode === 'firstOfPair' ? 8 : 15;
        currentY += imgHeight + yPadding;
      } catch (imageError) {
        console.error(`[addScreenshot] Step ${stepIndex + 1}: Error adding main image to PDF:`, imageError);
        return { y: currentY + 10, imageId: null };
      }
      
      // If there's a secondary image, add it on a new page
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
            console.error(`[addScreenshot] Step ${stepIndex + 1}: Failed to process secondaryImage (secondaryImageData is null).`);
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
          console.log(`[addScreenshot] Step ${stepIndex + 1}: Adding secondary image to PDF`);
          pdf.addImage(
            secondaryImageData, 
            'JPEG', 
            secondaryImageX, 
            secondaryCurrentY, 
            secondaryImgWidth, 
            secondaryImgHeight
          );
          console.log(`[addScreenshot] Step ${stepIndex + 1}: Secondary image added successfully.`);
          
          secondaryCurrentY += secondaryImgHeight + 15;
        } catch (secondaryImgError) {
          console.error(`[addScreenshot] Step ${stepIndex + 1}: Error processing secondary image:`, secondaryImgError);
          // Continue with next step even if secondary image fails
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
  
  console.log(`[addScreenshot] Step ${stepIndex + 1}: Returning y = ${currentY}`);
  return { y: currentY, imageId };
}

// Simplified version for debugging if needed
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
  console.log(`[addScreenshot DEBUG] Called for step ${stepIndex + 1}, currentY: ${currentY}`);
  // ONLY ATTEMPT TO DRAW THE FIRST STEP'S SCREENSHOT FOR DEBUGGING
  if (stepIndex !== 0) {
    console.log(`[addScreenshot DEBUG] Step ${stepIndex + 1}: Skipping for debug (only processing step 0).`);
    return { y: currentY, imageId: null };
  }

  try {
    if (!step.screenshot || !step.screenshot.dataUrl) {
      console.error(`[addScreenshot DEBUG] Step ${stepIndex + 1}: No screenshot data or dataUrl.`);
      return { y: currentY, imageId: null };
    }
    if (!step.screenshot.dataUrl.startsWith('data:')) {
      console.error(`[addScreenshot DEBUG] Step ${stepIndex + 1}: Invalid dataUrl format.`);
      return { y: currentY, imageId: null };
    }
    console.log(`[addScreenshot DEBUG] Step ${stepIndex + 1}: Processing image. DataUrl (start): ${step.screenshot.dataUrl.substring(0,50)}`);

    const mainImage = await prepareScreenshotImage(step.screenshot.dataUrl, 0.95);
    if (!mainImage) {
      console.error("[addScreenshot DEBUG] prepareScreenshotImage failed to return mainImage.");
      return { y: currentY, imageId: null };
    }

    const { imageData: mainImageData, aspectRatio: mainAspectRatio } = 
      await createImageWithStyling(mainImage, step.screenshot.callouts);

    if (!mainImageData) {
      console.error("[addScreenshot DEBUG] createImageWithStyling failed to return mainImageData.");
      return { y: currentY, imageId: null };
    }
    console.log("[addScreenshot DEBUG] Image processed successfully by createImageWithStyling.");

    const debugImgWidth = 50; // Fixed width for debugging
    const debugImgHeight = (mainAspectRatio && mainAspectRatio > 0 && mainAspectRatio !== Infinity) ? debugImgWidth / mainAspectRatio : 50;
    const debugImgX = margin.left + 10;
    const debugImgY = currentY + 10; // Place it a bit below the header

    console.log(`[addScreenshot DEBUG] Attempting pdf.addImage with: X=${debugImgX}, Y=${debugImgY}, W=${debugImgWidth}, H=${debugImgHeight}`);
    try {
      pdf.addImage(
        mainImageData, 
        'JPEG', // Assuming JPEG
        debugImgX, 
        debugImgY, 
        debugImgWidth, 
        debugImgHeight
      );
      console.log("[addScreenshot DEBUG] pdf.addImage call completed.");
      currentY = debugImgY + debugImgHeight + 15;
      return { y: currentY, imageId: `step_${stepIndex}_debug` };
    } catch (e) {
      console.error("[addScreenshot DEBUG] Error during pdf.addImage:", e);
      return { y: currentY, imageId: null }; // Return original Y if addImage fails
    }
  } catch (e) {
    console.error(`[addScreenshot DEBUG] General error for step ${stepIndex + 1}:`, e);
    return { y: currentY, imageId: null };
  }
}
