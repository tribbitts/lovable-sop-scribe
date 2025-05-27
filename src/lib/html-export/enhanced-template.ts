
import { SopDocument } from "@/types/sop";
import { renderEnhancedCallouts, generateCalloutInteractivityScript } from "./enhanced-callout-renderer";
import { renderEnhancedContentBlocks } from "./enhanced-content-renderer";
import { generateFeedbackSection, FeedbackOptions } from "./feedback-renderer";

export interface HtmlExportOptions {
  theme?: 'light' | 'dark' | 'auto';
  includeTableOfContents?: boolean;
  includeProgressInfo?: boolean;
  customFooter?: string;
  quality?: "low" | "medium" | "high";
  mode?: 'standalone' | 'zip';
  enhanced?: boolean;
  enhancedOptions?: any;
  trainingOptions?: {
    enableQuizzes?: boolean;
    enableCertificates?: boolean;
    enableNotes?: boolean;
    enableBookmarks?: boolean;
    passwordProtection?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  customization?: {
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: "system" | "serif" | "sans-serif" | "monospace";
    headerStyle?: "modern" | "classic" | "minimal" | "corporate";
    layout?: "standard" | "compact" | "spacious";
    cornerRadius?: "none" | "small" | "medium" | "large";
    shadowStyle?: "none" | "subtle" | "medium" | "strong";
  };
  feedback?: FeedbackOptions;
}

export const generateHtmlTemplate = (sopDocument: SopDocument, options: HtmlExportOptions = {}) => {
  const steps = sopDocument.steps.map((step, index) => {
    const screenshotHtml = step.screenshot ? `<img src="${step.screenshot.dataUrl}" alt="Step ${index + 1} Screenshot" style="max-width: 100%; height: auto;">` : '';

    return `
      <div class="step" style="margin-bottom: 20px;">
        <h3>Step ${index + 1}: ${step.title}</h3>
        <p>${step.description}</p>
        ${screenshotHtml}
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${sopDocument.title}</title>
    </head>
    <body>
      <h1>${sopDocument.title}</h1>
      <p>${sopDocument.description}</p>
      <div class="steps">
        ${steps}
      </div>
    </body>
    </html>
  `;
};

export const generateEnhancedHtmlTemplate = (sopDocument: SopDocument, options: any = {}) => {
  const steps = sopDocument.steps.map((step, index) => {
    const enhancedContentHtml = step.enhancedContentBlocks 
      ? renderEnhancedContentBlocks(step.enhancedContentBlocks)
      : '';

    const screenshotHtml = step.screenshot ? `
      <div class="screenshot-container" style="position: relative; margin: 20px 0;">
        <img src="${step.screenshot.dataUrl}" alt="Step ${index + 1} Screenshot" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" />
        ${renderEnhancedCallouts(step.screenshot.callouts || [], true)}
      </div>
    ` : '';

    return `
      <div class="step" style="margin-bottom: 40px; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: white;">
        <div class="step-header" style="margin-bottom: 16px;">
          <h3 style="margin: 0; color: #1f2937; font-size: 1.25rem; font-weight: 600;">
            ${step.title || `Step ${index + 1}`}
          </h3>
          ${step.estimatedTime ? `<span style="color: #6b7280; font-size: 0.875rem;">Estimated time: ${step.estimatedTime} minutes</span>` : ''}
        </div>
        
        <div class="step-content" style="margin-bottom: 16px;">
          <p style="margin: 0 0 16px 0; line-height: 1.6; color: #374151;">${step.description}</p>
          ${step.keyTakeaway ? `
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0; border-radius: 4px;">
              <strong style="color: #92400e;">Key Takeaway:</strong> ${step.keyTakeaway}
            </div>
          ` : ''}
        </div>

        ${enhancedContentHtml}
        ${screenshotHtml}
      </div>
    `;
  }).join('');

  // Generate feedback section
  const feedbackHtml = generateFeedbackSection(sopDocument, options.feedback || {});

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${sopDocument.title} - Enhanced Training Module</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9fafb;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding: 40px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
        }
        .enhanced-callout:hover {
          transform: scale(1.05);
          box-shadow: 0 0 15px rgba(0, 123, 255, 0.5) !important;
        }
        .callout-tooltip {
          z-index: 1000;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0 0 10px 0; font-size: 2.5rem;">${sopDocument.title}</h1>
        <p style="margin: 0; opacity: 0.9; font-size: 1.1rem;">${sopDocument.description || sopDocument.topic}</p>
      </div>

      <div class="content">
        ${steps}
      </div>

      ${feedbackHtml}

      ${generateCalloutInteractivityScript()}
    </body>
    </html>
  `;
};
