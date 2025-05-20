
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-[#2C2C2E] p-6 rounded-2xl glass-morphism transform transition-transform hover:scale-105">
    <div className="w-12 h-12 bg-[#007AFF]/10 flex items-center justify-center rounded-full mb-4">
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
        <h2 className="text-3xl font-semibold tracking-tight text-white text-center mb-12">Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<svg className="w-6 h-6 text-[#007AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>}
            title="Auto-save"
            description="Your SOPs are automatically saved to your browser's local storage."
          />
          
          <FeatureCard 
            icon={<svg className="w-6 h-6 text-[#007AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>}
            title="PDF Export"
            description="Export your SOPs as professional PDF documents with a single click."
          />
          
          <FeatureCard 
            icon={<svg className="w-6 h-6 text-[#007AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>}
            title="Step-by-step Format"
            description="Create clear, numbered steps with detailed instructions and screenshots."
          />
          
          <FeatureCard 
            icon={<svg className="w-6 h-6 text-[#007AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>}
            title="Dark Mode Ready"
            description="Create and edit your SOPs in a comfortable dark mode interface."
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
