
import { EnhancedCallout } from "@/types/enhanced-content";

export const renderEnhancedCallouts = (callouts: EnhancedCallout[], isInteractive: boolean = false): string => {
  if (!callouts || callouts.length === 0) {
    return '';
  }

  const calloutsHtml = callouts.map((callout, index) => {
    const sequenceNumber = callout.sequenceNumber || index + 1;
    
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
      ${isInteractive ? "cursor: pointer; transition: all 0.2s ease;" : ""}
    `;

    const numberStyle = callout.shape === "number" ? `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background-color: ${callout.color};
      color: white;
      font-weight: bold;
      font-size: 14px;
      border-radius: 50%;
    ` : "";

    const hotspotAttributes = isInteractive && callout.hotspotData ? `
      data-callout-id="${callout.id}"
      data-hover-text="${callout.hotspotData.hoverText || ''}"
      data-click-action="${callout.hotspotData.clickAction || 'reveal-text'}"
      data-reveal-content="${callout.hotspotData.revealContent || ''}"
      data-link-url="${callout.hotspotData.linkUrl || ''}"
    ` : "";

    return `
      <div 
        class="enhanced-callout" 
        style="${calloutStyle}"
        ${hotspotAttributes}
      >
        ${callout.shape === "number" ? `
          <div style="${numberStyle}">
            ${sequenceNumber}
          </div>
        ` : ""}
        
        ${isInteractive && callout.hotspotData?.hoverText ? `
          <div class="callout-tooltip" style="
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-bottom: 8px;
            padding: 6px 12px;
            background-color: rgba(0, 0, 0, 0.9);
            color: white;
            font-size: 12px;
            border-radius: 4px;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease;
            z-index: 1000;
          ">
            ${callout.hotspotData.hoverText}
          </div>
        ` : ""}
      </div>
    `;
  }).join('');

  return calloutsHtml;
};

export const generateCalloutInteractivityScript = (): string => {
  return `
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const callouts = document.querySelectorAll('.enhanced-callout[data-callout-id]');
        
        callouts.forEach(callout => {
          // Hover effects
          const tooltip = callout.querySelector('.callout-tooltip');
          
          callout.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 0 15px ' + this.style.borderColor.replace('rgb', 'rgba').replace(')', ', 0.5)');
            
            if (tooltip) {
              tooltip.style.opacity = '1';
            }
          });
          
          callout.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 0 8px ' + this.style.borderColor.replace('rgb', 'rgba').replace(')', ', 0.5)');
            
            if (tooltip) {
              tooltip.style.opacity = '0';
            }
          });
          
          // Click interactions
          callout.addEventListener('click', function() {
            const action = this.getAttribute('data-click-action');
            const revealContent = this.getAttribute('data-reveal-content');
            const linkUrl = this.getAttribute('data-link-url');
            
            switch(action) {
              case 'reveal-text':
                if (revealContent) {
                  alert(revealContent); // Simple implementation, can be enhanced
                }
                break;
              case 'link':
                if (linkUrl) {
                  window.open(linkUrl, '_blank');
                }
                break;
              case 'highlight':
                this.style.backgroundColor = this.style.borderColor.replace('rgb', 'rgba').replace(')', ', 0.3)');
                setTimeout(() => {
                  this.style.backgroundColor = this.style.borderColor.replace('rgb', 'rgba').replace(')', ', 0.1)');
                }, 1000);
                break;
            }
          });
        });
      });
    </script>
  `;
};
