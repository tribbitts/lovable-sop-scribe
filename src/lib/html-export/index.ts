import { SopDocument } from "@/types/sop";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { 
  createBase64ImageWithCallouts, 
  estimateBase64ImageSize, 
  formatFileSize 
} from "./image-processor";

export interface HtmlExportOptions {
  mode: 'zip' | 'standalone';
  quality?: number; // JPEG quality for standalone mode (0.1 - 1.0)
}

// Generate the HTML document from the SOP data with Base64 inline images
export const generateStandaloneHtml = async (
  sopDocument: SopDocument, 
  options: HtmlExportOptions = { mode: 'standalone', quality: 0.85 }
): Promise<{ html: string; estimatedSize: number }> => {
  const { title, topic, date, logo, steps, companyName, tableOfContents } = sopDocument;
  let totalEstimatedSize = 0;
  
  // Collect all unique tags from all steps for SOP-level display
  const allTags = new Set();
  steps.forEach(step => {
    if (step.tags && step.tags.length > 0) {
      step.tags.forEach(tag => allTags.add(tag));
    }
  });
  
  // Generate SOP-level tags HTML
  const sopTagsHtml = allTags.size > 0 ? `
    <div class="sop-tags">
      <h3 class="sop-tags-title">Related Topics</h3>
      <div class="sop-tags-container">
        ${Array.from(allTags).map(tag => `<span class="sop-tag">${tag}</span>`).join('')}
      </div>
    </div>
  ` : '';
  
  // Process all screenshots and convert to Base64 with callouts
  const processedSteps = await Promise.all(
    steps.map(async (step, index) => {
      let processedScreenshot = null;
      
      if (step.screenshot?.dataUrl) {
        try {
          // Create Base64 image with rendered callouts
          const base64Image = await createBase64ImageWithCallouts(
            step.screenshot.dataUrl,
            step.screenshot.callouts || []
          );
          
          // Estimate size for monitoring
          const imageSize = estimateBase64ImageSize(base64Image);
          totalEstimatedSize += imageSize;
          
          processedScreenshot = base64Image;
        } catch (error) {
          console.error(`Failed to process screenshot for step ${index + 1}:`, error);
          // Fallback to original image without callouts
          processedScreenshot = step.screenshot.dataUrl;
        }
      }
      
      return {
        ...step,
        processedScreenshot
      };
    })
  );
  
  const stepsHtml = processedSteps.map((step, index) => {
    const stepNumber = index + 1;
    
    // Generate resources HTML
    const resourcesHtml = step.resources && step.resources.length > 0 ? `
      <div class="step-resources">
        <h4 class="resources-title">Resources</h4>
        <div class="resources-container">
          ${step.resources.map(resource => `
            <div class="resource-item">
              <span class="resource-type">${resource.type === 'link' ? '🔗' : '📄'}</span>
              <div class="resource-content">
                <a href="${resource.url}" target="_blank" class="resource-link">${resource.title}</a>
                ${resource.description ? `<p class="resource-description">${resource.description}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';
    
    return `
      <div class="step-card" data-step="${stepNumber}" id="step-${stepNumber}">
        <div class="step-header" onclick="toggleStepExpansion(${stepNumber})">
          <div class="step-number">${stepNumber}</div>
          <h3 class="step-title">${step.title || `Step ${stepNumber}`}</h3>
          <span class="step-status" id="step-status-${stepNumber}" style="display: none;">Completed ✓</span>
          <span class="step-expand-icon" id="step-expand-${stepNumber}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </span>
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
          
          ${resourcesHtml}
          
          ${step.processedScreenshot ? `
          <div class="step-screenshot">
            <div class="screenshot-wrapper">
              <img src="${step.processedScreenshot}" alt="Step ${stepNumber} Screenshot with Callouts" />
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
  
  // Generate Table of Contents if enabled
  const tableOfContentsHtml = tableOfContents && steps.length > 0 ? `
    <div class="table-of-contents">
      <h2 class="toc-title">Table of Contents</h2>
      <nav class="toc-nav">
        <ol class="toc-list">
          ${steps.map((step, index) => `
            <li class="toc-item">
              <a href="#step-${index + 1}" class="toc-link">
                <span class="toc-number">${index + 1}</span>
                <span class="toc-text">${step.title || `Step ${index + 1}`}</span>
              </a>
            </li>
          `).join('')}
        </ol>
      </nav>
    </div>
  ` : '';
  
  // Process logo if exists
  let logoHtml = '';
  if (logo) {
    try {
      logoHtml = `<img src="${logo}" alt="Company Logo" class="logo" />`;
      totalEstimatedSize += estimateBase64ImageSize(logo);
    } catch (error) {
      console.error("Failed to process logo:", error);
    }
  }
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title || 'Standard Operating Procedure'}</title>
      <meta name="description" content="Self-contained SOP with embedded screenshots and interactive features">
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
        
        .header-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .compact-toggle,
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
        
        .compact-toggle:hover,
        .theme-toggle:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
        
        .dark-mode .compact-toggle:hover,
        .dark-mode .theme-toggle:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        /* Compact mode styles */
        body.compact-mode .step-card {
          margin-bottom: 15px;
        }
        
        body.compact-mode .step-content {
          padding: 15px;
        }
        
        body.compact-mode .step-header {
          padding: 10px 15px;
        }
        
        body.compact-mode .step-detailed-instructions,
        body.compact-mode .step-notes {
          margin-top: 10px;
          padding-top: 10px;
        }
        
        body.compact-mode .step-screenshot {
          margin-top: 15px;
        }
        
        body.compact-mode .screenshot-wrapper img {
          border-radius: 6px;
        }
        
        body.compact-mode .table-of-contents {
          padding: 20px;
          margin: 20px 0;
        }
        
        body.compact-mode .toc-link {
          padding: 8px 12px;
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
        
        .file-info {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
        
        .dark-mode .file-info {
          color: #666;
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
          background-color: rgba(0, 0, 0, 0.1);
        }
        
        .dark-mode .theme-toggle:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        /* Table of Contents styles */
        .table-of-contents {
          background-color: #f8f9fa;
          border-radius: 12px;
          padding: 30px;
          margin: 30px 0;
          border-left: 4px solid var(--primary-color);
        }
        
        .dark-mode .table-of-contents {
          background-color: #1a1a1a;
          border-left-color: var(--primary-color);
        }
        
        .toc-title {
          font-size: 24px;
          margin: 0 0 20px 0;
          color: var(--text-light);
          font-weight: 600;
        }
        
        .dark-mode .toc-title {
          color: var(--text-dark);
        }
        
        .toc-nav {
          margin: 0;
        }
        
        .toc-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .toc-item {
          margin-bottom: 12px;
        }
        
        .toc-link {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background-color: white;
          border-radius: 8px;
          text-decoration: none;
          color: var(--text-light);
          transition: all 0.2s ease;
          border: 1px solid var(--border-light);
        }
        
        .dark-mode .toc-link {
          background-color: #2a2a2a;
          color: var(--text-dark);
          border-color: var(--border-dark);
        }
        
        .toc-link:hover {
          background-color: var(--primary-color);
          color: white;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
        }
        
        .toc-number {
          background-color: var(--primary-color);
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 16px;
          flex-shrink: 0;
          font-size: 14px;
        }
        
        .toc-link:hover .toc-number {
          background-color: white;
          color: var(--primary-color);
        }
        
        .toc-text {
          font-weight: 500;
          flex-grow: 1;
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
          transition: all 0.3s ease;
          scroll-margin-top: 100px; /* Account for fixed header when jumping to anchors */
        }
        
        .dark-mode .step-card {
          background-color: #1E1E1E;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        }
        
        .step-card.completed {
          border-left: 4px solid var(--step-complete-color);
          transform: translateX(2px);
        }
        
        .step-card.collapsed .step-content {
          display: none;
        }
        
        .step-card.collapsed .step-header {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .step-card.collapsed .step-header:hover {
          background-color: #f0f0f0;
        }
        
        .dark-mode .step-card.collapsed .step-header:hover {
          background-color: #333;
        }
        
        .step-header {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          background-color: #f9f9f9;
          position: relative;
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
        
        .step-card.completed .step-number {
          background-color: var(--step-complete-color);
        }
        
        .step-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          flex-grow: 1;
        }
        
        .step-status {
          font-size: 14px;
          color: var(--step-complete-color);
          font-weight: 600;
          margin-left: 10px;
        }
        
        .step-expand-icon {
          margin-left: 10px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .step-card.collapsed .step-expand-icon {
          opacity: 1;
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
        .step-tags,
        .step-resources {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        
        .dark-mode .step-detailed-instructions,
        .dark-mode .step-notes,
        .dark-mode .step-tags,
        .dark-mode .step-resources {
          border-top-color: #333;
        }
        
        .instructions-title,
        .notes-title,
        .tags-title,
        .resources-title {
          font-size: 16px;
          margin-top: 0;
          margin-bottom: 10px;
          color: #555;
        }
        
        .dark-mode .instructions-title,
        .dark-mode .notes-title,
        .dark-mode .tags-title,
        .dark-mode .resources-title {
          color: #bbb;
        }
        
        .step-screenshot {
          margin-top: 20px;
        }
        
        .screenshot-wrapper {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .dark-mode .screenshot-wrapper {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }
        
        .screenshot-wrapper img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 8px;
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
          transition: all 0.2s;
          display: flex;
          align-items: center;
        }
        
        .mark-complete-button:hover {
          background-color: #0062cc;
          transform: translateY(-1px);
        }
        
        .step-card.completed .mark-complete-button {
          background-color: var(--step-complete-color);
        }
        
        .step-card.completed .mark-complete-button:hover {
          background-color: #45a049;
        }
        
        /* Tags styles */
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .tag {
          background-color: var(--primary-color);
          color: white;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          user-select: none;
        }
        
        .tag:hover {
          background-color: #0062cc;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
        }
        
        .tag.active {
          background-color: #ff6b35;
          box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.3);
        }
        
        .tag.highlighted {
          background-color: #ff6b35;
          animation: tagPulse 0.6s ease-in-out;
        }
        
        .tag-counter {
          position: absolute;
          top: -8px;
          right: -8px;
          background-color: #ff6b35;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .tag.active .tag-counter {
          opacity: 1;
        }
        
        @keyframes tagPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .step-card.tag-highlighted {
          border-left: 4px solid #ff6b35;
          background-color: rgba(255, 107, 53, 0.05);
          transform: translateX(4px);
        }
        
        .dark-mode .step-card.tag-highlighted {
          background-color: rgba(255, 107, 53, 0.1);
        }
        
        .tag-navigation {
          position: fixed;
          top: 50%;
          right: 20px;
          transform: translateY(-50%);
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 12px;
          border-radius: 8px;
          display: none;
          flex-direction: column;
          gap: 8px;
          z-index: 1000;
          min-width: 200px;
        }
        
        .dark-mode .tag-navigation {
          background-color: rgba(255, 255, 255, 0.9);
          color: black;
        }
        
        .tag-nav-header {
          font-weight: bold;
          font-size: 12px;
          text-align: center;
          margin-bottom: 4px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          padding-bottom: 4px;
        }
        
        .dark-mode .tag-nav-header {
          border-bottom-color: rgba(0, 0, 0, 0.3);
        }
        
        .tag-nav-button {
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: inherit;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          transition: background-color 0.2s ease;
        }
        
        .tag-nav-button:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .dark-mode .tag-nav-button {
          border-color: rgba(0, 0, 0, 0.3);
        }
        
        .dark-mode .tag-nav-button:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
        
        .tag-nav-close {
          position: absolute;
          top: 4px;
          right: 4px;
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 16px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Resources styles */
        .resources-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .resource-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background-color: #f9f9f9;
          border-radius: 8px;
          border-left: 3px solid var(--primary-color);
        }
        
        .dark-mode .resource-item {
          background-color: #252525;
        }
        
        .resource-type {
          font-size: 16px;
          line-height: 1;
          margin-top: 2px;
        }
        
        .resource-content {
          flex: 1;
        }
        
        .resource-link {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 500;
          display: block;
          margin-bottom: 4px;
        }
        
        .resource-link:hover {
          text-decoration: underline;
        }
        
        .resource-description {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
        
        .dark-mode .resource-description {
          color: #aaa;
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
          
          .table-of-contents {
            padding: 20px;
          }
          
          .toc-link {
            padding: 10px 12px;
          }
          
          .toc-number {
            width: 24px;
            height: 24px;
            font-size: 12px;
            margin-right: 12px;
          }
        }
        
        /* Print styles */
        @media print {
          .theme-toggle,
          .mark-complete-button {
            display: none !important;
          }
          
          .step-card {
            break-inside: avoid;
            margin-bottom: 20px;
          }
          
          .screenshot-wrapper img {
            max-height: 400px;
            object-fit: contain;
          }
          
          .table-of-contents {
            break-inside: avoid;
          }
        }
        
        /* SOP-level tags styles */
        .sop-tags {
          background-color: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          border-left: 4px solid var(--primary-color);
        }
        
        .dark-mode .sop-tags {
          background-color: #1a1a1a;
        }
        
        .sop-tags-title {
          font-size: 16px;
          margin: 0 0 12px 0;
          color: var(--text-light);
          font-weight: 600;
        }
        
        .dark-mode .sop-tags-title {
          color: var(--text-dark);
        }
        
        .sop-tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .sop-tag {
          background-color: var(--primary-color);
          color: white;
          padding: 6px 14px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header class="sop-header">
          <div class="logo-container">
            ${logoHtml}
          </div>
          <div class="header-content">
            <h1 class="sop-title">${title || 'Standard Operating Procedure'}</h1>
            <p class="sop-topic">${topic || ''}</p>
            <p class="sop-date">Created: ${date}</p>
            ${companyName ? `<p class="sop-company">${companyName}</p>` : ''}
          </div>
          <div class="header-controls">
            <button class="compact-toggle" id="compact-toggle" title="Toggle Compact View">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12h18m-9-9v18"></path>
              </svg>
            </button>
            <button class="theme-toggle" id="theme-toggle" title="Toggle Dark Mode">
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
        
        ${sopTagsHtml}
        ${tableOfContentsHtml}
        
        <div class="progress-container">
          <div class="progress-bar" id="progress-bar"></div>
        </div>
        <div class="progress-text">
          <span id="progress-text">0/${steps.length} steps completed (0%)</span>
        </div>
        
        <div class="steps-container">
          ${stepsHtml}
        </div>
        
        <!-- Tag Navigation Panel -->
        <div class="tag-navigation" id="tag-navigation">
          <button class="tag-nav-close" onclick="closeTagNavigation()">×</button>
          <div class="tag-nav-header" id="tag-nav-header">Tag Navigation</div>
          <div id="tag-nav-content">
            <!-- Populated by JavaScript -->
          </div>
        </div>
      </div>
      
      <script>
        // Theme toggle functionality
        const themeToggle = document.getElementById('theme-toggle');
        const compactToggle = document.getElementById('compact-toggle');
        const body = document.body;
        
        // Check if user previously set a theme preference
        const savedTheme = localStorage.getItem('sopTheme');
        if (savedTheme === 'dark') {
          body.classList.add('dark-mode');
        }
        
        // Check if user previously set compact mode preference
        const savedCompactMode = localStorage.getItem('sopCompactMode');
        if (savedCompactMode === 'true') {
          body.classList.add('compact-mode');
        }
        
        themeToggle.addEventListener('click', () => {
          body.classList.toggle('dark-mode');
          const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
          localStorage.setItem('sopTheme', currentTheme);
        });
        
        compactToggle.addEventListener('click', () => {
          body.classList.toggle('compact-mode');
          const isCompact = body.classList.contains('compact-mode');
          localStorage.setItem('sopCompactMode', isCompact.toString());
        });
        
        // Smooth scrolling for table of contents links
        document.querySelectorAll('.toc-link').forEach(link => {
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
        
        // Step expansion/collapse functionality
        window.toggleStepExpansion = function(stepNumber) {
          const stepCard = document.querySelector(\`.step-card[data-step="\${stepNumber}"]\`);
          if (stepCard && stepCard.classList.contains('collapsed')) {
            stepCard.classList.remove('collapsed');
            const stepStatus = document.getElementById(\`step-status-\${stepNumber}\`);
            if (stepStatus) stepStatus.style.display = 'none';
          }
        };
        
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
            const stepStatus = document.getElementById(\`step-status-\${stepNumber}\`);
            if (stepCard) {
              stepCard.classList.add('completed', 'collapsed');
              if (stepStatus) stepStatus.style.display = 'inline';
            }
            button.textContent = 'Completed ✓';
          }
          
          button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent header click when clicking button
            const stepCard = document.querySelector(\`.step-card[data-step="\${stepNumber}"]\`);
            const stepStatus = document.getElementById(\`step-status-\${stepNumber}\`);
            
            if (completedSteps.includes(stepNumber)) {
              // Remove from completed steps
              completedSteps = completedSteps.filter(step => step !== stepNumber);
              stepCard.classList.remove('completed', 'collapsed');
              if (stepStatus) stepStatus.style.display = 'none';
              button.textContent = 'Mark as Complete';
            } else {
              // Add to completed steps and collapse
              completedSteps.push(stepNumber);
              stepCard.classList.add('completed', 'collapsed');
              if (stepStatus) stepStatus.style.display = 'inline';
              button.textContent = 'Completed ✓';
              
              // Smooth scroll to next step if it exists
              const nextStepNumber = stepNumber + 1;
              const nextStep = document.querySelector(\`.step-card[data-step="\${nextStepNumber}"]\`);
              if (nextStep) {
                setTimeout(() => {
                  nextStep.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                  });
                }, 300);
              }
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
        
        // Initialize progress display
        updateProgressUI();
        
        // Tag Navigation Functionality
        let currentActiveTag = null;
        let currentTagSteps = [];
        let currentTagIndex = 0;
        
        // Handle tag click
        window.handleTagClick = function(tagId) {
          // If clicking the same tag, toggle off
          if (currentActiveTag === tagId) {
            clearTagHighlighting();
            return;
          }
          
          // Clear previous highlighting
          clearTagHighlighting();
          
          // Set new active tag
          currentActiveTag = tagId;
          
          // Find all steps with this tag
          currentTagSteps = [];
          const allSteps = document.querySelectorAll('.step-card');
          
          allSteps.forEach((stepCard, index) => {
            const tags = stepCard.querySelectorAll(\`.tag[data-tag="\${tagId}"]\`);
            if (tags.length > 0) {
              currentTagSteps.push({
                element: stepCard,
                stepNumber: index + 1,
                tags: tags
              });
            }
          });
          
          if (currentTagSteps.length === 0) return;
          
          // Highlight all matching tags and steps
          currentTagSteps.forEach((stepData, index) => {
            stepData.element.classList.add('tag-highlighted');
            stepData.tags.forEach(tag => {
              tag.classList.add('active');
              const counter = tag.querySelector('.tag-counter');
              if (counter) {
                counter.textContent = \`\${index + 1}/\${currentTagSteps.length}\`;
              }
            });
          });
          
          // Show navigation panel
          showTagNavigation(tagId);
          
          // Scroll to first occurrence
          currentTagIndex = 0;
          scrollToTagStep(0);
        };
        
        function clearTagHighlighting() {
          // Remove all tag highlighting
          document.querySelectorAll('.tag.active').forEach(tag => {
            tag.classList.remove('active');
          });
          
          document.querySelectorAll('.step-card.tag-highlighted').forEach(step => {
            step.classList.remove('tag-highlighted');
          });
          
          // Hide navigation panel
          document.getElementById('tag-navigation').style.display = 'none';
          
          currentActiveTag = null;
          currentTagSteps = [];
          currentTagIndex = 0;
        }
        
        function showTagNavigation(tagId) {
          const navPanel = document.getElementById('tag-navigation');
          const navHeader = document.getElementById('tag-nav-header');
          const navContent = document.getElementById('tag-nav-content');
          
          // Update header
          const originalTag = currentTagSteps[0]?.tags[0]?.textContent?.replace(/\\d+\\/\\d+/, '').trim() || tagId;
          navHeader.textContent = \`Tag: "\${originalTag}" (\${currentTagSteps.length} steps)\`;
          
          // Create navigation buttons
          navContent.innerHTML = \`
            <button class="tag-nav-button" onclick="navigateTag('prev')">← Previous (\${currentTagSteps.length > 1 ? currentTagSteps.length : 1}/\${currentTagSteps.length})</button>
            <button class="tag-nav-button" onclick="navigateTag('next')">Next → (1/\${currentTagSteps.length})</button>
            <button class="tag-nav-button" onclick="clearTagHighlighting()">Clear Highlighting</button>
          \`;
          
          // Show panel
          navPanel.style.display = 'flex';
        }
        
        window.navigateTag = function(direction) {
          if (currentTagSteps.length === 0) return;
          
          if (direction === 'next') {
            currentTagIndex = (currentTagIndex + 1) % currentTagSteps.length;
          } else if (direction === 'prev') {
            currentTagIndex = currentTagIndex === 0 ? currentTagSteps.length - 1 : currentTagIndex - 1;
          }
          
          scrollToTagStep(currentTagIndex);
          updateNavigationButtons();
        };
        
        function scrollToTagStep(index) {
          if (!currentTagSteps[index]) return;
          
          const targetStep = currentTagSteps[index].element;
          
          // Add temporary highlight animation
          targetStep.style.transition = 'all 0.3s ease';
          targetStep.style.transform = 'translateX(8px) scale(1.02)';
          
          // Scroll to the step
          targetStep.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
          
          // Remove temporary highlight after animation
          setTimeout(() => {
            targetStep.style.transform = 'translateX(4px)';
          }, 300);
        }
        
        function updateNavigationButtons() {
          const navContent = document.getElementById('tag-nav-content');
          const originalTag = currentTagSteps[0]?.tags[0]?.textContent?.replace(/\\d+\\/\\d+/, '').trim() || currentActiveTag;
          
          navContent.innerHTML = \`
            <button class="tag-nav-button" onclick="navigateTag('prev')">← Previous (\${currentTagIndex + 1}/\${currentTagSteps.length})</button>
            <button class="tag-nav-button" onclick="navigateTag('next')">Next → (\${((currentTagIndex + 1) % currentTagSteps.length) + 1}/\${currentTagSteps.length})</button>
            <button class="tag-nav-button" onclick="clearTagHighlighting()">Clear Highlighting</button>
          \`;
        }
        
        window.closeTagNavigation = function() {
          clearTagHighlighting();
        };
        
        // Add escape key handler to close tag navigation
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape' && currentActiveTag) {
            clearTagHighlighting();
          }
        });
        
        console.log('SOP loaded successfully with', totalSteps, 'steps');
        console.log('File contains embedded images - no external dependencies required');
        console.log('Interactive tag navigation enabled - click any tag to explore related steps');
      </script>
    </body>
    </html>
  `;
  
  return { html, estimatedSize: totalEstimatedSize };
};

// Generate the original HTML document (for ZIP mode)
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
    
    // Generate tags HTML
    const tagsHtml = step.tags && step.tags.length > 0 ? `
      <div class="step-tags">
        <h4 class="tags-title">Tags</h4>
        <div class="tags-container">
          ${step.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
    ` : '';
    
    // Generate resources HTML
    const resourcesHtml = step.resources && step.resources.length > 0 ? `
      <div class="step-resources">
        <h4 class="resources-title">Resources</h4>
        <div class="resources-container">
          ${step.resources.map(resource => `
            <div class="resource-item">
              <span class="resource-type">${resource.type === 'link' ? '🔗' : '📄'}</span>
              <div class="resource-content">
                <a href="${resource.url}" target="_blank" class="resource-link">${resource.title}</a>
                ${resource.description ? `<p class="resource-description">${resource.description}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';
    
    return `
      <div class="step-card" data-step="${stepNumber}" id="step-${stepNumber}">
        <div class="step-header" onclick="toggleStepExpansion(${stepNumber})">
          <div class="step-number">${stepNumber}</div>
          <h3 class="step-title">${step.title || `Step ${stepNumber}`}</h3>
          <span class="step-status" id="step-status-${stepNumber}" style="display: none;">Completed ✓</span>
          <span class="step-expand-icon" id="step-expand-${stepNumber}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </span>
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
          
          ${resourcesHtml}
          
          ${step.processedScreenshot ? `
          <div class="step-screenshot">
            <div class="screenshot-wrapper">
              <img src="${step.processedScreenshot}" alt="Step ${stepNumber} Screenshot with Callouts" />
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
  
  // Process logo if exists
  let logoHtml = '';
  if (logo) {
    try {
      logoHtml = `<img src="${logo}" alt="Company Logo" class="logo" />`;
    } catch (error) {
      console.error("Failed to process logo:", error);
    }
  }
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title || 'Standard Operating Procedure'}</title>
      <meta name="description" content="Self-contained SOP with embedded screenshots and interactive features">
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
        
        .header-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .compact-toggle,
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
        
        .compact-toggle:hover,
        .theme-toggle:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
        
        .dark-mode .compact-toggle:hover,
        .dark-mode .theme-toggle:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        /* Compact mode styles */
        body.compact-mode .step-card {
          margin-bottom: 15px;
        }
        
        body.compact-mode .step-content {
          padding: 15px;
        }
        
        body.compact-mode .step-header {
          padding: 10px 15px;
        }
        
        body.compact-mode .step-detailed-instructions,
        body.compact-mode .step-notes {
          margin-top: 10px;
          padding-top: 10px;
        }
        
        body.compact-mode .step-screenshot {
          margin-top: 15px;
        }
        
        body.compact-mode .screenshot-wrapper img {
          border-radius: 6px;
        }
        
        body.compact-mode .table-of-contents {
          padding: 20px;
          margin: 20px 0;
        }
        
        body.compact-mode .toc-link {
          padding: 8px 12px;
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
        
        .file-info {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
        
        .dark-mode .file-info {
          color: #666;
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
          background-color: rgba(0, 0, 0, 0.1);
        }
        
        .dark-mode .theme-toggle:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        /* Table of Contents styles */
        .table-of-contents {
          background-color: #f8f9fa;
          border-radius: 12px;
          padding: 30px;
          margin: 30px 0;
          border-left: 4px solid var(--primary-color);
        }
        
        .dark-mode .table-of-contents {
          background-color: #1a1a1a;
          border-left-color: var(--primary-color);
        }
        
        .toc-title {
          font-size: 24px;
          margin: 0 0 20px 0;
          color: var(--text-light);
          font-weight: 600;
        }
        
        .dark-mode .toc-title {
          color: var(--text-dark);
        }
        
        .toc-nav {
          margin: 0;
        }
        
        .toc-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .toc-item {
          margin-bottom: 12px;
        }
        
        .toc-link {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background-color: white;
          border-radius: 8px;
          text-decoration: none;
          color: var(--text-light);
          transition: all 0.2s ease;
          border: 1px solid var(--border-light);
        }
        
        .dark-mode .toc-link {
          background-color: #2a2a2a;
          color: var(--text-dark);
          border-color: var(--border-dark);
        }
        
        .toc-link:hover {
          background-color: var(--primary-color);
          color: white;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
        }
        
        .toc-number {
          background-color: var(--primary-color);
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 16px;
          flex-shrink: 0;
          font-size: 14px;
        }
        
        .toc-link:hover .toc-number {
          background-color: white;
          color: var(--primary-color);
        }
        
        .toc-text {
          font-weight: 500;
          flex-grow: 1;
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
          transition: all 0.3s ease;
          scroll-margin-top: 100px; /* Account for fixed header when jumping to anchors */
        }
        
        .dark-mode .step-card {
          background-color: #1E1E1E;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        }
        
        .step-card.completed {
          border-left: 4px solid var(--step-complete-color);
          transform: translateX(2px);
        }
        
        .step-card.collapsed .step-content {
          display: none;
        }
        
        .step-card.collapsed .step-header {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .step-card.collapsed .step-header:hover {
          background-color: #f0f0f0;
        }
        
        .dark-mode .step-card.collapsed .step-header:hover {
          background-color: #333;
        }
        
        .step-header {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          background-color: #f9f9f9;
          position: relative;
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
        
        .step-card.completed .step-number {
          background-color: var(--step-complete-color);
        }
        
        .step-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          flex-grow: 1;
        }
        
        .step-status {
          font-size: 14px;
          color: var(--step-complete-color);
          font-weight: 600;
          margin-left: 10px;
        }
        
        .step-expand-icon {
          margin-left: 10px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .step-card.collapsed .step-expand-icon {
          opacity: 1;
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
        .step-tags,
        .step-resources {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        
        .dark-mode .step-detailed-instructions,
        .dark-mode .step-notes,
        .dark-mode .step-tags,
        .dark-mode .step-resources {
          border-top-color: #333;
        }
        
        .instructions-title,
        .notes-title,
        .tags-title,
        .resources-title {
          font-size: 16px;
          margin-top: 0;
          margin-bottom: 10px;
          color: #555;
        }
        
        .dark-mode .instructions-title,
        .dark-mode .notes-title,
        .dark-mode .tags-title,
        .dark-mode .resources-title {
          color: #bbb;
        }
        
        .step-screenshot {
          margin-top: 20px;
        }
        
        .screenshot-wrapper {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .dark-mode .screenshot-wrapper {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }
        
        .screenshot-wrapper img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 8px;
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
          transition: all 0.2s;
          display: flex;
          align-items: center;
        }
        
        .mark-complete-button:hover {
          background-color: #0062cc;
          transform: translateY(-1px);
        }
        
        .step-card.completed .mark-complete-button {
          background-color: var(--step-complete-color);
        }
        
        .step-card.completed .mark-complete-button:hover {
          background-color: #45a049;
        }
        
        /* Tags styles */
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .tag {
          background-color: var(--primary-color);
          color: white;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          user-select: none;
        }
        
        .tag:hover {
          background-color: #0062cc;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
        }
        
        .tag.active {
          background-color: #ff6b35;
          box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.3);
        }
        
        .tag.highlighted {
          background-color: #ff6b35;
          animation: tagPulse 0.6s ease-in-out;
        }
        
        .tag-counter {
          position: absolute;
          top: -8px;
          right: -8px;
          background-color: #ff6b35;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .tag.active .tag-counter {
          opacity: 1;
        }
        
        @keyframes tagPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .step-card.tag-highlighted {
          border-left: 4px solid #ff6b35;
          background-color: rgba(255, 107, 53, 0.05);
          transform: translateX(4px);
        }
        
        .dark-mode .step-card.tag-highlighted {
          background-color: rgba(255, 107, 53, 0.1);
        }
        
        .tag-navigation {
          position: fixed;
          top: 50%;
          right: 20px;
          transform: translateY(-50%);
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 12px;
          border-radius: 8px;
          display: none;
          flex-direction: column;
          gap: 8px;
          z-index: 1000;
          min-width: 200px;
        }
        
        .dark-mode .tag-navigation {
          background-color: rgba(255, 255, 255, 0.9);
          color: black;
        }
        
        .tag-nav-header {
          font-weight: bold;
          font-size: 12px;
          text-align: center;
          margin-bottom: 4px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          padding-bottom: 4px;
        }
        
        .dark-mode .tag-nav-header {
          border-bottom-color: rgba(0, 0, 0, 0.3);
        }
        
        .tag-nav-button {
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: inherit;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          transition: background-color 0.2s ease;
        }
        
        .tag-nav-button:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .dark-mode .tag-nav-button {
          border-color: rgba(0, 0, 0, 0.3);
        }
        
        .dark-mode .tag-nav-button:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
        
        .tag-nav-close {
          position: absolute;
          top: 4px;
          right: 4px;
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 16px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Resources styles */
        .resources-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .resource-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background-color: #f9f9f9;
          border-radius: 8px;
          border-left: 3px solid var(--primary-color);
        }
        
        .dark-mode .resource-item {
          background-color: #252525;
        }
        
        .resource-type {
          font-size: 16px;
          line-height: 1;
          margin-top: 2px;
        }
        
        .resource-content {
          flex: 1;
        }
        
        .resource-link {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 500;
          display: block;
          margin-bottom: 4px;
        }
        
        .resource-link:hover {
          text-decoration: underline;
        }
        
        .resource-description {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
        
        .dark-mode .resource-description {
          color: #aaa;
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
          
          .table-of-contents {
            padding: 20px;
          }
          
          .toc-link {
            padding: 10px 12px;
          }
          
          .toc-number {
            width: 24px;
            height: 24px;
            font-size: 12px;
            margin-right: 12px;
          }
        }
        
        /* Print styles */
        @media print {
          .theme-toggle,
          .mark-complete-button {
            display: none !important;
          }
          
          .step-card {
            break-inside: avoid;
            margin-bottom: 20px;
          }
          
          .screenshot-wrapper img {
            max-height: 400px;
            object-fit: contain;
          }
          
          .table-of-contents {
            break-inside: avoid;
          }
        }
        
        /* SOP-level tags styles */
        .sop-tags {
          background-color: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          border-left: 4px solid var(--primary-color);
        }
        
        .dark-mode .sop-tags {
          background-color: #1a1a1a;
        }
        
        .sop-tags-title {
          font-size: 16px;
          margin: 0 0 12px 0;
          color: var(--text-light);
          font-weight: 600;
        }
        
        .dark-mode .sop-tags-title {
          color: var(--text-dark);
        }
        
        .sop-tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .sop-tag {
          background-color: var(--primary-color);
          color: white;
          padding: 6px 14px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header class="sop-header">
          <div class="logo-container">
            ${logoHtml}
          </div>
          <div class="header-content">
            <h1 class="sop-title">${title || 'Standard Operating Procedure'}</h1>
            <p class="sop-topic">${topic || ''}</p>
            <p class="sop-date">Created: ${date}</p>
            ${companyName ? `<p class="sop-company">${companyName}</p>` : ''}
          </div>
          <div class="header-controls">
            <button class="compact-toggle" id="compact-toggle" title="Toggle Compact View">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12h18m-9-9v18"></path>
              </svg>
            </button>
            <button class="theme-toggle" id="theme-toggle" title="Toggle Dark Mode">
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
        
        ${sopTagsHtml}
        ${tableOfContentsHtml}
        
        <div class="progress-container">
          <div class="progress-bar" id="progress-bar"></div>
        </div>
        <div class="progress-text">
          <span id="progress-text">0/${steps.length} steps completed (0%)</span>
        </div>
        
        <div class="steps-container">
          ${stepsHtml}
        </div>
        
        <!-- Tag Navigation Panel -->
        <div class="tag-navigation" id="tag-navigation">
          <button class="tag-nav-close" onclick="closeTagNavigation()">×</button>
          <div class="tag-nav-header" id="tag-nav-header">Tag Navigation</div>
          <div id="tag-nav-content">
            <!-- Populated by JavaScript -->
          </div>
        </div>
      </div>
      
      <script>
        // Theme toggle functionality
        const themeToggle = document.getElementById('theme-toggle');
        const compactToggle = document.getElementById('compact-toggle');
        const body = document.body;
        
        // Check if user previously set a theme preference
        const savedTheme = localStorage.getItem('sopTheme');
        if (savedTheme === 'dark') {
          body.classList.add('dark-mode');
        }
        
        // Check if user previously set compact mode preference
        const savedCompactMode = localStorage.getItem('sopCompactMode');
        if (savedCompactMode === 'true') {
          body.classList.add('compact-mode');
        }
        
        themeToggle.addEventListener('click', () => {
          body.classList.toggle('dark-mode');
          const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
          localStorage.setItem('sopTheme', currentTheme);
        });
        
        compactToggle.addEventListener('click', () => {
          body.classList.toggle('compact-mode');
          const isCompact = body.classList.contains('compact-mode');
          localStorage.setItem('sopCompactMode', isCompact.toString());
        });
        
        // Smooth scrolling for table of contents links
        document.querySelectorAll('.toc-link').forEach(link => {
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
        
        // Step expansion/collapse functionality
        window.toggleStepExpansion = function(stepNumber) {
          const stepCard = document.querySelector(\`.step-card[data-step="\${stepNumber}"]\`);
          if (stepCard && stepCard.classList.contains('collapsed')) {
            stepCard.classList.remove('collapsed');
            const stepStatus = document.getElementById(\`step-status-\${stepNumber}\`);
            if (stepStatus) stepStatus.style.display = 'none';
          }
        };
        
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
            const stepStatus = document.getElementById(\`step-status-\${stepNumber}\`);
            if (stepCard) {
              stepCard.classList.add('completed', 'collapsed');
              if (stepStatus) stepStatus.style.display = 'inline';
            }
            button.textContent = 'Completed ✓';
          }
          
          button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent header click when clicking button
            const stepCard = document.querySelector(\`.step-card[data-step="\${stepNumber}"]\`);
            const stepStatus = document.getElementById(\`step-status-\${stepNumber}\`);
            
            if (completedSteps.includes(stepNumber)) {
              // Remove from completed steps
              completedSteps = completedSteps.filter(step => step !== stepNumber);
              stepCard.classList.remove('completed', 'collapsed');
              if (stepStatus) stepStatus.style.display = 'none';
              button.textContent = 'Mark as Complete';
            } else {
              // Add to completed steps and collapse
              completedSteps.push(stepNumber);
              stepCard.classList.add('completed', 'collapsed');
              if (stepStatus) stepStatus.style.display = 'inline';
              button.textContent = 'Completed ✓';
              
              // Smooth scroll to next step if it exists
              const nextStepNumber = stepNumber + 1;
              const nextStep = document.querySelector(\`.step-card[data-step="\${nextStepNumber}"]\`);
              if (nextStep) {
                setTimeout(() => {
                  nextStep.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                  });
                }, 300);
              }
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
        
        // Initialize progress display
        updateProgressUI();
        
        // Tag Navigation Functionality
        let currentActiveTag = null;
        let currentTagSteps = [];
        let currentTagIndex = 0;
        
        // Handle tag click
        window.handleTagClick = function(tagId) {
          // If clicking the same tag, toggle off
          if (currentActiveTag === tagId) {
            clearTagHighlighting();
            return;
          }
          
          // Clear previous highlighting
          clearTagHighlighting();
          
          // Set new active tag
          currentActiveTag = tagId;
          
          // Find all steps with this tag
          currentTagSteps = [];
          const allSteps = document.querySelectorAll('.step-card');
          
          allSteps.forEach((stepCard, index) => {
            const tags = stepCard.querySelectorAll(\`.tag[data-tag="\${tagId}"]\`);
            if (tags.length > 0) {
              currentTagSteps.push({
                element: stepCard,
                stepNumber: index + 1,
                tags: tags
              });
            }
          });
          
          if (currentTagSteps.length === 0) return;
          
          // Highlight all matching tags and steps
          currentTagSteps.forEach((stepData, index) => {
            stepData.element.classList.add('tag-highlighted');
            stepData.tags.forEach(tag => {
              tag.classList.add('active');
              const counter = tag.querySelector('.tag-counter');
              if (counter) {
                counter.textContent = \`\${index + 1}/\${currentTagSteps.length}\`;
              }
            });
          });
          
          // Show navigation panel
          showTagNavigation(tagId);
          
          // Scroll to first occurrence
          currentTagIndex = 0;
          scrollToTagStep(0);
        };
        
        function clearTagHighlighting() {
          // Remove all tag highlighting
          document.querySelectorAll('.tag.active').forEach(tag => {
            tag.classList.remove('active');
          });
          
          document.querySelectorAll('.step-card.tag-highlighted').forEach(step => {
            step.classList.remove('tag-highlighted');
          });
          
          // Hide navigation panel
          document.getElementById('tag-navigation').style.display = 'none';
          
          currentActiveTag = null;
          currentTagSteps = [];
          currentTagIndex = 0;
        }
        
        function showTagNavigation(tagId) {
          const navPanel = document.getElementById('tag-navigation');
          const navHeader = document.getElementById('tag-nav-header');
          const navContent = document.getElementById('tag-nav-content');
          
          // Update header
          const originalTag = currentTagSteps[0]?.tags[0]?.textContent?.replace(/\\d+\\/\\d+/, '').trim() || tagId;
          navHeader.textContent = \`Tag: "\${originalTag}" (\${currentTagSteps.length} steps)\`;
          
          // Create navigation buttons
          navContent.innerHTML = \`
            <button class="tag-nav-button" onclick="navigateTag('prev')">← Previous (\${currentTagSteps.length > 1 ? currentTagSteps.length : 1}/\${currentTagSteps.length})</button>
            <button class="tag-nav-button" onclick="navigateTag('next')">Next → (1/\${currentTagSteps.length})</button>
            <button class="tag-nav-button" onclick="clearTagHighlighting()">Clear Highlighting</button>
          \`;
          
          // Show panel
          navPanel.style.display = 'flex';
        }
        
        window.navigateTag = function(direction) {
          if (currentTagSteps.length === 0) return;
          
          if (direction === 'next') {
            currentTagIndex = (currentTagIndex + 1) % currentTagSteps.length;
          } else if (direction === 'prev') {
            currentTagIndex = currentTagIndex === 0 ? currentTagSteps.length - 1 : currentTagIndex - 1;
          }
          
          scrollToTagStep(currentTagIndex);
          updateNavigationButtons();
        };
        
        function scrollToTagStep(index) {
          if (!currentTagSteps[index]) return;
          
          const targetStep = currentTagSteps[index].element;
          
          // Add temporary highlight animation
          targetStep.style.transition = 'all 0.3s ease';
          targetStep.style.transform = 'translateX(8px) scale(1.02)';
          
          // Scroll to the step
          targetStep.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
          
          // Remove temporary highlight after animation
          setTimeout(() => {
            targetStep.style.transform = 'translateX(4px)';
          }, 300);
        }
        
        function updateNavigationButtons() {
          const navContent = document.getElementById('tag-nav-content');
          const originalTag = currentTagSteps[0]?.tags[0]?.textContent?.replace(/\\d+\\/\\d+/, '').trim() || currentActiveTag;
          
          navContent.innerHTML = \`
            <button class="tag-nav-button" onclick="navigateTag('prev')">← Previous (\${currentTagIndex + 1}/\${currentTagSteps.length})</button>
            <button class="tag-nav-button" onclick="navigateTag('next')">Next → (\${((currentTagIndex + 1) % currentTagSteps.length) + 1}/\${currentTagSteps.length})</button>
            <button class="tag-nav-button" onclick="clearTagHighlighting()">Clear Highlighting</button>
          \`;
        }
        
        window.closeTagNavigation = function() {
          clearTagHighlighting();
        };
        
        // Add escape key handler to close tag navigation
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape' && currentActiveTag) {
            clearTagHighlighting();
          }
        });
        
        console.log('SOP loaded successfully with', totalSteps, 'steps');
        console.log('File contains embedded images - no external dependencies required');
        console.log('Interactive tag navigation enabled - click any tag to explore related steps');
      </script>
    </body>
    </html>
  `;
  
  return { html, estimatedSize: totalEstimatedSize };
};