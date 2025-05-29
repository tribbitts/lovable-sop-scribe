
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Circle, 
  Square, 
  MousePointer, 
  Hash,
  Palette,
  Eye,
  Link,
  Lightbulb
} from "lucide-react";
import { EnhancedCallout } from "@/types/enhanced-content";
import { CalloutShape } from "@/types/sop";

interface EnhancedCalloutEditorProps {
  callouts: EnhancedCallout[];
  calloutColor: string;
  setCalloutColor: (color: string) => void;
  onCalloutUpdate: (callouts: EnhancedCallout[]) => void;
  autoNumbering?: boolean;
  setAutoNumbering?: (value: boolean) => void;
}

export const EnhancedCalloutEditor: React.FC<EnhancedCalloutEditorProps> = ({
  callouts,
  calloutColor,
  setCalloutColor,
  onCalloutUpdate,
  autoNumbering = true,
  setAutoNumbering
}) => {
  const [selectedCallout, setSelectedCallout] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<CalloutShape>("circle");

  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA726", 
    "#66BB6A", "#AB47BC", "#FFD93D", "#FF8A65"
  ];

  const calloutTools = [
    { shape: "circle" as CalloutShape, icon: Circle, name: "Circle" },
    { shape: "rectangle" as CalloutShape, icon: Square, name: "Rectangle" },
    { shape: "arrow" as CalloutShape, icon: MousePointer, name: "Arrow" },
    { shape: "number" as CalloutShape, icon: Hash, name: "Numbered" }
  ];

  const updateCalloutHotspot = (calloutId: string, hotspotData: any) => {
    const updatedCallouts = callouts.map(callout =>
      callout.id === calloutId 
        ? { ...callout, hotspotData: { ...callout.hotspotData, ...hotspotData } }
        : callout
    );
    onCalloutUpdate(updatedCallouts);
  };

  const selectedCalloutData = callouts.find(c => c.id === selectedCallout);

  return (
    <div className="space-y-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Enhanced Annotations</h3>
        <Badge variant="secondary" className="text-xs">
          {callouts.length} callouts
        </Badge>
      </div>

      {/* Auto-numbering toggle */}
      {setAutoNumbering && (
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-numbering"
            checked={autoNumbering}
            onCheckedChange={setAutoNumbering}
          />
          <Label htmlFor="auto-numbering" className="text-sm">
            Auto-number callouts
          </Label>
        </div>
      )}

      {/* Tool selection */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Annotation Tool</Label>
        <div className="grid grid-cols-2 gap-2">
          {calloutTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Button
                key={tool.shape}
                variant={selectedTool === tool.shape ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTool(tool.shape)}
                className="flex items-center gap-2"
              >
                <IconComponent className="h-3 w-3" />
                {tool.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Color selection */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Color</Label>
        <div className="flex gap-1 flex-wrap">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded border-2 transition-all ${
                calloutColor === color ? "border-white scale-110" : "border-zinc-300"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setCalloutColor(color)}
            />
          ))}
        </div>
      </div>

      {/* Callout list */}
      {callouts.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Existing Callouts</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {callouts.map((callout, index) => (
              <div
                key={callout.id}
                className={`p-2 border rounded cursor-pointer transition-colors ${
                  selectedCallout === callout.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
                onClick={() => setSelectedCallout(
                  selectedCallout === callout.id ? null : callout.id
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: callout.color }}
                  />
                  <span className="text-sm">
                    {autoNumbering ? `#${index + 1}` : ""} {callout.shape} callout
                  </span>
                  {callout.hotspotData && (
                    <Eye className="h-3 w-3 text-blue-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hotspot configuration for selected callout */}
      {selectedCalloutData && (
        <div className="border-t pt-4 space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Interactive Hotspot
          </h4>
          
          <div>
            <Label className="text-sm mb-2 block">Hover Text</Label>
            <Input
              value={selectedCalloutData.hotspotData?.hoverText || ""}
              onChange={(e) => updateCalloutHotspot(selectedCallout!, {
                hoverText: e.target.value
              })}
              placeholder="Text shown on hover..."
              className="text-sm"
            />
          </div>
          
          <div>
            <Label className="text-sm mb-2 block">Click Action</Label>
            <Select
              value={selectedCalloutData.hotspotData?.clickAction || "reveal-text"}
              onValueChange={(value) => updateCalloutHotspot(selectedCallout!, {
                clickAction: value
              })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reveal-text">Reveal Text</SelectItem>
                <SelectItem value="link">Open Link</SelectItem>
                <SelectItem value="highlight">Highlight Area</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {selectedCalloutData.hotspotData?.clickAction === "reveal-text" && (
            <div>
              <Label className="text-sm mb-2 block">Reveal Content</Label>
              <Textarea
                value={selectedCalloutData.hotspotData?.revealContent || ""}
                onChange={(e) => updateCalloutHotspot(selectedCallout!, {
                  revealContent: e.target.value
                })}
                placeholder="Content to show when clicked..."
                rows={3}
                className="text-sm"
              />
            </div>
          )}
          
          {selectedCalloutData.hotspotData?.clickAction === "link" && (
            <div>
              <Label className="text-sm mb-2 block">Link URL</Label>
              <Input
                value={selectedCalloutData.hotspotData?.linkUrl || ""}
                onChange={(e) => updateCalloutHotspot(selectedCallout!, {
                  linkUrl: e.target.value
                })}
                placeholder="https://..."
                className="text-sm"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
