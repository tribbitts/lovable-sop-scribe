
import { compressImage } from "./utils";
import { renderCallouts } from "./callout-renderer";

/**
 * Prepares a screenshot image for the PDF
 */
export async function prepareScreenshotImage(dataUrl: string, quality: number): Promise<string> {
  try {
    if (!dataUrl || typeof dataUrl !== 'string') {
      console.error("Invalid image data provided to prepareScreenshotImage");
      throw new Error("Invalid image data");
    }
    
    // Validate data URL format
    if (!dataUrl.startsWith('data:')) {
      console.error("Invalid data URL format:", dataUrl.substring(0, 20) + "...");
      throw new Error("Invalid data URL format");
    }
    
    // Skip compression for JPEG images to preserve quality
    if (dataUrl.startsWith('data:image/jpeg')) {
      return dataUrl; // Return as-is if already JPEG
    }
    
    // Use higher quality compression
    return await compressImage(dataUrl, quality);
  } catch (error) {
    console.error("Error preparing screenshot image:", error);
    throw error;
  }
}

/**
 * Creates a styled image with callouts and formatting
 */
export async function createImageWithStyling(imageUrl: string, callouts: any[] = []): Promise<{imageData: string, aspectRatio: number}> {
  // Validate input
  if (!imageUrl || typeof imageUrl !== 'string') {
    console.error("Invalid image URL provided to createImageWithStyling");
    throw new Error("Invalid image URL");
  }
  
  if (!imageUrl.startsWith('data:')) {
    console.error("Invalid data URL format:", imageUrl.substring(0, 20) + "...");
    throw new Error("Invalid data URL format");
  }
  
  // Create a canvas element to render the screenshot with callouts
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error("Failed to get canvas context");
    throw new Error("Failed to get canvas context");
  }
  
  return new Promise<{imageData: string, aspectRatio: number}>(async (resolve, reject) => {
    // Create image element to load the screenshot
    const img = new Image();
    
    img.onerror = (error) => {
      console.error("Error loading image:", error);
      reject(new Error("Failed to load image"));
    };
    
    img.onload = () => {
      try {
        // Check for valid dimensions
        if (img.width <= 0 || img.height <= 0) {
          console.error("Invalid image dimensions:", img.width, "x", img.height);
          reject(new Error("Invalid image dimensions"));
          return;
        }
        
        // Set canvas dimensions to match the image
        canvas.width = img.width || 800;
        canvas.height = img.height || 600;
        
        if (canvas.width <= 0 || canvas.height <= 0) {
          console.error("Invalid canvas dimensions:", canvas.width, canvas.height);
          throw new Error("Invalid canvas dimensions");
        }
        
        const aspectRatio = canvas.width / canvas.height;
        
        // Create modern styling with shadow effect
        ctx.save();
        
        // Draw the original image first
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Draw callouts if available
        try {
          if (Array.isArray(callouts) && callouts.length > 0) {
            renderCallouts(ctx, callouts, canvas.width, canvas.height, 0);
          }
        } catch (calloutError) {
          console.error("Error rendering callouts:", calloutError);
        }
        
        // Create a new canvas for the final image with shadow
        const paddedCanvas = document.createElement('canvas');
        const shadowSize = 15; // Shadow size in pixels
        paddedCanvas.width = canvas.width + (shadowSize * 2);
        paddedCanvas.height = canvas.height + (shadowSize * 2);
        const paddedCtx = paddedCanvas.getContext('2d');
        
        if (!paddedCtx) {
          throw new Error("Failed to get padded canvas context");
        }
        
        // Draw shadow
        paddedCtx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        paddedCtx.shadowBlur = 15;
        paddedCtx.shadowOffsetX = 0;
        paddedCtx.shadowOffsetY = 5;
        
        // Create a rectangle with the image dimensions
        paddedCtx.fillStyle = '#ffffff';
        paddedCtx.fillRect(shadowSize, shadowSize, canvas.width, canvas.height);
        
        // Reset shadow
        paddedCtx.shadowColor = 'transparent';
        paddedCtx.shadowBlur = 0;
        paddedCtx.shadowOffsetX = 0;
        paddedCtx.shadowOffsetY = 0;
        
        // Draw the image on top of the shadow
        paddedCtx.drawImage(canvas, shadowSize, shadowSize);
        
        // Return the final image with shadow
        try {
          // Use high quality JPEG output
          const imgData = paddedCanvas.toDataURL('image/jpeg', 0.95);
          resolve({ 
            imageData: imgData, 
            aspectRatio: aspectRatio 
          });
        } catch (dataUrlError) {
          console.error("Error generating image data URL:", dataUrlError);
          throw dataUrlError;
        }
      } catch (processError) {
        console.error("Error processing image:", processError);
        reject(processError);
      }
    };
    
    // Set the source to start loading
    try {
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
    } catch (srcError) {
      console.error("Error setting image source:", srcError);
      reject(srcError);
    }
  });
}
