import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Share2, 
  Palette, 
  Layout, 
  Shield, 
  Settings,
  Sparkles,
  FileText,
  Globe,
  Copy,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  File,
  ChevronDown,
  ChevronUp,
  Eye,
  Lock,
  Zap
} from "lucide-react";
import type { SopDocument } from "@/types/sop";
import type { 
  EnhancedExportOptions, 
  AdvancedExportCustomization, 
  ShareLinkOptions,
  ExportTemplate,
  EnhancedExportFormat
} from "@/types/enhanced-export";
import { v4 as uuidv4 } from "uuid";

interface EnhancedExportPanelProps {
  document: SopDocument;
  onExport: (format: EnhancedExportFormat, options: EnhancedExportOptions) => void;
  onGenerateShareLink: (options: ShareLinkOptions) => Promise<string>;
  isExporting?: boolean;
  exportProgress?: string;
  availableTemplates?: ExportTemplate[];
}

const EnhancedExportPanel: React.FC<EnhancedExportPanelProps> = ({
  document,
  onExport,
  onGenerateShareLink,
  isExporting = false,
  exportProgress = "",
  availableTemplates = []
}) => {
  const [activeTab, setActiveTab] = useState("quick");
  const [selectedFormat, setSelectedFormat] = useState<EnhancedExportFormat>("pdf");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [generatedShareLink, setGeneratedShareLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Export customization state
  const [customization, setCustomization] = useState<AdvancedExportCustomization>({
    brandKit: {
      primaryColor: "#007AFF",
      secondaryColor: "#5856D6",
      accentColor: "#FF6B6B",
      fontFamily: "system"
    },
    layout: {
      pageSize: "A4",
      orientation: "portrait",
      margins: "normal",
      columnLayout: "single"
    },
    sections: {
      includeCoverPage: true,
      includeTableOfContents: true,
      includeGlossary: false,
      includeAppendix: false,
      includeRevisionHistory: true,
      includeSignaturePage: false,
      includeFeedbackQR: true
    },
    interactivity: {
      enableClickableLinks: true,
      enableFormFields: false,
      enableDigitalSignatures: false,
      enableBookmarks: true,
      enableComments: false
    }
  });

  // Share link options state
  const [shareLinkOptions, setShareLinkOptions] = useState<ShareLinkOptions>({
    access: {
      type: "public"
    },
    permissions: {
      canView: true,
      canComment: false,
      canSuggestEdits: false,
      canDownload: true,
      canShare: true,
      canPrint: true,
      trackViewing: true
    },
    appearance: {
      showHeader: true,
      showFooter: true,
      showWatermark: false,
      theme: "auto",
      hideSOPifyBranding: false
    },
    analytics: {
      enabled: true,
      trackPageViews: true,
      trackTimeSpent: true,
      trackInteractions: false,
      trackDownloads: true,
      notifyOnAccess: false
    }
  });

  const handleExport = useCallback(() => {
    const exportOptions: EnhancedExportOptions = {
      format: selectedFormat,
      includeImages: true,
      advanced: customization,
      template: selectedTemplate ? {
        useCustomTemplate: true,
        templateId: selectedTemplate
      } : undefined,
      optimization: {
        imageQuality: "high",
        fileSize: "balanced",
        webOptimized: true,
        includeMetadata: true
      }
    };

    onExport(selectedFormat, exportOptions);
  }, [selectedFormat, customization, selectedTemplate, onExport]);

  const handleGenerateShareLink = useCallback(async () => {
    try {
      const shareUrl = await onGenerateShareLink(shareLinkOptions);
      setGeneratedShareLink(shareUrl);
    } catch (error) {
      console.error('Failed to generate share link:', error);
    }
  }, [shareLinkOptions, onGenerateShareLink]);

  const copyShareLink = useCallback(() => {
    if (generatedShareLink) {
      navigator.clipboard.writeText(generatedShareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }, [generatedShareLink]);

  const applyTemplate = useCallback((templateId: string) => {
    const template = availableTemplates.find(t => t.id === templateId);
    if (template) {
      setCustomization(template.customization);
      setSelectedTemplate(templateId);
    }
  }, [availableTemplates]);

  const quickExportFormats = [
    { 
      id: "pdf", 
      name: "PDF Document", 
      icon: FileText, 
      description: "Professional, print-ready format",
      recommended: true
    },
    { 
      id: "html", 
      name: "Interactive Web Page", 
      icon: Globe, 
      description: "Modern, responsive web document"
    },
    { 
      id: "docx", 
      name: "Microsoft Word", 
      icon: FileText, 
      description: "Editable document format"
    },
    { 
      id: "powerpoint", 
      name: "PowerPoint Slides", 
      icon: Layout, 
      description: "Presentation format"
    }
  ];

  const templateCategories = [
    { id: "business", name: "Business", icon: "💼" },
    { id: "healthcare", name: "Healthcare", icon: "🏥" },
    { id: "education", name: "Education", icon: "🎓" },
    { id: "technical", name: "Technical", icon: "⚙️" },
    { id: "legal", name: "Legal", icon: "⚖️" }
  ];

  return (
    <div className="h-full bg-gradient-to-br from-zinc-900 via-purple-900/20 to-zinc-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-400" />
            Enhanced Export Studio
          </h2>
          <p className="text-zinc-400">
            Create stunning, professional documents with advanced customization
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-zinc-800 border-zinc-700">
            <TabsTrigger value="quick" className="text-zinc-300 data-[state=active]:text-white">
              <Zap className="h-4 w-4 mr-2" />
              Quick Export
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-zinc-300 data-[state=active]:text-white">
              <File className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="customize" className="text-zinc-300 data-[state=active]:text-white">
              <Palette className="h-4 w-4 mr-2" />
              Customize
            </TabsTrigger>
            <TabsTrigger value="share" className="text-zinc-300 data-[state=active]:text-white">
              <Share2 className="h-4 w-4 mr-2" />
              Share Link
            </TabsTrigger>
          </TabsList>

          {/* Quick Export Tab */}
          <TabsContent value="quick" className="space-y-6">
            <Card className="bg-zinc-900/80 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Quick Export Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickExportFormats.map((format) => {
                    const Icon = format.icon;
                    return (
                      <motion.div
                        key={format.id}
                        whileHover={{ scale: 1.02 }}
                        className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedFormat === format.id
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                        }`}
                        onClick={() => setSelectedFormat(format.id as EnhancedExportFormat)}
                      >
                        {format.recommended && (
                          <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            Recommended
                          </Badge>
                        )}
                        <div className="flex items-start gap-3">
                          <Icon className="h-8 w-8 text-purple-400 mt-1" />
                          <div>
                            <h3 className="font-semibold text-white">{format.name}</h3>
                            <p className="text-sm text-zinc-400 mt-1">{format.description}</p>
                          </div>
                        </div>
                        {selectedFormat === format.id && (
                          <CheckCircle className="absolute top-4 right-4 h-5 w-5 text-green-400" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    {isExporting ? (
                      <>
                        <Download className="h-4 w-4 mr-2 animate-spin" />
                        {exportProgress || "Exporting..."}
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export {quickExportFormats.find(f => f.id === selectedFormat)?.name}
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {showAdvancedOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Quick Advanced Options */}
                <AnimatePresence>
                  {showAdvancedOptions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-zinc-300">Include Cover Page</Label>
                          <Switch
                            checked={customization.sections?.includeCoverPage}
                            onCheckedChange={(checked) => 
                              setCustomization(prev => ({
                                ...prev,
                                sections: { ...prev.sections!, includeCoverPage: checked }
                              }))
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label className="text-zinc-300">Table of Contents</Label>
                          <Switch
                            checked={customization.sections?.includeTableOfContents}
                            onCheckedChange={(checked) => 
                              setCustomization(prev => ({
                                ...prev,
                                sections: { ...prev.sections!, includeTableOfContents: checked }
                              }))
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label className="text-zinc-300">Clickable Links</Label>
                          <Switch
                            checked={customization.interactivity?.enableClickableLinks}
                            onCheckedChange={(checked) => 
                              setCustomization(prev => ({
                                ...prev,
                                interactivity: { ...prev.interactivity!, enableClickableLinks: checked }
                              }))
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label className="text-zinc-300">Feedback QR Code</Label>
                          <Switch
                            checked={customization.sections?.includeFeedbackQR}
                            onCheckedChange={(checked) => 
                              setCustomization(prev => ({
                                ...prev,
                                sections: { ...prev.sections!, includeFeedbackQR: checked }
                              }))
                            }
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card className="bg-zinc-900/80 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <File className="h-5 w-5 text-blue-400" />
                  Professional Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Template Categories */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {templateCategories.map((category) => (
                    <Badge
                      key={category.id}
                      variant="outline"
                      className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </Badge>
                  ))}
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableTemplates.slice(0, 6).map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                      }`}
                      onClick={() => applyTemplate(template.id)}
                    >
                      {template.thumbnail && (
                        <img 
                          src={template.thumbnail} 
                          alt={template.name}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                      <p className="text-sm text-zinc-400 mb-2">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <Users className="h-3 w-3" />
                          {template.usageCount}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {selectedTemplate && (
                  <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-300">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">
                        Template applied: {availableTemplates.find(t => t.id === selectedTemplate)?.name}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customize Tab */}
          <TabsContent value="customize" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Brand Kit */}
              <Card className="bg-zinc-900/80 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Palette className="h-5 w-5 text-pink-400" />
                    Brand Kit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-zinc-300 text-sm">Primary Color</Label>
                      <input
                        type="color"
                        value={customization.brandKit?.primaryColor}
                        onChange={(e) => 
                          setCustomization(prev => ({
                            ...prev,
                            brandKit: { ...prev.brandKit!, primaryColor: e.target.value }
                          }))
                        }
                        className="w-full h-10 rounded border border-zinc-600"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300 text-sm">Secondary</Label>
                      <input
                        type="color"
                        value={customization.brandKit?.secondaryColor}
                        onChange={(e) => 
                          setCustomization(prev => ({
                            ...prev,
                            brandKit: { ...prev.brandKit!, secondaryColor: e.target.value }
                          }))
                        }
                        className="w-full h-10 rounded border border-zinc-600"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300 text-sm">Accent</Label>
                      <input
                        type="color"
                        value={customization.brandKit?.accentColor}
                        onChange={(e) => 
                          setCustomization(prev => ({
                            ...prev,
                            brandKit: { ...prev.brandKit!, accentColor: e.target.value }
                          }))
                        }
                        className="w-full h-10 rounded border border-zinc-600"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-zinc-300 text-sm">Font Family</Label>
                    <Select 
                      value={customization.brandKit?.fontFamily}
                      onValueChange={(value) => 
                        setCustomization(prev => ({
                          ...prev,
                          brandKit: { ...prev.brandKit!, fontFamily: value as any }
                        }))
                      }
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-600">
                        <SelectItem value="system" className="text-white">System Default</SelectItem>
                        <SelectItem value="serif" className="text-white">Serif</SelectItem>
                        <SelectItem value="sans-serif" className="text-white">Sans Serif</SelectItem>
                        <SelectItem value="monospace" className="text-white">Monospace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-zinc-300 text-sm">Logo URL (Optional)</Label>
                    <Input
                      value={customization.brandKit?.logoUrl || ""}
                      onChange={(e) => 
                        setCustomization(prev => ({
                          ...prev,
                          brandKit: { ...prev.brandKit!, logoUrl: e.target.value }
                        }))
                      }
                      placeholder="https://your-logo-url.com/logo.png"
                      className="bg-zinc-800 border-zinc-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Layout Options */}
              <Card className="bg-zinc-900/80 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Layout className="h-5 w-5 text-green-400" />
                    Layout & Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-zinc-300 text-sm">Page Size</Label>
                      <Select 
                        value={customization.layout?.pageSize}
                        onValueChange={(value) => 
                          setCustomization(prev => ({
                            ...prev,
                            layout: { ...prev.layout!, pageSize: value as any }
                          }))
                        }
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-600">
                          <SelectItem value="A4" className="text-white">A4</SelectItem>
                          <SelectItem value="US-Letter" className="text-white">US Letter</SelectItem>
                          <SelectItem value="Legal" className="text-white">Legal</SelectItem>
                          <SelectItem value="A3" className="text-white">A3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-zinc-300 text-sm">Orientation</Label>
                      <Select 
                        value={customization.layout?.orientation}
                        onValueChange={(value) => 
                          setCustomization(prev => ({
                            ...prev,
                            layout: { ...prev.layout!, orientation: value as any }
                          }))
                        }
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-600">
                          <SelectItem value="portrait" className="text-white">Portrait</SelectItem>
                          <SelectItem value="landscape" className="text-white">Landscape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-zinc-300 text-sm">Margins</Label>
                    <Select 
                      value={customization.layout?.margins}
                      onValueChange={(value) => 
                        setCustomization(prev => ({
                          ...prev,
                          layout: { ...prev.layout!, margins: value as any }
                        }))
                      }
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-600">
                        <SelectItem value="narrow" className="text-white">Narrow</SelectItem>
                        <SelectItem value="normal" className="text-white">Normal</SelectItem>
                        <SelectItem value="wide" className="text-white">Wide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-zinc-300 text-sm">Column Layout</Label>
                    <Select 
                      value={customization.layout?.columnLayout}
                      onValueChange={(value) => 
                        setCustomization(prev => ({
                          ...prev,
                          layout: { ...prev.layout!, columnLayout: value as any }
                        }))
                      }
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-600">
                        <SelectItem value="single" className="text-white">Single Column</SelectItem>
                        <SelectItem value="two-column" className="text-white">Two Columns</SelectItem>
                        <SelectItem value="three-column" className="text-white">Three Columns</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Document Sections */}
            <Card className="bg-zinc-900/80 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-400" />
                  Document Sections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { key: 'includeCoverPage', label: 'Cover Page' },
                    { key: 'includeTableOfContents', label: 'Table of Contents' },
                    { key: 'includeGlossary', label: 'Glossary' },
                    { key: 'includeAppendix', label: 'Appendix' },
                    { key: 'includeRevisionHistory', label: 'Revision History' },
                    { key: 'includeSignaturePage', label: 'Signature Page' },
                    { key: 'includeFeedbackQR', label: 'Feedback QR Code' }
                  ].map((section) => (
                    <div key={section.key} className="flex items-center space-x-2">
                      <Switch
                        checked={(customization.sections as any)?.[section.key]}
                        onCheckedChange={(checked) => 
                          setCustomization(prev => ({
                            ...prev,
                            sections: { ...prev.sections!, [section.key]: checked }
                          }))
                        }
                      />
                      <Label className="text-zinc-300 text-sm">{section.label}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Share Link Tab */}
          <TabsContent value="share" className="space-y-6">
            <Card className="bg-zinc-900/80 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-purple-400" />
                  Generate Share Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Access Control */}
                <div>
                  <Label className="text-zinc-300 font-medium mb-3 block">Access Control</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'public', label: 'Public Access', icon: Globe, desc: 'Anyone with link can view' },
                      { value: 'password-protected', label: 'Password Protected', icon: Lock, desc: 'Requires password' },
                      { value: 'time-limited', label: 'Time Limited', icon: Clock, desc: 'Expires after set time' },
                      { value: 'restricted', label: 'Restricted', icon: Shield, desc: 'Specific users only' }
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <motion.div
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            shareLinkOptions.access.type === option.value
                              ? "border-purple-500 bg-purple-500/10"
                              : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                          }`}
                          onClick={() => 
                            setShareLinkOptions(prev => ({
                              ...prev,
                              access: { ...prev.access, type: option.value as any }
                            }))
                          }
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-4 w-4 text-purple-400" />
                            <span className="text-white text-sm font-medium">{option.label}</span>
                          </div>
                          <p className="text-xs text-zinc-400">{option.desc}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Password Input */}
                {shareLinkOptions.access.type === 'password-protected' && (
                  <div>
                    <Label className="text-zinc-300 text-sm">Password</Label>
                    <Input
                      type="password"
                      value={shareLinkOptions.access.password || ""}
                      onChange={(e) => 
                        setShareLinkOptions(prev => ({
                          ...prev,
                          access: { ...prev.access, password: e.target.value }
                        }))
                      }
                      placeholder="Enter password"
                      className="bg-zinc-800 border-zinc-600 text-white mt-1"
                    />
                  </div>
                )}

                {/* Expiration Date */}
                {shareLinkOptions.access.type === 'time-limited' && (
                  <div>
                    <Label className="text-zinc-300 text-sm">Expires On</Label>
                    <Input
                      type="datetime-local"
                      onChange={(e) => 
                        setShareLinkOptions(prev => ({
                          ...prev,
                          access: { ...prev.access, expiresAt: new Date(e.target.value) }
                        }))
                      }
                      className="bg-zinc-800 border-zinc-600 text-white mt-1"
                    />
                  </div>
                )}

                {/* Permissions */}
                <div>
                  <Label className="text-zinc-300 font-medium mb-3 block">Viewer Permissions</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'canComment', label: 'Can Comment' },
                      { key: 'canSuggestEdits', label: 'Can Suggest Edits' },
                      { key: 'canDownload', label: 'Can Download' },
                      { key: 'canShare', label: 'Can Share' },
                      { key: 'canPrint', label: 'Can Print' },
                      { key: 'trackViewing', label: 'Track Viewing' }
                    ].map((permission) => (
                      <div key={permission.key} className="flex items-center space-x-2">
                        <Switch
                          checked={(shareLinkOptions.permissions as any)[permission.key]}
                          onCheckedChange={(checked) => 
                            setShareLinkOptions(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, [permission.key]: checked }
                            }))
                          }
                        />
                        <Label className="text-zinc-300 text-sm">{permission.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateShareLink}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Generate Share Link
                </Button>

                {/* Generated Link */}
                {generatedShareLink && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-900/20 border border-green-600/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-green-300 font-medium">Share Link Generated!</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={generatedShareLink}
                        readOnly
                        className="bg-zinc-800 border-zinc-600 text-white"
                      />
                      <Button
                        onClick={copyShareLink}
                        size="sm"
                        className={`${linkCopied ? 'bg-green-600' : 'bg-zinc-700'} hover:bg-zinc-600`}
                      >
                        {linkCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedExportPanel;
