import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  Settings, 
  Save, 
  Plus, 
  GraduationCap, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trash2,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Users,
  Target,
  ArrowRight,
  FileText
} from "lucide-react";
import StepCard from "@/components/step-editor/StepCard";
import ProgressTracker from "@/components/ProgressTracker";
import ExportPanel from "@/components/step-editor/ExportPanel";
import ItmContentManager from "@/components/step-editor/ItmContentManager";
import { useSopContext } from "@/context/SopContext";
import LessonTemplateModal from "@/components/LessonTemplateModal";
import { SopStep } from "@/types/sop";

const SopCreator: React.FC = () => {
  const {
    sopDocument,
    addStep,
    addStepFromTemplate,
    updateStep,
    deleteStep,
    duplicateStep,
    toggleStepCompletion,
    exportDocument,
    getCompletedStepsCount,
    getProgressPercentage,
    setTableOfContents,
    setDarkMode,
    setTrainingMode,
    saveDocumentToJSON,
    resetDocument,
    setSopTitle,
    setSopTopic,
    setCompanyName,
    setSopDate,
    setSopDescription
  } = useSopContext();

  // Get steps from sopDocument
  const steps = sopDocument?.steps || [];

  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>("");
  const [showLessonTemplateModal, setShowLessonTemplateModal] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showContentManager, setShowContentManager] = useState(false);

  // Lesson template definitions
  const lessonTemplates = [
    {
      type: "standard" as const,
      title: "Standard Lesson",
      description: "Text + screenshot format for step-by-step instructions",
      icon: BookOpen,
      color: "from-blue-600 to-purple-600",
      features: ["Text instructions", "Screenshot support", "Callout tools"]
    },
    {
      type: "knowledge-check" as const,
      title: "Knowledge Check",
      description: "Test understanding with quiz questions and feedback",
      icon: HelpCircle,
      color: "from-green-600 to-teal-600",
      features: ["Quiz questions", "Immediate feedback", "Progress tracking"]
    },
    {
      type: "scenario" as const,
      title: "Real-World Scenario",
      description: "Apply concepts through practical examples and case studies",
      icon: Users,
      color: "from-orange-600 to-red-600",
      features: ["Practical examples", "Case studies", "Context application"]
    },
    {
      type: "resource-focus" as const,
      title: "Resource Hub",
      description: "Curated links and additional materials for deeper learning",
      icon: Target,
      color: "from-purple-600 to-pink-600",
      features: ["External links", "Downloadable resources", "Extended learning"]
    }
  ];

  // Auto-expand first step when created and auto-enable training mode
  useEffect(() => {
    if (steps.length === 1 && !activeStepId) {
      setActiveStepId(steps[0].id);
    }
    
    // Auto-enable training mode if not set
    if (sopDocument?.trainingMode === undefined) {
      setTrainingMode(true);
    }
  }, [steps.length, activeStepId, sopDocument?.trainingMode, setTrainingMode]);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      // Auto-save logic can be added here
    }, 2000);
    
    return () => clearTimeout(autoSave);
  }, [sopDocument]);

  const handleStepChange = (stepId: string, field: keyof SopStep, value: any) => {
    updateStep(stepId, field, value);
  };

  const handleStepComplete = (stepId: string, completed: boolean) => {
    toggleStepCompletion(stepId);
  };

  const handleAddStep = () => {
    setShowTemplateSelector(true);
  };

  const handleTemplateSelect = (templateType: "standard" | "knowledge-check" | "scenario" | "resource-focus") => {
    addStepFromTemplate(templateType);
    setShowTemplateSelector(false);
    
    // Auto-focus the new step
    setTimeout(() => {
      const newStep = steps[steps.length - 1];
      if (newStep) {
        setActiveStepId(newStep.id);
      }
    }, 100);
  };

  const handleQuickExport = () => {
    setShowExportPanel(true);
  };

  const handleExport = async (format: "pdf" | "html" | "training-module" | "bundle", options?: any) => {
    setIsExporting(true);
    
    if (format === "bundle") {
      setExportProgress("Creating bundled training package...");
      console.log('🎯 SopCreator handling bundle export with options:', options);
      
      try {
        await exportDocument(format, options);
      } catch (error) {
        console.error("Bundle export failed:", error);
      }
    } else if (format === "training-module") {
      setExportProgress("Creating interactive training module...");
      
      const enhancedOptions = {
        mode: 'standalone' as const,
        enhanced: true,
        enhancedOptions: {
          passwordProtection: {
            enabled: !!options?.trainingOptions?.passwordProtection,
            password: options?.trainingOptions?.passwordProtection || "",
            hint: "Contact your administrator for access"
          },
          lmsFeatures: {
            enableNotes: options?.trainingOptions?.enableNotes ?? true,
            enableBookmarks: options?.trainingOptions?.enableBookmarks ?? true,
            enableSearch: true,
            enableProgressTracking: options?.includeProgressInfo ?? true
          },
          theme: options?.theme || 'auto',
          branding: {
            companyColors: {
              primary: options?.trainingOptions?.primaryColor || '#007AFF',
              secondary: options?.trainingOptions?.secondaryColor || '#1E1E1E'
            }
          }
        }
      };
      
      try {
        await exportDocument("html", enhancedOptions);
      } catch (error) {
        console.error("Training module export failed:", error);
      }
    } else {
      setExportProgress(`Preparing ${format.toUpperCase()} export...`);
      try {
        await exportDocument(format, options);
      } catch (error) {
        console.error("Export failed:", error);
      }
    }
    
    setIsExporting(false);
    setExportProgress("");
  };

  const handleAddLesson = () => {
    setShowLessonTemplateModal(true);
  };

  const handleAddLessonFromTemplate = (templateType: "standard" | "knowledge-check" | "scenario" | "resource-focus") => {
    addStepFromTemplate(templateType);
    setCurrentLessonIndex(steps.length); // Move to the new lesson
    setShowLessonTemplateModal(false);
    
    console.log(`${templateType.replace('-', ' ')} lesson template has been added.`);
  };

  const handleAddHealthcareTemplate = (templateId: string) => {
    // Import the healthcare template service
    import("@/services/healthcare-template-service").then(({ HealthcareTemplateService }) => {
      try {
        const templateSteps = HealthcareTemplateService.createStepsFromTemplate(templateId);
        const template = HealthcareTemplateService.getTemplateById(templateId);
        
        // Add all steps from the template
        templateSteps.forEach(step => {
          // Use addStep method to add each step to the SOP
          addStep();
          // Then update the step with template data
          const stepIndex = steps.length;
          updateStep(step.id, "title", step.title);
          updateStep(step.id, "description", step.description);
          updateStep(step.id, "detailedInstructions", step.detailedInstructions);
          updateStep(step.id, "estimatedTime", step.estimatedTime);
          updateStep(step.id, "tags", step.tags);
          updateStep(step.id, "trainingMode", step.trainingMode);
          updateStep(step.id, "healthcareContent", step.healthcareContent);
          updateStep(step.id, "quizQuestions", step.quizQuestions);
        });
        
        setCurrentLessonIndex(0); // Start with first lesson
        setShowLessonTemplateModal(false);
        
        console.log(`${template?.name} template has been applied with ${templateSteps.length} lessons.`);
      } catch (error) {
        console.error("Failed to apply healthcare template:", error);
      }
    });
  };

  const handleDeleteLesson = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;
    
    // Confirm deletion
    const confirmDelete = window.confirm("Are you sure you want to delete this lesson? This action cannot be undone.");
    if (!confirmDelete) return;
    
    deleteStep(stepId);
    
    // Adjust current lesson index if needed
    if (currentLessonIndex >= steps.length - 1) {
      setCurrentLessonIndex(Math.max(0, steps.length - 2));
    }
    
    console.log("The lesson has been removed from your training module.");
  };

  const navigateToLesson = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentLessonIndex(index);
    }
  };

  const nextLesson = () => {
    if (currentLessonIndex < steps.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const prevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  // Get current step safely
  const currentStep = steps.length > 0 ? steps[currentLessonIndex] : null;

  // Simplified header with key info only
  const renderSimpleHeader = () => (
    <Card className="bg-[#1E1E1E] border-zinc-800 rounded-2xl mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">Training Module Creator</h1>
              {sopDocument?.trainingMode && (
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Interactive Mode
                </Badge>
              )}
            </div>
            <p className="text-zinc-400 text-sm">Create engaging, interactive training experiences with ITM-PDF content distinction</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowContentManager(!showContentManager)}
              className={`text-zinc-300 border-zinc-700 hover:text-white hover:bg-zinc-800 ${
                showContentManager ? 'bg-purple-600 border-purple-600 text-white' : ''
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Content Manager
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="text-zinc-300 border-zinc-700 hover:text-white hover:bg-zinc-800"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              onClick={() => setShowExportPanel(true)}
              disabled={!sopDocument?.title || !sopDocument?.topic || steps.length === 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Export Module
            </Button>
          </div>
        </div>

        {/* ITM Content Manager */}
        <AnimatePresence>
          {showContentManager && currentStep && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <ItmContentManager
                step={currentStep}
                onUpdateStep={(field, value) => handleStepChange(currentStep.id, field, value)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Training Module Information */}
        <div className="mt-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            Training Module Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-zinc-300 text-sm font-medium mb-2 block">
                Module Title *
              </Label>
              <Input
                id="title"
                value={sopDocument?.title || ""}
                onChange={(e) => setSopTitle(e.target.value)}
                placeholder="Enter your training module title..."
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
            
            <div>
              <Label htmlFor="topic" className="text-zinc-300 text-sm font-medium mb-2 block">
                Topic/Category *
              </Label>
              <Input
                id="topic"
                value={sopDocument?.topic || ""}
                onChange={(e) => setSopTopic(e.target.value)}
                placeholder="e.g., Sales Training, Safety Protocol..."
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="company" className="text-zinc-300 text-sm font-medium mb-2 block">
                Organization (Optional)
              </Label>
              <Input
                id="company"
                value={sopDocument?.companyName || ""}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your organization name..."
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
            
            <div>
              <Label htmlFor="date" className="text-zinc-300 text-sm font-medium mb-2 block">
                Created Date
              </Label>
              <Input
                id="date"
                type="date"
                value={sopDocument?.date || new Date().toISOString().split('T')[0]}
                onChange={(e) => setSopDate(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <AnimatePresence>
          {showAdvancedSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-zinc-900/30 rounded-xl border border-zinc-800"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Advanced Settings</h3>
              
              <div>
                <Label htmlFor="description" className="text-zinc-300 text-sm font-medium mb-2 block">
                  Module Description
                </Label>
                <Textarea
                  id="description"
                  value={sopDocument?.description || ""}
                  onChange={(e) => setSopDescription(e.target.value)}
                  placeholder="Provide a detailed description of this training module..."
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[100px]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lesson Progress Overview */}
        {steps.length > 0 && (
          <div className="mt-6">
            <ProgressTracker 
              completed={getCompletedStepsCount()} 
              total={steps.length}
              showPercentage={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderCarouselNavigation = () => (
    <Card className="bg-[#1E1E1E] border-zinc-800 rounded-2xl mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">
              {steps.length === 0 ? "Get Started" : `Lesson ${currentLessonIndex + 1} of ${steps.length}`}
            </h2>
            
            {steps.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevLesson}
                  disabled={currentLessonIndex === 0}
                  className="text-zinc-300 border-zinc-700 hover:text-white hover:bg-zinc-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => navigateToLesson(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentLessonIndex 
                          ? "bg-blue-500" 
                          : "bg-zinc-700 hover:bg-zinc-600"
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextLesson}
                  disabled={currentLessonIndex === steps.length - 1}
                  className="text-zinc-300 border-zinc-700 hover:text-white hover:bg-zinc-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {currentStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteLesson(currentStep.id)}
                className="text-red-400 border-red-800 hover:text-red-300 hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              onClick={handleAddLesson}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEmptyState = () => (
    <Card className="bg-[#1E1E1E] border-zinc-800 rounded-2xl">
      <CardContent className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-3">Create Your First Lesson</h3>
          <p className="text-zinc-400 mb-8">
            Start building your training module by adding interactive lessons. Choose from templates or create custom content.
          </p>
          
          <Button
            onClick={handleAddLesson}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add First Lesson
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Export Panel Overlay
  const renderExportPanel = () => (
    <AnimatePresence>
      {showExportPanel && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={() => setShowExportPanel(false)}
          />
          
          {/* Export Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed right-0 top-0 h-full w-96 z-[9999] overflow-hidden"
          >
            <div className="h-full overflow-y-auto bg-[#1E1E1E] border-l border-zinc-800">
              <ExportPanel
                document={sopDocument}
                onExport={handleExport}
                isExporting={isExporting}
                exportProgress={exportProgress}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Template Selector Modal
  const renderTemplateSelector = () => (
    <AnimatePresence>
      {showTemplateSelector && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowTemplateSelector(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#1E1E1E] rounded-2xl border border-zinc-800 p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Choose a Lesson Template</h3>
              <p className="text-zinc-400">Select the best structure for your content to maximize learning effectiveness</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {lessonTemplates.map((template) => (
                <motion.div
                  key={template.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 cursor-pointer hover:border-purple-600/50 hover:bg-zinc-800/80 transition-all group"
                  onClick={() => handleTemplateSelect(template.type)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <template.icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                        {template.title}
                      </h4>
                      <p className="text-sm text-zinc-400 mb-3">{template.description}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.features.map((feature, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-zinc-700/50 rounded text-zinc-300">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <ArrowRight className="h-5 w-5 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-zinc-500">
                💡 Tip: You can always change the structure after creating the lesson
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplateSelector(false)}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleTemplateSelect("standard")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  Skip & Create Basic Lesson
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
      <div className="max-w-5xl mx-auto">
        {renderSimpleHeader()}
        {renderCarouselNavigation()}
        
        <AnimatePresence mode="wait">
          {steps.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderEmptyState()}
            </motion.div>
          ) : currentStep ? (
            <motion.div
              key={`lesson-${currentLessonIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <StepCard
                step={currentStep}
                index={currentLessonIndex}
                isActive={true}
                onStepChange={handleStepChange}
                onStepComplete={() => {}}
                onDeleteStep={() => handleDeleteLesson(currentStep.id)}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Export Panel Overlay */}
        {renderExportPanel()}

        {/* Template Selector Modal */}
        {renderTemplateSelector()}

        {/* Lesson Template Modal */}
        <LessonTemplateModal
          isOpen={showLessonTemplateModal}
          onClose={() => setShowLessonTemplateModal(false)}
          onSelectTemplate={handleAddLessonFromTemplate}
          onSelectHealthcareTemplate={handleAddHealthcareTemplate}
        />
      </div>
    </div>
  );
};

export default SopCreator;
