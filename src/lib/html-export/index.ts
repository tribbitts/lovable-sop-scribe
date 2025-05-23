
import { SopDocument, SopStep } from "@/types/sop";
import { createBase64ImageWithCallouts, estimateBase64ImageSize, formatFileSize } from "./image-processor";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// Define export options interface
export interface HtmlExportOptions {
  mode: 'standalone' | 'zip';
  quality?: number;
  includeTableOfContents?: boolean;
}

// Result of HTML export
export interface HtmlExportResult {
  html: string;
  estimatedSize: number;
}

/**
 * Export SOP document as HTML
 */
export async function exportSopAsHtml(
  sopDocument: SopDocument,
  options: HtmlExportOptions = { mode: 'standalone', quality: 0.85 }
): Promise<string> {
  const { mode = 'standalone', quality = 0.85 } = options;
  
  try {
    // Process steps and their screenshots
    const processedSteps: (SopStep & { processedScreenshot?: string; secondaryProcessedScreenshot?: string })[] = 
      await Promise.all(sopDocument.steps.map(async (step) => {
        // Create a copy of the step that we can modify
        const processedStep = { ...step };
        
        // Process primary screenshot if available
        if (step.screenshot?.dataUrl) {
          try {
            const processedImage = await createBase64ImageWithCallouts(
              step.screenshot.dataUrl,
              step.screenshot.callouts
            );
            processedStep.processedScreenshot = processedImage;
          } catch (error) {
            console.error(`Error processing screenshot for step ${step.title}:`, error);
          }
        }
        
        // Process secondary screenshot if available
        if (step.screenshot?.secondaryDataUrl) {
          try {
            const processedSecondaryImage = await createBase64ImageWithCallouts(
              step.screenshot.secondaryDataUrl,
              step.screenshot.secondaryCallouts || []
            );
            processedStep.secondaryProcessedScreenshot = processedSecondaryImage;
          } catch (error) {
            console.error(`Error processing secondary screenshot for step ${step.title}:`, error);
          }
        }
        
        return processedStep;
      }));
    
    // Generate HTML content
    const { html, estimatedSize } = generateSopHtml(sopDocument, processedSteps, options);
    
    // Handle export based on mode
    if (mode === 'standalone') {
      // For standalone mode, save as a single HTML file
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      saveAs(blob, `${sopDocument.title || 'SOP'}.html`);
    } else {
      // For zip mode, create a package with assets
      await createHtmlZipPackage(sopDocument, html, processedSteps);
    }
    
    // Return the HTML string for any further processing
    return html;
  } catch (error) {
    console.error("Error exporting SOP as HTML:", error);
    throw error;
  }
}

/**
 * Generate HTML content for the SOP
 */
