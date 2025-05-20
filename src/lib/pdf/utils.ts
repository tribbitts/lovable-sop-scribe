
import { SopDocument } from "@/types/sop";

// Helper function to compress images before adding to PDF
// Further reduced quality and dimensions to improve performance
export function compressImage(dataUrl: string, quality = 0.5): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl) {
      console.error("Empty dataUrl provided to compressImage");
      resolve("");
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    // Set up error handling first
    img.onerror = (e) => {
      console.error("Error loading image for compression:", e);
      // Return original if we can't process it
      resolve(dataUrl);
    };
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.error("Couldn't get 2d context for image compression");
          resolve(dataUrl);
          return;
        }
        
        // Calculate new dimensions while maintaining aspect ratio
        // Using a more conservative max width
        const maxWidth = 500; // Further reduced for performance
        const scaleFactor = maxWidth / Math.max(1, img.width);
        canvas.width = Math.min(maxWidth, img.width);
        canvas.height = img.height * scaleFactor;
        
        // Apply image smoothing for better quality at reduced size
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium'; // Changed to medium for better performance
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to compressed JPEG with reduced quality
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (err) {
        console.error("Error compressing image:", err);
        // If compression fails, return original
        resolve(dataUrl);
      }
    };
    
    // Start loading the image
    img.src = dataUrl;
  });
}

// Generate a standardized filename based on document properties
export function generatePdfFilename(sopDocument: SopDocument): string {
  let title = sopDocument.title || "Untitled";
  // Sanitize filename to avoid special characters
  title = title.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
  return `${title}_SOP_${sopDocument.date.replace(/-/g, '')}.pdf`;
}

// Helper function for text wrapping
export function addWrappedText(pdf: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  // Handle empty or undefined text
  if (!text) {
    return y;
  }
  
  try {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + lineHeight * lines.length;
  } catch (error) {
    console.error("Error in text wrapping:", error);
    // Try a basic fallback
    try {
      pdf.text(text, x, y);
    } catch (e) {
      console.error("Failed to render text:", e);
    }
    return y + lineHeight;
  }
}
