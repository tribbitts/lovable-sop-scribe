import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, MessageCircle, Plus, X } from "lucide-react";
import { HealthcareContent, HealthcareContentType } from "@/types/sop";
import { v4 as uuidv4 } from "uuid";

interface HealthcareContentEditorProps {
  content: HealthcareContent[];
  onChange: (content: HealthcareContent[]) => void;
}

const contentTypeConfig = {
  "critical-safety": {
    label: "Critical Patient Safety Note",
    icon: AlertTriangle,
    color: "bg-red-600",
    borderColor: "border-red-500",
    description: "Critical safety information that directly impacts patient care"
  },
  "hipaa-alert": {
    label: "HIPAA Alert",
    icon: Shield,
    color: "bg-blue-600",
    borderColor: "border-blue-500",
    description: "Privacy and compliance requirements"
  },
  "patient-communication": {
    label: "Patient Communication Tip",
    icon: MessageCircle,
    color: "bg-green-600",
    borderColor: "border-green-500",
    description: "Best practices for patient interaction"
  },
  "standard": {
    label: "Standard Note",
    icon: MessageCircle,
    color: "bg-gray-600",
    borderColor: "border-gray-500",
    description: "General information"
  }
};

const HealthcareContentEditor: React.FC<HealthcareContentEditorProps> = ({ content, onChange }) => {
  const [newContent, setNewContent] = useState<HealthcareContent>({
    id: "",
    type: "standard",
    content: "",
    priority: "medium"
  });

  const addHealthcareContent = () => {
    if (newContent.content.trim()) {
      const contentItem: HealthcareContent = {
        ...newContent,
        id: uuidv4()
      };
      onChange([...content, contentItem]);
      setNewContent({
        id: "",
        type: "standard",
        content: "",
        priority: "medium"
      });
    }
  };

  const removeContent = (id: string) => {
    onChange(content.filter(item => item.id !== id));
  };

  const updateContent = (id: string, updates: Partial<HealthcareContent>) => {
    onChange(content.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  return (
    <Card className="bg-[#1E1E1E] border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-400" />
          Healthcare Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Content */}
        {content.map((item) => {
          const config = contentTypeConfig[item.type];
          const IconComponent = config.icon;
          
          return (
            <div key={item.id} className={`p-4 rounded-lg border-l-4 ${config.borderColor} bg-zinc-900/50`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4 text-white" />
                  <Badge className={`${config.color} text-white text-xs`}>
                    {config.label}
                  </Badge>
                  <Badge variant="outline" className="text-zinc-400 border-zinc-600 text-xs">
                    {item.priority}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeContent(item.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={item.content}
                onChange={(e) => updateContent(item.id, { content: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white min-h-[80px]"
                placeholder={`Enter ${config.label.toLowerCase()}...`}
              />
            </div>
          );
        })}

        {/* Add New Content */}
        <div className="p-4 border-2 border-dashed border-zinc-700 rounded-lg">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Select
                value={newContent.type}
                onValueChange={(value: HealthcareContentType) => 
                  setNewContent(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {Object.entries(contentTypeConfig).map(([type, config]) => (
                    <SelectItem key={type} value={type} className="text-white hover:bg-zinc-700">
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={newContent.priority}
                onValueChange={(value: "high" | "medium" | "low") => 
                  setNewContent(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="high" className="text-white hover:bg-zinc-700">High</SelectItem>
                  <SelectItem value="medium" className="text-white hover:bg-zinc-700">Medium</SelectItem>
                  <SelectItem value="low" className="text-white hover:bg-zinc-700">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              value={newContent.content}
              onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
              placeholder={`Enter ${contentTypeConfig[newContent.type].label.toLowerCase()}...`}
              className="bg-zinc-800 border-zinc-700 text-white min-h-[80px]"
            />

            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">
                {contentTypeConfig[newContent.type].description}
              </p>
              <Button
                onClick={addHealthcareContent}
                disabled={!newContent.content.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthcareContentEditor;
