
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { Loader2, FileText, Code, CheckCircle, GraduationCap, Palette } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { SubscriptionTier } from "@/types/sop";
import { Badge } from "@/components/ui/badge";

const PricingTier = ({ 
  title, 
  price, 
  features, 
  isPopular = false, 
  theme = 'default',
  onSubscribe,
  userTier,
  loading,
  badgeText,
  tier
}: { 
  title: string, 
  price: string, 
  features: { available: boolean, text: string }[], 
  isPopular?: boolean, 
  theme?: 'default' | 'primary' | 'secondary', 
  onSubscribe?: () => void,
  userTier?: SubscriptionTier | null,
  loading?: boolean,
  badgeText?: string,
  tier: SubscriptionTier
}) => {
  const isCurrentTier = userTier === tier;
  
  const themes = {
    default: {
      background: 'bg-[#2C2C2E]',
      iconColor: 'text-[#007AFF]',
      buttonBg: 'bg-[#3A3A3C] hover:bg-[#4A4A4C]',
      buttonText: 'text-white',
    },
    primary: {
      background: 'bg-[#007AFF]',
      iconColor: 'text-white',
      buttonBg: 'bg-white hover:bg-gray-100',
      buttonText: 'text-[#007AFF]',
    },
    secondary: {
      background: 'bg-[#4A2D8B]',
      iconColor: 'text-white',
      buttonBg: 'bg-white hover:bg-gray-100',
      buttonText: 'text-[#4A2D8B]',
    }
  };
  
  const themeStyles = themes[theme];
  
  return (
    <div className={`${themeStyles.background} p-8 rounded-2xl glass-morphism relative overflow-hidden`}>
      {isPopular && (
        <div className="absolute top-0 right-0 bg-blue-600 text-xs text-white px-3 py-1 rounded-bl-lg">
          POPULAR
        </div>
      )}
      {badgeText && (
        <Badge className="absolute top-0 left-0 px-3 py-1 rounded-br-lg bg-amber-600 text-white border-0">
          {badgeText}
        </Badge>
      )}
      {isCurrentTier && (
        <div className="absolute top-0 left-0 bg-green-600 text-xs text-white px-3 py-1 rounded-br-lg">
          CURRENT PLAN
        </div>
      )}
      <h3 className="text-2xl font-medium text-white mb-2">{title}</h3>
      <p className="text-4xl font-bold text-white mb-6">{price}<span className={`text-lg ${theme === 'default' ? 'text-zinc-400' : 'text-white/80'} font-normal`}>/month</span></p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            {feature.available ? (
              <CheckCircle className={`w-5 h-5 ${themeStyles.iconColor} mr-2 flex-shrink-0`} />
            ) : (
              <svg className="w-5 h-5 text-zinc-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className={`${feature.available ? (theme === 'default' ? 'text-zinc-300' : 'text-white') : 'text-zinc-500'}`}>{feature.text}</span>
          </li>
        ))}
      </ul>
      {isCurrentTier ? (
        <Button className={`w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-6`} disabled>
          Current Plan
        </Button>
      ) : loading ? (
        <Button className={`w-full ${themeStyles.buttonBg} ${themeStyles.buttonText} rounded-xl py-6`} disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </Button>
      ) : (
        onSubscribe ? (
          <Button 
            onClick={onSubscribe} 
            className={`w-full ${themeStyles.buttonBg} ${themeStyles.buttonText} rounded-xl py-6`}
          >
            {isPopular ? 'Upgrade Now' : 'Select Plan'}
          </Button>
        ) : (
          <Link to="/auth" className="w-full block">
            <Button className={`w-full ${themeStyles.buttonBg} ${themeStyles.buttonText} rounded-xl py-6`}>
              Sign Up
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
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const freeTierFeatures = [
    { available: true, text: "Basic Training Documents" },
    { available: true, text: "1 HTML Export per day" },
    { available: true, text: "1 PDF Export per day" },
    { available: true, text: "Screenshot Annotation" },
    { available: false, text: "Interactive Training Modules" },
    { available: false, text: "Progress Tracking & Quizzes" }
  ];
  
  const sopEssentialsFeatures = [
    { available: true, text: "Everything in Free" },
    { available: true, text: "Unlimited PDF & HTML Exports" },
    { available: true, text: "Basic Training Modules" },
    { available: true, text: "Custom Branding & Backgrounds" },
    { available: true, text: "Callout Tools & Annotations" },
    { available: false, text: "Interactive Quizzes & Certificates" }
  ];
  
  const sopifyBusinessFeatures = [
    { available: true, text: "Everything in SOP Essentials" },
    { available: true, text: "Interactive Learning Modules" },
    { available: true, text: "Progress Tracking & Bookmarks" },
    { available: true, text: "Quiz Creation & Assessment" },
    { available: true, text: "Completion Certificates" },
    { available: true, text: "Priority Support & Onboarding" }
  ];

  const handleFreeTier = () => {
    navigate("/app");
  };
  
  const handleSubscribe = async (selectedTier: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setLoading(true);
    setProcessingTier(selectedTier);
    
    try {
      console.log(`Starting checkout process for tier: ${selectedTier}`);
      
      // Call the create-checkout Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier: selectedTier }
      });
      
      if (error) {
        console.error("Error from create-checkout function:", error);
        throw error;
      }
      
      console.log("Checkout response:", data);
      
      // Redirect to Stripe checkout
      if (data?.url) {
        console.log("Redirecting to checkout URL:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
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
      setProcessingTier(null);
    }
  };

  return (
    <section id="pricing" className="py-16 bg-[#1E1E1E] border-t border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">Plans for Every Need</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Choose the plan that best fits your workflow. Start free and upgrade as you grow.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingTier 
            title="Free" 
            price="$0" 
            features={freeTierFeatures} 
            onSubscribe={user ? handleFreeTier : undefined}
            userTier={tier}
            loading={loading && processingTier === "free"}
            tier="free"
          />
          
          <PricingTier 
            title="SOP Essentials" 
            price="$25" 
            features={sopEssentialsFeatures} 
            theme="primary"
            isPopular={true}
            onSubscribe={() => handleSubscribe('sop-essentials')}
            userTier={tier}
            loading={loading && processingTier === "sop-essentials"}
            tier="pro"
            badgeText="POPULAR"
          />
          
          <PricingTier 
            title="SOPify Business" 
            price="$75" 
            features={sopifyBusinessFeatures} 
            theme="secondary"
            onSubscribe={() => handleSubscribe('sopify-business')}
            userTier={tier}
            loading={loading && processingTier === "sopify-business"}
            tier="pro-learning"
            badgeText="PREMIUM"
          />
        </div>
      </div>
    </section>
  );
};

export default Pricing;
