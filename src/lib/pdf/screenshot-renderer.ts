
import { SopStep } from "@/types/sop";
import { compressImage } from "./utils";

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
    
    // Calculate image dimensions
    let imgWidth, imgHeight, secondaryImgWidth, secondaryImgHeight;
    
    if (layout === 'side-by-side' && hasSecondImage) {
      // Side-by-side layout (two images)
      imgWidth = (contentWidth * 0.95) / 2;
      secondaryImgWidth = imgWidth;
    } else {
      // Stacked layout or single image
      imgWidth = contentWidth * 0.95;
      secondaryImgWidth = imgWidth;
    }
    
    // Create first image
    const { imageData: mainImageData, aspectRatio: mainAspectRatio } = 
      await createImageWithStyling(mainImage, step.screenshot.callouts);
    
    // Calculate heights based on aspect ratio
    imgHeight = imgWidth / mainAspectRatio;
    
    // Check if we need a new page for this image
    if (currentY + imgHeight > height - margin.bottom - 20) {
      pdf.addPage();
      addContentPageDesign(pdf, width, height, margin);
      currentY = margin.top;
    }
    
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
        currentY += Math.max(imgHeight, secondaryImgHeight) + 15;
      } else {
        // Stacked layout - add second image below first
        secondaryImgHeight = secondaryImgWidth / secondaryAspectRatio;
        
        // Add the second image below the first
        pdf.addImage(
          secondaryImageData,
          'JPEG',
          (width - secondaryImgWidth) / 2,
          currentY + imgHeight + 10, // 10px spacing
          secondaryImgWidth,
          secondaryImgHeight
        );
        
        // Move Y position below both images
        currentY += imgHeight + secondaryImgHeight + 25;
      }
    } else {
      // Only one image, move Y below it
      currentY += imgHeight + 15;
    }
  } catch (e) {
    console.error("Error adding screenshot to PDF", e);
    currentY += 5; // Small space if image fails
  }
  
  return currentY;
}

/**
 * Prepares a screenshot image for the PDF
 */
async function prepareScreenshotImage(dataUrl: string, quality: number): Promise<string> {
  return compressImage(dataUrl, quality);
}

/**
 * Creates a styled image with callouts and formatting
 */
