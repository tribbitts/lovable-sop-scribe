
import { SopDocument } from "@/types/sop";
import { jsPDF } from 'jspdf';

// Helper function to compress images before adding to PDF
// Higher quality settings for better readability
export function compressImage(dataUrl: string, quality = 0.92): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!dataUrl) {
      const error = new Error("Empty dataUrl provided to compressImage");
      console.error(error);
      reject(error);
      return;
    }

    // Validate data URL format
    if (!dataUrl.startsWith('data:')) {
      const error = new Error("Invalid data URL format in compressImage");
      console.error(error);
      reject(error);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    // Set up error handling first
    img.onerror = (e) => {
      const error = new Error("Error loading image for compression");
      console.error(error, e);
      // Return original if we can't process it
      resolve(dataUrl);
    };
    
    img.onload = () => {
      try {
        // Check if image dimensions are valid
        if (img.width <= 0 || img.height <= 0) {
          console.error("Invalid image dimensions:", img.width, img.height);
          resolve(dataUrl);
          return;
        }
        
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
        
        try {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } catch (drawError) {
          console.error("Error drawing image to canvas:", drawError);
          resolve(dataUrl);
          return;
        }
        
        // Convert to compressed JPEG with higher quality
        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (encodingError) {
          console.error("Error encoding compressed image:", encodingError);
          resolve(dataUrl);
        }
      } catch (err) {
        console.error("Error compressing image:", err);
        // If compression fails, return original
        resolve(dataUrl);
      }
    };
    
    // Start loading the image
    try {
      img.src = dataUrl;
    } catch (srcError) {
      console.error("Error setting image source:", srcError);
      resolve(dataUrl);
    }
  });
}

// Generate a standardized filename based on document properties
export function generatePdfFilename(sopDocument: SopDocument): string {
  try {
    let title = sopDocument.title || "Untitled";
    // Sanitize filename to avoid special characters
    title = title.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
    return `${title}_SOP_${sopDocument.date.replace(/-/g, '')}.pdf`;
  } catch (error) {
    console.error("Error generating PDF filename:", error);
    return `SOP_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`;
  }
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
  try {
    console.log(`Fetching font from: ${url}`);
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
  } catch (error) {
    console.error(`Error fetching font: ${url}`, error);
    throw error;
  }
}

export async function registerInterFont(pdf: jsPDF) {
  try {
    console.log("Attempting to register Inter font...");
    
    // Check if fonts are already registered to avoid duplicate registration
    try {
      const fontList = pdf.getFontList();
      if (fontList['Inter'] && fontList['Inter'].indexOf('normal') >= 0) {
        console.log("Inter font already registered, skipping registration");
        return;
      }
    } catch (e) {
      console.warn("Could not check font list, proceeding with registration");
    }
    
    const interRegularBase64 = await fetchFontAsBase64('/fonts/Inter-Regular.ttf');
    const interBoldBase64 = await fetchFontAsBase64('/fonts/Inter-Bold.ttf');

    pdf.addFileToVFS('Inter-Regular.ttf', interRegularBase64);
    pdf.addFont('Inter-Regular.ttf', 'Inter', 'normal');

    pdf.addFileToVFS('Inter-Bold.ttf', interBoldBase64);
    pdf.addFont('Inter-Bold.ttf', 'Inter', 'bold');

    console.log("Inter font registered successfully.");
  } catch (error) {
    console.error("Failed to load or register Inter font:", error);
    console.warn("Falling back to Helvetica. This won't affect functionality but may change appearance.");
    // Don't throw error - let the PDF generation continue with system fonts
  }
}
