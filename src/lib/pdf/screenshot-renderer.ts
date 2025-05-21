
import { SopStep } from "@/types/sop";
import { compressImage } from "./utils";

/**
 * Adds a screenshot with callouts to the PDF
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
    
    // Compress and prepare the screenshot image
    const compressedImageUrl = await compressImage(step.screenshot.dataUrl, 0.92);
    
    // Create a canvas element to render the screenshot with callouts
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create image element to load the screenshot
      const img = new Image();
      img.src = compressedImageUrl;
      
      await new Promise<void>((resolve) => {
        img.onload = () => {
          // Set canvas dimensions to match the image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Create modern styling with rounded corners
          ctx.save();
          
          const cornerRadius = 8; // Subtle rounded corner radius
          const paddingSize = 10; // Minimal padding between image and border
          
          // Expand canvas for padding
          const paddedWidth = canvas.width + (paddingSize * 2);
          const paddedHeight = canvas.height + (paddingSize * 2);
          
          // Create a new canvas with padding
          const paddedCanvas = document.createElement('canvas');
          paddedCanvas.width = paddedWidth;
          paddedCanvas.height = paddedHeight;
          const paddedCtx = paddedCanvas.getContext('2d');
          
          if (paddedCtx) {
            // Draw rounded rectangle for the background (slight shadow effect)
            paddedCtx.fillStyle = '#FFFFFF'; // Clean white background
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
            
            // Add subtle shadow effect
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
            renderCallouts(paddedCtx, step, canvas.width, canvas.height, paddingSize);
            
            // Use the padded canvas with rounded corners for PDF
            const imgData = paddedCanvas.toDataURL('image/jpeg', 0.95);
            
            // Calculate optimal image dimensions
            const maxImgWidth = contentWidth * 0.9; // 90% of content width
            const aspectRatio = paddedCanvas.width / paddedCanvas.height;
            
            // Calculate available height for this step
            const availableHeight = height - currentY - margin.bottom - 30;
            
            // Start with width constraint
            let imgWidth = maxImgWidth;
            let imgHeight = imgWidth / aspectRatio;
            
            // If height exceeds available space, constrain by height
            if (imgHeight > availableHeight) {
              imgHeight = availableHeight;
              imgWidth = imgHeight * aspectRatio;
            }
            
            // Store this image's dimensions
            if (!pdf.stepImages) {
              pdf.stepImages = [];
            }
            pdf.stepImages.push({
              width: imgWidth,
              height: imgHeight,
              aspectRatio: aspectRatio
            });
            
            // Check if we need a new page for this image
            if (currentY + imgHeight > height - margin.bottom - 20) {
              pdf.addPage();
              addContentPageDesign(pdf, width, height, margin);
              currentY = margin.top;
            }
            
            // Center the image horizontally
            const imageX = (width - imgWidth) / 2;
            
            // Add the image to PDF
            pdf.addImage(
              imgData, 
              'JPEG', 
              imageX, 
              currentY, 
              imgWidth, 
              imgHeight
            );
            
            // Update current Y position
            currentY += imgHeight + 10;
          }
          resolve();
        };
      });
    }
  } catch (e) {
    console.error("Error adding screenshot to PDF", e);
    currentY += 5; // Small space if image fails
  }
  return currentY;
}

/**
 * Renders callouts on the screenshot
 */
function renderCallouts(
  ctx: CanvasRenderingContext2D, 
  step: SopStep, 
  canvasWidth: number, 
  canvasHeight: number, 
  paddingSize: number
): void {
  step.screenshot?.callouts.forEach(callout => {
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
