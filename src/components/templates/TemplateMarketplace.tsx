import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search,
  Filter,
  Star,
  Download,
  Heart,
  TrendingUp,
  Clock,
  Users,
  Award,
  ChevronRight,
  Eye,
  Sparkles,
  Crown,
  Verified,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Play,
  ShoppingCart,
  BookOpen,
  Zap,
  Plus,
  Upload
} from "lucide-react";
import type { 
  SOPTemplate, 
  TemplateCollection,
  TemplateMarketplace as TemplateMarketplaceType,
  MarketplaceFilters,
  TemplateCategory,
  Industry,
  UseCase
} from "@/types/template-ecosystem";
import { v4 as uuidv4 } from "uuid";

interface TemplateMarketplaceProps {
  onTemplateSelect?: (template: SOPTemplate) => void;
  onTemplatePreview?: (template: SOPTemplate) => void;
  onCollectionSelect?: (collection: TemplateCollection) => void;
  currentUser?: {
    id: string;
    name: string;
    favorites: string[];
    downloads: string[];
  };
}

const TemplateMarketplace: React.FC<TemplateMarketplaceProps> = ({
  onTemplateSelect,
  onTemplatePreview,
  onCollectionSelect,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"popularity" | "rating" | "newest" | "price">("popularity");
  const [filters, setFilters] = useState<MarketplaceFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for demonstration
  const [featuredTemplates] = useState<SOPTemplate[]>([
    {
      id: "1",
      name: "Employee Onboarding Masterclass",
      description: "Comprehensive employee onboarding process with automated workflows, digital forms, and progress tracking. Perfect for HR teams looking to streamline their new hire experience.",
      shortDescription: "Complete employee onboarding process with digital workflows",
      category: "onboarding",
      structure: {
        steps: [],
        estimatedTime: 240,
        difficulty: "intermediate"
      },
      metadata: {
        industry: ["technology", "finance", "healthcare"],
        useCase: ["employee-onboarding", "training-program"],
        languages: ["English", "Spanish", "French"],
        lastUpdated: new Date(),
        version: "2.1.0"
      },
      assets: {
        thumbnail: "/api/placeholder/400/240",
        screenshots: ["/api/placeholder/800/600"],
        demoUrl: "#"
      },
      community: {
        rating: 4.8,
        reviewCount: 127,
        downloadCount: 2847,
        usageCount: 1523,
        favoriteCount: 891,
        recentReviews: []
      },
      author: {
        id: "author-1",
        name: "Sarah Mitchell",
        organization: "HR Excellence Inc.",
        verified: true,
        avatar: "/api/placeholder/40/40"
      },
      configuration: {
        isPublic: true,
        isPremium: true,
        price: 49,
        license: "cc-by",
        customizable: true,
        canFork: true
      },
      technical: {
        sopifyVersion: "2.0.0",
        features: ["enhanced-callouts", "decision-trees", "workflows"],
        integrations: ["slack", "workday"]
      },
      templateData: {
        title: "Employee Onboarding Process",
        topic: "Human Resources",
        description: "Complete onboarding workflow",
        companyName: "{company_name}",
        settings: {
          allowCustomization: true,
          requireApproval: false,
          autoUpdate: true,
          tracking: true
        },
        placeholders: {},
        customization: {
          branding: {
            allowLogoChange: true,
            allowColorChange: true,
            allowFontChange: true
          },
          content: {
            allowStepModification: true,
            allowStepAddition: true,
            allowStepDeletion: false
          },
          structure: {
            allowReordering: true,
            allowBranching: true
          }
        }
      },
      createdAt: new Date(Date.now() - 86400000 * 30),
      updatedAt: new Date(Date.now() - 86400000 * 7)
    },
    {
      id: "2",
      name: "HIPAA Compliance Checklist",
      description: "Comprehensive HIPAA compliance audit checklist for healthcare organizations. Includes risk assessment, documentation requirements, and employee training protocols.",
      shortDescription: "Complete HIPAA compliance audit and training system",
      category: "compliance",
      structure: {
        steps: [],
        estimatedTime: 180,
        difficulty: "advanced"
      },
      metadata: {
        industry: ["healthcare"],
        useCase: ["compliance-audit", "training-program"],
        complianceFrameworks: ["hipaa"],
        languages: ["English"],
        lastUpdated: new Date(),
        version: "1.5.2"
      },
      assets: {
        thumbnail: "/api/placeholder/400/240",
        screenshots: ["/api/placeholder/800/600"]
      },
      community: {
        rating: 4.9,
        reviewCount: 89,
        downloadCount: 1456,
        usageCount: 892,
        favoriteCount: 623,
        recentReviews: []
      },
      author: {
        id: "author-2",
        name: "Dr. Michael Chen",
        organization: "Healthcare Compliance Experts",
        verified: true,
        avatar: "/api/placeholder/40/40",
        expertBadges: [
          {
            id: "hipaa-expert",
            name: "HIPAA Expert",
            description: "Verified HIPAA compliance specialist",
            icon: "🏥",
            category: "compliance",
            earnedAt: new Date()
          }
        ]
      },
      configuration: {
        isPublic: true,
        isPremium: true,
        price: 89,
        license: "proprietary",
        customizable: true,
        canFork: false
      },
      technical: {
        sopifyVersion: "2.0.0",
        features: ["enhanced-callouts", "analytics", "workflows"],
        integrations: ["epic", "cerner"]
      },
      templateData: {
        title: "HIPAA Compliance Audit",
        topic: "Healthcare Compliance",
        description: "Comprehensive HIPAA compliance checklist",
        companyName: "{organization_name}",
        settings: {
          allowCustomization: true,
          requireApproval: true,
          autoUpdate: true,
          tracking: true
        },
        placeholders: {},
        customization: {
          branding: {
            allowLogoChange: true,
            allowColorChange: false,
            allowFontChange: false
          },
          content: {
            allowStepModification: false,
            allowStepAddition: true,
            allowStepDeletion: false
          },
          structure: {
            allowReordering: false,
            allowBranching: false
          }
        }
      },
      createdAt: new Date(Date.now() - 86400000 * 60),
      updatedAt: new Date(Date.now() - 86400000 * 3)
    }
  ]);

  const [collections] = useState<TemplateCollection[]>([
    {
      id: "collection-1",
      name: "Healthcare Essentials",
      description: "Complete collection of essential healthcare SOPs including patient care, safety protocols, and compliance checklists.",
      thumbnail: "/api/placeholder/300/200",
      templateIds: ["1", "2"],
      metadata: {
        category: "compliance",
        industry: ["healthcare"],
        useCase: ["compliance-audit", "safety-procedures"],
        curator: {
          id: "curator-1",
          name: "Healthcare Compliance Institute",
          organization: "HCI",
          verified: true
        },
        tags: ["healthcare", "compliance", "safety", "hipaa"]
      },
      community: {
        rating: 4.7,
        reviewCount: 45,
        downloadCount: 892,
        favoriteCount: 234
      },
      isOfficial: true,
      isPremium: true,
      price: 149,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const categories = [
    { id: "onboarding", name: "Onboarding", icon: "👋", count: 127 },
    { id: "training", name: "Training", icon: "📚", count: 89 },
    { id: "compliance", name: "Compliance", icon: "✅", count: 156 },
    { id: "safety", name: "Safety", icon: "🛡️", count: 203 },
    { id: "operations", name: "Operations", icon: "⚙️", count: 312 },
    { id: "hr", name: "Human Resources", icon: "👥", count: 98 },
    { id: "it", name: "IT & Technology", icon: "💻", count: 145 },
    { id: "customer-service", name: "Customer Service", icon: "📞", count: 76 }
  ];

  const handleTemplateAction = useCallback((template: SOPTemplate, action: 'select' | 'preview' | 'favorite') => {
    switch (action) {
      case 'select':
        onTemplateSelect?.(template);
        break;
      case 'preview':
        onTemplatePreview?.(template);
        break;
      case 'favorite':
        // Handle favorite toggle
        break;
    }
  }, [onTemplateSelect, onTemplatePreview]);

  const renderTemplateCard = (template: SOPTemplate, isCompact = false) => {
    const isFavorited = currentUser?.favorites.includes(template.id);
    const isDownloaded = currentUser?.downloads.includes(template.id);

    return (
      <motion.div
        key={template.id}
        whileHover={{ y: -4, scale: 1.02 }}
        className={`group relative ${isCompact ? 'flex gap-4' : ''}`}
      >
        <Card className="bg-zinc-900 border-zinc-700 hover:border-zinc-600 transition-all overflow-hidden">
          {/* Template Image */}
          <div className={`relative ${isCompact ? 'w-48 h-32' : 'h-48'} overflow-hidden`}>
            <img 
              src={template.assets.thumbnail} 
              alt={template.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Overlay badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {template.configuration.isPremium && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
              {template.author.verified && (
                <Badge className="bg-blue-600 text-white">
                  <Verified className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Action buttons overlay */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-black/70 border-none hover:bg-black/90"
                onClick={() => handleTemplateAction(template, 'favorite')}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </Button>
              {template.assets.demoUrl && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-black/70 border-none hover:bg-black/90"
                  onClick={() => handleTemplateAction(template, 'preview')}
                >
                  <Play className="h-4 w-4 text-white" />
                </Button>
              )}
            </div>

            {/* Price tag */}
            {template.configuration.isPremium && (
              <div className="absolute bottom-3 right-3">
                <Badge className="bg-green-600 text-white font-semibold">
                  ${template.configuration.price}
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-lg mb-1 line-clamp-1">
                  {template.name}
                </h3>
                <p className="text-zinc-400 text-sm line-clamp-2 mb-2">
                  {template.shortDescription}
                </p>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {template.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {template.structure.difficulty}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Clock className="h-3 w-3" />
                {Math.floor(template.structure.estimatedTime / 60)}h {template.structure.estimatedTime % 60}m
              </div>
            </div>

            {/* Author */}
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="w-6 h-6">
                <AvatarImage src={template.author.avatar} alt={template.author.name} />
                <AvatarFallback className="text-xs bg-purple-600 text-white">
                  {template.author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-zinc-400">{template.author.name}</span>
              {template.author.verified && (
                <Verified className="h-4 w-4 text-blue-400" />
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{template.community.rating}</span>
                  <span>({template.community.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  <span>{template.community.downloadCount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={() => handleTemplateAction(template, 'select')}
              >
                {isDownloaded ? 'Use Template' : (template.configuration.isPremium ? 'Purchase' : 'Use Free')}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-zinc-600"
                onClick={() => handleTemplateAction(template, 'preview')}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderFeaturedSection = () => (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900 rounded-2xl p-8 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">Featured Templates</h2>
          </div>
          <p className="text-lg text-purple-100 mb-6 max-w-2xl">
            Discover professionally crafted SOP templates that save time and ensure consistency across your organization.
          </p>
          <div className="flex gap-4">
            <Button className="bg-white text-purple-900 hover:bg-purple-50">
              Browse All Templates
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              Create Template
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Templates Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Top Rated Templates</h3>
          <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTemplates.map(template => renderTemplateCard(template))}
        </div>
      </div>

      {/* Featured Collections */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Curated Collections</h3>
          <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(collection => (
            <motion.div
              key={collection.id}
              whileHover={{ y: -4 }}
              className="group cursor-pointer"
              onClick={() => onCollectionSelect?.(collection)}
            >
              <Card className="bg-zinc-900 border-zinc-700 hover:border-zinc-600 transition-all overflow-hidden">
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={collection.thumbnail} 
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {collection.isOfficial && (
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <Award className="h-3 w-3 mr-1" />
                      Official
                    </Badge>
                  )}
                  {collection.isPremium && (
                    <Badge className="absolute bottom-3 right-3 bg-green-600 text-white">
                      ${collection.price}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-white mb-2">{collection.name}</h4>
                  <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{collection.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <BookOpen className="h-3 w-3" />
                        <span>{collection.templateIds.length} templates</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{collection.community.rating}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-zinc-600">
                      View Collection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Browse by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map(category => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors cursor-pointer"
              onClick={() => setFilters({ category: [category.id as TemplateCategory] })}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="text-sm font-medium text-white mb-1">{category.name}</div>
              <div className="text-xs text-zinc-400">{category.count} templates</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-purple-900/10 to-zinc-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Template Marketplace</h1>
              <p className="text-zinc-400">
                Discover, customize, and deploy professional SOP templates
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-zinc-600 text-zinc-300">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Upload className="h-4 w-4 mr-2" />
                Publish Template
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates, categories, or authors..."
              className="pl-12 pr-12 h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <BookOpen className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">1,247</div>
                    <div className="text-sm text-zinc-400">Templates</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">89</div>
                    <div className="text-sm text-zinc-400">Verified Authors</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600/20 rounded-lg">
                    <Download className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">45.2K</div>
                    <div className="text-sm text-zinc-400">Downloads</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-600/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">+23%</div>
                    <div className="text-sm text-zinc-400">Growth</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-zinc-800 border-zinc-700">
            <TabsTrigger value="discover" className="text-zinc-300 data-[state=active]:text-white">
              <Sparkles className="h-4 w-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="collections" className="text-zinc-300 data-[state=active]:text-white">
              <BookOpen className="h-4 w-4 mr-2" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="trending" className="text-zinc-300 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="my-library" className="text-zinc-300 data-[state=active]:text-white">
              <Heart className="h-4 w-4 mr-2" />
              My Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="mt-6">
            {renderFeaturedSection()}
          </TabsContent>

          <TabsContent value="collections" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map(collection => (
                <div key={collection.id}>
                  {/* Collection cards would go here */}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTemplates.map(template => renderTemplateCard(template))}
            </div>
          </TabsContent>

          <TabsContent value="my-library" className="mt-6">
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Your Library is Empty</h3>
              <p className="text-zinc-400 mb-4">Start building your collection by favoriting templates</p>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Browse Templates
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TemplateMarketplace; 