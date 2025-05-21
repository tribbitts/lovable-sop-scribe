
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
  addContentPageDesign: Function
): Promise<number> {
  try {
    if (!step.screenshot || !step.screenshot.dataUrl) {
      return currentY;
    }
    
    // Handle main screenshot
    const mainImage = await prepareScreenshotImage(step.screenshot.dataUrl, 0.92);
    
    // Check if there's a second image (for future implementation)
    const hasSecondImage = step.screenshot.secondaryDataUrl !== undefined;
    
    // Determine layout - side by side or stacked
    const isWideLayout = contentWidth >= 350; // Minimum width for side-by-side
    const layout = hasSecondImage && isWideLayout ? 'side-by-side' : 'stacked';
    
    // Calculate image dimensions - use smaller image sizes to fit more content
    let imgWidth, imgHeight, secondaryImgWidth, secondaryImgHeight;
    
    if (layout === 'side-by-side' && hasSecondImage) {
      // Side-by-side layout (two images)
      imgWidth = (contentWidth * 0.95) / 2;
      secondaryImgWidth = imgWidth;
    } else {
      // Stacked layout or single image - reduce image size to 85% of content width
      imgWidth = contentWidth * 0.85;
      secondaryImgWidth = imgWidth;
    }
    
    // Create first image
    const { imageData: mainImageData, aspectRatio: mainAspectRatio } = 
      await createImageWithStyling(mainImage, step.screenshot.callouts);
    
    // Calculate heights based on aspect ratio
    imgHeight = imgWidth / mainAspectRatio;
    
    // Center the image horizontally
    const firstImageX = layout === 'side-by-side' && hasSecondImage
      ? margin.left
      : (width - imgWidth) / 2;
    
    // Add the main image to PDF
    pdf.addImage(
      mainImageData, 
      'JPEG', 
      firstImageX, 
      currentY, 
      imgWidth, 
      imgHeight
    );
    
    // If there's a secondary image, add it
    if (hasSecondImage && step.screenshot.secondaryDataUrl) {
      const secondaryImage = await prepareScreenshotImage(step.screenshot.secondaryDataUrl, 0.92);
      
      const { imageData: secondaryImageData, aspectRatio: secondaryAspectRatio } = 
        await createImageWithStyling(secondaryImage, step.screenshot.secondaryCallouts || []);
      
      // Ensure consistent height in side-by-side mode
      if (layout === 'side-by-side') {
        // Use the same height for both images
        secondaryImgHeight = imgHeight;
        secondaryImgWidth = secondaryImgHeight * secondaryAspectRatio;
        
        // Add second image next to the first
        pdf.addImage(
          secondaryImageData,
          'JPEG',
          firstImageX + imgWidth + 5, // 5px spacing
          currentY,
          secondaryImgWidth,
          secondaryImgHeight
        );
        
        // Move Y position below both images
        currentY += Math.max(imgHeight, secondaryImgHeight) + 10; // Reduced spacing
      } else {
        // Stacked layout - add second image below first
        secondaryImgHeight = secondaryImgWidth / secondaryAspectRatio;
        
        // Add the second image below the first
        pdf.addImage(
          secondaryImageData,
          'JPEG',
          (width - secondaryImgWidth) / 2,
          currentY + imgHeight + 8, // Reduced spacing between images
          secondaryImgWidth,
          secondaryImgHeight
        );
        
        // Move Y position below both images
        currentY += imgHeight + secondaryImgHeight + 15; // Reduced spacing
      }
    } else {
      // Only one image, move Y below it
      currentY += imgHeight + 10; // Reduced spacing
    }
  } catch (e) {
    console.error("Error adding screenshot to PDF", e);
    currentY += 5; // Small space if image fails
  }
  
  return currentY;
}
