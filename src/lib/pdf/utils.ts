
import { SopDocument } from "@/types/sop";

// Helper function to compress images before adding to PDF
export function compressImage(dataUrl: string, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions while maintaining aspect ratio
      // Limiting to a reasonable size for PDFs
      const maxWidth = 1200;
      const scaleFactor = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scaleFactor;
      
      if (ctx) {
        // Apply image smoothing for better quality at reduced size
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to compressed JPEG instead of PNG
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl); // Fallback to original if context is not available
      }
    };
  });
}

// Generate a standardized filename based on document properties
export function generatePdfFilename(sopDocument: SopDocument): string {
  return `${sopDocument.title.replace(/\s+/g, '_')}_SOP_${sopDocument.date.replace(/-/g, '')}.pdf`;
}

// Helper function for text wrapping
export function addWrappedText(pdf: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const lines = pdf.splitTextToSize(text, maxWidth);
  pdf.text(lines, x, y);
  return y + lineHeight * lines.length;
}
