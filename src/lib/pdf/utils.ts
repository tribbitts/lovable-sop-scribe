
import { SopDocument } from "@/types/sop";

// Helper function to compress images before adding to PDF
// Reduced quality to improve performance, and reduced max dimension
export function compressImage(dataUrl: string, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions while maintaining aspect ratio
      // Using a more conservative max width
      const maxWidth = 600; 
      const scaleFactor = maxWidth / Math.max(1, img.width);
      canvas.width = Math.min(maxWidth, img.width);
      canvas.height = img.height * scaleFactor;
      
      if (ctx) {
        // Apply image smoothing for better quality at reduced size
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        try {
          // Convert to compressed JPEG with better quality
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (err) {
          console.error("Error compressing image:", err);
          // If compression fails, return original
          resolve(dataUrl);
        }
      } else {
        // If can't compress, use the original
        resolve(dataUrl); 
      }
    };
    
    // Add error handling for image loading
    img.onerror = () => {
      console.error("Error loading image for compression");
      // Return original if we can't process it
      resolve(dataUrl);
    };
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
