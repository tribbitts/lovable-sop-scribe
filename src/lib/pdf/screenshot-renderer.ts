
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
    const compressedImageUrl = await compressImage(step.screenshot!.dataUrl, 0.7);
    
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
            // Fill the background with light gray (border color)
            paddedCtx.fillStyle = '#F2F2F7'; // Light background border (Apple light gray)
            paddedCtx.fillRect(0, 0, paddedWidth, paddedHeight);
            
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
            const imgData = paddedCanvas.toDataURL('image/jpeg', 0.8);
            
            // Calculate image dimensions to fit within margins while preserving aspect ratio
            const maxImgWidth = contentWidth - 20; // Leave a bit of margin
            const imgWidth = Math.min(maxImgWidth, paddedCanvas.width * 0.5);
            const imgHeight = (paddedCanvas.height * imgWidth) / paddedCanvas.width;
            
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
    
    ctx.strokeStyle = callout.color;
    ctx.lineWidth = 3;
    // Make the fill semi-transparent using rgba directly
    ctx.fillStyle = callout.color.replace(')', ', 0.2)').replace('rgb', 'rgba');
    
    if (callout.shape === "circle") {
      const radius = Math.max(width, height) / 2;
      ctx.beginPath();
      ctx.ellipse(
        x + width / 2,
        y + height / 2,
        radius,
        radius,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.fill();
      ctx.stroke();
    }
  });
}
