import { Callout } from "@/types/sop";

/**
 * Enhanced callout renderer that matches the app's callout display
 */
export function renderCallouts(
  ctx: CanvasRenderingContext2D, 
  callouts: Callout[] = [], 
  canvasWidth: number, 
  canvasHeight: number, 
  paddingSize: number = 0
): void {
  if (!callouts || callouts.length === 0) return;
  
  callouts.forEach((callout) => {
    // Convert percentage positions to pixel positions and add padding offset
    const x = (callout.x / 100) * canvasWidth + paddingSize;
    const y = (callout.y / 100) * canvasHeight + paddingSize;
    const width = (callout.width / 100) * canvasWidth;
    const height = (callout.height / 100) * canvasHeight;
    
    // Save context state
    ctx.save();
    
    // Set common styles
    ctx.strokeStyle = callout.color;
    ctx.fillStyle = callout.color;
    ctx.lineWidth = 2;
    
    switch (callout.shape) {
      case 'circle':
        // Draw circle
        const circleRadius = Math.min(width, height) / 2;
        const circleCenterX = x + width / 2;
        const circleCenterY = y + height / 2;
        
        // Fill with semi-transparent color
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Stroke with full opacity
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Add number if it's a numbered circle
        if (callout.number) {
          ctx.fillStyle = callout.color;
          ctx.font = `bold ${Math.max(14, circleRadius * 0.8)}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(callout.number.toString(), circleCenterX, circleCenterY);
        }
        break;
        
      case 'number':
        // Draw numbered circle (filled)
        const numberRadius = Math.min(width, height) / 2;
        const numberCenterX = x + width / 2;
        const numberCenterY = y + height / 2;
        
        // Fill circle
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(numberCenterX, numberCenterY, numberRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add number in white
        if (callout.number) {
          ctx.fillStyle = 'white';
          ctx.font = `bold ${Math.max(14, numberRadius * 0.8)}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(callout.number.toString(), numberCenterX, numberCenterY);
        }
        
        // Add reveal indicator if has reveal text
        if (callout.revealText) {
          const indicatorRadius = numberRadius * 0.3;
          const indicatorX = numberCenterX + numberRadius * 0.7;
          const indicatorY = numberCenterY - numberRadius * 0.7;
          
          ctx.fillStyle = '#FFA726';
          ctx.beginPath();
          ctx.arc(indicatorX, indicatorY, indicatorRadius, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.fillStyle = 'black';
          ctx.font = `bold ${indicatorRadius}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', indicatorX, indicatorY);
        }
        break;
        
      case 'rectangle':
        // Draw rectangle
        ctx.globalAlpha = 0.2;
        ctx.fillRect(x, y, width, height);
        
        ctx.globalAlpha = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Add text if available
        if (callout.text) {
          ctx.fillStyle = callout.color;
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(callout.text, x + width / 2, y + height / 2);
        }
        break;
        
      case 'arrow':
        // Draw arrow pointing right
        const arrowCenterX = x + width / 2;
        const arrowCenterY = y + height / 2;
        const arrowLength = width * 0.8;
        const arrowHeight = height * 0.6;
        
        ctx.beginPath();
        // Arrow shaft
        ctx.moveTo(arrowCenterX - arrowLength / 2, arrowCenterY);
        ctx.lineTo(arrowCenterX + arrowLength / 4, arrowCenterY);
        // Arrow head
        ctx.lineTo(arrowCenterX + arrowLength / 4, arrowCenterY - arrowHeight / 2);
        ctx.lineTo(arrowCenterX + arrowLength / 2, arrowCenterY);
        ctx.lineTo(arrowCenterX + arrowLength / 4, arrowCenterY + arrowHeight / 2);
        ctx.lineTo(arrowCenterX + arrowLength / 4, arrowCenterY);
        
        ctx.fillStyle = callout.color;
        ctx.fill();
        break;
        
      default:
        // Default to circle
        const defaultRadius = Math.min(width, height) / 2;
        const defaultCenterX = x + width / 2;
        const defaultCenterY = y + height / 2;
        
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(defaultCenterX, defaultCenterY, defaultRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(defaultCenterX, defaultCenterY, defaultRadius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
    }
    
    // Restore context state
    ctx.restore();
  });
}
