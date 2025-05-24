import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StepCardProps, StepResource, Callout } from "@/types/sop";
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
  Circle,
  MousePointer,
  GraduationCap,
  HelpCircle,
  Award,
  Target,
  BookOpen,
  Sparkles,
  Users,
  Settings,
  Eye,
  Upload,
  Zap,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageCropper from "./ImageCropper";
import CalloutOverlay from "./CalloutOverlay";
import { useSopContext } from "@/context/SopContext";
import { v4 as uuidv4 } from "uuid";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const StepCard: React.FC<StepCardProps> = ({
  step,
  index,
  isActive = false,
  onStepChange,
  onStepComplete
}) => {
  const [isExpanded, setIsExpanded] = useState(isActive);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [isEditingCallouts, setIsEditingCallouts] = useState(false);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [quickMode, setQuickMode] = useState(true); // New: Quick vs Advanced mode
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Training module state
  const [isTrainingMode, setIsTrainingMode] = useState(step.trainingMode !== false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [newQuizQuestion, setNewQuizQuestion] = useState({
    question: "",
    type: "multiple-choice" as "multiple-choice" | "true-false" | "short-answer",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: ""
  });
  const [newObjective, setNewObjective] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newResource, setNewResource] = useState<Partial<StepResource>>({});
  const [showResourceForm, setShowResourceForm] = useState(false);
  
  // Get callout functions from context
  const { addCallout, updateCallout, deleteCallout } = useSopContext();

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

  const toggleCompletion = () => {
    const newCompleted = !step.completed;
    handleFieldChange("completed", newCompleted);
    if (onStepComplete) {
      onStepComplete(step.id, newCompleted);
    }
  };

  // Callout management functions
  const handleCalloutAdd = (callout: Omit<Callout, "id">) => {
    addCallout(step.id, callout);
  };

  const handleCalloutUpdate = (callout: Callout) => {
    updateCallout(step.id, callout);
  };

  const handleCalloutDelete = (calloutId: string) => {
    deleteCallout(step.id, calloutId);
  };

  // Smart form helpers
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

  const addLearningObjective = () => {
    if (newObjective.trim()) {
      const objective = {
        id: uuidv4(),
        text: newObjective.trim(),
        category: "knowledge" as const
      };
      
      const currentObjectives = step.learningObjectives || [];
      handleFieldChange("learningObjectives", [...currentObjectives, objective]);
      setNewObjective("");
    }
  };

  const removeLearningObjective = (objectiveId: string) => {
    const currentObjectives = step.learningObjectives || [];
    handleFieldChange("learningObjectives", currentObjectives.filter(o => o.id !== objectiveId));
  };

  const addQuizQuestion = () => {
    if (newQuizQuestion.question.trim() && newQuizQuestion.correctAnswer.trim()) {
      const question = {
        id: uuidv4(),
        question: newQuizQuestion.question.trim(),
        type: newQuizQuestion.type,
        options: newQuizQuestion.type === "multiple-choice" ? newQuizQuestion.options.filter(o => o.trim()) : undefined,
        correctAnswer: newQuizQuestion.correctAnswer.trim(),
        explanation: newQuizQuestion.explanation.trim() || undefined
      };
      
      const currentQuestions = step.quizQuestions || [];
      handleFieldChange("quizQuestions", [...currentQuestions, question]);
      
      // Reset form
      setNewQuizQuestion({
        question: "",
        type: "multiple-choice",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: ""
      });
      setShowQuizForm(false);
    }
  };

  const removeQuizQuestion = (questionId: string) => {
    const currentQuestions = step.quizQuestions || [];
    handleFieldChange("quizQuestions", currentQuestions.filter(q => q.id !== questionId));
  };

  // Smart header with clean design
  const renderHeader = () => (
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Step Number Badge */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
            step.completed 
              ? "bg-green-500 text-white shadow-lg" 
              : "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
          }`}>
            {step.completed ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
          </div>
          
          {/* Title Section */}
          <div className="flex-1">
            {isEditingTitle ? (
              <Input
                value={step.title || ""}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setIsEditingTitle(false);
                }}
                className="bg-zinc-800 border-zinc-700 text-white text-lg font-semibold"
                placeholder={`Lesson ${index + 1} Title`}
                autoFocus
              />
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 
                    className="text-lg font-semibold text-white cursor-pointer hover:text-purple-400 transition-colors group"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {step.title || `Lesson ${index + 1}`}
                    <Edit3 className="inline h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  
                  {/* Smart Badges */}
                  <div className="flex items-center gap-2">
                    {isTrainingMode && (
                      <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        Interactive
                      </Badge>
                    )}
                    
                    {step.screenshot && (
                      <Badge variant="secondary" className="bg-zinc-700 text-zinc-300 text-xs">
                        <Camera className="h-3 w-3 mr-1" />
                        Screenshot
                      </Badge>
                    )}
                    
                    {step.detailedInstructions && (
                      <Badge variant="secondary" className="bg-zinc-700 text-zinc-300 text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Detailed
                      </Badge>
                    )}
                    
                    {((step.tags && step.tags.length > 0) || (step.resources && step.resources.length > 0)) && (
                      <Badge variant="secondary" className="bg-zinc-700 text-zinc-300 text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Enriched
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Quick Progress Indicator */}
                {step.description && (
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Ready to teach</span>
                    {step.completed && <span className="text-green-400">• Completed</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!step.completed && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-zinc-300 border-zinc-700 hover:text-white hover:bg-zinc-800 text-xs"
            >
              <GraduationCap className="h-3 w-3 mr-1" />
              Advanced Learning Tools
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleCompletion}
            className={`${
              step.completed ? "text-green-400 hover:text-green-300" : "text-zinc-400 hover:text-white"
            } hover:bg-zinc-800`}
          >
            {step.completed ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </Button>
          
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
  );

  // Core content editing (always visible)
  const renderCoreContent = () => (
    <div className="space-y-6">
      {/* Description - Primary Field */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-white">What should learners do in this step?</label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3 w-3 text-zinc-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Keep it clear and actionable - this is the main instruction</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          value={step.description}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          placeholder="e.g., 'Click the Save button to store your changes' or 'Review the document for accuracy'"
          className="bg-zinc-800 border-zinc-700 text-white min-h-[100px] resize-none text-base"
        />
        {!step.description && (
          <p className="text-xs text-yellow-400 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            This field is required to make your lesson actionable
          </p>
        )}
      </div>

      {/* Screenshot Section - Prominent */}
      {step.screenshot ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Visual Guide
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingCallouts(!isEditingCallouts)}
                className={`text-xs ${
                  isEditingCallouts 
                    ? 'bg-green-600 text-white hover:bg-green-700 border-green-600' 
                    : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <MousePointer className="h-3 w-3 mr-1" />
                {isEditingCallouts ? '✓ Done Adding' : 'Add Callouts'}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowScreenshotModal(true)}
                className="border-purple-600 text-purple-300 hover:bg-purple-600/10 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                Full Size
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCropper(true)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs"
              >
                <Crop className="h-3 w-3 mr-1" />
                Crop
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs"
              >
                <Upload className="h-3 w-3 mr-1" />
                Replace
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFieldChange("screenshot", null)}
                className="border-red-600 text-red-400 hover:bg-red-600/10 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>
          </div>
          
          <div className="relative bg-zinc-800 rounded-lg overflow-hidden" style={{ overflow: isEditingCallouts ? 'visible' : 'hidden' }}>
            <img
              src={step.screenshot.dataUrl}
              alt={`Step ${index + 1} visual guide`}
              className="w-full h-auto block rounded-lg"
            />
            <div className="absolute inset-0">
              <CalloutOverlay
                screenshot={step.screenshot}
                isEditing={isEditingCallouts}
                onCalloutAdd={handleCalloutAdd}
                onCalloutUpdate={handleCalloutUpdate}
                onCalloutDelete={handleCalloutDelete}
              />
            </div>
            

          </div>
          
          <div className="flex items-center justify-between">
            {step.screenshot.callouts && step.screenshot.callouts.length > 0 && (
              <div className="text-xs text-zinc-400 flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {step.screenshot.callouts.length} callout{step.screenshot.callouts.length !== 1 ? 's' : ''} added
              </div>
            )}
            
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>Tip: Use "Full Size" for precise callout placement</span>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center cursor-pointer hover:border-purple-600/50 hover:bg-purple-600/5 transition-all group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto group-hover:bg-purple-600/20 transition-colors">
              <Camera className="h-6 w-6 text-zinc-500 group-hover:text-purple-400" />
            </div>
            <div>
              <p className="text-zinc-300 font-medium mb-1">Add a screenshot</p>
              <p className="text-sm text-zinc-500">Visual guides help learners follow along</p>
            </div>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Enhanced Instructions - Promoted to main area */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-white">Additional Details</label>
        <Textarea
          value={step.detailedInstructions || ""}
          onChange={(e) => handleFieldChange("detailedInstructions", e.target.value)}
          placeholder="Add step-by-step details, tips, or expanded explanations..."
          className="bg-zinc-800 border-zinc-700 text-white min-h-[80px] resize-none"
        />
      </div>

      {/* Tags - Promoted to main area */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-white">Tags</label>
        <div className="flex flex-wrap gap-1 mb-2">
          {step.tags?.map((tag, tagIndex) => (
            <Badge
              key={tagIndex}
              variant="secondary"
              className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer text-xs"
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
            className="bg-zinc-800 border-zinc-700 text-white text-sm"
          />
          <Button
            size="sm"
            onClick={addTag}
            disabled={!newTag.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Resources - Promoted to main area */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-white">Resources & Links</label>
        
        {step.resources?.map((resource) => (
          <div key={resource.id} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded border border-zinc-700">
            <div className="flex items-center gap-2">
              <Link className="h-3 w-3 text-blue-400" />
              <span className="text-white text-sm">{resource.title}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeResource(resource.id)}
              className="text-red-400 hover:text-red-300 p-1"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {showResourceForm ? (
          <div className="space-y-2 p-3 bg-zinc-800/30 border border-zinc-700 rounded">
            <Input
              value={newResource.title || ""}
              onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Resource title..."
              className="bg-zinc-800 border-zinc-700 text-white text-sm"
            />
            <Input
              value={newResource.url || ""}
              onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
              placeholder="URL..."
              className="bg-zinc-800 border-zinc-700 text-white text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={addResource}
                disabled={!newResource.title || !newResource.url}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                Add Resource
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowResourceForm(false)}
                className="border-zinc-700 text-white hover:bg-zinc-800 text-xs"
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
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Resource
          </Button>
        )}
      </div>
    </div>
  );

  // Progressive disclosure for advanced options
  const renderAdvancedOptions = () => (
    <AnimatePresence>
      {showAdvancedOptions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-zinc-800 pt-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-4 w-4 text-purple-400" />
            <h4 className="font-medium text-white">Advanced Learning Tools</h4>
          </div>
          
          <Accordion type="multiple" className="w-full">
            {/* Notes & Tips */}
            <AccordionItem value="notes" className="border-zinc-700">
              <AccordionTrigger className="text-sm text-zinc-300 hover:text-white py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes & Tips
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300">Internal Notes & Tips</label>
                  <Textarea
                    value={step.notes || ""}
                    onChange={(e) => handleFieldChange("notes", e.target.value)}
                    placeholder="Additional notes, warnings, or helpful tips for content creators..."
                    className="bg-zinc-800 border-zinc-700 text-white min-h-[60px] resize-none"
                  />
                  <p className="text-xs text-zinc-500">These notes are for internal use and won't appear in the final training module.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Interactive Learning */}
            <AccordionItem value="interactive" className="border-zinc-700">
              <AccordionTrigger className="text-sm text-zinc-300 hover:text-white py-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-purple-400" />
                  Interactive Learning
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm font-medium text-white">Enable Interactive Features</span>
                      <p className="text-xs text-purple-300 mt-1">Add quizzes and learning objectives</p>
                    </div>
                    <Switch
                      checked={isTrainingMode}
                      onCheckedChange={(checked) => {
                        setIsTrainingMode(checked);
                        handleFieldChange("trainingMode", checked);
                      }}
                    />
                  </div>
                </div>
                
                {isTrainingMode && (
                  <div className="space-y-4">
                    {/* Learning Objectives */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Learning Objectives
                      </label>
                      
                      {step.learningObjectives?.map((objective) => (
                        <div key={objective.id} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded border border-zinc-700">
                          <span className="text-white text-sm">{objective.text}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeLearningObjective(objective.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      
                      <div className="flex gap-2">
                        <Input
                          value={newObjective}
                          onChange={(e) => setNewObjective(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addLearningObjective();
                          }}
                          placeholder="Add learning objective..."
                          className="bg-zinc-800 border-zinc-700 text-white text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={addLearningObjective}
                          disabled={!newObjective.trim()}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Quiz Questions - Simplified */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Quiz Questions
                      </label>
                      
                      {step.quizQuestions?.map((question) => (
                        <div key={question.id} className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">{question.question}</p>
                              <p className="text-xs text-green-400 mt-1">Answer: {question.correctAnswer}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeQuizQuestion(question.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowQuizForm(!showQuizForm)}
                        className="border-blue-600 text-blue-400 hover:bg-blue-600/10 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Quiz Question
                      </Button>
                      
                      {showQuizForm && (
                        <div className="space-y-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded">
                          <Input
                            value={newQuizQuestion.question}
                            onChange={(e) => setNewQuizQuestion(prev => ({ ...prev, question: e.target.value }))}
                            placeholder="Enter your question..."
                            className="bg-zinc-800 border-zinc-700 text-white text-sm"
                          />
                          <Input
                            value={newQuizQuestion.correctAnswer}
                            onChange={(e) => setNewQuizQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                            placeholder="Correct answer..."
                            className="bg-zinc-800 border-zinc-700 text-white text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={addQuizQuestion}
                              disabled={!newQuizQuestion.question.trim() || !newQuizQuestion.correctAnswer.trim()}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                            >
                              Add Question
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowQuizForm(false)}
                              className="border-zinc-700 text-white hover:bg-zinc-800 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>


          </Accordion>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
      className="relative"
    >
      <Card className={`bg-[#1E1E1E] border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 ${
        isExpanded ? "ring-2 ring-purple-500/30 shadow-xl" : "hover:shadow-lg hover:border-zinc-700"
      } ${step.completed ? "opacity-75" : ""}`}>
        
        {renderHeader()}

        <AnimatePresence>
          {isExpanded && !step.completed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <CardContent className="pt-0 pb-6">
                {renderCoreContent()}
                {renderAdvancedOptions()}
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
      
      {/* Full Size Screenshot & Callout Editor Modal */}
      {showScreenshotModal && step.screenshot && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-zinc-700">
            <div className="flex items-center justify-between p-4 border-b border-zinc-700">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-purple-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Full Size Callout Editor - Step {index + 1}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Large view for precise callout placement • Click anywhere to add callouts
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowScreenshotModal(false)}
                className="text-white hover:bg-zinc-800 h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>
            
            <div className="p-6">
              <div className="relative bg-zinc-800 rounded-lg overflow-visible border border-zinc-700">
                <img
                  src={step.screenshot.dataUrl}
                  alt={`Step ${index + 1} screenshot`}
                  className="w-full h-auto block rounded-lg max-h-[75vh] object-contain"
                />
                <div className="absolute inset-0">
                  <CalloutOverlay
                    screenshot={step.screenshot}
                    isEditing={true}
                    onCalloutAdd={handleCalloutAdd}
                    onCalloutUpdate={handleCalloutUpdate}
                    onCalloutDelete={handleCalloutDelete}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <MousePointer className="h-4 w-4" />
                  <span>
                    {step.screenshot.callouts?.length || 0} callout{step.screenshot.callouts?.length !== 1 ? 's' : ''} added
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowScreenshotModal(false)}
                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => setShowScreenshotModal(false)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    ✓ Done Editing
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StepCard; 