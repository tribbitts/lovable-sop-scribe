
import { SopDocument } from "@/types/sop";
import { saveAs } from "file-saver";
import JSZip from "jszip";

// Generate the HTML document from the SOP data
export const generateHtml = (sopDocument: SopDocument): string => {
  const { title, topic, date, logo, steps, companyName } = sopDocument;
  
  const stepsHtml = steps.map((step, index) => {
    const stepNumber = index + 1;
    const callouts = step.screenshot?.callouts || [];
    
    const calloutsHtml = callouts.map(callout => {
      return `
        <div class="callout" style="left: ${callout.x}%; top: ${callout.y}%; width: ${callout.width}%; height: ${callout.height}%;">
          <span class="callout-number">${index + 1}</span>
        </div>
      `;
    }).join('');
    
    return `
      <div class="step-card" data-step="${stepNumber}" id="step-${stepNumber}">
        <div class="step-header">
          <div class="step-number">${stepNumber}</div>
          <h3 class="step-title">${step.title || `Step ${stepNumber}`}</h3>
        </div>
        
        <div class="step-content">
          <div class="step-description">
            <p>${step.description}</p>
          </div>
          
          ${step.detailedInstructions ? `
          <div class="step-detailed-instructions">
            <h4 class="instructions-title">Detailed Instructions</h4>
            <div class="instructions-content">${step.detailedInstructions}</div>
          </div>
          ` : ''}
          
          ${step.notes ? `
          <div class="step-notes">
            <h4 class="notes-title">Notes</h4>
            <div class="notes-content">${step.notes}</div>
          </div>
          ` : ''}
          
          ${step.fileLink ? `
          <div class="step-file-link">
            <h4 class="file-link-title">Related Files</h4>
            <a href="${step.fileLink}" target="_blank" class="file-link">${step.fileLinkText || 'View File'}</a>
          </div>
          ` : ''}
          
          ${step.screenshot ? `
          <div class="step-screenshot">
            <div class="screenshot-wrapper">
              <img src="${step.screenshot.dataUrl}" alt="Step ${stepNumber} Screenshot" />
              ${calloutsHtml}
            </div>
          </div>
          ` : ''}
          
          <div class="step-progress">
            <button class="mark-complete-button" data-step="${stepNumber}">Mark as Complete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title || 'Standard Operating Procedure'}</title>
      <style>
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
          background-color: var(--background-light);
          color: var(--text-light);
          line-height: 1.6;
        }
        
        body.dark-mode {
          background-color: var(--background-dark);
          color: var(--text-dark);
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
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 40px;
        }
        
        .dark-mode .sop-header {
          border-bottom-color: var(--border-dark);
        }
        
        .logo-container {
          display: flex;
          align-items: center;
        }
        
        .logo {
          max-height: 60px;
          max-width: 200px;
          margin-right: 20px;
        }
        
        .header-content {
          flex-grow: 1;
        }
        
        .sop-title {
          font-size: 28px;
          margin: 0;
          margin-bottom: 8px;
        }
        
        .sop-topic {
          font-size: 16px;
          color: #666;
          margin: 0;
          margin-bottom: 4px;
        }
        
        .dark-mode .sop-topic {
          color: #aaa;
        }
        
        .sop-date {
          font-size: 14px;
          color: #888;
          margin: 0;
        }
        
        .dark-mode .sop-date {
          color: #777;
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
        }
        
        /* Progress bar */
        .progress-container {
          background-color: #f0f0f0;
          border-radius: 10px;
          margin: 30px 0;
          height: 10px;
          overflow: hidden;
        }
        
        .dark-mode .progress-container {
          background-color: #333;
        }
        
        .progress-bar {
          height: 100%;
          background-color: var(--primary-color);
          width: 0%;
          transition: width 0.5s ease;
          border-radius: 10px;
        }
        
        .progress-text {
          text-align: center;
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: 500;
        }
        
        /* Step cards */
        .step-card {
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
          overflow: hidden;
        }
        
        .dark-mode .step-card {
          background-color: #1E1E1E;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        }
        
        .step-card.completed {
          border-left: 4px solid var(--step-complete-color);
        }
        
        .step-header {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          background-color: #f9f9f9;
        }
        
        .dark-mode .step-header {
          background-color: #252525;
        }
        
        .step-number {
          background-color: var(--primary-color);
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 15px;
          flex-shrink: 0;
        }
        
        .step-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .step-content {
          padding: 20px;
        }
        
        .step-description p {
          margin-top: 0;
          margin-bottom: 16px;
        }
        
        .step-detailed-instructions,
        .step-notes,
        .step-file-link {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        
        .dark-mode .step-detailed-instructions,
        .dark-mode .step-notes,
        .dark-mode .step-file-link {
          border-top-color: #333;
        }
        
        .instructions-title,
        .notes-title,
        .file-link-title {
          font-size: 16px;
          margin-top: 0;
          margin-bottom: 10px;
          color: #555;
        }
        
        .dark-mode .instructions-title,
        .dark-mode .notes-title,
        .dark-mode .file-link-title {
          color: #bbb;
        }
        
        .file-link {
          color: var(--primary-color);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }
        
        .file-link:hover {
          text-decoration: underline;
        }
        
        .step-screenshot {
          margin-top: 20px;
        }
        
        .screenshot-wrapper {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .screenshot-wrapper img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 8px;
        }
        
        .callout {
          position: absolute;
          border-radius: 50%;
          border: 3px solid var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .callout-number {
          background-color: var(--primary-color);
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
        
        .step-progress {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }
        
        .mark-complete-button {
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
        }
        
        .mark-complete-button:hover {
          background-color: #0062cc;
        }
        
        .step-card.completed .mark-complete-button {
          background-color: var(--step-complete-color);
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .sop-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .logo-container {
            margin-bottom: 15px;
          }
          
          .step-header {
            padding: 12px 15px;
          }
          
          .step-content {
            padding: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header class="sop-header">
          <div class="logo-container">
            ${logo ? `<img src="${logo}" alt="${companyName} Logo" class="logo">` : ''}
          </div>
          <div class="header-content">
            <h1 class="sop-title">${title || 'Standard Operating Procedure'}</h1>
            <p class="sop-topic">${topic || ''}</p>
            <p class="sop-date">Created: ${date}</p>
          </div>
          <button class="theme-toggle" id="theme-toggle">
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
        </header>
        
        <div class="progress-container">
          <div class="progress-bar" id="progress-bar"></div>
        </div>
        <div class="progress-text">
          <span id="progress-text">0/${steps.length} steps completed (0%)</span>
        </div>
        
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
        if (savedTheme === 'dark') {
          body.classList.add('dark-mode');
        }
        
        themeToggle.addEventListener('click', () => {
          body.classList.toggle('dark-mode');
          const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
          localStorage.setItem('sopTheme', currentTheme);
        });
        
        // Progress tracking functionality
        const totalSteps = ${steps.length};
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const markCompleteButtons = document.querySelectorAll('.mark-complete-button');
        const stepCards = document.querySelectorAll('.step-card');
        
        // Load saved progress from localStorage
        let completedSteps = [];
        const savedProgress = localStorage.getItem('sopProgress_${title ? title.replace(/[^a-zA-Z0-9]/g, '_') : 'untitled'}');
        
        if (savedProgress) {
          completedSteps = JSON.parse(savedProgress);
          updateProgressUI();
        }
        
        // Update progress when mark complete button is clicked
        markCompleteButtons.forEach(button => {
          const stepNumber = parseInt(button.getAttribute('data-step'));
          
          // Set initial state based on saved progress
          if (completedSteps.includes(stepNumber)) {
            const stepCard = document.querySelector(\`.step-card[data-step="\${stepNumber}"]\`);
            if (stepCard) stepCard.classList.add('completed');
            button.textContent = 'Completed';
          }
          
          button.addEventListener('click', () => {
            const stepCard = document.querySelector(\`.step-card[data-step="\${stepNumber}"]\`);
            
            if (completedSteps.includes(stepNumber)) {
              // Remove from completed steps
              completedSteps = completedSteps.filter(step => step !== stepNumber);
              stepCard.classList.remove('completed');
              button.textContent = 'Mark as Complete';
            } else {
              // Add to completed steps
              completedSteps.push(stepNumber);
              stepCard.classList.add('completed');
              button.textContent = 'Completed';
            }
            
            // Save progress to localStorage
            localStorage.setItem('sopProgress_${title ? title.replace(/[^a-zA-Z0-9]/g, '_') : 'untitled'}', JSON.stringify(completedSteps));
            
            // Update progress UI
            updateProgressUI();
          });
        });
        
        function updateProgressUI() {
          const completedCount = completedSteps.length;
          const progressPercentage = Math.round((completedCount / totalSteps) * 100);
          
          progressBar.style.width = \`\${progressPercentage}%\`;
          progressText.textContent = \`\${completedCount}/\${totalSteps} steps completed (\${progressPercentage}%)\`;
        }
      </script>
    </body>
    </html>
  `;
  
  return html;
};

// Create a ZIP file containing HTML and assets
export const createHtmlZip = async (sopDocument: SopDocument): Promise<Blob> => {
  const zip = new JSZip();
  const html = generateHtml(sopDocument);
  
  // Add the HTML file
  zip.file("index.html", html);
  
  // Add logo if exists
  if (sopDocument.logo) {
    try {
      // Extract base64 data if it's a data URL
      const logoData = sopDocument.logo.split(",")[1];
      if (logoData) {
        zip.file("logo.png", logoData, { base64: true });
      }
    } catch (error) {
      console.error("Failed to add logo to ZIP:", error);
    }
  }
  
  // Add screenshots
  sopDocument.steps.forEach((step, index) => {
    if (step.screenshot?.dataUrl) {
      try {
        // Extract base64 data if it's a data URL
        const screenshotData = step.screenshot.dataUrl.split(",")[1];
        if (screenshotData) {
          zip.file(`screenshot-${index + 1}.png`, screenshotData, { base64: true });
        }
      } catch (error) {
        console.error(`Failed to add screenshot ${index + 1} to ZIP:`, error);
      }
    }
  });
  
  return await zip.generateAsync({ type: "blob" });
};

// Main function to export SOP as HTML
export const exportSopAsHtml = async (sopDocument: SopDocument): Promise<void> => {
  try {
    const zipBlob = await createHtmlZip(sopDocument);
    const fileName = `${sopDocument.title || "SOP"}_${sopDocument.date || new Date().toISOString().split("T")[0]}.zip`;
    saveAs(zipBlob, fileName);
    return Promise.resolve();
  } catch (error) {
    console.error("Error exporting SOP as HTML:", error);
    return Promise.reject(error);
  }
};
