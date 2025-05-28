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
  
  // Extract customization options
  const customization = options.customization || {};
  const primaryColor = customization.primaryColor || "#007AFF";
  const accentColor = customization.accentColor || "#5856D6";
  const fontFamily = customization.fontFamily || "system";
  const headerStyle = customization.headerStyle || "modern";
  const layout = customization.layout || "standard";
  
  const title = sopDocument.title || "Standard Operating Procedure";
  const companyName = sopDocument.companyName || "Your Organization";
  const currentYear = new Date().getFullYear();
  
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
                        <div class="screenshot-wrapper" style="position: relative; display: inline-block; width: 100%;">
                            <img src="${step.screenshot.dataUrl}" alt="Step ${stepNumber} Screenshot" class="step-screenshot" style="width: 100%; height: auto; display: block;" />
                            ${step.screenshot.callouts && step.screenshot.callouts.length > 0 ? 
                              step.screenshot.callouts.map((callout: any, calloutIndex: number) => {
                                const calloutNumber = calloutIndex + 1;
                                
                                // Calculate precise positioning
                                const leftPos = callout.x || 0;
                                const topPos = callout.y || 0;
                                const width = callout.width || 5;
                                const height = callout.height || 5;
                                
                                // Generate callout based on shape
                                if (callout.shape === 'circle') {
                                  return `
                                    <div class="callout callout-circle" style="
                                      position: absolute;
                                      left: ${leftPos}%;
                                      top: ${topPos}%;
                                      width: ${Math.max(width, 3)}%;
                                      height: ${Math.max(height, 3)}%;
                                      border: 3px solid ${callout.color || '#FF6B35'};
                                      background-color: ${callout.color || '#FF6B35'}20;
                                      border-radius: 50%;
                                      transform: translate(-50%, -50%);
                                      pointer-events: none;
                                      z-index: 10;
                                      min-width: 30px;
                                      min-height: 30px;
                                      aspect-ratio: 1 / 1;
                                    "></div>
                                  `;
                                } else if (callout.shape === 'number') {
                                  return `
                                    <div class="callout callout-number" style="
                                      position: absolute;
                                      left: ${leftPos}%;
                                      top: ${topPos}%;
                                      width: ${Math.max(width, 4)}%;
                                      height: ${Math.max(height, 4)}%;
                                      background: ${callout.color || '#FF6B35'};
                                      border: 2px solid white;
                                      border-radius: 50%;
                                      transform: translate(-50%, -50%);
                                      pointer-events: none;
                                      z-index: 10;
                                      min-width: 35px;
                                      min-height: 35px;
                                      aspect-ratio: 1 / 1;
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                      font-weight: bold;
                                      color: white;
                                      font-size: 16px;
                                      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                                    ">${callout.number || calloutNumber}</div>
                                  `;
                                } else if (callout.shape === 'rectangle') {
                                  return `
                                    <div class="callout callout-rectangle" style="
                                      position: absolute;
                                      left: ${leftPos}%;
                                      top: ${topPos}%;
                                      width: ${Math.max(width, 5)}%;
                                      height: ${Math.max(height, 3)}%;
                                      border: 3px solid ${callout.color || '#FF6B35'};
                                      background-color: ${callout.color || '#FF6B35'}20;
                                      transform: translate(-50%, -50%);
                                      pointer-events: none;
                                      z-index: 10;
                                      min-width: 40px;
                                      min-height: 25px;
                                      border-radius: 4px;
                                      ${callout.text ? `
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        font-size: 12px;
                                        color: ${callout.color || '#FF6B35'};
                                        font-weight: bold;
                                        text-align: center;
                                        padding: 2px;
                                      ` : ''}
                                    ">${callout.text || ''}</div>
                                  `;
                                } else if (callout.shape === 'arrow') {
                                  return `
                                    <div class="callout callout-arrow" style="
                                      position: absolute;
                                      left: ${leftPos}%;
                                      top: ${topPos}%;
                                      width: ${Math.max(width, 6)}%;
                                      height: ${Math.max(height, 3)}%;
                                      transform: translate(-50%, -50%);
                                      pointer-events: none;
                                      z-index: 10;
                                      min-width: 50px;
                                      min-height: 25px;
                                    ">
                                      <svg viewBox="0 0 100 40" style="width: 100%; height: 100%;">
                                        <defs>
                                          <marker id="arrowhead-${calloutIndex}" markerWidth="10" markerHeight="7" 
                                                  refX="9" refY="3.5" orient="auto">
                                            <polygon points="0 0, 10 3.5, 0 7" fill="${callout.color || '#FF6B35'}" />
                                          </marker>
                                        </defs>
                                        <line x1="10" y1="20" x2="85" y2="20" 
                                              stroke="${callout.color || '#FF6B35'}" 
                                              stroke-width="3" 
                                              marker-end="url(#arrowhead-${calloutIndex})" />
                                      </svg>
                                    </div>
                                  `;
                                }
                                
                                // Default fallback (circle)
                                return `
                                  <div class="callout callout-default" style="
                                    position: absolute;
                                    left: ${leftPos}%;
                                    top: ${topPos}%;
                                    width: ${Math.max(width, 3)}%;
                                    height: ${Math.max(height, 3)}%;
                                    border: 3px solid ${callout.color || '#FF6B35'};
                                    background-color: ${callout.color || '#FF6B35'}20;
                                    border-radius: 50%;
                                    transform: translate(-50%, -50%);
                                    pointer-events: none;
                                    z-index: 10;
                                    min-width: 30px;
                                    min-height: 30px;
                                    aspect-ratio: 1 / 1;
                                  "></div>
                                `;
                              }).join('') : ''
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
                            <div class="screenshot-wrapper" style="position: relative; display: inline-block; width: 100%;">
                                <img src="${screenshot.dataUrl}" alt="Step ${stepNumber} Screenshot ${imgIndex + 1}" class="step-screenshot" style="width: 100%; height: auto; display: block;" />
                                ${screenshot.callouts && screenshot.callouts.length > 0 ? 
                                  screenshot.callouts.map((callout: any, calloutIndex: number) => {
                                    const calloutNumber = calloutIndex + 1;
                                    
                                    // Calculate precise positioning
                                    const leftPos = callout.x || 0;
                                    const topPos = callout.y || 0;
                                    const width = callout.width || 5;
                                    const height = callout.height || 5;
                                    
                                    // Generate callout based on shape
                                    if (callout.shape === 'circle') {
                                      return `
                                        <div class="callout callout-circle" style="
                                          position: absolute;
                                          left: ${leftPos}%;
                                          top: ${topPos}%;
                                          width: ${Math.max(width, 3)}%;
                                          height: ${Math.max(height, 3)}%;
                                          border: 3px solid ${callout.color || '#FF6B35'};
                                          background-color: ${callout.color || '#FF6B35'}20;
                                          border-radius: 50%;
                                          transform: translate(-50%, -50%);
                                          pointer-events: none;
                                          z-index: 10;
                                          min-width: 30px;
                                          min-height: 30px;
                                          aspect-ratio: 1 / 1;
                                        "></div>
                                      `;
                                    } else if (callout.shape === 'number') {
                                      return `
                                        <div class="callout callout-number" style="
                                          position: absolute;
                                          left: ${leftPos}%;
                                          top: ${topPos}%;
                                          width: ${Math.max(width, 4)}%;
                                          height: ${Math.max(height, 4)}%;
                                          background: ${callout.color || '#FF6B35'};
                                          border: 2px solid white;
                                          border-radius: 50%;
                                          transform: translate(-50%, -50%);
                                          pointer-events: none;
                                          z-index: 10;
                                          min-width: 35px;
                                          min-height: 35px;
                                          aspect-ratio: 1 / 1;
                                          display: flex;
                                          align-items: center;
                                          justify-content: center;
                                          font-weight: bold;
                                          color: white;
                                          font-size: 16px;
                                          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                                        ">${callout.number || calloutNumber}</div>
                                      `;
                                    } else if (callout.shape === 'rectangle') {
                                      return `
                                        <div class="callout callout-rectangle" style="
                                          position: absolute;
                                          left: ${leftPos}%;
                                          top: ${topPos}%;
                                          width: ${Math.max(width, 5)}%;
                                          height: ${Math.max(height, 3)}%;
                                          border: 3px solid ${callout.color || '#FF6B35'};
                                          background-color: ${callout.color || '#FF6B35'}20;
                                          transform: translate(-50%, -50%);
                                          pointer-events: none;
                                          z-index: 10;
                                          min-width: 40px;
                                          min-height: 25px;
                                          border-radius: 4px;
                                          ${callout.text ? `
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            font-size: 12px;
                                            color: ${callout.color || '#FF6B35'};
                                            font-weight: bold;
                                            text-align: center;
                                            padding: 2px;
                                          ` : ''}
                                        ">${callout.text || ''}</div>
                                      `;
                                    } else if (callout.shape === 'arrow') {
                                      return `
                                        <div class="callout callout-arrow" style="
                                          position: absolute;
                                          left: ${leftPos}%;
                                          top: ${topPos}%;
                                          width: ${Math.max(width, 6)}%;
                                          height: ${Math.max(height, 3)}%;
                                          transform: translate(-50%, -50%);
                                          pointer-events: none;
                                          z-index: 10;
                                          min-width: 50px;
                                          min-height: 25px;
                                        ">
                                          <svg viewBox="0 0 100 40" style="width: 100%; height: 100%;">
                                            <defs>
                                              <marker id="arrowhead-${imgIndex}-${calloutIndex}" markerWidth="10" markerHeight="7" 
                                                      refX="9" refY="3.5" orient="auto">
                                                <polygon points="0 0, 10 3.5, 0 7" fill="${callout.color || '#FF6B35'}" />
                                              </marker>
                                            </defs>
                                            <line x1="10" y1="20" x2="85" y2="20" 
                                                  stroke="${callout.color || '#FF6B35'}" 
                                                  stroke-width="3" 
                                                  marker-end="url(#arrowhead-${imgIndex}-${calloutIndex})" />
                                          </svg>
                                        </div>
                                      `;
                                    }
                                    
                                    // Default fallback (circle)
                                    return `
                                      <div class="callout callout-default" style="
                                        position: absolute;
                                        left: ${leftPos}%;
                                        top: ${topPos}%;
                                        width: ${Math.max(width, 3)}%;
                                        height: ${Math.max(height, 3)}%;
                                        border: 3px solid ${callout.color || '#FF6B35'};
                                        background-color: ${callout.color || '#FF6B35'}20;
                                        border-radius: 50%;
                                        transform: translate(-50%, -50%);
                                        pointer-events: none;
                                        z-index: 10;
                                        min-width: 30px;
                                        min-height: 30px;
                                        aspect-ratio: 1 / 1;
                                      "></div>
                                    `;
                                  }).join('') : ''
                                }
                            </div>
                            ${screenshot.title ? `<p class="screenshot-title">${screenshot.title}</p>` : ''}
                        </div>`;
                      }
                    });
                  }
                  
                  return screenshotHtml;
                })()}
                
                ${(() => {
                  let enhancedContentHtml = '';
                  
                  // Add enhanced content blocks (tables, lists, etc.)
                  if (step.enhancedContentBlocks && step.enhancedContentBlocks.length > 0) {
                    step.enhancedContentBlocks.forEach((block: any) => {
                      switch (block.type) {
                        case 'table':
                          enhancedContentHtml += `
                            <div class="enhanced-content-block table-block">
                              ${block.title ? `<h4 class="block-title">${block.title}</h4>` : ''}
                              <div class="table-container">
                                <table class="content-table">
                                  <thead>
                                    <tr>
                                      ${block.headers.map((header: string) => `<th>${header}</th>`).join('')}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    ${block.rows.map((row: string[]) => `
                                      <tr>
                                        ${row.map((cell: string) => `<td>${cell}</td>`).join('')}
                                      </tr>
                                    `).join('')}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          `;
                          break;
                        case 'list':
                          enhancedContentHtml += `
                            <div class="enhanced-content-block list-block">
                              ${block.title ? `<h4 class="block-title">${block.title}</h4>` : ''}
                              <${block.ordered ? 'ol' : 'ul'} class="content-list">
                                ${block.items.map((item: string) => `<li>${item}</li>`).join('')}
                              </${block.ordered ? 'ol' : 'ul'}>
                            </div>
                          `;
                          break;
                        case 'text':
                          enhancedContentHtml += `
                            <div class="enhanced-content-block text-block">
                              ${block.title ? `<h4 class="block-title">${block.title}</h4>` : ''}
                              <div class="text-content">${block.content}</div>
                            </div>
                          `;
                          break;
                        case 'note':
                          enhancedContentHtml += `
                            <div class="enhanced-content-block note-block">
                              ${block.title ? `<h4 class="block-title note-title">${block.title}</h4>` : ''}
                              <div class="note-content">${block.content}</div>
                            </div>
                          `;
                          break;
                        case 'warning':
                          enhancedContentHtml += `
                            <div class="enhanced-content-block warning-block">
                              ${block.title ? `<h4 class="block-title warning-title">${block.title}</h4>` : ''}
                              <div class="warning-content">${block.content}</div>
                            </div>
                          `;
                          break;
                      }
                    });
                  }
                  
                  return enhancedContentHtml;
                })()}
                
                ${step.keyTakeaway ? `
                  <div class="key-takeaway">
                    <h4>💡 Key Takeaway</h4>
                    <p>${step.keyTakeaway}</p>
                  </div>
                ` : ''}
            </div>
        </div>
      `;
    }).join('');
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${getFontFamilyCSS(fontFamily)}
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${fontFamily === 'system' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' : fontFamily};
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            ${getLayoutSpacing(layout)}
        }
        
        .header {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            margin-bottom: 40px;
            overflow: hidden;
            position: relative;
        }
        
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 30px 40px 20px;
            background: linear-gradient(135deg, ${primaryColor}08, ${accentColor}08);
        }
        
        .header-left {
            text-align: left;
        }
        
        .company-name {
            color: ${primaryColor};
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .version {
            color: #666;
            font-size: 14px;
            background: ${primaryColor}15;
            padding: 4px 12px;
            border-radius: 20px;
            display: inline-block;
        }
        
        .header-right {
            text-align: right;
        }
        
        .document-date {
            color: #666;
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 4px;
        }
        
        .last-revised {
            color: #888;
            font-size: 14px;
        }
        
        .header-center {
            text-align: center;
            padding: 20px 40px 40px;
            ${getHeaderStyles(headerStyle, primaryColor)}
        }
        
        .title {
            font-size: 3rem;
            font-weight: 800;
            color: #1a1a1a;
            margin-bottom: 16px;
            letter-spacing: -0.02em;
        }
        
        .subtitle {
            font-size: 1.25rem;
            color: #666;
            margin-bottom: 24px;
            font-weight: 400;
        }
        
        .demo-badge {
            background: linear-gradient(135deg, ${primaryColor}, ${accentColor});
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            font-weight: 600;
            display: inline-block;
            box-shadow: 0 4px 15px ${primaryColor}40;
        }
        
        .step {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            margin-bottom: 32px;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .step:hover {
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }
        
        .step-header {
            background: linear-gradient(135deg, ${primaryColor}, ${accentColor});
            color: white;
            padding: 32px 40px;
            position: relative;
        }
        
        .step-number {
            font-size: 16px;
            font-weight: 600;
            opacity: 0.9;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .step-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 12px;
            line-height: 1.3;
        }
        
        .step-description {
            font-size: 18px;
            opacity: 0.95;
            line-height: 1.5;
        }
        
        .step-content {
            padding: 40px;
        }
        
        .screenshot-container {
            margin: 24px 0;
            text-align: center;
        }
        
        .screenshot-wrapper {
            position: relative;
            display: inline-block;
            max-width: 100%;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        }
        
        .step-screenshot {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 12px;
        }
        
        /* Callout Styles */
        .callout {
            pointer-events: none;
            z-index: 10;
            box-sizing: border-box;
        }
        
        .callout-circle {
            border-radius: 50% !important;
        }
        
        .callout-number {
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-weight: bold !important;
            color: white !important;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }
        
        .callout-rectangle {
            border-radius: 4px !important;
        }
        
        .callout-arrow {
            /* Arrow styling handled by SVG */
        }
        
        .callout-default {
            border-radius: 50% !important;
        }
        
        .screenshot-title {
            margin-top: 16px;
            font-style: italic;
            color: #666;
            font-size: 14px;
        }
        
        .key-takeaway {
            background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
            border-left: 4px solid #34C759;
            padding: 24px;
            margin: 32px 0;
            border-radius: 0 12px 12px 0;
        }
        
        .key-takeaway h4 {
            color: #2d5a2d;
            font-size: 18px;
            margin-bottom: 12px;
            font-weight: 600;
        }
        
        .key-takeaway p {
            color: #2d5a2d;
            font-size: 16px;
            line-height: 1.6;
        }
        
        /* Enhanced Content Blocks */
        .enhanced-content-block {
            margin: 24px 0;
            padding: 24px;
            border-radius: 12px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
        }
        
        .block-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: ${primaryColor};
        }
        
        .content-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        
        .content-table th,
        .content-table td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        
        .content-table th {
            background: linear-gradient(135deg, ${primaryColor}15, ${accentColor}15);
            font-weight: 600;
            color: #495057;
        }
        
        .content-list {
            padding-left: 24px;
        }
        
        .content-list li {
            margin-bottom: 8px;
            line-height: 1.6;
        }
        
        .text-content {
            line-height: 1.7;
            color: #495057;
        }
        
        .note-block {
            background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
            border-left: 4px solid #2196F3;
        }
        
        .note-title {
            color: #1976D2;
        }
        
        .note-content {
            color: #1976D2;
        }
        
        .warning-block {
            background: linear-gradient(135deg, #fff3e0, #fce4ec);
            border-left: 4px solid #FF9800;
        }
        
        .warning-title {
            color: #F57C00;
        }
        
        .warning-content {
            color: #F57C00;
        }
        
        .footer {
            margin-top: 60px;
            padding: 30px 0;
            border-top: 2px solid ${primaryColor};
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 100%;
            margin: 0 auto;
            padding: 0 40px;
        }
        
        .footer-left {
            text-align: left;
            color: #666;
            font-size: 14px;
        }
        
        .footer-right {
            text-align: right;
        }
        
        .footer-right a {
            color: ${primaryColor};
            text-decoration: none;
            font-weight: bold;
            font-size: 14px;
        }
        
        .footer-right a:hover {
            text-decoration: underline;
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
                box-shadow: none !important;
            }
            
            .header-top {
                background: white !important;
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
            
            /* Enhanced Content Blocks Print Styles */
            .enhanced-content-block {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                margin: 15px 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .content-table {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            
            .content-table th {
                background: linear-gradient(135deg, ${primaryColor}15, ${accentColor}15) !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .table-block,
            .list-block,
            .text-block,
            .note-block,
            .warning-block,
            .detailed-instructions,
            .notes-section,
            .file-link-section {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .resource-link {
                border: 2px solid ${primaryColor} !important;
                color: ${primaryColor} !important;
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
                <div class="company-name">${companyName}</div>
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
                <p>${companyName} © ${currentYear}</p>
            </div>
            <div class="footer-right">
                <p>Created by <a href="https://sopifyapp.com" target="_blank"><strong>SOPifyapp.com</strong></a></p>
            </div>
        </div>
    </div>
</body>
</html>`;
}
