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

      // Detect healthcare template and apply appropriate theme
      const healthcareTheme = detectHealthcareTheme(sopDocument);
      const theme = getEnhancedTheme(sopDocument, options, healthcareTheme);

      // Filter out ITM-only content before rendering
      const filteredDocument = filterItmOnlyContent(sopDocument);

      // Create beautiful cover page matching demo design
      await addBeautifulCoverPage(pdf, filteredDocument, width, height, margin, theme);

      // Add table of contents if requested
      if (options.includeTableOfContents && filteredDocument.steps.length > 0) {
        pdf.addPage();
        await addBeautifulTableOfContents(pdf, filteredDocument, width, height, margin, theme);
      }

      // Add content pages with beautiful styling and enhanced SOP features
      pdf.addPage();
      await renderEnhancedSopSteps(pdf, filteredDocument, width, height, margin, theme);

      // Add beautiful footers
      addBeautifulFooters(pdf, filteredDocument, width, height, margin, theme);

      const pdfBase64 = pdf.output('datauristring');
      
      console.log("Enhanced PDF generated with beautiful demo theme and SOP enhancements");
      resolve(pdfBase64);
    } catch (error) {
      console.error("Enhanced PDF generation error:", error);
      reject(error);
    }
  });
}

// Filter out ITM-only content for PDF generation
function filterItmOnlyContent(sopDocument: SopDocument): SopDocument {
  // Filter out ITM-only content for public exports
  const filteredSteps = sopDocument.steps.map(step => ({
    ...step,
    // Remove ITM-only healthcare content
    healthcareContent: step.healthcareContent?.filter(hc => hc) || [],
    // Remove ITM-only learning objectives  
    learningObjectives: step.learningObjectives?.filter(lo => lo) || [],
    // Remove ITM-only content blocks
    contentBlocks: step.contentBlocks?.filter(cb => cb) || [],
    // Keep core content but remove ITM-only detailed rationale
    itmOnlyContent: undefined
  }));

  return {
    ...sopDocument,
    steps: filteredSteps
  };
}

