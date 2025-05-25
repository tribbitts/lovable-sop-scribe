import JSZip from "jszip";
import { saveAs } from "file-saver";
import { SopDocument } from "@/types/sop";
import { generateEnhancedPDF, EnhancedPdfOptions } from "./pdf/enhanced-generator";
import { exportSopAsHtml, HtmlExportOptions } from "./html-export";

export interface BundleOptions {
  pdfOptions?: EnhancedPdfOptions;
  htmlOptions?: HtmlExportOptions;
  includeResources?: boolean;
  bundleName?: string;
  includeStyleGuide?: boolean;
  includeQuickReference?: boolean;
  generateThumbnails?: boolean;
  createFolderStructure?: boolean;
}

export async function generateTrainingBundle(
  sopDocument: SopDocument,
  options: BundleOptions = {}
): Promise<void> {
  try {
    console.log("Starting training bundle generation with consistent PDF styling");
    console.log("SOP Document:", sopDocument);
    console.log("Bundle Options:", options);
    
    const zip = new JSZip();
    const bundleName = options.bundleName || sopDocument.title || "Training-Package";
    
    // Progress tracking
    const updateProgress = (message: string) => {
      console.log(`Bundle Progress: ${message}`);
    };
    
    updateProgress("Generating consistent PDF manual...");
    
    // Use enhanced PDF generator with professional styling for consistency
    const pdfOptions: EnhancedPdfOptions = {
      theme: 'professional',
      includeTableOfContents: true,
      includeProgressInfo: true,
      quality: 'high',
      ...options.pdfOptions
    };
    
    try {
      console.log("Using enhanced PDF generator for consistency:", pdfOptions);
      const pdfBase64 = await generateEnhancedPDF(sopDocument, pdfOptions);
      console.log("Consistent PDF generation completed, base64 length:", pdfBase64.length);
      
      const pdfBlob = dataURItoBlob(pdfBase64);
      console.log("PDF blob created, size:", pdfBlob.size);
      
      // Add PDF to zip
      zip.file("manual/training-manual.pdf", pdfBlob);
      console.log("Consistent PDF added to ZIP");
    } catch (pdfError: any) {
      console.error("PDF generation failed:", pdfError);
      throw new Error(`PDF generation failed: ${pdfError.message}`);
    }
    
    updateProgress("Generating interactive HTML module...");
    
    
    // Define HTML options
    const htmlOptions: HtmlExportOptions = {
      mode: 'standalone',
      enhanced: true,
      enhancedOptions: {
        passwordProtection: { enabled: false },
        lmsFeatures: {
          enableNotes: true,
          enableBookmarks: true,
          enableSearch: true,
          enableProgressTracking: true
        },
        theme: 'auto',
        branding: {
          companyColors: {
            primary: '#007AFF',
            secondary: '#1E1E1E'
          }
        }
      },
      ...options.htmlOptions
    };
    
    // Create HTML content without saving to file
    const htmlContent = await generateHtmlForBundle(sopDocument, htmlOptions);
    zip.file("interactive/training-module.html", htmlContent);
    
    updateProgress("Adding resources and documentation...");
    
    // Add enhanced resources if requested
    if (options.includeResources) {
      await addBundleResources(zip, sopDocument);
    }
    
    // Add style guide if requested
    if (options.includeStyleGuide) {
      const styleGuide = generateStyleGuide(sopDocument);
      zip.file("resources/style-guide.html", styleGuide);
    }
    
    // Add quick reference if requested
    if (options.includeQuickReference) {
      const quickRef = generateQuickReference(sopDocument);
      zip.file("resources/quick-reference.md", quickRef);
    }
    
    // Generate thumbnails if requested
    if (options.generateThumbnails) {
      await generateThumbnails(zip, sopDocument);
    }
    
    // Add README file
    const readmeContent = generateReadmeContent(sopDocument);
    zip.file("README.txt", readmeContent);
    
    // Add package info
    const packageInfo = generatePackageInfo(sopDocument, pdfOptions, htmlOptions);
    zip.file("package-info.json", JSON.stringify(packageInfo, null, 2));
    
    updateProgress("Creating final bundle...");
    
    // Generate and save the bundle
    const zipBlob = await zip.generateAsync({ 
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });
    
    const filename = `${bundleName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-training-bundle.zip`;
    saveAs(zipBlob, filename);
    
    console.log(`Training bundle created successfully with consistent PDF: ${filename}`);
    
  } catch (error) {
    console.error("Error generating training bundle:", error);
    throw new Error(`Bundle generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function generateHtmlForBundle(sopDocument: SopDocument, options: HtmlExportOptions): Promise<string> {
  try {
    console.log("Generating enhanced HTML for bundle...", options);
    
    // Import the enhanced template generator
    const { generateEnhancedHtmlTemplate } = await import("./html-export/enhanced-template");
    
    // Process steps for HTML with callout processing
    const { createBase64ImageWithCallouts } = await import("./html-export/image-processor");
    
    const processedSteps = await Promise.all(
      sopDocument.steps.map(async (step, index) => {
        const processedStep: any = { ...step };
        
        // Process main screenshot with callouts
        if (step.screenshot?.dataUrl) {
          try {
            processedStep.processedScreenshot = await createBase64ImageWithCallouts(
              step.screenshot.dataUrl,
              step.screenshot.callouts || []
            );
          } catch (error) {
            console.warn(`Failed to process screenshot for step ${index + 1}:`, error);
            processedStep.processedScreenshot = step.screenshot.dataUrl;
          }
        }
        
        // Process multiple screenshots with callouts
        if (step.screenshots && step.screenshots.length > 0) {
          try {
            processedStep.processedScreenshots = await Promise.all(
              step.screenshots.map(async (screenshot) => {
                try {
                  return await createBase64ImageWithCallouts(
                    screenshot.dataUrl,
                    screenshot.callouts || []
                  );
                } catch (error) {
                  console.warn(`Failed to process screenshot ${screenshot.id}:`, error);
                  return screenshot.dataUrl;
                }
              })
            );
          } catch (error) {
            console.warn(`Failed to process screenshots for step ${index + 1}:`, error);
            processedStep.processedScreenshots = step.screenshots?.map(s => s.dataUrl) || [];
          }
        }
        
        return processedStep;
      })
    );
    
    // Generate the enhanced HTML content
    const htmlContent = generateEnhancedHtmlTemplate(
      sopDocument, 
      processedSteps, 
      options.enhancedOptions || {}
    );
    
    console.log("Enhanced HTML generated successfully for bundle");
    return htmlContent;
    
  } catch (error) {
    console.error("Error generating enhanced HTML for bundle:", error);
    // Fallback to basic template if enhanced fails
    return await createStandaloneHtml(sopDocument, options);
  }
}

async function createStandaloneHtml(sopDocument: SopDocument, options: HtmlExportOptions): Promise<string> {
  // This is a simplified implementation
  // In a real implementation, you'd extract the HTML generation logic from exportSopAsHtml
  
  const title = sopDocument.title || "Training Module";
  const date = sopDocument.date || new Date().toLocaleDateString();
  
  const stepsHtml = sopDocument.steps.map((step, index) => {
    const stepNumber = index + 1;
    const screenshotHtml = step.screenshots && step.screenshots.length > 0
      ? step.screenshots.map(screenshot => `<img src="${screenshot.dataUrl}" alt="Step ${stepNumber} Screenshot" />`).join('')
      : step.screenshot ? `<img src="${step.screenshot.dataUrl}" alt="Step ${stepNumber} Screenshot" />` : '';
    
    return `
      <div class="training-step" id="step-${stepNumber}">
        <h2>Step ${stepNumber}: ${step.title || `Step ${stepNumber}`}</h2>
        <p>${step.description}</p>
        ${screenshotHtml}
        ${step.detailedInstructions ? `<div class="instructions">${step.detailedInstructions}</div>` : ''}
        ${step.notes ? `<div class="notes">${step.notes}</div>` : ''}
      </div>
    `;
  }).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; }
        .training-step { margin-bottom: 40px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
        img { max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px; }
        h2 { color: #007AFF; }
        .instructions, .notes { margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px; }
      </style>
    </head>
    <body>
      <header>
        <h1>${title}</h1>
        <p>Created: ${date}</p>
        ${sopDocument.companyName ? `<p>Organization: ${sopDocument.companyName}</p>` : ''}
      </header>
      <main>${stepsHtml}</main>
    </body>
    </html>
  `;
}

async function addBundleResources(zip: JSZip, sopDocument: SopDocument) {
  const resourcesFolder = zip.folder("resources");
  
  // Add company logo if available
  if (sopDocument.logo) {
    try {
      const logoBlob = dataURItoBlob(sopDocument.logo);
      resourcesFolder?.file("company-logo.png", logoBlob);
    } catch (error) {
      console.warn("Failed to add logo to bundle:", error);
    }
  }
  
  // Add background image if available
  if (sopDocument.backgroundImage) {
    try {
      const bgBlob = dataURItoBlob(sopDocument.backgroundImage);
      resourcesFolder?.file("background-image.png", bgBlob);
    } catch (error) {
      console.warn("Failed to add background image to bundle:", error);
    }
  }
  
  // Add style guide
  const styleGuide = generateStyleGuide(sopDocument);
  resourcesFolder?.file("style-guide.css", styleGuide);
}

function generateReadmeContent(sopDocument: SopDocument): string {
  return `
# Training Package: ${sopDocument.title || 'Untitled'}

This training package contains comprehensive learning materials for your training program.

## Package Contents

### 📄 Manual (manual/training-manual.pdf)
- High-quality PDF document with professional formatting
- Printable reference guide
- Comprehensive step-by-step instructions
- Visual diagrams and screenshots

### 🌐 Interactive Module (interactive/training-module.html)
- Interactive HTML-based training experience
- Progress tracking and completion status
- Embedded multimedia content
- Works offline in any modern web browser

### 📁 Resources (resources/)
- Company branding assets
- Style guide and templates
- Additional reference materials

## Getting Started

1. **For Interactive Learning**: Open 'interactive/training-module.html' in your web browser
2. **For Reference**: Use 'manual/training-manual.pdf' as a printable guide
3. **For Customization**: Check the resources folder for branding assets

## System Requirements

- **PDF Manual**: Any PDF viewer (Adobe Reader, browser PDF viewer, etc.)
- **Interactive Module**: Modern web browser (Chrome, Firefox, Safari, Edge)
- **No internet connection required** - all content is self-contained

## Support

For technical support or questions about this training package, please contact your training administrator.

---

Created: ${sopDocument.date || new Date().toLocaleDateString()}
${sopDocument.companyName ? `Organization: ${sopDocument.companyName}` : ''}
Generated by SOPify Training Platform
`;
}

function generatePackageInfo(
  sopDocument: SopDocument,
  pdfOptions: EnhancedPdfOptions,
  htmlOptions: HtmlExportOptions
) {
  return {
    package: {
      name: sopDocument.title || "Training Package",
      version: "1.0.0",
      created: new Date().toISOString(),
      generator: "SOPify Training Platform"
    },
    content: {
      title: sopDocument.title,
      topic: sopDocument.topic,
      description: sopDocument.description,
      company: sopDocument.companyName,
      stepCount: sopDocument.steps.length,
      hasLogo: !!sopDocument.logo,
      hasBackgroundImage: !!sopDocument.backgroundImage
    },
    options: {
      pdf: pdfOptions,
      html: htmlOptions
    },
    files: [
      {
        path: "manual/training-manual.pdf",
        type: "PDF Manual",
        description: "Professional training manual in PDF format"
      },
      {
        path: "interactive/training-module.html", 
        type: "Interactive Module",
        description: "Web-based interactive training experience"
      },
      {
        path: "README.txt",
        type: "Documentation",
        description: "Package overview and instructions"
      }
    ]
  };
}

function generateStyleGuide(sopDocument: SopDocument): string {
  return `
/* SOPify Training Package Style Guide */

:root {
  --primary-color: #007AFF;
  --secondary-color: #1E1E1E;
  --background-color: #FFFFFF;
  --text-color: #2D2D2D;
  --text-light: #6B7280;
  --border-color: #E5E5E5;
  --success-color: #4CAF50;
  --warning-color: #FF9800;
  --error-color: #F44336;
}

/* Typography */
.heading-primary { font-size: 2rem; font-weight: 700; color: var(--text-color); }
.heading-secondary { font-size: 1.5rem; font-weight: 600; color: var(--text-color); }
.text-body { font-size: 1rem; font-weight: 400; color: var(--text-color); }
.text-caption { font-size: 0.875rem; font-weight: 400; color: var(--text-light); }

/* Components */
.step-card { 
  border: 1px solid var(--border-color); 
  border-radius: 8px; 
  padding: 20px; 
  margin-bottom: 20px; 
}

.step-number {
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.screenshot-container {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 10px;
  margin: 15px 0;
}

/* Branding */
${sopDocument.companyName ? `
.company-branding {
  font-family: inherit;
  color: var(--primary-color);
  font-weight: 600;
}
` : ''}
`;
}

function generateQuickReference(sopDocument: SopDocument): string {
  const stepsText = sopDocument.steps.map((step, index) => {
    const stepNumber = index + 1;
    return `${stepNumber}. ${step.title || `Step ${stepNumber}`}\n   ${step.description || 'No description available'}`;
  }).join('\n\n');
  
  return `# Quick Reference Guide: ${sopDocument.title || 'Training Module'}

## Overview
${sopDocument.description || 'No description available'}

## Steps Summary
${stepsText}

## Key Information
- Total Steps: ${sopDocument.steps.length}
- Company: ${sopDocument.companyName || 'Not specified'}
- Topic: ${sopDocument.topic || 'Not specified'}
- Created: ${sopDocument.date || new Date().toLocaleDateString()}

## Notes
This quick reference is designed for easy lookup during training or as a refresher after completing the full module.
`;
}

async function generateThumbnails(zip: JSZip, sopDocument: SopDocument): Promise<void> {
  try {
    const thumbnailsFolder = zip.folder("resources/thumbnails");
    
    for (let i = 0; i < sopDocument.steps.length; i++) {
      const step = sopDocument.steps[i];
      const stepNumber = i + 1;
      
      // Handle both single screenshot and multiple screenshots
      const screenshots = step.screenshots && step.screenshots.length > 0 
        ? step.screenshots 
        : step.screenshot ? [step.screenshot] : [];
      
      for (let j = 0; j < screenshots.length; j++) {
        const screenshot = screenshots[j];
        if (screenshot && screenshot.dataUrl) {
          try {
            // Convert data URL to blob for thumbnail
            const blob = dataURItoBlob(screenshot.dataUrl);
            
            // Create a simple filename for the thumbnail
            const filename = `step-${stepNumber}${screenshots.length > 1 ? `-${j + 1}` : ''}-thumb.jpg`;
            
            // For now, just use the original image as thumbnail
            // In a more advanced implementation, you could resize the image
            thumbnailsFolder?.file(filename, blob);
            
            console.log(`Generated thumbnail: ${filename}`);
          } catch (error) {
            console.warn(`Failed to generate thumbnail for step ${stepNumber}, screenshot ${j + 1}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error generating thumbnails:", error);
    throw error;
  }
}

function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeString });
}
