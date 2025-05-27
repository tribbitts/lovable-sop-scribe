
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
      return "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  }
}

// Helper function to get layout spacing
function getLayoutSpacing(layout: string) {
  switch (layout) {
    case "compact":
      return { container: "20px 15px", stepPadding: "20px", stepMargin: "20px" };
    case "spacious":
      return { container: "60px 30px", stepPadding: "40px", stepMargin: "40px" };
    default:
      return { container: "40px 20px", stepPadding: "30px", stepMargin: "30px" };
  }
}

// Helper function to get header styles
function getHeaderStyles(headerStyle: string, primaryColor: string) {
  switch (headerStyle) {
    case "classic":
      return {
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
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
        background: "white",
        border: "none",
        titleColor: primaryColor
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
        <div class="step-container">
            <div class="step-header">
                <div class="step-number">${stepNumber}</div>
                <h2 class="step-title">${step.title || `Step ${stepNumber}`}</h2>
            </div>
            <div class="step-content">
                <p class="step-description">${step.description || 'Complete this step to continue.'}</p>
                
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
                                  ${callout.shape === 'circle' || callout.shape === 'number' ? 'border-radius: 50%;' : ''}
                                  ${callout.shape === 'number' ? `
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-weight: bold;
                                    color: white;
                                    font-size: ${Math.max(10, callout.width * 0.6)}px;
                                    background: ${callout.revealText ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : callout.color};
                                  ` : ''}
                                  ${callout.shape === 'arrow' ? `
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                  ` : ''}
                                ">
                                  ${callout.shape === 'number' ? callout.number : ''}
                                  ${callout.shape === 'arrow' ? `
                                    <svg viewBox="0 0 100 50" fill="${callout.color}" style="width: 100%; height: 100%;">
                                      <polygon points="10,20 60,20 60,10 90,25 60,40 60,30 10,30" fill="${callout.color}" />
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
                                      ${callout.shape === 'circle' || callout.shape === 'number' ? 'border-radius: 50%;' : ''}
                                      ${callout.shape === 'number' ? `
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        font-weight: bold;
                                        color: white;
                                        font-size: ${Math.max(10, callout.width * 0.6)}px;
                                        background: ${callout.revealText ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : callout.color};
                                      ` : ''}
                                      ${callout.shape === 'arrow' ? `
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                      ` : ''}
                                    ">
                                      ${callout.shape === 'number' ? callout.number : ''}
                                      ${callout.shape === 'arrow' ? `
                                        <svg viewBox="0 0 100 50" fill="${callout.color}" style="width: 100%; height: 100%;">
                                          <polygon points="10,20 60,20 60,10 90,25 60,40 60,30 10,30" fill="${callout.color}" />
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
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: ${spacing.container};
        }
        
        .header {
            margin-bottom: 40px;
            padding: 30px;
            background: ${headerStyles.background};
            border: ${headerStyles.border};
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
        }
        
        .header-left {
            text-align: left;
        }
        
        .header-right {
            text-align: right;
        }
        
        .company-name {
            font-size: 1.2rem;
            font-weight: 600;
            color: #666;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .version {
            font-size: 0.9rem;
            color: #888;
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
            color: #888;
            font-weight: 500;
        }
        
        .header-center {
            text-align: center;
        }
        
        .title {
            font-size: 2.5rem;
            font-weight: 700;
            color: ${headerStyles.titleColor};
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            font-size: 1.1rem;
        }
        
        .step-container {
            background: white;
            border-radius: 12px;
            padding: ${spacing.stepPadding};
            margin-bottom: ${spacing.stepMargin};
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .step-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .step-number {
            background: ${primaryColor};
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 20px;
            font-size: 18px;
        }
        
        .step-title {
            font-size: 1.5em;
            color: #333;
            font-weight: 600;
        }
        
        .step-description {
            font-size: 1.1em;
            margin-bottom: 20px;
            line-height: 1.6;
        }
        
        .screenshot-container {
            margin: 20px 0;
            text-align: center;
        }
        
        .step-screenshot {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .screenshot-title {
            margin-top: 8px;
            font-size: 0.9em;
            color: #666;
            font-style: italic;
        }
        
        .callouts-list {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid ${accentColor};
        }
        
        .callouts-list h4 {
            margin-bottom: 10px;
            color: ${accentColor};
        }
        
        .callouts-list ul {
            margin-left: 20px;
        }
        
        .callouts-list li {
            margin-bottom: 5px;
        }
        
        .footer {
            padding: 30px;
            background: white;
            border-radius: 12px;
            margin-top: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .footer-left p {
            margin: 0;
            color: #666;
            font-weight: 500;
        }
        
        .footer-right p {
            margin: 0;
            color: #666;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 20px 10px;
            }
            
            .header-top {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }
            
            .header-left,
            .header-right {
                text-align: center;
            }
            
            .step-header {
                flex-direction: column;
                text-align: center;
            }
            
            .step-number {
                margin-right: 0;
                margin-bottom: 10px;
            }
            
            .title {
                font-size: 2rem;
            }
            
            .footer-content {
                flex-direction: column;
                gap: 10px;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
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
            </div>
        </div>
        
        ${generateStepsHtml()}
        
        <div class="footer">
            <div class="footer-content">
                <div class="footer-left">
                    ${sopDocument.companyName ? `<p>&copy; ${sopDocument.companyName} ${new Date().getFullYear()}</p>` : ''}
                </div>
                <div class="footer-right">
                    <p>Created with <a href="https://sopifyapp.com" style="color: ${primaryColor}; text-decoration: none;"><strong>SOPify</strong></a></p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}
