import { SopStep } from "@/types/sop";
import { addScreenshot } from "./screenshot-placement";
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
  let currentY = margin.top + 8; // Reduced from 10 to 8
  
  // Steps title with Apple-inspired styling (more compact)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14); // Reduced from 16pt to 14pt
  pdf.setTextColor(44, 44, 46); // Apple dark gray
  pdf.text("Steps", margin.left, currentY);
  
  // Add thin accent divider below title
  pdf.setDrawColor(0, 122, 255); // Apple Blue (#007AFF)
  pdf.setLineWidth(0.5);
  pdf.line(margin.left, currentY + 5, margin.left + 35, currentY + 5);
  
  currentY += 15; // Reduced spacing before the first step
  
  // Track pages for better step placement
  let currentPage = 1;
  
  // Process each step with proper formatting
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    
    // Calculate the space needed for this step
    const stepContentHeight = calculateStepHeight(pdf, step, contentWidth);
    
    // Optimize step placement based on page number
    const isFirstOrSecondPage = currentPage <= 2;
    
    // Check if we need a new page for this step
    // First and second pages: Keep one step per page
    // Subsequent pages: Try to fit two steps per page when possible
    if (currentY + stepContentHeight > height - margin.bottom - 15) {
      pdf.addPage();
      addContentPageDesign(pdf, width, height, margin);
      currentY = margin.top + 8; // Start with less spacing on continuation pages
      currentPage++;
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
        addContentPageDesign,
        isFirstOrSecondPage // Pass flag to control screenshot sizing based on page
      );
    } else {
      // If no screenshot, just add some spacing after the description
      currentY = descriptionY + 8; // Reduced spacing
    }
    
    // Add minimal spacing between steps
    currentY += 8; // Reduced from 10 to 8
  }
}

// Helper function to calculate the total height a step will take on the page
function calculateStepHeight(pdf: any, step: SopStep, contentWidth: number): number {
  // Start with the basic height of the step number and description
  let totalHeight = 25; // Reduced from 35 - Base height for step number, description and spacing
  
  // Add height for screenshot(s) if present
  if (step.screenshot) {
    // Calculate more optimized image height based on aspect ratio and page
    const estimatedImgHeight = step.screenshot.secondaryDataUrl 
      ? contentWidth * 0.5  // Two images - more reduced height
      : contentWidth * 0.3; // Single image - even more reduced height
      
    totalHeight += estimatedImgHeight + 15; // Reduced spacing around the image
  }
  
  return totalHeight;
}
