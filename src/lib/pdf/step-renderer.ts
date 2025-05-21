
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
  pdf.setFontSize(18);
  pdf.setTextColor(44, 44, 46); // Apple dark gray
  pdf.text("Steps", margin.left, currentY);
  
  // Add thin accent divider below title
  pdf.setDrawColor(0, 122, 255); // Apple Blue (#007AFF)
  pdf.setLineWidth(0.5);
  pdf.line(margin.left, currentY + 6, margin.left + 40, currentY + 6);
  
  currentY += 25; // Add proper spacing before the first step
  
  // Process each step with proper formatting
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    
    // Check if we need a new page
    if (currentY > height - margin.bottom - 60) {
      pdf.addPage();
      addContentPageDesign(pdf, width, height, margin);
      currentY = margin.top;
    }
    
    // Style the step (number, description, separator)
    currentY = styleStep(pdf, step, i, currentY, margin, width);
    
    // Add the screenshot if available
    if (step.screenshot) {
      currentY = await addScreenshot(
        pdf, 
        step, 
        currentY, 
        margin, 
        contentWidth, 
        width, 
        height, 
        i, 
        addContentPageDesign
      );
    }
    
    // Add consistent spacing between steps
    currentY += 15;
    
    // Check if we need a new page for the next step
    if (i < steps.length - 1 && currentY > height - margin.bottom - 60) {
      pdf.addPage();
      addContentPageDesign(pdf, width, height, margin);
      currentY = margin.top;
    }
  }
}
