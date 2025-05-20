import { jsPDF } from "jspdf";
import { SopDocument, SopStep } from "../types/sop";
import html2canvas from "html2canvas";

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
  
  // Header section
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  const titleY = margin + 10;
  pdf.text(sopDocument.title, margin, titleY);
  
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  const topicY = titleY + 8;
  pdf.text(`Topic: ${sopDocument.topic}`, margin, topicY);
  
  // Logo (positioned in upper right corner)
  if (sopDocument.logo) {
    try {
      const logoSize = 15;
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
  
  // Date (right-aligned, smaller font, positioned below the logo)
  pdf.setFontSize(10);
  pdf.text(sopDocument.date, width - margin - 25, margin + 15);
  
  // Draw a light gray line below the header
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, topicY + 10, width - margin, topicY + 10);
  
  // Steps title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  let currentY = topicY + 20;
  pdf.text("Steps", margin, currentY);
  currentY += 10;
  
  // Steps content
  for (let i = 0; i < sopDocument.steps.length; i++) {
    const step = sopDocument.steps[i];
    
    // Check if we need a new page
    if (currentY > height - margin - 60) {
      pdf.addPage();
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
        // Create a canvas element to render the screenshot with callouts
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Create image element to load the screenshot
          const img = new Image();
          img.src = step.screenshot.dataUrl;
          
          await new Promise<void>((resolve) => {
            img.onload = () => {
              // Set canvas dimensions to match the image
              canvas.width = img.width;
              canvas.height = img.height;
              
              // Draw the image
              ctx.drawImage(img, 0, 0);
              
              // Draw the callouts
              step.screenshot?.callouts.forEach(callout => {
                // Convert percentage positions to pixel positions
                const x = (callout.x / 100) * canvas.width;
                const y = (callout.y / 100) * canvas.height;
                const width = (callout.width / 100) * canvas.width;
                const height = (callout.height / 100) * canvas.height;
                
                ctx.strokeStyle = callout.color;
                ctx.lineWidth = 3;
                ctx.fillStyle = `${callout.color}20`;
                
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
              
              resolve();
            };
          });
          
          // Add the rendered canvas to the PDF with a drop shadow effect
          const imgData = canvas.toDataURL('image/png');
          
          const imgWidth = Math.min(contentWidth, canvas.width * 0.5);
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add image with slight offset for shadow effect
          pdf.setFillColor(200, 200, 200);
          pdf.roundedRect(margin + 1, currentY + 1, imgWidth, imgHeight, 1, 1, 'F');
          pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
          
          currentY += imgHeight + 10;
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
