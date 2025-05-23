import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ExportPanelProps, ExportFormat, ExportTheme, ExportOptions } from "@/types/sop";
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
  Clock
} from "lucide-react";

const ExportPanel: React.FC<ExportPanelProps> = ({
  document,
  onExport,
  isExporting = false,
  exportProgress
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    theme: "light",
    includeTableOfContents: true,
    includeProgressInfo: false,
    customFooter: "",
    quality: "high"
  });

  const formatOptions = [
    {
      format: "pdf" as ExportFormat,
      icon: FileText,
      label: "PDF Document",
      description: "Professional, print-ready format",
      features: ["Print optimized", "Consistent layout", "Professional appearance"],
      badge: "Recommended"
    },
    {
      format: "html" as ExportFormat,
      icon: Code,
      label: "HTML Package",
      description: "Interactive web-ready format",
      features: ["Interactive elements", "Responsive design", "Web sharing"],
      badge: "Interactive"
    }
  ];

  const themeOptions = [
    { value: "light", label: "Light Theme", description: "Clean and professional" },
    { value: "dark", label: "Dark Theme", description: "Modern dark interface" },
    { value: "auto", label: "Auto Theme", description: "Matches system preference" }
  ];

  const qualityOptions = [
    { value: "low", label: "Low", description: "Smaller file size, faster processing" },
    { value: "medium", label: "Medium", description: "Balanced quality and size" },
    { value: "high", label: "High", description: "Best quality, larger file size" }
  ];

  const updateOption = <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    onExport(selectedFormat, exportOptions);
  };

  const canExport = document.steps.length > 0 && document.title.trim().length > 0;

  const renderFormatSelector = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
        <Download className="h-4 w-4" />
        Export Format
      </h3>
      
      <div className="grid gap-3">
        {formatOptions.map(({ format, icon: Icon, label, description, features, badge }) => (
          <motion.div
            key={format}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedFormat === format
                ? "border-[#007AFF] bg-[#007AFF]/10"
                : "border-zinc-700 hover:border-zinc-600 bg-zinc-800/50"
            }`}
            onClick={() => setSelectedFormat(format)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  selectedFormat === format ? "bg-[#007AFF] text-white" : "bg-zinc-700 text-zinc-300"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white">{label}</h4>
                    <Badge variant="secondary" className="text-xs bg-zinc-700 text-zinc-300">
                      {badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-400 mb-2">{description}</p>
                  <div className="flex flex-wrap gap-1">
                    {features.map((feature, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-zinc-700/50 rounded text-zinc-400">
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
                  className="text-[#007AFF]"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderAdvancedOptions = () => (
    <AnimatePresence>
      {showAdvanced && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 overflow-hidden"
        >
          {/* Theme Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Theme
            </label>
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

          {/* Quality Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Quality
            </label>
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

          {/* Include Options */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-zinc-300">Include in Export</label>
            
            <div className="space-y-3">
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
            </div>
          </div>

          {/* Custom Footer */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Custom Footer</label>
            <Textarea
              value={exportOptions.customFooter}
              onChange={(e) => updateOption("customFooter", e.target.value)}
              placeholder="Add custom footer text (optional)..."
              className="bg-zinc-800 border-zinc-700 text-white min-h-[60px] resize-none"
            />
            <p className="text-xs text-zinc-500">
              Leave empty to use default footer: "© {document.companyName} | For internal use only"
            </p>
          </div>
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
          <Download className="h-5 w-5 text-[#007AFF]" />
          Export SOP
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderDocumentPreview()}
        {renderFormatSelector()}
        
        {/* Advanced Options Toggle */}
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
          
          <Button
            onClick={handleExport}
            disabled={!canExport || isExporting}
            className={`w-full ${
              canExport && !isExporting
                ? "bg-[#007AFF] hover:bg-[#0069D9] text-white"
                : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
            }`}
            size="lg"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Generating {selectedFormat.toUpperCase()}...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export as {selectedFormat.toUpperCase()}
              </>
            )}
          </Button>
          
          <p className="text-xs text-zinc-500 text-center">
            Your {selectedFormat.toUpperCase()} will be downloaded automatically when ready
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportPanel; 