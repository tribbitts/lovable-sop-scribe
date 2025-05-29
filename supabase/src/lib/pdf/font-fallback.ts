import { jsPDF } from 'jspdf';

// Alternative font registration that doesn't rely on network requests
export async function registerInterFontFallback(pdf: jsPDF) {
  try {
    console.log("Using fallback font registration method...");
    
    // Check if fonts are already registered
    try {
      const fontList = pdf.getFontList();
      if (fontList['Inter'] && fontList['Inter'].indexOf('normal') >= 0) {
        console.log("Inter font already registered, skipping fallback registration");
        return;
      }
    } catch (e) {
      console.warn("Could not check font list, proceeding with fallback registration");
    }
    
    // For now, we'll skip custom font loading and use system fonts
    // This ensures the PDF generation doesn't fail due to font issues
    console.log("Using system fonts (Helvetica) as fallback");
    pdf.setFont("helvetica", "normal");
    
  } catch (error) {
    console.error("Fallback font registration failed:", error);
    // Even if this fails, we can still generate PDFs with default fonts
    console.warn("Proceeding with default jsPDF fonts");
  }
}

// Helper function to set font with fallback
export function setFontWithFallback(pdf: jsPDF, family: string, style: string) {
  try {
    // Try to use Inter font first
    pdf.setFont("Inter", style);
  } catch (error) {
    // Fall back to Helvetica
    const fallbackFamily = family === "Inter" ? "helvetica" : "helvetica";
    const fallbackStyle = style === "semibold" ? "bold" : style;
    pdf.setFont(fallbackFamily, fallbackStyle);
  }
} 