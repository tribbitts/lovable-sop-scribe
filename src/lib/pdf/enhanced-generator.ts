import { jsPDF } from "jspdf";
import { SopDocument } from "@/types/sop";
import { PdfTheme, pdfThemes, getCustomTheme } from "./enhanced-themes";
import { initializePdfFonts, setFontSafe, getStringWidthSafe } from "./font-handler";
import { addCoverPage } from "./cover-page";
import { addContentPageDesign, addPageFooters } from "./content-page";
import { renderSteps } from "./step-renderer";
import { healthcareThemes } from "@/services/enhanced-healthcare-templates";

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
  const filteredSteps = sopDocument.steps.map(step => ({
    ...step,
    // Remove ITM-only quiz questions
    quizQuestions: step.quizQuestions?.filter(q => !q.itmOnly),
    // Remove ITM-only resources
    resources: step.resources?.filter(r => !r.itmOnly),
    // Remove ITM-only healthcare content
    healthcareContent: step.healthcareContent?.filter(hc => !hc.itmOnly),
    // Remove ITM-only learning objectives
    learningObjectives: step.learningObjectives?.filter(lo => !lo.itmOnly),
    // Remove ITM-only content blocks
    contentBlocks: step.contentBlocks?.filter(cb => !cb.itmOnly),
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
  // Elegant gradient background matching demo design (purple-900 to blue-900)
  const gradientSteps = 30;
  for (let i = 0; i < gradientSteps; i++) {
    const alpha = i / gradientSteps;
    // Purple-900 (88, 28, 135) to Blue-900 (30, 58, 138)
    const r = Math.round(88 + (30 - 88) * alpha);
    const g = Math.round(28 + (58 - 28) * alpha);
    const b = Math.round(135 + (138 - 135) * alpha);
    
    pdf.setFillColor(r, g, b);
    pdf.rect(0, i * (height / gradientSteps), width, height / gradientSteps, 'F');
  }

  // Elegant company name with demo styling
  setFontSafe(pdf, "helvetica", "normal");
  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  pdf.setGState(new pdf.GState({opacity: 0.8}));
  
  const companyName = sopDocument.companyName || "Your Organization";
  const companyWidth = getStringWidthSafe(pdf, companyName, 16);
  pdf.text(companyName, (width - companyWidth) / 2, margin.top + 50);

  // Main title with striking typography matching demo
  pdf.setGState(new pdf.GState({opacity: 1}));
  setFontSafe(pdf, "helvetica", "bold");
  pdf.setFontSize(36);
  pdf.setTextColor(255, 255, 255);
  
  const title = sopDocument.title || "Professional Training Module";
  const titleLines = pdf.splitTextToSize(title, width - margin.left - margin.right - 40);
  let titleY = margin.top + 100;
  
  titleLines.forEach((line: string) => {
    const lineWidth = getStringWidthSafe(pdf, line, 36);
    pdf.text(line, (width - lineWidth) / 2, titleY);
    titleY += 14;
  });

  // Elegant subtitle with professional styling
  if (sopDocument.topic) {
    setFontSafe(pdf, "helvetica", "normal");
    pdf.setFontSize(20);
    pdf.setTextColor(255, 255, 255);
    pdf.setGState(new pdf.GState({opacity: 0.85}));
    
    const subtitleWidth = getStringWidthSafe(pdf, sopDocument.topic, 20);
    pdf.text(sopDocument.topic, (width - subtitleWidth) / 2, titleY + 25);
  }

  // Elegant badge design matching demo styling
  const badgeY = titleY + 60;
  const badgeText = theme.isHealthcare 
    ? `🏥 ${theme.themeName} Healthcare Training`
    : "✨ Professional Training Module";
  const badgeWidth = theme.isHealthcare ? 160 : 140;
  const badgeHeight = 16;
  
  // Professional badge background with demo-style opacity
  pdf.setFillColor(255, 255, 255);
  pdf.setGState(new pdf.GState({opacity: 0.15}));
  pdf.roundedRect((width - badgeWidth) / 2, badgeY - 8, badgeWidth, badgeHeight, 8, 8, 'F');
  
  // Badge border for elegance
  pdf.setGState(new pdf.GState({opacity: 0.3}));
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.5);
  pdf.roundedRect((width - badgeWidth) / 2, badgeY - 8, badgeWidth, badgeHeight, 8, 8, 'S');
  
  // Elegant badge text
  pdf.setGState(new pdf.GState({opacity: 1}));
  setFontSafe(pdf, "helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(255, 255, 255);
  const badgeTextWidth = getStringWidthSafe(pdf, badgeText, 11);
  pdf.text(badgeText, (width - badgeTextWidth) / 2, badgeY);

  // Elegant meta information card matching demo design
  const metaY = height - 90;
  const metaBoxHeight = 50;
  
  // Professional card background with demo-style opacity
  pdf.setFillColor(255, 255, 255);
  pdf.setGState(new pdf.GState({opacity: 0.12}));
  pdf.roundedRect(margin.left + 20, metaY, width - margin.left - margin.right - 40, metaBoxHeight, 12, 12, 'F');
  
  // Elegant card border
  pdf.setGState(new pdf.GState({opacity: 0.25}));
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.8);
  pdf.roundedRect(margin.left + 20, metaY, width - margin.left - margin.right - 40, metaBoxHeight, 12, 12, 'S');
  
  // Professional meta information with demo styling
  pdf.setGState(new pdf.GState({opacity: 1}));
  setFontSafe(pdf, "helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(255, 255, 255);
  
  const metaInfo = [
    `Version: 1.0`,
    `Date: ${sopDocument.date || new Date().toLocaleDateString()}`,
    `Author: ${sopDocument.companyName || 'Your Organization'}`,
    `Steps: ${sopDocument.steps.length}`
  ];
  
  // Elegant grid layout for meta information
  const cardPadding = 15;
  const metaStartX = margin.left + 20 + cardPadding;
  const metaStartY = metaY + 15;
  
  // First row
  pdf.text(metaInfo[0], metaStartX, metaStartY);
  const firstRowSecondX = metaStartX + getStringWidthSafe(pdf, metaInfo[0], 11) + 40;
  pdf.text(metaInfo[1], firstRowSecondX, metaStartY);
  
  // Second row
  pdf.text(metaInfo[2], metaStartX, metaStartY + 18);
  const secondRowSecondX = metaStartX + getStringWidthSafe(pdf, metaInfo[2], 11) + 40;
  pdf.text(metaInfo[3], secondRowSecondX, metaStartY + 18);
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
    if (currentY > height - margin.bottom - 140) {
      pdf.addPage();
      // Elegant page background matching demo
      pdf.setFillColor(24, 24, 27); // zinc-900
      pdf.rect(0, 0, width, height, 'F');
      currentY = margin.top;
    }
    
    // Elegant step card design matching demo
    const cardHeight = 120;
    const headerHeight = 35;
    const hasCriticalContent = step.healthcareContent?.some(hc => 
      hc.priority === 'high' || hc.type === 'critical-safety'
    );
    
    // Professional card background (zinc-800 equivalent)
    pdf.setFillColor(39, 39, 42);
    pdf.roundedRect(margin.left + 10, currentY, width - margin.left - margin.right - 20, cardHeight, 12, 12, 'F');
    
    // Elegant card border (zinc-700 equivalent)
    pdf.setDrawColor(63, 63, 70);
    pdf.setLineWidth(1);
    pdf.roundedRect(margin.left + 10, currentY, width - margin.left - margin.right - 20, cardHeight, 12, 12, 'S');
    
    // Elegant header section with demo-style gradient
    const headerColors = hasCriticalContent 
      ? [{ r: 239, g: 68, b: 68 }, { r: 245, g: 101, b: 101 }] // Red gradient for critical
      : [{ r: 139, g: 92, b: 246 }, { r: 99, g: 102, b: 241 }]; // Purple gradient (demo style)
    
    // Smooth gradient header
    for (let i = 0; i < 15; i++) {
      const alpha = i / 15;
      const r = Math.round(headerColors[0].r + (headerColors[1].r - headerColors[0].r) * alpha);
      const g = Math.round(headerColors[0].g + (headerColors[1].g - headerColors[0].g) * alpha);
      const b = Math.round(headerColors[0].b + (headerColors[1].b - headerColors[0].b) * alpha);
      
      pdf.setFillColor(r, g, b);
      const segmentHeight = headerHeight / 15;
      const cornerRadius = i === 0 ? 12 : 0;
      pdf.roundedRect(margin.left + 10, currentY + i * segmentHeight, width - margin.left - margin.right - 20, segmentHeight, cornerRadius, cornerRadius, 'F');
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
    
    // Professional step number and title
    setFontSafe(pdf, "helvetica", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.setGState(new pdf.GState({opacity: 0.7}));
    pdf.text(`Step ${stepNumber}`, margin.left + 25, currentY + 15);
    
    pdf.setGState(new pdf.GState({opacity: 1}));
    setFontSafe(pdf, "helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(255, 255, 255);
    const stepTitle = step.title || `Step ${stepNumber}`;
    pdf.text(stepTitle, margin.left + 25, currentY + 28);
    
    // Professional content section within the card
    const contentY = currentY;
    const contentHeight = cardHeight - headerHeight;
    
    // Step description with elegant formatting
    if (step.description) {
      setFontSafe(pdf, "helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(255, 255, 255);
      pdf.setGState(new pdf.GState({opacity: 0.9}));
      
      const descLines = pdf.splitTextToSize(step.description, width - margin.left - margin.right - 60);
      let descY = contentY + 15;
      descLines.slice(0, 4).forEach((line: string) => {
        pdf.text(line, margin.left + 25, descY);
        descY += 6;
      });
    }
    
    // Professional tags with demo-style badges
    if (step.tags && step.tags.length > 0) {
      let tagY = currentY + cardHeight - 25;
      let tagX = margin.left + 25;
      
      pdf.setGState(new pdf.GState({opacity: 1}));
      
      step.tags.slice(0, 4).forEach((tag: string) => {
        const tagWidth = getStringWidthSafe(pdf, tag, 8) + 12;
        
        // Elegant tag background matching demo
        pdf.setFillColor(99, 102, 241); // indigo-500
        pdf.setGState(new pdf.GState({opacity: 0.2}));
        pdf.roundedRect(tagX, tagY - 4, tagWidth, 10, 5, 5, 'F');
        
        // Tag border
        pdf.setGState(new pdf.GState({opacity: 0.4}));
        pdf.setDrawColor(99, 102, 241);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(tagX, tagY - 4, tagWidth, 10, 5, 5, 'S');
        
        // Tag text
        pdf.setGState(new pdf.GState({opacity: 1}));
        setFontSafe(pdf, "helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.text(tag, tagX + 6, tagY + 2);
        
        tagX += tagWidth + 8;
        
        // Wrap to next line if needed
        if (tagX > width - margin.right - 60) {
          tagX = margin.left + 25;
          tagY += 12;
        }
      });
    }
    
    currentY += cardHeight + 25;
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
    
    // Elegant footer line matching demo style (purple gradient)
    pdf.setDrawColor(139, 92, 246); // purple-500
    pdf.setLineWidth(1.5);
    pdf.line(margin.left + 10, height - margin.bottom + 8, width - margin.right - 10, height - margin.bottom + 8);
    
    // Professional footer text
    setFontSafe(pdf, "helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(156, 163, 175); // gray-400
    
    // Left side - elegant document info
    const leftText = theme.isHealthcare 
      ? `${sopDocument.title || 'Training Module'} • ${theme.themeName} Healthcare Training`
      : `${sopDocument.title || 'Training Module'} • Professional Training`;
    pdf.text(leftText, margin.left + 10, height - margin.bottom + 18);
    
    // Right side - elegant page number
    const rightText = `Page ${i} of ${totalPages}`;
    const rightTextWidth = getStringWidthSafe(pdf, rightText, 10);
    pdf.text(rightText, width - margin.right - rightTextWidth - 10, height - margin.bottom + 18);
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
    themeName: healthcareType && healthcareThemes[healthcareType] 
      ? healthcareThemes[healthcareType].name 
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
