import { SopDocument } from "@/types/sop";
import { jsPDF } from 'jspdf';

// Helper function to compress images before adding to PDF
// Higher quality settings for better readability
export function compressImage(dataUrl: string, quality = 0.92): Promise<string> {
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
        // Using a higher max width for better quality
        const maxWidth = 1600; // Increased for better quality
        const scaleFactor = maxWidth / Math.max(1, img.width);
        canvas.width = Math.min(maxWidth, img.width);
        canvas.height = img.height * scaleFactor;
        
        // Apply image smoothing for better quality at reduced size
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high'; // High quality
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to compressed JPEG with higher quality
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

// Improved helper function for text wrapping
export function addWrappedText(pdf: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  // Handle empty or undefined text
  if (!text) {
    return y;
  }
  
  try {
    // Split text into lines that fit within maxWidth
    const lines = pdf.splitTextToSize(text, maxWidth);
    
    // Draw each line at the correct position
    for (let i = 0; i < lines.length; i++) {
      pdf.text(lines[i], x, y + (i * lineHeight));
    }
    
    // Return the Y position after the text block
    return y + (lineHeight * lines.length);
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

async function fetchFontAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch font ${url}: ${response.statusText}`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve((reader.result as string).split(',')[1]); // Get Base64 part
      } else {
        reject(new Error('File reading resulted in null.'));
      }
    };
    reader.onerror = (error) => reject(new Error(`FileReader error: ${error.target?.error?.message || 'unknown error'}`));
    reader.readAsDataURL(blob);
  });
}

export async function registerInterFont(pdf: jsPDF) {
  try {
    console.log("Attempting to register Inter font...");
    const interRegularBase64 = await fetchFontAsBase64('/fonts/Inter-Regular.ttf');
    const interBoldBase64 = await fetchFontAsBase64('/fonts/Inter-Bold.ttf');

    pdf.addFileToVFS('Inter-Regular.ttf', interRegularBase64);
    pdf.addFont('Inter-Regular.ttf', 'Inter', 'normal');

    pdf.addFileToVFS('Inter-Bold.ttf', interBoldBase64);
    pdf.addFont('Inter-Bold.ttf', 'Inter', 'bold');

    console.log("Inter font registered successfully.");
  } catch (error) {
    console.error("Failed to load or register Inter font:", error);
    console.warn("Falling back to Helvetica due to font loading error. Ensure Inter-Regular.ttf and Inter-Bold.ttf are in the public/fonts/ directory.");
  }
}
