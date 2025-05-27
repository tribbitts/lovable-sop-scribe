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
  // Beautiful gradient background effect using theme colors
  const primaryRgb = hexToRgb(theme.primary);
  const secondaryRgb = hexToRgb(theme.secondary);
  
  const gradientSteps = 20;
  for (let i = 0; i < gradientSteps; i++) {
    const alpha = i / gradientSteps;
    const r = Math.round(primaryRgb.r + (secondaryRgb.r - primaryRgb.r) * alpha);
    const g = Math.round(primaryRgb.g + (secondaryRgb.g - primaryRgb.g) * alpha);
    const b = Math.round(primaryRgb.b + (secondaryRgb.b - primaryRgb.b) * alpha);
    
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

  // Beautiful badge design with healthcare context
  const badgeY = titleY + 50;
  const badgeText = theme.isHealthcare 
    ? `🏥 ${theme.themeName} Healthcare Training`
    : "📋 Professional SOP Document";
  const badgeWidth = theme.isHealthcare ? 140 : 120;
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
    if (currentY > height - margin.bottom - 120) {
      pdf.addPage();
      pdf.setFillColor(248, 249, 250);
      pdf.rect(0, 0, width, height, 'F');
      currentY = margin.top;
    }
    
    // Enhanced step header with priority indicators
    const headerHeight = 30;
    const hasCriticalContent = step.healthcareContent?.some(hc => 
      hc.priority === 'high' || hc.type === 'critical-safety'
    );
    
    // Dynamic header color based on content criticality and theme
    const primaryRgb = hexToRgb(theme.primary);
    const secondaryRgb = hexToRgb(theme.secondary);
    
    let headerColors = [
      primaryRgb,   // Theme primary color
      secondaryRgb  // Theme secondary color
    ];
    
    if (hasCriticalContent) {
      headerColors = [
        { r: 255, g: 59, b: 48 },   // Critical red
        { r: 255, g: 149, b: 0 }    // Warning orange
      ];
    }
    
    // Gradient header with priority-based coloring
    for (let i = 0; i < 10; i++) {
      const alpha = i / 10;
      const r = Math.round(headerColors[0].r + (headerColors[1].r - headerColors[0].r) * alpha);
      const g = Math.round(headerColors[0].g + (headerColors[1].g - headerColors[0].g) * alpha);
      const b = Math.round(headerColors[0].b + (headerColors[1].b - headerColors[0].b) * alpha);
      
      pdf.setFillColor(r, g, b);
      pdf.roundedRect(margin.left, currentY + i * (headerHeight / 10), width - margin.left - margin.right, headerHeight / 10, i === 0 ? 6 : 0, i === 0 ? 6 : 0, 'F');
    }
    
    // Priority indicator badge
    if (hasCriticalContent) {
      const badgeX = width - margin.right - 60;
      const badgeY = currentY + 5;
      
      // Critical alert badge
      pdf.setFillColor(255, 255, 255);
      pdf.setGState(new pdf.GState({opacity: 0.9}));
      pdf.roundedRect(badgeX, badgeY, 50, 8, 4, 4, 'F');
      
      pdf.setGState(new pdf.GState({opacity: 1}));
      setFontSafe(pdf, "helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(220, 38, 127);
      pdf.text("⚠ CRITICAL", badgeX + 3, badgeY + 5);
    }
    
    // Step number and title
    setFontSafe(pdf, "helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.setGState(new pdf.GState({opacity: 0.8}));
    pdf.text(`Step ${stepNumber}`, margin.left + 10, currentY + 8);
    
    pdf.setGState(new pdf.GState({opacity: 1}));
    setFontSafe(pdf, "helvetica", "bold");
    pdf.setFontSize(20);
    pdf.setTextColor(255, 255, 255);
    const stepTitle = step.title || `Step ${stepNumber}`;
    pdf.text(stepTitle, margin.left + 10, currentY + 22);
    
    currentY += headerHeight;
    
    // Enhanced content section with visual hierarchy
    const contentHeight = 80;
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin.left, currentY, width - margin.left - margin.right, contentHeight, 6, 6, 'F');
    
    // Content border with dynamic coloring
    if (hasCriticalContent) {
      pdf.setDrawColor(255, 59, 48);
      pdf.setLineWidth(1.5);
    } else {
      pdf.setDrawColor(224, 224, 224);
      pdf.setLineWidth(0.5);
    }
    pdf.roundedRect(margin.left, currentY, width - margin.left - margin.right, contentHeight, 6, 6, 'S');
    
    // Step description with enhanced formatting
    if (step.description) {
      setFontSafe(pdf, "helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(51, 51, 51);
      
      const descLines = pdf.splitTextToSize(step.description, width - margin.left - margin.right - 20);
      let descY = currentY + 10;
      descLines.slice(0, 3).forEach((line: string) => {
        pdf.text(line, margin.left + 10, descY);
        descY += 5;
      });
    }
    
    pdf.setGState(new pdf.GState({opacity: 1}));
    
    // Enhanced safety alerts and HIPAA notes
    let alertY = currentY + 35;
    
    if (step.patientSafetyNote) {
      // Safety alert box
      pdf.setFillColor(254, 242, 242);
      pdf.roundedRect(margin.left + 10, alertY, width - margin.left - margin.right - 20, 12, 4, 4, 'F');
      
      pdf.setDrawColor(239, 68, 68);
      pdf.setLineWidth(1);
      pdf.line(margin.left + 10, alertY, margin.left + 10, alertY + 12);
      
      setFontSafe(pdf, "helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(185, 28, 28);
      pdf.text("🚨 SAFETY ALERT", margin.left + 15, alertY + 4);
      
      setFontSafe(pdf, "helvetica", "normal");
      pdf.setFontSize(8);
      const safetyLines = pdf.splitTextToSize(step.patientSafetyNote, width - margin.left - margin.right - 30);
      safetyLines.slice(0, 1).forEach((line: string) => {
        pdf.text(line, margin.left + 15, alertY + 9);
      });
      
      alertY += 15;
    }
    
    if (step.hipaaAlert) {
      // HIPAA alert box
      pdf.setFillColor(239, 246, 255);
      pdf.roundedRect(margin.left + 10, alertY, width - margin.left - margin.right - 20, 12, 4, 4, 'F');
      
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(1);
      pdf.line(margin.left + 10, alertY, margin.left + 10, alertY + 12);
      
      setFontSafe(pdf, "helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(30, 64, 175);
      pdf.text("🔒 HIPAA COMPLIANCE", margin.left + 15, alertY + 4);
      
      setFontSafe(pdf, "helvetica", "normal");
      pdf.setFontSize(8);
      const hipaaLines = pdf.splitTextToSize(step.hipaaAlert, width - margin.left - margin.right - 30);
      hipaaLines.slice(0, 1).forEach((line: string) => {
        pdf.text(line, margin.left + 15, alertY + 9);
      });
      
      alertY += 15;
    }
    
    // Enhanced key takeaway with visual prominence
    if (step.keyTakeaway) {
      const takeawayY = alertY;
      const takeawayHeight = 12;
      
      // Gold accent for key takeaways
      pdf.setFillColor(254, 243, 199);
      pdf.roundedRect(margin.left + 10, takeawayY, width - margin.left - margin.right - 20, takeawayHeight, 4, 4, 'F');
      
      // Gold left border
      pdf.setDrawColor(245, 158, 11);
      pdf.setLineWidth(2);
      pdf.line(margin.left + 10, takeawayY, margin.left + 10, takeawayY + takeawayHeight);
      
      setFontSafe(pdf, "helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(146, 64, 14);
      pdf.text("🎯 KEY TAKEAWAY", margin.left + 15, takeawayY + 4);
      
      setFontSafe(pdf, "helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(51, 51, 51);
      const takeawayLines = pdf.splitTextToSize(step.keyTakeaway, width - margin.left - margin.right - 30);
      takeawayLines.slice(0, 1).forEach((line: string) => {
        pdf.text(line, margin.left + 15, takeawayY + 9);
      });
    }
    
    // Enhanced tags with professional styling
    if (step.tags && step.tags.length > 0) {
      let tagY = currentY + contentHeight - 10;
      let tagX = margin.left + 10;
      
      step.tags.slice(0, 5).forEach((tag: string) => {
        const tagWidth = getStringWidthSafe(pdf, tag, 7) + 6;
        
        // Professional tag background
        pdf.setFillColor(241, 245, 249);
        pdf.roundedRect(tagX, tagY - 3, tagWidth, 6, 3, 3, 'F');
        
        // Tag border
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(tagX, tagY - 3, tagWidth, 6, 3, 3, 'S');
        
        // Tag text
        setFontSafe(pdf, "helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(71, 85, 105);
        pdf.text(tag, tagX + 3, tagY + 1);
        
        tagX += tagWidth + 4;
        
        // Wrap to next line if needed
        if (tagX > width - margin.right - 40) {
          tagX = margin.left + 10;
          tagY += 8;
        }
      });
    }
    
    currentY += contentHeight + 20;
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
    
    // Beautiful footer line with theme color
    const primaryRgb = hexToRgb(theme.primary);
    pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setLineWidth(1);
    pdf.line(margin.left, height - margin.bottom + 5, width - margin.right, height - margin.bottom + 5);
    
    // Footer text
    setFontSafe(pdf, "helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(102, 102, 102);
    
    // Left side - document info with healthcare indicator
    const leftText = theme.isHealthcare 
      ? `${sopDocument.title || 'SOP'} • ${theme.themeName} Healthcare Training`
      : `${sopDocument.title || 'SOP'} • Professional Document`;
    pdf.text(leftText, margin.left, height - margin.bottom + 12);
    
    // Right side - page number
    const rightText = `Page ${i} of ${totalPages}`;
    const rightTextWidth = getStringWidthSafe(pdf, rightText, 9);
    pdf.text(rightText, width - margin.right - rightTextWidth, height - margin.bottom + 12);
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
