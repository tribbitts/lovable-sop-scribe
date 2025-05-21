
import { compressImage } from "./utils";
import { renderCallouts } from "./callout-renderer";

/**
 * Prepares a screenshot image for the PDF
 */
export async function prepareScreenshotImage(dataUrl: string, quality: number): Promise<string> {
  return compressImage(dataUrl, quality);
}

/**
 * Creates a styled image with callouts and formatting
 */
export async function createImageWithStyling(imageUrl: string, callouts: any[] = []): Promise<{imageData: string, aspectRatio: number}> {
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
      
      const cornerRadius = 8; // Reduced corner radius for more compact look
      const paddingSize = 10; // Reduced padding for more compact images
      
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
        
        // Add Apple-style soft shadow (reduced shadow for more compact layout)
        paddedCtx.shadowColor = 'rgba(0, 0, 0, 0.08)';
        paddedCtx.shadowBlur = 6;
        paddedCtx.shadowOffsetX = 0;
        paddedCtx.shadowOffsetY = 1;
        
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
