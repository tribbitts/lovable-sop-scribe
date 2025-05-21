
import { SopStep } from "@/types/sop";
import { addScreenshot } from "./screenshot-renderer";
import { styleStep } from "./step-styler";

export async function renderSteps(
  pdf: any, 
  steps: SopStep[], 
  width: number, 
  height: number, 
  margin: any, 
  contentWidth: number,
  addContentPageDesign: Function
) {
  // Reset any image tracking information
  pdf.stepImages = [];
  
  // Start with proper spacing from the top
  let currentY = margin.top + 10;
  
  // Steps title with Apple-inspired styling
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16); // Reduced from 18pt
  pdf.setTextColor(44, 44, 46); // Apple dark gray
  pdf.text("Steps", margin.left, currentY);
  
  // Add thin accent divider below title
  pdf.setDrawColor(0, 122, 255); // Apple Blue (#007AFF)
  pdf.setLineWidth(0.5);
  pdf.line(margin.left, currentY + 6, margin.left + 40, currentY + 6);
  
  currentY += 20; // Reduced spacing before the first step
  
  // Process each step with proper formatting
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    
    // Calculate the space needed for this step
    const stepContentHeight = calculateStepHeight(pdf, step, contentWidth);
    
    // Check if we need a new page for this step
    // Ensure the entire step (including screenshot) will fit on the page
    if (currentY + stepContentHeight > height - margin.bottom - 20) {
      pdf.addPage();
      addContentPageDesign(pdf, width, height, margin);
      currentY = margin.top + 10; // Start with less spacing on continuation pages
    }
    
    // Style the step (number, description, separator)
    const descriptionY = styleStep(pdf, step, i, currentY, margin, width);
    
    // Add the screenshot if available (on the same page)
    if (step.screenshot) {
      currentY = await addScreenshot(
        pdf, 
        step, 
        descriptionY, 
        margin, 
        contentWidth, 
        width, 
        height, 
        i, 
        addContentPageDesign
      );
    } else {
      // If no screenshot, just add some spacing after the description
      currentY = descriptionY + 10; // Reduced spacing
    }
    
    // Add less spacing between steps to fit more on a page
    currentY += 10; // Reduced from 15
  }
}

// Helper function to calculate the total height a step will take on the page
function calculateStepHeight(pdf: any, step: SopStep, contentWidth: number): number {
  // Start with the basic height of the step number and description
  let totalHeight = 35; // Reduced from 45 - Base height for step number, description and spacing
  
  // Add height for screenshot(s) if present
  if (step.screenshot) {
    // Calculate more optimized image height based on aspect ratio
    const estimatedImgHeight = step.screenshot.secondaryDataUrl 
      ? contentWidth * 0.6  // Two images - slightly reduced height
      : contentWidth * 0.4; // Single image - more reduced height
      
    totalHeight += estimatedImgHeight + 20; // Reduced spacing around the image
  }
  
  return totalHeight;
}
