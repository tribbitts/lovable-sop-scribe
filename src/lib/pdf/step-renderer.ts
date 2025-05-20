
import { SopStep } from "@/types/sop";
import { compressImage } from "./utils";

export async function renderSteps(
  pdf: any, 
  steps: SopStep[], 
  width: number, 
  height: number, 
  margin: any, 
  contentWidth: number,
  addContentPageDesign: Function
) {
  // Steps title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(44, 44, 46); // Charcoal gray
  pdf.text("Steps", margin.left, margin.top + 15);
  
  // Add thin accent divider below title
  pdf.setDrawColor(0, 122, 255); // Apple Blue
  pdf.setLineWidth(0.5);
  pdf.line(margin.left, margin.top + 20, margin.left + 30, margin.top + 20);
  
  let currentY = margin.top + 40;
  
  // Steps content with better formatting
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    
    // Check if we need a new page
    if (currentY > height - margin.bottom - 80) {
      pdf.addPage();
      addContentPageDesign(pdf, width, height, margin);
      currentY = margin.top + 20;
    }
    
    // Add stylized step number (Apple-inspired)
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 122, 255); // Apple Blue
    pdf.setFontSize(18);
    
    // Format step number with leading zero for single digits
    const stepNumber = (i + 1).toString().padStart(2, '0');
    pdf.text(stepNumber, margin.left, currentY);
    
    // Step title/description
    pdf.setFont("helvetica", "semibold");
    pdf.setFontSize(14);
    pdf.setTextColor(44, 44, 46); // Dark gray
    
    // Add step description with indent
    pdf.text(step.description, margin.left + 15, currentY);
    currentY += 10;
    
    // Add a light gray separator line
    pdf.setDrawColor(230, 230, 230);
    pdf.setLineWidth(0.2);
    pdf.line(margin.left, currentY, width - margin.right, currentY);
    currentY += 10;
    
    // Add the screenshot if available
    if (step.screenshot) {
      currentY = await addScreenshot(pdf, step, currentY, margin, contentWidth, width, height, i, addContentPageDesign);
    }
    
    // Add more space between steps
    currentY += 15;
    
    // Check if we need a new page for the next step
    if (i < steps.length - 1 && currentY > height - margin.bottom - 60) {
      pdf.addPage();
      addContentPageDesign(pdf, width, height, margin);
      currentY = margin.top + 20;
    }
  }
}

async function addScreenshot(
  pdf: any, 
  step: SopStep, 
  currentY: number, 
  margin: any, 
  contentWidth: number, 
  width: number, 
  height: number, 
  stepIndex: number,
  addContentPageDesign: Function
) {
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
            step.screenshot?.callouts.forEach(callout => {
              // Convert percentage positions to pixel positions
              const x = (callout.x / 100) * canvas.width + paddingSize;
              const y = (callout.y / 100) * canvas.height + paddingSize;
              const width = (callout.width / 100) * canvas.width;
              const height = (callout.height / 100) * canvas.height;
              
              paddedCtx.strokeStyle = callout.color;
              paddedCtx.lineWidth = 3;
              // Make the fill semi-transparent using rgba directly
              paddedCtx.fillStyle = callout.color.replace(')', ', 0.2)').replace('rgb', 'rgba');
              
              if (callout.shape === "circle") {
                const radius = Math.max(width, height) / 2;
                paddedCtx.beginPath();
                paddedCtx.ellipse(
                  x + width / 2,
                  y + height / 2,
                  radius,
                  radius,
                  0,
                  0,
                  2 * Math.PI
                );
                paddedCtx.fill();
                paddedCtx.stroke();
              } else {
                paddedCtx.beginPath();
                paddedCtx.rect(x, y, width, height);
                paddedCtx.fill();
                paddedCtx.stroke();
              }
            });
            
            // Use the padded canvas with rounded corners for PDF
            const imgData = paddedCanvas.toDataURL('image/jpeg', 0.8);
            
            // Calculate image dimensions to fit within margins while preserving aspect ratio
            const maxImgWidth = contentWidth - 20; // Leave a bit of margin
            const imgWidth = Math.min(maxImgWidth, paddedCanvas.width * 0.5);
            const imgHeight = (paddedCanvas.height * imgWidth) / paddedCanvas.width;
            
            // Add subtle drop shadow effect
            pdf.setDrawColor(220, 220, 220);
            pdf.setFillColor(240, 240, 240);
            pdf.roundedRect(
              margin.left + 10 + 2, 
              currentY + 2, 
              imgWidth, 
              imgHeight, 
              3, 
              3, 
              'F'
            );
            
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
