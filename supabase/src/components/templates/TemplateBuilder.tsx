import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronLeft,
  ChevronRight,
  Save,
  Eye,
  Upload,
  Check,
  AlertTriangle,
  Info,
  Plus,
  Trash2,
  Move,
  Settings,
  Palette,
  FileText,
  Globe,
  Users,
  Shield,
  Sparkles,
  BookOpen,
  Tag,
  Clock,
  Zap,
  Edit
} from "lucide-react";
import type { 
  TemplateBuilder as TemplateBuilderType,
  TemplateBasics,
  TemplateStructure,
  TemplateContent,
  TemplateCustomization,
  TemplateMetadata,
  TemplateCategory,
  Industry,
  UseCase,
  ComplianceFramework,
  LicenseType,
  TemplateFeature
} from "@/types/template-ecosystem";
import { v4 as uuidv4 } from "uuid";

interface TemplateBuilderProps {
  onSave?: (template: TemplateBuilderType) => void;
  onPublish?: (template: TemplateBuilderType) => void;
  onPreview?: (template: TemplateBuilderType) => void;
  initialData?: Partial<TemplateBuilderType>;
  isPublishing?: boolean;
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  onSave,
  onPublish,
  onPreview,
  initialData,
  isPublishing = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Template builder state
  const [basics, setBasics] = useState<TemplateBasics>({
    name: "",
    shortDescription: "",
    description: "",
    category: "general",
    industry: [],
    useCase: [],
    previewImages: []
  });

  const [structure, setStructure] = useState<TemplateStructure>({
    steps: [],
    estimatedTime: 60,
    difficulty: "beginner",
    requiredRoles: [],
    options: {
      allowReordering: true,
      allowStepAddition: true,
      allowStepDeletion: false,
      minSteps: 1,
      maxSteps: 50
    }
  });

  const [content, setContent] = useState<TemplateContent>({
    placeholders: {},
    contentBlocks: [],
    conditionalLogic: [],
    validation: {
      requiredFields: [],
      contentGuidelines: [],
      qualityChecks: []
    }
  });

  const [customization, setCustomization] = useState<TemplateCustomization>({
    branding: {
      allowLogoChange: true,
      allowColorChange: true,
      allowFontChange: true
    },
    content: {
      allowStepModification: true,
      protectedSections: []
    },
    licensing: {
      license: "cc-by",
      attribution: true,
      commercialUse: true,
      modifications: true,
      distribution: true
    }
  });

  const [metadata, setMetadata] = useState<TemplateMetadata>({
    complianceFrameworks: [],
    languages: ["English"],
    requiredFeatures: [],
    integrations: [],
    dependencies: [],
    tags: [],
    keywords: [],
    searchTerms: []
  });

  const builderSteps = [
    { id: 1, name: "Basics", icon: FileText, description: "Basic information and category" },
    { id: 2, name: "Structure", icon: BookOpen, description: "Template structure and flow" },
    { id: 3, name: "Content", icon: Edit, description: "Content blocks and placeholders" },
    { id: 4, name: "Customization", icon: Palette, description: "Branding and licensing options" },
    { id: 5, name: "Metadata", icon: Tag, description: "Tags, compliance, and features" },
    { id: 6, name: "Preview", icon: Eye, description: "Preview and test your template" },
    { id: 7, name: "Publish", icon: Globe, description: "Publish settings and final review" }
  ];

  // Validation
  const [errors, setErrors] = useState<Array<{ step: string; field: string; message: string }>>([]);
  const [warnings, setWarnings] = useState<Array<{ step: string; field: string; message: string }>>([]);

