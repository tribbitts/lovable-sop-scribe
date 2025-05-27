import { SopDocument } from "@/types/sop";

// Helper function to get font family CSS
function getFontFamilyCSS(fontFamily: string): string {
  switch (fontFamily) {
    case "serif":
      return "Georgia, 'Times New Roman', Times, serif";
    case "sans-serif":
      return "'Helvetica Neue', Helvetica, Arial, sans-serif";
    case "monospace":
      return "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace";
    default:
      return "'Helvetica', Arial, sans-serif";
  }
}

// Helper function to get layout spacing
function getLayoutSpacing(layout: string) {
  switch (layout) {
    case "compact":
      return { container: "20px 15px", stepPadding: "20px", stepMargin: "30px" };
    case "spacious":
      return { container: "60px 30px", stepPadding: "30px", stepMargin: "50px" };
    default:
      return { container: "40px 20px", stepPadding: "25px", stepMargin: "40px" };
  }
}

// Helper function to get header styles
function getHeaderStyles(headerStyle: string, primaryColor: string) {
  switch (headerStyle) {
    case "classic":
      return {
        background: `linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)`,
        border: `3px solid ${primaryColor}`,
        titleColor: "#2c3e50"
      };
    case "minimal":
      return {
        background: "transparent",
        border: `1px solid #e9ecef`,
        titleColor: primaryColor
      };
    case "corporate":
      return {
        background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)`,
        border: `2px solid ${primaryColor}30`,
        titleColor: primaryColor
      };
    default: // modern
      return {
        background: `linear-gradient(135deg, ${primaryColor}, #5856D6)`,
        border: "none",
        titleColor: "white"
      };
  }
}

