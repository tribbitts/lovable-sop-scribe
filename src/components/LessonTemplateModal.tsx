import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LucideIcon,
  MessageSquare,
  SlidersHorizontal,
  Type,
  Video,
  HelpCircle,
  Shield,
  AlertTriangle
} from "lucide-react";
import { SopDocument } from "@/types/sop";
import { createBasicSOP } from "@/services/basic-sop-template";
import { createTrainingModuleSOP } from "@/services/training-module-template";
import { createHealthcareSOP } from "@/services/healthcare-sop-template";
import { createComplianceChecklistSOP } from "@/services/compliance-checklist-template";
import { createTroubleshootingGuideSOP } from "@/services/troubleshooting-guide-template";
import { createPatientCommunicationSOP } from "@/services/patient-communication-template";
import { 
  createNewHireOnboardingSOP, 
  createContinuedLearningSOP, 
  createCommunicationExcellenceSOP,
  healthcareThemes 
} from "@/services/enhanced-healthcare-templates";

interface LessonTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: SopDocument) => void;
}

const LessonTemplateModal: React.FC<LessonTemplateModalProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const templates = [
    {
      id: "basic-sop",
      title: "Basic SOP",
      description: "A simple, step-by-step guide for standard operating procedures.",
      icon: "LayoutDashboard",
      category: "General",
      features: [
        "Step-by-step instructions",
        "Clear and concise language",
        "Easy to customize",
        "Suitable for any industry"
      ]
    },
    {
      id: "training-module",
      title: "Training Module",
      description: "An interactive training module with quizzes and progress tracking.",
      icon: "GraduationCap",
      category: "Training",
      features: [
        "Interactive quizzes",
        "Progress tracking",
        "Multimedia support",
        "Certification options"
      ],
      isNew: true
    },
    {
      id: "healthcare-new-hire",
      title: "Healthcare New Hire Onboarding",
      description: "Comprehensive onboarding for new healthcare staff with patient-first philosophy and critical compliance training.",
      icon: "Shield",
      category: "Healthcare",
      features: [
        "Patient-centered care principles",
        "HIPAA & privacy compliance",
        "Emergency protocols",
        "Systems navigation training",
        "Critical safety alerts",
        "Progress certification"
      ],
      isHealthcare: true,
      isNew: true,
      theme: healthcareThemes["new-hire-onboarding"]
    },
    {
      id: "healthcare-continued-learning",
      title: "Healthcare Continued Learning",
      description: "Professional development updates for experienced healthcare staff with evidence-based practices.",
      icon: "BookOpen",
      category: "Healthcare",
      features: [
        "Evidence-based practice updates",
        "Quality improvement initiatives",
        "Professional development",
        "Scenario-based learning",
        "Compliance tracking"
      ],
      isHealthcare: true,
      theme: healthcareThemes["continued-learning"]
    },
    {
      id: "healthcare-communication",
      title: "Patient Communication Excellence",
      description: "Advanced communication skills training with therapeutic techniques and cultural competency.",
      icon: "MessageSquare",
      category: "Healthcare",
      features: [
        "Therapeutic communication",
        "De-escalation techniques",
        "Cultural competency",
        "Difficult conversations",
        "Empathy training",
        "Interactive scenarios"
      ],
      isHealthcare: true,
      isNew: true,
      theme: healthcareThemes["communication-excellence"]
    },
    {
      id: "compliance-checklist",
      title: "Compliance Checklist",
      description: "A detailed checklist to ensure compliance with industry regulations.",
      icon: "ListChecks",
      category: "Compliance",
      features: [
        "Regulatory compliance",
        "Audit readiness",
        "Risk assessment",
        "Documentation"
      ]
    },
    {
      id: "troubleshooting-guide",
      title: "Troubleshooting Guide",
      description: "A guide to quickly resolve common issues and problems.",
      icon: "HelpCircle",
      category: "Technical",
      features: [
        "Problem resolution",
        "Step-by-step solutions",
        "FAQ section",
        "Technical support"
      ]
    },
    {
      id: "patient-communication",
      title: "Patient Communication Protocol",
      description: "Comprehensive healthcare communication training with empathy techniques, difficult conversations, and scenario-based learning",
      icon: "MessageSquare",
      category: "Healthcare",
      features: [
        "Empathy & active listening techniques",
        "Difficult conversation management", 
        "Cultural sensitivity training",
        "De-escalation strategies",
        "Patient safety protocols",
        "Interactive healthcare scenarios"
      ],
      isNew: true,
      isHealthcare: true
    }
  ];

  const filteredTemplates = templates.filter((template) => {
    const searchTermMatch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === "All" || template.category === selectedCategory;
    return searchTermMatch && categoryMatch;
  });

  const handleTemplateSelect = (templateId: string) => {
    let templateSOP: SopDocument;
    
    switch (templateId) {
      case "basic-sop":
        templateSOP = createBasicSOP();
        break;
      case "training-module":
        templateSOP = createTrainingModuleSOP();
        break;
      case "healthcare-new-hire":
        templateSOP = createNewHireOnboardingSOP();
        break;
      case "healthcare-continued-learning":
        templateSOP = createContinuedLearningSOP();
        break;
      case "healthcare-communication":
        templateSOP = createCommunicationExcellenceSOP();
        break;
      case "compliance-checklist":
        templateSOP = createComplianceChecklistSOP();
        break;
      case "troubleshooting-guide":
        templateSOP = createTroubleshootingGuideSOP();
        break;
      case "patient-communication":
        templateSOP = createPatientCommunicationSOP();
        break;
      default:
        return;
    }
    
    onSelectTemplate(templateSOP);
    onClose();
  };

  const getIconComponent = (iconName: string): LucideIcon => {
    switch (iconName) {
      case "LayoutDashboard":
        return LayoutDashboard;
      case "GraduationCap":
        return GraduationCap;
      case "Shield":
        return Shield;
      case "ListChecks":
        return ListChecks;
      case "HelpCircle":
        return HelpCircle;
      case "MessageSquare":
        return MessageSquare;
      default:
        return LayoutDashboard;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-[#1E1E1E] border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white">Choose a Template</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Select a template to quickly create a new SOP document.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <Input
            type="search"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <div className="flex space-x-4 mb-4">
          <Button
            variant={selectedCategory === "All" ? "secondary" : "outline"}
            onClick={() => handleCategoryChange("All")}
          >
            All Categories
          </Button>
          <Button
            variant={selectedCategory === "General" ? "secondary" : "outline"}
            onClick={() => handleCategoryChange("General")}
          >
            General
          </Button>
          <Button
            variant={selectedCategory === "Training" ? "secondary" : "outline"}
            onClick={() => handleCategoryChange("Training")}
          >
            Training
          </Button>
          <Button
            variant={selectedCategory === "Healthcare" ? "secondary" : "outline"}
            onClick={() => handleCategoryChange("Healthcare")}
          >
            Healthcare
          </Button>
          <Button
            variant={selectedCategory === "Compliance" ? "secondary" : "outline"}
            onClick={() => handleCategoryChange("Compliance")}
          >
            Compliance
          </Button>
          <Button
            variant={selectedCategory === "Technical" ? "secondary" : "outline"}
            onClick={() => handleCategoryChange("Technical")}
          >
            Technical
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const Icon = getIconComponent(template.icon);
            const hasTheme = template.theme;
            return (
              <Card
                key={template.id}
                className={`bg-[#2A2A2A] border-zinc-700 hover:bg-zinc-700/20 transition-colors cursor-pointer relative overflow-hidden ${
                  hasTheme ? 'border-l-4' : ''
                }`}
                style={hasTheme ? { borderLeftColor: template.theme.primaryColor } : {}}
                onClick={() => handleTemplateSelect(template.id)}
              >
                {hasTheme && (
                  <div 
                    className="absolute top-0 right-0 w-16 h-16 opacity-10"
                    style={{
                      background: `linear-gradient(135deg, ${template.theme.primaryColor}, ${template.theme.secondaryColor})`
                    }}
                  />
                )}
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <Icon 
                      className="h-4 w-4" 
                      style={hasTheme ? { color: template.theme.primaryColor } : { color: '#9CA3AF' }}
                    />
                    <CardTitle className="text-sm font-medium text-zinc-200">
                      {template.title}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1">
                    {template.isNew && (
                      <Badge variant="secondary" className="uppercase text-xs">
                        New
                      </Badge>
                    )}
                    {hasTheme && (
                      <Badge 
                        className="text-xs text-white"
                        style={{ backgroundColor: template.theme.primaryColor }}
                      >
                        {template.theme.name}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400">{template.description}</p>
                  <Separator className="my-2 bg-zinc-700" />
                  <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                    {template.features.map((feature, index) => (
                      <li key={index} className="text-xs">{feature}</li>
                    ))}
                  </ul>
                  {hasTheme && (
                    <div className="mt-3 flex gap-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: template.theme.primaryColor }}
                        title="Primary Color"
                      />
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: template.theme.secondaryColor }}
                        title="Secondary Color"
                      />
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: template.theme.accentColor }}
                        title="Accent Color"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LessonTemplateModal;
