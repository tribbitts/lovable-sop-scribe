
import { jsPDF } from "jspdf";
import { SopDocument } from "@/types/sop";
import { PdfTheme, pdfThemes, getCustomTheme } from "./enhanced-themes";
import { registerInterFont } from "./utils";

export interface EnhancedPdfOptions {
  theme?: string;
  customColors?: { primary?: string; secondary?: string };
  includeTableOfContents?: boolean;
  includeProgressInfo?: boolean;
  quality?: "low" | "medium" | "high";
}

export async function generateEnhancedPDF(
  sopDocument: SopDocument,
  options: EnhancedPdfOptions = {}
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Starting enhanced PDF generation");
      
      // Create PDF with enhanced settings
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm", 
        format: "a4",
        compress: true,
        putOnlyUsedFonts: true,
        floatPrecision: "smart"
      });

      // Register fonts
      try {
        await registerInterFont(pdf);
      } catch (error) {
        console.warn("Using system fonts:", error);
        pdf.setFont("helvetica", "normal");
      }

      // Get theme
      const theme = options.customColors 
        ? getCustomTheme(options.customColors)
        : pdfThemes[options.theme || 'professional'];

      // PDF dimensions
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      const margin = { top: 25, right: 20, bottom: 25, left: 20 };

      // Generate enhanced cover page
      await addEnhancedCoverPage(pdf, sopDocument, theme, width, height, margin);

      // Add table of contents if requested
      if (options.includeTableOfContents && sopDocument.steps.length > 0) {
        pdf.addPage();
        await addEnhancedTableOfContents(pdf, sopDocument, theme, width, height, margin);
      }

      // Add content pages
      pdf.addPage();
      await renderEnhancedSteps(pdf, sopDocument, theme, width, height, margin, options.quality || 'high');

      // Add enhanced footers
      addEnhancedFooters(pdf, sopDocument, theme, width, height, margin);

      const pdfBase64 = pdf.output('datauristring');
      
      // Save with enhanced filename
      const filename = `${sopDocument.title || 'Training-Manual'}.pdf`;
      pdf.save(filename);
      
      resolve(pdfBase64);
    } catch (error) {
      console.error("Enhanced PDF generation error:", error);
      reject(error);
    }
  });
}