async function createImageWithStyling(imageUrl: string, callouts: any[] = []): Promise<{imageData: string, aspectRatio: number}> {
  // Create a canvas element to render the screenshot with callouts
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return { imageData: imageUrl, aspectRatio: 1 };
  }
  
  return new Promise<{imageData: string, aspectRatio: number}>(async (resolve) => {
    // Create image element to load the screenshot
    const img = new Image();
    img.src = imageUrl;
    
    img.onload = () => {
      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;
      
      const aspectRatio = img.width / img.height;
      
      // Create modern styling with rounded corners
      ctx.save();
      
      const cornerRadius = 12; // Rounded corner radius
      const paddingSize = 15; // Padding between image and border
      
      // Expand canvas for padding
      const paddedWidth = canvas.width + (paddingSize * 2);
      const paddedHeight = canvas.height + (paddingSize * 2);
      
      // Create a new canvas with padding
      const paddedCanvas = document.createElement('canvas');
      paddedCanvas.width = paddedWidth;
      paddedCanvas.height = paddedHeight;
      const paddedCtx = paddedCanvas.getContext('2d');
      
      if (paddedCtx) {
        // Draw white background
        paddedCtx.fillStyle = '#FFFFFF';
        paddedCtx.fillRect(0, 0, paddedWidth, paddedHeight);
        
        // Draw rounded rectangle for the background
        paddedCtx.fillStyle = '#FFFFFF';
        paddedCtx.beginPath();
        paddedCtx.moveTo(cornerRadius, 0);
        paddedCtx.lineTo(paddedWidth - cornerRadius, 0);
        paddedCtx.quadraticCurveTo(paddedWidth, 0, paddedWidth, cornerRadius);
        paddedCtx.lineTo(paddedWidth, paddedHeight - cornerRadius);
        paddedCtx.quadraticCurveTo(paddedWidth, paddedHeight, paddedWidth - cornerRadius, paddedHeight);
        paddedCtx.lineTo(cornerRadius, paddedHeight);
        paddedCtx.quadraticCurveTo(0, paddedHeight, 0, paddedHeight - cornerRadius);
        paddedCtx.lineTo(0, cornerRadius);
        paddedCtx.quadraticCurveTo(0, 0, cornerRadius, 0);
        paddedCtx.closePath();
        paddedCtx.fill();
        
        // Add Apple-style soft shadow
        paddedCtx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        paddedCtx.shadowBlur = 8;
        paddedCtx.shadowOffsetX = 0;
        paddedCtx.shadowOffsetY = 2;
        
        // Create rounded rectangle for the image
        paddedCtx.beginPath();
        paddedCtx.moveTo(paddingSize + cornerRadius, paddingSize);
        paddedCtx.lineTo(paddingSize + canvas.width - cornerRadius, paddingSize);
        paddedCtx.arcTo(paddingSize + canvas.width, paddingSize, paddingSize + canvas.width, paddingSize + cornerRadius, cornerRadius);
        paddedCtx.lineTo(paddingSize + canvas.width, paddingSize + canvas.height - cornerRadius);
        paddedCtx.arcTo(paddingSize + canvas.width, paddingSize + canvas.height, paddingSize + canvas.width - cornerRadius, paddingSize + canvas.height, cornerRadius);
        paddedCtx.lineTo(paddingSize + cornerRadius, paddingSize + canvas.height);
        paddedCtx.arcTo(paddingSize, paddingSize + canvas.height, paddingSize, paddingSize + canvas.height - cornerRadius, cornerRadius);
        paddedCtx.lineTo(paddingSize, paddingSize + cornerRadius);
        paddedCtx.arcTo(paddingSize, paddingSize, paddingSize + cornerRadius, paddingSize, cornerRadius);
        paddedCtx.closePath();
        
        // Reset shadow for the image itself
        paddedCtx.shadowColor = 'transparent';
        paddedCtx.shadowBlur = 0;
        paddedCtx.shadowOffsetX = 0;
        paddedCtx.shadowOffsetY = 0;
        
        // Draw the image within the rounded rectangle area
        paddedCtx.clip();
        paddedCtx.drawImage(img, paddingSize, paddingSize, canvas.width, canvas.height);
        paddedCtx.restore();
        
        // Draw the callouts
        renderCallouts(paddedCtx, callouts, canvas.width, canvas.height, paddingSize);
        
        // Return the padded canvas with rounded corners
        const imgData = paddedCanvas.toDataURL('image/jpeg', 0.95);
        resolve({ 
          imageData: imgData, 
          aspectRatio: aspectRatio 
        });
      } else {
        // Fallback if context isn't available
        resolve({ 
          imageData: imageUrl, 
          aspectRatio: aspectRatio 
        });
      }
    };
    
    img.onerror = () => {
      resolve({ 
        imageData: imageUrl, 
        aspectRatio: 1 
      });
    };
  });
}

/**
 * Renders callouts on the screenshot
 */
function renderCallouts(
  ctx: CanvasRenderingContext2D, 
  callouts: any[] = [], 
  canvasWidth: number, 
  canvasHeight: number, 
  paddingSize: number
): void {
  if (!callouts || callouts.length === 0) return;
  
  callouts.forEach(callout => {
    // Convert percentage positions to pixel positions
    const x = (callout.x / 100) * canvasWidth + paddingSize;
    const y = (callout.y / 100) * canvasHeight + paddingSize;
    const width = (callout.width / 100) * canvasWidth;
    const height = (callout.height / 100) * canvasHeight;
    
    // Ensure all callouts are circles with subtle glow effect
    const radius = Math.max(width, height) / 2;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    // Draw subtle glow effect
    ctx.shadowColor = callout.color;
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw thin border with transparent fill
    ctx.strokeStyle = callout.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Reset shadow for any subsequent drawing
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  });
}
