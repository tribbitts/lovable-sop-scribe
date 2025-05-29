import React, { useState, useRef, useCallback, useEffect } from "react";
import { CalloutOverlayProps, Callout, CalloutShape, AdvancedCalloutStyle, BlurCalloutData, MagnifierCalloutData, PolygonCalloutData, FreehandCalloutData } from "@/types/sop";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus,
  Settings,
  X,
  Eye,
  MessageCircle,
  Trash2,
  RotateCcw
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import AdvancedCalloutTools from "./AdvancedCalloutTools";
import AdvancedCalloutRenderer from "./AdvancedCalloutRenderer";

const EnhancedCalloutOverlay: React.FC<CalloutOverlayProps> = ({
  screenshot,
  isEditing,
  onCalloutAdd,
  onCalloutUpdate,
  onCalloutDelete
}) => {
  const [selectedTool, setSelectedTool] = useState<CalloutShape>("circle");
  const [selectedColor, setSelectedColor] = useState("#FF6B6B");
  const [isAddingCallout, setIsAddingCallout] = useState(false);
  const [editingCallout, setEditingCallout] = useState<string | null>(null);
  const [showToolPanel, setShowToolPanel] = useState(false);
  const [revealTextInput, setRevealTextInput] = useState("");
  const [showRevealTextDialog, setShowRevealTextDialog] = useState(false);
  
  // Advanced styling state
  const [advancedStyle, setAdvancedStyle] = useState<AdvancedCalloutStyle>({
    opacity: 1,
    borderWidth: 2,
    fontSize: 14,
    fontFamily: "system",
    fontColor: "#ffffff"
  });
  
  // Tool-specific state
  const [blurData, setBlurData] = useState({ intensity: 5, type: "blur" as "blur" | "pixelate" });
  const [magnifierData, setMagnifierData] = useState({ zoomLevel: 2, showBorder: true });
  const [polygonData, setPolygonData] = useState({ sides: 6 });
  const [freehandData, setFreehandData] = useState({ strokeWidth: 3, path: "" });
  
  // Freehand drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  
  // Click-to-reveal functionality
  const [revealedCallouts, setRevealedCallouts] = useState<Set<string>>(new Set());
  const [activeReveal, setActiveReveal] = useState<string | null>(null);
  const [revealPosition, setRevealPosition] = useState({ x: 0, y: 0 });
  
  // Hover preview for callout placement
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle escape key to cancel callout placement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isAddingCallout) {
          setIsAddingCallout(false);
          setIsDrawing(false);
          setCurrentPath("");
        } else if (activeReveal) {
          setActiveReveal(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAddingCallout, activeReveal]);

  const handleOverlayClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    try {
      if (!isEditing || !isAddingCallout || !overlayRef.current || !onCalloutAdd) return;

      // Don't handle clicks during freehand drawing
      if (selectedTool === "freehand" && isDrawing) return;

      // Prevent the click if it's on an existing callout
      const target = event.target as HTMLElement;
      if (target !== overlayRef.current) return;

      // Get the exact position relative to the overlay element
      const rect = overlayRef.current.getBoundingClientRect();
      
      let x: number;
      let y: number;
      
      const nativeEvent = event.nativeEvent as any;
      
      if (nativeEvent.layerX !== undefined && nativeEvent.layerY !== undefined) {
        x = (nativeEvent.layerX / overlayRef.current.offsetWidth) * 100;
        y = (nativeEvent.layerY / overlayRef.current.offsetHeight) * 100;
      } else if (nativeEvent.offsetX !== undefined && nativeEvent.offsetY !== undefined) {
        x = (nativeEvent.offsetX / overlayRef.current.offsetWidth) * 100;
        y = (nativeEvent.offsetY / overlayRef.current.offsetHeight) * 100;
      } else {
        x = ((event.clientX - rect.left) / rect.width) * 100;
        y = ((event.clientY - rect.top) / rect.height) * 100;
      }

      // Ensure coordinates are within bounds
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));

      // Default dimensions based on callout type
      let width = 6;
      let height = 6;

      switch (selectedTool) {
        case "rectangle":
          width = 15;
          height = 10;
          break;
        case "arrow":
          width = 10;
          height = 8;
          break;
        case "blur":
          width = 20;
          height = 15;
          break;
        case "magnifier":
          width = 12;
          height = 12;
          break;
        case "oval":
          width = 10;
          height = 8;
          break;
        case "polygon":
          width = 10;
          height = 10;
          break;
        default:
          // Handle freehand and other cases
          if (selectedTool === ("freehand" as CalloutShape)) {
            // Start freehand drawing
            setIsDrawing(true);
            const startPath = `M ${x} ${y}`;
            setCurrentPath(startPath);
            return;
          }
          // Default size for circle, number, etc.
          width = 6;
          height = 6;
          break;
      }

      // Calculate next number for numbered callouts
      const getNextNumber = () => {
        if (selectedTool !== "number") return undefined;
        if (!screenshot?.callouts || !Array.isArray(screenshot.callouts)) return 1;
        
        const existingNumbers = screenshot.callouts
          .filter(c => c && c.shape === "number" && typeof c.number === 'number')
          .map(c => c.number!)
          .sort((a, b) => a - b);
        
        for (let i = 1; i <= existingNumbers.length + 1; i++) {
          if (!existingNumbers.includes(i)) {
            return i;
          }
        }
        return existingNumbers.length + 1;
      };

      const calloutData: Omit<Callout, "id"> = {
        shape: selectedTool,
        color: selectedColor,
        x: Math.max(0, Math.min(100 - width, x - width / 2)),
        y: Math.max(0, Math.min(100 - height, y - height / 2)),
        width,
        height,
        number: getNextNumber(),
        style: { ...advancedStyle },
        blurData: selectedTool === "blur" ? { ...blurData } : undefined,
        magnifierData: selectedTool === "magnifier" ? { ...magnifierData } : undefined,
        polygonData: selectedTool === "polygon" ? { ...polygonData } : undefined,
        freehandData: selectedTool === "freehand" ? { ...freehandData } : undefined,
      };

      // If it's a numbered callout, show dialog for reveal text
      if (selectedTool === "number") {
        setShowRevealTextDialog(true);
        setRevealTextInput("");
        (window as any).tempCalloutData = calloutData;
      } else {
        onCalloutAdd(calloutData);
      }
    } catch (error) {
      console.error("Error in handleOverlayClick:", error);
      // Reset state on error
      setIsAddingCallout(false);
      setIsDrawing(false);
      setCurrentPath("");
    }
  }, [isEditing, isAddingCallout, selectedTool, selectedColor, screenshot?.callouts, onCalloutAdd, advancedStyle, blurData, magnifierData, polygonData, freehandData, isDrawing]);

  const handleFreehandDrawing = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    try {
      if (!isDrawing || selectedTool !== "freehand" || !overlayRef.current) return;

      const rect = overlayRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      setCurrentPath(prev => `${prev} L ${x} ${y}`);
    } catch (error) {
      console.error("Error in handleFreehandDrawing:", error);
      setIsDrawing(false);
      setCurrentPath("");
    }
  }, [isDrawing, selectedTool]);

  const finishFreehandDrawing = useCallback(() => {
    try {
      if (!isDrawing || !currentPath || !onCalloutAdd) return;

      const calloutData: Omit<Callout, "id"> = {
        shape: "freehand",
        color: selectedColor,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        style: { ...advancedStyle },
        freehandData: { 
          path: currentPath,
          strokeWidth: freehandData.strokeWidth 
        }
      };

      onCalloutAdd(calloutData);
      setIsDrawing(false);
      setCurrentPath("");
    } catch (error) {
      console.error("Error in finishFreehandDrawing:", error);
      setIsDrawing(false);
      setCurrentPath("");
    }
  }, [isDrawing, currentPath, onCalloutAdd, selectedColor, advancedStyle, freehandData]);

  const handleCalloutClick = useCallback((callout: Callout, event: React.MouseEvent) => {
    try {
      event.stopPropagation();
      
      if (isEditing) {
        setEditingCallout(editingCallout === callout.id ? null : callout.id);
      } else {
        // Click-to-reveal functionality for viewing mode
        if (callout.shape === "number" && callout.revealText) {
          const rect = overlayRef.current?.getBoundingClientRect();
          if (rect) {
            const calloutCenterX = (callout.x + callout.width / 2) / 100 * rect.width;
            const calloutCenterY = (callout.y + callout.height / 2) / 100 * rect.height;
            
            setRevealPosition({
              x: calloutCenterX,
              y: calloutCenterY
            });
            
            if (activeReveal === callout.id) {
              setActiveReveal(null);
            } else {
              setActiveReveal(callout.id);
              setRevealedCallouts(prev => new Set([...prev, callout.id]));
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in handleCalloutClick:", error);
    }
  }, [isEditing, editingCallout, activeReveal]);

  const deleteCallout = useCallback((calloutId: string) => {
    try {
      if (onCalloutDelete) {
        onCalloutDelete(calloutId);
      }
      setEditingCallout(null);
    } catch (error) {
      console.error("Error in deleteCallout:", error);
    }
  }, [onCalloutDelete]);

  const updateCalloutColor = useCallback((calloutId: string, color: string) => {
    try {
      if (!screenshot?.callouts || !Array.isArray(screenshot.callouts)) return;
      
      const callout = screenshot.callouts.find(c => c && c.id === calloutId);
      if (callout && onCalloutUpdate) {
        onCalloutUpdate({ ...callout, color });
      }
    } catch (error) {
      console.error("Error in updateCalloutColor:", error);
    }
  }, [screenshot?.callouts, onCalloutUpdate]);

  const handleRevealTextSubmit = useCallback(() => {
    try {
      const calloutData = (window as any).tempCalloutData;
      if (calloutData && onCalloutAdd) {
        const newCallout: Omit<Callout, "id"> = {
          ...calloutData,
          revealText: revealTextInput.trim() || undefined,
        };
        onCalloutAdd(newCallout);
        setShowRevealTextDialog(false);
        setRevealTextInput("");
        (window as any).tempCalloutData = null;
      }
    } catch (error) {
      console.error("Error in handleRevealTextSubmit:", error);
      setShowRevealTextDialog(false);
      setRevealTextInput("");
      (window as any).tempCalloutData = null;
    }
  }, [revealTextInput, onCalloutAdd]);

  const handleRevealTextCancel = useCallback(() => {
    setShowRevealTextDialog(false);
    setRevealTextInput("");
    (window as any).tempCalloutData = null;
  }, []);

  const handleOverlayMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    try {
      if (isDrawing && selectedTool === "freehand") {
        handleFreehandDrawing(event);
        return;
      }

      if (!isEditing || !isAddingCallout || !overlayRef.current) {
        setHoverPosition(null);
        return;
      }

      const rect = overlayRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      setHoverPosition({ x, y });
    } catch (error) {
      console.error("Error in handleOverlayMouseMove:", error);
      setHoverPosition(null);
    }
  }, [isEditing, isAddingCallout, isDrawing, selectedTool, handleFreehandDrawing]);

  const handleOverlayMouseLeave = useCallback(() => {
    setHoverPosition(null);
  }, []);

  const handleOverlayMouseUp = useCallback(() => {
    if (isDrawing && selectedTool === "freehand") {
      finishFreehandDrawing();
    }
  }, [isDrawing, selectedTool, finishFreehandDrawing]);

  // Render standard callouts (circle, rectangle, arrow, number)
  const renderStandardCallout = (callout: Callout) => {
    try {
      // Use the original CalloutOverlay rendering logic for standard callouts
      const isEditingThis = editingCallout === callout.id;
      const hasBeenRevealed = revealedCallouts.has(callout.id);
      const isInteractive = callout.shape === "number" && callout.revealText && !isEditing;
      
      const style: React.CSSProperties = {
        position: 'absolute',
        left: `${callout.x}%`,
        top: `${callout.y}%`,
        width: `${callout.width}%`,
        height: `${callout.height}%`,
        cursor: isInteractive ? 'pointer' : isEditing ? 'pointer' : 'default',
        zIndex: 10,
        opacity: callout.style?.opacity || 1,
      };

      // Render shape based on type - using standard shapes for basic callouts
      const renderShape = () => {
        const fillColor = callout.style?.fillColor || `${callout.color}40`;
        const borderColor = callout.style?.borderColor || callout.color;
        const borderWidth = callout.style?.borderWidth || 2;
        const fontSize = callout.style?.fontSize || 14;
        const fontFamily = callout.style?.fontFamily || "system";
        const fontColor = callout.style?.fontColor || "#ffffff";

        switch (callout.shape) {
          case "circle":
            return (
              <div
                className={`w-full h-full rounded-full transition-all duration-200 ${
                  isEditingThis ? 'border-white' : 'border-opacity-80'
                } ${
                  isInteractive ? 'hover:scale-110 hover:shadow-lg' : ''
                }`}
                style={{ 
                  backgroundColor: fillColor,
                  border: `${borderWidth}px solid ${borderColor}`,
                  aspectRatio: '1 / 1',
                  minWidth: '40px',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: fontFamily,
                  fontSize: `${fontSize}px`,
                  color: fontColor
                }}
              >
                {callout.number && (
                  <span className="font-bold">
                    {callout.number}
                  </span>
                )}
              </div>
            );
          
          case "rectangle":
            return (
              <div
                className={`w-full h-full transition-all duration-200 ${
                  isEditingThis ? 'border-white' : 'border-opacity-80'
                }`}
                style={{ 
                  backgroundColor: fillColor,
                  border: `${borderWidth}px solid ${borderColor}`,
                  minWidth: '40px',
                  minHeight: '25px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: fontFamily,
                  fontSize: `${fontSize}px`,
                  color: fontColor
                }}
              >
                {callout.text && (
                  <span className="font-medium text-center px-1">
                    {callout.text}
                  </span>
                )}
              </div>
            );
          
          case "number":
            return (
              <div
                className={`w-full h-full rounded-full border-2 font-bold transition-all duration-200 ${
                  isInteractive ? 'hover:scale-110 hover:shadow-lg cursor-pointer' : ''
                } ${
                  callout.revealText ? 'bg-gradient-to-br from-blue-500 to-purple-600' : ''
                } ${
                  hasBeenRevealed && !isEditing ? 'ring-2 ring-yellow-400 ring-opacity-60' : ''
                }`}
                style={{ 
                  backgroundColor: callout.revealText ? undefined : (callout.style?.fillColor || callout.color),
                  borderColor: borderColor,
                  aspectRatio: '1 / 1',
                  minWidth: '40px',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `${fontSize}px`,
                  fontFamily: fontFamily,
                  color: fontColor
                }}
              >
                <span>
                  {callout.number}
                </span>
                {callout.revealText && (
                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center transition-all duration-200 ${
                    hasBeenRevealed ? 'bg-yellow-400' : 'bg-blue-400 animate-pulse'
                  }`}>
                    <span className="text-xs text-black font-bold">
                      {hasBeenRevealed ? '✓' : '?'}
                    </span>
                  </div>
                )}
              </div>
            );
          
          case "arrow":
            return (
              <div className="w-full h-full flex items-center justify-center" style={{ minWidth: '40px', minHeight: '25px' }}>
                <svg width="100%" height="100%" viewBox="0 0 100 50" fill="none">
                  <polygon 
                    points="10,15 65,15 65,5 95,25 65,45 65,35 10,35" 
                    fill={callout.style?.fillColor || callout.color}
                    stroke={callout.style?.borderColor || callout.color}
                    strokeWidth={callout.style?.borderWidth || 2}
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            );
          
          default:
            return null;
        }
      };

      return (
        <motion.div
          key={callout.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          style={style}
          onClick={(e) => handleCalloutClick(callout, e)}
          className={`group ${isEditingThis ? 'ring-2 ring-white ring-opacity-50' : ''}`}
        >
          {renderShape()}
          
          {/* Edit Controls */}
          <AnimatePresence>
            {isEditingThis && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm rounded-lg p-1 flex items-center gap-1 z-20 border border-zinc-600"
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCallout(callout.id);
                  }}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/20 rounded p-1"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      );
    } catch (error) {
      console.error("Error rendering standard callout:", error);
      return null;
    }
  };

  const renderCallout = (callout: Callout) => {
    try {
      if (!callout || !callout.id) return null;
      
      // Use advanced renderer for new callout types
      if (["blur", "magnifier", "oval", "polygon", "freehand"].includes(callout.shape)) {
        return (
          <AdvancedCalloutRenderer
            key={callout.id}
            callout={callout}
            screenshot={screenshot?.dataUrl || ""}
            containerRef={overlayRef}
            isEditing={isEditing}
            onClick={(e) => handleCalloutClick(callout, e)}
            isSelected={editingCallout === callout.id}
          />
        );
      } else {
        return renderStandardCallout(callout);
      }
    } catch (error) {
      console.error("Error rendering callout:", error);
      return null;
    }
  };

  // Type-safe handlers for tool-specific data
  const handleBlurDataChange = useCallback((data: BlurCalloutData) => {
    setBlurData(prev => ({
      intensity: data.intensity ?? prev.intensity,
      type: data.type ?? prev.type
    }));
  }, []);

  const handleMagnifierDataChange = useCallback((data: MagnifierCalloutData) => {
    setMagnifierData(prev => ({
      zoomLevel: data.zoomLevel ?? prev.zoomLevel,
      showBorder: data.showBorder ?? prev.showBorder
    }));
  }, []);

  const handlePolygonDataChange = useCallback((data: PolygonCalloutData) => {
    setPolygonData(prev => ({
      sides: data.sides ?? prev.sides
    }));
  }, []);

  const handleFreehandDataChange = useCallback((data: FreehandCalloutData) => {
    setFreehandData(prev => ({
      strokeWidth: data.strokeWidth ?? prev.strokeWidth,
      path: data.path ?? prev.path
    }));
  }, []);

  // Safe callouts array access
  const safeCallouts = screenshot?.callouts || [];

  return (
    <div className="relative w-full h-full">
      {/* Click-to-Reveal Popup */}
      <AnimatePresence>
        {activeReveal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute z-50"
            style={{
              left: revealPosition.x,
              top: revealPosition.y,
              transform: 'translate(-50%, -100%)',
              marginTop: '-10px'
            }}
          >
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl max-w-xs w-64">
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-zinc-900 border-r border-b border-zinc-700 rotate-45"></div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {safeCallouts.find(c => c?.id === activeReveal)?.number}
                    </div>
                    <span className="text-xs text-zinc-400 font-medium">Click-to-Reveal</span>
                  </div>
                  <button
                    onClick={() => setActiveReveal(null)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="text-sm text-white leading-relaxed">
                  {safeCallouts.find(c => c?.id === activeReveal)?.revealText}
                </div>
                
                <div className="mt-3 pt-2 border-t border-zinc-700">
                  <div className="flex items-center text-xs text-zinc-500">
                    <Eye className="h-3 w-3 mr-1" />
                    Click callout again to close
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reveal Text Dialog */}
      {showRevealTextDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-800 rounded-lg p-6 max-w-md w-full mx-4 border border-zinc-700"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-purple-400" />
              {editingCallout ? 'Edit Click-to-Reveal Text' : 'Add Click-to-Reveal Text'}
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              Users will see the number first, then click it to reveal this text:
            </p>
            <textarea
              value={revealTextInput}
              onChange={(e) => setRevealTextInput(e.target.value)}
              placeholder="Enter the text that will be revealed when users click the numbered callout..."
              className="w-full h-32 bg-zinc-900 border border-zinc-600 rounded-lg p-3 text-white placeholder-zinc-500 resize-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleRevealTextSubmit}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Add Callout
              </Button>
              <Button
                onClick={handleRevealTextCancel}
                variant="outline"
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Enhanced Toolbar */}
      {isEditing && (
        <div className="absolute top-2 left-2 z-50 flex items-center gap-2">
          {/* Quick Add Button */}
          {!isAddingCallout ? (
            <Button
              size="sm"
              onClick={() => {
                setIsAddingCallout(true);
                setShowToolPanel(true);
              }}
              className="h-8 px-3 text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Annotations
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={() => {
                  setIsAddingCallout(false);
                  setShowToolPanel(false);
                  setIsDrawing(false);
                  setCurrentPath("");
                }}
                className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white shadow-lg"
              >
                ✓ Done Adding
              </Button>
              
              {isDrawing && (
                <Button
                  size="sm"
                  onClick={() => {
                    setIsDrawing(false);
                    setCurrentPath("");
                  }}
                  variant="outline"
                  className="h-8 px-3 text-xs border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Cancel Drawing
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Advanced Tool Panel */}
      <AnimatePresence>
        {showToolPanel && isEditing && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-12 left-2 z-40"
          >
            <AdvancedCalloutTools
              selectedTool={selectedTool}
              onToolChange={setSelectedTool}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              advancedStyle={advancedStyle}
              onStyleChange={setAdvancedStyle}
              blurData={blurData}
              onBlurDataChange={handleBlurDataChange}
              magnifierData={magnifierData}
              onMagnifierDataChange={handleMagnifierDataChange}
              polygonData={polygonData}
              onPolygonDataChange={handlePolygonDataChange}
              freehandData={freehandData}
              onFreehandDataChange={handleFreehandDataChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Overlay Container */}
      <div
        ref={overlayRef}
        className={`absolute inset-0 ${
          isAddingCallout ? (selectedTool === "freehand" ? "cursor-crosshair" : "cursor-crosshair") : "cursor-default"
        }`}
        onClick={handleOverlayClick}
        onMouseMove={handleOverlayMouseMove}
        onMouseLeave={handleOverlayMouseLeave}
        onMouseUp={handleOverlayMouseUp}
        style={{ 
          pointerEvents: isEditing || screenshot.callouts.some(c => c.shape === "number" && c.revealText) ? 'auto' : 'none',
          touchAction: 'none'
        }}
      >
        {/* Render Callouts */}
        <AnimatePresence>
          {safeCallouts.map(renderCallout)}
        </AnimatePresence>
        
        {/* Current Freehand Path Preview */}
        {isDrawing && currentPath && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 15 }}>
            <path
              d={currentPath}
              fill="none"
              stroke={selectedColor}
              strokeWidth={freehandData.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.8}
            />
          </svg>
        )}
        
        {/* Hover Preview for non-freehand tools */}
        {isAddingCallout && hoverPosition && selectedTool !== "freehand" && (
          <div
            className="pointer-events-none absolute opacity-50"
            style={{
              left: `${hoverPosition.x}%`,
              top: `${hoverPosition.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Render preview based on selected tool */}
            {selectedTool === "circle" && (
              <div
                className="rounded-full border-2"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: `${selectedColor}40`,
                  borderColor: selectedColor,
                }}
              />
            )}
            {selectedTool === "rectangle" && (
              <div
                className="border-2"
                style={{
                  width: '120px',
                  height: '80px',
                  backgroundColor: `${selectedColor}40`,
                  borderColor: selectedColor,
                }}
              />
            )}
            {selectedTool === "oval" && (
              <div
                className="border-2 rounded-full"
                style={{
                  width: '80px',
                  height: '60px',
                  backgroundColor: `${selectedColor}40`,
                  borderColor: selectedColor,
                }}
              />
            )}
            {selectedTool === "blur" && (
              <div
                className="border-2 border-dashed bg-red-500/20 border-red-500 rounded flex items-center justify-center"
                style={{ width: '120px', height: '80px' }}
              >
                <span className="text-red-500 text-xs font-medium">BLUR AREA</span>
              </div>
            )}
            {selectedTool === "magnifier" && (
              <div
                className="rounded-full border-4"
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: `${selectedColor}20`,
                  borderColor: selectedColor,
                }}
              />
            )}
          </div>
        )}
      </div>
      
      {/* Status Indicators */}
      {isAddingCallout && (
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white border border-zinc-600 flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span>
              {isDrawing ? "Drawing..." : "Click to add"}
            </span>
            <div className="flex items-center gap-1 bg-purple-600/20 px-2 py-0.5 rounded">
              <span className="font-medium capitalize">{selectedTool}</span>
            </div>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedColor }} />
          </div>
          <span className="text-zinc-400">• ESC to cancel</span>
        </div>
      )}
      
      {/* Interactive Callouts Indicator */}
      {!isEditing && screenshot.callouts.some(c => c.shape === "number" && c.revealText) && (
        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white border border-zinc-600 flex items-center gap-2">
          <MessageCircle className="h-3 w-3 text-blue-400" />
          <span>Click numbered callouts to reveal more info</span>
        </div>
      )}
      
      {/* Callout Count Badge */}
      {screenshot.callouts.length > 0 && !isEditing && (
        <Badge 
          variant="secondary" 
          className="absolute top-2 right-2 bg-black/80 text-white border-zinc-600 text-xs"
        >
          {screenshot.callouts.length}
        </Badge>
      )}
    </div>
  );
};

export default EnhancedCalloutOverlay; 