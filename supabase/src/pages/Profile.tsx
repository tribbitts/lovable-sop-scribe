import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Crown, 
  Mail, 
  Calendar, 
  Settings, 
  LogOut,
  ArrowLeft,
  Shield,
  Zap,
  FileText,
  Download
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { seoPages } from "@/lib/seo";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { tier, isAdmin, isPro, pdfCount, pdfLimit, dailyPdfExports, dailyHtmlExports } = useSubscription();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getTierInfo = () => {
    if (isAdmin) {
      return {
        name: "Admin",
        color: "bg-blue-600",
        icon: Shield,
        description: "Full access to all features"
      };
    }
    
    switch (tier) {
      case "pro":
        return {
          name: "SOP Essentials",
          color: "bg-green-600",
          icon: Zap,
          description: "Professional SOP creation with enhanced features"
        };
      case "pro-learning":
        return {
          name: "SOPify Business",
          color: "bg-purple-600",
          icon: Crown,
          description: "Complete training and business solution"
        };
      default:
        return {
          name: "Free",
          color: "bg-zinc-600",
          icon: User,
          description: "Basic SOP creation features"
        };
    }
  };

  const tierInfo = getTierInfo();
  const TierIcon = tierInfo.icon;

  return (
    <div className="min-h-screen bg-[#121212] text-[#F1F1F1] dark">
      <SEOHead 
        metadata={{
          ...seoPages["/profile"] || {
            title: "Profile - SOPify",
            description: "Manage your SOPify account and subscription",
            keywords: "profile, account, subscription, SOPify"
          }
        }} 
        path="/profile" 
      />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-[#121212]/80 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="h-5 w-5 text-zinc-400" />
            <div className="flex items-center gap-1">
              <span className="text-2xl font-medium tracking-tight text-white">SOP</span>
              <span className="text-2xl font-light tracking-tight text-[#007AFF]">ify</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link to="/app">
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                Go to App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
            <p className="text-zinc-400">Manage your account and subscription</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Information */}
            <div className="lg:col-span-2">
              <Card className="bg-[#1E1E1E] border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <User className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-zinc-400" />
                    <div>
                      <p className="text-sm text-zinc-400">Email</p>
                      <p className="text-white">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    <div>
                      <p className="text-sm text-zinc-400">Member Since</p>
                      <p className="text-white">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-zinc-700" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4 text-zinc-400" />
                      <span className="text-white">Account Settings</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              <Card className="bg-[#1E1E1E] border-zinc-800 mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FileText className="h-5 w-5" />
                    Usage Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-900/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Download className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-zinc-400">PDF Exports Today</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {dailyPdfExports}
                        {!isPro && !isAdmin && (
                          <span className="text-sm text-zinc-400 ml-1">/ {pdfLimit}</span>
                        )}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-zinc-900/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Download className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-zinc-400">HTML Exports Today</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{dailyHtmlExports}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Information */}
            <div>
              <Card className="bg-[#1E1E1E] border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TierIcon className="h-5 w-5" />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <Badge className={`${tierInfo.color} text-white mb-3`}>
                      {tierInfo.name}
                    </Badge>
                    <p className="text-sm text-zinc-400">{tierInfo.description}</p>
                  </div>

                  <Separator className="bg-zinc-700" />

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white">Features Included:</h4>
                    <ul className="space-y-2 text-sm text-zinc-300">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Unlimited SOPs
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        PDF Export
                      </li>
                      {(isPro || isAdmin) && (
                        <>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            HTML Export
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            Training Modules
                          </li>
                        </>
                      )}
                      {(tier === "pro-learning" || isAdmin) && (
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          Advanced Training Features
                        </li>
                      )}
                    </ul>
                  </div>

                  {tier === "free" && (
                    <div className="mt-4">
                      <Link to="/app">
                        <Button className="w-full bg-[#007AFF] text-white hover:bg-[#0062CC]">
                          Upgrade Plan
                        </Button>
                      </Link>
                    </div>
                  )}

                  {(isPro || tier === "pro-learning") && !isAdmin && (
                    <div className="mt-4">
                      <p className="text-xs text-zinc-500 text-center">
                        Subscription managed through Stripe.
                        <br />
                        Contact support to cancel.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile; 