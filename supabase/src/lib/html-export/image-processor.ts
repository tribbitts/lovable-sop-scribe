import { Callout } from "@/types/sop";

/**
 * Creates a Base64 image with callouts rendered directly onto it for HTML export
 * This creates a fully self-contained image that includes all visual markups
 */
export async function createBase64ImageWithCallouts(
  imageUrl: string, 
  callouts: Callout[] = []
): Promise<string> {
  // Validate input
  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error("Invalid image URL provided");
  }
  
  if (!imageUrl.startsWith('data:')) {
    throw new Error("Invalid data URL format");
  }
  
  return new Promise<string>((resolve, reject) => {
    // Create image element to load the screenshot
    const img = new Image();
    
    img.onerror = (error) => {
      console.error("Error loading image:", error);
      reject(new Error("Failed to load image"));
    };
    
    img.onload = () => {
      try {
        // Create canvas with image dimensions
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }
        
        // Set canvas dimensions to match the image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx.drawImage(img, 0, 0);
        
        // Render callouts on top of the image
        if (callouts && callouts.length > 0) {
          renderCalloutsOnCanvas(ctx, callouts, canvas.width, canvas.height);
        }
        
        // Convert to Base64 JPEG with good quality but reasonable size
        const base64Image = canvas.toDataURL("image/jpeg", 0.85);
        resolve(base64Image);
        
      } catch (error) {
        console.error("Error processing image:", error);
        reject(error);
      }
    };
    
    // Start loading the image
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
  });
}

/**
 * Renders callouts directly onto a canvas
 */
function renderCalloutsOnCanvas(
  ctx: CanvasRenderingContext2D,
  callouts: Callout[],
  canvasWidth: number,
  canvasHeight: number
): void {
  callouts.forEach((callout, index) => {
    // Convert percentage positions to pixel positions
    const x = (callout.x / 100) * canvasWidth;
    const y = (callout.y / 100) * canvasHeight;
    const width = (callout.width / 100) * canvasWidth;
    const height = (callout.height / 100) * canvasHeight;
    
    // Set up callout styling
    ctx.save();
    
    switch (callout.shape) {
      case "circle": {
        const radius = Math.max(width, height) / 2;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        
        // Draw glow effect
        ctx.shadowColor = callout.color;
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw circle with border (no fill for regular circles)
        ctx.strokeStyle = callout.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Add number if present
        if (callout.number) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = "white";
          ctx.font = `bold ${Math.max(12, radius * 0.8)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            String(callout.number), 
            centerX, 
            centerY
          );
        }
        break;
      }
        
      case "number": {
        const radius = Math.max(width, height) / 2;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        
        // Draw glow effect
        ctx.shadowColor = callout.color;
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw circle with special styling for reveal text
        ctx.strokeStyle = callout.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        
        // Use gradient fill for reveal text callouts
        if (callout.revealText) {
          const gradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
          gradient.addColorStop(0, '#4F46E5');
          gradient.addColorStop(1, '#7C3AED');
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = callout.color;
        }
        ctx.fill();
        
        // Add number text
        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";
        ctx.font = `bold ${Math.max(12, radius * 0.8)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          String(callout.number || index + 1), 
          centerX, 
          centerY
        );
        
        // Add question mark indicator for reveal text
        if (callout.revealText) {
          const indicatorRadius = radius * 0.3;
          const indicatorX = centerX + radius * 0.7;
          const indicatorY = centerY - radius * 0.7;
          
          ctx.fillStyle = "#FCD34D";
          ctx.beginPath();
          ctx.arc(indicatorX, indicatorY, indicatorRadius, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.fillStyle = "black";
          ctx.font = `bold ${Math.max(8, indicatorRadius)}px sans-serif`;
          ctx.fillText("?", indicatorX, indicatorY);
        }
        break;
      }
        
      case "rectangle": {
        // Draw rectangle with semi-transparent fill
        ctx.shadowColor = callout.color;
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.strokeStyle = callout.color;
        ctx.lineWidth = 3;
        ctx.fillStyle = `${callout.color}40`; // 25% opacity
        
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        
        // Add text if available
        if (callout.text) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = callout.color;
          ctx.font = `bold ${Math.max(10, width * 0.1)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            callout.text, 
            x + width / 2, 
            y + height / 2
          );
        }
        break;
      }
        
      case "arrow": {
        // Draw arrow pointing to the location
        const arrowSize = Math.max(width, height);
        const tipX = x + width / 2;
        const tipY = y + height / 2;
        
        ctx.strokeStyle = callout.color;
        ctx.fillStyle = callout.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = callout.color;
        ctx.shadowBlur = 6;
        
        // Draw arrow shape
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - arrowSize * 0.3, tipY - arrowSize * 0.6);
        ctx.lineTo(tipX - arrowSize * 0.15, tipY - arrowSize * 0.6);
        ctx.lineTo(tipX - arrowSize * 0.15, tipY - arrowSize);
        ctx.lineTo(tipX + arrowSize * 0.15, tipY - arrowSize);
        ctx.lineTo(tipX + arrowSize * 0.15, tipY - arrowSize * 0.6);
        ctx.lineTo(tipX + arrowSize * 0.3, tipY - arrowSize * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
    }
    
    ctx.restore();
  });
}

/**
 * Estimate the file size of a Base64 image
 */
export function estimateBase64ImageSize(base64String: string): number {
  // Remove data URL prefix to get just the Base64 data
  const base64Data = base64String.split(',')[1] || base64String;
  
  // Calculate approximate size in bytes
  // Base64 encoding increases size by ~33%, and we account for padding
  const sizeInBytes = (base64Data.length * 3) / 4;
  
  return Math.round(sizeInBytes);
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 