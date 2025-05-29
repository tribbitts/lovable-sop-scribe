import { SopDocument } from "@/types/sop";
import { generateStandardHtmlTemplate } from "../html-export/standard-template";

export interface HtmlToPdfOptions {
  includeTableOfContents?: boolean;
  includeProgressInfo?: boolean;
  branding?: {
    companyColors?: {
      primary: string;
      secondary: string;
    };
  };
}

export async function generateHtmlToPdf(
  sopDocument: SopDocument,
  options: HtmlToPdfOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      console.log("Generating HTML template for PDF conversion");
      
      // Use our enhanced HTML template with beautiful styling
      const htmlContent = generateStandardHtmlTemplate(sopDocument, {
        customization: {
          primaryColor: "#007AFF",
          accentColor: "#5856D6",
          fontFamily: "system",
          headerStyle: "modern",
          layout: "standard"
        }
      });
      
      // Create a new window for printing with print parameter
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window. Please allow popups for this site.');
      }
      
      // Write the HTML content
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          
          // Listen for print completion
          printWindow.onafterprint = () => {
            printWindow.close();
            resolve('PDF generation initiated via browser print dialog');
          };
          
          // Fallback: close window after delay if print dialog is cancelled
          setTimeout(() => {
            if (!printWindow.closed) {
              printWindow.close();
              resolve('PDF generation window closed');
            }
          }, 30000); // 30 second timeout
        }, 500); // Small delay to ensure content is rendered
      };
      
    } catch (error) {
      console.error("HTML-to-PDF generation error:", error);
      reject(error);
    }
  });
}

