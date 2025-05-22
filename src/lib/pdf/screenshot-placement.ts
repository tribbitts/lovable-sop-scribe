
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
      // Preprocess the image with higher quality setting
      const mainImage = await prepareScreenshotImage(step.screenshot.dataUrl, 0.95);
      
      // Always start a new page for each screenshot
      pdf.addPage();
      addContentPageDesign(pdf, width, height, margin, null); // Add design to the new page
      currentY = margin.top;
      
      // Calculate image dimensions for optimal page utilization
      const maxImageWidth = contentWidth * 0.8; // Use 80% of content width
      
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
      
      // Center the image horizontally
      const firstImageX = (width - imgWidth) / 2;
      
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
        
        // Move Y position below the first image
        currentY += imgHeight + 15;
      } catch (imageError) {
        console.error(`Error adding main image to PDF for step ${stepIndex + 1}:`, imageError);
        return currentY + 10;
      }
      
      // If there's a secondary image, add it on a new page
      if (step.screenshot.secondaryDataUrl && step.screenshot.secondaryDataUrl.startsWith('data:')) {
        try {
          console.log(`Processing secondary image for step ${stepIndex + 1}`);
          // Always add a new page for the secondary image
          pdf.addPage();
          addContentPageDesign(pdf, width, height, margin, null);
          currentY = margin.top;
          
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
            currentY, 
            secondaryImgWidth, 
            secondaryImgHeight
          );
          
          // Move Y position below the secondary image
          currentY += secondaryImgHeight + 15;
        } catch (secondaryImgError) {
          console.error(`Error processing secondary image for step ${stepIndex + 1}:`, secondaryImgError);
          // Continue with next step even if secondary image fails
        }
      }
      
    } catch (mainImgError) {
      console.error(`Error processing main image for step ${stepIndex + 1}:`, mainImgError);
      return currentY + 10;
    }
  } catch (e) {
    console.error(`Error in screenshot handling for step ${stepIndex + 1}:`, e);
    currentY += 5;
  }
  
  return currentY;
}
