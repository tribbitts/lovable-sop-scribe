
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const PricingTier = ({ 
  title, 
  price, 
  features, 
  isPopular = false, 
  isPro = false,
  onSubscribe,
  userTier,
  loading
}: { 
  title: string, 
  price: string, 
  features: { available: boolean, text: string }[], 
  isPopular?: boolean, 
  isPro?: boolean,
  onSubscribe?: () => void,
  userTier?: string | null,
  loading?: boolean
}) => {
  const isCurrentTier = userTier === title.toLowerCase();
  
  return (
    <div className={`${isPro ? 'bg-[#007AFF]' : 'bg-[#2C2C2E]'} p-8 rounded-2xl ${isPro ? '' : 'glass-morphism'} relative overflow-hidden`}>
      {isPopular && (
        <div className="absolute top-0 right-0 bg-blue-600 text-xs text-white px-3 py-1 rounded-bl-lg">
          POPULAR
        </div>
      )}
      {isCurrentTier && (
        <div className="absolute top-0 left-0 bg-green-600 text-xs text-white px-3 py-1 rounded-br-lg">
          CURRENT PLAN
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
      {isCurrentTier ? (
        <Button className={`w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-6`} disabled>
          Current Plan
        </Button>
      ) : loading ? (
        <Button className={`w-full ${isPro ? 'bg-white text-[#007AFF]' : 'bg-[#3A3A3C] text-white'} rounded-xl py-6`} disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </Button>
      ) : (
        onSubscribe ? (
          <Button 
            onClick={onSubscribe} 
            className={`w-full ${isPro ? 'bg-white text-[#007AFF] hover:bg-gray-100' : 'bg-[#3A3A3C] text-white hover:bg-[#4A4A4C]'} rounded-xl py-6`}
          >
            {isPro ? 'Upgrade to Pro' : 'Continue with Free'}
          </Button>
        ) : (
          <Link to="/auth">
            <Button className={`w-full ${isPro ? 'bg-white text-[#007AFF] hover:bg-gray-100' : 'bg-[#3A3A3C] text-white hover:bg-[#4A4A4C]'} rounded-xl py-6`}>
              {isPro ? 'Try Pro' : 'Get Started'}
            </Button>
          </Link>
        )
      )}
    </div>
  );
};

const Pricing = () => {
  const { user } = useAuth();
  const { tier, refreshSubscription } = useSubscription();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const freeTierFeatures = [
    { available: true, text: "Unlimited SOPs" },
    { available: true, text: "PDF Export (1 per day)" },
    { available: true, text: "Basic Templates" },
    { available: false, text: "Team Sharing" }
  ];
  
  const proTierFeatures = [
    { available: true, text: "Everything in Free" },
    { available: true, text: "Unlimited PDF Exports" },
    { available: true, text: "Premium Templates" },
    { available: true, text: "Priority Support" }
  ];

  const handleFreeTier = () => {
    navigate("/app");
  };
  
  const handleProTier = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setLoading(true);
    
    try {
      // Call the create-checkout Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier: 'pro' }
      });
      
      if (error) throw error;
      
      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-16 bg-[#1E1E1E] border-t border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-semibold tracking-tight text-white text-center mb-12">Simple Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingTier 
            title="Free" 
            price="$0" 
            features={freeTierFeatures} 
            onSubscribe={user ? handleFreeTier : undefined}
            userTier={tier}
            loading={loading}
          />
          <PricingTier 
            title="Pro" 
            price="$12" 
            features={proTierFeatures} 
            isPopular={true} 
            isPro={true}
            onSubscribe={user ? handleProTier : undefined}
            userTier={tier}
            loading={loading}
          />
        </div>
      </div>
    </section>
  );
};

export default Pricing;
