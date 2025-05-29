import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Callout } from "@/types/sop";
import * as StackBlur from "stackblur-canvas";

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

  // Process blur/pixelate effects with proper image processing
  useEffect(() => {
    try {
      if (callout.shape === "blur" && typeof screenshot === 'string' && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
          try {
            // Set canvas size to match the callout area
            const containerElement = containerRef.current;
            if (!containerElement) return;

            const containerRect = containerElement.getBoundingClientRect();
            const calloutWidth = Math.max(1, (callout.width / 100) * containerRect.width);
            const calloutHeight = Math.max(1, (callout.height / 100) * containerRect.height);
            
            canvas.width = calloutWidth;
            canvas.height = calloutHeight;

            // Calculate source coordinates from the image
            const sourceX = Math.max(0, (callout.x / 100) * img.width);
            const sourceY = Math.max(0, (callout.y / 100) * img.height);
            const sourceWidth = Math.max(1, (callout.width / 100) * img.width);
            const sourceHeight = Math.max(1, (callout.height / 100) * img.height);

            // Draw the relevant portion of the image
            ctx.drawImage(
              img,
              sourceX, sourceY, sourceWidth, sourceHeight,
              0, 0, calloutWidth, calloutHeight
            );

            // Apply blur or pixelation effect with proper libraries
            if (callout.blurData?.type === "pixelate") {
              applyPixelateEffect(ctx, calloutWidth, calloutHeight, callout.blurData.intensity || 5);
            } else {
              // Use StackBlur for real blur effect
              const intensity = Math.max(1, Math.min(50, callout.blurData?.intensity || 5));
              StackBlur.canvasRGBA(canvas, 0, 0, calloutWidth, calloutHeight, intensity);
            }

            setProcessedImageData(canvas.toDataURL());
          } catch (error) {
            console.error("Error processing blur effect:", error);
          }
        };
        img.onerror = () => {
          console.error("Error loading image for blur effect");
        };
        img.crossOrigin = "anonymous"; // Handle CORS for external images
        img.src = screenshot;
      }
    } catch (error) {
      console.error("Error in blur effect useEffect:", error);
    }
  }, [callout, screenshot, containerRef]);

  const applyPixelateEffect = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) => {
    try {
      const pixelSize = Math.max(1, Math.floor(intensity * 2));
      
      // Get the original image data
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      // Create pixelated effect by sampling and filling blocks
      for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
          // Get the color of the top-left pixel in this block
          const pixelIndex = (y * width + x) * 4;
          if (pixelIndex >= 0 && pixelIndex < data.length) {
            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];
            const a = data[pixelIndex + 3];
            
            // Fill the entire block with this color
            for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
              for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
                const blockPixelIndex = ((y + dy) * width + (x + dx)) * 4;
                if (blockPixelIndex >= 0 && blockPixelIndex < data.length) {
                  data[blockPixelIndex] = r;
                  data[blockPixelIndex + 1] = g;
                  data[blockPixelIndex + 2] = b;
                  data[blockPixelIndex + 3] = a;
                }
              }
            }
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    } catch (error) {
      console.error("Error applying pixelate effect:", error);
    }
  };

  const renderPolygon = () => {
    try {
      const sides = Math.max(3, callout.polygonData?.sides || 6);
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
    } catch (error) {
      console.error("Error rendering polygon:", error);
      return null;
    }
  };

  const renderMagnifier = () => {
    try {
      if (typeof screenshot !== 'string') return null;
      
      const zoomLevel = Math.max(1, callout.magnifierData?.zoomLevel || 2);
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
    } catch (error) {
      console.error("Error rendering magnifier:", error);
      return null;
    }
  };

  const renderFreehand = () => {
    try {
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
            strokeWidth={Math.max(1, callout.freehandData.strokeWidth || 3)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    } catch (error) {
      console.error("Error rendering freehand:", error);
      return null;
    }
  };

  const renderOval = () => {
    try {
      return (
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
    } catch (error) {
      console.error("Error rendering oval:", error);
      return null;
    }
  };

  const renderCalloutContent = () => {
    try {
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
    } catch (error) {
      console.error("Error rendering callout content:", error);
      return (
        <div className="w-full h-full bg-red-100 border-2 border-red-500 border-dashed flex items-center justify-center">
          <span className="text-red-500 text-xs">Error</span>
        </div>
      );
    }
  };

  try {
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
  } catch (error) {
    console.error("Error rendering AdvancedCalloutRenderer:", error);
    return null;
  }
};

export default AdvancedCalloutRenderer; 