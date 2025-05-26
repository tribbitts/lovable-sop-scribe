
import { SopDocument } from "@/types/sop";

export function generateStandardHtmlTemplate(
  sopDocument: SopDocument,
  options: any = {}
): string {
  const { steps = [] } = sopDocument;
  const title = sopDocument.title || "SOPify Training Module";
  
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
                
                ${step.screenshot ? `
                <div class="screenshot-container">
                    <img src="${step.screenshot.dataUrl}" alt="Step ${stepNumber} Screenshot" class="step-screenshot" />
                </div>
                ` : ''}
                
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #007AFF;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            font-size: 1.1rem;
        }
        
        .step-container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .step-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .step-number {
            background: #007AFF;
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
        
        .callouts-list {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #007AFF;
        }
        
        .callouts-list h4 {
            margin-bottom: 10px;
            color: #007AFF;
        }
        
        .callouts-list ul {
            margin-left: 20px;
        }
        
        .callouts-list li {
            margin-bottom: 5px;
        }
        
        .footer {
            text-align: center;
            padding: 30px;
            background: white;
            border-radius: 12px;
            margin-top: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 20px 10px;
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
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">${title}</h1>
            <p class="subtitle">${sopDocument.topic || 'Standard Operating Procedure'}</p>
        </div>
        
        ${generateStepsHtml()}
        
        <div class="footer">
            <p>Created with <strong>SOPify</strong> - Professional SOP Management Platform</p>
            <p style="margin-top: 10px; color: #666;">Visit <a href="https://sopifyapp.com" style="color: #007AFF;">sopifyapp.com</a> to create your own SOPs</p>
        </div>
    </div>
</body>
</html>`;
}
