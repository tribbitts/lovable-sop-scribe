import { generateFeedbackForm } from './feedback-integration';

export function generateEnhancedHtmlTemplate(
  sopDocument: any,
  options: any = {}
): string {
  const { steps = [] } = sopDocument;
  const title = sopDocument.title || "SOPify Training Module";
  const topic = sopDocument.topic || "Standard Operating Procedure";
  
  // Calculate progress stats
  const completedSteps = steps.filter((step: any) => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  
  // Check if this is a healthcare/patient communication module
  const isHealthcareModule = sopDocument.healthcareMetadata || 
    steps.some((step: any) => step.healthcareContent?.length > 0) ||
    title.toLowerCase().includes('patient') ||
    title.toLowerCase().includes('healthcare');
  
  // Generate chapter navigation
  const generateChapterNav = () => {
    return steps.map((step: any, index: number) => {
      const stepNumber = index + 1;
      const isCompleted = step.completed;
      const isActive = index === 0; // First step is active by default
      const statusIcon = isCompleted ? '✅' : isActive ? '📍' : '⏳';
      const className = isCompleted ? 'completed' : isActive ? 'active' : '';
      
      // Add healthcare indicators
      const hasHealthcareContent = step.healthcareContent && step.healthcareContent.length > 0;
      const hasCriticalContent = step.healthcareContent?.some((content: any) => 
        content.priority === "high" || content.type === "critical-safety"
      );
      
      let healthcareIndicator = '';
      if (hasCriticalContent) {
        healthcareIndicator = ' 🚨';
      } else if (hasHealthcareContent) {
        healthcareIndicator = ' 🏥';
      }
      
      return `<li class="${className}" onclick="navigateToStep(${index})">${statusIcon} ${stepNumber}. ${step.title || `Step ${stepNumber}`}${healthcareIndicator}</li>`;
    }).join('\n            ');
  };
  
  // Generate step containers with enhanced healthcare features
  const generateStepContainers = () => {
    return steps.map((step: any, index: number) => {
      const stepNumber = index + 1;
      const isActive = index === 0;
      const isCompleted = step.completed;
      
      // Generate healthcare content sections
      const generateHealthcareContent = (step: any) => {
        if (!step.healthcareContent || step.healthcareContent.length === 0) return '';
        
        return step.healthcareContent.map((content: any) => {
          const priorityColors = {
            high: '#dc3545',
            medium: '#fd7e14', 
            low: '#28a745'
          };
          
          const typeIcons = {
            'critical-safety': '🚨',
            'hipaa-alert': '🔒',
            'patient-communication': '💬',
            'scenario-guidance': '🎭',
            'standard': '📋'
          };
          
          return `
            <div class="healthcare-alert" style="
              background: ${priorityColors[content.priority as keyof typeof priorityColors] || '#6c757d'}20;
              border: 2px solid ${priorityColors[content.priority as keyof typeof priorityColors] || '#6c757d'};
              border-radius: 12px;
              padding: 15px;
              margin: 15px 0;
            ">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <span style="font-size: 1.2em;">${typeIcons[content.type as keyof typeof typeIcons] || '📌'}</span>
                <strong style="color: ${priorityColors[content.priority as keyof typeof priorityColors] || '#6c757d'}; text-transform: uppercase; font-size: 0.9em;">
                  ${content.type.replace('-', ' ')} - ${content.priority} Priority
                </strong>
              </div>
              <p style="margin: 0; line-height: 1.5;">${content.content}</p>
            </div>
          `;
        }).join('');
      };
      
      return `
        <div class="step-container ${isActive ? 'current' : ''}" id="step-${index}" style="${isActive ? '' : 'display: none;'}">
            ${isCompleted ? '<div class="completion-badge">✅ Completed</div>' : ''}
            <button class="bookmark-btn" onclick="toggleBookmark(${index})">🔖</button>
            <div class="step-header">
                <div class="step-number">${stepNumber}</div>
                <div class="step-title">${step.title || `Step ${stepNumber}`}</div>
                ${step.estimatedTime ? `<div class="time-estimate">⏱️ ${step.estimatedTime} min</div>` : ''}
            </div>
            <div class="step-content">
                <p style="font-size: 1.1em; margin-bottom: 20px; line-height: 1.6;">
                    ${step.description || 'Complete this step to continue with the training.'}
                </p>
                
                ${step.keyTakeaway ? `
                <div class="key-takeaway" style="
                  background: #1e3a8a20;
                  border: 2px solid #3b82f6;
                  border-radius: 12px;
                  padding: 15px;
                  margin: 15px 0;
                ">
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <span style="font-size: 1.2em;">💡</span>
                    <strong style="color: #3b82f6;">Key Takeaway</strong>
                  </div>
                  <p style="margin: 0; font-style: italic;">${step.keyTakeaway}</p>
                </div>
                ` : ''}
                
                ${generateHealthcareContent(step)}
                
                ${step.patientSafetyNote ? `
                <div class="patient-safety-note" style="
                  background: #dc354520;
                  border: 2px solid #dc3545;
                  border-radius: 12px;
                  padding: 15px;
                  margin: 15px 0;
                ">
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <span style="font-size: 1.2em;">⚠️</span>
                    <strong style="color: #dc3545;">PATIENT SAFETY</strong>
                  </div>
                  <p style="margin: 0; font-weight: 500;">${step.patientSafetyNote}</p>
                </div>
                ` : ''}
                
                ${step.screenshot ? `
                <div class="screenshot-container">
                    <div class="screenshot-overlay">
                        <img src="${step.screenshot.dataUrl}" alt="Step ${stepNumber} Screenshot" style="max-width: 100%; height: auto; border-radius: 8px;" />
                        ${step.callouts ? step.callouts.map((callout: any, i: number) => 
                          `<div class="callout" style="top: ${callout.y}%; left: ${callout.x}%;">${i + 1}. ${callout.text}</div>`
                        ).join('') : ''}
                    </div>
                </div>
                ` : `
                <div class="screenshot-container">
                    <div class="screenshot-overlay">
                        📸 ${isHealthcareModule ? 'Interactive Healthcare Scenario' : 'Interactive Screenshot'}: ${step.title || `Step ${stepNumber}`}
                    </div>
                </div>
                `}
                
                ${generateQuizSection(step, index)}
                
                <div class="notes-section">
                    <div class="notes-header">
                        📝 Personal Notes
                    </div>
                    <textarea class="notes-input" placeholder="Add your personal notes about this step..." id="notes-${index}"></textarea>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-success" onclick="markStepComplete(${index})" ${isCompleted ? 'disabled' : ''}>
                        ${isCompleted ? '✅ Completed' : 'Mark as Complete'}
                    </button>
                    ${isHealthcareModule ? 
                      `<button class="btn btn-primary" onclick="practiceScenario(${index})">🎭 Practice Scenario</button>` :
                      `<button class="btn btn-primary" onclick="practiceExercise(${index})">Practice Exercise</button>`
                    }
                    ${index < steps.length - 1 ? `<button class="btn btn-outline" onclick="navigateToStep(${index + 1})">Next Step</button>` : ''}
                </div>
            </div>
        </div>`;
    }).join('\n        ');
  };
  
  const generateQuizSection = (step: any, stepIndex: number) => {
    if (!step.quizQuestions || step.quizQuestions.length === 0) {
      // Generate a contextual quiz for healthcare modules
      if (isHealthcareModule) {
        const contextualOptions = [
          "Verify patient understanding and provide clear instructions",
          "Rush through to see more patients", 
          "Assume the patient understands without checking"
        ];
        
        return `
        <div class="interactive-quiz">
            <div class="quiz-question">
                🧠 Healthcare Knowledge Check: What's the most important thing to remember for this step?
            </div>
            <ul class="quiz-options">
                <li onclick="handleQuizAnswer(this, true)">Verify patient understanding and provide clear instructions</li>
                <li onclick="handleQuizAnswer(this, false)">Rush through to see more patients</li>
                <li onclick="handleQuizAnswer(this, false)">Assume the patient understands without checking</li>
            </ul>
        </div>`;
      } else {
        const quizOptions = [
          "Verify all required information is present",
          "Skip verification to save time", 
          "Ask a colleague to handle it"
        ];
        
        return `
        <div class="interactive-quiz">
            <div class="quiz-question">
                🧠 Knowledge Check: What's the most important thing to remember for this step?
            </div>
            <ul class="quiz-options">
                <li onclick="handleQuizAnswer(this, true)">Verify all required information is present</li>
                <li onclick="handleQuizAnswer(this, false)">Skip verification to save time</li>
                <li onclick="handleQuizAnswer(this, false)">Ask a colleague to handle it</li>
            </ul>
        </div>`;
      }
    }

    // Render actual quiz questions
    return step.quizQuestions.map((quiz: any, qIndex: number) => `
      <div class="interactive-quiz">
          <div class="quiz-question">
              🧠 ${quiz.question}
          </div>
          <ul class="quiz-options" id="quiz-${stepIndex}-${qIndex}">
              ${quiz.options?.map((option: string, oIndex: number) => `
                <li onclick="handleQuizAnswer(this, ${option === quiz.correctAnswer}, '${quiz.explanation || ''}')">${option}</li>
              `).join('') || ''}
          </ul>
      </div>
    `).join('');
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - SOPify Enhanced Training</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1a1a1a;
            color: #ffffff;
            min-height: 100vh;
        }
        
        .lms-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px 0;
            position: sticky;
            top: 0;
            z-index: 100;
            backdrop-filter: blur(10px);
        }
        
        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
        }
        
        .logo {
            font-size: 1.5em;
            font-weight: bold;
            color: white;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
            color: white;
        }
        
        .sidebar {
            position: fixed;
            left: 0;
            top: 80px;
            width: 300px;
            height: calc(100vh - 80px);
            background: #2a2a2a;
            padding: 20px;
            overflow-y: auto;
            border-right: 1px solid #444;
        }
        
        .main-content {
            margin-left: 300px;
            padding: 30px;
            max-width: 800px;
        }
        
        .chapter-nav {
            list-style: none;
            margin-bottom: 30px;
        }
        
        .chapter-nav li {
            padding: 12px;
            margin: 5px 0;
            background: #333;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .chapter-nav li:hover {
            background: #444;
            transform: translateX(5px);
        }
        
        .chapter-nav li.active {
            background: #007AFF;
            color: white;
        }
        
        .chapter-nav li.completed {
            background: #28a745;
        }
        
        .progress-section {
            background: #333;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
        }
        
        .overall-progress {
            margin-bottom: 15px;
        }
        
        .progress-bar {
            background: #555;
            border-radius: 10px;
            height: 12px;
            overflow: hidden;
            margin: 8px 0;
        }
        
        .progress-fill {
            background: linear-gradient(90deg, #007AFF, #00C851);
            height: 100%;
            transition: width 0.5s ease;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-top: 15px;
        }
        
        .stat-card {
            background: #444;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        
        .step-container {
            background: #2a2a2a;
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 25px;
            border: 1px solid #444;
            position: relative;
        }
        
        .step-container.current {
            border-color: #007AFF;
            box-shadow: 0 0 20px rgba(0, 122, 255, 0.3);
        }
        
        .step-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .step-number {
            background: linear-gradient(135deg, #667eea, #764ba2);
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
            font-size: 1.6em;
            font-weight: 600;
            color: #ffffff;
        }
        
        .step-content {
            margin-left: 70px;
        }
        
        .screenshot-container {
            background: #1e1e1e;
            border: 2px solid #007AFF;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            position: relative;
        }
        
        .screenshot-overlay {
            position: relative;
            min-height: 200px;
            background: linear-gradient(45deg, #333, #555);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ccc;
            font-style: italic;
        }
        
        .callout {
            position: absolute;
            background: #FF6B35;
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(255, 107, 53, 0.3);
        }
        
        .interactive-quiz {
            background: #2d4a7c;
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
        }
        
        .quiz-question {
            font-size: 1.1em;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .quiz-options {
            list-style: none;
        }
        
        .quiz-options li {
            background: #3a5998;
            margin: 8px 0;
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .quiz-options li:hover {
            background: #4a69a8;
            transform: translateX(5px);
        }
        
        .notes-section {
            background: #2a4d3a;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .notes-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .notes-input {
            width: 100%;
            background: #1e2d1e;
            border: 1px solid #4a7c59;
            border-radius: 8px;
            padding: 12px;
            color: white;
            resize: vertical;
            min-height: 80px;
        }
        
        .action-buttons {
            display: flex;
            gap: 15px;
            margin-top: 25px;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary {
            background: #007AFF;
            color: white;
        }
        
        .btn-primary:hover {
            background: #0056b3;
            transform: translateY(-2px);
        }
        
        .btn-success {
            background: #28a745;
            color: white;
        }
        
        .btn-outline {
            background: transparent;
            border: 2px solid #007AFF;
            color: #007AFF;
        }
        
        .completion-badge {
            position: absolute;
            top: 15px;
            right: 15px;
            background: #28a745;
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .bookmark-btn {
            position: absolute;
            top: 15px;
            right: 60px;
            background: transparent;
            border: none;
            color: #ccc;
            font-size: 20px;
            cursor: pointer;
            transition: color 0.3s ease;
        }
        
        .bookmark-btn:hover {
            color: #FFD700;
        }
        
        .bookmark-btn.active {
            color: #FFD700;
        }
        
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
                transition: transform 0.3s ease;
            }
            
            .sidebar.open {
                transform: translateX(0);
            }
            
            .main-content {
                margin-left: 0;
                padding: 20px;
            }
            
            .header-content {
                padding: 0 15px;
            }
            
            .step-content {
                margin-left: 0;
                margin-top: 20px;
            }
            
            .step-header {
                flex-direction: column;
                text-align: center;
            }
            
            .action-buttons {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="lms-header">
        <div class="header-content">
            <div class="logo">🎯 ${title}</div>
            <div class="user-info">
                <span>📊 Progress: ${progressPercentage}%</span>
                ${isHealthcareModule ? '<span>🏥 Healthcare Training</span>' : ''}
            </div>
        </div>
    </div>
    
    <div class="sidebar">
        <div class="progress-section">
            <h3>📈 Your Progress</h3>
            <div class="overall-progress">
                <div>Overall Completion</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
                <small>${completedSteps} of ${totalSteps} steps completed</small>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <div style="font-size: 1.2em; font-weight: bold;">${progressPercentage}%</div>
                    <div style="font-size: 0.8em;">Complete</div>
                </div>
                <div class="stat-card">
                    <div style="font-size: 1.2em; font-weight: bold;">${totalSteps}</div>
                    <div style="font-size: 0.8em;">Total Steps</div>
                </div>
                <div class="stat-card">
                    <div style="font-size: 1.2em; font-weight: bold;">A+</div>
                    <div style="font-size: 0.8em;">Grade</div>
                </div>
            </div>
        </div>
        
        <h3>📚 Training Steps</h3>
        <ul class="chapter-nav">
            ${generateChapterNav()}
        </ul>
        
        <div style="margin-top: 30px;">
            <h4>🔖 Bookmarked Steps</h4>
            <div id="bookmarks" style="background: #333; padding: 15px; border-radius: 8px; margin-top: 10px;">
                <small>No bookmarks yet</small>
            </div>
        </div>
    </div>
    
    <div class="main-content">
        ${generateStepContainers()}
        
        <!-- Feedback Section -->
        ${generateFeedbackForm(title, options.moduleUrl)}
        
        <div style="background: #2a2a2a; padding: 30px; border-radius: 16px; margin-top: 40px; text-align: center;">
            <h3>🚀 Enhanced Training Module by SOPify</h3>
            <p style="margin: 15px 0; opacity: 0.9;">
                Professional training with progress tracking, interactive elements, and comprehensive learning tools.
                ${isHealthcareModule ? '<br><strong>🏥 Specialized for Healthcare Excellence</strong>' : ''}
            </p>
            <div style="margin-top: 25px;">
                <a href="https://sopifyapp.com" class="btn btn-primary" style="margin: 5px;">Create Your Training</a>
                <a href="https://sopifyapp.com/#pricing" class="btn btn-outline" style="margin: 5px;">View Plans</a>
            </div>
        </div>
    </div>
    
    <script>
        let currentStep = 0;
        let bookmarkedSteps = [];
        
        // ... keep existing code (all the JavaScript functions)
        
        function practiceScenario(stepIndex) {
            const stepTitle = document.querySelector('#step-' + stepIndex + ' .step-title').textContent;
            alert('🎭 Healthcare Scenario Practice\\n\\nYou would now practice: "' + stepTitle + '"\\n\\nThis could include:\\n• Role-playing exercises\\n• Patient interaction simulations\\n• Communication practice\\n• De-escalation scenarios');
        }
        
        function handleQuizAnswer(element, isCorrect, explanation = '') {
            // Disable all options in this quiz
            const quizOptions = element.parentElement;
            Array.from(quizOptions.children).forEach(option => {
                option.style.pointerEvents = 'none';
            });
            
            if (isCorrect) {
                element.style.background = '#28a745';
                element.innerHTML = '✅ ' + element.textContent + ' - Correct!';
                if (explanation) {
                    element.innerHTML += '<br><small style="font-style: italic; opacity: 0.9;">' + explanation + '</small>';
                }
            } else {
                element.style.background = '#dc3545';
                element.innerHTML = '❌ ' + element.textContent + ' - Try again!';
                
                // Show correct answer after 2 seconds
                setTimeout(() => {
                    const correctOption = Array.from(quizOptions.children).find(option => 
                        option.textContent.includes('Verify') || option.textContent.includes('patient understanding')
                    );
                    if (correctOption) {
                        correctOption.style.background = '#28a745';
                        correctOption.innerHTML = '✅ ' + correctOption.textContent + ' - This was the correct answer';
                    }
                }, 2000);
            }
        }
        
        // Enhanced completion tracking for healthcare modules
        function markStepComplete(stepIndex) {
            const navItems = document.querySelectorAll('.chapter-nav li');
            const stepContainer = document.getElementById('step-' + stepIndex);
            
            // Mark as completed in navigation
            navItems[stepIndex].classList.add('completed');
            navItems[stepIndex].innerHTML = navItems[stepIndex].innerHTML.replace('📍', '✅').replace('⏳', '✅');
            
            // Add completion badge
            if (!stepContainer.querySelector('.completion-badge')) {
                const badge = document.createElement('div');
                badge.className = 'completion-badge';
                badge.textContent = '✅ Completed';
                stepContainer.appendChild(badge);
            }
            
            // Update button
            const button = stepContainer.querySelector('.btn-success');
            button.textContent = '✅ Completed';
            button.disabled = true;
            
            // Update progress
            updateProgress();
            
            // Show encouragement for healthcare training
            if (${isHealthcareModule}) {
                setTimeout(() => {
                    alert('🏥 Excellent work! You\\'re building critical healthcare communication skills. Keep going!');
                }, 1000);
            }
        }
        
        // ... keep existing code (rest of JavaScript functions)
        
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            updateProgress();
            
            // Show healthcare-specific welcome message
            if (${isHealthcareModule}) {
                setTimeout(() => {
                    console.log('🏥 Welcome to specialized healthcare training. Focus on patient safety and clear communication.');
                }, 2000);
            }
        });
    </script>
</body>
</html>`;
}
