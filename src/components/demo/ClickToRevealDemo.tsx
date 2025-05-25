import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScreenshotData, Callout } from "@/types/sop";
import CalloutOverlay from "../step-editor/CalloutOverlay";
import { Camera, Play, RotateCcw, Sparkles, Eye, MessageCircle } from "lucide-react";

const ClickToRevealDemo: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Sample screenshot data with click-to-reveal callouts
  const demoScreenshots: ScreenshotData[] = [
    {
      id: "demo-1",
      dataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMUYyOTM3Ii8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9Ijc4MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzM3NDE1MSIgcng9IjgiLz4KPHN2ZyB4PSIzMCIgeT0iMjUiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMTIgMmwtMy4wOSAzLjA5TDYgMkgybDMuMDkgMy4wOUwyIDEyaDRsMS45MS0xLjkxTDEyIDEyaDR2LTRsLTMuMDktMy4wOUwxNiAyaDR2MTBIMThWNmgtMi4wOUwxNCA3LjkxIDEyIDZWMnptNiAxMGgtNHY0aDR2LTR6Ii8+Cjwvc3ZnPgo8dGV4dCB4PSI3MCIgeT0iNDUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iI0Y5RkFGQiI+U09QIENyZWF0b3IgRGFzaGJvYXJkPC90ZXh0Pgo8cmVjdCB4PSI1MCIgeT0iMTAwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iIzM3NDE1MSIgcng9IjEyIi8+Cjx0ZXh0IHg9IjcwIiB5PSIxMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iI0Y5RkFGQiI+Q3JlYXRlIE5ldyBTT1A8L3RleHQ+CjxyZWN0IHg9IjcwIiB5PSIxNTAiIHdpZHRoPSIyNjAiIGhlaWdodD0iNDAiIGZpbGw9IiM4QjVDRjYiIHJ4PSI4Ii8+Cjx0ZXh0IHg9IjE5MCIgeT0iMTc1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIj5TdGFydCBOZXcgUHJvamVjdDwvdGV4dD4KPHN2ZyB4PSI0MDAiIHk9IjEwMCIgd2lkdGg9IjM1MCIgaGVpZ2h0PSIyNTAiPgo8cmVjdCB3aWR0aD0iMzUwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iIzM3NDE1MSIgcng9IjEyIi8+Cjx0ZXh0IHg9IjIwIiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjRjlGQUZCIj5SZWF0bCBQcm9qZWN0czwvdGV4dD4KPHI20ctCB4PSIyMCIgeT0iNTAiIHdpZHRoPSIzMTAiIGhlaWdodD0iNDAiIGZpbGw9IiM0Qjc5QTEiIHJ4PSI0Ii8+Cjx0ZXh0IHg9IjMwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSI+VHJhaW5pbmcgTW9kdWxlOiBPbmJvYXJkaW5nPC90ZXh0Pgo8cmVjdCB4PSIyMCIgeT0iMTAwIiB3aWR0aD0iMzEwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNkI3MjgwIiByeD0iNCIvPgo8dGV4dCB4PSIzMCIgeT0iMTI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIj5Tb2Z0d2FyZSBJbnN0YWxsYXRpb24gR3VpZGU8L3RleHQ+CjxyZWN0IHg9IjIwIiB5PSIxNTAiIHdpZHRoPSIzMTAiIGhlaWdodD0iNDAiIGZpbGw9IiM2QjcyODAiIHJ4PSI0Ii8+Cjx0ZXh0IHg9IjMwIiB5PSIxNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiPkVtZXJnZW5jeSBQcm9jZWR1cmVzPC90ZXh0Pgo8L3N2Zz4KPC9zdmc+",
      callouts: [
        {
          id: "callout-1",
          shape: "number" as const,
          color: "#FF6B6B",
          x: 15,
          y: 35,
          width: 8,
          height: 8,
          number: 1,
          revealText: "This is the main navigation area where you can access different sections of the SOP Creator. Click on any item to navigate to that section."
        },
        {
          id: "callout-2", 
          shape: "number" as const,
          color: "#4ECDC4",
          x: 25,
          y: 65,
          width: 8,
          height: 8,
          number: 2,
          revealText: "The 'Start New Project' button creates a fresh SOP document. You'll be prompted to enter the project name, topic, and other basic information."
        },
        {
          id: "callout-3",
          shape: "number" as const,
          color: "#AB47BC",
          x: 70,
          y: 45,
          width: 8,
          height: 8,
          number: 3,
          revealText: "Your recent projects are displayed here. Click on any project to continue editing or use the dropdown menu for additional options like duplicate, delete, or export."
        }
      ],
      title: "Dashboard Overview",
      description: "Main navigation and project management interface"
    },
    {
      id: "demo-2",
      dataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMUYyOTM3Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9Ijc2MCIgaGVpZ2h0PSI0MTAiIGZpbGw9IiMzNzQxNTEiIHJ4PSIxMiIvPgo8dGV4dCB4PSI0MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iI0Y5RkFGQiI+U3RlcCBFZGl0b3I8L3RleHQ+CjxyZWN0IHg9IjQwIiB5PSI4MCIgd2lkdGg9IjcwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM0QjVTNjMiIHJ4PSI4Ii8+Cjx0ZXh0IHg9IjYwIiB5PSIxMTAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iI0Y5RkFGQiI+TGVzc29uIDEgLSBHZXR0aW5nIFN0YXJ0ZWQ8L3RleHQ+Cjx0ZXh0YXJlYSB4PSI2MCIgeT0iMTMwIiB3aWR0aD0iNjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMUM1MDU2MyIgcng9IjQiPkNsaWNrIG9uIHRoZSAnTmV3IERvY3VtZW50JyBidXR0b24gdG8gY3JlYXRlIHlvdXIgZmlyc3QgU09QIGRvY3VtZW50Li4uPC90ZXh0YXJlYT4KPHN2ZyB4PSI0MCIgeT0iMjAwIiB3aWR0aD0iNzAwIiBoZWlnaHQ9IjIwMCI+CjxyZWN0IHdpZHRoPSI3MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMkQzNzQ4IiByeD0iOCIvPgo8dGV4dCB4PSIyMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0Y5RkFGQiI+U2NyZWVuc2hvdCBTZWN0aW9uPC90ZXh0Pgo8cmVjdCB4PSIyMCIgeT0iNTAiIHdpZHRoPSI2NjAiIGhlaWdodD0iMTMwIiBmaWxsPSIjMTI0MDU2IiByeD0iNCIvPgo8dGV4dCB4PSIzNDAiIHk9IjEyMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUI5Qjk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EcmFnICYgRHJvcCBvciBDbGljayB0byBVcGxvYWQ8L3RleHQ+CjwvcmVjdD4KPC9zdmc+CjwvcmVjdD4KPC9zdmc+",
      callouts: [
        {
          id: "callout-4",
          shape: "number" as const,
          color: "#66BB6A",
          x: 8,
          y: 25,
          width: 8,
          height: 8,
          number: 1,
          revealText: "The lesson header shows the step number and title. Click on the title to edit it inline. You can also add tags and estimated time here."
        },
        {
          id: "callout-5",
          shape: "number" as const,
          color: "#FFA726",
          x: 8,
          y: 45,
          width: 8,
          height: 8,
          number: 2,
          revealText: "This is the main instruction area. Write clear, actionable steps here. This text will be prominently displayed to learners."
        },
        {
          id: "callout-6",
          shape: "number" as const,
          color: "#45B7D1",
          x: 8,
          y: 70,
          width: 8,
          height: 8,
          number: 3,
          revealText: "The screenshot section allows you to add visual guides. You can upload images, add callouts, and crop them. Click-to-reveal callouts like this one provide additional context without cluttering the interface."
        }
      ],
      title: "Step Editor",
      description: "Create and edit individual lesson steps"
    }
  ];

  const [screenshots, setScreenshots] = useState<ScreenshotData[]>(demoScreenshots);

  const handleCalloutAdd = (screenshotIndex: number, callout: Omit<Callout, "id">) => {
    const newCallout = { ...callout, id: `callout-${Date.now()}` };
    setScreenshots(prev => prev.map((screenshot, index) => 
      index === screenshotIndex 
        ? { ...screenshot, callouts: [...screenshot.callouts, newCallout] }
        : screenshot
    ));
  };

  const handleCalloutUpdate = (screenshotIndex: number, callout: Callout) => {
    setScreenshots(prev => prev.map((screenshot, index) => 
      index === screenshotIndex 
        ? { ...screenshot, callouts: screenshot.callouts.map(c => c.id === callout.id ? callout : c) }
        : screenshot
    ));
  };

  const handleCalloutDelete = (screenshotIndex: number, calloutId: string) => {
    setScreenshots(prev => prev.map((screenshot, index) => 
      index === screenshotIndex 
        ? { ...screenshot, callouts: screenshot.callouts.filter(c => c.id !== calloutId) }
        : screenshot
    ));
  };

  const resetDemo = () => {
    setScreenshots(demoScreenshots);
    setCurrentStep(0);
    setIsEditing(false);
  };

  const currentScreenshot = screenshots[currentStep];
  const interactiveCallouts = currentScreenshot?.callouts.filter(c => c.shape === "number" && c.revealText) || [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Demo Header */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-purple-400" />
            Click-to-Reveal Interactive Callouts Demo
          </CardTitle>
          <p className="text-purple-200">
            Experience how numbered callouts can reveal additional information when clicked. 
            This creates an engaging, interactive learning experience without overwhelming the interface.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className={`${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
            >
              {isEditing ? '✓ Viewing Mode' : 'Edit Mode'}
            </Button>
            
            <Button
              onClick={resetDemo}
              variant="outline"
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Demo
            </Button>
            
            <div className="flex gap-2">
              {screenshots.map((_, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={currentStep === index ? "default" : "outline"}
                  onClick={() => setCurrentStep(index)}
                  className={`${
                    currentStep === index 
                      ? 'bg-blue-600 text-white' 
                      : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  Step {index + 1}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Viewing Mode</span>
              </div>
              <p className="text-xs text-blue-200">Click numbered callouts to reveal information</p>
            </div>
            
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Camera className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Edit Mode</span>
              </div>
              <p className="text-xs text-purple-200">Add, edit, and delete callouts</p>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">Interactive Callouts</span>
              </div>
              <p className="text-xs text-green-200">{interactiveCallouts.length} on this step</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Screenshot */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-purple-400" />
                {currentScreenshot?.title}
              </CardTitle>
              <p className="text-zinc-400 mt-1">{currentScreenshot?.description}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`${isEditing ? 'bg-purple-600/20 text-purple-300' : 'bg-blue-600/20 text-blue-300'}`}
              >
                {isEditing ? 'Edit Mode' : 'View Mode'}
              </Badge>
              
              {interactiveCallouts.length > 0 && (
                <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300">
                  {interactiveCallouts.length} Interactive
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="relative bg-zinc-800 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <img
              src={currentScreenshot?.dataUrl}
              alt={currentScreenshot?.title}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0">
              <CalloutOverlay
                screenshot={currentScreenshot}
                isEditing={isEditing}
                onCalloutAdd={(callout) => handleCalloutAdd(currentStep, callout)}
                onCalloutUpdate={(callout) => handleCalloutUpdate(currentStep, callout)}
                onCalloutDelete={(calloutId) => handleCalloutDelete(currentStep, calloutId)}
              />
            </div>
          </div>
          
          {/* Instructions */}
          <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Play className="h-4 w-4 text-green-400" />
              Try the Demo
            </h4>
            <div className="text-sm text-zinc-300 space-y-1">
              {isEditing ? (
                <>
                  <p>• Click "Add Callouts" then select the "Type" tool (numbered callouts)</p>
                  <p>• Click anywhere on the screenshot to place a numbered callout</p>
                  <p>• Add reveal text in the dialog that appears</p>
                  <p>• Switch to "Viewing Mode" to test the click-to-reveal functionality</p>
                </>
              ) : (
                <>
                  <p>• Click on any numbered callout (1, 2, 3) to reveal additional information</p>
                  <p>• Notice the visual feedback: pulsing "?" turns into "✓" when revealed</p>
                  <p>• Click the same callout again to close the reveal popup</p>
                  <p>• Try different steps to see varied content and interactions</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClickToRevealDemo; 