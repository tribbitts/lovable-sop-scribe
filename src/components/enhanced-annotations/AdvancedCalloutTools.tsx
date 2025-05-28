import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Eye, 
  ZoomIn, 
  Circle, 
  Shapes, 
  Pen, 
  Palette, 
  Type,
  Settings,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { CalloutShape, AdvancedCalloutStyle, BlurCalloutData, MagnifierCalloutData, PolygonCalloutData, FreehandCalloutData } from "@/types/sop";

interface AdvancedCalloutToolsProps {
  selectedTool: CalloutShape;
  onToolChange: (tool: CalloutShape) => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
  advancedStyle: AdvancedCalloutStyle;
  onStyleChange: (style: AdvancedCalloutStyle) => void;
  blurData?: BlurCalloutData;
  onBlurDataChange?: (data: BlurCalloutData) => void;
  magnifierData?: MagnifierCalloutData;
  onMagnifierDataChange?: (data: MagnifierCalloutData) => void;
  polygonData?: PolygonCalloutData;
  onPolygonDataChange?: (data: PolygonCalloutData) => void;
  freehandData?: FreehandCalloutData;
  onFreehandDataChange?: (data: FreehandCalloutData) => void;
}

const AdvancedCalloutTools: React.FC<AdvancedCalloutToolsProps> = ({
  selectedTool,
  onToolChange,
  selectedColor,
  onColorChange,
  advancedStyle,
  onStyleChange,
  blurData = { intensity: 5, type: "blur" },
  onBlurDataChange,
  magnifierData = { zoomLevel: 2, showBorder: true },
  onMagnifierDataChange,
  polygonData = { sides: 6 },
  onPolygonDataChange,
  freehandData = { strokeWidth: 3 },
  onFreehandDataChange
}) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);

  const extendedColors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA726", "#66BB6A", "#AB47BC",
    "#FF5722", "#2196F3", "#4CAF50", "#FF9800", "#9C27B0", "#607D8B",
    "#E91E63", "#00BCD4", "#8BC34A", "#FF6F00", "#3F51B5", "#795548"
  ];

  const tools = [
    { type: "circle" as CalloutShape, icon: Circle, label: "Circle", category: "basic" },
    { type: "rectangle" as CalloutShape, icon: () => <div className="w-4 h-3 border-2 border-current" />, label: "Rectangle", category: "basic" },
    { type: "arrow" as CalloutShape, icon: () => <div className="text-current">→</div>, label: "Arrow", category: "basic" },
    { type: "number" as CalloutShape, icon: Type, label: "Number", category: "basic" },
    { type: "oval" as CalloutShape, icon: () => <div className="w-4 h-3 border-2 border-current rounded-full" />, label: "Oval", category: "shapes" },
    { type: "polygon" as CalloutShape, icon: Shapes, label: "Polygon", category: "shapes" },
    { type: "blur" as CalloutShape, icon: Eye, label: "Blur/Pixelate", category: "effects" },
    { type: "magnifier" as CalloutShape, icon: ZoomIn, label: "Magnifier", category: "effects" },
    { type: "freehand" as CalloutShape, icon: Pen, label: "Freehand", category: "drawing" }
  ];

  const basicTools = tools.filter(t => t.category === "basic");
  const shapeTools = tools.filter(t => t.category === "shapes");
  const effectTools = tools.filter(t => t.category === "effects");
  const drawingTools = tools.filter(t => t.category === "drawing");

  const renderToolButton = (tool: typeof tools[0]) => {
    const Icon = tool.icon;
    return (
      <button
        key={tool.type}
        onClick={() => onToolChange(tool.type)}
        className={`p-2 rounded-lg transition-all ${
          selectedTool === tool.type 
            ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400 ring-opacity-50' 
            : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
        }`}
        title={tool.label}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  };

  const renderToolSpecificOptions = () => {
    switch (selectedTool) {
      case "blur":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-zinc-300 text-sm">Effect Type</Label>
              <Select 
                value={blurData.type} 
                onValueChange={(value: "blur" | "pixelate") => 
                  onBlurDataChange?.({ ...blurData, type: value })
                }
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-600">
                  <SelectItem value="blur" className="text-white">Blur</SelectItem>
                  <SelectItem value="pixelate" className="text-white">Pixelate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-zinc-300 text-sm">Intensity: {blurData.intensity}</Label>
              <Slider
                value={[blurData.intensity || 5]}
                onValueChange={([value]) => 
                  onBlurDataChange?.({ ...blurData, intensity: value })
                }
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
        );

      case "magnifier":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-zinc-300 text-sm">Zoom Level: {magnifierData.zoomLevel}x</Label>
              <Slider
                value={[magnifierData.zoomLevel || 2]}
                onValueChange={([value]) => 
                  onMagnifierDataChange?.({ ...magnifierData, zoomLevel: value })
                }
                min={1.5}
                max={5}
                step={0.5}
                className="mt-2"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300 text-sm">Show Border</Label>
              <input
                type="checkbox"
                checked={magnifierData.showBorder}
                onChange={(e) => 
                  onMagnifierDataChange?.({ ...magnifierData, showBorder: e.target.checked })
                }
                className="rounded border-zinc-600"
              />
            </div>
          </div>
        );

      case "polygon":
        return (
          <div>
            <Label className="text-zinc-300 text-sm">Sides: {polygonData.sides}</Label>
            <Slider
              value={[polygonData.sides || 6]}
              onValueChange={([value]) => 
                onPolygonDataChange?.({ ...polygonData, sides: value })
              }
              min={3}
              max={12}
              step={1}
              className="mt-2"
            />
          </div>
        );

      case "freehand":
        return (
          <div>
            <Label className="text-zinc-300 text-sm">Stroke Width: {freehandData.strokeWidth}px</Label>
            <Slider
              value={[freehandData.strokeWidth || 3]}
              onValueChange={([value]) => 
                onFreehandDataChange?.({ ...freehandData, strokeWidth: value })
              }
              min={1}
              max={10}
              step={1}
              className="mt-2"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-black/90 backdrop-blur-sm rounded-lg border border-zinc-600 p-4 space-y-4">
      {/* Basic Tools */}
      <div>
        <Label className="text-zinc-300 text-xs font-medium mb-2 block">Basic Tools</Label>
        <div className="flex gap-1">
          {basicTools.map(renderToolButton)}
        </div>
      </div>

      {/* Advanced Tools Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        className="w-full justify-between text-zinc-300 hover:text-white hover:bg-zinc-700"
      >
        <span className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Advanced Tools
        </span>
        {showAdvancedOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      <AnimatePresence>
        {showAdvancedOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Shape Tools */}
            <div>
              <Label className="text-zinc-300 text-xs font-medium mb-2 block">Shapes</Label>
              <div className="flex gap-1">
                {shapeTools.map(renderToolButton)}
              </div>
            </div>

            {/* Effect Tools */}
            <div>
              <Label className="text-zinc-300 text-xs font-medium mb-2 block">Effects</Label>
              <div className="flex gap-1">
                {effectTools.map(renderToolButton)}
              </div>
            </div>

            {/* Drawing Tools */}
            <div>
              <Label className="text-zinc-300 text-xs font-medium mb-2 block">Drawing</Label>
              <div className="flex gap-1">
                {drawingTools.map(renderToolButton)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color Selection */}
      <div>
        <Label className="text-zinc-300 text-xs font-medium mb-2 block">Colors</Label>
        <div className="grid grid-cols-6 gap-1">
          {extendedColors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded border-2 transition-all ${
                selectedColor === color ? 'border-white scale-110' : 'border-zinc-600 hover:border-zinc-400'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
            />
          ))}
        </div>
        
        {/* Custom Color Picker */}
        <div className="mt-2">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-full h-8 rounded border border-zinc-600 bg-zinc-800"
          />
        </div>
      </div>

      {/* Tool-Specific Options */}
      {renderToolSpecificOptions()}

      {/* Advanced Styling Panel */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowStylePanel(!showStylePanel)}
        className="w-full justify-between text-zinc-300 hover:text-white hover:bg-zinc-700"
      >
        <span className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Advanced Styling
        </span>
        {showStylePanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      <AnimatePresence>
        {showStylePanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-2 border-t border-zinc-700"
          >
            {/* Opacity */}
            <div>
              <Label className="text-zinc-300 text-sm">Opacity: {Math.round((advancedStyle.opacity || 1) * 100)}%</Label>
              <Slider
                value={[(advancedStyle.opacity || 1) * 100]}
                onValueChange={([value]) => 
                  onStyleChange({ ...advancedStyle, opacity: value / 100 })
                }
                min={10}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>

            {/* Border Width */}
            <div>
              <Label className="text-zinc-300 text-sm">Border Width: {advancedStyle.borderWidth || 2}px</Label>
              <Slider
                value={[advancedStyle.borderWidth || 2]}
                onValueChange={([value]) => 
                  onStyleChange({ ...advancedStyle, borderWidth: value })
                }
                min={0}
                max={10}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Font Settings (for text-based callouts) */}
            {(selectedTool === "number" || selectedTool === "rectangle") && (
              <>
                <div>
                  <Label className="text-zinc-300 text-sm">Font Size: {advancedStyle.fontSize || 14}px</Label>
                  <Slider
                    value={[advancedStyle.fontSize || 14]}
                    onValueChange={([value]) => 
                      onStyleChange({ ...advancedStyle, fontSize: value })
                    }
                    min={8}
                    max={48}
                    step={2}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-zinc-300 text-sm">Font Family</Label>
                  <Select 
                    value={advancedStyle.fontFamily || "system"} 
                    onValueChange={(value) => 
                      onStyleChange({ ...advancedStyle, fontFamily: value })
                    }
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-600">
                      <SelectItem value="system" className="text-white">System Default</SelectItem>
                      <SelectItem value="serif" className="text-white">Serif</SelectItem>
                      <SelectItem value="sans-serif" className="text-white">Sans Serif</SelectItem>
                      <SelectItem value="monospace" className="text-white">Monospace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-zinc-300 text-sm">Font Color</Label>
                  <input
                    type="color"
                    value={advancedStyle.fontColor || "#ffffff"}
                    onChange={(e) => onStyleChange({ ...advancedStyle, fontColor: e.target.value })}
                    className="w-full h-8 rounded border border-zinc-600 bg-zinc-800 mt-1"
                  />
                </div>
              </>
            )}

            {/* Fill and Border Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300 text-sm">Fill Color</Label>
                <input
                  type="color"
                  value={advancedStyle.fillColor || selectedColor}
                  onChange={(e) => onStyleChange({ ...advancedStyle, fillColor: e.target.value })}
                  className="w-full h-8 rounded border border-zinc-600 bg-zinc-800 mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-300 text-sm">Border Color</Label>
                <input
                  type="color"
                  value={advancedStyle.borderColor || selectedColor}
                  onChange={(e) => onStyleChange({ ...advancedStyle, borderColor: e.target.value })}
                  className="w-full h-8 rounded border border-zinc-600 bg-zinc-800 mt-1"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedCalloutTools; 