
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  Globe, 
  GraduationCap, 
  Package,
  Eye,
  Play
} from "lucide-react";

const DemoSection = () => {
  const demoFormats = [
    {
      tier: "Free",
      title: "Basic SOP Document",
      description: "Simple step-by-step documentation with screenshots",
      formats: [
        {
          name: "PDF Manual",
          icon: FileText,
          demoUrl: "/demos/basic-sop-demo.pdf",
          viewUrl: "/demos/basic-sop-demo.pdf",
          description: "Clean, professional PDF format"
        }
      ],
      badgeColor: "bg-gray-600",
      features: ["Screenshot annotation", "Step-by-step instructions", "Professional layout"]
    },
    {
      tier: "SOP Essentials ($25/mo)",
      title: "Enhanced Training Materials",
      description: "Professional SOPs with custom branding and multiple formats",
      formats: [
        {
          name: "PDF Manual",
          icon: FileText,
          demoUrl: "/demos/essentials-pdf-demo.pdf",
          viewUrl: "/demos/essentials-pdf-demo.pdf",
          description: "Enhanced PDF with custom branding"
        },
        {
          name: "Interactive Module",
          icon: Globe,
          demoUrl: "/demos/essentials-interactive-demo.html",
          viewUrl: "/demos/essentials-interactive-demo.html",
          description: "Web-based interactive training"
        }
      ],
      badgeColor: "bg-blue-600",
      features: ["Custom branding", "Multiple export formats", "Enhanced styling", "Callout tools"]
    },
    {
      tier: "SOPify Business ($75/mo)",
      title: "Complete Training Solutions",
      description: "Advanced interactive training with LMS features and bundled packages",
      formats: [
        {
          name: "Enhanced Training Module",
          icon: GraduationCap,
          demoUrl: "/demos/business-enhanced-demo.html",
          viewUrl: "/demos/business-enhanced-demo.html",
          description: "Advanced LMS-style training with progress tracking"
        },
        {
          name: "Bundled Training Package",
          icon: Package,
          demoUrl: "/demos/business-bundle-demo.zip",
          viewUrl: "#",
          description: "Complete package with PDF + Interactive + Resources"
        }
      ],
      badgeColor: "bg-purple-600",
      features: ["Progress tracking", "Interactive quizzes", "Completion certificates", "LMS integration", "Bundled packages"]
    }
  ];

  const handleDemoClick = (demoUrl: string, isBundle: boolean = false) => {
    if (isBundle) {
      // For bundle demos, trigger download
      const link = document.createElement('a');
      link.href = demoUrl;
      link.download = 'sopify-training-bundle-demo.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For other demos, open in new tab
      window.open(demoUrl, '_blank');
    }
  };

  return (
    <section id="demos" className="py-16 bg-[#1A1A1A] border-t border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">
            See What You Get
          </h2>
          <p className="text-zinc-400 max-w-3xl mx-auto">
            Explore interactive demos of each export format. See exactly what your training materials will look like across all tiers.
          </p>
        </div>
        
        <div className="space-y-8 max-w-6xl mx-auto">
          {demoFormats.map((demo, index) => (
            <Card key={index} className="bg-[#2C2C2E] border-zinc-700">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl text-white">{demo.tier}</CardTitle>
                    <Badge className={`${demo.badgeColor} text-white`}>
                      {demo.tier.includes('$') ? 'POPULAR' : demo.tier === 'Free' ? 'START HERE' : 'PREMIUM'}
                    </Badge>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{demo.title}</h3>
                <p className="text-zinc-400">{demo.description}</p>
              </CardHeader>
              
              <CardContent>
                {/* Demo Format Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {demo.formats.map((format, formatIndex) => (
                    <div key={formatIndex} className="bg-[#1E1E1E] p-4 rounded-xl border border-zinc-700">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                          <format.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{format.name}</h4>
                          <p className="text-sm text-zinc-400">{format.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {format.name !== "Bundled Training Package" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDemoClick(format.viewUrl)}
                            className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 flex-1"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Demo
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDemoClick(format.demoUrl, true)}
                            className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 flex-1"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Demo
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Features List */}
                <div className="bg-[#1E1E1E] p-4 rounded-xl border border-zinc-700">
                  <h4 className="text-sm font-medium text-zinc-300 mb-3">Included Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {demo.features.map((feature, featureIndex) => (
                      <span 
                        key={featureIndex}
                        className="text-xs px-3 py-1 bg-zinc-700/50 rounded-full text-zinc-300"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-zinc-400 mb-6">
            Ready to create your own professional SOPs?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-[#007AFF] text-white hover:bg-[#0062CC] rounded-xl px-8 py-6 text-lg">
              Start Creating Free
            </Button>
            <Button 
              variant="outline" 
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-xl px-8 py-6 text-lg"
            >
              <a href="#pricing">View Pricing</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
