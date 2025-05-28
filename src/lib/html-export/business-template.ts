import { SopDocument } from "@/types/sop";

export function generateBusinessHtmlTemplate(
  sopDocument: SopDocument,
  options: any = {}
): string {
  const { steps = [] } = sopDocument;
  
  const title = sopDocument.title || "Standard Operating Procedure";
  const companyName = sopDocument.companyName || "Your Organization";
  const currentYear = new Date().getFullYear();
  const currentDate = new Date().toLocaleDateString();
  
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
                                      border: 2px solid ${callout.color || '#FF6B35'};
                                      background-color: ${callout.color || '#FF6B35'}40;
                                      border-radius: 50%;
                                      pointer-events: none;
                                      z-index: 10;
                                      min-width: 40px;
                                      min-height: 40px;
                                      aspect-ratio: 1 / 1;
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                    ">${callout.number ? `<span style="color: white; font-weight: bold; font-size: ${Math.max(14, width * 2)}px;">${callout.number}</span>` : ''}</div>
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
                                      border: 2px solid ${callout.color || '#FF6B35'};
                                      border-radius: 50%;
                                      pointer-events: none;
                                      z-index: 10;
                                      min-width: 40px;
                                      min-height: 40px;
                                      aspect-ratio: 1 / 1;
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                      font-weight: bold;
                                      color: white;
                                      font-size: 14px;
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
                                      border: 2px solid ${callout.color || '#FF6B35'};
                                      background-color: ${callout.color || '#FF6B35'}40;
                                      pointer-events: none;
                                      z-index: 10;
                                      min-width: 40px;
                                      min-height: 25px;
                                      border-radius: 0;
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                      ${callout.text ? `
                                        font-size: 12px;
                                        color: white;
                                        font-weight: 500;
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
                                      pointer-events: none;
                                      z-index: 10;
                                      min-width: 60px;
                                      min-height: 20px;
                                      background: ${callout.color || '#FF6B35'};
                                      clip-path: polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%);
                                      display: flex;
                                      align-items: center;
                                      justify-content: flex-start;
                                      padding-left: 8px;
                                      ${callout.text ? `
                                        font-size: 11px;
                                        color: white;
                                        font-weight: 500;
                                      ` : ''}
                                    ">${callout.text || ''}</div>
                                  `;
                                }
                                return '';
                              }).join('') : ''}
                        </div>
                    </div>`;
                  }
                  
                  // Handle multiple screenshots
                  if (step.screenshots && step.screenshots.length > 0) {
                    screenshotHtml += step.screenshots.map((screenshot: any, screenshotIndex: number) => {
                      if (!screenshot.dataUrl) return '';
                      
                      return `
                      <div class="screenshot-container">
                          <div class="screenshot-wrapper" style="position: relative; display: inline-block; width: 100%; margin-bottom: 20px;">
                              <img src="${screenshot.dataUrl}" alt="Step ${stepNumber} Screenshot ${screenshotIndex + 1}" class="step-screenshot" style="width: 100%; height: auto; display: block;" />
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
                                        border: 2px solid ${callout.color || '#FF6B35'};
                                        background-color: ${callout.color || '#FF6B35'}40;
                                        border-radius: 50%;
                                        pointer-events: none;
                                        z-index: 10;
                                        min-width: 40px;
                                        min-height: 40px;
                                        aspect-ratio: 1 / 1;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                      ">${callout.number ? `<span style="color: white; font-weight: bold; font-size: ${Math.max(14, width * 2)}px;">${callout.number}</span>` : ''}</div>
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
                                        border: 2px solid ${callout.color || '#FF6B35'};
                                        border-radius: 50%;
                                        pointer-events: none;
                                        z-index: 10;
                                        min-width: 40px;
                                        min-height: 40px;
                                        aspect-ratio: 1 / 1;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        font-weight: bold;
                                        color: white;
                                        font-size: 14px;
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
                                        border: 2px solid ${callout.color || '#FF6B35'};
                                        background-color: ${callout.color || '#FF6B35'}40;
                                        pointer-events: none;
                                        z-index: 10;
                                        min-width: 40px;
                                        min-height: 25px;
                                        border-radius: 0;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        ${callout.text ? `
                                          font-size: 12px;
                                          color: white;
                                          font-weight: 500;
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
                                        pointer-events: none;
                                        z-index: 10;
                                        min-width: 60px;
                                        min-height: 20px;
                                        background: ${callout.color || '#FF6B35'};
                                        clip-path: polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%);
                                        display: flex;
                                        align-items: center;
                                        justify-content: flex-start;
                                        padding-left: 8px;
                                        ${callout.text ? `
                                          font-size: 11px;
                                          color: white;
                                          font-weight: 500;
                                        ` : ''}
                                      ">${callout.text || ''}</div>
                                    `;
                                  }
                                  return '';
                                }).join('') : ''}
                          </div>
                      </div>`;
                    }).join('');
                  }
                  
                  let contentHtml = '';
                  
                  // Handle content blocks
                  if (step.contentBlocks && step.contentBlocks.length > 0) {
                    contentHtml += step.contentBlocks.map((block: any) => {
                      switch (block.type) {
                        case 'text':
                          return `<div class="text-content">${block.content}</div>`;
                        case 'list':
                          const listItems = block.items.map((item: string) => `<li>${item}</li>`).join('');
                          return `<ul class="content-list">${listItems}</ul>`;
                        case 'table':
                          const headers = block.headers.map((header: string) => `<th>${header}</th>`).join('');
                          const rows = block.rows.map((row: string[]) => 
                            `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
                          ).join('');
                          return `<table class="content-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
                        case 'note':
                          return `
                            <div class="note-block" style="background: linear-gradient(135deg, #e3f2fd, #f3e5f5); border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                              <h4 class="note-title" style="color: #1976D2; margin-bottom: 10px;">${block.title || 'Note'}</h4>
                              <div class="note-content" style="color: #1976D2;">${block.content}</div>
                            </div>`;
                        case 'warning':
                          return `
                            <div class="warning-block" style="background: linear-gradient(135deg, #fff3e0, #fce4ec); border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                              <h4 class="warning-title" style="color: #F57C00; margin-bottom: 10px;">${block.title || 'Warning'}</h4>
                              <div class="warning-content" style="color: #F57C00;">${block.content}</div>
                            </div>`;
                        case 'checklist':
                          const checklistItems = block.items.map((item: any) => 
                            `<li class="checklist-item">
                              <input type="checkbox" ${item.completed ? 'checked' : ''} disabled>
                              <span class="${item.completed ? 'completed' : ''}">${item.text}</span>
                            </li>`
                          ).join('');
                          return `<ul class="checklist">${checklistItems}</ul>`;
                        case 'accordion':
                          return `
                            <div class="accordion-block">
                              <details>
                                <summary class="accordion-title">${block.title}</summary>
                                <div class="accordion-content">${block.content}</div>
                              </details>
                            </div>`;
                        case 'alert':
                          const alertClass = `alert-${block.variant || 'default'}`;
                          return `
                            <div class="alert-block ${alertClass}">
                              ${block.title ? `<div class="alert-title">${block.title}</div>` : ''}
                              <div>${block.content}</div>
                            </div>`;
                        default:
                          return `<div class="text-content">${block.content || ''}</div>`;
                      }
                    }).join('');
                  }
                  
                  // Handle instructions
                  if (step.instructions) {
                    contentHtml += `<div class="text-content">${step.instructions}</div>`;
                  }
                  
                  // Handle notes
                  if (step.notes) {
                    contentHtml += `
                      <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <strong>📝 Notes:</strong> ${step.notes}
                      </div>`;
                  }
                  
                  return screenshotHtml + contentHtml;
                })()}
            </div>
        </div>`;
    }).join('');
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        @page {
            size: A4;
            margin: 40px;
        }
        
        body {
            font-family: 'Helvetica', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #007AFF;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .company-name {
            color: #007AFF;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .title {
            font-size: 32px;
            font-weight: bold;
            color: #1E1E1E;
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 18px;
            color: #666;
            margin-bottom: 20px;
        }
        
        .meta-info {
            display: flex;
            justify-content: space-between;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .step {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        
        .step-header {
            background: linear-gradient(135deg, #007AFF, #5856D6);
            color: white;
            padding: 20px;
            border-radius: 12px 12px 0 0;
            margin-bottom: 0;
        }
        
        .step-number {
            font-size: 18px;
            font-weight: bold;
            opacity: 0.9;
        }
        
        .step-title {
            font-size: 24px;
            font-weight: bold;
            margin: 5px 0;
        }
        
        .step-description {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .step-content {
            background: white;
            border: 1px solid #e0e0e0;
            border-top: none;
            padding: 25px;
            border-radius: 0 0 12px 12px;
        }
        
        .step-screenshot {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            margin: 15px 0;
        }
        
        .screenshot-wrapper {
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            margin: 15px 0;
        }
        
        .content-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        
        .content-table th,
        .content-table td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        
        .content-table th {
            background: linear-gradient(135deg, #007AFF15, #5856D615);
            font-weight: 600;
            color: #495057;
        }
        
        .content-list {
            padding-left: 24px;
            margin: 15px 0;
        }
        
        .content-list li {
            margin-bottom: 8px;
            line-height: 1.6;
        }
        
        .text-content {
            line-height: 1.7;
            color: #495057;
            margin: 15px 0;
        }
        
        .note-block {
            background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .note-title {
            color: #1976D2;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .note-content {
            color: #1976D2;
        }
        
        .warning-block {
            background: linear-gradient(135deg, #fff3e0, #fce4ec);
            border-left: 4px solid #FF9800;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .warning-title {
            color: #F57C00;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .warning-content {
            color: #F57C00;
        }
        
        .checklist {
            list-style: none;
            padding: 0;
            margin: 15px 0;
        }
        
        .checklist-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            padding: 4px 0;
        }
        
        .checklist-item input[type="checkbox"] {
            margin-right: 12px;
            transform: scale(1.2);
        }
        
        .checklist-item .completed {
            text-decoration: line-through;
            opacity: 0.7;
        }
        
        .accordion-block details {
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 0;
            overflow: hidden;
            margin: 15px 0;
        }
        
        .accordion-title {
            background: #f8f9fa;
            padding: 16px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            outline: none;
            user-select: none;
        }
        
        .accordion-title:hover {
            background: #e9ecef;
        }
        
        .accordion-content {
            padding: 16px;
            line-height: 1.6;
        }
        
        .alert-block {
            border-radius: 8px;
            padding: 16px;
            border-left: 4px solid;
            margin: 15px 0;
        }
        
        .alert-default {
            background: #f8f9fa;
            border-left-color: #6c757d;
            color: #495057;
        }
        
        .alert-info {
            background: #e3f2fd;
            border-left-color: #2196F3;
            color: #1976D2;
        }
        
        .alert-warning {
            background: #fff3e0;
            border-left-color: #FF9800;
            color: #F57C00;
        }
        
        .alert-destructive {
            background: #ffebee;
            border-left-color: #f44336;
            color: #d32f2f;
        }
        
        .alert-title {
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            color: #666;
        }
        
        /* Callout styles */
        .callout {
            opacity: 1;
        }
        
        .callout-number {
            background: #007AFF !important;
            color: white !important;
        }
        
        /* Print styles */
        @media print {
            body {
                max-width: none;
                padding: 0;
                margin: 0;
            }
            
            .step {
                page-break-inside: avoid;
                margin-bottom: 25px;
            }
            
            .step-header {
                background: linear-gradient(135deg, #007AFF, #5856D6) !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color: white !important;
            }
            
            .step-content {
                background: white !important;
            }
            
            .callout {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                opacity: 1 !important;
            }
            
            .callout-number {
                background: #007AFF !important;
                color: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
        
        @media (max-width: 768px) {
            body {
                padding: 20px 10px;
            }
            
            .meta-info {
                flex-direction: column;
                gap: 10px;
            }
            
            .title {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">${companyName}</div>
        <h1 class="title">${title}</h1>
        <p class="subtitle">${sopDocument.topic || 'Standard Operating Procedure'}</p>
    </div>
    
    <div class="meta-info">
        <div><strong>Version:</strong> ${sopDocument.version || '1.0'}</div>
        <div><strong>Date:</strong> ${sopDocument.date || currentDate}</div>
        <div><strong>Department:</strong> ${sopDocument.companyName || 'Operations'}</div>
        <div><strong>Author:</strong> ${sopDocument.healthcareMetadata?.approvalSignatures?.[0]?.name || 'Document Owner'}</div>
    </div>
    
    ${generateStepsHtml()}
    
    <div class="footer">
        <p><strong>Generated by SOPify</strong></p>
        <p>Professional SOP creation and training platform</p>
    </div>
</body>
</html>`;
} 