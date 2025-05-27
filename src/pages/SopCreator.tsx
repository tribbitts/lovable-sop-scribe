
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
  FileText, 
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
  Download,
  Shield
} from "lucide-react";
import StepCard from "@/components/step-editor/StepCard";
import ProgressTracker from "@/components/ProgressTracker";
import ExportPanel from "@/components/step-editor/ExportPanel";
import { useSopContext } from "@/context/SopContext";
import { SopStep, SopDocument } from "@/types/sop";

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
  const [showStepTemplateSelector, setShowStepTemplateSelector] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Detect if this is a healthcare document
  const isHealthcareDocument = sopDocument?.steps.some(step => 
    step.healthcareContent && step.healthcareContent.length > 0
  ) || sopDocument?.title.toLowerCase().includes('healthcare') ||
  sopDocument?.title.toLowerCase().includes('patient') ||
  sopDocument?.title.toLowerCase().includes('hipaa') ||
  sopDocument?.title.toLowerCase().includes('medical');

  // Step template definitions for SOP creation
  const getStepTemplates = () => {
    const baseTemplates = [
      {
        type: "standard" as const,
        title: isHealthcareDocument ? "Healthcare Procedure Step" : "Standard Step",
        description: isHealthcareDocument 
          ? "Step-by-step healthcare procedure with safety protocols"
          : "Basic instruction step with screenshots and annotations",
        icon: BookOpen,
        color: isHealthcareDocument ? "from-teal-600 to-blue-600" : "from-blue-600 to-purple-600",
        features: isHealthcareDocument 
          ? ["Healthcare protocols", "Safety guidelines", "Patient care focus", "Screenshot support"]
          : ["Clear instructions", "Screenshot support", "Callout annotations", "Resource links"]
      },
      {
        type: "knowledge-check" as const,
        title: isHealthcareDocument ? "Compliance Verification" : "Knowledge Check",
        description: isHealthcareDocument
          ? "Critical healthcare compliance and safety verification"
          : "Quick understanding check with simple Q&A",
        icon: HelpCircle,
        color: isHealthcareDocument ? "from-red-600 to-orange-600" : "from-green-600 to-teal-600",
        features: isHealthcareDocument
          ? ["Compliance verification", "Safety confirmation", "Critical checkpoints"]
          : ["Simple questions", "Quick validation", "Understanding checks"]
      },
      {
        type: "scenario" as const,
        title: isHealthcareDocument ? "Patient Care Scenario" : "Example Scenario",
        description: isHealthcareDocument
          ? "Practice patient interactions and clinical decision-making"
          : "Real-world example or case study application",
        icon: Users,
        color: isHealthcareDocument ? "from-purple-600 to-pink-600" : "from-orange-600 to-red-600",
        features: isHealthcareDocument
          ? ["Patient interactions", "Clinical scenarios", "Communication examples"]
          : ["Practical examples", "Case studies", "Context application"]
      },
      {
        type: "resource-focus" as const,
        title: isHealthcareDocument ? "Healthcare Resources" : "Reference Materials",
        description: isHealthcareDocument
          ? "Essential healthcare references and continuing education resources"
          : "Additional resources, links, and reference materials",
        icon: Target,
        color: isHealthcareDocument ? "from-emerald-600 to-teal-600" : "from-purple-600 to-pink-600",
        features: isHealthcareDocument
          ? ["Clinical guidelines", "Compliance resources", "Professional references"]
          : ["External links", "Reference materials", "Additional resources"]
      }
    ];

    return baseTemplates;
  };

  const stepTemplates = getStepTemplates();

  // Auto-expand first step when created
  useEffect(() => {
    if (steps.length === 1 && !activeStepId) {
      setActiveStepId(steps[0].id);
    }
  }, [steps.length, activeStepId]);

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
    setShowStepTemplateSelector(true);
  };

  const handleTemplateSelect = (templateType: "standard" | "knowledge-check" | "scenario" | "resource-focus") => {
    addStepFromTemplate(templateType);
    setShowStepTemplateSelector(false);
    
    // Auto-focus the new step
    setTimeout(() => {
      const newStep = steps[steps.length - 1];
      if (newStep) {
        setCurrentStepIndex(steps.length - 1);
        setActiveStepId(newStep.id);
      }
    }, 100);
  };

  const handleExport = async (format: "pdf" | "html" | "training-module" | "bundle", options?: any) => {
    setIsExporting(true);
    
    if (format === "bundle") {
      setExportProgress("Creating comprehensive SOP package...");
      console.log('🎯 SopCreator handling bundle export with options:', options);
      
      try {
        await exportDocument(format, options);
      } catch (error) {
        console.error("Bundle export failed:", error);
      }
    } else if (format === "training-module") {
      setExportProgress("Creating interactive SOP module...");
      
      const enhancedOptions = {
        mode: 'standalone' as const,
        enhanced: true,
        enhancedOptions: {
          passwordProtection: {
            enabled: !!options?.trainingOptions?.passwordProtection,
            password: options?.trainingOptions?.passwordProtection || "",
            hint: "Contact your administrator for access"
          },
          features: {
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
        console.error("Interactive SOP export failed:", error);
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

  const handleDeleteStep = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;
    
    // Confirm deletion
    const confirmDelete = window.confirm("Are you sure you want to delete this step? This action cannot be undone.");
    if (!confirmDelete) return;
    
    deleteStep(stepId);
    
    // Adjust current step index if needed
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(Math.max(0, steps.length - 2));
    }
  };

  const navigateToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
    }
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Get current step safely
  const currentStep = steps.length > 0 ? steps[currentStepIndex] : null;

  // Simplified header focused on SOP creation
  const renderHeader = () => (
    <Card className="bg-[#1E1E1E] border-zinc-800 rounded-2xl mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">Interactive SOP Creator</h1>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <FileText className="h-3 w-3 mr-1" />
                Professional SOPs
              </Badge>
            </div>
            <p className="text-zinc-400 text-sm">Create engaging, interactive Standard Operating Procedures with rich content and annotations</p>
          </div>
          
          <div className="flex items-center gap-3">
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export SOP
            </Button>
          </div>
        </div>

        {/* SOP Document Information */}
        <div className="mt-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            SOP Document Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-zinc-300 text-sm font-medium mb-2 block">
                SOP Title *
              </Label>
              <Input
                id="title"
                value={sopDocument?.title || ""}
                onChange={(e) => setSopTitle(e.target.value)}
                placeholder="Enter your SOP title..."
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
            
            <div>
              <Label htmlFor="topic" className="text-zinc-300 text-sm font-medium mb-2 block">
                Department/Category *
              </Label>
              <Input
                id="topic"
                value={sopDocument?.topic || ""}
                onChange={(e) => setSopTopic(e.target.value)}
                placeholder="e.g., Operations, Safety, Customer Service..."
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
                  SOP Description
                </Label>
                <Textarea
                  id="description"
                  value={sopDocument?.description || ""}
                  onChange={(e) => setSopDescription(e.target.value)}
                  placeholder="Provide a detailed description of this SOP..."
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[100px]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Progress Overview */}
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

  const renderStepNavigation = () => (
    <Card className="bg-[#1E1E1E] border-zinc-800 rounded-2xl mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">
              {steps.length === 0 ? "Get Started" : `Step ${currentStepIndex + 1} of ${steps.length}`}
            </h2>
            
            {steps.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="text-zinc-300 border-zinc-700 hover:text-white hover:bg-zinc-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => navigateToStep(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentStepIndex 
                          ? "bg-blue-500" 
                          : "bg-zinc-700 hover:bg-zinc-600"
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextStep}
                  disabled={currentStepIndex === steps.length - 1}
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
                onClick={() => handleDeleteStep(currentStep.id)}
                className="text-red-400 border-red-800 hover:text-red-300 hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              onClick={handleAddStep}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
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
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="h-12 w-12 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-3">Create Your First SOP Step</h3>
          <p className="text-zinc-400 mb-8">
            Start building your Standard Operating Procedure by adding interactive steps with screenshots, annotations, and clear instructions.
          </p>
          
          <Button
            onClick={handleAddStep}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add First Step
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

  // Step Template Selector Modal
  const renderStepTemplateSelector = () => (
    <AnimatePresence>
      {showStepTemplateSelector && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowStepTemplateSelector(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#1E1E1E] rounded-2xl border border-zinc-800 p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {isHealthcareDocument ? "Add Healthcare SOP Step" : "Choose a Step Template"}
              </h3>
              <p className="text-zinc-400">
                {isHealthcareDocument 
                  ? "Adding healthcare-focused step with compliance and safety features"
                  : "Select the best structure for your SOP step to maximize clarity and usefulness"
                }
              </p>
              {isHealthcareDocument && (
                <div className="mt-2">
                  <Badge className="bg-teal-600 text-white text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Healthcare SOP
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {stepTemplates.map((template) => (
                <motion.div
                  key={template.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 cursor-pointer hover:border-blue-600/50 hover:bg-zinc-800/80 transition-all group"
                  onClick={() => handleTemplateSelect(template.type)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <template.icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
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
                    
                    <ArrowRight className="h-5 w-5 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-zinc-500">
                {isHealthcareDocument 
                  ? "💡 Tip: Healthcare steps include compliance features and safety protocols automatically"
                  : "💡 Tip: You can always change the step structure after creating it"
                }
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowStepTemplateSelector(false)}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleTemplateSelect("standard")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Create Basic Step
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
        {renderHeader()}
        {renderStepNavigation()}
        
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
              key={`step-${currentStepIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <StepCard
                step={currentStep}
                index={currentStepIndex}
                isActive={true}
                onStepChange={handleStepChange}
                onStepComplete={() => {}}
                onDeleteStep={() => handleDeleteStep(currentStep.id)}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Export Panel Overlay */}
        {renderExportPanel()}

        {/* Step Template Selector Modal */}
        {renderStepTemplateSelector()}
      </div>
    </div>
  );
};

export default SopCreator;
