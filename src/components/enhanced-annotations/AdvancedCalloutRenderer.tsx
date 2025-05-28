import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Callout } from "@/types/sop";

interface AdvancedCalloutRendererProps {
  callout: Callout;
  screenshot: HTMLImageElement | string;
  containerRef: React.RefObject<HTMLDivElement>;
  isEditing?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  isSelected?: boolean;
}

const AdvancedCalloutRenderer: React.FC<AdvancedCalloutRendererProps> = ({
  callout,
  screenshot,
  containerRef,
  isEditing = false,
  onClick,
  isSelected = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processedImageData, setProcessedImageData] = useState<string | null>(null);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${callout.x}%`,
    top: `${callout.y}%`,
    width: `${callout.width}%`,
    height: `${callout.height}%`,
    cursor: isEditing ? 'pointer' : 'default',
    zIndex: 10,
    opacity: callout.style?.opacity || 1,
  };

  // Process blur/pixelate effects
  useEffect(() => {
    if (callout.shape === "blur" && typeof screenshot === 'string' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        // Set canvas size to match the callout area
        const containerElement = containerRef.current;
        if (!containerElement) return;

        const containerRect = containerElement.getBoundingClientRect();
        const calloutWidth = (callout.width / 100) * containerRect.width;
        const calloutHeight = (callout.height / 100) * containerRect.height;
        
        canvas.width = calloutWidth;
        canvas.height = calloutHeight;

        // Calculate source coordinates from the image
        const sourceX = (callout.x / 100) * img.width;
        const sourceY = (callout.y / 100) * img.height;
        const sourceWidth = (callout.width / 100) * img.width;
        const sourceHeight = (callout.height / 100) * img.height;

        // Draw the relevant portion of the image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, calloutWidth, calloutHeight
        );

        // Apply blur or pixelation effect
        if (callout.blurData?.type === "pixelate") {
          applyPixelateEffect(ctx, calloutWidth, calloutHeight, callout.blurData.intensity || 5);
        } else {
          applyBlurEffect(ctx, callout.blurData?.intensity || 5);
        }

        setProcessedImageData(canvas.toDataURL());
      };
      img.src = screenshot;
    }
  }, [callout, screenshot, containerRef]);

  const applyBlurEffect = (ctx: CanvasRenderingContext2D, intensity: number) => {
    // Apply CSS filter blur effect
    ctx.filter = `blur(${intensity}px)`;
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.putImageData(imageData, 0, 0);
    ctx.filter = 'none';
  };

  const applyPixelateEffect = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) => {
    const pixelSize = Math.max(1, Math.floor(intensity * 2));
    
    // Get the original image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Create pixelated effect
    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        // Get the color of the top-left pixel in this block
        const pixelIndex = (y * width + x) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        const a = data[pixelIndex + 3];
        
        // Fill the entire block with this color
        for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
          for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
            const blockPixelIndex = ((y + dy) * width + (x + dx)) * 4;
            data[blockPixelIndex] = r;
            data[blockPixelIndex + 1] = g;
            data[blockPixelIndex + 2] = b;
            data[blockPixelIndex + 3] = a;
          }
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const renderPolygon = () => {
    const sides = callout.polygonData?.sides || 6;
    const radius = Math.min(parseFloat(callout.width + ''), parseFloat(callout.height + '')) / 2;
    const centerX = parseFloat(callout.width + '') / 2;
    const centerY = parseFloat(callout.height + '') / 2;
    
    const points: string[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(`${x}%,${y}%`);
    }
    
    return (
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${callout.width} ${callout.height}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <polygon
          points={points.join(' ')}
          fill={callout.style?.fillColor || `${callout.color}40`}
          stroke={callout.style?.borderColor || callout.color}
          strokeWidth={callout.style?.borderWidth || 2}
        />
      </svg>
    );
  };

  const renderMagnifier = () => {
    if (typeof screenshot !== 'string') return null;
    
    const zoomLevel = callout.magnifierData?.zoomLevel || 2;
    const showBorder = callout.magnifierData?.showBorder !== false;
    
    return (
      <div 
        className="rounded-full overflow-hidden relative"
        style={{
          width: '100%',
          height: '100%',
          border: showBorder ? `${callout.style?.borderWidth || 3}px solid ${callout.style?.borderColor || callout.color}` : 'none',
        }}
      >
        <div
          style={{
            width: `${100 * zoomLevel}%`,
            height: `${100 * zoomLevel}%`,
            backgroundImage: `url(${screenshot})`,
            backgroundSize: `${100 * zoomLevel}% ${100 * zoomLevel}%`,
            backgroundPosition: `-${callout.x * zoomLevel}% -${callout.y * zoomLevel}%`,
            backgroundRepeat: 'no-repeat',
            transform: 'scale(1)',
            transformOrigin: 'center center',
          }}
        />
        {/* Magnifier glass effect overlay */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, transparent 60%, rgba(255,255,255,0.1) 70%, rgba(255,255,255,0.2) 80%, transparent 90%)',
            pointerEvents: 'none'
          }}
        />
      </div>
    );
  };

  const renderFreehand = () => {
    if (!callout.freehandData?.path) return null;
    
    return (
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${callout.width} ${callout.height}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <path
          d={callout.freehandData.path}
          fill="none"
          stroke={callout.style?.borderColor || callout.color}
          strokeWidth={callout.freehandData.strokeWidth || 3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const renderOval = () => (
    <div
      className="w-full h-full"
      style={{
        backgroundColor: callout.style?.fillColor || `${callout.color}40`,
        border: `${callout.style?.borderWidth || 2}px solid ${callout.style?.borderColor || callout.color}`,
        borderRadius: '50%',
        minWidth: '40px',
        minHeight: '30px',
      }}
    />
  );

  const renderCalloutContent = () => {
    switch (callout.shape) {
      case "blur":
        return (
          <div className="w-full h-full relative">
            <canvas 
              ref={canvasRef} 
              className="w-full h-full object-cover rounded"
              style={{ display: processedImageData ? 'none' : 'block' }}
            />
            {processedImageData && (
              <img 
                src={processedImageData} 
                alt="Blurred area" 
                className="w-full h-full object-cover rounded"
              />
            )}
            <div className="absolute inset-0 border-2 border-dashed border-red-500 rounded bg-red-500/10 flex items-center justify-center">
              <span className="text-red-500 text-xs font-medium bg-red-500/20 px-2 py-1 rounded">
                {callout.blurData?.type === "pixelate" ? "PIXELATED" : "BLURRED"}
              </span>
            </div>
          </div>
        );

      case "magnifier":
        return renderMagnifier();

      case "oval":
        return renderOval();

      case "polygon":
        return renderPolygon();

      case "freehand":
        return renderFreehand();

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      style={style}
      onClick={onClick}
      className={`group ${isSelected ? 'ring-2 ring-white ring-opacity-50' : ''}`}
    >
      {renderCalloutContent()}
    </motion.div>
  );
};

export default AdvancedCalloutRenderer; 