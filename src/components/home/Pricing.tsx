
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PricingTier = ({ 
  title, 
  price, 
  features, 
  isPopular = false, 
  isPro = false
}: { 
  title: string, 
  price: string, 
  features: { available: boolean, text: string }[], 
  isPopular?: boolean, 
  isPro?: boolean 
}) => (
  <div className={`${isPro ? 'bg-[#007AFF]' : 'bg-[#2C2C2E]'} p-8 rounded-2xl ${isPro ? '' : 'glass-morphism'} relative overflow-hidden`}>
    {isPopular && (
      <div className="absolute top-0 right-0 bg-blue-600 text-xs text-white px-3 py-1 rounded-bl-lg">
        POPULAR
      </div>
    )}
    <h3 className="text-2xl font-medium text-white mb-2">{title}</h3>
    <p className="text-4xl font-bold text-white mb-6">{price}<span className={`text-lg ${isPro ? 'text-white/80' : 'text-zinc-400'} font-normal`}>/month</span></p>
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          {feature.available ? (
            <svg className={`w-6 h-6 ${isPro ? 'text-white' : 'text-[#007AFF]'} mr-2 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-zinc-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className={`${feature.available ? (isPro ? 'text-white' : 'text-zinc-300') : 'text-zinc-500'}`}>{feature.text}</span>
        </li>
      ))}
    </ul>
    <Link to="/app">
      <Button className={`w-full ${isPro ? 'bg-white text-[#007AFF] hover:bg-gray-100' : 'bg-[#3A3A3C] text-white hover:bg-[#4A4A4C]'} rounded-xl py-6`}>
        {isPro ? 'Try Pro' : 'Get Started'}
      </Button>
    </Link>
  </div>
);

const Pricing = () => {
  const freeTierFeatures = [
    { available: true, text: "Unlimited SOPs" },
    { available: true, text: "PDF Export" },
    { available: true, text: "Basic Templates" },
    { available: false, text: "Team Sharing" }
  ];
  
  const proTierFeatures = [
    { available: true, text: "Everything in Free" },
    { available: true, text: "Team Sharing" },
    { available: true, text: "Premium Templates" },
    { available: true, text: "Priority Support" }
  ];

  return (
    <section id="pricing" className="py-16 bg-[#1E1E1E] border-t border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-semibold tracking-tight text-white text-center mb-12">Simple Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingTier title="Free" price="$0" features={freeTierFeatures} />
          <PricingTier title="Pro" price="$12" features={proTierFeatures} isPopular={true} isPro={true} />
        </div>
      </div>
    </section>
  );
};

export default Pricing;
