
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
