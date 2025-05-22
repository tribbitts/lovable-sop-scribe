
import { SopStep } from "@/types/sop";
import { prepareScreenshotImage, createImageWithStyling } from "./image-processor";

/**
 * Adds screenshots with callouts to the PDF
 * Handles up to 2 images per step with consistent sizing
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
  isFirstOrSecondPage: boolean = false
): Promise<number> {
  try {
    // Skip if no screenshot data
    if (!step.screenshot || !step.screenshot.dataUrl) {
      console.log(`No screenshot for step ${stepIndex + 1}, skipping`);
      return currentY;
    }
    
    // Validate image data before processing
    if (!step.screenshot.dataUrl.startsWith('data:')) {
      console.error(`Invalid screenshot data for step ${stepIndex + 1}`);
      return currentY + 10;
    }
    
    console.log(`Processing screenshot for step ${stepIndex + 1}`);
    
    // Handle main screenshot with additional error handling
    try {
      // Preprocess the image with higher quality setting (0.95 instead of 0.92)
      const mainImage = await prepareScreenshotImage(step.screenshot.dataUrl, 0.95);
      
      // Check if there's a second image
      const hasSecondImage = step.screenshot.secondaryDataUrl !== undefined && 
                           step.screenshot.secondaryDataUrl !== null &&
                           step.screenshot.secondaryDataUrl.startsWith('data:');
      
      // Always use side-by-side layout when possible to fit two per page
      const isWideLayout = contentWidth >= 350;
      const layout = hasSecondImage && isWideLayout ? 'side-by-side' : 'stacked';
      
      // Calculate image dimensions for better page utilization
      let imgWidth, imgHeight, secondaryImgWidth, secondaryImgHeight;
      
      // Reduce image sizes to fit more per page
      if (isFirstOrSecondPage) {
        // First two pages - slightly smaller than before but still prominent
        imgWidth = contentWidth * 0.75; // Reduced from 0.85
      } else {
        // Pages 3+ - even smaller images to fit two per page
        if (layout === 'side-by-side' && hasSecondImage) {
          // Side-by-side layout (two images)
          imgWidth = (contentWidth * 0.95) / 2; // Maximize width usage
        } else {
          // Stacked layout or single image - smaller size
          imgWidth = contentWidth * 0.65; // Reduced from 0.75
        }
      }
      
      secondaryImgWidth = imgWidth;
      
      console.log(`Creating main image with styling for step ${stepIndex + 1}`);
      // Create first image with improved quality
      const { imageData: mainImageData, aspectRatio: mainAspectRatio } = 
        await createImageWithStyling(mainImage, step.screenshot.callouts);
      
      if (!mainImageData) {
        throw new Error(`Failed to process main image for step ${stepIndex + 1}`);
      }
      
      // Calculate heights based on aspect ratio
      imgHeight = imgWidth / mainAspectRatio;
      
      // Center the image horizontally, unless side-by-side
      const firstImageX = layout === 'side-by-side' && hasSecondImage
        ? margin.left
        : (width - imgWidth) / 2;
      
      // Add the main image to PDF with error handling
      try {
        console.log(`Adding main image to PDF for step ${stepIndex + 1} at position (${firstImageX}, ${currentY})`);
        pdf.addImage(
          mainImageData, 
          'JPEG', 
          firstImageX, 
          currentY, 
          imgWidth, 
          imgHeight
        );
      } catch (imageError) {
        console.error(`Error adding main image to PDF for step ${stepIndex + 1}:`, imageError);
        return currentY + 10;
      }
      
      // If there's a secondary image, add it
      if (hasSecondImage && step.screenshot.secondaryDataUrl) {
        try {
          console.log(`Processing secondary image for step ${stepIndex + 1}`);
          // Use higher quality for secondary image too
          const secondaryImage = await prepareScreenshotImage(step.screenshot.secondaryDataUrl, 0.95);
          
          const { imageData: secondaryImageData, aspectRatio: secondaryAspectRatio } = 
            await createImageWithStyling(secondaryImage, step.screenshot.secondaryCallouts || []);
          
          if (!secondaryImageData) {
            throw new Error(`Failed to process secondary image for step ${stepIndex + 1}`);
          }
          
          // Ensure consistent height in side-by-side mode
          if (layout === 'side-by-side') {
            // Use the same height for both images
            secondaryImgHeight = imgHeight;
            secondaryImgWidth = secondaryImgHeight * secondaryAspectRatio;
            
            // Add second image next to the first
            console.log(`Adding secondary image side-by-side for step ${stepIndex + 1}`);
            pdf.addImage(
              secondaryImageData,
              'JPEG',
              firstImageX + imgWidth + 5, // 5px spacing
              currentY,
              secondaryImgWidth,
              secondaryImgHeight
            );
            
            // Move Y position below both images
            currentY += Math.max(imgHeight, secondaryImgHeight) + 6; // Reduced spacing
          } else {
            // Stacked layout - add second image below first
            secondaryImgHeight = secondaryImgWidth / secondaryAspectRatio;
            
            // Add the second image below the first
            console.log(`Adding secondary image stacked for step ${stepIndex + 1}`);
            pdf.addImage(
              secondaryImageData,
              'JPEG',
              (width - secondaryImgWidth) / 2,
              currentY + imgHeight + 5, // Reduced spacing between images
              secondaryImgWidth,
              secondaryImgHeight
            );
            
            // Move Y position below both images
            currentY += imgHeight + secondaryImgHeight + 10; // Reduced spacing
          }
        } catch (secondaryImgError) {
          console.error(`Error processing secondary image for step ${stepIndex + 1}:`, secondaryImgError);
          currentY += imgHeight + 8;
        }
      } else {
        // Only one image, move Y below it
        currentY += imgHeight + 8;
      }
      
    } catch (mainImgError) {
      console.error(`Error processing main image for step ${stepIndex + 1}:`, mainImgError);
      return currentY + 8;
    }
  } catch (e) {
    console.error(`Error in screenshot handling for step ${stepIndex + 1}:`, e);
    currentY += 4;
  }
  
  return currentY;
}
