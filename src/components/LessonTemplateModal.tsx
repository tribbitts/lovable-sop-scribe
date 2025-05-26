import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, HelpCircle, Users, Target, ArrowRight, UserPlus, Shield, MessageCircle, ArrowLeft } from "lucide-react";
import { HealthcareTemplateService } from "@/services/healthcare-template-service";
import { HealthcareTemplate } from "@/types/healthcare-templates";
import { HealthcareTemplateIntegration } from "@/components/healthcare/HealthcareTemplateIntegration";

interface LessonTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateType: "standard" | "knowledge-check" | "scenario" | "resource-focus") => void;
  onSelectHealthcareTemplate?: (templateId: string) => void;
}

export const LessonTemplateModal: React.FC<LessonTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onSelectHealthcareTemplate
}) => {
  const [selectedTab, setSelectedTab] = useState("standard");
  const [selectedHealthcareTemplate, setSelectedHealthcareTemplate] = useState<HealthcareTemplate | null>(null);

  const standardTemplates = [
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

  const healthcareTemplates = HealthcareTemplateService.getAllTemplates();

  const getHealthcareIcon = (iconName: string) => {
    switch (iconName) {
      case "UserPlus": return UserPlus;
      case "BookOpen": return BookOpen;
      case "Shield": return Shield;
      case "MessageCircle": return MessageCircle;
      default: return BookOpen;
    }
  };

  const getCategoryBadge = (category: HealthcareTemplate['category']) => {
    const categoryConfig = {
      "onboarding": { label: "New Hire", color: "bg-blue-600" },
      "continued-learning": { label: "Updates", color: "bg-green-600" },
      "communication": { label: "Communication", color: "bg-purple-600" },
      "safety": { label: "Safety", color: "bg-red-600" }
    };
    
    const config = categoryConfig[category];
    return (
      <Badge className={`${config.color} text-white text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const handleHealthcareTemplateSelect = (template: HealthcareTemplate) => {
    setSelectedHealthcareTemplate(template);
  };

  const handleApplyHealthcareTemplate = (templateId: string) => {
    onSelectHealthcareTemplate?.(templateId);
    onClose();
  };

  const handleBackToTemplates = () => {
    setSelectedHealthcareTemplate(null);
  };

  const renderTemplateCard = (template: any, onClick: () => void, isHealthcare = false) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 cursor-pointer hover:border-purple-600/50 hover:bg-zinc-800/80 transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
          {isHealthcare ? (
            React.createElement(getHealthcareIcon(template.icon), { className: "h-6 w-6 text-white" })
          ) : (
            <template.icon className="h-6 w-6 text-white" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
              {isHealthcare ? template.name : template.title}
            </h4>
            {isHealthcare && getCategoryBadge(template.category)}
          </div>
          <p className="text-sm text-zinc-400 mb-3">{template.description}</p>
          
          <div className="flex flex-wrap gap-1">
            {(isHealthcare ? 
              [`${template.sections.length} sections`, `${template.sections.reduce((acc, s) => acc + (s.estimatedTime || 0), 0)} min`] :
              template.features
            ).map((feature, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-zinc-700/50 rounded text-zinc-300">
                {feature}
              </span>
            ))}
          </div>
        </div>
        
        <ArrowRight className="h-5 w-5 text-zinc-500 group-hover:text-purple-400 transition-colors" />
      </div>
    </motion.div>
  );

  if (selectedHealthcareTemplate) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1E1E1E] rounded-2xl border border-zinc-800 p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <HealthcareTemplateIntegration
                template={selectedHealthcareTemplate}
                onApplyTemplate={handleApplyHealthcareTemplate}
                onCancel={handleBackToTemplates}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#1E1E1E] rounded-2xl border border-zinc-800 p-6 max-w-5xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Choose a Lesson Template</h3>
              <p className="text-zinc-400">Select the best structure for your content to maximize learning effectiveness</p>
            </div>
            
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                <TabsTrigger value="standard" className="text-zinc-300 data-[state=active]:text-white">
                  Standard Templates
                </TabsTrigger>
                <TabsTrigger value="healthcare" className="text-zinc-300 data-[state=active]:text-white">
                  Healthcare Templates
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="standard" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {standardTemplates.map((template) => 
                    renderTemplateCard(template, () => onSelectTemplate(template.type))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="healthcare" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {healthcareTemplates.map((template) => 
                    renderTemplateCard(
                      template, 
                      () => handleHealthcareTemplateSelect(template),
                      true
                    )
                  )}
                </div>
                {healthcareTemplates.length === 0 && (
                  <div className="text-center py-8 text-zinc-400">
                    Healthcare templates will be available here
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-zinc-500">
                💡 Tip: Healthcare templates include pre-configured sections optimized for patient care training
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => onSelectTemplate("standard")}
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
};
