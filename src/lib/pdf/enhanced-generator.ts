import { jsPDF } from "jspdf";
import { SopDocument } from "@/types/sop";
import { PdfTheme, pdfThemes, getCustomTheme } from "./enhanced-themes";
import { initializePdfFonts, setFontSafe, getStringWidthSafe } from "./font-handler";
import { addCoverPage } from "./cover-page";
import { addContentPageDesign, addPageFooters } from "./content-page";
import { renderSteps } from "./step-renderer";

export interface EnhancedPdfOptions {
  theme?: string;
  customColors?: { primary?: string; secondary?: string };
  includeTableOfContents?: boolean;
  includeProgressInfo?: boolean;
  quality?: "low" | "medium" | "high";
  branding?: {
    companyColors?: {
      primary: string;
      secondary: string;
    };
  };
}

export async function generateEnhancedPDF(
  sopDocument: SopDocument,
  options: EnhancedPdfOptions = {}
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Starting enhanced PDF generation with beautiful demo theme");
      
      // Create PDF with enhanced settings
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm", 
        format: "a4",
        compress: true,
        putOnlyUsedFonts: true,
        floatPrecision: "smart"
      });

      // Initialize fonts with proper error handling
      const fontsInitialized = initializePdfFonts(pdf);
      if (!fontsInitialized) {
        console.warn("Font initialization failed, proceeding with defaults");
      }

      // PDF dimensions
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      const margin = { top: 28, right: 22, bottom: 28, left: 22 };

      // Use beautiful demo theme colors
      const theme = {
        primary: options.branding?.companyColors?.primary || '#007AFF',
        secondary: options.branding?.companyColors?.secondary || '#5856D6',
        success: '#34C759',
        warning: '#FF9500',
        background: '#f8f9fa',
        text: '#333333',
        lightGray: '#e0e0e0',
        darkGray: '#666666'
      };

      // Create beautiful cover page matching demo design
      await addBeautifulCoverPage(pdf, sopDocument, width, height, margin, theme);

      // Add table of contents if requested
      if (options.includeTableOfContents && sopDocument.steps.length > 0) {
        pdf.addPage();
        await addBeautifulTableOfContents(pdf, sopDocument, width, height, margin, theme);
      }

      // Add content pages with beautiful styling
      pdf.addPage();
      await renderBeautifulSteps(pdf, sopDocument, width, height, margin, theme);

      // Add beautiful footers
      addBeautifulFooters(pdf, sopDocument, width, height, margin, theme);

      const pdfBase64 = pdf.output('datauristring');
      
      console.log("Enhanced PDF generated with beautiful demo theme");
      resolve(pdfBase64);
    } catch (error) {
      console.error("Enhanced PDF generation error:", error);
      reject(error);
    }
  });
}

