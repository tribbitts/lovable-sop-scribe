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
  ChevronLeft,
  ChevronRight,
  Trash2,
  Download,
  ArrowRight
} from "lucide-react";
import StepCard from "@/components/step-editor/StepCard";
import ExportPanel from "@/components/step-editor/ExportPanel";
import { useSopContext } from "@/context/SopContext";
import { SopStep } from "@/types/sop";

const SopCreator: React.FC = () => {
  const {
    sopDocument,
    addStep,
    updateStep,
    deleteStep,
    duplicateStep,
    toggleStepCompletion,
    exportDocument,
    getCompletedStepsCount,
    getProgressPercentage,
    setTableOfContents,
    saveDocumentToJSON,
    resetDocument,
    setSopTitle,
    setSopTopic,
    setCompanyName,
    setSopDate,
    setSopDescription,
    setSopVersion,
    setSopLastRevised
  } = useSopContext();

  // Get steps from sopDocument
  const steps = sopDocument?.steps || [];

  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

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
    addStep();
    
    // Auto-focus the new step
    setTimeout(() => {
      const newStep = steps[steps.length];
      if (newStep) {
        setCurrentStepIndex(steps.length);
        setActiveStepId(newStep.id);
      }
    }, 100);
  };

  const handleExport = async (format: "pdf" | "html", options?: any) => {
    setIsExporting(true);
    
    try {
      setExportProgress(`Creating ${format.toUpperCase()} document...`);
      await exportDocument(format, options);
      toast({
        title: "Export Complete",
        description: `Your SOP has been exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your SOP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportProgress("");
    }
  };

  const handleDeleteStep = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    deleteStep(stepId);
    
    // Adjust current step index if needed
    if (stepIndex <= currentStepIndex && currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
    
    toast({
      title: "Step Deleted",
      description: "The step has been removed from your SOP.",
    });
  };

  const navigateToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
      setActiveStepId(steps[index].id);
    }
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setActiveStepId(steps[currentStepIndex + 1].id);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setActiveStepId(steps[currentStepIndex - 1].id);
    }
  };

  // Get current step safely
  const currentStep = steps.length > 0 ? steps[currentStepIndex] : null;

  // SOP Header with essential information
  const renderHeader = () => (
    <Card className="bg-[#1E1E1E] border-zinc-800 rounded-2xl mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">SOP Creator</h1>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <FileText className="h-3 w-3 mr-1" />
                Professional
              </Badge>
            </div>
            <p className="text-zinc-400 text-sm">Create professional Standard Operating Procedures</p>
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

        {/* SOP Information */}
        <div className="mt-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            SOP Information
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
                placeholder="e.g., Operations, HR, Safety..."
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="company" className="text-zinc-300 text-sm font-medium mb-2 block">
                Organization
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="version" className="text-zinc-300 text-sm font-medium mb-2 block">
                Version Number
              </Label>
              <Input
                id="version"
                value={sopDocument?.version || ""}
                onChange={(e) => setSopVersion(e.target.value)}
                placeholder="e.g., 1.0, 2.1, etc."
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
            
            <div>
              <Label htmlFor="lastRevised" className="text-zinc-300 text-sm font-medium mb-2 block">
                Last Revised Date
              </Label>
              <Input
                id="lastRevised"
                type="date"
                value={sopDocument?.lastRevised || ""}
                onChange={(e) => setSopLastRevised(e.target.value)}
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
                  placeholder="Provide a detailed description of this Standard Operating Procedure..."
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[100px]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Overview */}
        {steps.length > 0 && (
          <div className="mt-6 p-4 bg-zinc-900/30 rounded-lg border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium text-sm">Progress</h4>
                <p className="text-zinc-400 text-xs">
                  {getCompletedStepsCount()} of {steps.length} steps completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round(getProgressPercentage())}%
                </div>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
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
          
          <Button
            onClick={handleAddStep}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
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
          
          <h3 className="text-2xl font-bold text-white mb-3">Create Your First Step</h3>
          <p className="text-zinc-400 mb-8">
            Start building your Standard Operating Procedure by adding clear, step-by-step instructions with screenshots and annotations.
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
      </div>
    </div>
  );
};

export default SopCreator;
