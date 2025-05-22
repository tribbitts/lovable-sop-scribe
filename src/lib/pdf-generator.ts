
import { jsPDF } from "jspdf";
import { SopDocument } from "@/types/sop";
import { generatePdfFilename, registerInterFont } from "@/lib/pdf/utils";
import { addCoverPage } from "@/lib/pdf/cover-page";
import { addContentPageDesign, addPageFooters } from "@/lib/pdf/content-page";
import { renderSteps } from "@/lib/pdf/step-renderer";

export async function generatePDF(sopDocument: SopDocument): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Starting PDF generation process");
      
      // Create a new PDF with optimal settings
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
        putOnlyUsedFonts: true, 
        floatPrecision: "smart"
      });

      // Try to register custom fonts but fallback gracefully to system fonts
      try {
        await registerInterFont(pdf);
        console.log("Custom fonts registered successfully");
      } catch (error) {
        console.error("Using system fonts instead of custom fonts due to error:", error);
        // Explicitly set a system font to ensure we have a font to use
        pdf.setFont("helvetica", "normal");
      }
      
      // Get PDF dimensions
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      
      // Adjust margins for better layout
      const margin = {
        top: 25,
        right: 20,
        bottom: 25,
        left: 20
      };
      
      // Calculate content width
      const contentWidth = width - (margin.left + margin.right);
      
      // Set background image if available
      if (sopDocument.backgroundImage) {
        try {
          // Store the background image for use in content pages
          pdf.backgroundImage = sopDocument.backgroundImage;
          console.log("Background image stored for PDF pages");
        } catch (bgError) {
          console.error("Error storing background image:", bgError);
        }
      }
      
      console.log("Creating cover page");
      
      try {
        // Create elegant cover page with error handling
        await addCoverPage(pdf, sopDocument, width, height, margin);
        console.log("Cover page created successfully");
        
        // Add new page for steps content
        pdf.addPage();
        addContentPageDesign(pdf, width, height, margin);
        
        console.log(`Rendering ${sopDocument.steps.length} steps`);
        
        // Render all steps with consistent styling
        await renderSteps(
          pdf, 
          sopDocument.steps, 
          width, 
          height, 
          margin, 
          contentWidth,
          addContentPageDesign
        );
        
        console.log("Steps rendered successfully");
        
        // Add single consistent footer on each page
        addPageFooters(pdf, sopDocument, width, height, margin);
        
        // Generate base64 string for preview
        const pdfBase64 = pdf.output('datauristring');
        
        // Save the PDF with a standardized filename
        const filename = generatePdfFilename(sopDocument);
        console.log(`Saving PDF as: ${filename}`);
        
        // Use high quality settings for better output
        const options = {
          quality: 0.98,
          compression: 'FAST'
        };
        
        try {
          pdf.save(filename);
          console.log("PDF saved successfully");
          resolve(pdfBase64);
        } catch (saveError) {
          console.error("Error saving PDF:", saveError);
          // Even if saving fails, try to return the base64 for preview
          resolve(pdfBase64);
        }
      } catch (error) {
        console.error("Error in PDF creation process:", error);
        reject(error);
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      reject(error);
    }
  });
}