  const validateStep = useCallback((stepNum: number) => {
    const stepErrors: typeof errors = [];
    const stepWarnings: typeof warnings = [];

    switch (stepNum) {
      case 1: // Basics
        if (!basics.name.trim()) {
          stepErrors.push({ step: "basics", field: "name", message: "Template name is required" });
        }
        if (!basics.shortDescription.trim()) {
          stepErrors.push({ step: "basics", field: "shortDescription", message: "Short description is required" });
        }
        if (basics.industry.length === 0) {
          stepWarnings.push({ step: "basics", field: "industry", message: "Consider adding industry tags for better discoverability" });
        }
        break;
      
      case 2: // Structure
        if (structure.steps.length === 0) {
          stepErrors.push({ step: "structure", field: "steps", message: "At least one step is required" });
        }
        if (structure.estimatedTime < 5) {
          stepWarnings.push({ step: "structure", field: "estimatedTime", message: "Very short estimated time might indicate incomplete steps" });
        }
        break;

      case 3: // Content
        const hasPlaceholders = Object.keys(content.placeholders).length > 0;
        if (!hasPlaceholders) {
          stepWarnings.push({ step: "content", field: "placeholders", message: "Consider adding placeholders to make your template customizable" });
        }
        break;

      case 5: // Metadata
        if (metadata.tags.length === 0) {
          stepWarnings.push({ step: "metadata", field: "tags", message: "Tags help users discover your template" });
        }
        break;
    }

    setErrors(prev => prev.filter(e => e.step !== builderSteps[stepNum - 1].name.toLowerCase()).concat(stepErrors));
    setWarnings(prev => prev.filter(w => w.step !== builderSteps[stepNum - 1].name.toLowerCase()).concat(stepWarnings));

    return stepErrors.length === 0;
  }, [basics, structure, content, metadata, builderSteps]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, builderSteps.length));
    }
  }, [currentStep, validateStep, builderSteps.length]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleSave = useCallback(() => {
    const templateData: TemplateBuilderType = {
      currentStep,
      totalSteps: builderSteps.length,
      steps: {
        basics,
        structure,
        content,
        customization,
        metadata,
        preview: {
          generatedSOP: null,
          previewMode: "desktop",
          testData: {},
          viewTime: 0,
          interactionPoints: []
        },
        publish: {
          visibility: "private",
          pricing: { isFree: true },
          settings: {
            autoUpdate: false,
            versionControl: true,
            analytics: true,
            communityFeatures: true
          },
          compliance: {
            termsAccepted: false,
            contentPolicy: false,
            dataPrivacy: false,
            intellectualProperty: false
          }
        }
      },
      validation: {
        isValid: errors.length === 0,
        errors,
        warnings
      },
      autoSave: {
        enabled: autoSaveEnabled,
        lastSaved: new Date(),
        isDirty: false
      }
    };

    onSave?.(templateData);
    setLastSaved(new Date());
    setIsDirty(false);
  }, [currentStep, builderSteps.length, basics, structure, content, customization, metadata, errors, warnings, autoSaveEnabled, onSave]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && isDirty) {
      const timer = setTimeout(() => {
        handleSave();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoSaveEnabled, isDirty, handleSave]);

  const renderBasicsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Template Basics</h3>
        <p className="text-zinc-400 mb-6">
          Provide basic information about your template to help users understand its purpose and scope.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-white">Template Name *</Label>
            <Input
              value={basics.name}
              onChange={(e) => {
                setBasics(prev => ({ ...prev, name: e.target.value }));
                setIsDirty(true);
              }}
              placeholder="e.g., Employee Onboarding Process"
              className="bg-zinc-800 border-zinc-700 text-white mt-1"
            />
          </div>

          <div>
            <Label className="text-white">Short Description *</Label>
            <Input
              value={basics.shortDescription}
              onChange={(e) => {
                setBasics(prev => ({ ...prev, shortDescription: e.target.value }));
                setIsDirty(true);
              }}
              placeholder="Brief one-line description for listings"
              className="bg-zinc-800 border-zinc-700 text-white mt-1"
            />
          </div>

          <div>
            <Label className="text-white">Detailed Description</Label>
            <Textarea
              value={basics.description}
              onChange={(e) => {
                setBasics(prev => ({ ...prev, description: e.target.value }));
                setIsDirty(true);
              }}
              placeholder="Detailed description of what this template covers and who it's for..."
              className="bg-zinc-800 border-zinc-700 text-white mt-1"
              rows={4}
            />
          </div>

          <div>
            <Label className="text-white">Category *</Label>
            <Select 
              value={basics.category} 
              onValueChange={(value) => {
                setBasics(prev => ({ ...prev, category: value as TemplateCategory }));
                setIsDirty(true);
              }}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="onboarding" className="text-white">👋 Onboarding</SelectItem>
                <SelectItem value="training" className="text-white">📚 Training</SelectItem>
                <SelectItem value="compliance" className="text-white">✅ Compliance</SelectItem>
                <SelectItem value="safety" className="text-white">🛡️ Safety</SelectItem>
                <SelectItem value="operations" className="text-white">⚙️ Operations</SelectItem>
                <SelectItem value="hr" className="text-white">👥 Human Resources</SelectItem>
                <SelectItem value="it" className="text-white">💻 IT & Technology</SelectItem>
                <SelectItem value="finance" className="text-white">💰 Finance</SelectItem>
                <SelectItem value="customer-service" className="text-white">📞 Customer Service</SelectItem>
                <SelectItem value="general" className="text-white">📄 General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-white">Industries</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-64 overflow-y-auto">
              {[
                "healthcare", "manufacturing", "retail", "finance", "technology", 
                "education", "government", "construction", "hospitality", "transportation"
              ].map((industry) => (
                <div key={industry} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={industry}
                    checked={basics.industry.includes(industry as Industry)}
                    onChange={(e) => {
                      setBasics(prev => ({
                        ...prev,
                        industry: e.target.checked
                          ? [...prev.industry, industry as Industry]
                          : prev.industry.filter(i => i !== industry)
                      }));
                      setIsDirty(true);
                    }}
                    className="rounded border-zinc-600"
                  />
                  <Label htmlFor={industry} className="text-zinc-300 text-sm capitalize">
                    {industry.replace("-", " ")}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-white">Use Cases</Label>
            <div className="grid grid-cols-1 gap-2 mt-2 max-h-64 overflow-y-auto">
              {[
                "employee-onboarding", "equipment-operation", "safety-procedures", 
                "customer-support", "incident-response", "quality-control",
                "data-management", "compliance-audit", "training-program"
              ].map((useCase) => (
                <div key={useCase} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={useCase}
                    checked={basics.useCase.includes(useCase as UseCase)}
                    onChange={(e) => {
                      setBasics(prev => ({
                        ...prev,
                        useCase: e.target.checked
                          ? [...prev.useCase, useCase as UseCase]
                          : prev.useCase.filter(u => u !== useCase)
                      }));
                      setIsDirty(true);
                    }}
                    className="rounded border-zinc-600"
                  />
                  <Label htmlFor={useCase} className="text-zinc-300 text-sm capitalize">
                    {useCase.replace("-", " ")}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStructureStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Template Structure</h3>
        <p className="text-zinc-400 mb-6">
          Define the overall structure and flow of your template.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-white">Template Steps</h4>
            <Button 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                const newStep = {
                  id: uuidv4(),
                  title: `Step ${structure.steps.length + 1}`,
                  description: "",
                  estimatedTime: 15,
                  difficulty: "easy" as const,
                  placeholders: []
                };
                setStructure(prev => ({
                  ...prev,
                  steps: [...prev.steps, newStep]
                }));
                setIsDirty(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>

          <div className="space-y-3">
            {structure.steps.map((step, index) => (
              <Card key={step.id} className="bg-zinc-800 border-zinc-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <Input
                      value={step.title}
                      onChange={(e) => {
                        setStructure(prev => ({
                          ...prev,
                          steps: prev.steps.map(s => 
                            s.id === step.id ? { ...s, title: e.target.value } : s
                          )
                        }));
                        setIsDirty(true);
                      }}
                      placeholder="Step title"
                      className="bg-zinc-900 border-zinc-600 text-white"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => {
                        setStructure(prev => ({
                          ...prev,
                          steps: prev.steps.filter(s => s.id !== step.id)
                        }));
                        setIsDirty(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Textarea
                    value={step.description}
                    onChange={(e) => {
                      setStructure(prev => ({
                        ...prev,
                        steps: prev.steps.map(s => 
                          s.id === step.id ? { ...s, description: e.target.value } : s
                        )
                      }));
                      setIsDirty(true);
                    }}
                    placeholder="Step description and instructions..."
                    className="bg-zinc-900 border-zinc-600 text-white"
                    rows={2}
                  />

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-zinc-400" />
                      <Input
                        type="number"
                        value={step.estimatedTime}
                        onChange={(e) => {
                          setStructure(prev => ({
                            ...prev,
                            steps: prev.steps.map(s => 
                              s.id === step.id ? { ...s, estimatedTime: parseInt(e.target.value) || 0 } : s
                            )
                          }));
                          setIsDirty(true);
                        }}
                        className="w-20 bg-zinc-900 border-zinc-600 text-white"
                        min="1"
                      />
                      <span className="text-zinc-400 text-sm">min</span>
                    </div>

                    <Select 
                      value={step.difficulty}
                      onValueChange={(value) => {
                        setStructure(prev => ({
                          ...prev,
                          steps: prev.steps.map(s => 
                            s.id === step.id ? { ...s, difficulty: value as any } : s
                          )
                        }));
                        setIsDirty(true);
                      }}
                    >
                      <SelectTrigger className="w-32 bg-zinc-900 border-zinc-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-600">
                        <SelectItem value="easy" className="text-white">Easy</SelectItem>
                        <SelectItem value="medium" className="text-white">Medium</SelectItem>
                        <SelectItem value="hard" className="text-white">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}

            {structure.steps.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-zinc-600 rounded-lg">
                <BookOpen className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">No steps added yet</h4>
                <p className="text-zinc-400 mb-4">Start building your template by adding the first step</p>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    const newStep = {
                      id: uuidv4(),
                      title: "Step 1",
                      description: "",
                      estimatedTime: 15,
                      difficulty: "easy" as const,
                      placeholders: []
                    };
                    setStructure(prev => ({
                      ...prev,
                      steps: [newStep]
                    }));
                    setIsDirty(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Step
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Overall Difficulty</Label>
                <Select 
                  value={structure.difficulty}
                  onValueChange={(value) => {
                    setStructure(prev => ({ ...prev, difficulty: value as any }));
                    setIsDirty(true);
                  }}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-600 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600">
                    <SelectItem value="beginner" className="text-white">Beginner</SelectItem>
                    <SelectItem value="intermediate" className="text-white">Intermediate</SelectItem>
                    <SelectItem value="advanced" className="text-white">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Total Estimated Time</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={structure.estimatedTime}
                    onChange={(e) => {
                      setStructure(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 0 }));
                      setIsDirty(true);
                    }}
                    className="bg-zinc-900 border-zinc-600 text-white"
                    min="5"
                  />
                  <span className="text-zinc-400 text-sm">minutes</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-white">Structure Options</Label>
                {[
                  { key: 'allowReordering', label: 'Allow Step Reordering' },
                  { key: 'allowStepAddition', label: 'Allow Adding Steps' },
                  { key: 'allowStepDeletion', label: 'Allow Deleting Steps' }
                ].map((option) => (
                  <div key={option.key} className="flex items-center justify-between">
                    <Label className="text-zinc-300 text-sm">{option.label}</Label>
                    <Switch
                      checked={(structure.options as any)[option.key]}
                      onCheckedChange={(checked) => {
                        setStructure(prev => ({
                          ...prev,
                          options: { ...prev.options, [option.key]: checked }
                        }));
                        setIsDirty(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Total Steps:</span>
                <span className="text-white">{structure.steps.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Est. Duration:</span>
                <span className="text-white">
                  {Math.floor(structure.estimatedTime / 60)}h {structure.estimatedTime % 60}m
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Difficulty:</span>
                <Badge variant="outline" className="text-xs">
                  {structure.difficulty}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    const StepIcon = builderSteps[currentStep - 1]?.icon || FileText;
    
    switch (currentStep) {
      case 1:
        return renderBasicsStep();
      case 2:
        return renderStructureStep();
      case 3:
        return (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Content Editor</h3>
            <p className="text-zinc-400">Content block editor would be implemented here</p>
          </div>
        );
      case 4:
        return (
          <div className="text-center py-12">
            <Palette className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Customization Options</h3>
            <p className="text-zinc-400">Branding and licensing options would be implemented here</p>
          </div>
        );
      case 5:
        return (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Metadata & Tags</h3>
            <p className="text-zinc-400">Metadata configuration would be implemented here</p>
          </div>
        );
      case 6:
        return (
          <div className="text-center py-12">
            <Eye className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Preview & Test</h3>
            <p className="text-zinc-400">Template preview would be implemented here</p>
          </div>
        );
      case 7:
        return (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Publish Settings</h3>
            <p className="text-zinc-400">Publishing configuration would be implemented here</p>
          </div>
        );
      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / builderSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-purple-900/10 to-zinc-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Template Builder</h1>
              <p className="text-zinc-400">
                Create professional SOP templates with our guided wizard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Switch
                  checked={autoSaveEnabled}
                  onCheckedChange={setAutoSaveEnabled}
                />
                <span>Auto-save</span>
              </div>
              {lastSaved && (
                <span className="text-xs text-zinc-500">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <Button 
                variant="outline" 
                onClick={handleSave}
                className="border-zinc-600 text-zinc-300"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">
                Step {currentStep} of {builderSteps.length}
              </span>
              <span className="text-sm text-zinc-400">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
            {builderSteps.map((step) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              const hasErrors = errors.some(e => e.step === step.name.toLowerCase());
              
              return (
                <motion.button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg whitespace-nowrap transition-all ${
                    isCurrent 
                      ? 'bg-purple-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-600/20 text-green-300 hover:bg-green-600/30' 
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                    isCurrent 
                      ? 'bg-white/20' 
                      : isCompleted 
                        ? 'bg-green-600/40' 
                        : 'bg-zinc-700'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-3 w-3" />
                    ) : hasErrors ? (
                      <AlertTriangle className="h-3 w-3 text-red-400" />
                    ) : (
                      <Icon className="h-3 w-3" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{step.name}</div>
                    <div className="text-xs opacity-75">{step.description}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-96">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Validation Messages */}
        {(errors.length > 0 || warnings.length > 0) && (
          <div className="mt-6 space-y-2">
            {errors.map((error, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-red-300 text-sm">{error.message}</span>
              </div>
            ))}
            {warnings.map((warning, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                <Info className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-300 text-sm">{warning.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-700">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="border-zinc-600 text-zinc-300"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-3">
            {currentStep === builderSteps.length ? (
              <Button
                onClick={() => onPublish?.({ 
                  currentStep, 
                  totalSteps: builderSteps.length, 
                  steps: { basics, structure, content, customization, metadata } as any,
                  validation: { isValid: errors.length === 0, errors, warnings },
                  autoSave: { enabled: autoSaveEnabled, lastSaved, isDirty }
                })}
                disabled={isPublishing || errors.length > 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {isPublishing ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Publish Template
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={errors.some(e => e.step === builderSteps[currentStep - 1].name.toLowerCase())}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateBuilder; 