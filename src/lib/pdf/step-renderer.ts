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
  let currentY = margin.top + 8;
  
  // Steps title with Apple-inspired styling (more compact)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(44, 44, 46);
  pdf.text("Steps", margin.left, currentY);
  
  // Add thin accent divider below title
  pdf.setDrawColor(0, 122, 255);
  pdf.setLineWidth(0.5);
  pdf.line(margin.left, currentY + 5, margin.left + 35, currentY + 5);
  
  currentY += 15;
  
  // Track pages for better step placement
  let currentPage = 1;
  let stepsOnCurrentPage = 0;
  
  // Process each step with proper formatting
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    
    // Calculate available space on current page
    const remainingSpace = height - currentY - margin.bottom;
    
    // Calculate the space needed for this step
    const stepContentHeight = calculateStepHeight(pdf, step, contentWidth);
    
    // Special handling for first page - only one step
    const isFirstPage = currentPage === 1;
    
    // Check if we need a new page for this step
    // First page: Keep just one step per page
    // Subsequent pages: Try to fit multiple steps per page when possible
    if ((isFirstPage && stepsOnCurrentPage >= 1) || 
        (!isFirstPage && remainingSpace < stepContentHeight) ||
        (!isFirstPage && stepsOnCurrentPage >= 2)) { // Max 2 steps per page after first page
      
      pdf.addPage();
      addContentPageDesign(pdf, width, height, margin);
      currentY = margin.top + 8;
      currentPage++;
      stepsOnCurrentPage = 0;
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
        isFirstPage // Pass flag to control screenshot sizing based on page
      );
    } else {
      // If no screenshot, just add some spacing after the description
      currentY = descriptionY + 8;
    }
    
    // Add minimal spacing between steps
    currentY += 8;
    stepsOnCurrentPage++;
  }
}

// Helper function to calculate the total height a step will take on the page
function calculateStepHeight(pdf: any, step: SopStep, contentWidth: number): number {
  // Start with the basic height of the step number and description
  let totalHeight = 25; // Base height for step number and description
  
  // Add height for screenshot(s) if present
  if (step.screenshot) {
    // Calculate more optimized image height based on aspect ratio
    // Use 16:9 aspect ratio as base (since we're cropping to that)
    const estimatedImgWidth = contentWidth * 0.65; // Reduced size
    const estimatedImgHeight = estimatedImgWidth * (9/16); // Using 16:9 aspect ratio
      
    totalHeight += estimatedImgHeight + 12; // Image height plus minimal spacing
    
    // Add height for second image if present
    if (step.screenshot.secondaryDataUrl) {
      totalHeight += estimatedImgHeight + 5; // Add height for second image with minimal spacing
    }
  }
  
  return totalHeight;
}
