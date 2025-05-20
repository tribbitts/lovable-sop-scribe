
import { jsPDF } from "jspdf";
import { SopDocument, SopStep } from "../types/sop";
import html2canvas from "html2canvas";

// Helper function to compress images before adding to PDF
function compressImage(dataUrl: string, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions while maintaining aspect ratio
      // Limiting to a reasonable size for PDFs
      const maxWidth = 1200;
      const scaleFactor = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scaleFactor;
      
      if (ctx) {
        // Apply image smoothing for better quality at reduced size
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to compressed JPEG instead of PNG
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl); // Fallback to original if context is not available
      }
    };
  });
}

export async function generatePDF(sopDocument: SopDocument): Promise<void> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = width - margin * 2;
  
  // Helper function to add text with word wrapping
  function addWrappedText(text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + lineHeight * lines.length;
  }
  
  // Add decorative background (Apple-inspired)
  function addBackgroundDesign() {
    // Gradient background effect
    const gradColors = {
      light: [240, 240, 245],  // Light blue-gray
      accent: [220, 220, 230],  // Medium blue-gray
    };
    
    // Add subtle rounded rectangle in the background
    pdf.setFillColor(gradColors.accent[0], gradColors.accent[1], gradColors.accent[2]);
    pdf.roundedRect(margin - 5, margin - 5, width - (margin * 2) + 10, 40, 5, 5, 'F');
    
    // Add subtle accent circle in bottom left
    pdf.setGlobalAlpha(0.1); // Make it subtle
    pdf.setFillColor(180, 180, 195);
    pdf.circle(margin, height - margin, 40, 'F');
    pdf.setGlobalAlpha(1); // Reset alpha
    
    // Add thin decorative line at the bottom
    pdf.setDrawColor(200, 200, 210);
    pdf.setLineWidth(0.5);
    pdf.line(margin, height - margin * 2, width - margin, height - margin * 2);
  }
  
  // Add background design to the first page
  addBackgroundDesign();
  
  // Header section
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  const titleY = margin + 10;
  pdf.text(sopDocument.title, margin, titleY);
  
  // Topic and Date (reposition below title)
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  const topicY = titleY + 8;
  pdf.text(`Topic: ${sopDocument.topic}`, margin, topicY);
  
  pdf.setFontSize(10);
  pdf.text(`Date: ${sopDocument.date}`, margin, topicY + 6);
  
  // Logo (positioned in upper right corner, larger size)
  if (sopDocument.logo) {
    try {
      const logoSize = 20; // Larger size
      pdf.addImage(
        sopDocument.logo, 
        "PNG", 
        width - margin - logoSize, 
        margin - 5, 
        logoSize, 
        logoSize
      );
    } catch(e) {
      console.error("Error adding logo to PDF", e);
    }
  }
  
  // Draw a light gray line below the header
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, topicY + 15, width - margin, topicY + 15);
  
  // Steps title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  let currentY = topicY + 25;
  pdf.text("Steps", margin, currentY);
  currentY += 10;
  
  // Steps content
  for (let i = 0; i < sopDocument.steps.length; i++) {
    const step = sopDocument.steps[i];
    
    // Check if we need a new page
    if (currentY > height - margin - 60) {
      pdf.addPage();
      addBackgroundDesign(); // Add background to new page
      currentY = margin + 10;
    }
    
    // Step number and description
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(`${i + 1}. ${step.description}`, margin, currentY);
    currentY += 8;
    
    // Add the screenshot with callouts if available
    if (step.screenshot) {
      try {
        // Compress and prepare the screenshot image
        const compressedImageUrl = await compressImage(step.screenshot.dataUrl);
        
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
              const paddingSize = 10; // Padding between image and border
              
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
                paddedCtx.fillStyle = '#EAEAEA';
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
                  paddedCtx.fillStyle = `${callout.color}20`;
                  
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
                
                const imgWidth = Math.min(contentWidth, paddedCanvas.width * 0.4);
                const imgHeight = (paddedCanvas.height * imgWidth) / paddedCanvas.width;
                
                // Add image with drop shadow effect
                pdf.setDrawColor(200, 200, 200);
                pdf.setFillColor(240, 240, 240);
                pdf.roundedRect(margin + 1.5, currentY + 1.5, imgWidth, imgHeight, 2, 2, 'F');
                pdf.addImage(imgData, 'JPEG', margin, currentY, imgWidth, imgHeight);
                
                currentY += imgHeight + 10;
              }
              resolve();
            };
          });
        }
      } catch (e) {
        console.error("Error adding screenshot to PDF", e);
        currentY += 10;
      }
    }
    
    // Add some space before the next step
    currentY += 10;
    
    // Check if we need a new page for the next step
    if (i < sopDocument.steps.length - 1 && currentY > height - margin - 40) {
      pdf.addPage();
      addBackgroundDesign(); // Add background to new page
      currentY = margin + 10;
    }
  }
  
  // Add the footer on each page
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    
    const footerText = `For internal use only | © 2025 | ${sopDocument.companyName}`;
    const footerWidth = pdf.getStringUnitWidth(footerText) * 8 / pdf.internal.scaleFactor;
    pdf.text(
      footerText,
      (width - footerWidth) / 2,
      height - margin / 2
    );
  }
  
  // Save the PDF
  pdf.save(`${sopDocument.title.replace(/\s+/g, '_')}_SOP.pdf`);
}
