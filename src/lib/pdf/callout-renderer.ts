
/**
 * Enhanced callout renderer with SOPify branding
 */
export function renderCallouts(
  ctx: CanvasRenderingContext2D, 
  callouts: any[] = [], 
  canvasWidth: number, 
  canvasHeight: number, 
  paddingSize: number
): void {
  if (!callouts || callouts.length === 0) return;
  
  callouts.forEach((callout, index) => {
    // Convert percentage positions to pixel positions
    const x = (callout.x / 100) * canvasWidth + paddingSize;
    const y = (callout.y / 100) * canvasHeight + paddingSize;
    const width = (callout.width / 100) * canvasWidth;
    const height = (callout.height / 100) * canvasHeight;
    
    // Enhanced SOPify-branded callouts
    const radius = Math.max(width, height) / 2;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    // SOPify blue color scheme
    const sopifyBlue = callout.color || '#007AFF';
    
    // Enhanced glow effect for SOPify branding
    ctx.shadowColor = sopifyBlue;
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Outer glow ring
    ctx.strokeStyle = sopifyBlue;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Main callout circle with SOPify styling
    ctx.globalAlpha = 1;
    ctx.strokeStyle = sopifyBlue;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Inner fill for better visibility
    ctx.fillStyle = sopifyBlue;
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 1, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add callout number if available
    if (callout.number || (index + 1)) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = sopifyBlue;
      ctx.font = 'bold 14px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const numberText = String(callout.number || (index + 1));
      ctx.fillText(numberText, centerX, centerY);
    }
    
    // Reset shadow and alpha for subsequent drawing
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  });
}
