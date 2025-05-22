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
 * Optimized version with minimal padding for larger screenshots
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
        
        // Minimal shadow and rounded corners with very little padding
        const shadowOffset = 3; // Reduced shadow offset
        const shadowBlurAmount = 6; // Reduced shadow blur
        const padding = 4; // Minimal padding - just enough for shadow
        const borderRadius = 8; // Keep nice rounded corners

        const paddedCanvas = document.createElement('canvas');
        paddedCanvas.width = canvas.width + padding * 2;
        paddedCanvas.height = canvas.height + padding * 2;
        const paddedCtx = paddedCanvas.getContext('2d');
        
        if (!paddedCtx) {
          throw new Error("Failed to get padded canvas context");
        }

        // Create modern styling with shadow effect
        paddedCtx.save();
        
        // Draw subtle shadow
        paddedCtx.shadowColor = 'rgba(0, 0, 0, 0.15)'; // Much lighter shadow
        paddedCtx.shadowBlur = shadowBlurAmount;
        paddedCtx.shadowOffsetX = 0;
        paddedCtx.shadowOffsetY = shadowOffset;
        
        // Draw rounded rectangle background for shadow
        paddedCtx.beginPath();
        paddedCtx.moveTo(padding + borderRadius, padding);
        paddedCtx.lineTo(padding + canvas.width - borderRadius, padding);
        paddedCtx.arcTo(padding + canvas.width, padding, padding + canvas.width, padding + borderRadius, borderRadius);
        paddedCtx.lineTo(padding + canvas.width, padding + canvas.height - borderRadius);
        paddedCtx.arcTo(padding + canvas.width, padding + canvas.height, padding + canvas.width - borderRadius, padding + canvas.height, borderRadius);
        paddedCtx.lineTo(padding + borderRadius, padding + canvas.height);
        paddedCtx.arcTo(padding, padding + canvas.height, padding, padding + canvas.height - borderRadius, borderRadius);
        paddedCtx.lineTo(padding, padding + borderRadius);
        paddedCtx.arcTo(padding, padding, padding + borderRadius, padding, borderRadius);
        paddedCtx.closePath();
        paddedCtx.fillStyle = 'white';
        paddedCtx.fill();
        
        paddedCtx.restore();
        
        // Now clip to rounded rectangle and draw the actual image
        paddedCtx.save();
        paddedCtx.beginPath();
        paddedCtx.moveTo(padding + borderRadius, padding);
        paddedCtx.lineTo(padding + canvas.width - borderRadius, padding);
        paddedCtx.arcTo(padding + canvas.width, padding, padding + canvas.width, padding + borderRadius, borderRadius);
        paddedCtx.lineTo(padding + canvas.width, padding + canvas.height - borderRadius);
        paddedCtx.arcTo(padding + canvas.width, padding + canvas.height, padding + canvas.width - borderRadius, padding + canvas.height, borderRadius);
        paddedCtx.lineTo(padding + borderRadius, padding + canvas.height);
        paddedCtx.arcTo(padding, padding + canvas.height, padding, padding + canvas.height - borderRadius, borderRadius);
        paddedCtx.lineTo(padding, padding + borderRadius);
        paddedCtx.arcTo(padding, padding, padding + borderRadius, padding, borderRadius);
        paddedCtx.closePath();
        paddedCtx.clip();
        
        // Draw the original image
        paddedCtx.drawImage(img, padding, padding, canvas.width, canvas.height);
        
        // Draw callouts if available (after clipping so they appear on the image)
        try {
          if (Array.isArray(callouts) && callouts.length > 0) {
            renderCallouts(paddedCtx, callouts, canvas.width, canvas.height, padding);
          }
        } catch (calloutError) {
          console.error("Error rendering callouts:", calloutError);
        }
        
        paddedCtx.restore();
        
        // Return the final image
        try {
          // Use PNG output to preserve transparency for rounded corners and shadows
          const imgData = paddedCanvas.toDataURL('image/png');
          resolve({ 
            imageData: imgData, 
            aspectRatio: paddedCanvas.width / paddedCanvas.height
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
