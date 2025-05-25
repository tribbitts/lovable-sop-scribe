import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScreenshotData, Callout } from "@/types/sop";
import { 
  Camera, 
  Crop, 
  Trash2, 
  Edit3,
  Plus,
  GripVertical,
  Eye,
  MousePointer,
  Upload,
  ImagePlus,
  ChevronUp,
  ChevronDown,
  Settings
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useSopContext } from "@/context/SopContext";
import ImageCropper from "./ImageCropper";
import CalloutOverlay from "./CalloutOverlay";

interface MultipleScreenshotsManagerProps {
  stepId: string;
  screenshots: ScreenshotData[];
  onScreenshotsChange?: (screenshots: ScreenshotData[]) => void;
}

const MultipleScreenshotsManager: React.FC<MultipleScreenshotsManagerProps> = ({
  stepId,
  screenshots,
  onScreenshotsChange
}) => {
  const {
    addStepScreenshot,
    updateStepScreenshot,
    deleteStepScreenshot,
    reorderStepScreenshots,
    cropSpecificScreenshot,
    undoCropSpecificScreenshot,
    addCallout,
    updateCallout,
    deleteCallout
  } = useSopContext();

  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState<string | null>(null);
  const [editingCallouts, setEditingCallouts] = useState<string | null>(null);
  const [showFullSize, setShowFullSize] = useState<string | null>(null);
  const [editingMetadata, setEditingMetadata] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag and drop reordering
  const handleReorder = (newOrder: ScreenshotData[]) => {
    const oldOrder = screenshots;
    newOrder.forEach((screenshot, newIndex) => {
      const oldIndex = oldOrder.findIndex(s => s.id === screenshot.id);
      if (oldIndex !== newIndex && oldIndex !== -1) {
        reorderStepScreenshots(stepId, oldIndex, newIndex);
      }
    });
  };

  // Handle new screenshot upload
  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>, title?: string, description?: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        addStepScreenshot(stepId, dataUrl, title || `Screenshot ${screenshots.length + 1}`, description);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle cropping
  const handleCropComplete = (screenshotId: string, croppedDataUrl: string) => {
    cropSpecificScreenshot(stepId, screenshotId, croppedDataUrl);
    setShowCropper(null);
  };

  // Handle metadata editing
  const handleMetadataUpdate = (screenshotId: string, updates: Partial<ScreenshotData>) => {
    updateStepScreenshot(stepId, screenshotId, updates);
    setEditingMetadata(null);
  };

  // Callout handlers
  const handleCalloutAdd = (screenshotId: string, callout: Omit<Callout, "id">) => {
    // For now, we'll use the legacy addCallout method 
    // In a full implementation, we'd need addCalloutToScreenshot
    addCallout(stepId, callout);
  };

  const handleCalloutUpdate = (screenshotId: string, callout: Callout) => {
    updateCallout(stepId, callout);
  };

  const handleCalloutDelete = (screenshotId: string, calloutId: string) => {
    deleteCallout(stepId, calloutId);
  };

  if (screenshots.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Visual Guides
          </h4>
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Screenshot
          </Button>
        </div>
        
        <div 
          className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center cursor-pointer hover:border-purple-600/50 hover:bg-purple-600/5 transition-all group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto group-hover:bg-purple-600/20 transition-colors">
              <ImagePlus className="h-6 w-6 text-zinc-500 group-hover:text-purple-400" />
            </div>
            <div>
              <p className="text-zinc-300 font-medium mb-1">Add screenshots</p>
              <p className="text-sm text-zinc-500">Visual guides help learners follow along</p>
            </div>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleScreenshotUpload(e)}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Visual Guides ({screenshots.length})
          </h4>
          <Badge variant="secondary" className="text-xs bg-purple-600/20 text-purple-300">
            Multiple
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs"
          >
            {isCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            {isCollapsed ? 'Expand' : 'Collapse'}
          </Button>
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add More
          </Button>
        </div>
      </div>

      {/* Screenshots Grid */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3"
          >
            <Reorder.Group 
              axis="y" 
              values={screenshots} 
              onReorder={handleReorder}
              className="space-y-3"
            >
              {screenshots.map((screenshot, index) => (
                <Reorder.Item 
                  key={screenshot.id} 
                  value={screenshot}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <Card className="bg-zinc-800 border-zinc-700 overflow-hidden">
                    <CardContent className="p-4">
                      {/* Screenshot Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-zinc-500" />
                          <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-300">
                            #{index + 1}
                          </Badge>
                          <span className="text-sm font-medium text-white">
                            {screenshot.title || `Screenshot ${index + 1}`}
                          </span>
                          {screenshot.callouts.length > 0 && (
                            <Badge variant="secondary" className="text-xs bg-blue-600/20 text-blue-300">
                              {screenshot.callouts.length} callouts
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingMetadata(screenshot.id)}
                            className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowFullSize(screenshot.id)}
                            className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowCropper(screenshot.id)}
                            className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
                          >
                            <Crop className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteStepScreenshot(stepId, screenshot.id)}
                            className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Screenshot Preview */}
                      <div className="relative bg-zinc-900 rounded-lg overflow-hidden">
                        <img
                          src={screenshot.dataUrl}
                          alt={screenshot.title || `Screenshot ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        
                        {/* Callout overlay preview */}
                        <div className="absolute inset-0">
                          <CalloutOverlay
                            screenshot={screenshot}
                            isEditing={editingCallouts === screenshot.id}
                            onCalloutAdd={(callout) => handleCalloutAdd(screenshot.id, callout)}
                            onCalloutUpdate={(callout) => handleCalloutUpdate(screenshot.id, callout)}
                            onCalloutDelete={(calloutId) => handleCalloutDelete(screenshot.id, calloutId)}
                          />
                        </div>
                        
                        {/* Quick actions overlay */}
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCallouts(
                              editingCallouts === screenshot.id ? null : screenshot.id
                            )}
                            className={`h-6 text-xs border-zinc-600 ${
                              editingCallouts === screenshot.id 
                                ? 'bg-green-600 text-white border-green-600' 
                                : 'bg-zinc-800/80 text-zinc-300'
                            }`}
                          >
                            <MousePointer className="h-2 w-2 mr-1" />
                            {editingCallouts === screenshot.id ? '✓' : 'Edit'}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Description */}
                      {screenshot.description && (
                        <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                          {screenshot.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      
      {/* Metadata Editor */}
      {editingMetadata && (
        <Dialog open={true} onOpenChange={() => setEditingMetadata(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Screenshot Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-zinc-300">Title</Label>
                <Input
                  defaultValue={screenshots.find(s => s.id === editingMetadata)?.title || ''}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Screenshot title..."
                  id="title-input"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Description</Label>
                <Textarea
                  defaultValue={screenshots.find(s => s.id === editingMetadata)?.description || ''}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Optional description..."
                  id="description-input"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditingMetadata(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    const title = (document.getElementById('title-input') as HTMLInputElement)?.value;
                    const description = (document.getElementById('description-input') as HTMLTextAreaElement)?.value;
                    handleMetadataUpdate(editingMetadata, { title, description });
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Image Cropper */}
      {showCropper && (
        <ImageCropper
          imageDataUrl={screenshots.find(s => s.id === showCropper)?.originalDataUrl || 
                       screenshots.find(s => s.id === showCropper)?.dataUrl || ''}
          onCropComplete={(croppedDataUrl) => handleCropComplete(showCropper, croppedDataUrl)}
          onCancel={() => setShowCropper(null)}
          aspectRatio={16 / 9}
        />
      )}

      {/* Full Size View */}
      {showFullSize && (
        <Dialog open={true} onOpenChange={() => setShowFullSize(null)}>
          <DialogContent className="max-w-6xl w-[95vw] h-[85vh] bg-zinc-900 border-zinc-800 p-0">
            <DialogHeader className="p-4">
              <DialogTitle className="text-white flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {screenshots.find(s => s.id === showFullSize)?.title || 'Screenshot'}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 p-4 overflow-auto">
              <div className="relative">
                <img
                  src={screenshots.find(s => s.id === showFullSize)?.dataUrl || ''}
                  alt="Full size screenshot"
                  className="w-full h-auto rounded-lg"
                />
                <div className="absolute inset-0">
                  <CalloutOverlay
                    screenshot={screenshots.find(s => s.id === showFullSize)!}
                    isEditing={true}
                    onCalloutAdd={(callout) => handleCalloutAdd(showFullSize, callout)}
                    onCalloutUpdate={(callout) => handleCalloutUpdate(showFullSize, callout)}
                    onCalloutDelete={(calloutId) => handleCalloutDelete(showFullSize, calloutId)}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleScreenshotUpload(e)}
        className="hidden"
      />
    </div>
  );
};

export default MultipleScreenshotsManager; 