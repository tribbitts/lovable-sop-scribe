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
        
        // Create a new canvas for the final image with shadow and rounded corners
        const shadowOffset = 8; // How much the shadow is offset Y (increased)
        const shadowBlurAmount = 12; // How much blur for the shadow (increased)
        const padding = shadowBlurAmount + shadowOffset; // Padding around the image for shadow and blur
        const borderRadius = 8; // Radius for the image corners

        const paddedCanvas = document.createElement('canvas');
        paddedCanvas.width = canvas.width + padding * 2;
        paddedCanvas.height = canvas.height + padding * 2;
        const paddedCtx = paddedCanvas.getContext('2d');
        
        if (!paddedCtx) {
          throw new Error("Failed to get padded canvas context");
        }

        // Draw the shadow by first drawing a rounded rectangle that will cast the shadow
        paddedCtx.save();
        paddedCtx.beginPath();
        paddedCtx.moveTo(padding + borderRadius, padding); // Start path for rounded rect
        paddedCtx.lineTo(padding + canvas.width - borderRadius, padding);
        paddedCtx.arcTo(padding + canvas.width, padding, padding + canvas.width, padding + borderRadius, borderRadius);
        paddedCtx.lineTo(padding + canvas.width, padding + canvas.height - borderRadius);
        paddedCtx.arcTo(padding + canvas.width, padding + canvas.height, padding + canvas.width - borderRadius, padding + canvas.height, borderRadius);
        paddedCtx.lineTo(padding + borderRadius, padding + canvas.height);
        paddedCtx.arcTo(padding, padding + canvas.height, padding, padding + canvas.height - borderRadius, borderRadius);
        paddedCtx.lineTo(padding, padding + borderRadius);
        paddedCtx.arcTo(padding, padding, padding + borderRadius, padding, borderRadius);
        paddedCtx.closePath();

        paddedCtx.shadowColor = 'rgba(0, 0, 0, 0.45)'; // Darker shadow
        paddedCtx.shadowBlur = shadowBlurAmount;
        paddedCtx.shadowOffsetX = 0;
        paddedCtx.shadowOffsetY = shadowOffset;
        paddedCtx.fillStyle = 'rgba(255,255,255,1)'; // Temporary fill for the shape that casts shadow
        paddedCtx.fill(); // This fill casts the shadow
        paddedCtx.restore(); // Restore to state before shadow drawing
        
        // Now, clip to the rounded rectangle area and draw the actual image (canvas)
        // The clipping path is the same as the one used for the shadow caster
        paddedCtx.save();
        paddedCtx.beginPath(); // Re-define path for clipping
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
        
        // Draw the original image (from the first canvas, which includes callouts) into the clipped rounded area
        paddedCtx.drawImage(canvas, padding, padding, canvas.width, canvas.height);
        paddedCtx.restore(); // Remove clipping path for any future drawings on this context (if any)
        
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