function generateSopHtml(
  sopDocument: SopDocument, 
  processedSteps: (SopStep & { processedScreenshot?: string; secondaryProcessedScreenshot?: string })[], 
  options: HtmlExportOptions
): HtmlExportResult {
  // Basic HTML structure with responsive design
  const title = sopDocument.title || "Standard Operating Procedure";
  const date = sopDocument.date || new Date().toLocaleDateString();
  const companyName = sopDocument.companyName || "";
  
  // Calculate total estimated size
  let totalEstimatedSize = 0;
  
  // Generate table of contents
  const tableOfContentsHtml = options.includeTableOfContents !== false ? generateTableOfContents(processedSteps) : '';
  
  // Generate step HTML
  const stepsHtml = processedSteps.map((step, index) => {
    // Generate tags HTML
    const sopTagsHtml = step.tags && step.tags.length > 0 
      ? `<div class="sop-tags">${step.tags.map(tag => `<span class="sop-tag">${tag}</span>`).join('')}</div>`
      : '';
    
    // Process screenshots
    let screenshotHtml = '';
    if (step.processedScreenshot) {
      // Estimate size for tracking
      const screenshotSize = estimateBase64ImageSize(step.processedScreenshot);
      totalEstimatedSize += screenshotSize;
      
      screenshotHtml = `
        <div class="sop-screenshot">
          <img src="${step.processedScreenshot}" alt="Step ${index + 1} Screenshot" />
        </div>
      `;
    }
    
    // Process secondary screenshot if available
    let secondaryScreenshotHtml = '';
    if (step.secondaryProcessedScreenshot) {
      const secondarySize = estimateBase64ImageSize(step.secondaryProcessedScreenshot);
      totalEstimatedSize += secondarySize;
      
      secondaryScreenshotHtml = `
        <div class="sop-secondary-screenshot">
          <img src="${step.secondaryProcessedScreenshot}" alt="Step ${index + 1} Additional Screenshot" />
        </div>
      `;
    }
    
    // Generate resources HTML if available
    const resourcesHtml = step.resources && step.resources.length > 0 
      ? `
        <div class="sop-resources">
          <h4>Resources</h4>
          <ul>
            ${step.resources.map(resource => `
              <li>
                <a href="${resource.url}" target="_blank" rel="noopener noreferrer">
                  ${resource.title || resource.url}
                </a>
                ${resource.description ? `<p>${resource.description}</p>` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      ` 
      : '';
    
    // Compile step HTML
    return `
      <div class="sop-step" id="step-${index + 1}">
        <div class="step-header">
          <h2>${index + 1}. ${step.title || `Step ${index + 1}`}</h2>
          ${sopTagsHtml}
        </div>
        
        <div class="step-content">
          ${step.description ? `<p class="step-description">${step.description}</p>` : ''}
          
          ${screenshotHtml}
          
          ${step.detailedInstructions ? `
            <div class="step-instructions">
              <h4>Detailed Instructions</h4>
              <p>${step.detailedInstructions}</p>
            </div>
          ` : ''}
          
          ${secondaryScreenshotHtml}
          
          ${step.notes ? `
            <div class="step-notes">
              <h4>Notes</h4>
              <p>${step.notes}</p>
            </div>
          ` : ''}
          
          ${resourcesHtml}
        </div>
      </div>
    `;
  }).join('');
  
  // Generate CSS styles
  const cssStyles = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .sop-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    
    .sop-title {
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .sop-topic {
      font-size: 18px;
      color: #555;
      margin-bottom: 15px;
    }
    
    .sop-company {
      font-size: 16px;
      margin-bottom: 10px;
    }
    
    .sop-date {
      font-size: 14px;
      color: #777;
    }
    
    .sop-toc {
      margin-bottom: 40px;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 5px;
    }
    
    .sop-toc h2 {
      margin-top: 0;
    }
    
    .sop-toc ul {
      padding-left: 20px;
    }
    
    .sop-toc a {
      color: #0066cc;
      text-decoration: none;
    }
    
    .sop-toc a:hover {
      text-decoration: underline;
    }
    
    .sop-step {
      margin-bottom: 50px;
      padding-bottom: 30px;
      border-bottom: 1px solid #eee;
    }
    
    .step-header {
      margin-bottom: 20px;
    }
    
    .step-header h2 {
      margin-bottom: 10px;
    }
    
    .sop-tags {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 15px;
    }
    
    .sop-tag {
      background-color: #f0f0f0;
      color: #555;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-right: 8px;
      margin-bottom: 8px;
    }
    
    .step-description {
      font-size: 16px;
      margin-bottom: 20px;
    }
    
    .sop-screenshot, .sop-secondary-screenshot {
      margin-bottom: 25px;
      text-align: center;
    }
    
    .sop-screenshot img, .sop-secondary-screenshot img {
      max-width: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .step-instructions, .step-notes {
      margin-bottom: 25px;
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
    }
    
    .step-instructions h4, .step-notes h4 {
      margin-top: 0;
      margin-bottom: 10px;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
    }
    
    .sop-resources {
      background-color: #f0f7ff;
      padding: 15px;
      border-radius: 4px;
    }
    
    .sop-resources h4 {
      margin-top: 0;
      margin-bottom: 10px;
    }
    
    .sop-resources ul {
      padding-left: 20px;
    }
    
    .sop-resources a {
      color: #0066cc;
      text-decoration: none;
    }
    
    .sop-resources a:hover {
      text-decoration: underline;
    }
    
    @media print {
      .sop-step {
        page-break-inside: avoid;
      }
      
      body {
        padding: 0;
        font-size: 12px;
      }
    }
    
    @media (max-width: 768px) {
      body {
        padding: 15px;
      }
      
      .sop-title {
        font-size: 24px;
      }
    }
  `;
  
  // Compile full HTML
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>${cssStyles}</style>
    </head>
    <body>
      <div class="sop-header">
        ${sopDocument.logo ? `<div class="sop-logo"><img src="${sopDocument.logo}" alt="${companyName} Logo" /></div>` : ''}
        <h1 class="sop-title">${title}</h1>
        ${sopDocument.topic ? `<div class="sop-topic">${sopDocument.topic}</div>` : ''}
        ${companyName ? `<div class="sop-company">${companyName}</div>` : ''}
        <div class="sop-date">Date: ${date}</div>
      </div>
      
      ${tableOfContentsHtml}
      
      <div class="sop-content">
        ${stepsHtml}
      </div>
      
      <footer>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </footer>
    </body>
    </html>
  `;
  
  return { html, estimatedSize: totalEstimatedSize };
}

/**
 * Generate table of contents HTML
 */
function generateTableOfContents(steps: SopStep[]): string {
  if (!steps || steps.length === 0) return '';
  
  const listItems = steps.map((step, index) => {
    return `<li><a href="#step-${index + 1}">${step.title || `Step ${index + 1}`}</a></li>`;
  }).join('');
  
  return `
    <div class="sop-toc">
      <h2>Table of Contents</h2>
      <ul>${listItems}</ul>
    </div>
  `;
}

/**
 * Create a ZIP package for HTML export with assets
 */
async function createHtmlZipPackage(
  sopDocument: SopDocument,
  html: string,
  processedSteps: (SopStep & { processedScreenshot?: string; secondaryProcessedScreenshot?: string })[]
): Promise<void> {
  try {
    const zip = new JSZip();
    const title = sopDocument.title || "SOP";
    
    // Add index.html
    const modifiedHtml = createZipFriendlyHtml(html, processedSteps);
    zip.file("index.html", modifiedHtml);
    
    // Add assets folder for images
    const assets = zip.folder("assets");
    
    // Add logo if exists
    if (sopDocument.logo) {
      assets?.file("logo.jpg", sopDocument.logo.split(",")[1], { base64: true });
    }
    
    // Add screenshots to assets
    processedSteps.forEach((step, index) => {
      if (step.processedScreenshot) {
        const imageData = step.processedScreenshot.split(",")[1];
        assets?.file(`screenshot_${index + 1}.jpg`, imageData, { base64: true });
      }
      
      if (step.secondaryProcessedScreenshot) {
        const imageData = step.secondaryProcessedScreenshot.split(",")[1];
        assets?.file(`screenshot_${index + 1}_2.jpg`, imageData, { base64: true });
      }
    });
    
    // Generate the ZIP file
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `${title}.zip`);
  } catch (error) {
    console.error("Error creating ZIP package:", error);
    throw error;
  }
}

/**
 * Create ZIP-friendly HTML with local asset references
 */
function createZipFriendlyHtml(
  html: string,
  processedSteps: (SopStep & { processedScreenshot?: string; secondaryProcessedScreenshot?: string })[]
): string {
  let zipHtml = html;
  
  // Replace logo
  if (zipHtml.includes('class="sop-logo"><img src="data:')) {
    zipHtml = zipHtml.replace(
      /<div class="sop-logo"><img src="[^"]+" alt="([^"]+)" \/><\/div>/,
      '<div class="sop-logo"><img src="assets/logo.jpg" alt="$1" /></div>'
    );
  }
  
  // Replace screenshots
  processedSteps.forEach((step, index) => {
    if (step.processedScreenshot) {
      const regex = new RegExp(`<img src="${escapeRegExp(step.processedScreenshot)}"`, 'g');
      zipHtml = zipHtml.replace(regex, `<img src="assets/screenshot_${index + 1}.jpg"`);
    }
    
    if (step.secondaryProcessedScreenshot) {
      const regex = new RegExp(`<img src="${escapeRegExp(step.secondaryProcessedScreenshot)}"`, 'g');
      zipHtml = zipHtml.replace(regex, `<img src="assets/screenshot_${index + 1}_2.jpg"`);
    }
  });
  
  return zipHtml;
}

/**
 * Helper to escape special characters in RegExp
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
