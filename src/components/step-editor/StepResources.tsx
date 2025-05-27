import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, ExternalLink, FileText, Video, Link2, GraduationCap } from "lucide-react";
import { SopStep, StepResource } from "@/types/sop";

interface StepResourcesProps {
  step: SopStep;
  onUpdateResources: (resources: StepResource[]) => void;
}

const StepResources: React.FC<StepResourcesProps> = ({ step, onUpdateResources }) => {
  const [newResource, setNewResource] = useState({
    title: "",
    url: "",
    description: "",
    type: "link" as const,
    itmOnly: false
  });

  const addResource = () => {
    if (!newResource.title.trim() || !newResource.url.trim()) return;

    const resource: StepResource = {
      id: Date.now().toString(),
      ...newResource
    };

    const updatedResources = [...(step.resources || []), resource];
    onUpdateResources(updatedResources);

    // Reset form
    setNewResource({
      title: "",
      url: "",
      description: "",
      type: "link",
      itmOnly: false
    });
  };

  const removeResource = (resourceId: string) => {
    const updatedResources = (step.resources || []).filter(r => r.id !== resourceId);
    onUpdateResources(updatedResources);
  };

  const toggleResourceItmOnly = (resourceId: string) => {
    const updatedResources = (step.resources || []).map(resource => 
      resource.id === resourceId 
        ? { ...resource, itmOnly: !resource.itmOnly }
        : resource
    );
    onUpdateResources(updatedResources);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video": return Video;
      case "document": return FileText;
      default: return Link2;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ExternalLink className="h-5 w-5 text-blue-400" />
        <h4 className="font-semibold text-blue-400">Additional Resources</h4>
        <Badge className="bg-blue-600 text-white text-xs">
          Reference Materials
        </Badge>
      </div>

      {/* Existing Resources */}
      {step.resources && step.resources.length > 0 && (
        <div className="space-y-3">
          {step.resources.map((resource) => {
            const Icon = getResourceIcon(resource.type);
            return (
              <Card key={resource.id} className="bg-zinc-800/50 border-zinc-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-blue-400" />
                      <h5 className="text-sm font-medium text-zinc-200">
                        {resource.title}
                      </h5>
                      <Badge className="bg-zinc-700 text-zinc-300 text-xs">
                        {resource.type}
                      </Badge>
                      {resource.itmOnly ? (
                        <Badge className="bg-purple-600 text-white text-xs">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          ITM-Only
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-600 text-white text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          PDF + ITM
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-zinc-400">ITM-Only</Label>
                        <Switch
                          checked={resource.itmOnly || false}
                          onCheckedChange={() => toggleResourceItmOnly(resource.id)}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeResource(resource.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {resource.description && (
                    <p className="text-sm text-zinc-400 mb-2">{resource.description}</p>
                  )}
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm underline flex items-center gap-1"
                  >
                    {resource.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add New Resource */}
      <Card className="bg-zinc-800/30 border-zinc-700">
        <CardHeader>
          <h5 className="text-sm font-medium text-zinc-300">Add New Resource</h5>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300">Title</Label>
              <Input
                value={newResource.title}
                onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Resource title..."
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-zinc-300">Type</Label>
              <select
                value={newResource.type}
                onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full mt-1 bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2"
              >
                <option value="link">Link</option>
                <option value="document">Document</option>
                <option value="video">Video</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="text-zinc-300">URL</Label>
            <Input
              value={newResource.url}
              onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://..."
              className="bg-zinc-800 border-zinc-700 text-white mt-1"
            />
          </div>

          <div>
            <Label className="text-zinc-300">Description (Optional)</Label>
            <Textarea
              value={newResource.description}
              onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this resource..."
              className="bg-zinc-800 border-zinc-700 text-white mt-1"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
            <div>
              <Label className="text-zinc-300">Content Destination</Label>
              <p className="text-xs text-zinc-500">
                {newResource.itmOnly 
                  ? "Resource will only appear in interactive training module" 
                  : "Resource will appear in both PDF and interactive training"
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-zinc-400">ITM-Only</Label>
              <Switch
                checked={newResource.itmOnly}
                onCheckedChange={(checked) => setNewResource(prev => ({ ...prev, itmOnly: checked }))}
              />
            </div>
          </div>

          <Button
            onClick={addResource}
            disabled={!newResource.title.trim() || !newResource.url.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepResources;
