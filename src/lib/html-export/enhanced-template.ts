import { SopDocument } from "@/types/sop";

export interface EnhancedHtmlOptions {
  passwordProtection?: {
    enabled: boolean;
    password?: string;
    hint?: string;
  };
  lmsFeatures?: {
    enableNotes: boolean;
    enableBookmarks: boolean;
    enableSearch: boolean;
    enableProgressTracking: boolean;
  };
  theme?: 'auto' | 'light' | 'dark';
  branding?: {
    companyLogo?: string;
    companyColors?: {
      primary: string;
      secondary: string;
    };
  };
}

export function generateEnhancedHtmlTemplate(
  sopDocument: SopDocument,
  processedSteps: any[],
  options: EnhancedHtmlOptions = {}
): string {
  const {
    passwordProtection = { enabled: false },
    lmsFeatures = {
      enableNotes: true,
      enableBookmarks: true,
      enableSearch: true,
      enableProgressTracking: true
    },
    theme = 'auto',
    branding = {}
  } = options;

  const title = sopDocument.title || "Training Module";
  const date = sopDocument.date || new Date().toLocaleDateString();
  const companyName = sopDocument.companyName || "";

  // Generate enhanced CSS with LMS features
  const enhancedCSS = generateEnhancedCSS(branding);
  
  // Generate enhanced JavaScript with all LMS functionality
  const enhancedJS = generateEnhancedJavaScript(
    processedSteps.length,
    passwordProtection,
    lmsFeatures
  );

  // Generate step content with enhanced features
  const stepsHtml = processedSteps.map((step, index) => {
    return generateEnhancedStepHtml(step, index, lmsFeatures);
  }).join('');

  // Generate navigation sidebar
  const navigationHtml = generateNavigationSidebar(processedSteps, lmsFeatures);

  // Generate main content area
  const mainContentHtml = `
    <div class="main-content">
      <div class="content-header">
        <h1 class="training-title">${title}</h1>
        ${sopDocument.topic ? `<p class="training-topic">${sopDocument.topic}</p>` : ''}
        <div class="training-meta">
          <span class="training-date">Created: ${date}</span>
          ${companyName ? `<span class="company-name">${companyName}</span>` : ''}
        </div>
        
        ${lmsFeatures.enableProgressTracking ? `
          <div class="progress-dashboard">
            <div class="progress-ring">
              <svg class="progress-circle" viewBox="0 0 120 120">
                <circle class="progress-track" cx="60" cy="60" r="50"/>
                <circle class="progress-fill" cx="60" cy="60" r="50"/>
              </svg>
              <div class="progress-text">
                <span class="progress-percentage">0%</span>
                <span class="progress-label">Complete</span>
              </div>
            </div>
            <div class="progress-stats">
              <div class="stat">
                <span class="stat-number" id="completed-count">0</span>
                <span class="stat-label">Completed</span>
              </div>
              <div class="stat">
                <span class="stat-number">${processedSteps.length}</span>
                <span class="stat-label">Total Steps</span>
              </div>
              <div class="stat">
                <span class="stat-number" id="time-spent">0m</span>
                <span class="stat-label">Time Spent</span>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
      
      <div class="content-body">
        ${stepsHtml}
      </div>
    </div>
  `;

  // Generate the complete HTML document
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <meta name="description" content="Interactive Training Module with embedded content and LMS features">
      <style>${enhancedCSS}</style>
    </head>
    <body class="${theme === 'dark' ? 'dark-theme' : theme === 'light' ? 'light-theme' : 'auto-theme'}">
      ${passwordProtection.enabled ? generatePasswordScreen(passwordProtection) : ''}
      
      <div class="app-container" id="app-container" ${passwordProtection.enabled ? 'style="display: none;"' : ''}>
        ${navigationHtml}
        ${mainContentHtml}
        
        ${lmsFeatures.enableNotes ? generateNotesPanel() : ''}
        ${lmsFeatures.enableBookmarks ? generateBookmarksPanel() : ''}
        ${lmsFeatures.enableSearch ? generateSearchPanel() : ''}
      </div>
      
      <script>${enhancedJS}</script>
    </body>
    </html>
  `;
}

function generatePasswordScreen(passwordProtection: any): string {
  return `
    <div class="password-screen" id="password-screen">
      <div class="password-container">
        <div class="password-header">
          <div class="lock-icon">🔒</div>
          <h2>Access Required</h2>
          <p>This training module is password protected</p>
          ${passwordProtection.hint ? `<p class="password-hint">Hint: ${passwordProtection.hint}</p>` : ''}
        </div>
        
        <form class="password-form" id="password-form">
          <div class="input-group">
            <input 
              type="password" 
              id="password-input" 
              placeholder="Enter password"
              class="password-input"
              required
            >
            <button type="submit" class="password-submit">
              <span>Access Training</span>
              <svg class="submit-icon" viewBox="0 0 24 24">
                <path d="M5 12h14m-7-7l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div class="password-error" id="password-error" style="display: none;">
            Incorrect password. Please try again.
          </div>
        </form>
        
        <div class="password-footer">
          <p>Contact your administrator if you need access</p>
        </div>
      </div>
    </div>
  `;
}

