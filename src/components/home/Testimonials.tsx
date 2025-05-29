import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Heart, BookOpen, Lightbulb, Target, Users, ArrowRight } from "lucide-react";

const TestimonialCard = ({ 
  gradientClasses, 
  content, 
  author, 
  role 
}: { 
  gradientClasses: string, 
  content: string, 
  author: string,
  role: string
}) => (
  <div className="flex flex-col items-center text-center p-6">
    <div className={`w-16 h-16 rounded-full ${gradientClasses} mb-4`}></div>
    <p className="text-zinc-300 mb-4">{content}</p>
    <p className="text-sm text-zinc-500 font-medium">{author}, {role}</p>
  </div>
);

const FounderStoryModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="group cursor-pointer transform transition-all duration-300 hover:scale-105">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-green-600/20 border border-purple-500/30 p-6 backdrop-blur-sm">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-4 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                <Heart className="h-8 w-8 text-white" />
              </div>
              
              <Badge className="mb-3 bg-purple-600/20 text-purple-300 border-purple-500/30 group-hover:bg-purple-600/30 transition-colors">
                <BookOpen className="h-3 w-3 mr-1" />
                Founder's Story
              </Badge>
              
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-200 transition-colors">
                Why I Built SOPify
              </h3>
              
              <p className="text-zinc-300 text-sm mb-4 group-hover:text-zinc-200 transition-colors">
                From healthcare chaos to operational clarity - discover the real-world problem that sparked this solution.
              </p>
              
              <div className="flex items-center text-purple-400 text-sm font-medium group-hover:text-purple-300 transition-colors">
                <span>Read the full story</span>
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            The Story Behind SOPify
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-zinc-300 leading-relaxed">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-lg border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              Turning Frustration into Solutions
            </h3>
            <p className="text-zinc-200">
              Ever encountered a situation where the polished promises of a company felt worlds apart from the day-to-day reality of its operations? My journey into primary healthcare under a large corporate entity revealed exactly that – a profound disconnect that became the driving force behind SOPify.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-red-400" />
              The Reality Check
            </h4>
            <p>
              I stepped into a role with the expectation of structure and professionalism, having interviewed at a welcoming corporate headquarters that exuded competence. However, the reality within the network of doctor's offices was jarringly different. What I found was a landscape where outdated facilities were commonplace, chronic staffing shortages were the norm, and a severe lack of operational uniformity between offices was not an isolated incident but a systemic characteristic.
            </p>
            
            <p>
              Corporate policies and initial training, which seemed comprehensive in theory, often proved utterly irrelevant on the ground. This wasn't just about appearances; it extended to critical lapses in standards, from inadequate vaccine storage in mini-fridges with rudimentary controls to glaring cybersecurity vulnerabilities like aging, unlocked computers and shared passwords.
            </p>
            
            <p>
              The absence of a crucial "buffer zone" field management layer meant there was little effective oversight or a practical way to bridge the gap between the corporate vision and frontline feasibility. This fostered a "Wild West" environment where staff, despite their best efforts, often had to create their own routines, leading to operational chaos.
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 p-4 rounded-lg border border-green-500/20">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-400" />
              The Call to Action
            </h4>
            <p className="text-zinc-200">
              These firsthand experiences – witnessing the daily struggles, the inefficiencies, and the potential risks stemming from a lack of clear, accessible, and relevant standard operating procedures – were more than just observations. They were a call to action.
            </p>
          </div>

          <div className="space-y-4">
            <p>
              It became overwhelmingly clear that a fundamental piece was missing: a straightforward, effective way for teams to document, share, implement, and consistently follow best practices that make sense in their actual working environment.
            </p>
            
            <p>
              <strong className="text-white">SOPify was born from this necessity.</strong> It's my endeavor to provide a tool that helps businesses, starting from the ground up, to bring clarity, consistency, and efficiency to their operations. The goal is to empower teams to escape the cycle of makeshift processes and build a foundation of reliable, standardized procedures that support staff, improve outcomes, and ensure that the intended quality of service can truly be delivered.
            </p>
            
            <p className="text-lg font-medium text-purple-200">
              It's about transforming the daily operational chaos I witnessed into a streamlined, more manageable reality for others.
            </p>
          </div>

          <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 text-center">
            <h4 className="text-white font-semibold mb-2">Ready to bring clarity to your operations?</h4>
            <p className="text-zinc-400 text-sm mb-4">
              Join thousands of teams who've transformed their workflows with SOPify
            </p>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              onClick={() => setIsOpen(false)}
            >
              Start Creating SOPs Today
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Testimonials = () => {
  return (
    <section className="py-16 container mx-auto px-4">
      <h2 className="text-3xl font-semibold tracking-tight text-white text-center mb-12">From The Founder</h2>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Founder's regular testimonial */}
        <TestimonialCard 
          gradientClasses="bg-gradient-to-br from-green-400 to-[#007AFF]" 
          content="I created SOPify to make creating and distributing training documents and SOPs more efficient, inclusive, and interactive at work to help improve workflows and outcomes." 
          author="Tim Holsborg"
          role="Founder and Creator"
        />
        
        {/* Founder's story popup */}
        <FounderStoryModal />
      </div>
    </section>
  );
};

export default Testimonials;
