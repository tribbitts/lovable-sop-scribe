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

// Define interface for processed step with screenshots
interface ProcessedStep extends SopStep {
  processedScreenshot?: string;
  secondaryProcessedScreenshot?: string;
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
    const processedSteps: ProcessedStep[] = 
      await Promise.all(sopDocument.steps.map(async (step) => {
        // Create a copy of the step that we can modify
        const processedStep: ProcessedStep = { ...step };
        
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
  processedSteps: ProcessedStep[], 
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
    :root {
      --primary-color: #007AFF;
      --secondary-color: #1E1E1E;
      --background-light: #ffffff;
      --background-dark: #121212;
      --text-light: #333333;
      --text-dark: #ffffff;
      --border-light: #e0e0e0;
      --border-dark: #333333;
      --step-complete-color: #4CAF50;
    }
    
    /* Base styles */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: var(--background-dark);
      color: var(--text-dark);
      line-height: 1.6;
    }
    
    body.light-mode {
      background-color: var(--background-light);
      color: var(--text-light);
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    /* Header styles */
    .sop-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 0;
      border-bottom: 1px solid var(--border-dark);
      margin-bottom: 40px;
    }
    
    .light-mode .sop-header {
      border-bottom-color: var(--border-light);
    }
    
    .header-content {
      flex-grow: 1;
    }
    
    .header-controls {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .theme-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }
    
    .theme-toggle:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .light-mode .theme-toggle:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
    
    .sop-title {
      font-size: 28px;
      margin: 0;
      margin-bottom: 8px;
    }
    
    .sop-topic {
      font-size: 16px;
      color: #aaa;
      margin: 0;
      margin-bottom: 4px;
    }
    
    .light-mode .sop-topic {
      color: #666;
    }
    
    .sop-date {
      font-size: 14px;
      color: #777;
      margin: 0;
    }
    
    .sop-company {
      font-size: 16px;
      margin-bottom: 10px;
    }
    
    /* Table of Contents styles */
    .sop-toc {
      background-color: #1a1a1a;
      border-radius: 12px;
      padding: 30px;
      margin: 30px 0;
      border-left: 4px solid var(--primary-color);
    }
    
    .light-mode .sop-toc {
      background-color: #f8f9fa;
    }
    
    .sop-toc h2 {
      font-size: 24px;
      margin: 0 0 20px 0;
      color: var(--text-dark);
      font-weight: 600;
    }
    
    .light-mode .sop-toc h2 {
      color: var(--text-light);
    }
    
    .sop-toc ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .sop-toc li {
      margin-bottom: 12px;
    }
    
    .sop-toc a {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background-color: #2a2a2a;
      border-radius: 8px;
      text-decoration: none;
      color: var(--text-dark);
      transition: all 0.2s ease;
      border: 1px solid var(--border-dark);
    }
    
    .light-mode .sop-toc a {
      background-color: white;
      color: var(--text-light);
      border-color: var(--border-light);
    }
    
    .sop-toc a:hover {
      background-color: var(--primary-color);
      color: white;
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
    }
    
    /* Step styles */
    .sop-step {
      background-color: #1E1E1E;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
      margin-bottom: 30px;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .light-mode .sop-step {
      background-color: #fff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .step-header {
      padding: 20px;
      background-color: #252525;
      border-bottom: 1px solid var(--border-dark);
    }
    
    .light-mode .step-header {
      background-color: #f9f9f9;
      border-bottom-color: var(--border-light);
    }
    
    .step-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .step-content {
      padding: 20px;
    }
    
    .step-description {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 16px;
    }
    
    .step-instructions,
    .step-notes {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #333;
    }
    
    .light-mode .step-instructions,
    .light-mode .step-notes {
      border-top-color: #eee;
    }
    
    .step-instructions h4,
    .step-notes h4 {
      font-size: 16px;
      margin-top: 0;
      margin-bottom: 10px;
      color: #bbb;
    }
    
    .light-mode .step-instructions h4,
    .light-mode .step-notes h4 {
      color: #555;
    }
    
    /* Screenshot styles */
    .sop-screenshot,
    .sop-secondary-screenshot {
      margin: 20px 0;
    }
    
    .sop-screenshot img,
    .sop-secondary-screenshot img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
    
    .light-mode .sop-screenshot img,
    .light-mode .sop-secondary-screenshot img {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    /* Tags styles */
    .sop-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 15px;
    }
    
    .sop-tag {
      background-color: var(--primary-color);
      color: white;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }
    
    /* Resources styles */
    .sop-resources {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #333;
    }
    
    .light-mode .sop-resources {
      border-top-color: #eee;
    }
    
    .sop-resources h4 {
      font-size: 16px;
      margin-top: 0;
      margin-bottom: 10px;
      color: #bbb;
    }
    
    .light-mode .sop-resources h4 {
      color: #555;
    }
    
    .sop-resources ul {
      padding-left: 20px;
    }
    
    .sop-resources a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
    }
    
    .sop-resources a:hover {
      text-decoration: underline;
    }
    
    .sop-resources p {
      font-size: 14px;
      color: #aaa;
      margin: 4px 0 0 0;
    }
    
    .light-mode .sop-resources p {
      color: #666;
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .sop-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .step-header {
        padding: 15px;
      }
      
      .step-content {
        padding: 15px;
      }
      
      .sop-toc {
        padding: 20px;
      }
    }
    
    /* Print styles */
    @media print {
      .theme-toggle {
        display: none !important;
      }
      
      .sop-step {
        break-inside: avoid;
        margin-bottom: 20px;
      }
      
      .sop-screenshot img,
      .sop-secondary-screenshot img {
        max-height: 400px;
        object-fit: contain;
      }
      
      .sop-toc {
        break-inside: avoid;
      }
    }
  `;
  
  // Generate the complete HTML document
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <meta name="description" content="Self-contained SOP with embedded screenshots and interactive features">
      <style>${cssStyles}</style>
    </head>
    <body>
      <div class="container">
        <header class="sop-header">
          <div class="header-content">
            <h1 class="sop-title">${title}</h1>
            ${sopDocument.topic ? `<p class="sop-topic">${sopDocument.topic}</p>` : ''}
            <p class="sop-date">Created: ${date}</p>
            ${companyName ? `<p class="sop-company">${companyName}</p>` : ''}
          </div>
          <div class="header-controls">
            <button class="theme-toggle" id="theme-toggle" title="Toggle Light/Dark Mode">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </button>
          </div>
        </header>
        
        ${tableOfContentsHtml}
        
        <div class="steps-container">
          ${stepsHtml}
        </div>
      </div>
      
      <script>
        // Theme toggle functionality
        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;
        
        // Check if user previously set a theme preference
        const savedTheme = localStorage.getItem('sopTheme');
        if (savedTheme === 'light') {
          body.classList.add('light-mode');
        }
        
        themeToggle.addEventListener('click', () => {
          body.classList.toggle('light-mode');
          const currentTheme = body.classList.contains('light-mode') ? 'light' : 'dark';
          localStorage.setItem('sopTheme', currentTheme);
        });
        
        // Smooth scrolling for table of contents links
        document.querySelectorAll('.sop-toc a').forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              targetElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
              });
              
              // Add a brief highlight effect
              targetElement.style.transform = 'scale(1.02)';
              setTimeout(() => {
                targetElement.style.transform = '';
              }, 300);
            }
          });
        });
        
        console.log('SOP loaded successfully with ${processedSteps.length} steps');
        console.log('File contains embedded images - no external dependencies required');
      </script>
    </body>
    </html>
  `;
  
  return { html, estimatedSize: totalEstimatedSize };
}

/**
 * Generate table of contents HTML
 */
function generateTableOfContents(steps: ProcessedStep[]): string {
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
  processedSteps: ProcessedStep[]
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
  processedSteps: ProcessedStep[]
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
