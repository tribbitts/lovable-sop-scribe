
import { EnhancedCallout } from "@/types/enhanced-content";

export const renderEnhancedCallouts = (callouts: EnhancedCallout[], autoNumbering: boolean = true) => {
  if (!callouts || callouts.length === 0) return '';

  const calloutsHtml = callouts.map((callout, index) => {
    const sequenceNumber = callout.sequenceNumber || (autoNumbering ? index + 1 : undefined);
    
    const calloutStyle = `
      position: absolute;
      left: ${callout.x}%;
      top: ${callout.y}%;
      width: ${callout.width}%;
      height: ${callout.height}%;
      border: 3px solid ${callout.color};
      box-shadow: 0 0 8px ${callout.color}80;
      background-color: ${callout.color}20;
      ${callout.shape === "circle" ? "border-radius: 50%;" : ""}
      ${callout.shape === "rectangle" ? "border-radius: 4px;" : ""}
      ${callout.shape === "arrow" ? "border-radius: 2px; transform: rotate(45deg);" : ""}
      ${callout.shape === "number" ? "border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: " + callout.color + "; color: white; font-weight: bold; font-size: 14px;" : ""}
      cursor: ${callout.hotspotData ? "pointer" : "default"};
      transition: all 0.3s ease;
    `;

    const hotspotAttributes = callout.hotspotData ? `
      data-hover-text="${callout.hotspotData.hoverText || ''}"
      data-click-action="${callout.hotspotData.clickAction || ''}"
      data-reveal-content="${callout.hotspotData.revealContent || ''}"
      data-link-url="${callout.hotspotData.linkUrl || ''}"
      class="enhanced-callout"
    ` : '';

    return `
      <div 
        style="${calloutStyle}"
        ${hotspotAttributes}
      >
        ${callout.shape === "number" && sequenceNumber ? sequenceNumber : ''}
        ${callout.hotspotData?.hoverText ? `
          <div class="callout-tooltip" style="
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            z-index: 1000;
          ">${callout.hotspotData.hoverText}</div>
        ` : ''}
      </div>
    `;
  }).join('');

  return callloutsHtml;
};

export const generateCalloutInteractivityScript = () => {
  return `
    <script>
      // Enhanced callout interactivity
      document.addEventListener('DOMContentLoaded', function() {
        const callouts = document.querySelectorAll('.enhanced-callout');
        
        callouts.forEach(callout => {
          const hoverText = callout.getAttribute('data-hover-text');
          const clickAction = callout.getAttribute('data-click-action');
          const revealContent = callout.getAttribute('data-reveal-content');
          const linkUrl = callout.getAttribute('data-link-url');
          
          // Hover functionality
          if (hoverText) {
            const tooltip = callout.querySelector('.callout-tooltip');
            if (tooltip) {
              callout.addEventListener('mouseenter', () => {
                tooltip.style.opacity = '1';
              });
              
              callout.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
              });
            }
          }
          
          // Click functionality
          if (clickAction) {
            callout.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              switch (clickAction) {
                case 'reveal-text':
                  if (revealContent) {
                    showRevealModal(revealContent);
                  }
                  break;
                  
                case 'link':
                  if (linkUrl) {
                    window.open(linkUrl, '_blank');
                  }
                  break;
                  
                case 'highlight':
                  highlightCallout(callout);
                  break;
              }
            });
          }
        });
        
        function showRevealModal(content) {
          // Create modal overlay
          const overlay = document.createElement('div');
          overlay.style.cssText = \`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
          \`;
          
          // Create modal content
          const modal = document.createElement('div');
          modal.style.cssText = \`
            background: white;
            padding: 24px;
            border-radius: 8px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            animation: slideIn 0.3s ease;
          \`;
          
          modal.innerHTML = \`
            <button style="
              position: absolute;
              top: 12px;
              right: 12px;
              background: none;
              border: none;
              font-size: 24px;
              cursor: pointer;
              color: #666;
            ">&times;</button>
            <div style="margin-right: 30px; white-space: pre-wrap;">\${content}</div>
          \`;
          
          overlay.appendChild(modal);
          document.body.appendChild(overlay);
          
          // Close functionality
          const closeBtn = modal.querySelector('button');
          const closeModal = () => {
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
              document.body.removeChild(overlay);
            }, 300);
          };
          
          closeBtn.addEventListener('click', closeModal);
          overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
          });
          
          // Add CSS animations
          const style = document.createElement('style');
          style.textContent = \`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes fadeOut {
              from { opacity: 1; }
              to { opacity: 0; }
            }
            @keyframes slideIn {
              from { transform: translateY(-20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          \`;
          document.head.appendChild(style);
        }
        
        function highlightCallout(callout) {
          const originalTransform = callout.style.transform;
          const originalBoxShadow = callout.style.boxShadow;
          
          callout.style.transform = (originalTransform || '') + ' scale(1.2)';
          callout.style.boxShadow = '0 0 20px rgba(255, 193, 7, 0.8)';
          
          setTimeout(() => {
            callout.style.transform = originalTransform;
            callout.style.boxShadow = originalBoxShadow;
          }, 2000);
        }
      });
    </script>
  `;
};
