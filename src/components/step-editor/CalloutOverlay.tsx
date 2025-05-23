import React, { useState, useRef, useCallback } from "react";
import { CalloutOverlayProps, Callout } from "@/types/sop";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Circle, 
  Square, 
  MousePointer, 
  Type, 
  Palette, 
  Trash2,
  Plus,
  Edit3
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
  const overlayRef = useRef<HTMLDivElement>(null);

  const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#45B7D1", // Blue
    "#FFA726", // Orange
    "#66BB6A", // Green
    "#AB47BC", // Purple
    "#FFEB3B", // Yellow
    "#FF5722", // Deep Orange
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
    console.log('Overlay clicked!', { isEditing, isAddingCallout });
    if (!isEditing || !isAddingCallout || !overlayRef.current || !onCalloutAdd) {
      console.log('Click ignored - conditions not met:', { 
        isEditing, 
        isAddingCallout, 
        hasOverlayRef: !!overlayRef.current, 
        hasOnCalloutAdd: !!onCalloutAdd 
      });
      return;
    }

    const rect = overlayRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    console.log('Placing callout at:', { x, y, selectedTool, selectedColor });

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

    console.log('Adding callout:', newCallout);
    onCalloutAdd(newCallout);
    setIsAddingCallout(false);
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
        
        {/* Edit Controls */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-zinc-900 border border-zinc-700 rounded-lg p-2 flex items-center gap-2 z-20"
            >
              {/* Color Palette */}
              <div className="flex gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 ${
                      callout.color === color ? 'border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCalloutColor(callout.id, color);
                    }}
                  />
                ))}
              </div>
              
              {/* Delete Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCallout(callout.id);
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="relative w-full h-full">
      {/* Editing Toolbar */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 right-4 z-50 bg-zinc-900 backdrop-blur-sm border-2 border-[#007AFF] rounded-lg p-4 shadow-2xl"
        >
          <div className="flex flex-col gap-3">
            {/* Top Row: Tools and Colors */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-sm font-medium text-white bg-[#007AFF] px-2 py-1 rounded whitespace-nowrap">Add Callout:</span>
                
                {/* Tool Selection */}
                <div className="flex gap-1">
                  {[
                    { type: "circle", icon: Circle, label: "Circle" },
                    { type: "rectangle", icon: Square, label: "Rectangle" },
                    { type: "arrow", icon: MousePointer, label: "Arrow" },
                    { type: "number", icon: Type, label: "Number" },
                  ].map(({ type, icon: Icon, label }) => (
                    <Button
                      key={type}
                      size="sm"
                      variant={selectedTool === type ? "default" : "outline"}
                      onClick={() => setSelectedTool(type as any)}
                      className={`h-8 w-8 p-0 ${
                        selectedTool === type 
                          ? 'bg-[#007AFF] text-white border-[#007AFF]' 
                          : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500'
                      }`}
                      title={label}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
                
                {/* Color Selection */}
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-zinc-400" />
                  <div className="flex gap-1">
                    {colors.slice(0, 5).map((color) => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform ${
                          selectedColor === color ? 'border-white scale-110' : 'border-zinc-600'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Add Callout Button - Always Visible */}
              <Button
                size="sm"
                onClick={() => setIsAddingCallout(!isAddingCallout)}
                className={`px-4 whitespace-nowrap ${
                  isAddingCallout 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-[#007AFF] hover:bg-[#0069D9] text-white'
                }`}
              >
                {isAddingCallout ? (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Click to Place
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Callout
                  </>
                )}
              </Button>
            </div>
            
            {/* Instructions Row */}
            {isAddingCallout && (
              <div className="text-sm text-zinc-300 bg-[#007AFF]/20 border border-[#007AFF]/30 rounded p-3">
                <strong>✨ Click anywhere on the screenshot below to place a <span className="text-[#007AFF] font-medium">{selectedTool}</span> callout</strong>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Overlay Container */}
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
        
        {/* Click Instructions Overlay */}
        {isAddingCallout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-lg p-6 text-center shadow-xl">
              <Plus className="h-8 w-8 text-[#007AFF] mx-auto mb-2" />
              <p className="text-white font-medium mb-1">Click to place {selectedTool}</p>
              <p className="text-sm text-zinc-400">
                Press Escape to cancel
              </p>
            </div>
          </motion.div>
        )}
        
        {/* Editing Mode Indicator */}
        {isEditing && !isAddingCallout && (
          <div className="absolute bottom-2 left-2 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 rounded-lg px-3 py-1">
            <span className="text-xs text-zinc-400">
              Edit mode: Click callouts to edit, or "Add Callout" to place new ones
            </span>
          </div>
        )}
      </div>
      
      {/* Callout Count Badge */}
      {screenshot.callouts.length > 0 && !isEditing && (
        <Badge 
          variant="secondary" 
          className="absolute top-2 right-2 bg-zinc-900/80 text-white border-zinc-700"
        >
          {screenshot.callouts.length} callout{screenshot.callouts.length !== 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
};

export default CalloutOverlay; 