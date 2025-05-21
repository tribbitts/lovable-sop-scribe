
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

      // Register custom fonts
      await registerInterFont(pdf);
      
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
        // Use a custom property to store the background image
        // @ts-ignore - Add custom property to pdf object
        pdf.backgroundImage = sopDocument.backgroundImage;
      }
      
      console.log("Creating cover page");
      
      // Create elegant cover page
      addCoverPage(pdf, sopDocument, width, height, margin)
        .then(() => {
          console.log("Cover page created successfully");
          
          // Add new page for steps content
          pdf.addPage();
          addContentPageDesign(pdf, width, height, margin);
          
          console.log(`Rendering ${sopDocument.steps.length} steps`);
          
          // Render all steps with consistent styling
          return renderSteps(
            pdf, 
            sopDocument.steps, 
            width, 
            height, 
            margin, 
            contentWidth,
            addContentPageDesign
          );
        })
        .then(() => {
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
          
          pdf.save(filename);
          console.log("PDF saved successfully");
          
          resolve(pdfBase64);
        })
        .catch((error) => {
          console.error("PDF generation error:", error);
          reject(error);
        });
        
    } catch (error) {
      console.error("PDF generation error:", error);
      reject(error);
    }
  });
}
