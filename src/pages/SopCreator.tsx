import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSopContext } from "@/context/SopContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Settings, 
  Save, 
  Upload, 
  RotateCcw,
  Eye,
  Download,
  BookOpen,
  CheckCircle2,
  Clock,
  Palette,
  GraduationCap,
  Zap,
  HelpCircle,
  Users,
  Target,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Import our modular components
import StepCard from "@/components/step-editor/StepCard";
import ExportPanel from "@/components/toolbar/ExportPanel";

const SopCreator = () => {
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
    setSopTopic
  } = useSopContext();

  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>("");

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
    if (sopDocument.steps.length === 1 && !activeStepId) {
      setActiveStepId(sopDocument.steps[0].id);
    }
    
    // Auto-enable training mode if not set
    if (sopDocument.trainingMode === undefined) {
      setTrainingMode(true);
    }
  }, [sopDocument.steps.length, activeStepId, sopDocument.trainingMode, setTrainingMode]);

  const handleStepChange = (stepId: string, field: keyof typeof sopDocument.steps[0], value: any) => {
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
      const newStep = sopDocument.steps[sopDocument.steps.length - 1];
      if (newStep) {
        setActiveStepId(newStep.id);
      }
    }, 100);
  };

  const handleQuickExport = () => {
    setShowExportPanel(true);
  };

  const handleExport = async (format: "pdf" | "html" | "training-module", options?: any) => {
    setIsExporting(true);
    
    if (format === "training-module") {
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

  // Smart onboarding empty state
  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Create Your First Training Module
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Choose from structured lesson templates designed for maximum engagement and learning effectiveness.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleAddStep}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white w-full max-w-xs"
          >
            <Plus className="h-5 w-5 mr-2" />
            Choose Lesson Template
          </Button>
          
          <div className="flex items-center justify-center gap-6 text-sm text-zinc-500">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-blue-500" />
              Standard Lessons
            </div>
            <div className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4 text-green-500" />
              Knowledge Checks
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-orange-500" />
              Scenarios
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm text-zinc-500 pt-2">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Auto-saved locally
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Interactive features
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Simplified header with key info only
  const renderSimpleHeader = () => (
    <Card className="bg-[#1E1E1E] border-zinc-800 rounded-2xl mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">Training Module Creator</h1>
              {sopDocument.trainingMode && (
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Interactive Mode
                </Badge>
              )}
            </div>
            <p className="text-zinc-400">
              {sopDocument.steps.length === 0 
                ? "Get started by adding your first lesson below"
                : `${sopDocument.steps.length} lesson${sopDocument.steps.length !== 1 ? 's' : ''} created`
              }
            </p>
          </div>
          
          {sopDocument.steps.length > 0 && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
              
              <Button
                onClick={handleQuickExport}
                disabled={sopDocument.steps.length === 0}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Module
              </Button>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );

  // Module Title and Info Section
  const renderModuleInfo = () => (
    <Card className="bg-[#1E1E1E] border-zinc-800 rounded-2xl mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Training Module Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-zinc-300 mb-2 block">
                Module Title <span className="text-red-400">*</span>
              </Label>
              <Input
                value={sopDocument.title}
                onChange={(e) => setSopTitle(e.target.value)}
                placeholder="e.g., Customer Service Training, Safety Procedures..."
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
              {!sopDocument.title && (
                <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Required for export
                </p>
              )}
            </div>
            
            <div>
              <Label className="text-sm font-medium text-zinc-300 mb-2 block">
                Topic/Category <span className="text-red-400">*</span>
              </Label>
              <Input
                value={sopDocument.topic}
                onChange={(e) => setSopTopic(e.target.value)}
                placeholder="e.g., HR Training, Technical Skills, Compliance..."
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
              {!sopDocument.topic && (
                <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Required for export
                </p>
              )}
            </div>
          </div>
          
          {sopDocument.title && sopDocument.topic && (
            <div className="mt-4 p-3 bg-green-600/10 border border-green-600/30 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <p className="text-sm text-green-300">
                  Ready to export: <strong>{sopDocument.title}</strong> - {sopDocument.topic}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Progressive disclosure for advanced settings
  const renderAdvancedSettings = () => (
    <AnimatePresence>
      {showAdvancedSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          <Card className="bg-[#1E1E1E] border-zinc-800 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Advanced Settings</h3>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {/* Training Features */}
                <AccordionItem value="training" className="border-zinc-700">
                  <AccordionTrigger className="text-sm text-zinc-300 hover:text-white">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-purple-400" />
                      Training Features
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <GraduationCap className="h-4 w-4 text-purple-400" />
                            <span className="text-sm font-medium text-white">Interactive Training Mode</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-3 w-3 text-zinc-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Enables quizzes, learning objectives, and progress tracking</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <p className="text-xs text-purple-300">Enable quizzes, learning objectives, and progress tracking for all lessons</p>
                        </div>
                        <Switch
                          checked={sopDocument.trainingMode !== false}
                          onCheckedChange={(checked) => {
                            setTrainingMode(checked);
                            if (checked) {
                              sopDocument.steps.forEach(step => {
                                if (!step.trainingMode) {
                                  updateStep(step.id, "trainingMode", true);
                                }
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Export Settings */}
                <AccordionItem value="export" className="border-zinc-700">
                  <AccordionTrigger className="text-sm text-zinc-300 hover:text-white">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-blue-400" />
                      Export Options
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-zinc-400" />
                        <div>
                          <p className="text-sm font-medium text-white">Navigation Menu</p>
                          <p className="text-xs text-zinc-400">Include table of contents in exports</p>
                        </div>
                      </div>
                      <Switch
                        checked={sopDocument.tableOfContents}
                        onCheckedChange={setTableOfContents}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Palette className="h-4 w-4 text-zinc-400" />
                        <div>
                          <p className="text-sm font-medium text-white">Dark Theme</p>
                          <p className="text-xs text-zinc-400">Use dark theme for exports</p>
                        </div>
                      </div>
                      <Switch
                        checked={sopDocument.darkMode}
                        onCheckedChange={setDarkMode}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Document Management */}
                <AccordionItem value="management" className="border-zinc-700">
                  <AccordionTrigger className="text-sm text-zinc-300 hover:text-white">
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4 text-green-400" />
                      Document Management
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={saveDocumentToJSON}
                        className="border-green-600 text-green-400 hover:bg-green-600/10"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Download Backup
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm("Reset the entire document? This cannot be undone.")) {
                            resetDocument();
                            setActiveStepId(null);
                          }
                        }}
                        className="border-red-600 text-red-400 hover:bg-red-600/10"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset All
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Clean steps list with better add button
  const renderStepsList = () => (
    <div className="space-y-6">
      <AnimatePresence>
        {sopDocument.steps.map((step, index) => (
          <StepCard
            key={step.id}
            step={step}
            index={index}
            isActive={activeStepId === step.id}
            onStepChange={handleStepChange}
            onStepComplete={handleStepComplete}
          />
        ))}
      </AnimatePresence>
      
      {/* Improved Add Step Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="flex items-center justify-center">
          <Button
            onClick={handleAddStep}
            variant="outline"
            size="lg"
            className="border-purple-600/50 text-purple-300 hover:bg-purple-600/10 border-dashed group"
          >
            <Plus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Choose Lesson Template
            <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>
        
        {/* Quick tip for new users */}
        {sopDocument.steps.length === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center"
          >
            <p className="text-sm text-zinc-500">
              💡 Tip: Mix different lesson types for an effective training experience
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );

  // Export Panel Overlay
  const renderExportPanel = () => (
    <AnimatePresence>
      {showExportPanel && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed right-6 top-6 bottom-6 w-96 z-50"
        >
          <div className="h-full overflow-y-auto">
            <ExportPanel
              document={sopDocument}
              onExport={handleExport}
              isExporting={isExporting}
              exportProgress={exportProgress}
            />
          </div>
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={() => setShowExportPanel(false)}
          />
        </motion.div>
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
    <div className="min-h-screen bg-[#121212]">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Simplified Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderSimpleHeader()}
        </motion.div>

        {/* Module Title and Info Section */}
        {renderModuleInfo()}

        {/* Advanced Settings (Progressive Disclosure) */}
        {renderAdvancedSettings()}

        {/* Main Content - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {sopDocument.steps.length === 0 ? renderEmptyState() : renderStepsList()}
        </motion.div>
      </div>

      {/* Export Panel Overlay */}
      {renderExportPanel()}

      {/* Template Selector Modal */}
      {renderTemplateSelector()}
    </div>
  );
 };

 export default SopCreator;
