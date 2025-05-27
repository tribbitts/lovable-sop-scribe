import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  BookOpen,
  Download,
  FileText,
  MessageCircle,
  Settings,
  Sparkles,
} from "lucide-react";
import { DialogClose } from "@/components/ui/dialog";
import { SopDocument } from "@/types/sop";

interface EnhancedHtmlExportSettings {
  passwordProtection: {
    enabled: boolean;
    password?: string;
    hint?: string;
  };
  lmsFeatures: {
    enableNotes: boolean;
    enableBookmarks: boolean;
    enableSearch: boolean;
    enableProgressTracking: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  branding: {
    companyColors: {
      primary: string;
      secondary: string;
    };
  };
}

interface EnhancedHtmlExportOptionsProps {
  sopDocument: SopDocument;
  onExport: (sopDocument: SopDocument, options: any) => void;
  onClose: () => void;
  isExporting: boolean;
  exportProgress: string | null;
}

export const EnhancedHtmlExportOptions: React.FC<EnhancedHtmlExportOptionsProps> = ({
  sopDocument,
  onExport,
  onClose,
  isExporting,
  exportProgress
}) => {
  const [enablePasswordProtection, setEnablePasswordProtection] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordHint, setPasswordHint] = useState("");
  const [enableNotes, setEnableNotes] = useState(true);
  const [enableBookmarks, setEnableBookmarks] = useState(true);
  const [enableSearch, setEnableSearch] = useState(true);
  const [enableProgressTracking, setEnableProgressTracking] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [primaryColor, setPrimaryColor] = useState("#007AFF");
  const [secondaryColor, setSecondaryColor] = useState("#1E1E1E");

  const [includeFeedback, setIncludeFeedback] = useState(true);
  const [feedbackEmail, setFeedbackEmail] = useState("feedback@sopify.com");

  const handleExport = () => {
    if (!sopDocument.steps.length) {
      toast({
        title: "No Steps Found",
        description: "Please add at least one step before exporting.",
        variant: "destructive",
      });
      return;
    }

    onExport(sopDocument, {
      mode: 'standalone',
      enhanced: true,
      enhancedOptions: {
        passwordProtection: enablePasswordProtection ? {
          enabled: true,
          password: password,
          hint: passwordHint
        } : { enabled: false },
        lmsFeatures: {
          enableNotes: enableNotes,
          enableBookmarks: enableBookmarks,
          enableSearch: enableSearch,
          enableProgressTracking: enableProgressTracking
        },
        theme: theme,
        branding: {
          companyColors: {
            primary: primaryColor,
            secondary: secondaryColor
          }
        }
      },
      includeFeedback,
      feedbackEmail
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-zinc-700 bg-zinc-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Sparkles className="h-4 w-4" />
            Enhanced HTML Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-400">
            Customize your enhanced HTML export with additional features and
            branding options.
          </p>
        </CardContent>
      </Card>

      {/* Password Protection Settings */}
      <Card className="border-zinc-700 bg-zinc-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Settings className="h-4 w-4" />
            Password Protection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-zinc-300">Enable Password Protection</Label>
              <p className="text-xs text-zinc-400 mt-1">
                Require a password to access the exported HTML
              </p>
            </div>
            <Switch
              checked={enablePasswordProtection}
              onCheckedChange={setEnablePasswordProtection}
            />
          </div>

          {enablePasswordProtection && (
            <div className="space-y-3 pt-2 border-t border-zinc-700">
              <div>
                <Label className="text-zinc-300">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-zinc-800 border-zinc-600 text-zinc-300"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Password Hint</Label>
                <Input
                  value={passwordHint}
                  onChange={(e) => setPasswordHint(e.target.value)}
                  placeholder="Enter a hint for the password"
                  className="bg-zinc-800 border-zinc-600 text-zinc-300"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* LMS Features Settings */}
      <Card className="border-zinc-700 bg-zinc-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <BookOpen className="h-4 w-4" />
            LMS Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-zinc-300">Enable Notes</Label>
              <p className="text-xs text-zinc-400 mt-1">
                Allow users to take notes within the training module
              </p>
            </div>
            <Switch
              checked={enableNotes}
              onCheckedChange={setEnableNotes}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-zinc-300">Enable Bookmarks</Label>
              <p className="text-xs text-zinc-400 mt-1">
                Allow users to bookmark steps for later review
              </p>
            </div>
            <Switch
              checked={enableBookmarks}
              onCheckedChange={setEnableBookmarks}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-zinc-300">Enable Search</Label>
              <p className="text-xs text-zinc-400 mt-1">
                Allow users to search for specific content within the module
              </p>
            </div>
            <Switch
              checked={enableSearch}
              onCheckedChange={setEnableSearch}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-zinc-300">Enable Progress Tracking</Label>
              <p className="text-xs text-zinc-400 mt-1">
                Track user progress and completion status
              </p>
            </div>
            <Switch
              checked={enableProgressTracking}
              onCheckedChange={setEnableProgressTracking}
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="border-zinc-700 bg-zinc-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            🎨 Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="theme-light" className="text-zinc-300">
                <input
                  type="radio"
                  id="theme-light"
                  value="light"
                  checked={theme === "light"}
                  onChange={() => setTheme("light")}
                  className="mr-2"
                />
                Light
              </Label>
            </div>
            <div>
              <Label htmlFor="theme-dark" className="text-zinc-300">
                <input
                  type="radio"
                  id="theme-dark"
                  value="dark"
                  checked={theme === "dark"}
                  onChange={() => setTheme("dark")}
                  className="mr-2"
                />
                Dark
              </Label>
            </div>
            <div>
              <Label htmlFor="theme-auto" className="text-zinc-300">
                <input
                  type="radio"
                  id="theme-auto"
                  value="auto"
                  checked={theme === "auto"}
                  onChange={() => setTheme("auto")}
                  className="mr-2"
                />
                Auto
              </Label>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-zinc-700">
            <div>
              <Label className="text-zinc-300">Primary Color</Label>
              <Input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-full bg-zinc-800 border-zinc-600 text-zinc-300"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Secondary Color</Label>
              <Input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-10 w-full bg-zinc-800 border-zinc-600 text-zinc-300"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback System Settings */}
      <Card className="border-zinc-700 bg-zinc-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <MessageCircle className="h-4 w-4" />
            Feedback System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-zinc-300">Include Feedback Mechanism</Label>
              <p className="text-xs text-zinc-400 mt-1">
                Add feedback buttons for users to suggest improvements
              </p>
            </div>
            <Switch
              checked={includeFeedback}
              onCheckedChange={setIncludeFeedback}
            />
          </div>

          {includeFeedback && (
            <div className="space-y-3 pt-2 border-t border-zinc-700">
              <div>
                <Label className="text-zinc-300">Feedback Email Address</Label>
                <Input
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  placeholder="feedback@company.com"
                  className="bg-zinc-800 border-zinc-600 text-zinc-300"
                />
                <p className="text-xs text-zinc-400 mt-1">
                  Email address for receiving feedback via mailto links
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Button and Status */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
          className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
        >
          {isExporting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-zinc-300 border-t-transparent"></div>
              <span>Exporting...</span>
            </div>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export Enhanced HTML
            </>
          )}
        </Button>
        <DialogClose asChild>
          <Button variant="secondary">Close</Button>
        </DialogClose>
      </div>

      {exportProgress && (
        <div className="text-sm text-zinc-400">
          Progress: {exportProgress}
        </div>
      )}
    </div>
  );
};

export default EnhancedHtmlExportOptions;
