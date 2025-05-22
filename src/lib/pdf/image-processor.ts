
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
        
        // Create modern styling with rounded corners
        ctx.save();
        
        const cornerRadius = 8; // Slightly larger corner radius
        const paddingSize = 12; // Increased padding for shadow effect
        const shadowBlur = 10; // Shadow blur size
        
        // Expand canvas for padding and shadow
        const paddedWidth = canvas.width + (paddingSize * 2);
        const paddedHeight = canvas.height + (paddingSize * 2);
        
        // Create a new canvas with padding
        const paddedCanvas = document.createElement('canvas');
        paddedCanvas.width = paddedWidth + shadowBlur * 2;
        paddedCanvas.height = paddedHeight + shadowBlur * 2;
        const paddedCtx = paddedCanvas.getContext('2d');
        
        if (!paddedCtx) {
          throw new Error("Failed to get padded canvas context");
        }
        
        // Draw white background
        paddedCtx.fillStyle = '#FFFFFF';
        paddedCtx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
        
        // Set up shadow
        paddedCtx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        paddedCtx.shadowBlur = shadowBlur;
        paddedCtx.shadowOffsetX = 0;
        paddedCtx.shadowOffsetY = 4;
        
        // Draw rounded rectangle for the image background (with shadow)
        paddedCtx.fillStyle = '#FFFFFF';
        paddedCtx.beginPath();
        paddedCtx.roundRect(
          shadowBlur + paddingSize/2, 
          shadowBlur + paddingSize/2, 
          canvas.width + paddingSize, 
          canvas.height + paddingSize, 
          cornerRadius
        );
        paddedCtx.fill();
        
        // Reset shadow for the image itself
        paddedCtx.shadowColor = 'transparent';
        paddedCtx.shadowBlur = 0;
        paddedCtx.shadowOffsetX = 0;
        paddedCtx.shadowOffsetY = 0;
        
        // Create clipping path for rounded image
        paddedCtx.beginPath();
        paddedCtx.roundRect(
          shadowBlur + paddingSize, 
          shadowBlur + paddingSize, 
          canvas.width, 
          canvas.height, 
          cornerRadius - 2 // Slightly smaller corner radius for the image
        );
        paddedCtx.clip();
        
        try {
          // Draw the image with proper positioning
          paddedCtx.drawImage(
            img, 
            shadowBlur + paddingSize, 
            shadowBlur + paddingSize, 
            canvas.width, 
            canvas.height
          );
        } catch (drawError) {
          console.error("Error drawing image on canvas:", drawError);
          throw drawError;
        }
        
        paddedCtx.restore();
        
        // Draw the callouts with error handling
        try {
          if (Array.isArray(callouts) && callouts.length > 0) {
            renderCallouts(
              paddedCtx, 
              callouts, 
              canvas.width, 
              canvas.height, 
              shadowBlur + paddingSize
            );
          }
        } catch (calloutError) {
          console.error("Error rendering callouts:", calloutError);
        }
        
        // Return the padded canvas with shadow and rounded corners
        try {
          // Use higher quality JPEG output (0.98 instead of 0.95)
          const imgData = paddedCanvas.toDataURL('image/jpeg', 0.98);
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
