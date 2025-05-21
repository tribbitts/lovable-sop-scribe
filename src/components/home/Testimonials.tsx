
import React from 'react';

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

const Testimonials = () => {
  return (
    <section className="py-16 container mx-auto px-4">
      <h2 className="text-3xl font-semibold tracking-tight text-white text-center mb-12">What Our Users Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <TestimonialCard 
          gradientClasses="bg-gradient-to-br from-[#007AFF] to-purple-500" 
          content="This app has completely transformed how we create and share procedures at our company." 
          author="Alex Chen"
          role="Operations Manager"
        />
        
        <TestimonialCard 
          gradientClasses="bg-gradient-to-br from-green-400 to-[#007AFF]" 
          content="The simplicity and clean design make creating SOPs a breeze. Highly recommended!" 
          author="Sarah Johnson"
          role="CEO"
        />
        
        <TestimonialCard 
          gradientClasses="bg-gradient-to-br from-amber-500 to-red-500" 
          content="I love how I can create professional-looking documentation in minutes rather than hours." 
          author="Michael Torres"
          role="Team Lead"
        />
      </div>
    </section>
  );
};

export default Testimonials;
