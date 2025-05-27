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
      id: "healthcare-sop",
      title: "Healthcare SOP",
      description: "A specialized SOP for healthcare procedures with compliance and safety guidelines.",
      icon: "Shield",
      category: "Healthcare",
      features: [
        "Compliance guidelines",
        "Safety protocols",
        "Patient care standards",
        "HIPAA compliance"
      ],
      isHealthcare: true
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
      case "healthcare-sop":
        templateSOP = createHealthcareSOP();
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
            return (
              <Card
                key={template.id}
                className="bg-[#2A2A2A] border-zinc-700 hover:bg-zinc-700/20 transition-colors cursor-pointer"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-zinc-400" />
                    <CardTitle className="text-sm font-medium text-zinc-200">
                      {template.title}
                    </CardTitle>
                  </div>
                  {template.isNew && (
                    <Badge variant="secondary" className="uppercase">
                      New
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400">{template.description}</p>
                  <Separator className="my-2 bg-zinc-700" />
                  <ul className="list-disc list-inside text-sm text-zinc-400">
                    {template.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
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