function generateNavigationSidebar(processedSteps: any[], lmsFeatures: any): string {
  const navigationItems = processedSteps.map((step, index) => `
    <div class="nav-item" data-step="${index + 1}">
      <div class="nav-item-content">
        <span class="nav-number">${index + 1}</span>
        <span class="nav-title">${step.title || `Step ${index + 1}`}</span>
        ${lmsFeatures.enableBookmarks ? `
          <button class="bookmark-btn" data-step="${index + 1}" title="Bookmark this step">
            <svg viewBox="0 0 24 24">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        ` : ''}
      </div>
      <div class="nav-progress">
        <div class="progress-indicator"></div>
      </div>
    </div>
  `).join('');

  return `
    <nav class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <h3>Training Navigation</h3>
        <div class="sidebar-controls">
          ${lmsFeatures.enableSearch ? `
            <button class="control-btn" id="search-btn" title="Search content">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
          ` : ''}
          ${lmsFeatures.enableNotes ? `
            <button class="control-btn" id="notes-btn" title="My notes">
              <svg viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </button>
          ` : ''}
          ${lmsFeatures.enableBookmarks ? `
            <button class="control-btn" id="bookmarks-btn" title="Bookmarks">
              <svg viewBox="0 0 24 24">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
          ` : ''}
          <button class="control-btn" id="theme-toggle" title="Toggle theme">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="sidebar-content">
        <div class="nav-list">
          ${navigationItems}
        </div>
      </div>
    </nav>
  `;
}