async function addBeautifulCoverPage(
  pdf: any,
  sopDocument: SopDocument,
  width: number,
  height: number,
  margin: any,
  theme: any
) {
  // Beautiful gradient background effect (simulated with rectangles)
  const gradientSteps = 20;
  for (let i = 0; i < gradientSteps; i++) {
    const alpha = i / gradientSteps;
    const r = Math.round(0 + (88 - 0) * alpha); // 007AFF to 5856D6
    const g = Math.round(122 + (86 - 122) * alpha);
    const b = Math.round(255 + (214 - 255) * alpha);
    
    pdf.setFillColor(r, g, b);
    pdf.rect(0, i * (height / gradientSteps), width, height / gradientSteps, 'F');
  }

  // Company name with beautiful styling
  setFontSafe(pdf, "helvetica", "bold");
  pdf.setFontSize(24);
  pdf.setTextColor(255, 255, 255);
  
  const companyName = sopDocument.companyName || "Your Company";
  const companyWidth = getStringWidthSafe(pdf, companyName, 24);
  pdf.text(companyName, (width - companyWidth) / 2, margin.top + 40);

  // Main title with stunning typography
  setFontSafe(pdf, "helvetica", "bold");
  pdf.setFontSize(32);
  pdf.setTextColor(255, 255, 255);
  
  const title = sopDocument.title || "Standard Operating Procedure";
  const titleLines = pdf.splitTextToSize(title, width - margin.left - margin.right);
  let titleY = margin.top + 80;
  
  titleLines.forEach((line: string) => {
    const lineWidth = getStringWidthSafe(pdf, line, 32);
    pdf.text(line, (width - lineWidth) / 2, titleY);
    titleY += 12;
  });

  // Subtitle with elegant styling
  if (sopDocument.topic) {
    setFontSafe(pdf, "helvetica", "normal");
    pdf.setFontSize(18);
    pdf.setTextColor(255, 255, 255);
    pdf.setGState(new pdf.GState({opacity: 0.9}));
    
    const subtitleWidth = getStringWidthSafe(pdf, sopDocument.topic, 18);
    pdf.text(sopDocument.topic, (width - subtitleWidth) / 2, titleY + 20);
  }

  // Beautiful badge design
  const badgeY = titleY + 50;
  const badgeText = "🚀 SOPify Business - Professional Features";
  const badgeWidth = 120;
  const badgeHeight = 12;
  
  // Badge background with rounded corners effect
  pdf.setFillColor(255, 255, 255);
  pdf.setGState(new pdf.GState({opacity: 0.2}));
  pdf.roundedRect((width - badgeWidth) / 2, badgeY - 6, badgeWidth, badgeHeight, 6, 6, 'F');
  
  // Badge text
  pdf.setGState(new pdf.GState({opacity: 1}));
  setFontSafe(pdf, "helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  const badgeTextWidth = getStringWidthSafe(pdf, badgeText, 10);
  pdf.text(badgeText, (width - badgeTextWidth) / 2, badgeY);

  // Meta information box with beautiful design
  const metaY = height - 80;
  const metaBoxHeight = 40;
  
  // Meta box background
  pdf.setFillColor(255, 255, 255);
  pdf.setGState(new pdf.GState({opacity: 0.95}));
  pdf.roundedRect(margin.left, metaY, width - margin.left - margin.right, metaBoxHeight, 8, 8, 'F');
  
  // Meta box border
  pdf.setDrawColor(224, 224, 224);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(margin.left, metaY, width - margin.left - margin.right, metaBoxHeight, 8, 8, 'S');
  
  // Meta information text
  pdf.setGState(new pdf.GState({opacity: 1}));
  setFontSafe(pdf, "helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(51, 51, 51);
  
  const metaInfo = [
    `Version: 1.0`,
    `Date: ${sopDocument.date || new Date().toLocaleDateString()}`,
    `Author: ${sopDocument.companyName || 'SOPify User'}`,
    `Steps: ${sopDocument.steps.length}`
  ];
  
  let metaX = margin.left + 10;
  metaInfo.forEach((info, index) => {
    if (index === 2) { // New line after second item
      metaX = margin.left + 10;
      pdf.text(info, metaX, metaY + 20);
    } else if (index === 3) {
      metaX += getStringWidthSafe(pdf, metaInfo[2], 10) + 20;
      pdf.text(info, metaX, metaY + 20);
    } else {
      pdf.text(info, metaX, metaY + 10);
      metaX += getStringWidthSafe(pdf, info, 10) + 20;
    }
  });
}

async function addBeautifulTableOfContents(
  pdf: any,
  sopDocument: SopDocument,
  width: number,
  height: number,
  margin: any,
  theme: any
) {
  // Beautiful page background
  pdf.setFillColor(248, 249, 250);
  pdf.rect(0, 0, width, height, 'F');
  
  // Stunning header with gradient effect
  const headerHeight = 25;
  for (let i = 0; i < 10; i++) {
    const alpha = i / 10;
    const r = Math.round(0 + (88 - 0) * alpha);
    const g = Math.round(122 + (86 - 122) * alpha);
    const b = Math.round(255 + (214 - 255) * alpha);
    
    pdf.setFillColor(r, g, b);
    pdf.rect(0, i * (headerHeight / 10), width, headerHeight / 10, 'F');
  }
  
  // Table of Contents title
  setFontSafe(pdf, "helvetica", "bold");
  pdf.setFontSize(28);
  pdf.setTextColor(255, 255, 255);
  pdf.text("Table of Contents", margin.left, margin.top + 18);
  
  // Subtitle
  setFontSafe(pdf, "helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(255, 255, 255);
  pdf.setGState(new pdf.GState({opacity: 0.9}));
  const subtitle = `${sopDocument.steps.length} Step${sopDocument.steps.length !== 1 ? 's' : ''} • ${sopDocument.topic || 'Standard Operating Procedure'}`;
  pdf.text(subtitle, margin.left, margin.top + 35);
  
  pdf.setGState(new pdf.GState({opacity: 1}));
  
  let currentY = margin.top + 60;
  
  // Beautiful step entries
  sopDocument.steps.forEach((step, index) => {
    const stepNumber = index + 1;
    const stepTitle = step.title || `Step ${stepNumber}`;
    const pageNumber = stepNumber + 2;
    
    // Check if we need a new page
    if (currentY > height - margin.bottom - 40) {
      pdf.addPage();
      pdf.setFillColor(248, 249, 250);
      pdf.rect(0, 0, width, height, 'F');
      currentY = margin.top + 30;
    }
    
    const itemHeight = 20;
    const cardPadding = 8;
    
    // Beautiful card design with subtle shadow effect
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin.left + 1, currentY - cardPadding + 1, width - margin.left - margin.right, itemHeight, 6, 6, 'F');
    
    pdf.setFillColor(250, 250, 250);
    pdf.roundedRect(margin.left, currentY - cardPadding, width - margin.left - margin.right, itemHeight, 6, 6, 'F');
    
    // Elegant border
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin.left, currentY - cardPadding, width - margin.left - margin.right, itemHeight, 6, 6, 'S');
    
    // Beautiful step number with gradient effect
    const circleX = margin.left + 15;
    const circleY = currentY + 2;
    const circleRadius = 8;
    
    // Gradient circle effect
    pdf.setFillColor(0, 122, 255);
    pdf.circle(circleX, circleY, circleRadius, "F");
    pdf.setFillColor(88, 86, 214);
    pdf.circle(circleX + 1, circleY - 1, circleRadius * 0.7, "F");
    
    // Step number text
    setFontSafe(pdf, "helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    
    const numberStr = String(stepNumber);
    const numberWidth = getStringWidthSafe(pdf, numberStr, 10);
    pdf.text(numberStr, circleX - (numberWidth / 2), circleY + 2);
    
    // Beautiful step title
    setFontSafe(pdf, "helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(44, 62, 80);
    
    const titleX = circleX + circleRadius + 10;
    
    let displayTitle = stepTitle;
    const maxTitleLength = 60;
    if (stepTitle.length > maxTitleLength) {
      displayTitle = stepTitle.substring(0, maxTitleLength - 3) + "...";
    }
    
    pdf.text(displayTitle, titleX, currentY + 3);
    
    // Elegant page number
    setFontSafe(pdf, "helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    
    const pageNumText = String(pageNumber);
    const pageNumWidth = getStringWidthSafe(pdf, pageNumText, 10);
    const pageNumX = width - margin.right - 15;
    
    pdf.text(pageNumText, pageNumX - (pageNumWidth / 2), currentY + 3);
    
    // Elegant connecting dots
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    const lineStartX = titleX + getStringWidthSafe(pdf, displayTitle, 11) + 8;
    const lineEndX = pageNumX - 20;
    if (lineEndX > lineStartX) {
      // Dotted line effect
      for (let x = lineStartX; x < lineEndX; x += 3) {
        pdf.circle(x, circleY, 0.3, "F");
      }
    }
    
    currentY += itemHeight + 6;
  });
}

async function renderBeautifulSteps(
  pdf: any,
  sopDocument: SopDocument,
  width: number,
  height: number,
  margin: any,
  theme: any
) {
  const { steps } = sopDocument;
  let currentY = margin.top;
  
  steps.forEach((step, index) => {
    const stepNumber = index + 1;
    
    // Check if we need a new page
    if (currentY > height - margin.bottom - 100) {
      pdf.addPage();
      pdf.setFillColor(248, 249, 250);
      pdf.rect(0, 0, width, height, 'F');
      currentY = margin.top;
    }
    
    // Beautiful step header with gradient
    const headerHeight = 25;
    for (let i = 0; i < 10; i++) {
      const alpha = i / 10;
      const r = Math.round(0 + (88 - 0) * alpha);
      const g = Math.round(122 + (86 - 122) * alpha);
      const b = Math.round(255 + (214 - 255) * alpha);
      
      pdf.setFillColor(r, g, b);
      pdf.roundedRect(margin.left, currentY + i * (headerHeight / 10), width - margin.left - margin.right, headerHeight / 10, i === 0 ? 6 : 0, i === 0 ? 6 : 0, 'F');
    }
    
    // Step number and title
    setFontSafe(pdf, "helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(255, 255, 255);
    pdf.setGState(new pdf.GState({opacity: 0.9}));
    pdf.text(`Step ${stepNumber}`, margin.left + 10, currentY + 8);
    
    pdf.setGState(new pdf.GState({opacity: 1}));
    setFontSafe(pdf, "helvetica", "bold");
    pdf.setFontSize(24);
    pdf.setTextColor(255, 255, 255);
    const stepTitle = step.title || `Step ${stepNumber}`;
    pdf.text(stepTitle, margin.left + 10, currentY + 18);
    
    currentY += headerHeight;
    
    // Beautiful content box
    const contentHeight = 60; // Adjust based on content
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin.left, currentY, width - margin.left - margin.right, contentHeight, 0, 0, 'F');
    pdf.roundedRect(margin.left, currentY, width - margin.left - margin.right, contentHeight, 6, 6, 'F');
    
    // Content border
    pdf.setDrawColor(224, 224, 224);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin.left, currentY, width - margin.left - margin.right, contentHeight, 6, 6, 'S');
    
    // Step description
    if (step.description) {
      setFontSafe(pdf, "helvetica", "normal");
      pdf.setFontSize(16);
      pdf.setTextColor(255, 255, 255);
      pdf.setGState(new pdf.GState({opacity: 0.9}));
      
      // Add description to header area
      const descLines = pdf.splitTextToSize(step.description, width - margin.left - margin.right - 20);
      let descY = currentY - 15;
      descLines.slice(0, 2).forEach((line: string) => { // Limit to 2 lines
        pdf.text(line, margin.left + 10, descY);
        descY += 6;
      });
    }
    
    pdf.setGState(new pdf.GState({opacity: 1}));
    
    // Content text
    setFontSafe(pdf, "helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(51, 51, 51);
    
    let contentY = currentY + 10;
    
    // Add detailed instructions if available
    if (step.detailedInstructions) {
      const cleanInstructions = step.detailedInstructions.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      const instructionLines = pdf.splitTextToSize(cleanInstructions, width - margin.left - margin.right - 20);
      
      instructionLines.slice(0, 4).forEach((line: string) => { // Limit lines to fit
        pdf.text(line, margin.left + 10, contentY);
        contentY += 5;
      });
    }
    
    // Beautiful key takeaway box
    if (step.keyTakeaway) {
      contentY += 5;
      const takeawayHeight = 15;
      
      // Gradient background for takeaway
      for (let i = 0; i < 5; i++) {
        const alpha = i / 5;
        const r = Math.round(232 + (240 - 232) * alpha);
        const g = Math.round(245 + (248 - 245) * alpha);
        const b = Math.round(232 + (240 - 232) * alpha);
        
        pdf.setFillColor(r, g, b);
        pdf.rect(margin.left + 10, contentY + i * (takeawayHeight / 5), width - margin.left - margin.right - 20, takeawayHeight / 5, 'F');
      }
      
      // Green accent border
      pdf.setDrawColor(52, 199, 89);
      pdf.setLineWidth(2);
      pdf.line(margin.left + 10, contentY, margin.left + 10, contentY + takeawayHeight);
      
      // Takeaway text
      setFontSafe(pdf, "helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(46, 125, 50);
      pdf.text("🎯 Key Takeaway", margin.left + 15, contentY + 5);
      
      setFontSafe(pdf, "helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(51, 51, 51);
      const takeawayLines = pdf.splitTextToSize(step.keyTakeaway, width - margin.left - margin.right - 30);
      takeawayLines.slice(0, 2).forEach((line: string, lineIndex: number) => {
        pdf.text(line, margin.left + 15, contentY + 10 + (lineIndex * 4));
      });
      
      contentY += takeawayHeight;
    }
    
    // Tags with beautiful styling
    if (step.tags && step.tags.length > 0) {
      contentY += 8;
      let tagX = margin.left + 10;
      
      step.tags.slice(0, 4).forEach((tag: string) => { // Limit tags
        const tagWidth = getStringWidthSafe(pdf, tag, 8) + 8;
        
        // Beautiful tag background
        pdf.setFillColor(0, 122, 255);
        pdf.roundedRect(tagX, contentY - 3, tagWidth, 6, 3, 3, 'F');
        
        // Tag text
        setFontSafe(pdf, "helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.text(tag, tagX + 4, contentY + 1);
        
        tagX += tagWidth + 5;
      });
      
      contentY += 8;
    }
    
    currentY += contentHeight + 15;
  });
}

function addBeautifulFooters(
  pdf: any,
  sopDocument: SopDocument,
  width: number,
  height: number,
  margin: any,
  theme: any
) {
  const totalPages = pdf.internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Beautiful footer line
    pdf.setDrawColor(0, 122, 255);
    pdf.setLineWidth(1);
    pdf.line(margin.left, height - margin.bottom + 5, width - margin.right, height - margin.bottom + 5);
    
    // Footer text
    setFontSafe(pdf, "helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(102, 102, 102);
    
    // Left side - document info
    const leftText = `${sopDocument.title || 'SOP'} • Generated by SOPify Business`;
    pdf.text(leftText, margin.left, height - margin.bottom + 12);
    
    // Right side - page number
    const rightText = `Page ${i} of ${totalPages}`;
    const rightTextWidth = getStringWidthSafe(pdf, rightText, 9);
    pdf.text(rightText, width - margin.right - rightTextWidth, height - margin.bottom + 12);
  }
}
