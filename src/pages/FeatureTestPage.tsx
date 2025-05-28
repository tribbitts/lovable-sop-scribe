import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Import the new components
import EnhancedCalloutOverlay from "@/components/enhanced-annotations/EnhancedCalloutOverlay";
import EnhancedExportPanel from "@/components/export/EnhancedExportPanel";
import LivingSOPPanel from "@/components/collaboration/LivingSOPPanel";
import TemplateMarketplace from "@/components/templates/TemplateMarketplace";
import TemplateBuilder from "@/components/templates/TemplateBuilder";

// Mock data for testing
const mockDocument = {
  id: "test-doc",
  title: "Test SOP Document",
  description: "A test document for trying new features",
  topic: "Testing",
  companyName: "SOPify Demo",
  date: new Date().toISOString(),
  logo: "",
  steps: [
    {
      id: "step-1",
      title: "First Step",
      description: "This is a test step for demonstration",
      instructions: "Follow these instructions carefully",
      estimatedTime: 10,
      screenshot: "/api/placeholder/800/600",
      contentBlocks: []
    },
    {
      id: "step-2", 
      title: "Second Step",
      description: "Another test step",
      instructions: "Continue with the process",
      estimatedTime: 15,
      screenshot: "",
      contentBlocks: []
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: "admin-user"
};

const FeatureTestPage: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState("callouts");
  const [showLivingPanel, setShowLivingPanel] = useState(false);

  const features = [
    {
      id: "callouts",
      name: "Advanced Callouts",
      phase: "Phase 1",
      status: "Ready for Testing",
      description: "Enhanced screenshot annotation with new shapes, effects, and styling options"
    },
    {
      id: "export",
      name: "Enhanced Export",
      phase: "Phase 3", 
      status: "Ready for Testing",
      description: "Advanced PDF/HTML customization, branding, and share link generation"
    },
    {
      id: "collaboration",
      name: "Living SOP Features",
      phase: "Phase 4",
      status: "Ready for Testing", 
      description: "Real-time collaboration, comments, suggestions, and change tracking"
    },
    {
      id: "marketplace",
      name: "Template Marketplace",
      phase: "Phase 5",
      status: "Ready for Testing",
      description: "Browse and discover professional SOP templates"
    },
    {
      id: "builder",
      name: "Template Builder", 
      phase: "Phase 5",
      status: "Ready for Testing",
      description: "Create professional SOP templates with guided wizard"
    }
  ];

  const renderFeatureDemo = () => {
    switch (activeFeature) {
      case "callouts":
        return (
          <div className="relative">
            <div className="mb-4 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
              <h3 className="text-blue-300 font-medium mb-2">Testing Instructions:</h3>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>• Click on the image below to start adding callouts</li>
                <li>• Try the new shapes: Oval, Polygon, Freehand drawing</li>
                <li>• Use the advanced styling panel for colors and effects</li>
                <li>• Test blur and magnifier tools (visual mockups)</li>
              </ul>
            </div>
            <div className="relative bg-zinc-800 rounded-lg overflow-hidden">
              <img 
                src="/api/placeholder/800/600" 
                alt="Test screenshot for callouts"
                className="w-full"
              />
              <EnhancedCalloutOverlay
                imageUrl="/api/placeholder/800/600"
                callouts={[]}
                onCalloutsChange={(callouts) => console.log("Callouts updated:", callouts)}
                isEditing={true}
              />
            </div>
          </div>
        );

      case "export":
        return (
          <div>
            <div className="mb-4 p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
              <h3 className="text-green-300 font-medium mb-2">Testing Instructions:</h3>
              <ul className="text-green-200 text-sm space-y-1">
                <li>• Explore the enhanced export options and branding</li>
                <li>• Try generating share links with different access controls</li>
                <li>• Test the template selection and customization</li>
                <li>• Preview different export formats and settings</li>
              </ul>
            </div>
            <EnhancedExportPanel
              document={mockDocument}
              onExport={(format, options) => {
                console.log("Export requested:", { format, options });
                alert(`Export initiated: ${format} format with advanced options`);
              }}
              onGenerateShareLink={(options) => {
                console.log("Share link options:", options);
                return Promise.resolve(`https://sopify.app/share/${Math.random().toString(36).substr(2, 9)}`);
              }}
              exportProgress="Processing..."
              availableTemplates={[
                {
                  id: "template-1",
                  name: "Corporate Template",
                  description: "Professional corporate styling",
                  customization: {
                    brandKit: {
                      primaryColor: "#007AFF",
                      secondaryColor: "#5856D6", 
                      accentColor: "#FF6B6B",
                      fontFamily: "system"
                    }
                  }
                }
              ]}
            />
          </div>
        );

      case "collaboration":
        return (
          <div>
            <div className="mb-4 p-4 bg-purple-900/20 border border-purple-600/30 rounded-lg">
              <h3 className="text-purple-300 font-medium mb-2">Testing Instructions:</h3>
              <ul className="text-purple-200 text-sm space-y-1">
                <li>• Click the button below to open the Living SOP panel</li>
                <li>• Test adding comments and suggestions</li>
                <li>• Explore the analytics and activity tracking</li>
                <li>• Try the different collaboration features</li>
              </ul>
            </div>
            <div className="text-center py-8">
              <Button 
                onClick={() => setShowLivingPanel(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Open Living SOP Panel
              </Button>
            </div>
            <LivingSOPPanel
              document={mockDocument}
              isOpen={showLivingPanel}
              onClose={() => setShowLivingPanel(false)}
              currentUser={{
                id: "admin-user",
                name: "Admin User",
                email: "admin@sopify.app"
              }}
              onAddComment={(comment) => console.log("New comment:", comment)}
              onAddSuggestion={(suggestion) => console.log("New suggestion:", suggestion)}
            />
          </div>
        );

      case "marketplace":
        return (
          <div>
            <div className="mb-4 p-4 bg-orange-900/20 border border-orange-600/30 rounded-lg">
              <h3 className="text-orange-300 font-medium mb-2">Testing Instructions:</h3>
              <ul className="text-orange-200 text-sm space-y-1">
                <li>• Browse featured templates and collections</li>
                <li>• Test the search and filtering functionality</li>
                <li>• Explore different categories and industries</li>
                <li>• Try favoriting and previewing templates</li>
              </ul>
            </div>
            <TemplateMarketplace
              onTemplateSelect={(template) => {
                console.log("Template selected:", template);
                alert(`Selected template: ${template.name}`);
              }}
              onTemplatePreview={(template) => {
                console.log("Template preview:", template);
                alert(`Previewing: ${template.name}`);
              }}
              currentUser={{
                id: "admin-user",
                name: "Admin User", 
                favorites: [],
                downloads: []
              }}
            />
          </div>
        );

      case "builder":
        return (
          <div>
            <div className="mb-4 p-4 bg-cyan-900/20 border border-cyan-600/30 rounded-lg">
              <h3 className="text-cyan-300 font-medium mb-2">Testing Instructions:</h3>
              <ul className="text-cyan-200 text-sm space-y-1">
                <li>• Follow the 7-step template creation wizard</li>
                <li>• Test the step builder and validation system</li>
                <li>• Try the auto-save functionality</li>
                <li>• Explore the preview and publishing options</li>
              </ul>
            </div>
            <TemplateBuilder
              onSave={(template) => {
                console.log("Template saved:", template);
                alert("Template saved successfully!");
              }}
              onPublish={(template) => {
                console.log("Template published:", template);
                alert("Template published to marketplace!");
              }}
              onPreview={(template) => {
                console.log("Template preview:", template);
                alert("Opening template preview...");
              }}
            />
          </div>
        );

      default:
        return <div className="text-center py-8 text-zinc-400">Select a feature to test</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-purple-900/10 to-zinc-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🧪 SOPify Features Testing Lab</h1>
          <p className="text-zinc-400">
            Test all the new enhanced features that are ready but not yet integrated into the main application.
          </p>
        </div>

        {/* Feature Selection */}
        <Card className="bg-zinc-900/80 border-zinc-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Available Features for Testing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature) => (
                <motion.div
                  key={feature.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    activeFeature === feature.id
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                  }`}
                  onClick={() => setActiveFeature(feature.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {feature.phase}
                    </Badge>
                    <Badge className="text-xs bg-green-600">
                      {feature.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feature.name}</h3>
                  <p className="text-zinc-400 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feature Demo Area */}
        <div className="space-y-6">
          {renderFeatureDemo()}
        </div>

        {/* Integration Status */}
        <Card className="bg-zinc-900/80 border-zinc-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">✅ Phase 2: Enhanced Content Blocks</span>
                <Badge className="bg-green-600">Live in Editor</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">🧪 Phase 1: Advanced Callouts</span>
                <Badge variant="outline">Testing Mode</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">🧪 Phase 3: Enhanced Export</span>
                <Badge variant="outline">Testing Mode</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">🧪 Phase 4: Living SOP Features</span>
                <Badge variant="outline">Testing Mode</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">🧪 Phase 5: Template Ecosystem</span>
                <Badge variant="outline">Testing Mode</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeatureTestPage; 