function generateEnhancedStepHtml(step: any, index: number, lmsFeatures: any): string {
  const stepNumber = index + 1;
  
  return `
    <div class="training-step" id="step-${stepNumber}" data-step="${stepNumber}">
      <div class="step-header">
        <div class="step-meta">
          <span class="step-number">${stepNumber}</span>
          <h2 class="step-title">${step.title || `Step ${stepNumber}`}</h2>
          <div class="step-actions">
            ${lmsFeatures.enableNotes ? `
              <button class="action-btn notes-btn" data-step="${stepNumber}" title="Add note">
                <svg viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </button>
            ` : ''}
            <button class="action-btn complete-btn" data-step="${stepNumber}" title="Mark complete">
              <svg viewBox="0 0 24 24">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </button>
          </div>
        </div>
        
        ${step.tags && step.tags.length > 0 ? `
          <div class="step-tags">
            ${step.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
      </div>
      
      <div class="step-content">
        ${step.description ? `<div class="step-description">${step.description}</div>` : ''}
        
        ${step.processedScreenshot ? `
          <div class="step-media">
            <img src="${step.processedScreenshot}" alt="Step ${stepNumber} Screenshot" class="step-image" />
          </div>
        ` : ''}
        
        ${step.detailedInstructions ? `
          <div class="step-instructions">
            <h4>Instructions</h4>
            <div class="instructions-content">${step.detailedInstructions}</div>
          </div>
        ` : ''}
        
        ${step.secondaryProcessedScreenshot ? `
          <div class="step-media secondary">
            <img src="${step.secondaryProcessedScreenshot}" alt="Step ${stepNumber} Additional Screenshot" class="step-image" />
          </div>
        ` : ''}
        
        ${step.notes ? `
          <div class="step-notes">
            <h4>Notes</h4>
            <div class="notes-content">${step.notes}</div>
          </div>
        ` : ''}
        
        ${step.resources && step.resources.length > 0 ? `
          <div class="step-resources">
            <h4>Resources</h4>
            <div class="resources-list">
              ${step.resources.map((resource: any) => `
                <a href="${resource.url}" target="_blank" class="resource-link">
                  <span class="resource-title">${resource.title || resource.url}</span>
                  ${resource.description ? `<span class="resource-description">${resource.description}</span>` : ''}
                </a>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${lmsFeatures.enableNotes ? `
          <div class="user-notes" id="notes-${stepNumber}" style="display: none;">
            <div class="notes-header">
              <h4>My Notes</h4>
              <button class="notes-save" data-step="${stepNumber}">Save</button>
            </div>
            <textarea 
              class="notes-textarea" 
              data-step="${stepNumber}" 
              placeholder="Add your notes for this step..."
            ></textarea>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function generateNotesPanel(): string {
  return `
    <div class="panel notes-panel" id="notes-panel" style="display: none;">
      <div class="panel-header">
        <h3>My Notes</h3>
        <div class="panel-actions">
          <button class="panel-btn export-notes" title="Export notes">
            <svg viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <button class="panel-btn close-panel" data-panel="notes">
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="panel-content">
        <div class="notes-list" id="notes-list">
          <div class="empty-state">
            <p>No notes yet. Start adding notes to steps to see them here.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateBookmarksPanel(): string {
  return `
    <div class="panel bookmarks-panel" id="bookmarks-panel" style="display: none;">
      <div class="panel-header">
        <h3>Bookmarks</h3>
        <button class="panel-btn close-panel" data-panel="bookmarks">
          <svg viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="panel-content">
        <div class="bookmarks-list" id="bookmarks-list">
          <div class="empty-state">
            <p>No bookmarks yet. Click the bookmark icon on any step to save it here.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateSearchPanel(): string {
  return `
    <div class="panel search-panel" id="search-panel" style="display: none;">
      <div class="panel-header">
        <h3>Search</h3>
        <button class="panel-btn close-panel" data-panel="search">
          <svg viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="panel-content">
        <div class="search-input-group">
          <input 
            type="text" 
            id="search-input" 
            placeholder="Search steps, descriptions, instructions..." 
            class="search-input"
          >
          <button class="search-clear" id="search-clear" style="display: none;">
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="search-results" id="search-results">
          <div class="empty-state">
            <p>Enter a search term to find relevant steps and content.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateEnhancedCSS(branding: any): string {
  const primaryColor = branding.companyColors?.primary || '#007AFF';
  const secondaryColor = branding.companyColors?.secondary || '#1E1E1E';
  
  return `
    :root {
      --primary-color: ${primaryColor};
      --secondary-color: ${secondaryColor};
      --success-color: #4CAF50;
      --warning-color: #FF9500;
      --error-color: #FF3B30;
      --background-dark: #121212;
      --background-light: #ffffff;
      --surface-dark: #1E1E1E;
      --surface-light: #f8f9fa;
      --text-dark: #ffffff;
      --text-light: #333333;
      --border-dark: #333333;
      --border-light: #e0e0e0;
      --shadow-light: 0 2px 10px rgba(0, 0, 0, 0.1);
      --shadow-dark: 0 2px 10px rgba(0, 0, 0, 0.4);
      --sidebar-width: 320px;
      --panel-width: 400px;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      transition: all 0.3s ease;
    }

    /* Theme Styles */
    .dark-theme {
      background-color: var(--background-dark);
      color: var(--text-dark);
    }

    .light-theme {
      background-color: var(--background-light);
      color: var(--text-light);
    }

    .auto-theme {
      background-color: var(--background-dark);
      color: var(--text-dark);
    }

    @media (prefers-color-scheme: light) {
      .auto-theme {
        background-color: var(--background-light);
        color: var(--text-light);
      }
    }

    /* Password Screen */
    .password-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }

    .password-container {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 40px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .password-header .lock-icon {
      font-size: 48px;
      margin-bottom: 20px;
    }

    .password-header h2 {
      margin-bottom: 10px;
      color: white;
    }

    .password-header p {
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 20px;
    }

    .password-hint {
      background: rgba(255, 255, 255, 0.1);
      padding: 10px;
      border-radius: 10px;
      margin-top: 10px !important;
      font-style: italic;
    }

    .input-group {
      position: relative;
      margin: 20px 0;
    }

    .password-input {
      width: 100%;
      padding: 15px 20px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 50px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 16px;
      outline: none;
      transition: all 0.3s ease;
    }

    .password-input:focus {
      border-color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.2);
    }

    .password-input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    .password-submit {
      width: 100%;
      padding: 15px 20px;
      margin-top: 15px;
      background: white;
      color: var(--primary-color);
      border: none;
      border-radius: 50px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.3s ease;
    }

    .password-submit:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }

    .submit-icon {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
    }

    .password-error {
      color: #FF3B30;
      background: rgba(255, 59, 48, 0.1);
      padding: 10px;
      border-radius: 10px;
      margin-top: 10px;
      font-size: 14px;
    }

    .password-footer {
      margin-top: 30px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
    }

    /* Main Layout */
    .app-container {
      display: flex;
      min-height: 100vh;
      position: relative;
    }

    /* Sidebar */
    .sidebar {
      width: var(--sidebar-width);
      background: var(--surface-dark);
      border-right: 1px solid var(--border-dark);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 100;
    }

    .light-theme .sidebar {
      background: var(--surface-light);
      border-right-color: var(--border-light);
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid var(--border-dark);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .light-theme .sidebar-header {
      border-bottom-color: var(--border-light);
    }

    .sidebar-header h3 {
      font-size: 18px;
      font-weight: 600;
    }

    .sidebar-controls {
      display: flex;
      gap: 8px;
    }

    .control-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      color: currentColor;
    }

    .control-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .light-theme .control-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .control-btn svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
    }

    .nav-list {
      padding: 10px;
    }

    .nav-item {
      margin-bottom: 4px;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .light-theme .nav-item:hover {
      background: rgba(0, 0, 0, 0.03);
    }

    .nav-item.active {
      background: var(--primary-color);
      color: white;
    }

    .nav-item.completed {
      background: var(--success-color);
      color: white;
    }

    .nav-item-content {
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .nav-number {
      width: 24px;
      height: 24px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .nav-item.active .nav-number,
    .nav-item.completed .nav-number {
      background: rgba(255, 255, 255, 0.3);
    }

    .nav-title {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.3;
    }

    .bookmark-btn {
      width: 20px;
      height: 20px;
      border: none;
      background: transparent;
      cursor: pointer;
      opacity: 0.6;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .bookmark-btn:hover {
      opacity: 1;
      transform: scale(1.1);
    }

    .bookmark-btn.active {
      opacity: 1;
      color: #FFD60A;
    }

    .bookmark-btn svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
    }

    .bookmark-btn.active svg {
      fill: currentColor;
    }

    .nav-progress {
      height: 3px;
      background: rgba(255, 255, 255, 0.1);
      position: relative;
    }

    .progress-indicator {
      height: 100%;
      width: 0%;
      background: var(--primary-color);
      transition: width 0.5s ease;
    }

    .nav-item.completed .progress-indicator {
      width: 100%;
      background: var(--success-color);
    }

    /* Main Content */
    .main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      min-height: 100vh;
    }

    .content-header {
      padding: 40px;
      border-bottom: 1px solid var(--border-dark);
      background: var(--surface-dark);
    }

    .light-theme .content-header {
      border-bottom-color: var(--border-light);
      background: var(--surface-light);
    }

    .training-title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      line-height: 1.2;
    }

    .training-topic {
      font-size: 18px;
      opacity: 0.7;
      margin-bottom: 16px;
    }

    .training-meta {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      font-size: 14px;
      opacity: 0.8;
    }

    .progress-dashboard {
      display: flex;
      align-items: center;
      gap: 30px;
      flex-wrap: wrap;
    }

    .progress-ring {
      position: relative;
      width: 120px;
      height: 120px;
    }

    .progress-circle {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .progress-track {
      fill: none;
      stroke: rgba(255, 255, 255, 0.1);
      stroke-width: 8;
    }

    .light-theme .progress-track {
      stroke: rgba(0, 0, 0, 0.1);
    }

    .progress-fill {
      fill: none;
      stroke: var(--primary-color);
      stroke-width: 8;
      stroke-linecap: round;
      stroke-dasharray: 314;
      stroke-dashoffset: 314;
      transition: stroke-dashoffset 0.5s ease;
    }

    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .progress-percentage {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: var(--primary-color);
    }

    .progress-label {
      font-size: 12px;
      opacity: 0.7;
    }

    .progress-stats {
      display: flex;
      gap: 30px;
    }

    .stat {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 20px;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      opacity: 0.7;
    }

    .content-body {
      padding: 40px;
    }

    /* Training Steps */
    .training-step {
      background: var(--surface-dark);
      border-radius: 16px;
      margin-bottom: 30px;
      overflow: hidden;
      border: 1px solid var(--border-dark);
      transition: all 0.3s ease;
    }

    .light-theme .training-step {
      background: var(--surface-light);
      border-color: var(--border-light);
    }

    .training-step.completed {
      border-color: var(--success-color);
      background: rgba(76, 175, 80, 0.05);
    }

    .training-step.active {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
    }

    .step-header {
      padding: 24px;
      border-bottom: 1px solid var(--border-dark);
    }

    .light-theme .step-header {
      border-bottom-color: var(--border-light);
    }

    .step-meta {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 16px;
    }

    .step-number {
      width: 40px;
      height: 40px;
      background: var(--primary-color);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
      flex-shrink: 0;
    }

    .training-step.completed .step-number {
      background: var(--success-color);
    }

    .step-title {
      flex: 1;
      font-size: 20px;
      font-weight: 600;
      line-height: 1.3;
    }

    .step-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .action-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      color: currentColor;
    }

    .light-theme .action-btn {
      background: rgba(0, 0, 0, 0.05);
    }

    .action-btn:hover {
      background: var(--primary-color);
      color: white;
      transform: scale(1.05);
    }

    .action-btn.active {
      background: var(--success-color);
      color: white;
    }

    .action-btn svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
    }

    .step-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag {
      background: var(--primary-color);
      color: white;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .step-content {
      padding: 24px;
    }

    .step-description {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
      opacity: 0.9;
    }

    .step-media {
      margin: 24px 0;
    }

    .step-image {
      width: 100%;
      height: auto;
      border-radius: 12px;
      box-shadow: var(--shadow-dark);
    }

    .light-theme .step-image {
      box-shadow: var(--shadow-light);
    }

    .step-instructions,
    .step-notes,
    .step-resources {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border-dark);
    }

    .light-theme .step-instructions,
    .light-theme .step-notes,
    .light-theme .step-resources {
      border-top-color: var(--border-light);
    }

    .step-instructions h4,
    .step-notes h4,
    .step-resources h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      opacity: 0.8;
    }

    .instructions-content,
    .notes-content {
      line-height: 1.6;
    }

    .resources-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .resource-link {
      display: block;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      text-decoration: none;
      color: var(--primary-color);
      transition: all 0.2s ease;
    }

    .light-theme .resource-link {
      background: rgba(0, 0, 0, 0.03);
    }

    .resource-link:hover {
      background: var(--primary-color);
      color: white;
      transform: translateX(4px);
    }

    .resource-title {
      display: block;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .resource-description {
      display: block;
      font-size: 14px;
      opacity: 0.7;
    }

    .user-notes {
      margin-top: 24px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      border: 1px solid var(--border-dark);
    }

    .light-theme .user-notes {
      background: rgba(0, 0, 0, 0.02);
      border-color: var(--border-light);
    }

    .notes-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .notes-header h4 {
      font-size: 14px;
      font-weight: 600;
      opacity: 0.8;
    }

    .notes-save {
      padding: 6px 12px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .notes-save:hover {
      background: #0056CC;
    }

    .notes-textarea {
      width: 100%;
      min-height: 80px;
      padding: 12px;
      border: 1px solid var(--border-dark);
      border-radius: 8px;
      background: transparent;
      color: currentColor;
      font-family: inherit;
      resize: vertical;
      outline: none;
    }

    .light-theme .notes-textarea {
      border-color: var(--border-light);
    }

    .notes-textarea:focus {
      border-color: var(--primary-color);
    }

    /* Panels */
    .panel {
      position: fixed;
      top: 0;
      right: 0;
      width: var(--panel-width);
      height: 100vh;
      background: var(--surface-dark);
      border-left: 1px solid var(--border-dark);
      z-index: 200;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    }

    .light-theme .panel {
      background: var(--surface-light);
      border-left-color: var(--border-light);
    }

    .panel.open {
      transform: translateX(0);
    }

    .panel-header {
      padding: 20px;
      border-bottom: 1px solid var(--border-dark);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .light-theme .panel-header {
      border-bottom-color: var(--border-light);
    }

    .panel-header h3 {
      font-size: 18px;
      font-weight: 600;
    }

    .panel-actions {
      display: flex;
      gap: 8px;
    }

    .panel-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      color: currentColor;
    }

    .panel-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .light-theme .panel-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .panel-btn svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
    }

    .panel-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      opacity: 0.6;
    }

    .empty-state p {
      font-size: 14px;
      line-height: 1.5;
    }

    /* Search Panel Specific */
    .search-input-group {
      position: relative;
      margin-bottom: 20px;
    }

    .search-input {
      width: 100%;
      padding: 12px 16px;
      padding-right: 40px;
      border: 1px solid var(--border-dark);
      border-radius: 8px;
      background: transparent;
      color: currentColor;
      font-size: 14px;
      outline: none;
    }

    .light-theme .search-input {
      border-color: var(--border-light);
    }

    .search-input:focus {
      border-color: var(--primary-color);
    }

    .search-clear {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.6;
    }

    .search-clear:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
    }

    .light-theme .search-clear:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .search-clear svg {
      width: 12px;
      height: 12px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
    }

    .search-results {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .search-result {
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .light-theme .search-result {
      background: rgba(0, 0, 0, 0.03);
    }

    .search-result:hover {
      background: var(--primary-color);
      color: white;
    }

    .search-result-title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .search-result-snippet {
      font-size: 12px;
      opacity: 0.7;
      line-height: 1.4;
    }

    .search-highlight {
      background: rgba(255, 255, 0, 0.3);
      padding: 1px 2px;
      border-radius: 2px;
    }

    /* Notes List */
    .notes-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .note-item {
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border-left: 3px solid var(--primary-color);
    }

    .light-theme .note-item {
      background: rgba(0, 0, 0, 0.03);
    }

    .note-header {
      font-size: 12px;
      opacity: 0.7;
      margin-bottom: 6px;
    }

    .note-content {
      font-size: 14px;
      line-height: 1.4;
    }

    /* Bookmarks List */
    .bookmarks-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bookmark-item {
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .light-theme .bookmark-item {
      background: rgba(0, 0, 0, 0.03);
    }

    .bookmark-item:hover {
      background: var(--primary-color);
      color: white;
    }

    .bookmark-number {
      width: 24px;
      height: 24px;
      background: var(--primary-color);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .bookmark-title {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      :root {
        --sidebar-width: 280px;
        --panel-width: 320px;
      }
    }

    @media (max-width: 768px) {
      :root {
        --sidebar-width: 100%;
        --panel-width: 100%;
      }

      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .main-content {
        margin-left: 0;
      }

      .content-header {
        padding: 20px;
      }

      .content-body {
        padding: 20px;
      }

      .progress-dashboard {
        flex-direction: column;
        align-items: flex-start;
      }

      .progress-stats {
        gap: 20px;
      }

      .training-step {
        margin-bottom: 20px;
      }

      .step-header {
        padding: 16px;
      }

      .step-content {
        padding: 16px;
      }

      .step-meta {
        flex-direction: column;
        gap: 12px;
      }

      .step-actions {
        align-self: flex-start;
      }
    }

    /* Print Styles */
    @media print {
      .sidebar,
      .panel {
        display: none !important;
      }

      .main-content {
        margin-left: 0;
      }

      .training-step {
        break-inside: avoid;
        margin-bottom: 20px;
      }

      .step-image {
        max-height: 400px;
        object-fit: contain;
      }
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(20px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .fade-in {
      animation: fadeIn 0.5s ease;
    }

    .slide-in {
      animation: slideIn 0.3s ease;
    }

    /* Scrollbar Styling */
    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }

    .light-theme ::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .light-theme ::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  `;
}

function generateEnhancedJavaScript(
  totalSteps: number,
  passwordProtection: any,
  lmsFeatures: any
): string {
  return `
    // Training Module Enhanced JavaScript
    class TrainingModule {
      constructor() {
        this.totalSteps = ${totalSteps};
        this.completedSteps = new Set();
        this.bookmarkedSteps = new Set();
        this.userNotes = new Map();
        this.currentStep = 1;
        this.startTime = Date.now();
        this.timeSpent = 0;
        
        // Load saved data
        this.loadProgress();
        
        // Initialize features
        this.initializePasswordProtection();
        this.initializeNavigation();
        this.initializeProgressTracking();
        ${lmsFeatures.enableNotes ? 'this.initializeNotes();' : ''}
        ${lmsFeatures.enableBookmarks ? 'this.initializeBookmarks();' : ''}
        ${lmsFeatures.enableSearch ? 'this.initializeSearch();' : ''}
        this.initializeTheme();
        
        // Start time tracking
        this.startTimeTracking();
        
        console.log('Training Module initialized with enhanced features');
      }
      
      // Password Protection
      initializePasswordProtection() {
        ${passwordProtection.enabled ? `
          const passwordScreen = document.getElementById('password-screen');
          const passwordForm = document.getElementById('password-form');
          const passwordInput = document.getElementById('password-input');
          const passwordError = document.getElementById('password-error');
          const appContainer = document.getElementById('app-container');
          
          if (passwordScreen && passwordForm) {
            // Check if already authenticated
            const isAuthenticated = localStorage.getItem('trainingAuth_' + location.pathname);
            if (isAuthenticated === 'true') {
              passwordScreen.style.display = 'none';
              appContainer.style.display = 'flex';
            }
            
            passwordForm.addEventListener('submit', (e) => {
              e.preventDefault();
              const enteredPassword = passwordInput.value;
              const correctPassword = '${passwordProtection.password || 'training123'}';
              
              if (enteredPassword === correctPassword) {
                // Success
                localStorage.setItem('trainingAuth_' + location.pathname, 'true');
                passwordScreen.style.display = 'none';
                appContainer.style.display = 'flex';
                passwordError.style.display = 'none';
              } else {
                // Error
                passwordError.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();
                
                // Add shake animation
                passwordInput.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                  passwordInput.style.animation = '';
                }, 500);
              }
            });
            
            // Focus password input
            passwordInput.focus();
          }
        ` : ''}
      }
      
      // Navigation
      initializeNavigation() {
        // Navigation item clicks
        document.querySelectorAll('.nav-item').forEach(item => {
          item.addEventListener('click', () => {
            const stepNumber = parseInt(item.dataset.step);
            this.navigateToStep(stepNumber);
          });
        });
        
        // Step completion buttons
        document.querySelectorAll('.complete-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const stepNumber = parseInt(btn.dataset.step);
            this.toggleStepCompletion(stepNumber);
          });
        });
        
        // Panel controls
        document.querySelectorAll('.control-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const panelId = btn.id.replace('-btn', '-panel');
            if (panelId === 'theme-toggle') {
              this.toggleTheme();
            } else {
              this.togglePanel(panelId);
            }
          });
        });
        
        // Close panel buttons
        document.querySelectorAll('.close-panel').forEach(btn => {
          btn.addEventListener('click', () => {
            const panelId = btn.dataset.panel + '-panel';
            this.closePanel(panelId);
          });
        });
      }
      
      navigateToStep(stepNumber) {
        // Update current step
        this.currentStep = stepNumber;
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
          item.classList.remove('active');
        });
        document.querySelector(\`[data-step="\${stepNumber}"]\`).classList.add('active');
        
        // Scroll to step
        const stepElement = document.getElementById(\`step-\${stepNumber}\`);
        if (stepElement) {
          stepElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
          
          // Add highlight effect
          stepElement.classList.add('active');
          setTimeout(() => {
            stepElement.classList.remove('active');
          }, 2000);
        }
        
        // Save current position
        this.saveProgress();
      }
      
      toggleStepCompletion(stepNumber) {
        const stepElement = document.getElementById(\`step-\${stepNumber}\`);
        const navItem = document.querySelector(\`.nav-item[data-step="\${stepNumber}"]\`);
        const completeBtn = document.querySelector(\`.complete-btn[data-step="\${stepNumber}"]\`);
        
        if (this.completedSteps.has(stepNumber)) {
          // Uncomplete
          this.completedSteps.delete(stepNumber);
          stepElement.classList.remove('completed');
          navItem.classList.remove('completed');
          completeBtn.classList.remove('active');
        } else {
          // Complete
          this.completedSteps.add(stepNumber);
          stepElement.classList.add('completed');
          navItem.classList.add('completed');
          completeBtn.classList.add('active');
        }
        
        this.updateProgress();
        this.saveProgress();
      }
      
      // Progress Tracking
      initializeProgressTracking() {
        this.updateProgress();
        
        // Auto-save progress every 30 seconds
        setInterval(() => {
          this.saveProgress();
        }, 30000);
      }
      
      updateProgress() {
        const completed = this.completedSteps.size;
        const percentage = Math.round((completed / this.totalSteps) * 100);
        
        // Update progress circle
        const progressFill = document.querySelector('.progress-fill');
        const progressPercentage = document.querySelector('.progress-percentage');
        const completedCount = document.getElementById('completed-count');
        
        if (progressFill) {
          const circumference = 314; // 2 * π * 50
          const dashOffset = circumference - (percentage / 100) * circumference;
          progressFill.style.strokeDashoffset = dashOffset;
        }
        
        if (progressPercentage) {
          progressPercentage.textContent = percentage + '%';
        }
        
        if (completedCount) {
          completedCount.textContent = completed;
        }
        
        // Update navigation progress indicators
        document.querySelectorAll('.nav-item').forEach(item => {
          const stepNumber = parseInt(item.dataset.step);
          const progressIndicator = item.querySelector('.progress-indicator');
          
          if (this.completedSteps.has(stepNumber)) {
            progressIndicator.style.width = '100%';
          } else {
            progressIndicator.style.width = '0%';
          }
        });
      }
      
      // Time Tracking
      startTimeTracking() {
        setInterval(() => {
          this.timeSpent = Math.floor((Date.now() - this.startTime) / 1000 / 60);
          const timeElement = document.getElementById('time-spent');
          if (timeElement) {
            timeElement.textContent = this.timeSpent + 'm';
          }
        }, 60000); // Update every minute
      }
      
      // Notes Feature
      ${lmsFeatures.enableNotes ? `
      initializeNotes() {
        // Notes buttons in steps
        document.querySelectorAll('.notes-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const stepNumber = parseInt(btn.dataset.step);
            this.toggleNotesForStep(stepNumber);
          });
        });
        
        // Save note buttons
        document.querySelectorAll('.notes-save').forEach(btn => {
          btn.addEventListener('click', () => {
            const stepNumber = parseInt(btn.dataset.step);
            this.saveNoteForStep(stepNumber);
          });
        });
        
        // Load existing notes
        this.loadNotes();
        this.updateNotesPanel();
      }
      
      toggleNotesForStep(stepNumber) {
        const notesSection = document.getElementById(\`notes-\${stepNumber}\`);
        const notesBtn = document.querySelector(\`.notes-btn[data-step="\${stepNumber}"]\`);
        
        if (notesSection.style.display === 'none' || !notesSection.style.display) {
          notesSection.style.display = 'block';
          notesBtn.classList.add('active');
          
          // Load existing note
          const existingNote = this.userNotes.get(stepNumber);
          if (existingNote) {
            const textarea = notesSection.querySelector('textarea');
            textarea.value = existingNote;
          }
          
          // Focus textarea
          setTimeout(() => {
            notesSection.querySelector('textarea').focus();
          }, 100);
        } else {
          notesSection.style.display = 'none';
          notesBtn.classList.remove('active');
        }
      }
      
      saveNoteForStep(stepNumber) {
        const textarea = document.querySelector(\`textarea[data-step="\${stepNumber}"]\`);
        const noteText = textarea.value.trim();
        
        if (noteText) {
          this.userNotes.set(stepNumber, noteText);
        } else {
          this.userNotes.delete(stepNumber);
        }
        
        this.saveProgress();
        this.updateNotesPanel();
        
        // Show feedback
        const saveBtn = document.querySelector(\`.notes-save[data-step="\${stepNumber}"]\`);
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saved!';
        setTimeout(() => {
          saveBtn.textContent = originalText;
        }, 1000);
      }
      
      updateNotesPanel() {
        const notesList = document.getElementById('notes-list');
        if (!notesList) return;
        
        if (this.userNotes.size === 0) {
          notesList.innerHTML = '<div class="empty-state"><p>No notes yet. Start adding notes to steps to see them here.</p></div>';
          return;
        }
        
        let notesHtml = '';
        for (const [stepNumber, note] of this.userNotes) {
          const stepTitle = document.querySelector(\`#step-\${stepNumber} .step-title\`).textContent;
          notesHtml += \`
            <div class="note-item" onclick="trainingModule.navigateToStep(\${stepNumber})">
              <div class="note-header">Step \${stepNumber}: \${stepTitle}</div>
              <div class="note-content">\${note}</div>
            </div>
          \`;
        }
        
        notesList.innerHTML = notesHtml;
      }
      ` : ''}
      
      // Bookmarks Feature
      ${lmsFeatures.enableBookmarks ? `
      initializeBookmarks() {
        // Bookmark buttons in navigation
        document.querySelectorAll('.bookmark-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const stepNumber = parseInt(btn.dataset.step);
            this.toggleBookmark(stepNumber);
          });
        });
        
        this.updateBookmarksPanel();
      }
      
      toggleBookmark(stepNumber) {
        const bookmarkBtn = document.querySelector(\`.bookmark-btn[data-step="\${stepNumber}"]\`);
        
        if (this.bookmarkedSteps.has(stepNumber)) {
          this.bookmarkedSteps.delete(stepNumber);
          bookmarkBtn.classList.remove('active');
        } else {
          this.bookmarkedSteps.add(stepNumber);
          bookmarkBtn.classList.add('active');
        }
        
        this.saveProgress();
        this.updateBookmarksPanel();
      }
      
      updateBookmarksPanel() {
        const bookmarksList = document.getElementById('bookmarks-list');
        if (!bookmarksList) return;
        
        if (this.bookmarkedSteps.size === 0) {
          bookmarksList.innerHTML = '<div class="empty-state"><p>No bookmarks yet. Click the bookmark icon on any step to save it here.</p></div>';
          return;
        }
        
        let bookmarksHtml = '';
        for (const stepNumber of this.bookmarkedSteps) {
          const stepTitle = document.querySelector(\`#step-\${stepNumber} .step-title\`).textContent;
          bookmarksHtml += \`
            <div class="bookmark-item" onclick="trainingModule.navigateToStep(\${stepNumber})">
              <div class="bookmark-number">\${stepNumber}</div>
              <div class="bookmark-title">\${stepTitle}</div>
            </div>
          \`;
        }
        
        bookmarksList.innerHTML = bookmarksHtml;
      }
      ` : ''}
      
      // Search Feature
      ${lmsFeatures.enableSearch ? `
      initializeSearch() {
        const searchInput = document.getElementById('search-input');
        const searchClear = document.getElementById('search-clear');
        const searchResults = document.getElementById('search-results');
        
        if (!searchInput) return;
        
        // Build search index
        this.buildSearchIndex();
        
        // Search input handler
        searchInput.addEventListener('input', (e) => {
          const query = e.target.value.trim();
          
          if (query.length > 0) {
            searchClear.style.display = 'block';
            this.performSearch(query);
          } else {
            searchClear.style.display = 'none';
            this.clearSearch();
          }
        });
        
        // Clear search
        searchClear.addEventListener('click', () => {
          searchInput.value = '';
          searchClear.style.display = 'none';
          this.clearSearch();
          searchInput.focus();
        });
        
        // Enter key to search
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const firstResult = document.querySelector('.search-result');
            if (firstResult) {
              firstResult.click();
            }
          }
        });
      }
      
      buildSearchIndex() {
        this.searchIndex = [];
        
        document.querySelectorAll('.training-step').forEach(step => {
          const stepNumber = parseInt(step.dataset.step);
          const title = step.querySelector('.step-title').textContent;
          const description = step.querySelector('.step-description')?.textContent || '';
          const instructions = step.querySelector('.instructions-content')?.textContent || '';
          const notes = step.querySelector('.notes-content')?.textContent || '';
          
          this.searchIndex.push({
            stepNumber,
            title,
            content: [description, instructions, notes].join(' ').toLowerCase(),
            element: step
          });
        });
      }
      
      performSearch(query) {
        const results = this.searchIndex.filter(item => {
          return item.title.toLowerCase().includes(query.toLowerCase()) ||
                 item.content.includes(query.toLowerCase());
        });
        
        this.displaySearchResults(results, query);
      }
      
      displaySearchResults(results, query) {
        const searchResults = document.getElementById('search-results');
        
        if (results.length === 0) {
          searchResults.innerHTML = '<div class="empty-state"><p>No results found for "' + query + '"</p></div>';
          return;
        }
        
        let resultsHtml = '';
        results.forEach(result => {
          const snippet = this.createSearchSnippet(result.content, query);
          resultsHtml += \`
            <div class="search-result" onclick="trainingModule.navigateToStep(\${result.stepNumber})">
              <div class="search-result-title">Step \${result.stepNumber}: \${result.title}</div>
              <div class="search-result-snippet">\${snippet}</div>
            </div>
          \`;
        });
        
        searchResults.innerHTML = resultsHtml;
      }
      
      createSearchSnippet(content, query) {
        const queryLower = query.toLowerCase();
        const contentLower = content.toLowerCase();
        const index = contentLower.indexOf(queryLower);
        
        if (index === -1) return content.substring(0, 100) + '...';
        
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + query.length + 50);
        let snippet = content.substring(start, end);
        
        if (start > 0) snippet = '...' + snippet;
        if (end < content.length) snippet += '...';
        
        // Highlight the query
        const regex = new RegExp(\`(\${query})\`, 'gi');
        snippet = snippet.replace(regex, '<span class="search-highlight">$1</span>');
        
        return snippet;
      }
      
      clearSearch() {
        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = '<div class="empty-state"><p>Enter a search term to find relevant steps and content.</p></div>';
      }
      ` : ''}
      
      // Panel Management
      togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        
        // Close other panels
        document.querySelectorAll('.panel').forEach(p => {
          if (p.id !== panelId) {
            p.classList.remove('open');
          }
        });
        
        // Toggle current panel
        panel.classList.toggle('open');
        
        // Update panel content if needed
        if (panel.classList.contains('open')) {
          if (panelId === 'notes-panel') {
            this.updateNotesPanel();
          } else if (panelId === 'bookmarks-panel') {
            this.updateBookmarksPanel();
          }
        }
      }
      
      closePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
          panel.classList.remove('open');
        }
      }
      
      // Theme Management
      initializeTheme() {
        const savedTheme = localStorage.getItem('trainingTheme');
        if (savedTheme) {
          document.body.className = savedTheme;
        }
      }
      
      toggleTheme() {
        const body = document.body;
        const currentTheme = body.className;
        
        let newTheme;
        if (currentTheme.includes('light-theme')) {
          newTheme = 'dark-theme';
        } else if (currentTheme.includes('dark-theme')) {
          newTheme = 'auto-theme';
        } else {
          newTheme = 'light-theme';
        }
        
        body.className = newTheme;
        localStorage.setItem('trainingTheme', newTheme);
      }
      
      // Data Persistence
      saveProgress() {
        const progressData = {
          completedSteps: Array.from(this.completedSteps),
          bookmarkedSteps: Array.from(this.bookmarkedSteps),
          userNotes: Object.fromEntries(this.userNotes),
          currentStep: this.currentStep,
          timeSpent: this.timeSpent,
          lastAccessed: Date.now()
        };
        
        localStorage.setItem('trainingProgress_' + location.pathname, JSON.stringify(progressData));
      }
      
      loadProgress() {
        const saved = localStorage.getItem('trainingProgress_' + location.pathname);
        if (!saved) return;
        
        try {
          const data = JSON.parse(saved);
          
          this.completedSteps = new Set(data.completedSteps || []);
          this.bookmarkedSteps = new Set(data.bookmarkedSteps || []);
          this.userNotes = new Map(Object.entries(data.userNotes || {}));
          this.currentStep = data.currentStep || 1;
          this.timeSpent = data.timeSpent || 0;
          
          // Apply saved state to UI
          setTimeout(() => {
            this.applySavedState();
          }, 100);
          
        } catch (error) {
          console.error('Error loading progress:', error);
        }
      }
      
      applySavedState() {
        // Apply completed steps
        this.completedSteps.forEach(stepNumber => {
          const stepElement = document.getElementById(\`step-\${stepNumber}\`);
          const navItem = document.querySelector(\`.nav-item[data-step="\${stepNumber}"]\`);
          const completeBtn = document.querySelector(\`.complete-btn[data-step="\${stepNumber}"]\`);
          
          if (stepElement) stepElement.classList.add('completed');
          if (navItem) navItem.classList.add('completed');
          if (completeBtn) completeBtn.classList.add('active');
        });
        
        // Apply bookmarks
        this.bookmarkedSteps.forEach(stepNumber => {
          const bookmarkBtn = document.querySelector(\`.bookmark-btn[data-step="\${stepNumber}"]\`);
          if (bookmarkBtn) bookmarkBtn.classList.add('active');
        });
        
        // Load notes
        this.userNotes.forEach((note, stepNumber) => {
          const textarea = document.querySelector(\`textarea[data-step="\${stepNumber}"]\`);
          if (textarea) textarea.value = note;
        });
        
        // Navigate to current step
        this.navigateToStep(this.currentStep);
      }
      
      // Export functionality
      exportNotes() {
        if (this.userNotes.size === 0) {
          alert('No notes to export');
          return;
        }
        
        let notesText = \`Training Notes - \${document.title}\\n\`;
        notesText += \`Generated: \${new Date().toLocaleString()}\\n\\n\`;
        
        for (const [stepNumber, note] of this.userNotes) {
          const stepTitle = document.querySelector(\`#step-\${stepNumber} .step-title\`).textContent;
          notesText += \`Step \${stepNumber}: \${stepTitle}\\n\`;
          notesText += \`\${note}\\n\\n\`;
        }
        
        // Create and download file
        const blob = new Blob([notesText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'training-notes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
    
    // Initialize training module when DOM is loaded
    let trainingModule;
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        trainingModule = new TrainingModule();
      });
    } else {
      trainingModule = new TrainingModule();
    }
    
    // Export notes functionality
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('export-notes')) {
        trainingModule.exportNotes();
      }
    });
    
    // Add shake animation for password error
    const shakeKeyframes = \`
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
    \`;
    
    const style = document.createElement('style');
    style.textContent = shakeKeyframes;
    document.head.appendChild(style);
  `;
} 