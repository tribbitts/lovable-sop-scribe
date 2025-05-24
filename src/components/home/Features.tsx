const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-[#2C2C2E] p-6 rounded-2xl glass-morphism transform transition-transform hover:scale-105">
    <div className="w-12 h-12 bg-gradient-to-r from-purple-600/20 to-blue-600/20 flex items-center justify-center rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
    <p className="text-zinc-400">{description}</p>
  </div>
);

const Features = () => {
  return (
    <section className="py-16 bg-[#1E1E1E] border-t border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-semibold tracking-tight text-white text-center mb-12">Interactive Learning Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>}
            title="Interactive Quizzes"
            description="Add knowledge checks with multiple choice, true/false, and short answer questions."
          />
          
          <FeatureCard 
            icon={<svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>}
            title="Progress Tracking"
            description="Learners can track their completion progress and resume where they left off."
          />
          
          <FeatureCard 
            icon={<svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>}
            title="Offline Capable"
            description="Training modules work completely offline - no internet connection required."
          />
          
          <FeatureCard 
            icon={<svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>}
            title="Completion Certificates"
            description="Automatically generate and brand completion certificates for successful learners."
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
