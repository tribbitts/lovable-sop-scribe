
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
      <h2 className="text-3xl font-semibold tracking-tight text-white text-center mb-12">From The Founder and Users</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <TestimonialCard 
          gradientClasses="bg-gradient-to-br from-[#007AFF] to-purple-500" 
          content="" 
          author=""
          role=""
        />
        
        <TestimonialCard 
          gradientClasses="bg-gradient-to-br from-green-400 to-[#007AFF]" 
          content="I created SOPify to make creating and distributing training documents and SOPs more efficient, inclusive, and interactive at work to help improve workflows and outcomes." 
          author="Tim Holsborg"
          role="Found and Creator"
        />
        
        <TestimonialCard 
          gradientClasses="bg-gradient-to-br from-amber-500 to-red-500" 
          content="" 
          author=""
          role=""
        />
      </div>
    </section>
  );
};

export default Testimonials;
