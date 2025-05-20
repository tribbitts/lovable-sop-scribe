
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
    // Compress and prepare the screenshot image
    const compressedImageUrl = await compressImage(step.screenshot!.dataUrl, 0.85);
    
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
          
          // Create rounded corners and padding effect
          ctx.save();
          
          const cornerRadius = 12; // Rounded corner radius
          const paddingSize = 15; // Increased padding between image and border
          
          // Expand canvas for padding
          const paddedWidth = canvas.width + (paddingSize * 2);
          const paddedHeight = canvas.height + (paddingSize * 2);
          
          // Create a new canvas with padding
          const paddedCanvas = document.createElement('canvas');
          paddedCanvas.width = paddedWidth;
          paddedCanvas.height = paddedHeight;
          const paddedCtx = paddedCanvas.getContext('2d');
          
          if (paddedCtx) {
            // Draw rounded rectangle for the background (shadow)
            paddedCtx.fillStyle = '#F2F2F7'; // Light background border (Apple light gray)
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
            
            // Create rounded rectangle for the image
            paddedCtx.save();
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
            
            // Draw the image within the rounded rectangle area
            paddedCtx.clip();
            paddedCtx.drawImage(img, paddingSize, paddingSize, canvas.width, canvas.height);
            paddedCtx.restore();
            
            // Draw the callouts
            renderCallouts(paddedCtx, step, canvas.width, canvas.height, paddingSize);
            
            // Use the padded canvas with rounded corners for PDF
            const imgData = paddedCanvas.toDataURL('image/jpeg', 0.92);
            
            // Calculate optimal image dimensions based on available space and aspect ratio
            // Target height that would allow approximately 2 steps per page
            const maxHeightForTwoStepsPerPage = (height - margin.top - margin.bottom - 100) / 2;
            
            // Ensure image fits width while maintaining aspect ratio
            const maxImgWidth = contentWidth - 20; // Leave a bit of margin
            const aspectRatio = paddedCanvas.width / paddedCanvas.height;
            
            // Start with width constraint
            let imgWidth = maxImgWidth;
            let imgHeight = imgWidth / aspectRatio;
            
            // If height is still too large, constrain by height
            if (imgHeight > maxHeightForTwoStepsPerPage) {
              imgHeight = maxHeightForTwoStepsPerPage;
              imgWidth = imgHeight * aspectRatio;
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
            
            // Add caption under image
            pdf.setFont("helvetica", "italic");
            pdf.setFontSize(8);
            pdf.setTextColor(160, 160, 160);
            const caption = `Step ${stepIndex + 1} Screenshot`;
            const captionWidth = pdf.getStringUnitWidth(caption) * 8 / pdf.internal.scaleFactor;
            pdf.text(
              caption,
              (width - captionWidth) / 2,
              currentY + imgHeight + 5
            );
            
            currentY += imgHeight + 15;
          }
          resolve();
        };
      });
    }
  } catch (e) {
    console.error("Error adding screenshot to PDF", e);
    currentY += 10;
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
    
    // Ensure all callouts are circles with glow effect
    const radius = Math.max(width, height) / 2;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    // Draw glow effect first (outer shadow)
    ctx.shadowColor = callout.color;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw thick border with completely transparent fill
    ctx.strokeStyle = callout.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Reset shadow for any subsequent drawing
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  });
}
