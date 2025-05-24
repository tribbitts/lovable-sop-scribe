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
  Settings
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
      if (event.key === 'Escape' && isAddingCallout) {
        setIsAddingCallout(false);
      }
    };

    if (isEditing) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isEditing, isAddingCallout]);

  const handleOverlayClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing || !isAddingCallout || !overlayRef.current || !onCalloutAdd) return;

    const rect = overlayRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // Default dimensions based on callout type
    let width = 5;  // percentage
    let height = 5; // percentage

    if (selectedTool === "rectangle") {
      width = 15;
      height = 10;
    } else if (selectedTool === "arrow") {
      width = 8;
      height = 8;
    }

    const newCallout: Omit<Callout, "id"> = {
      shape: selectedTool,
      color: selectedColor,
      x: Math.max(0, Math.min(95, x - width / 2)),
      y: Math.max(0, Math.min(95, y - height / 2)),
      width,
      height,
      number: selectedTool === "number" ? (screenshot.callouts.length + 1) : undefined,
    };

    onCalloutAdd(newCallout);
    // Keep adding mode active - user can add multiple callouts
  }, [isEditing, isAddingCallout, selectedTool, selectedColor, screenshot.callouts.length, onCalloutAdd]);

  const handleCalloutClick = useCallback((calloutId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (isEditing) {
      setEditingCallout(editingCallout === calloutId ? null : calloutId);
    }
  }, [isEditing, editingCallout]);

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

  const renderCallout = (callout: Callout) => {
    const isEditing = editingCallout === callout.id;
    
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${callout.x}%`,
      top: `${callout.y}%`,
      width: `${callout.width}%`,
      height: `${callout.height}%`,
      cursor: 'pointer',
      zIndex: 10,
    };

    const renderShape = () => {
      switch (callout.shape) {
        case "circle":
          return (
            <div
              className={`w-full h-full rounded-full border-2 ${
                isEditing ? 'border-white' : 'border-opacity-80'
              } flex items-center justify-center`}
              style={{ 
                backgroundColor: `${callout.color}40`,
                borderColor: callout.color,
              }}
            >
              {callout.number && (
                <span 
                  className="text-white font-bold text-xs"
                  style={{ fontSize: `${Math.max(8, callout.width * 0.8)}px` }}
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
                isEditing ? 'border-white' : 'border-opacity-80'
              } flex items-center justify-center`}
              style={{ 
                backgroundColor: `${callout.color}40`,
                borderColor: callout.color,
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
              className="w-full h-full rounded-full border-2 flex items-center justify-center font-bold text-white"
              style={{ 
                backgroundColor: callout.color,
                borderColor: callout.color,
              }}
            >
              <span style={{ fontSize: `${Math.max(10, callout.width * 0.6)}px` }}>
                {callout.number}
              </span>
            </div>
          );
        
        case "arrow":
          return (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ color: callout.color }}
            >
              <MousePointer className="w-full h-full" />
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
        onClick={(e) => handleCalloutClick(callout.id, e)}
        className={`group ${isEditing ? 'ring-2 ring-white ring-opacity-50' : ''}`}
      >
        {renderShape()}
        
        {/* Minimal Edit Controls */}
        <AnimatePresence>
          {isEditing && (
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
      {/* Minimal Floating Toolbar - Only when editing */}
      {isEditing && (
        <div className="absolute top-2 left-2 z-50 flex items-center gap-2">
          {/* Quick Add Button */}
          {!isAddingCallout ? (
            <Button
              size="sm"
              onClick={() => setIsAddingCallout(true)}
              className="h-8 px-3 text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Callouts
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsAddingCallout(false)}
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
                  { type: "circle", icon: Circle },
                  { type: "rectangle", icon: Square },
                  { type: "arrow", icon: MousePointer },
                  { type: "number", icon: Type },
                ].map(({ type, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => setSelectedTool(type as any)}
                    className={`p-1 rounded ${
                      selectedTool === type 
                        ? 'bg-purple-600 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
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
      >
        {/* Render Callouts */}
        <AnimatePresence>
          {screenshot.callouts.map(renderCallout)}
        </AnimatePresence>
      </div>
      
      {/* Minimal Status Indicators */}
      {isAddingCallout && (
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white border border-zinc-600">
          Click anywhere to add callouts • ESC or "Done Adding" to finish
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