async function addBeautifulCoverPage(
  pdf: any,
  sopDocument: SopDocument,
  width: number,
  height: number,
  margin: any,
  theme: any
) {
  // Clean white background matching business demo
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, width, height, 'F');

  // Header section with blue border (matching demo)
  const headerY = margin.top;
  const headerHeight = 100;
  
  // Company name in SOPify blue
  setFontSafe(pdf, "helvetica", "bold");
  pdf.setFontSize(24);
  pdf.setTextColor(0, 122, 255); // #007AFF
  
  const companyName = sopDocument.companyName || "Your Organization";
  const companyWidth = getStringWidthSafe(pdf, companyName, 24);
  pdf.text(companyName, (width - companyWidth) / 2, headerY + 30);

  // Main title in dark text (matching demo)
  setFontSafe(pdf, "helvetica", "bold");
  pdf.setFontSize(32);
  pdf.setTextColor(30, 30, 30); // #1E1E1E
  
  const title = sopDocument.title || "Professional Training Module";
  const titleLines = pdf.splitTextToSize(title, width - margin.left - margin.right - 40);
  let titleY = headerY + 55;
  
  titleLines.forEach((line: string) => {
    const lineWidth = getStringWidthSafe(pdf, line, 32);
    pdf.text(line, (width - lineWidth) / 2, titleY);
    titleY += 12;
  });

  // Subtitle in gray (matching demo)
  if (sopDocument.topic) {
    setFontSafe(pdf, "helvetica", "normal");
    pdf.setFontSize(18);
    pdf.setTextColor(102, 102, 102); // #666
    
    const subtitleWidth = getStringWidthSafe(pdf, sopDocument.topic, 18);
    pdf.text(sopDocument.topic, (width - subtitleWidth) / 2, titleY + 20);
    titleY += 25;
  }

  // Blue border line (matching demo header)
  pdf.setDrawColor(0, 122, 255);
  pdf.setLineWidth(3);
  pdf.line(margin.left, titleY + 10, width - margin.right, titleY + 10);

  // Demo badge with gradient (matching business demo)
  const badgeY = titleY + 40;
  const badgeText = theme.isHealthcare 
    ? `🏥 ${theme.themeName} Healthcare Training`
    : "🚀 SOPify Business Tier Demo - Professional Features Showcase";
  const badgeWidth = theme.isHealthcare ? 180 : 240;
  const badgeHeight = 20;
  
  // Gradient badge background (matching demo)
  for (let i = 0; i < 10; i++) {
    const alpha = i / 10;
    const r = Math.round(0 + (88 - 0) * alpha); // #007AFF to #5856D6
    const g = Math.round(122 + (86 - 122) * alpha);
    const b = Math.round(255 + (214 - 255) * alpha);
    
    pdf.setFillColor(r, g, b);
    const segmentHeight = badgeHeight / 10;
    const cornerRadius = i === 0 ? 25 : 0;
    pdf.roundedRect((width - badgeWidth) / 2, badgeY - 10 + i * segmentHeight, badgeWidth, segmentHeight, cornerRadius, cornerRadius, 'F');
  }
  
  // Badge text
  setFontSafe(pdf, "helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(255, 255, 255);
  const badgeTextWidth = getStringWidthSafe(pdf, badgeText, 11);
  pdf.text(badgeText, (width - badgeTextWidth) / 2, badgeY);

  // Meta information box (matching demo design)
  const metaY = badgeY + 40;
  const metaBoxHeight = 40;
  
  // Light gray background (matching demo)
  pdf.setFillColor(248, 249, 250); // #f8f9fa
  pdf.roundedRect(margin.left, metaY, width - margin.left - margin.right, metaBoxHeight, 8, 8, 'F');
  
  // Meta information with flexible layout
  setFontSafe(pdf, "helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(51, 51, 51); // #333
  
  const metaInfo = [
    `Version: 1.0`,
    `Date: ${sopDocument.date || new Date().toLocaleDateString()}`,
    `Author: ${sopDocument.companyName || 'Your Organization'}`,
    `Steps: ${sopDocument.steps.length}`
  ];
  
  // Four-column layout
  const metaStartX = margin.left + 15;
  const metaStartY = metaY + 15;
  const columnWidth = (width - margin.left - margin.right - 30) / 4;
  
  metaInfo.forEach((info, index) => {
    const x = metaStartX + (index * columnWidth);
    pdf.text(info, x, metaStartY);
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

async function renderEnhancedSopSteps(
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
    if (currentY > height - margin.bottom - 160) {
      pdf.addPage();
      // Clean white background (matching demo)
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, width, height, 'F');
      currentY = margin.top;
    }
    
    // Step design matching business demo
    const headerHeight = 35;
    const contentHeight = 80;
    const totalStepHeight = headerHeight + contentHeight;
    const hasCriticalContent = step.healthcareContent?.some(hc => 
      hc.priority === 'high' || hc.type === 'critical-safety'
    );
    
    // Step header with gradient (matching demo)
    const headerColors = hasCriticalContent 
      ? [{ r: 239, g: 68, b: 68 }, { r: 245, g: 101, b: 101 }] // Red gradient for critical
      : [{ r: 0, g: 122, b: 255 }, { r: 88, g: 86, b: 214 }]; // Demo gradient (#007AFF to #5856D6)
    
    // Gradient header background
    for (let i = 0; i < 10; i++) {
      const alpha = i / 10;
      const r = Math.round(headerColors[0].r + (headerColors[1].r - headerColors[0].r) * alpha);
      const g = Math.round(headerColors[0].g + (headerColors[1].g - headerColors[0].g) * alpha);
      const b = Math.round(headerColors[0].b + (headerColors[1].b - headerColors[0].b) * alpha);
      
      pdf.setFillColor(r, g, b);
      const segmentHeight = headerHeight / 10;
      const cornerRadius = i === 0 ? 12 : 0;
      pdf.roundedRect(margin.left, currentY + i * segmentHeight, width - margin.left - margin.right, segmentHeight, cornerRadius, cornerRadius, 'F');
    }
    
    // Elegant priority badge matching demo style
    if (hasCriticalContent) {
      const badgeX = width - margin.right - 70;
      const badgeY = currentY + 8;
      
      // Professional critical badge
      pdf.setFillColor(255, 255, 255);
      pdf.setGState(new pdf.GState({opacity: 0.15}));
      pdf.roundedRect(badgeX, badgeY, 55, 12, 6, 6, 'F');
      
      pdf.setGState(new pdf.GState({opacity: 0.3}));
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(badgeX, badgeY, 55, 12, 6, 6, 'S');
      
      pdf.setGState(new pdf.GState({opacity: 1}));
      setFontSafe(pdf, "helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.text("⚠ CRITICAL", badgeX + 4, badgeY + 8);
    }
    
    // Step number and title (matching demo)
    setFontSafe(pdf, "helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(255, 255, 255);
    pdf.setGState(new pdf.GState({opacity: 0.9}));
    pdf.text(`Step ${stepNumber}`, margin.left + 20, currentY + 12);
    
    setFontSafe(pdf, "helvetica", "bold");
    pdf.setFontSize(24);
    pdf.setTextColor(255, 255, 255);
    pdf.setGState(new pdf.GState({opacity: 1}));
    const stepTitle = step.title || `Step ${stepNumber}`;
    pdf.text(stepTitle, margin.left + 20, currentY + 26);
    
    // Step description in header
    if (step.description) {
      setFontSafe(pdf, "helvetica", "normal");
      pdf.setFontSize(16);
      pdf.setTextColor(255, 255, 255);
      pdf.setGState(new pdf.GState({opacity: 0.9}));
      
      const descLines = pdf.splitTextToSize(step.description, width - margin.left - margin.right - 40);
      if (descLines.length > 0) {
        pdf.text(descLines[0], margin.left + 20, currentY + 32);
      }
    }
    
    // White content section (matching demo)
    const contentY = currentY + headerHeight;
    pdf.setFillColor(255, 255, 255); // White background
    pdf.roundedRect(margin.left, contentY, width - margin.left - margin.right, contentHeight, 0, 0, 'F');
    
    // Content border (matching demo)
    pdf.setDrawColor(224, 224, 224); // #e0e0e0
    pdf.setLineWidth(1);
    pdf.line(margin.left, contentY, width - margin.right, contentY); // Top border only
    pdf.roundedRect(margin.left, contentY, width - margin.left - margin.right, contentHeight, 0, 12, 'S'); // Bottom rounded corners
    
         // Tags in content section (matching demo)
     if (step.tags && step.tags.length > 0) {
       let tagY = contentY + contentHeight - 20;
       let tagX = margin.left + 20;
       
       step.tags.slice(0, 4).forEach((tag: string) => {
         const tagWidth = getStringWidthSafe(pdf, tag, 12) + 12;
         
         // Blue tag background (matching demo)
         pdf.setFillColor(0, 122, 255); // #007AFF
         pdf.roundedRect(tagX, tagY - 4, tagWidth, 12, 16, 16, 'F');
         
         // Tag text
         setFontSafe(pdf, "helvetica", "normal");
         pdf.setFontSize(12);
         pdf.setTextColor(255, 255, 255);
         pdf.text(tag, tagX + 6, tagY + 3);
         
         tagX += tagWidth + 8;
         
         // Wrap to next line if needed
         if (tagX > width - margin.right - 40) {
           tagX = margin.left + 20;
           tagY += 16;
         }
       });
     }
     
     currentY += totalStepHeight + 25;
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
    
    // Footer border line (matching demo)
    pdf.setDrawColor(224, 224, 224); // #e0e0e0
    pdf.setLineWidth(2);
    pdf.line(margin.left, height - margin.bottom + 5, width - margin.right, height - margin.bottom + 5);
    
    // Footer text (matching demo)
    setFontSafe(pdf, "helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(102, 102, 102); // #666
    
    // Center text - Generated by SOPify Business
    const centerText = "Generated by SOPify Business";
    const centerTextWidth = getStringWidthSafe(pdf, centerText, 12);
    pdf.text(centerText, (width - centerTextWidth) / 2, height - margin.bottom + 18);
    
    // Subtitle text
    setFontSafe(pdf, "helvetica", "normal");
    pdf.setFontSize(10);
    const subtitleText = "Professional SOP creation and training platform";
    const subtitleTextWidth = getStringWidthSafe(pdf, subtitleText, 10);
    pdf.text(subtitleText, (width - subtitleTextWidth) / 2, height - margin.bottom + 28);
    
    // Demo notice
    pdf.setFontSize(8);
    pdf.setTextColor(153, 153, 153); // #999
    const demoText = "This is a demonstration of SOPify's Business tier capabilities";
    const demoTextWidth = getStringWidthSafe(pdf, demoText, 8);
    pdf.text(demoText, (width - demoTextWidth) / 2, height - margin.bottom + 36);
  }
}

// Helper function to detect healthcare template type
function detectHealthcareTheme(sopDocument: SopDocument): string | null {
  // Check if document has healthcare content
  const hasHealthcareContent = sopDocument.steps.some(step => 
    step.healthcareContent && step.healthcareContent.length > 0
  );
  
  // Check title for healthcare keywords
  const title = sopDocument.title?.toLowerCase() || '';
  const hasHealthcareTitle = title.includes('healthcare') ||
    title.includes('patient') ||
    title.includes('hipaa') ||
    title.includes('medical');
  
  if (!hasHealthcareContent && !hasHealthcareTitle) {
    return null;
  }
  
  // Detect specific healthcare template type
  if (title.includes('new hire') || title.includes('onboarding')) {
    return 'new-hire-onboarding';
  }
  if (title.includes('continued learning') || title.includes('professional development')) {
    return 'continued-learning';
  }
  if (title.includes('communication') || title.includes('patient communication')) {
    return 'communication-excellence';
  }
  
  return 'healthcare-general';
}

// Helper function to get enhanced theme based on healthcare template
function getEnhancedTheme(sopDocument: SopDocument, options: EnhancedPdfOptions, healthcareType: string | null) {
  // Use professional demo colors for all documents to match demo quality
  // Healthcare context is maintained through badges and text, not colors
  const demoTheme = {
    primary: options.branding?.companyColors?.primary || '#007AFF',
    secondary: options.branding?.companyColors?.secondary || '#5856D6',
    accent: '#007AFF',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    background: '#f8f9fa',
    text: '#333333',
    lightGray: '#e0e0e0',
    darkGray: '#666666',
    // Healthcare-specific colors for alerts
    criticalSafety: '#DC2626',
    hipaaAlert: '#2563EB',
    patientCommunication: '#16A34A',
    // Theme metadata
    isHealthcare: !!healthcareType,
    healthcareType: healthcareType,
    themeName: healthcareType 
      ? 'Healthcare Professional'
      : 'Professional'
  };
  
  return demoTheme;
}

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 122, b: 255 }; // Default to SOPify blue
}
