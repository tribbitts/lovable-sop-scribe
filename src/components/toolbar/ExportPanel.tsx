import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ExportPanelProps, ExportFormat, ExportTheme, ExportOptions } from "@/types/sop";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Code, 
  Download, 
  Settings, 
  Palette, 
  List, 
  Info,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  GraduationCap,
  Zap,
  HelpCircle,
  Shield,
  Users,
  Award
} from "lucide-react";

const ExportPanel: React.FC<ExportPanelProps> = ({
  document,
  onExport,
  isExporting = false,
  exportProgress
}) => {
  const { tier, isAdmin, canUseHtmlExport } = useSubscription();
  const { user } = useAuth();
  
  // Determine user role - enhanced logic for admin detection
  const userRole: 'admin' | 'user' | 'editor' = 
    isAdmin || 
    user?.email?.toLowerCase().includes('timothyholsborg') ||
    user?.email?.toLowerCase().includes('primarypartnercare') ||
    user?.email === 'tribbit@tribbit.gg' ||
    user?.email === 'Onoki82@gmail.com'
      ? 'admin' 
      : canUseHtmlExport 
        ? 'editor' 
        : 'user';
  
  console.log('🎓 ExportPanel Admin Debug:', {
    userEmail: user?.email,
    tier,
    isAdmin,
    canUseHtmlExport,
    determinedRole: userRole
  });
  
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("training-module");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useQuickExport, setUseQuickExport] = useState(true); // New state for quick vs advanced
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    theme: "auto",
    includeTableOfContents: true,
    includeProgressInfo: true,
    customFooter: "",
    quality: "high"
  });
  
  // Training module specific options with smart defaults
  const [trainingOptions, setTrainingOptions] = useState({
    enableQuizzes: true,
    enableCertificates: true,
    enableNotes: true,
    enableBookmarks: true,
    passwordProtection: "",
    primaryColor: "#007AFF",
    secondaryColor: "#1E1E1E"
  });

  const updateTrainingOption = <K extends keyof typeof trainingOptions>(key: K, value: typeof trainingOptions[K]) => {
    setTrainingOptions(prev => ({ ...prev, [key]: value }));
  };

  const allFormatOptions = [
    {
      format: "training-module" as ExportFormat,
      icon: GraduationCap,
      label: "Interactive Training Module",
      description: "Complete offline learning experience with quizzes, progress tracking, and certificates",
      features: ["Quiz Integration", "Progress Tracking", "Completion Certificates", "Self-contained HTML", "Works Offline", "No server required"],
      badge: "Recommended",
      requiresAdmin: false,
      isPrimary: true
    },
    {
      format: "pdf" as ExportFormat,
      icon: FileText,
      label: "PDF Document",
      description: "Static printable format for documentation",
      features: ["Print optimized", "Static format", "Widely compatible"],
      badge: "Utility",
      requiresAdmin: false,
      isPrimary: false
    },
    {
      format: "html" as ExportFormat,
      icon: Code,
      label: "Basic HTML",
      description: "Simple web format without interactive features",
      features: ["Basic web format", "No interactivity", "Lightweight"],
      badge: "Utility", 
      requiresAdmin: false,
      isPrimary: false
    }
  ];
  
  // Filter formats based on user permissions
  const formatOptions = allFormatOptions;

  const themeOptions = [
    { value: "auto", label: "Auto Theme", description: "Matches system preference" },
    { value: "light", label: "Light Theme", description: "Clean and professional" },
    { value: "dark", label: "Dark Theme", description: "Modern dark interface" }
  ];

  const qualityOptions = [
    { value: "high", label: "High", description: "Best quality, larger file size" },
    { value: "medium", label: "Medium", description: "Balanced quality and size" },
    { value: "low", label: "Low", description: "Smaller file size, faster processing" }
  ];

  const updateOption = <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleQuickExport = () => {
    // Use smart defaults for quick export
    const quickOptions = {
      ...exportOptions,
      trainingOptions: {
        ...trainingOptions,
        enableQuizzes: true,
        enableCertificates: true,
        enableNotes: true,
        enableBookmarks: true
      },
      mode: 'standalone' as const,
      enableInteractive: true
    };
    onExport(selectedFormat, quickOptions);
  };

  const handleAdvancedExport = () => {
    if (selectedFormat === 'training-module') {
      // For training modules, combine regular options with training-specific options
      const combinedOptions = {
        ...exportOptions,
        trainingOptions,
        mode: 'standalone' as const,
        enableInteractive: true
      };
      onExport(selectedFormat, combinedOptions);
    } else {
      onExport(selectedFormat, exportOptions);
    }
  };

  const canExport = document.steps.length > 0 && document.title.trim().length > 0;

  const renderFormatSelector = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
        <Download className="h-4 w-4" />
        Export Format
      </h3>
      
      <div className="space-y-4">
        {/* Primary Export Option */}
        {formatOptions.filter(option => option.isPrimary).map(({ format, icon: Icon, label, description, features, badge }) => (
          <motion.div
            key={format}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedFormat === format
                ? "border-purple-500 bg-gradient-to-r from-purple-500/10 to-blue-500/10 shadow-lg"
                : "border-purple-600/50 bg-gradient-to-r from-purple-600/5 to-blue-600/5 hover:border-purple-500/70"
            }`}
            onClick={() => setSelectedFormat(format)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-lg ${
                  selectedFormat === format 
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" 
                    : "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300"
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-white">{label}</h4>
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                      ⭐ {badge}
                    </Badge>
                  </div>
                  <p className="text-zinc-400 text-sm mb-3">{description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-purple-600/20 rounded-full text-purple-200">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {selectedFormat === format && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-purple-400"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
        
        {/* Alternative Formats - Collapsed by default */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="alternatives" className="border-zinc-700">
            <AccordionTrigger className="text-sm text-zinc-400 hover:text-zinc-300">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Alternative Export Formats
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="space-y-2">
                {formatOptions.filter(option => !option.isPrimary).map(({ format, icon: Icon, label, description, badge }) => (
                  <motion.div
                    key={format}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedFormat === format
                        ? "border-zinc-500 bg-zinc-800/80"
                        : "border-zinc-700 bg-zinc-800/40 hover:border-zinc-600"
                    }`}
                    onClick={() => setSelectedFormat(format)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedFormat === format ? "bg-zinc-600 text-white" : "bg-zinc-700 text-zinc-400"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-zinc-300 text-sm">{label}</h4>
                            <Badge variant="secondary" className="text-xs bg-zinc-700 text-zinc-400">
                              {badge}
                            </Badge>
                          </div>
                          <p className="text-xs text-zinc-500">{description}</p>
                        </div>
                      </div>
                      
                      {selectedFormat === format && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-zinc-400"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );

  const renderQuickExportOptions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-400" />
          <h4 className="font-medium text-white">Quick Export</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3 w-3 text-zinc-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Uses recommended settings for most users</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Switch
          checked={useQuickExport}
          onCheckedChange={setUseQuickExport}
        />
      </div>
      
      {useQuickExport && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-green-200">Smart Defaults Enabled</span>
          </div>
          <ul className="text-xs text-green-300 space-y-1">
            <li>✅ Interactive quizzes and learning objectives</li>
            <li>✅ Progress tracking and completion certificates</li>
            <li>✅ User notes and bookmarking features</li>
            <li>✅ Auto theme matching device preferences</li>
            <li>✅ High quality output optimized for all devices</li>
          </ul>
        </motion.div>
      )}
    </div>
  );

  const renderAdvancedConfiguration = () => (
    <AnimatePresence>
      {!useQuickExport && selectedFormat === 'training-module' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-4 w-4 text-purple-400" />
            <h4 className="font-medium text-white">Advanced Configuration</h4>
          </div>

          <Accordion type="multiple" className="w-full">
            {/* Core Features */}
            <AccordionItem value="features" className="border-zinc-700">
              <AccordionTrigger className="text-sm text-zinc-300 hover:text-white">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-purple-400" />
                  Learning Features
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Progress Tracking</p>
                      <p className="text-xs text-zinc-400">Track user completion and time spent</p>
                    </div>
                  </div>
                  <Switch
                    checked={exportOptions.includeProgressInfo}
                    onCheckedChange={(checked) => updateOption("includeProgressInfo", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Interactive Quizzes</p>
                      <p className="text-xs text-zinc-400">Add knowledge checks between steps</p>
                    </div>
                  </div>
                  <Switch
                    checked={trainingOptions.enableQuizzes}
                    onCheckedChange={(checked) => updateTrainingOption("enableQuizzes", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="h-4 w-4 text-yellow-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Completion Certificates</p>
                      <p className="text-xs text-zinc-400">Generate certificates when training is completed</p>
                    </div>
                  </div>
                  <Switch
                    checked={trainingOptions.enableCertificates}
                    onCheckedChange={(checked) => updateTrainingOption("enableCertificates", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-orange-400" />
                    <div>
                      <p className="text-sm font-medium text-white">User Notes & Bookmarks</p>
                      <p className="text-xs text-zinc-400">Allow users to take notes and bookmark steps</p>
                    </div>
                  </div>
                  <Switch
                    checked={trainingOptions.enableNotes && trainingOptions.enableBookmarks}
                    onCheckedChange={(checked) => {
                      updateTrainingOption("enableNotes", checked);
                      updateTrainingOption("enableBookmarks", checked);
                    }}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Security & Access */}
            <AccordionItem value="security" className="border-zinc-700">
              <AccordionTrigger className="text-sm text-zinc-300 hover:text-white">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  Security & Access
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-zinc-300">Password Protection</label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3 w-3 text-zinc-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Leave empty for no password protection</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter password (optional)"
                    value={trainingOptions.passwordProtection}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
                    onChange={(e) => updateTrainingOption("passwordProtection", e.target.value)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Appearance */}
            <AccordionItem value="appearance" className="border-zinc-700">
              <AccordionTrigger className="text-sm text-zinc-300 hover:text-white">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-purple-400" />
                  Theme & Branding
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300">Theme</label>
                  <Select
                    value={exportOptions.theme}
                    onValueChange={(value: ExportTheme) => updateOption("theme", value)}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {themeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white hover:bg-zinc-700">
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-zinc-400">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300">Company Colors</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-400">Primary Color</label>
                      <input
                        type="color"
                        value={trainingOptions.primaryColor}
                        onChange={(e) => updateTrainingOption("primaryColor", e.target.value)}
                        className="w-full h-8 bg-zinc-800 border border-zinc-700 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400">Secondary Color</label>
                      <input
                        type="color"
                        value={trainingOptions.secondaryColor}
                        onChange={(e) => updateTrainingOption("secondaryColor", e.target.value)}
                        className="w-full h-8 bg-zinc-800 border border-zinc-700 rounded"
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderAdvancedOptions = () => (
    <AnimatePresence>
      {showAdvanced && selectedFormat !== 'training-module' && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-4 w-4 text-zinc-400" />
            <h4 className="font-medium text-white">Advanced Options</h4>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="appearance" className="border-zinc-700">
              <AccordionTrigger className="text-sm text-zinc-300 hover:text-white">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Appearance & Quality
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300">Theme</label>
                  <Select
                    value={exportOptions.theme}
                    onValueChange={(value: ExportTheme) => updateOption("theme", value)}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {themeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white hover:bg-zinc-700">
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-zinc-400">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300">Quality</label>
                  <Select
                    value={exportOptions.quality}
                    onValueChange={(value: "low" | "medium" | "high") => updateOption("quality", value)}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {qualityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white hover:bg-zinc-700">
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-zinc-400">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="content" className="border-zinc-700">
              <AccordionTrigger className="text-sm text-zinc-300 hover:text-white">
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Content Options
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <List className="h-4 w-4 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Table of Contents</p>
                      <p className="text-xs text-zinc-400">Add clickable navigation links</p>
                    </div>
                  </div>
                  <Switch
                    checked={exportOptions.includeTableOfContents}
                    onCheckedChange={(checked) => updateOption("includeTableOfContents", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Info className="h-4 w-4 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Progress Information</p>
                      <p className="text-xs text-zinc-400">Include completion tracking</p>
                    </div>
                  </div>
                  <Switch
                    checked={exportOptions.includeProgressInfo}
                    onCheckedChange={(checked) => updateOption("includeProgressInfo", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Custom Footer</label>
                  <Textarea
                    value={exportOptions.customFooter}
                    onChange={(e) => updateOption("customFooter", e.target.value)}
                    placeholder="Add custom footer text (optional)..."
                    className="bg-zinc-800 border-zinc-700 text-white min-h-[60px] resize-none"
                  />
                  <p className="text-xs text-zinc-500">
                    Leave empty to use default footer
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderExportProgress = () => (
    <AnimatePresence>
      {isExporting && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-4 p-4 bg-[#007AFF]/10 border border-[#007AFF]/30 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#007AFF] border-t-transparent"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                Generating {selectedFormat.toUpperCase()}...
              </p>
              {exportProgress && (
                <p className="text-xs text-zinc-400 mt-1">{exportProgress}</p>
              )}
            </div>
          </div>
          
          <Progress value={exportProgress ? 75 : 25} className="h-2 bg-zinc-800" />
          
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Clock className="h-3 w-3" />
            <span>This may take a few moments...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderDocumentPreview = () => (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
        <Eye className="h-4 w-4" />
        Document Preview
      </h3>
      
      <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Title:</span>
            <span className="text-sm text-white font-medium">{document.title || "Untitled SOP"}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Steps:</span>
            <Badge variant="secondary" className="bg-[#007AFF] text-white">
              {document.steps.length}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Date:</span>
            <span className="text-sm text-white">{document.date}</span>
          </div>
          
          {document.companyName && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Company:</span>
              <span className="text-sm text-white">{document.companyName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="bg-[#1E1E1E] border-zinc-800 rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-purple-400" />
          Create Training Module
        </CardTitle>
        <p className="text-zinc-400 text-sm mt-2">
          Export your lessons as an interactive, self-contained training experience
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderDocumentPreview()}
        {renderFormatSelector()}
        
        {/* Quick Export Options */}
        {renderQuickExportOptions()}
        
        {/* Advanced Configuration */}
        {renderAdvancedConfiguration()}
        
        {/* Advanced Options Toggle - Only for non-training formats */}
        {selectedFormat !== 'training-module' && (
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 p-0"
            >
              <Settings className="h-4 w-4 mr-2" />
              Advanced Options
              <motion.div
                animate={{ rotate: showAdvanced ? 180 : 0 }}
                className="ml-2"
              >
                ▼
              </motion.div>
            </Button>
          </div>
        )}
        
        {renderAdvancedOptions()}
        
        {renderExportProgress()}
        
        {/* Export Actions */}
        <div className="space-y-3 pt-4 border-t border-zinc-800">
          {!canExport && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <p className="text-sm text-yellow-200">
                Add a title and at least one step to enable export
              </p>
            </div>
          )}
          
          {/* Quick Export Button (Primary) */}
          {selectedFormat === 'training-module' && useQuickExport && (
            <Button
              onClick={handleQuickExport}
              disabled={!canExport || isExporting}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:bg-zinc-700 disabled:text-zinc-400"
              size="lg"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Creating Training Module...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Create Training Module
                </>
              )}
            </Button>
          )}
          
          {/* Advanced Export Button */}
          {((selectedFormat === 'training-module' && !useQuickExport) || selectedFormat !== 'training-module') && (
            <Button
              onClick={handleAdvancedExport}
              disabled={!canExport || isExporting}
              className={`w-full ${
                canExport && !isExporting
                  ? selectedFormat === 'training-module'
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-[#007AFF] hover:bg-[#0069D9] text-white"
                  : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
              }`}
              size="lg"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Generating {selectedFormat === 'training-module' ? 'Training Module' : selectedFormat.toUpperCase()}...
                </>
              ) : (
                <>
                  {selectedFormat === 'training-module' ? (
                    <Settings className="h-4 w-4 mr-2" />
                  ) : selectedFormat === 'pdf' ? (
                    <FileText className="h-4 w-4 mr-2" />
                  ) : (
                    <Code className="h-4 w-4 mr-2" />
                  )}
                  {selectedFormat === 'training-module' ? 'Create with Custom Settings' : `Export as ${selectedFormat.toUpperCase()}`}
                </>
              )}
            </Button>
          )}
          
          {/* Quick summary for users */}
          <div className="text-center">
            {selectedFormat === 'training-module' ? (
              <div className="space-y-2">
                {useQuickExport ? (
                  <div className="p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-200">Ready to Export</span>
                    </div>
                    <p className="text-xs text-green-300">
                      Your training module will include all recommended features for the best learning experience
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Settings className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-200">Custom Configuration</span>
                    </div>
                    <div className="text-xs text-purple-300 space-y-1">
                      <div className="flex items-center justify-center gap-4 text-xs">
                        <span>{trainingOptions.enableQuizzes ? '✅' : '❌'} Quizzes</span>
                        <span>{trainingOptions.enableCertificates ? '✅' : '❌'} Certificates</span>
                        <span>{exportOptions.includeProgressInfo ? '✅' : '❌'} Progress</span>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-xs text-zinc-500">
                  Complete HTML package • Works offline • No server required
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">
                Your {selectedFormat.toUpperCase()} will be downloaded when ready
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportPanel; 