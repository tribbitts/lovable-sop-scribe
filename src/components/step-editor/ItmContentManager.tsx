
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  GraduationCap, 
  FileText, 
  Users, 
  Info, 
  BookOpen,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { SopStep } from "@/types/sop";

interface ItmContentManagerProps {
  step: SopStep;
  onUpdateStep: (field: keyof SopStep, value: any) => void;
}

const ItmContentManager: React.FC<ItmContentManagerProps> = ({ step, onUpdateStep }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateItmContent = (field: string, value: string) => {
    const currentItmContent = step.itmOnlyContent || {};
    onUpdateStep("itmOnlyContent", {
      ...currentItmContent,
      [field]: value
    });
  };

  const toggleQuizItmOnly = (questionId: string, itmOnly: boolean) => {
    if (!step.quizQuestions) return;
    
    const updatedQuestions = step.quizQuestions.map(question => 
      question.id === questionId ? { ...question, itmOnly } : question
    );
    onUpdateStep("quizQuestions", updatedQuestions);
  };

  const toggleResourceItmOnly = (resourceId: string, itmOnly: boolean) => {
    if (!step.resources) return;
    
    const updatedResources = step.resources.map(resource => 
      resource.id === resourceId ? { ...resource, itmOnly } : resource
    );
    onUpdateStep("resources", updatedResources);
  };

  const toggleHealthcareContentItmOnly = (contentId: string, itmOnly: boolean) => {
    if (!step.healthcareContent) return;
    
    const updatedContent = step.healthcareContent.map(content => 
      content.id === contentId ? { ...content, itmOnly } : content
    );
    onUpdateStep("healthcareContent", updatedContent);
  };

  const hasItmContent = step.itmOnlyContent || 
    step.quizQuestions?.some(q => q.itmOnly) ||
    step.resources?.some(r => r.itmOnly) ||
    step.healthcareContent?.some(c => c.itmOnly);

  return (
    <Card className="bg-zinc-800/30 border-zinc-700">
      <CardHeader 
        className="cursor-pointer hover:bg-zinc-800/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Interactive Training Content</h4>
              <p className="text-sm text-zinc-400">Manage ITM-only vs. PDF content</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasItmContent && (
              <Badge className="bg-purple-600 text-white text-xs">
                ITM Content Added
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-zinc-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-400 mb-1">Content Distribution Guide</h5>
                <p className="text-sm text-blue-200">
                  <strong>PDF Document:</strong> Core procedures, safety alerts, essential steps
                  <br />
                  <strong>ITM-Only:</strong> Detailed explanations, quizzes, interactive scenarios
                </p>
              </div>
            </div>
          </div>

          {/* ITM-Only Text Content */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-400" />
              <h5 className="font-medium text-white">ITM-Only Learning Content</h5>
            </div>

            <div>
              <Label className="text-zinc-300 text-sm">Detailed Learning Rationale</Label>
              <Textarea
                value={step.itmOnlyContent?.detailedRationale || ""}
                onChange={(e) => updateItmContent("detailedRationale", e.target.value)}
                placeholder="Explain the 'why' behind this step - detailed reasoning, background context, learning objectives..."
                className="bg-zinc-800 border-zinc-700 text-white mt-1 min-h-[80px]"
              />
              <p className="text-xs text-zinc-500 mt-1">
                This content will only appear in the interactive training module
              </p>
            </div>

            <div>
              <Label className="text-zinc-300 text-sm">Additional Context for Learning</Label>
              <Textarea
                value={step.itmOnlyContent?.additionalContext || ""}
                onChange={(e) => updateItmContent("additionalContext", e.target.value)}
                placeholder="Extra context, tips, common mistakes, best practices..."
                className="bg-zinc-800 border-zinc-700 text-white mt-1 min-h-[60px]"
              />
            </div>
          </div>

          <Separator className="bg-zinc-700" />

          {/* Quiz Questions ITM Tagging */}
          {step.quizQuestions && step.quizQuestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-400" />
                <h5 className="font-medium text-white">Quiz Questions</h5>
              </div>
              
              {step.quizQuestions.map((question) => (
                <div key={question.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-zinc-200 truncate">
                      {question.question}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-zinc-400">ITM-Only</Label>
                    <Switch
                      checked={question.itmOnly || false}
                      onCheckedChange={(checked) => toggleQuizItmOnly(question.id, checked)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resources ITM Tagging */}
          {step.resources && step.resources.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                <h5 className="font-medium text-white">Additional Resources</h5>
              </div>
              
              {step.resources.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-zinc-200 truncate">
                      {resource.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-zinc-400">ITM-Only</Label>
                    <Switch
                      checked={resource.itmOnly || false}
                      onCheckedChange={(checked) => toggleResourceItmOnly(resource.id, checked)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Healthcare Content ITM Tagging */}
          {step.healthcareContent && step.healthcareContent.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <h5 className="font-medium text-white">Healthcare Content</h5>
              </div>
              
              {step.healthcareContent.map((content) => (
                <div key={content.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${
                        content.priority === 'high' ? 'bg-red-600' :
                        content.priority === 'medium' ? 'bg-orange-600' : 'bg-yellow-600'
                      }`}>
                        {content.type}
                      </Badge>
                      <p className="text-sm text-zinc-200 truncate">
                        {content.content.substring(0, 50)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-zinc-400">ITM-Only</Label>
                    <Switch
                      checked={content.itmOnly || false}
                      onCheckedChange={(checked) => toggleHealthcareContentItmOnly(content.id, checked)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ItmContentManager;
