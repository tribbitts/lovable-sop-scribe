
/**
 * Renders callouts on the screenshot
 */
export function renderCallouts(
  ctx: CanvasRenderingContext2D, 
  callouts: any[] = [], 
  canvasWidth: number, 
  canvasHeight: number, 
  paddingSize: number
): void {
  if (!callouts || callouts.length === 0) return;
  
  callouts.forEach(callout => {
    // Convert percentage positions to pixel positions
    const x = (callout.x / 100) * canvasWidth + paddingSize;
    const y = (callout.y / 100) * canvasHeight + paddingSize;
    const width = (callout.width / 100) * canvasWidth;
    const height = (callout.height / 100) * canvasHeight;
    
    // Ensure all callouts are circles with subtle glow effect
    const radius = Math.max(width, height) / 2;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    // Draw subtle glow effect
    ctx.shadowColor = callout.color;
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw thin border with transparent fill
    ctx.strokeStyle = callout.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Reset shadow for any subsequent drawing
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  });
}
