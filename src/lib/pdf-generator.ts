
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
  // Create a new PDF with better initial settings
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  
  // Get PDF dimensions
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  
  // Set better margins (Apple-inspired spacious design)
  const margin = {
    top: 30,
    right: 25,
    bottom: 30,
    left: 25
  };
  
  // Calculate content width
  const contentWidth = width - (margin.left + margin.right);
  
  // Helper function for text wrapping
  function addWrappedText(text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + lineHeight * lines.length;
  }
  
  // Add decorative background elements (Apple-inspired)
  function addCoverPageDesign() {
    // Subtle background shapes
    // Light circle in top right
    pdf.setFillColor(245, 245, 247); // Very light blue-gray
    pdf.circle(width - margin.right - 40, margin.top + 20, 80, 'F');
    
    // Light rectangle along bottom
    pdf.setFillColor(245, 245, 247); // Very light blue-gray
    pdf.rect(margin.left - 5, height - margin.bottom - 40, width - margin.left - margin.right + 10, 50, 'F');
    
    // Add thin accent divider
    pdf.setDrawColor(0, 122, 255); // Apple Blue
    pdf.setLineWidth(0.5);
    pdf.line(margin.left + 40, margin.top + 90, width - margin.right - 40, margin.top + 90);
  }
  
  // Add cover page design
  function addContentPageDesign() {
    // Subtle background elements
    // Light circle in bottom left
    pdf.setFillColor(245, 245, 247); // Very light gray
    pdf.circle(margin.left, height - margin.bottom, 60, 'F');
    
    // Light accent bar at top
    pdf.setFillColor(245, 245, 247); // Very light blue-gray
    pdf.rect(margin.left - 5, margin.top - 10, width - margin.left - margin.right + 10, 20, 'F');
  }
  
  // Create cover page
  addCoverPageDesign();
  
  // Center-aligned title (large and bold)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.setTextColor(40, 40, 40); // Dark charcoal
  
  const title = sopDocument.title;
  const titleWidth = pdf.getStringUnitWidth(title) * 24 / pdf.internal.scaleFactor;
  pdf.text(title, (width - titleWidth) / 2, height / 3);
  
  // Subtitle with topic and date
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(60, 60, 60); // Medium gray
  
  const subtitle = `Topic: ${sopDocument.topic} · ${sopDocument.date}`;
  const subtitleWidth = pdf.getStringUnitWidth(subtitle) * 12 / pdf.internal.scaleFactor;
  pdf.text(subtitle, (width - subtitleWidth) / 2, height / 3 + 15);
  
  // Add logo to cover page if available
  if (sopDocument.logo) {
    try {
      // Compress and center the logo
      const compressedLogoUrl = await compressImage(sopDocument.logo, 0.8);
      
      // Make the logo larger and centered at the top
      const logoSize = 40; // Larger size
      
      // Center horizontally
      const logoX = (width - logoSize) / 2;
      
      pdf.addImage(
        compressedLogoUrl, 
        "JPEG", 
        logoX,
        height / 4 - logoSize,
        logoSize, 
        logoSize
      );
    } catch(e) {
      console.error("Error adding logo to cover page", e);
    }
  }
  
  // Add footer to cover page
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150); // Light gray
  
  const footerText = `For internal use only | © 2025 | ${sopDocument.companyName}`;
  const footerWidth = pdf.getStringUnitWidth(footerText) * 8 / pdf.internal.scaleFactor;
  pdf.text(
    footerText,
    (width - footerWidth) / 2,
    height - 20
  );
  
  // Add new page for steps content
  pdf.addPage();
  addContentPageDesign();
  
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
  for (let i = 0; i < sopDocument.steps.length; i++) {
    const step = sopDocument.steps[i];
    
    // Check if we need a new page
    if (currentY > height - margin.bottom - 80) {
      pdf.addPage();
      addContentPageDesign();
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
    
    // Add the screenshot with improved styling
    if (step.screenshot) {
      try {
        // Compress and prepare the screenshot image
        const compressedImageUrl = await compressImage(step.screenshot.dataUrl, 0.7);
        
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
                
                // Add subtle drop shadow effect (visually, not with PDF setGlobalAlpha)
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
                const caption = `Step ${i + 1} Screenshot`;
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
    }
    
    // Add more space between steps
    currentY += 15;
    
    // Check if we need a new page for the next step
    if (i < sopDocument.steps.length - 1 && currentY > height - margin.bottom - 60) {
      pdf.addPage();
      addContentPageDesign();
      currentY = margin.top + 20;
    }
  }
  
  // Add stylized footers on each page
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(161, 161, 166); // Apple light gray
    
    // Left side: For internal use only
    pdf.text(
      "For internal use only",
      margin.left,
      height - 15
    );
    
    if (i > 1) { // Don't show page numbers on cover
      // Right side: Page number
      const pageText = `Page ${i} of ${pageCount}`;
      pdf.text(
        pageText,
        width - margin.right - (pdf.getStringUnitWidth(pageText) * 8 / pdf.internal.scaleFactor),
        height - 15
      );
    }
    
    // Center: Company name
    const companyText = sopDocument.companyName;
    const companyTextWidth = pdf.getStringUnitWidth(companyText) * 8 / pdf.internal.scaleFactor;
    pdf.text(
      companyText,
      (width - companyTextWidth) / 2,
      height - 15
    );
  }
  
  // Save with better filename format
  const filename = `${sopDocument.title.replace(/\s+/g, '_')}_SOP_${sopDocument.date.replace(/-/g, '')}.pdf`;
  pdf.save(filename);
}
