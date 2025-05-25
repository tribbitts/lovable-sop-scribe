
/**
 * Enhanced font handling with proper fallbacks for jsPDF
 */

/**
 * Set font with proper fallback handling
 */
export function setFontSafe(pdf: any, family: string = "helvetica", style: string = "normal") {
  try {
    // Map common font requests to available jsPDF fonts
    const fontMap: { [key: string]: string } = {
      "Inter": "helvetica",
      "inter": "helvetica",
      "Arial": "helvetica",
      "arial": "helvetica"
    };
    
    const styleMap: { [key: string]: string } = {
      "semibold": "bold",
      "medium": "normal",
      "regular": "normal"
    };
    
    const mappedFamily = fontMap[family] || family;
    const mappedStyle = styleMap[style] || style;
    
    // Validate that the font combination exists
    const availableFonts = pdf.getFontList();
    if (availableFonts[mappedFamily] && availableFonts[mappedFamily].includes(mappedStyle)) {
      pdf.setFont(mappedFamily, mappedStyle);
    } else {
      // Fallback to guaranteed helvetica
      pdf.setFont("helvetica", mappedStyle === "bold" ? "bold" : "normal");
    }
    
    return true;
  } catch (error) {
    console.warn("Font setting failed, using helvetica fallback:", error);
    try {
      pdf.setFont("helvetica", "normal");
      return true;
    } catch (fallbackError) {
      console.error("Even helvetica fallback failed:", fallbackError);
      return false;
    }
  }
}

/**
 * Get string width with proper error handling
 */
export function getStringWidthSafe(pdf: any, text: string, fontSize: number): number {
  try {
    return pdf.getStringUnitWidth(text) * fontSize / pdf.internal.scaleFactor;
  } catch (error) {
    console.warn("String width calculation failed, using estimate:", error);
    // Fallback calculation based on average character width
    return text.length * (fontSize * 0.6);
  }
}

/**
 * Initialize PDF with safe font settings
 */
export function initializePdfFonts(pdf: any): boolean {
  try {
    // Set default font to helvetica
    pdf.setFont("helvetica", "normal");
    console.log("PDF fonts initialized with helvetica");
    return true;
  } catch (error) {
    console.error("Failed to initialize PDF fonts:", error);
    return false;
  }
}