async function addEnhancedCoverPage(
  pdf: any,
  sopDocument: SopDocument,
  theme: PdfTheme,
  width: number,
  height: number,
  margin: any
) {
  // Enhanced cover page with modern design
  
  // Background gradient effect
  pdf.setFillColor(theme.colors.background);
  pdf.rect(0, 0, width, height, 'F');
  
  // Header accent bar
  pdf.setFillColor(theme.colors.primary);
  pdf.rect(0, 0, width, 8, 'F');
  
  // Company logo if available
  if (sopDocument.logo) {
    try {
      const logoSize = 25;
      pdf.addImage(sopDocument.logo, 'JPEG', margin.left, margin.top, logoSize, logoSize);
    } catch (error) {
      console.warn("Logo rendering failed:", error);
    }
  }
  
  // Title section with enhanced typography
  const titleY = height * 0.35;
  
  pdf.setFont("Inter", "bold");
  pdf.setFontSize(32);
  pdf.setTextColor(theme.colors.text);
  
  const title = sopDocument.title || "Training Manual";
  const titleLines = pdf.splitTextToSize(title, width - margin.left - margin.right);
  pdf.text(titleLines, margin.left, titleY);
  
  // Subtitle/Topic
  if (sopDocument.topic) {
    pdf.setFont("Inter", "normal");
    pdf.setFontSize(18);
    pdf.setTextColor(theme.colors.textLight);
    pdf.text(sopDocument.topic, margin.left, titleY + 15);
  }
  
  // Description if available
  if (sopDocument.description) {
    const descY = titleY + (sopDocument.topic ? 35 : 25);
    pdf.setFont("Inter", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor(theme.colors.textLight);
    const descLines = pdf.splitTextToSize(sopDocument.description, width - margin.left - margin.right - 40);
    pdf.text(descLines, margin.left, descY);
  }
  
  // Stats section
  const statsY = height * 0.7;
  pdf.setFillColor(theme.colors.primary, 0.1);
  pdf.roundedRect(margin.left, statsY, width - margin.left - margin.right, 40, 8, 8, 'F');
  
  pdf.setFont("Inter", "semibold");
  pdf.setFontSize(14);
  pdf.setTextColor(theme.colors.text);
  pdf.text("Training Overview", margin.left + 10, statsY + 12);
  
  pdf.setFont("Inter", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(theme.colors.textLight);
  pdf.text(`${sopDocument.steps.length} Learning Steps`, margin.left + 10, statsY + 22);
  
  if (sopDocument.companyName) {
    pdf.text(`Organization: ${sopDocument.companyName}`, margin.left + 10, statsY + 30);
  }
  
  // Footer
  pdf.setFont("Inter", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(theme.colors.textLight);
  const date = sopDocument.date || new Date().toLocaleDateString();
  pdf.text(`Created: ${date}`, margin.left, height - margin.bottom + 5);
}

async function addEnhancedTableOfContents(
  pdf: any,
  sopDocument: SopDocument,
  theme: PdfTheme,
  width: number,
  height: number,
  margin: any
) {
  // Enhanced TOC design
  pdf.setFont("Inter", "bold");
  pdf.setFontSize(24);
  pdf.setTextColor(theme.colors.text);
  pdf.text("Table of Contents", margin.left, margin.top + 15);
  
  // Decorative line
  pdf.setDrawColor(theme.colors.primary);
  pdf.setLineWidth(3);
  pdf.line(margin.left, margin.top + 22, margin.left + 60, margin.top + 22);
  
  let currentY = margin.top + 45;
  
  sopDocument.steps.forEach((step, index) => {
    if (currentY > height - margin.bottom - 20) {
      pdf.addPage();
      currentY = margin.top + 20;
    }
    
    const stepNumber = index + 1;
    const stepTitle = step.title || `Step ${stepNumber}`;
    const pageNumber = stepNumber + 2;
    
    // Step item with modern styling
    const itemHeight = 12;
    
    // Step number circle
    pdf.setFillColor(theme.colors.primary);
    pdf.circle(margin.left + 6, currentY + 2, 4, "F");
    
    pdf.setFont("Inter", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.text(String(stepNumber), margin.left + 4, currentY + 3.5);
    
    // Step title
    pdf.setFont("Inter", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(theme.colors.text);
    pdf.text(stepTitle, margin.left + 15, currentY + 4);
    
    // Page number
    pdf.setFont("Inter", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(theme.colors.textLight);
    pdf.text(String(pageNumber), width - margin.right - 10, currentY + 4);
    
    // Connecting dots
    pdf.setTextColor(theme.colors.border);
    const dotsStart = margin.left + 15 + pdf.getStringUnitWidth(stepTitle) * 11 / pdf.internal.scaleFactor + 5;
    const dotsEnd = width - margin.right - 15;
    
    if (dotsEnd > dotsStart) {
      const dotCount = Math.floor((dotsEnd - dotsStart) / 3);
      for (let i = 0; i < dotCount; i++) {
        pdf.text(".", dotsStart + (i * 3), currentY + 4);
      }
    }
    
    currentY += itemHeight;
  });
}

async function renderEnhancedSteps(
  pdf: any,
  sopDocument: SopDocument,
  theme: PdfTheme,
  width: number,
  height: number,
  margin: any,
  quality: string
) {
  // Enhanced step rendering with better visual hierarchy
  let currentY = margin.top + 20;
  
  sopDocument.steps.forEach((step, index) => {
    // Check if we need a new page
    if (currentY > height - margin.bottom - 60) {
      pdf.addPage();
      currentY = margin.top + 20;
    }
    
    const stepNumber = index + 1;
    
    // Step header with enhanced design
    const headerHeight = 25;
    
    // Header background
    pdf.setFillColor(theme.colors.primary, 0.1);
    pdf.roundedRect(margin.left, currentY, width - margin.left - margin.right, headerHeight, theme.borderRadius, theme.borderRadius, 'F');
    
    // Step number badge
    pdf.setFillColor(theme.colors.primary);
    pdf.circle(margin.left + 15, currentY + 12, 8, "F");
    
    pdf.setFont("Inter", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.text(String(stepNumber), margin.left + 12, currentY + 14);
    
    // Step title
    pdf.setFont("Inter", "semibold");
    pdf.setFontSize(16);
    pdf.setTextColor(theme.colors.text);
    const title = step.title || `Step ${stepNumber}`;
    pdf.text(title, margin.left + 30, currentY + 14);
    
    currentY += headerHeight + theme.spacing.medium;
    
    // Step description
    if (step.description) {
      pdf.setFont("Inter", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(theme.colors.text);
      const descLines = pdf.splitTextToSize(step.description, width - margin.left - margin.right - 20);
      pdf.text(descLines, margin.left + 10, currentY);
      currentY += (descLines.length * 5) + theme.spacing.small;
    }
    
    // Screenshot handling with enhanced styling
    if (step.screenshots && step.screenshots.length > 0) {
      step.screenshots.forEach((screenshot, screenshotIndex) => {
        if (currentY > height - margin.bottom - 80) {
          pdf.addPage();
          currentY = margin.top + 20;
        }
        
        try {
          const imgWidth = Math.min(120, width - margin.left - margin.right - 20);
          const imgHeight = imgWidth * 0.75; // Maintain aspect ratio
          
          // Screenshot border/shadow effect
          pdf.setFillColor(0, 0, 0, 0.1);
          pdf.roundedRect(margin.left + 12, currentY + 2, imgWidth, imgHeight, 4, 4, 'F');
          
          pdf.addImage(screenshot.dataUrl, 'JPEG', margin.left + 10, currentY, imgWidth, imgHeight);
          
          // Screenshot caption
          if (screenshot.title) {
            pdf.setFont("Inter", "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(theme.colors.textLight);
            pdf.text(screenshot.title, margin.left + 10, currentY + imgHeight + 8);
          }
          
          currentY += imgHeight + theme.spacing.large;
        } catch (error) {
          console.warn("Screenshot rendering failed:", error);
        }
      });
    } else if (step.screenshot) {
      // Legacy single screenshot support
      if (currentY > height - margin.bottom - 80) {
        pdf.addPage();
        currentY = margin.top + 20;
      }
      
      try {
        const imgWidth = Math.min(120, width - margin.left - margin.right - 20);
        const imgHeight = imgWidth * 0.75;
        
        pdf.setFillColor(0, 0, 0, 0.1);
        pdf.roundedRect(margin.left + 12, currentY + 2, imgWidth, imgHeight, 4, 4, 'F');
        
        pdf.addImage(step.screenshot.dataUrl, 'JPEG', margin.left + 10, currentY, imgWidth, imgHeight);
        currentY += imgHeight + theme.spacing.large;
      } catch (error) {
        console.warn("Screenshot rendering failed:", error);
      }
    }
    
    // Additional step content
    if (step.detailedInstructions) {
      pdf.setFont("Inter", "semibold");
      pdf.setFontSize(11);
      pdf.setTextColor(theme.colors.text);
      pdf.text("Detailed Instructions:", margin.left + 10, currentY);
      currentY += 8;
      
      pdf.setFont("Inter", "normal");
      pdf.setFontSize(10);
      const instructionLines = pdf.splitTextToSize(step.detailedInstructions, width - margin.left - margin.right - 20);
      pdf.text(instructionLines, margin.left + 10, currentY);
      currentY += (instructionLines.length * 4) + theme.spacing.small;
    }
    
    if (step.notes) {
      pdf.setFont("Inter", "semibold"); 
      pdf.setFontSize(11);
      pdf.setTextColor(theme.colors.text);
      pdf.text("Notes:", margin.left + 10, currentY);
      currentY += 8;
      
      pdf.setFont("Inter", "normal");
      pdf.setFontSize(10);
      const noteLines = pdf.splitTextToSize(step.notes, width - margin.left - margin.right - 20);
      pdf.text(noteLines, margin.left + 10, currentY);
      currentY += (noteLines.length * 4) + theme.spacing.medium;
    }
    
    // Step separator
    currentY += theme.spacing.large;
  });
}

function addEnhancedFooters(
  pdf: any,
  sopDocument: SopDocument,
  theme: PdfTheme,
  width: number,
  height: number,
  margin: any
) {
  const totalPages = pdf.internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Footer line
    pdf.setDrawColor(theme.colors.border);
    pdf.setLineWidth(0.5);
    pdf.line(margin.left, height - margin.bottom + 5, width - margin.right, height - margin.bottom + 5);
    
    // Footer text
    pdf.setFont("Inter", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(theme.colors.textLight);
    
    // Left side - document title
    const title = sopDocument.title || "Training Manual";
    pdf.text(title, margin.left, height - margin.bottom + 12);
    
    // Right side - page number
    pdf.text(`Page ${i} of ${totalPages}`, width - margin.right - 20, height - margin.bottom + 12);
    
    // Center - company name if available
    if (sopDocument.companyName) {
      const centerX = width / 2;
      const textWidth = pdf.getStringUnitWidth(sopDocument.companyName) * 8 / pdf.internal.scaleFactor;
      pdf.text(sopDocument.companyName, centerX - textWidth / 2, height - margin.bottom + 12);
    }
  }
}