function createBusinessDemoHtml(sopDocument: SopDocument, options: HtmlToPdfOptions): string {
  const filteredSteps = sopDocument.steps.map(step => ({
    ...step,
    // Remove ITM-only content for PDF
    quizQuestions: step.quizQuestions?.filter(q => q) || [],
    resources: step.resources?.filter(r => r) || [],
    healthcareContent: step.healthcareContent?.filter(hc => hc) || [],
    learningObjectives: step.learningObjectives?.filter(lo => lo) || [],
    contentBlocks: step.contentBlocks?.filter(cb => cb) || [],
    itmOnlyContent: undefined
  }));

  const companyName = sopDocument.companyName || "Your Organization";
  const title = sopDocument.title || "Professional Training Module";
  const subtitle = sopDocument.topic || "Standard Operating Procedure";
  const currentDate = sopDocument.date || new Date().toLocaleDateString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - SOPify Business Demo</title>
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
        
        .demo-badge {
            background: linear-gradient(135deg, #007AFF, #5856D6);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
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
        
        .key-takeaway {
            background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
            border-left: 4px solid #34C759;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .key-takeaway h4 {
            color: #2e7d32;
            margin-bottom: 10px;
        }
        
        .tags {
            margin: 15px 0;
        }
        
        .tag {
            background: #007AFF;
            color: white;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            margin-right: 8px;
            display: inline-block;
        }
        
        .quiz-section {
            background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
            border: 1px solid #007AFF;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .quiz-header {
            color: #007AFF;
            font-weight: bold;
            margin-bottom: 15px;
        }
        
        .resources {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            color: #666;
        }
        
        .content-block {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
        }
        
        .content-block h4 {
            color: #007AFF;
            margin-bottom: 10px;
        }
        
        .healthcare-content {
            background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
            border-left: 4px solid #34C759;
            padding: 15px;
            margin: 15px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .healthcare-content.critical {
            background: linear-gradient(135deg, #ffeaea, #fff0f0);
            border-left-color: #ef4444;
        }
        
        .healthcare-content h4 {
            color: #2e7d32;
            margin-bottom: 10px;
        }
        
        .healthcare-content.critical h4 {
            color: #dc2626;
        }
        
        @media print {
            body {
                max-width: none;
                padding: 0;
            }
            
            .step {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">${companyName}</div>
        <h1 class="title">${title}</h1>
        <p class="subtitle">${subtitle}</p>
        
        <div class="demo-badge">
            🚀 SOPify Business Tier Demo - Professional Features Showcase
        </div>
    </div>
    
    <div class="meta-info">
        <div><strong>Version:</strong> 1.0</div>
        <div><strong>Date:</strong> ${currentDate}</div>
        <div><strong>Author:</strong> ${companyName}</div>
        <div><strong>Steps:</strong> ${filteredSteps.length}</div>
    </div>
    
    ${generateStepsHtml(filteredSteps)}
    
    <div class="footer">
        <p><strong>Generated by SOPify Business</strong></p>
        <p>Professional SOP creation and training platform</p>
        <p style="font-size: 12px; color: #999;">This is a demonstration of SOPify's Business tier capabilities</p>
    </div>
</body>
</html>`;
}

function generateStepsHtml(steps: any[]): string {
  return steps.map((step, index) => {
    const stepNumber = index + 1;
    const stepTitle = step.title || `Step ${stepNumber}`;
    const stepDescription = step.description || "";
    
    let contentHtml = "";
    
    // Add content blocks
    if (step.contentBlocks && step.contentBlocks.length > 0) {
      step.contentBlocks.forEach((block: any) => {
        contentHtml += `
          <div class="content-block">
            <h4>${block.title || ''}</h4>
            ${block.content ? `<div>${block.content}</div>` : ''}
            ${block.items && block.items.length > 0 ? `
              <ul>
                ${block.items.map((item: string) => `<li>${item}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `;
      });
    }
    
    // Add healthcare content
    if (step.healthcareContent && step.healthcareContent.length > 0) {
      step.healthcareContent.forEach((hc: any) => {
        const isCritical = hc.priority === 'high' || hc.type === 'critical-safety';
        contentHtml += `
          <div class="healthcare-content ${isCritical ? 'critical' : ''}">
            <h4>${hc.title || ''}</h4>
            ${hc.content ? `<div>${hc.content}</div>` : ''}
            ${hc.items && hc.items.length > 0 ? `
              <ul>
                ${hc.items.map((item: string) => `<li>${item}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `;
      });
    }
    
    // Add key takeaway
    if (step.keyTakeaway) {
      contentHtml += `
        <div class="key-takeaway">
          <h4>🎯 Key Takeaway</h4>
          <p>${step.keyTakeaway}</p>
        </div>
      `;
    }
    
    // Add tags
    if (step.tags && step.tags.length > 0) {
      contentHtml += `
        <div class="tags">
          ${step.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
        </div>
      `;
    }
    
    // Add estimated time
    if (step.estimatedTime) {
      contentHtml += `<p><strong>⏱️ Estimated Time:</strong> ${step.estimatedTime}</p>`;
    }
    
    // Add notes
    if (step.notes) {
      contentHtml += `
        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <strong>📝 Notes:</strong> ${step.notes}
        </div>
      `;
    }
    
    // Add quiz questions
    if (step.quizQuestions && step.quizQuestions.length > 0) {
      contentHtml += `
        <div class="quiz-section">
          <div class="quiz-header">🧠 Knowledge Check</div>
          ${step.quizQuestions.map((quiz: any) => `
            <div style="margin-bottom: 15px;">
              <p><strong>Q: ${quiz.question}</strong></p>
              ${quiz.options && quiz.options.length > 0 ? `
                <ul style="margin: 10px 0; padding-left: 20px;">
                  ${quiz.options.map((option: string) => `<li>${option}</li>`).join('')}
                </ul>
              ` : ''}
              ${quiz.correctAnswer ? `
                <p style="color: #34C759;"><strong>✅ Answer:</strong> ${quiz.correctAnswer}</p>
              ` : ''}
              ${quiz.explanation ? `
                <p style="font-style: italic; color: #666;"><strong>Explanation:</strong> ${quiz.explanation}</p>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }
    
    // Add resources
    if (step.resources && step.resources.length > 0) {
      contentHtml += `
        <div class="resources">
          <h4 style="color: #f57c00; margin-bottom: 10px;">📚 Resources</h4>
          ${step.resources.map((resource: any) => `
            <div style="margin-bottom: 10px;">
              <strong>${resource.title || 'Resource'}:</strong> ${resource.description || ''}<br>
              ${resource.url ? `<a href="${resource.url}" style="color: #007AFF;">${resource.url}</a>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }
    
    return `
      <div class="step">
        <div class="step-header">
          <div class="step-number">Step ${stepNumber}</div>
          <h2 class="step-title">${stepTitle}</h2>
          ${stepDescription ? `<p class="step-description">${stepDescription}</p>` : ''}
        </div>
        
        <div class="step-content">
          ${contentHtml || '<p>No additional content for this step.</p>'}
        </div>
      </div>
    `;
  }).join('');
}

// Alternative function for direct download (using modern browser APIs)
export async function generateAndDownloadPdf(
  sopDocument: SopDocument,
  options: HtmlToPdfOptions = {}
): Promise<void> {
  try {
    // Check if browser supports the new print API
    if ('showSaveFilePicker' in window) {
      // Use modern file system API for better UX
      const htmlContent = createBusinessDemoHtml(sopDocument, options);
      
      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Open in new tab for printing
      const printTab = window.open(url, '_blank');
      if (printTab) {
        printTab.onload = () => {
          setTimeout(() => {
            printTab.print();
          }, 500);
        };
      }
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 10000);
      
    } else {
      // Fallback to standard approach
      await generateHtmlToPdf(sopDocument, options);
    }
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
} 