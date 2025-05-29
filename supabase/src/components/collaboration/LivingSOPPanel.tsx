
import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Users, 
  GitBranch, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Edit,
  Send,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Eye,
  BarChart3,
  Bell,
  Archive,
  Star,
  Flag
} from "lucide-react";
import type { SopDocument } from "@/types/sop";
import type { 
  SOPComment, 
  SOPSuggestion, 
  SOPChangeRequest,
  RealTimeCollaboration,
  SOPAnalytics
} from "@/types/living-sop";
import { v4 as uuidv4 } from "uuid";

interface LivingSOPPanelProps {
  document: SopDocument;
  isOpen: boolean;
  onClose: () => void;
  onAddComment?: (comment: Omit<SOPComment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddSuggestion?: (suggestion: Omit<SOPSuggestion, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onSubmitChangeRequest?: (request: Omit<SOPChangeRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  collaboration?: RealTimeCollaboration;
  analytics?: SOPAnalytics;
}

const LivingSOPPanel: React.FC<LivingSOPPanelProps> = ({
  document,
  isOpen,
  onClose,
  onAddComment,
  onAddSuggestion,
  onSubmitChangeRequest,
  currentUser,
  collaboration,
  analytics
}) => {
  const [activeTab, setActiveTab] = useState("activity");
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState<SOPComment['type']>("general");
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  
  // Mock data for demonstration
  const [comments, setComments] = useState<SOPComment[]>([
    {
      id: "1",
      stepId: "step-1",
      userId: "user-1",
      userName: "Sarah Wilson",
      userEmail: "sarah@company.com",
      content: "This step could be clearer about the specific file formats supported.",
      type: "suggestion",
      status: "open",
      priority: "medium",
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      updatedAt: new Date(Date.now() - 86400000)
    },
    {
      id: "2",
      userId: "user-2",
      userName: "Mike Chen",
      userEmail: "mike@company.com",
      content: "Great SOP! Very comprehensive and easy to follow.",
      type: "general",
      status: "open",
      priority: "low",
      reactions: [
        { userId: "user-3", emoji: "👍", timestamp: new Date() }
      ],
      createdAt: new Date(Date.now() - 43200000), // 12 hours ago
      updatedAt: new Date(Date.now() - 43200000)
    }
  ]);

  const [suggestions, setSuggestions] = useState<SOPSuggestion[]>([
    {
      id: "1",
      stepId: "step-2",
      userId: "user-3",
      userName: "Dr. Emily Rodriguez",
      suggestedChange: {
        field: "description",
        original: "Check the system status",
        suggested: "Check the system status and verify all indicators are green"
      },
      reasoning: "This would make the step more specific and reduce ambiguity.",
      status: "pending",
      impact: "minor",
      category: "clarity",
      createdAt: new Date(Date.now() - 21600000), // 6 hours ago
      updatedAt: new Date(Date.now() - 21600000)
    }
  ]);

  const handleSubmitComment = useCallback(() => {
    if (!newComment.trim() || !currentUser) return;

    const comment: Omit<SOPComment, 'id' | 'createdAt' | 'updatedAt'> = {
      stepId: selectedStep || undefined,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userAvatar: currentUser.avatar,
      content: newComment.trim(),
      type: commentType,
      status: "open",
      priority: commentType === "issue" ? "high" : "medium"
    };

    if (onAddComment) {
      onAddComment(comment);
    }

    // Add to local state for demo
    const newCommentWithId: SOPComment = {
      ...comment,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setComments(prev => [newCommentWithId, ...prev]);
    setNewComment("");
    setCommentType("general");
    setSelectedStep(null);
  }, [newComment, commentType, selectedStep, currentUser, onAddComment]);

  const renderActiveUsers = () => {
    if (!collaboration?.activeUsers.length) return null;

    return (
      <div className="flex items-center gap-2 mb-4">
        <div className="flex -space-x-2">
          {collaboration.activeUsers.slice(0, 3).map((user) => (
            <Avatar key={user.userId} className="w-8 h-8 border-2 border-zinc-800">
              <AvatarImage src={user.avatar} alt={user.userName} />
              <AvatarFallback className="text-xs bg-purple-600 text-white">
                {user.userName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          ))}
          {collaboration.activeUsers.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-zinc-800 flex items-center justify-center text-xs text-zinc-300">
              +{collaboration.activeUsers.length - 3}
            </div>
          )}
        </div>
        <span className="text-sm text-zinc-400">
          {collaboration.activeUsers.length} active user{collaboration.activeUsers.length !== 1 ? 's' : ''}
        </span>
      </div>
    );
  };

  const renderComments = () => (
    <div className="space-y-4">
      {/* New Comment Form */}
      <Card className="bg-zinc-800 border-zinc-700">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Select value={commentType} onValueChange={(value) => setCommentType(value as SOPComment['type'])}>
                <SelectTrigger className="w-32 bg-zinc-900 border-zinc-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-600">
                  <SelectItem value="general" className="text-white">General</SelectItem>
                  <SelectItem value="suggestion" className="text-white">Suggestion</SelectItem>
                  <SelectItem value="issue" className="text-white">Issue</SelectItem>
                  <SelectItem value="question" className="text-white">Question</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStep || "document-level"} onValueChange={(value) => setSelectedStep(value === "document-level" ? null : value)}>
                <SelectTrigger className="flex-1 bg-zinc-900 border-zinc-600 text-white">
                  <SelectValue placeholder="Select step (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-600">
                  <SelectItem value="document-level" className="text-white">Document-level comment</SelectItem>
                  {document.steps.map((step, index) => (
                    <SelectItem key={step.id} value={step.id} className="text-white">
                      Step {index + 1}: {step.title || step.description.slice(0, 30)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment, suggestion, or question..."
              className="bg-zinc-900 border-zinc-600 text-white"
              rows={3}
            />
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Comment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                <AvatarFallback className="text-xs bg-blue-600 text-white">
                  {comment.userName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">{comment.userName}</span>
                  <Badge 
                    variant={comment.type === 'issue' ? 'destructive' : 
                            comment.type === 'suggestion' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {comment.type}
                  </Badge>
                  {comment.stepId && (
                    <Badge variant="outline" className="text-xs text-zinc-400">
                      Step {document.steps.findIndex(s => s.id === comment.stepId) + 1}
                    </Badge>
                  )}
                  <span className="text-xs text-zinc-500">
                    {comment.createdAt.toLocaleString()}
                  </span>
                </div>
                
                <p className="text-zinc-300 text-sm mb-2">{comment.content}</p>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-zinc-400 hover:text-white">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {comment.reactions?.filter(r => r.emoji === '👍').length || 0}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-zinc-400 hover:text-white">
                    Reply
                  </Button>
                  {comment.status === 'open' && (
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-zinc-400 hover:text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderSuggestions = () => (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <Card key={suggestion.id} className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-green-600 text-white">
                    {suggestion.userName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-medium text-white">{suggestion.userName}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {suggestion.category}
                    </Badge>
                    <Badge 
                      variant={suggestion.impact === 'major' ? 'destructive' : 
                              suggestion.impact === 'moderate' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {suggestion.impact} impact
                    </Badge>
                  </div>
                </div>
              </div>
              <Badge 
                variant={suggestion.status === 'pending' ? 'default' : 
                        suggestion.status === 'accepted' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {suggestion.status}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="bg-zinc-900 rounded p-3">
                <div className="text-xs text-zinc-400 mb-1">Original:</div>
                <div className="text-sm text-zinc-300">{suggestion.suggestedChange.original}</div>
              </div>
              
              <div className="bg-green-900/20 border border-green-600/30 rounded p-3">
                <div className="text-xs text-green-400 mb-1">Suggested:</div>
                <div className="text-sm text-white">{suggestion.suggestedChange.suggested}</div>
              </div>
              
              <div className="text-sm text-zinc-400">
                <strong>Reasoning:</strong> {suggestion.reasoning}
              </div>
              
              {suggestion.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" className="border-zinc-600">
                    <Edit className="h-4 w-4 mr-2" />
                    Modify
                  </Button>
                  <Button size="sm" variant="destructive">
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Views</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {analytics?.usage.views || 247}
            </div>
            <div className="text-xs text-zinc-400">
              {analytics?.usage.uniqueViewers || 89} unique viewers
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-white">Engagement</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {analytics?.engagement.comments || comments.length}
            </div>
            <div className="text-xs text-zinc-400">
              {analytics?.engagement.suggestions || suggestions.length} suggestions
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-3">
            {collaboration?.recentActivity?.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center gap-3">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-purple-600 text-white">
                    {activity.userName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-zinc-300">
                    <span className="font-medium">{activity.userName}</span>
                    {' '}{activity.action}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {activity.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-sm text-zinc-400 text-center py-4">
                No recent activity
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed right-0 top-0 h-full w-96 bg-zinc-900 border-l border-zinc-700 shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            Living SOP
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        {renderActiveUsers()}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-zinc-800 border-b border-zinc-700 rounded-none">
          <TabsTrigger value="activity" className="text-zinc-300 data-[state=active]:text-white">
            <MessageCircle className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="text-zinc-300 data-[state=active]:text-white">
            <Edit className="h-4 w-4 mr-2" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-zinc-300 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="activity" className="h-full m-0 p-4 overflow-y-auto">
            {renderComments()}
          </TabsContent>

          <TabsContent value="suggestions" className="h-full m-0 p-4 overflow-y-auto">
            {renderSuggestions()}
          </TabsContent>

          <TabsContent value="analytics" className="h-full m-0 p-4 overflow-y-auto">
            {renderAnalytics()}
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
};

export default LivingSOPPanel;
