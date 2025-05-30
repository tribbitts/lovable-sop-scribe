import React, { useState, useRef, useCallback } from "react";
import { CalloutOverlayProps, Callout } from "@/types/sop";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Circle, 
  Square, 
  MousePointer, 
  Type, 
  Palette, 
  Trash2,
  Plus,
  Settings,
  X,
  Eye,
  MessageCircle
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const CalloutOverlay: React.FC<CalloutOverlayProps> = ({
  screenshot,
  isEditing,
  onCalloutAdd,
  onCalloutUpdate,
  onCalloutDelete
}) => {
  const [selectedTool, setSelectedTool] = useState<"circle" | "rectangle" | "arrow" | "number">("circle");
  const [selectedColor, setSelectedColor] = useState("#FF6B6B");
  const [isAddingCallout, setIsAddingCallout] = useState(false);
  const [editingCallout, setEditingCallout] = useState<string | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [revealTextInput, setRevealTextInput] = useState("");
  const [showRevealTextDialog, setShowRevealTextDialog] = useState(false);
  
  // Click-to-reveal functionality
  const [revealedCallouts, setRevealedCallouts] = useState<Set<string>>(new Set());
  const [activeReveal, setActiveReveal] = useState<string | null>(null);
  const [revealPosition, setRevealPosition] = useState({ x: 0, y: 0 });
  
  // Hover preview for callout placement
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  
  const overlayRef = useRef<HTMLDivElement>(null);

  const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#45B7D1", // Blue
    "#FFA726", // Orange
    "#66BB6A", // Green
    "#AB47BC", // Purple
  ];

  // Handle escape key to cancel callout placement
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isAddingCallout) {
          setIsAddingCallout(false);
        } else if (activeReveal) {
          setActiveReveal(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAddingCallout, activeReveal]);

  const handleOverlayClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing || !isAddingCallout || !overlayRef.current || !onCalloutAdd) return;

    // Prevent the click if it's on an existing callout
    const target = event.target as HTMLElement;
    if (target !== overlayRef.current) return;

    // Get the exact position relative to the overlay element
    const rect = overlayRef.current.getBoundingClientRect();
    
    // Calculate position - using layerX/layerY as primary, with fallbacks
    let x: number;
    let y: number;
    
    // Try multiple methods to get the most accurate position
    const nativeEvent = event.nativeEvent as any;
    
    if (nativeEvent.layerX !== undefined && nativeEvent.layerY !== undefined) {
      // layerX/layerY gives position relative to the positioned parent
      x = (nativeEvent.layerX / overlayRef.current.offsetWidth) * 100;
      y = (nativeEvent.layerY / overlayRef.current.offsetHeight) * 100;
    } else if (nativeEvent.offsetX !== undefined && nativeEvent.offsetY !== undefined) {
      // offsetX/offsetY is relative to the target element
      x = (nativeEvent.offsetX / overlayRef.current.offsetWidth) * 100;
      y = (nativeEvent.offsetY / overlayRef.current.offsetHeight) * 100;
    } else {
      // Fallback to client coordinates
      x = ((event.clientX - rect.left) / rect.width) * 100;
      y = ((event.clientY - rect.top) / rect.height) * 100;
    }

    // Ensure coordinates are within bounds
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    // Default dimensions based on callout type
    let width = 6;  // percentage - slightly larger for better visibility
    let height = 6; // percentage

    if (selectedTool === "rectangle") {
      width = 15;
      height = 10;
    } else if (selectedTool === "arrow") {
      width = 10;
      height = 8;
    } else if (selectedTool === "circle" || selectedTool === "number") {
      // Ensure circles are perfectly square
      width = 6;
      height = 6;
    }

    // Calculate next number for numbered callouts
    const getNextNumber = () => {
      if (selectedTool !== "number") return undefined;
      const existingNumbers = screenshot.callouts
        .filter(c => c.shape === "number" && c.number)
        .map(c => c.number!)
        .sort((a, b) => a - b);
      
      // Find the next available number
      for (let i = 1; i <= existingNumbers.length + 1; i++) {
        if (!existingNumbers.includes(i)) {
          return i;
        }
      }
      return existingNumbers.length + 1;
    };

    const calloutData = {
      shape: selectedTool,
      color: selectedColor,
      x: Math.max(0, Math.min(100 - width, x - width / 2)),
      y: Math.max(0, Math.min(100 - height, y - height / 2)),
      width,
      height,
      number: getNextNumber(),
    };

    // If it's a numbered callout, show dialog for reveal text
    if (selectedTool === "number") {
      setShowRevealTextDialog(true);
      setRevealTextInput("");
      // Store the callout data for later use
      (window as any).tempCalloutData = calloutData;
    } else {
      onCalloutAdd(calloutData);
    }
  }, [isEditing, isAddingCallout, selectedTool, selectedColor, screenshot.callouts, onCalloutAdd]);

  const handleCalloutClick = useCallback((callout: Callout, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (isEditing) {
      setEditingCallout(editingCallout === callout.id ? null : callout.id);
    } else {
      // Click-to-reveal functionality for viewing mode
      if (callout.shape === "number" && callout.revealText) {
        const rect = overlayRef.current?.getBoundingClientRect();
        if (rect) {
          // Calculate position for reveal popup
          const calloutCenterX = (callout.x + callout.width / 2) / 100 * rect.width;
          const calloutCenterY = (callout.y + callout.height / 2) / 100 * rect.height;
          
          setRevealPosition({
            x: calloutCenterX,
            y: calloutCenterY
          });
          
          if (activeReveal === callout.id) {
            // Close if clicking the same callout
            setActiveReveal(null);
          } else {
            // Show reveal for this callout
            setActiveReveal(callout.id);
            setRevealedCallouts(prev => new Set([...prev, callout.id]));
          }
        }
      }
    }
  }, [isEditing, editingCallout, activeReveal]);

  const deleteCallout = useCallback((calloutId: string) => {
    if (onCalloutDelete) {
      onCalloutDelete(calloutId);
    }
    setEditingCallout(null);
  }, [onCalloutDelete]);

  const updateCalloutColor = useCallback((calloutId: string, color: string) => {
    const callout = screenshot.callouts.find(c => c.id === calloutId);
    if (callout && onCalloutUpdate) {
      onCalloutUpdate({ ...callout, color });
    }
  }, [screenshot.callouts, onCalloutUpdate]);

  const handleRevealTextSubmit = useCallback(() => {
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
  }, [revealTextInput, onCalloutAdd]);

  const handleRevealTextCancel = useCallback(() => {
    setShowRevealTextDialog(false);
    setRevealTextInput("");
    (window as any).tempCalloutData = null;
  }, []);

  const handleOverlayMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing || !isAddingCallout || !overlayRef.current) {
      setHoverPosition(null);
      return;
    }

    const rect = overlayRef.current.getBoundingClientRect();
    const nativeEvent = event.nativeEvent as any;
    
    let x: number;
    let y: number;
    
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

    setHoverPosition({ x, y });
  }, [isEditing, isAddingCallout]);

  const handleOverlayMouseLeave = useCallback(() => {
    setHoverPosition(null);
  }, []);

  const renderCallout = (callout: Callout) => {
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
    };

    const renderShape = () => {
      switch (callout.shape) {
        case "circle":
          return (
            <div
              className={`w-full h-full rounded-full border-2 ${
                isEditingThis ? 'border-white' : 'border-opacity-80'
              } transition-all duration-200 ${
                isInteractive ? 'hover:scale-110 hover:shadow-lg' : ''
              }`}
              style={{ 
                backgroundColor: `${callout.color}40`,
                borderColor: callout.color,
                aspectRatio: '1 / 1',
                minWidth: '40px',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {callout.number && (
                <span 
                  className="text-white font-bold"
                  style={{ fontSize: `${Math.max(14, callout.width * 2)}px` }}
                >
                  {callout.number}
                </span>
              )}
            </div>
          );
        
        case "rectangle":
          return (
            <div
              className={`w-full h-full border-2 ${
                isEditingThis ? 'border-white' : 'border-opacity-80'
              } transition-all duration-200`}
              style={{ 
                backgroundColor: `${callout.color}40`,
                borderColor: callout.color,
                minWidth: '40px',
                minHeight: '25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {callout.text && (
                <span className="text-white font-medium text-xs px-1 text-center">
                  {callout.text}
                </span>
              )}
            </div>
          );
        
        case "number":
          return (
            <div
              className={`w-full h-full rounded-full border-2 font-bold text-white transition-all duration-200 ${
                isInteractive ? 'hover:scale-110 hover:shadow-lg cursor-pointer' : ''
              } ${
                callout.revealText ? 'bg-gradient-to-br from-blue-500 to-purple-600' : ''
              } ${
                hasBeenRevealed && !isEditing ? 'ring-2 ring-yellow-400 ring-opacity-60' : ''
              }`}
              style={{ 
                backgroundColor: callout.revealText ? undefined : callout.color,
                borderColor: callout.color,
                aspectRatio: '1 / 1',
                minWidth: '40px',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}
            >
              <span style={{ fontSize: `${Math.max(14, callout.width * 2)}px` }}>
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
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ 
                minWidth: '40px',
                minHeight: '25px',
                position: 'relative'
              }}
            >
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 100 50" 
                fill="none"
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%'
                }}
              >
                {/* Clean arrow shape pointing right */}
                <polygon 
                  points="10,15 65,15 65,5 95,25 65,45 65,35 10,35" 
                  fill={callout.color}
                  stroke={callout.color}
                  strokeWidth="2"
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
        
        {/* Minimal Edit Controls */}
        <AnimatePresence>
          {isEditingThis && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm rounded-lg p-1 flex items-center gap-1 z-20 border border-zinc-600"
            >
              {/* Compact Color Palette */}
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-4 h-4 rounded-full border ${
                    callout.color === color ? 'border-white' : 'border-transparent'
                  } hover:scale-110 transition-transform`}
                  style={{ backgroundColor: color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateCalloutColor(callout.id, color);
                  }}
                />
              ))}
              
              {/* Edit Reveal Text Button (for numbered callouts) */}
              {callout.shape === "number" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRevealTextInput(callout.revealText || "");
                    setEditingCallout(callout.id);
                    setShowRevealTextDialog(true);
                    (window as any).tempCalloutData = callout;
                  }}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/20 rounded p-1"
                  title="Edit reveal text"
                >
                  <MessageCircle className="h-3 w-3" />
                </button>
              )}
              
              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCallout(callout.id);
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/20 rounded p-1 ml-1"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

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
              {/* Arrow pointing down */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-zinc-900 border-r border-b border-zinc-700 rotate-45"></div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {screenshot.callouts.find(c => c.id === activeReveal)?.number}
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
                  {screenshot.callouts.find(c => c.id === activeReveal)?.revealText}
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

      {/* Reveal Text Dialog for Editing */}
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
                onClick={editingCallout ? () => {
                  // Update existing callout
                  const callout = screenshot.callouts.find(c => c.id === editingCallout);
                  if (callout && onCalloutUpdate) {
                    onCalloutUpdate({ ...callout, revealText: revealTextInput.trim() || undefined });
                  }
                  setShowRevealTextDialog(false);
                  setRevealTextInput("");
                  setEditingCallout(null);
                } : handleRevealTextSubmit}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {editingCallout ? 'Update Callout' : 'Add Callout'}
              </Button>
              <Button
                onClick={editingCallout ? () => {
                  setShowRevealTextDialog(false);
                  setRevealTextInput("");
                  setEditingCallout(null);
                } : handleRevealTextCancel}
                variant="outline"
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
              >
                Cancel
              </Button>
            </div>
            <div className="mt-3 text-xs text-zinc-500">
              Tip: Leave empty to create a regular numbered callout without reveal text
            </div>
          </motion.div>
        </div>
      )}

      {/* Minimal Floating Toolbar - Only when editing */}
      {isEditing && (
        <div className="absolute top-2 left-2 z-50 flex items-center gap-2">
          {/* Quick Add Button */}
          {!isAddingCallout ? (
            <Button
              size="sm"
              onClick={() => {
                setIsAddingCallout(true);
                setShowToolbar(true); // Auto-show toolbar when adding
              }}
              className="h-8 px-3 text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Callouts
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setIsAddingCallout(false);
                setShowToolbar(false); // Hide toolbar when done
              }}
              className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
              ✓ Done Adding
            </Button>
          )}
          
          {/* Tool & Color Selector - Compact */}
          <AnimatePresence>
            {(isAddingCallout || showToolbar) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-1 bg-black/80 backdrop-blur-sm rounded-lg p-1 border border-zinc-600"
              >
                {/* Tool Selection - Compact */}
                {[
                  { type: "circle", icon: Circle, label: "Circle" },
                  { type: "rectangle", icon: Square, label: "Rectangle" },
                  { type: "arrow", icon: MousePointer, label: "Arrow" },
                  { type: "number", icon: Type, label: "Number" },
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setSelectedTool(type as any)}
                    className={`p-1.5 rounded transition-all ${
                      selectedTool === type 
                        ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400 ring-opacity-50' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                    title={label}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
                
                <div className="w-px h-4 bg-zinc-600 mx-1" />
                
                {/* Color Selection - Compact */}
                {colors.slice(0, 4).map((color) => (
                  <button
                    key={color}
                    className={`w-4 h-4 rounded-full border ${
                      selectedColor === color ? 'border-white ring-1 ring-white' : 'border-zinc-600'
                    } hover:scale-110 transition-transform`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Settings Toggle */}
          {!isAddingCallout && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowToolbar(!showToolbar)}
              className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
            >
              <Settings className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      {/* Main Overlay Container - Completely Clean */}
      <div
        ref={overlayRef}
        className={`absolute inset-0 ${
          isAddingCallout ? 'cursor-crosshair' : 'cursor-default'
        }`}
        onClick={handleOverlayClick}
        onMouseMove={handleOverlayMouseMove}
        onMouseLeave={handleOverlayMouseLeave}
        style={{ 
          pointerEvents: isEditing || screenshot.callouts.some(c => c.shape === "number" && c.revealText) ? 'auto' : 'none',
          touchAction: 'none' // Prevent touch scrolling interference
        }}
      >
        {/* Render Callouts */}
        <AnimatePresence>
          {screenshot.callouts.map(renderCallout)}
        </AnimatePresence>
        
        {/* Hover Preview */}
        {isAddingCallout && hoverPosition && (
          <div
            className="pointer-events-none absolute opacity-50"
            style={{
              left: `${hoverPosition.x}%`,
              top: `${hoverPosition.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
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
            {selectedTool === "arrow" && (
              <div style={{ width: '80px', height: '40px' }}>
                <svg width="100%" height="100%" viewBox="0 0 100 50" fill="none">
                  <polygon 
                    points="10,15 65,15 65,5 95,25 65,45 65,35 10,35" 
                    fill={selectedColor}
                    stroke={selectedColor}
                    strokeWidth="2"
                    opacity="0.6"
                  />
                </svg>
              </div>
            )}
            {selectedTool === "number" && (
              <div
                className="rounded-full border-2 flex items-center justify-center text-white font-bold"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: selectedColor,
                  borderColor: selectedColor,
                  fontSize: '16px'
                }}
              >
                {screenshot.callouts.filter(c => c.shape === "number").length + 1}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Interactive Callouts Indicator */}
      {!isEditing && screenshot.callouts.some(c => c.shape === "number" && c.revealText) && (
        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white border border-zinc-600 flex items-center gap-2">
          <MessageCircle className="h-3 w-3 text-blue-400" />
          <span>Click numbered callouts to reveal more info</span>
        </div>
      )}
      
      {/* Minimal Status Indicators */}
      {isAddingCallout && (
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white border border-zinc-600 flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span>Click to add</span>
            <div className="flex items-center gap-1 bg-purple-600/20 px-2 py-0.5 rounded">
              {selectedTool === "circle" && <Circle className="h-3 w-3" />}
              {selectedTool === "rectangle" && <Square className="h-3 w-3" />}
              {selectedTool === "arrow" && <MousePointer className="h-3 w-3" />}
              {selectedTool === "number" && <Type className="h-3 w-3" />}
              <span className="font-medium capitalize">{selectedTool}</span>
            </div>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedColor }} />
          </div>
          <span className="text-zinc-400">• ESC to cancel</span>
        </div>
      )}
      
      {/* Callout Count Badge - Only when not editing */}
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

export default CalloutOverlay; 