import { FileText, Download, Smartphone, Shield, Users, Settings } from "lucide-react";

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: any, 
  title: string, 
  description: string 
}) => (
  <div className="bg-[#2C2C2E] p-6 rounded-2xl glass-morphism transform transition-transform hover:scale-105">
    <div className="w-12 h-12 bg-[#007AFF]/10 flex items-center justify-center rounded-full mb-4">
      <Icon className="w-6 h-6 text-[#007AFF]" />
    </div>
    <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
    <p className="text-zinc-400">{description}</p>
  </div>
);

const Features = () => {
  return (
    <section id="how-it-works" className="py-16 bg-[#1E1E1E] border-t border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">
            Everything You Need to Create Professional SOPs
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Powerful features designed to streamline your Standard Operating Procedure creation process, 
            from documentation to professional exports and team collaboration.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={FileText}
            title="Step-by-Step Documentation"
            description="Create clear, numbered procedures with detailed instructions, screenshots, and annotations for maximum clarity."
          />
          
          <FeatureCard
            icon={Download}
            title="Professional PDF & HTML Export"
            description="Export your SOPs as polished PDF documents or interactive HTML pages with custom branding and styling."
          />
          
          <FeatureCard
            icon={Settings}
            title="Advanced Callout Tools"
            description="Enhance your screenshots with professional callouts, arrows, and annotations to highlight important areas and steps."
          />
          
          <FeatureCard
            icon={Smartphone}
            title="Mobile-Optimized Design"
            description="Access and create SOPs on any device with our responsive design that works perfectly on desktop, tablet, and mobile."
          />
          
          <FeatureCard
            icon={Shield}
            title="Privacy-First Approach"
            description="Your data stays secure in your browser. No uploads to external servers - complete control over your sensitive business information."
          />
          
          <FeatureCard
            icon={Users}
            title="Team Collaboration"
            description="Share SOPs with your team, maintain consistent procedures across your organization, and ensure everyone follows the same standards."
          />
        </div>
        
        {/* Additional content section for SEO */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">
            Why Choose SOPify for Your Business Documentation?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-zinc-300">
            <div>
              <h4 className="text-lg font-medium text-white mb-3">Streamlined Workflow</h4>
              <p className="leading-relaxed">
                SOPify eliminates the complexity of traditional documentation tools. Create professional 
                Standard Operating Procedures in minutes, not hours. Our intuitive interface guides you 
                through each step of the process.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-medium text-white mb-3">Enterprise-Ready Features</h4>
              <p className="leading-relaxed">
                From small teams to large organizations, SOPify scales with your needs. Custom branding, 
                professional exports, and advanced annotation features ensure your documentation looks professional 
                and functions perfectly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
