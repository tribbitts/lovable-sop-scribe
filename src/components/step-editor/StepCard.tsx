import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { StepCardProps, StepResource } from "@/types/sop";
import { 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Camera, 
  Crop, 
  Plus,
  Link,
  FileText,
  Tag,
  Edit3,
  CheckCircle2,
  Circle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageCropper from "./ImageCropper";
import CalloutOverlay from "./CalloutOverlay";
import { v4 as uuidv4 } from "uuid";

const StepCard: React.FC<StepCardProps> = ({
  step,
  index,
  isActive = false,
  onStepChange,
  onStepComplete
}) => {
  const [isExpanded, setIsExpanded] = useState(isActive);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newResource, setNewResource] = useState<Partial<StepResource>>({});
  const [showResourceForm, setShowResourceForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = (field: keyof typeof step, value: any) => {
    if (onStepChange) {
      onStepChange(step.id, field, value);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        handleFieldChange("screenshot", {
          id: uuidv4(),
          dataUrl,
          originalDataUrl: dataUrl,
          callouts: step.screenshot?.callouts || [],
          isCropped: false
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    if (step.screenshot) {
      handleFieldChange("screenshot", {
        ...step.screenshot,
        dataUrl: croppedDataUrl,
        isCropped: true
      });
    }
    setShowCropper(false);
  };

  const handleUndoCrop = () => {
    if (step.screenshot?.originalDataUrl) {
      handleFieldChange("screenshot", {
        ...step.screenshot,
        dataUrl: step.screenshot.originalDataUrl,
        isCropped: false
      });
    }
  };

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = step.tags || [];
      handleFieldChange("tags", [...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = step.tags || [];
    handleFieldChange("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const addResource = () => {
    if (newResource.title && newResource.url) {
      const resource: StepResource = {
        id: uuidv4(),
        type: newResource.type || "link",
        title: newResource.title,
        url: newResource.url,
        description: newResource.description || ""
      };
      
      const currentResources = step.resources || [];
      handleFieldChange("resources", [...currentResources, resource]);
      setNewResource({});
      setShowResourceForm(false);
    }
  };

  const removeResource = (resourceId: string) => {
    const currentResources = step.resources || [];
    handleFieldChange("resources", currentResources.filter(r => r.id !== resourceId));
  };

  const toggleCompletion = () => {
    const newCompleted = !step.completed;
    handleFieldChange("completed", newCompleted);
    if (onStepComplete) {
      onStepComplete(step.id, newCompleted);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
      className="relative"
    >
      <Card className={`bg-[#1E1E1E] border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 ${
        isActive ? "ring-2 ring-[#007AFF]/50 shadow-xl" : "hover:shadow-lg"
      } ${step.completed ? "opacity-75" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step.completed 
                  ? "bg-green-500 text-white" 
                  : "bg-[#007AFF] text-white"
              }`}>
                {index + 1}
              </div>
              
              <div className="flex-1">
                {isEditingTitle ? (
                  <Input
                    value={step.title || ""}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setIsEditingTitle(false);
                    }}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder={`Step ${index + 1} Title`}
                    autoFocus
                  />
                ) : (
                  <h3 
                    className="text-lg font-semibold text-white cursor-pointer hover:text-[#007AFF] transition-colors"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {step.title || `Step ${index + 1}`}
                    <Edit3 className="inline h-4 w-4 ml-2 opacity-0 group-hover:opacity-100" />
                  </h3>
                )}
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleCompletion}
                className={`text-white hover:bg-zinc-800 ${
                  step.completed ? "text-green-400" : "text-zinc-400"
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white hover:bg-zinc-800"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-0 space-y-6">
                {/* Step Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Description *
                  </label>
                  <Textarea
                    value={step.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    placeholder="Describe what needs to be done in this step..."
                    className="bg-zinc-800 border-zinc-700 text-white min-h-[80px] resize-none"
                  />
                </div>

                {/* Detailed Instructions */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Detailed Instructions
                  </label>
                  <Textarea
                    value={step.detailedInstructions || ""}
                    onChange={(e) => handleFieldChange("detailedInstructions", e.target.value)}
                    placeholder="Add detailed, step-by-step instructions..."
                    className="bg-zinc-800 border-zinc-700 text-white min-h-[120px] resize-none"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Notes
                  </label>
                  <Textarea
                    value={step.notes || ""}
                    onChange={(e) => handleFieldChange("notes", e.target.value)}
                    placeholder="Any additional notes, tips, or warnings..."
                    className="bg-zinc-800 border-zinc-700 text-white min-h-[60px] resize-none"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </label>
                  
                  <div className="flex flex-wrap gap-2">
                    {step.tags?.map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant="secondary"
                        className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTag();
                      }}
                      placeholder="Add a tag..."
                      className="bg-zinc-800 border-zinc-700 text-white flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={addTag}
                      disabled={!newTag.trim()}
                      className="bg-[#007AFF] hover:bg-[#0069D9] text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Resources */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Resources
                  </label>
                  
                  {step.resources?.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {resource.type === "link" ? (
                          <Link className="h-4 w-4 text-[#007AFF]" />
                        ) : (
                          <FileText className="h-4 w-4 text-[#007AFF]" />
                        )}
                        <div>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-[#007AFF] font-medium"
                          >
                            {resource.title}
                          </a>
                          {resource.description && (
                            <p className="text-sm text-zinc-400">{resource.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeResource(resource.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {showResourceForm ? (
                    <div className="space-y-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={newResource.type === "link" ? "default" : "outline"}
                          onClick={() => setNewResource(prev => ({ ...prev, type: "link" }))}
                          className="text-xs"
                        >
                          <Link className="h-3 w-3 mr-1" />
                          Link
                        </Button>
                        <Button
                          size="sm"
                          variant={newResource.type === "file" ? "default" : "outline"}
                          onClick={() => setNewResource(prev => ({ ...prev, type: "file" }))}
                          className="text-xs"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          File
                        </Button>
                      </div>
                      
                      <Input
                        value={newResource.title || ""}
                        onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Resource title..."
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                      
                      <Input
                        value={newResource.url || ""}
                        onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="URL or file path..."
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                      
                      <Input
                        value={newResource.description || ""}
                        onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description (optional)..."
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={addResource}
                          disabled={!newResource.title || !newResource.url}
                          className="bg-[#007AFF] hover:bg-[#0069D9] text-white"
                        >
                          Add Resource
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowResourceForm(false);
                            setNewResource({});
                          }}
                          className="border-zinc-700 text-white hover:bg-zinc-800"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowResourceForm(true)}
                      className="border-zinc-700 text-white hover:bg-zinc-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Resource
                    </Button>
                  )}
                </div>

                {/* Screenshot Section */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Screenshot
                  </label>
                  
                  {step.screenshot ? (
                    <div className="space-y-3">
                      <div className="relative bg-zinc-800 rounded-lg overflow-hidden">
                        <img
                          src={step.screenshot.dataUrl}
                          alt={`Step ${index + 1} screenshot`}
                          className="w-full h-auto"
                        />
                        <CalloutOverlay
                          screenshot={step.screenshot}
                          isEditing={false}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowCropper(true)}
                          className="border-zinc-700 text-white hover:bg-zinc-800"
                        >
                          <Crop className="h-4 w-4 mr-1" />
                          Crop
                        </Button>
                        
                        {step.screenshot.isCropped && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleUndoCrop}
                            className="border-zinc-700 text-white hover:bg-zinc-800"
                          >
                            Undo Crop
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="border-zinc-700 text-white hover:bg-zinc-800"
                        >
                          <Camera className="h-4 w-4 mr-1" />
                          Replace
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFieldChange("screenshot", null)}
                          className="border-red-600 text-red-400 hover:bg-red-600/10"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center cursor-pointer hover:border-zinc-600 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-8 w-8 text-zinc-500 mx-auto mb-3" />
                      <p className="text-zinc-400 mb-2">Click to upload a screenshot</p>
                      <p className="text-sm text-zinc-500">PNG, JPG, or GIF up to 10MB</p>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Image Cropper Modal */}
      {showCropper && step.screenshot && (
        <ImageCropper
          imageDataUrl={step.screenshot.originalDataUrl || step.screenshot.dataUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
          aspectRatio={16 / 9}
        />
      )}
    </motion.div>
  );
};

export default StepCard; 