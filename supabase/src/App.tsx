import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { Toaster } from "./components/ui/sonner";
import HomePage from "./pages/HomePage";
import SopCreator from "./pages/SopCreator";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import NotFound from "./pages/NotFound";
import AppLayout from "./layouts/AppLayout";
import { useAuth } from "./context/AuthContext";

// Enhanced Feature Test Pages
import AdvancedCalloutsTest from "./pages/AdvancedCalloutsTest";
import EnhancedExportTest from "./pages/EnhancedExportTest";
import LivingSOPTest from "./pages/LivingSOPTest";
import TemplateMarketplaceTest from "./pages/TemplateMarketplaceTest";
import TemplateBuilderTest from "./pages/TemplateBuilderTest";
import FeaturesDashboard from "./pages/FeaturesDashboard";

const queryClient = new QueryClient();

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Auth />;
  }
  
  return <AppLayout>{children}</AppLayout>;
};

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SubscriptionProvider>
            <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<Auth />} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route 
                  path="/app" 
                  element={
                    <ProtectedRoute>
                      <SopCreator />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Enhanced Feature Test Routes */}
                <Route 
                  path="/test/features-dashboard" 
                  element={
                    <ProtectedRoute>
                      <FeaturesDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/test/advanced-callouts" 
                  element={
                    <ProtectedRoute>
                      <AdvancedCalloutsTest />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/test/enhanced-export" 
                  element={
                    <ProtectedRoute>
                      <EnhancedExportTest />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/test/living-sop" 
                  element={
                    <ProtectedRoute>
                      <LivingSOPTest />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/test/template-marketplace" 
                  element={
                    <ProtectedRoute>
                      <TemplateMarketplaceTest />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/test/template-builder" 
                  element={
                    <ProtectedRoute>
                      <TemplateBuilderTest />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Router>
          </SubscriptionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