export function generateStandardHtmlTemplate(
  sopDocument: SopDocument,
  options: any = {}
): string {
  const { steps = [] } = sopDocument;
  const title = sopDocument.title || "SOPify Training Module";
  
  // Extract customization options
  const customization = options.customization || {};
  const primaryColor = customization.primaryColor || "#007AFF";
  const accentColor = customization.accentColor || "#5856D6";
  const fontFamily = getFontFamilyCSS(customization.fontFamily || "system");
  const spacing = getLayoutSpacing(customization.layout || "standard");
  const headerStyles = getHeaderStyles(customization.headerStyle || "modern", primaryColor);
  
  // Generate steps HTML
  const generateStepsHtml = () => {
    return steps.map((step: any, index: number) => {
      const stepNumber = index + 1;
      
      return `
        <div class="step">
            <div class="step-header">
                <div class="step-number">Step ${stepNumber}</div>
                <h2 class="step-title">${step.title || `Step ${stepNumber}`}</h2>
                ${step.description ? `<p class="step-description">${step.description}</p>` : ''}
            </div>
            
            <div class="step-content">
                ${(() => {
                  let screenshotHtml = '';
                  
                  // Handle legacy single screenshot
                  if (step.screenshot && step.screenshot.dataUrl) {
                    screenshotHtml += `
                    <div class="screenshot-container">
                        <div class="screenshot-wrapper" style="position: relative; display: inline-block;">
                            <img src="${step.screenshot.dataUrl}" alt="Step ${stepNumber} Screenshot" class="step-screenshot" />
                            ${step.screenshot.callouts && step.screenshot.callouts.length > 0 ? 
                              step.screenshot.callouts.map((callout: any) => `
                                <div class="callout callout-${callout.shape}" style="
                                  position: absolute;
                                  left: ${callout.x}%;
                                  top: ${callout.y}%;
                                  width: ${callout.width}%;
                                  height: ${callout.height}%;
                                  border: 2px solid ${callout.color};
                                  background-color: ${callout.color}40;
                                  ${callout.shape === 'circle' || callout.shape === 'number' ? `
                                    border-radius: 50%;
                                    aspect-ratio: 1 / 1;
                                    min-width: 30px;
                                    min-height: 30px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                  ` : ''}
                                  ${callout.shape === 'rectangle' ? `
                                    min-width: 40px;
                                    min-height: 25px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                  ` : ''}
                                  ${callout.shape === 'arrow' ? `
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    min-width: 30px;
                                    min-height: 20px;
                                  ` : ''}
                                  ${callout.shape === 'number' ? `
                                    font-weight: bold;
                                    color: white;
                                    font-size: ${Math.max(10, callout.width * 0.6)}px;
                                    background: ${callout.revealText ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : callout.color};
                                  ` : ''}
                                ">
                                  ${callout.shape === 'number' ? callout.number : ''}
                                  ${callout.shape === 'arrow' ? `
                                    <svg viewBox="0 0 100 50" fill="none" style="width: 100%; height: 100%;">
                                      <polygon points="10,20 60,20 60,10 90,25 60,40 60,30 10,30" fill="${callout.color}" stroke="${callout.color}" stroke-width="1" />
                                    </svg>
                                  ` : ''}
                                  ${callout.text ? `<span style="color: white; font-size: 12px; text-align: center;">${callout.text}</span>` : ''}
                                </div>
                              `).join('') : ''
                            }
                        </div>
                    </div>`;
                  }
                  
                  // Handle new multiple screenshots array
                  if (step.screenshots && step.screenshots.length > 0) {
                    step.screenshots.forEach((screenshot: any, imgIndex: number) => {
                      if (screenshot.dataUrl) {
                        screenshotHtml += `
                        <div class="screenshot-container">
                            <div class="screenshot-wrapper" style="position: relative; display: inline-block;">
                                <img src="${screenshot.dataUrl}" alt="Step ${stepNumber} Screenshot ${imgIndex + 1}" class="step-screenshot" />
                                ${screenshot.callouts && screenshot.callouts.length > 0 ? 
                                  screenshot.callouts.map((callout: any) => `
                                    <div class="callout callout-${callout.shape}" style="
                                      position: absolute;
                                      left: ${callout.x}%;
                                      top: ${callout.y}%;
                                      width: ${callout.width}%;
                                      height: ${callout.height}%;
                                      border: 2px solid ${callout.color};
                                      background-color: ${callout.color}40;
                                      ${callout.shape === 'circle' || callout.shape === 'number' ? `
                                        border-radius: 50%;
                                        aspect-ratio: 1 / 1;
                                        min-width: 30px;
                                        min-height: 30px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                      ` : ''}
                                      ${callout.shape === 'rectangle' ? `
                                        min-width: 40px;
                                        min-height: 25px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                      ` : ''}
                                      ${callout.shape === 'arrow' ? `
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        min-width: 30px;
                                        min-height: 20px;
                                      ` : ''}
                                      ${callout.shape === 'number' ? `
                                        font-weight: bold;
                                        color: white;
                                        font-size: ${Math.max(10, callout.width * 0.6)}px;
                                        background: ${callout.revealText ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : callout.color};
                                      ` : ''}
                                    ">
                                      ${callout.shape === 'number' ? callout.number : ''}
                                      ${callout.shape === 'arrow' ? `
                                        <svg viewBox="0 0 100 50" fill="none" style="width: 100%; height: 100%;">
                                          <polygon points="10,20 60,20 60,10 90,25 60,40 60,30 10,30" fill="${callout.color}" stroke="${callout.color}" stroke-width="1" />
                                        </svg>
                                      ` : ''}
                                      ${callout.text ? `<span style="color: white; font-size: 12px; text-align: center;">${callout.text}</span>` : ''}
                                    </div>
                                  `).join('') : ''
                                }
                            </div>
                            ${screenshot.title ? `<p class="screenshot-title">${screenshot.title}</p>` : ''}
                        </div>`;
                      }
                    });
                  }
                  
                  return screenshotHtml;
                })()}
                
                ${step.callouts && step.callouts.length > 0 ? `
                <div class="callouts-list">
                    <h4>Key Points:</h4>
                    <ul>
                        ${step.callouts.map((callout: any) => `<li>${callout.text}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        </div>`;
    }).join('\n        ');
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${fontFamily};
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
            max-width: 900px;
            margin: 0 auto;
            padding: ${spacing.container};
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid ${primaryColor};
            padding-bottom: 30px;
            margin-bottom: 40px;
            position: relative;
        }
        
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            position: relative;
        }
        
        .header-left {
            text-align: left;
            position: absolute;
            left: 0;
            top: 0;
        }
        
        .header-right {
            text-align: right;
            position: absolute;
            right: 0;
            top: 0;
        }
        
        .company-name {
            color: ${primaryColor};
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .version {
            font-size: 0.9rem;
            color: #666;
            font-weight: 500;
        }
        
        .document-date {
            font-size: 1rem;
            color: #666;
            font-weight: 500;
            margin-bottom: 5px;
        }
        
        .last-revised {
            font-size: 0.9rem;
            color: #666;
            font-weight: 500;
        }
        
        .header-center {
            text-align: center;
            margin-top: 60px;
        }
        
        .title {
            font-size: 2.5rem;
            font-weight: bold;
            color: #1E1E1E;
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 1.2rem;
            color: #666;
            margin-bottom: 20px;
        }
        
        .demo-badge {
            background: linear-gradient(135deg, ${primaryColor}, ${accentColor});
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: bold;
            text-align: center;
            margin: 20px auto;
            display: inline-block;
            box-shadow: 0 4px 15px rgba(0, 122, 255, 0.3);
        }
        
        .step {
            margin-bottom: ${spacing.stepMargin};
            page-break-inside: avoid;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            overflow: hidden;
        }
        
        .step-header {
            background: linear-gradient(135deg, ${primaryColor}, ${accentColor});
            color: white;
            padding: ${spacing.stepPadding};
            margin-bottom: 0;
        }
        
        .step-number {
            font-size: 1.1rem;
            font-weight: bold;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        
        .step-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin: 5px 0;
        }
        
        .step-description {
            font-size: 1rem;
            opacity: 0.9;
            margin-top: 10px;
        }
        
        .step-content {
            background: white;
            border: 1px solid #e0e0e0;
            border-top: none;
            padding: ${spacing.stepPadding};
            border-radius: 0 0 12px 12px;
        }
        
        .screenshot-container {
            margin: 20px 0;
            text-align: center;
        }
        
        .step-screenshot {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            border: 1px solid #e0e0e0;
        }
        
        .screenshot-title {
            margin-top: 10px;
            font-size: 0.9rem;
            color: #666;
            font-style: italic;
        }
        
        .callouts-list {
            background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
            border-left: 4px solid #34C759;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin: 20px 0;
        }
        
        .callouts-list h4 {
            color: #2e7d32;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        
        .callouts-list ul {
            margin-left: 20px;
        }
        
        .callouts-list li {
            margin-bottom: 8px;
            color: #2e7d32;
        }
        
        .footer {
            padding: 30px;
            background: white;
            border-radius: 12px;
            margin-top: 50px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            border-top: 3px solid ${primaryColor};
        }
        
        .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .footer-left {
            text-align: left;
        }
        
        .footer-left p {
            margin: 0;
            color: #666;
            font-weight: 500;
        }
        
        .footer-right {
            text-align: right;
        }
        
        .footer-right p {
            margin: 0;
            color: #666;
        }
        
        .footer-right a {
            color: ${primaryColor};
            text-decoration: none;
            font-weight: bold;
        }
        
        /* Print-specific styles for PDF generation */
        @media print {
            @page {
                margin: 0.75in;
                size: letter;
                /* Disable browser headers/footers */
                @top-left { content: ""; }
                @top-center { content: ""; }
                @top-right { content: ""; }
                @bottom-left { content: ""; }
                @bottom-center { content: ""; }
                @bottom-right { content: ""; }
            }
            
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            body {
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                max-width: none !important;
            }
            
            .header {
                page-break-inside: avoid !important;
                margin-bottom: 30px !important;
                background: white !important;
                border-bottom: 3px solid ${primaryColor} !important;
                padding-bottom: 20px !important;
            }
            
            .header-top {
                display: flex !important;
                justify-content: space-between !important;
                align-items: flex-start !important;
                margin-bottom: 20px !important;
                width: 100% !important;
                position: relative !important;
            }
            
            .header-left {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                text-align: left !important;
                width: auto !important;
                flex: none !important;
            }
            
            .header-right {
                position: absolute !important;
                right: 0 !important;
                top: 0 !important;
                text-align: right !important;
                width: auto !important;
                flex: none !important;
            }
            
            .header-center {
                text-align: center !important;
                margin-top: 40px !important;
                width: 100% !important;
                position: relative !important;
            }
            
            .company-name,
            .version,
            .document-date,
            .last-revised {
                display: block !important;
                margin: 2px 0 !important;
                padding: 0 !important;
                line-height: 1.2 !important;
            }
            
            .demo-badge {
                background: linear-gradient(135deg, ${primaryColor}, ${accentColor}) !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .step {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                margin-bottom: 30px !important;
                box-shadow: none !important;
                border: 1px solid #e0e0e0 !important;
            }
            
            .step-header {
                background: linear-gradient(135deg, ${primaryColor}, ${accentColor}) !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color: white !important;
            }
            
            .step-content {
                background: white !important;
                border-top: none !important;
            }
            
            .step-screenshot {
                max-width: 100% !important;
                height: auto !important;
                page-break-inside: avoid !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
            }
            
            .callouts-list {
                background: linear-gradient(135deg, #e8f5e8, #f0f8f0) !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .footer {
                position: fixed !important;
                bottom: 0 !important;
                left: 0 !important;
                right: 0 !important;
                background: white !important;
                border-top: 2px solid ${primaryColor} !important;
                padding: 10px 0 !important;
                margin-top: 0 !important;
                z-index: 1000 !important;
                box-shadow: none !important;
            }
            
            .footer-content {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                max-width: 100% !important;
                margin: 0 auto !important;
                padding: 0 20px !important;
                position: relative !important;
            }
            
            .footer-left {
                position: absolute !important;
                left: 20px !important;
                text-align: left !important;
            }
            
            .footer-right {
                position: absolute !important;
                right: 20px !important;
                text-align: right !important;
            }
        }
        
        @media (max-width: 768px) {
            body {
                padding: 20px 10px;
            }
            
            .header-top {
                flex-direction: column;
                gap: 15px;
                text-align: center;
                position: relative;
            }
            
            .header-left,
            .header-right {
                position: relative;
                text-align: center;
            }
            
            .header-center {
                margin-top: 20px;
            }
            
            .title {
                font-size: 2rem;
            }
            
            .footer-content {
                flex-direction: column;
                gap: 10px;
                text-align: center;
            }
            
            .footer-left,
            .footer-right {
                position: relative;
            }
        }
    </style>
    <script>
        // Print optimization script
        window.addEventListener('beforeprint', function() {
            // Hide any browser-generated headers/footers
            document.title = '';
        });
        
        window.addEventListener('afterprint', function() {
            // Restore title after printing
            document.title = '${title}';
        });
        
        // Auto-open print dialog for demo-style PDF export
        if (window.location.search.includes('print=true')) {
            window.addEventListener('load', function() {
                setTimeout(function() {
                    window.print();
                }, 500);
            });
        }
    </script>
</head>
<body>
    <div class="header">
        <div class="header-top">
            <div class="header-left">
                ${sopDocument.companyName ? `<div class="company-name">${sopDocument.companyName}</div>` : ''}
                ${sopDocument.version ? `<div class="version">Version ${sopDocument.version}</div>` : ''}
            </div>
            <div class="header-right">
                ${sopDocument.date ? `<div class="document-date">${sopDocument.date}</div>` : ''}
                ${sopDocument.lastRevised ? `<div class="last-revised">Last Revised: ${sopDocument.lastRevised}</div>` : ''}
            </div>
        </div>
        <div class="header-center">
            <h1 class="title">${title}</h1>
            <p class="subtitle">${sopDocument.topic || 'Standard Operating Procedure'}</p>
            <div class="demo-badge">
                ✨ Professional SOPify Document
            </div>
        </div>
    </div>
    
    ${generateStepsHtml()}
    
    <div class="footer">
        <div class="footer-content">
            <div class="footer-left">
                ${sopDocument.companyName ? `<p>&copy; ${sopDocument.companyName} ${new Date().getFullYear()}</p>` : ''}
            </div>
            <div class="footer-right">
                <p>Created with <a href="https://sopifyapp.com"><strong>SOPify</strong></a></p>
            </div>
        </div>
    </div>
</body>
</html>`;
}
