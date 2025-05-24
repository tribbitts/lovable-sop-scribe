import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  GraduationCap
} from "lucide-react";

// Import our new modular components
import StepCard from "@/components/step-editor/StepCard";
import ProgressTracker from "@/components/ProgressTracker";
import ExportPanel from "@/components/toolbar/ExportPanel";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrganizationHeader from "@/components/OrganizationHeader";

const SopCreator = () => {
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
    setDarkMode,
    setTrainingMode,
    saveDocumentToJSON,
    resetDocument
  } = useSopContext();

  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>("");

  // Auto-expand first step when created
  useEffect(() => {
    if (sopDocument.steps.length === 1 && !activeStepId) {
      setActiveStepId(sopDocument.steps[0].id);
    }
  }, [sopDocument.steps.length, activeStepId]);

  const handleStepChange = (stepId: string, field: keyof typeof sopDocument.steps[0], value: any) => {
    updateStep(stepId, field, value);
  };

  const handleStepComplete = (stepId: string, completed: boolean) => {
    toggleStepCompletion(stepId);
  };

  const handleAddStep = () => {
    addStep();
    // Auto-focus the new step
    setTimeout(() => {
      const newStep = sopDocument.steps[sopDocument.steps.length - 1];
      if (newStep) {
        setActiveStepId(newStep.id);
      }
    }, 100);
  };

  const handleExport = async (format: "pdf" | "html" | "training-module", options?: any) => {
    setIsExporting(true);
    
    if (format === "training-module") {
      setExportProgress("Creating interactive training module...");
      
      console.log('🎓 Training Module Export - Options received:', options);
      
      // Convert training-module to enhanced HTML export
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
      
      console.log('🎓 Final enhanced options being passed:', enhancedOptions);
      
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

  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="max-w-md mx-auto">
        <GraduationCap className="h-16 w-16 text-purple-500 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-white mb-4">
          Ready to Build Your Training Module?
        </h3>
        <p className="text-zinc-400 mb-8">
          Create interactive learning experiences with step-by-step lessons, quizzes, 
          progress tracking, and completion certificates. Perfect for employee training, 
          onboarding, or educational content.
        </p>
        <Button 
          onClick={handleAddStep}
          size="lg"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Your First Lesson
        </Button>
      </div>
    </motion.div>
  );

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
      
      {/* Add Step Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <Button
          onClick={handleAddStep}
          variant="outline"
          size="lg"
          className="border-purple-700 text-purple-300 hover:bg-purple-800/20 border-dashed"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Another Lesson
        </Button>
      </motion.div>
    </div>
  );

  const renderQuickActions = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-4 z-10"
    >
      <Card className="bg-[#1E1E1E]/90 backdrop-blur-sm border-zinc-800 rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-purple-800 text-purple-300">
                {sopDocument.steps.length} lesson{sopDocument.steps.length !== 1 ? 's' : ''}
              </Badge>
              
              {sopDocument.steps.length > 0 && (
                <Badge variant="secondary" className="bg-green-600 text-white">
                  {getCompletedStepsCount()}/{sopDocument.steps.length} completed
                </Badge>
              )}
              
              {sopDocument.trainingMode && (
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Training Mode
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
                className="border-zinc-700 text-white hover:bg-zinc-800"
              >
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={saveDocumentToJSON}
                className="border-zinc-700 text-white hover:bg-zinc-800"
              >
                <Save className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                onClick={() => setShowExportPanel(!showExportPanel)}
                disabled={sopDocument.steps.length === 0}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <GraduationCap className="h-4 w-4 mr-1" />
                Create Training Module
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderSettings = () => (
    <AnimatePresence>
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6"
        >
          <Card className="bg-[#1E1E1E] border-zinc-800 rounded-2xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-400" />
                Training Module Settings
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-purple-400" />
                        Interactive Training Mode
                      </p>
                      <p className="text-xs text-purple-300">Enable quizzes, learning objectives, and progress tracking for all lessons</p>
                    </div>
                    <Switch
                      checked={sopDocument.trainingMode !== false}
                      onCheckedChange={(checked) => {
                        setTrainingMode(checked);
                        // Auto-enable training mode for all steps when document mode is enabled
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
                  {!sopDocument.trainingMode && (
                    <p className="text-xs text-yellow-400 mt-2">
                      💡 Enable for the full training module experience with quizzes and certificates!
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Navigation Menu</p>
                    <p className="text-xs text-zinc-400">Include table of contents in training modules</p>
                  </div>
                  <Switch
                    checked={sopDocument.tableOfContents}
                    onCheckedChange={setTableOfContents}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Dark Theme</p>
                    <p className="text-xs text-zinc-400">Use dark theme for training modules</p>
                  </div>
                  <Switch
                    checked={sopDocument.darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                
                <div className="pt-4 border-t border-zinc-800">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (window.confirm("Reset the entire document? This cannot be undone.")) {
                        resetDocument();
                        setActiveStepId(null);
                      }
                    }}
                    className="border-red-600 text-red-400 hover:bg-red-600/10"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );

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

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
      >
        <Card className="mb-6 bg-[#1E1E1E] border-zinc-800 overflow-hidden rounded-2xl">
          <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                    Interactive Training Module Creator
                  </h1>
                  <p className="text-zinc-400 text-lg">
                    Build engaging, self-contained training modules with quizzes, progress tracking,
                    and interactive learning experiences. Export as offline HTML packages.
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1">
                      <Clock className="h-4 w-4" />
                      Auto-saved locally
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Ready for export
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress indicator when there are steps */}
              {sopDocument.steps.length > 0 && (
                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Overall Progress</span>
                    <span className="text-white font-medium">{getProgressPercentage()}%</span>
                  </div>
            </div>
              )}
          </CardContent>
        </Card>
      </motion.div>

        {/* Organization Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
      >
        <OrganizationHeader />
      </motion.div>

        {/* Quick Actions */}
        {renderQuickActions()}
        
        {/* Settings Panel */}
        {renderSettings()}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Steps Column */}
          <div className="lg:col-span-2 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
              <Header />
      </motion.div>

            {/* Steps List or Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
              {sopDocument.steps.length === 0 ? renderEmptyState() : renderStepsList()}
        </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Tracker */}
        {sopDocument.steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
          >
            <ProgressTracker 
                  completed={getCompletedStepsCount()}
              total={sopDocument.steps.length} 
                  variant="bar"
                  showPercentage={true}
            />
          </motion.div>
        )}

            {/* Additional sidebar content can go here */}
          </div>
        </div>
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12"
        >
          <Footer />
        </motion.div>
      </div>

      {/* Export Panel Overlay */}
      {renderExportPanel()}
    </div>
  );
};

export default SopCreator;
