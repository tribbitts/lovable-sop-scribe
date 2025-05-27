
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { 
  Star, 
  MessageSquare, 
  Calendar, 
  Mail, 
  Filter,
  Download,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface FeedbackData {
  id: string;
  module_title: string;
  module_url?: string;
  helpful_rating: number;
  clear_rating: number;
  comments?: string;
  user_email?: string;
  created_at: string;
}

interface FeedbackStats {
  totalFeedback: number;
  averageHelpful: number;
  averageClear: number;
  responseRate: number;
}

const FeedbackViewer: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('itm_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFeedback(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (feedbackData: FeedbackData[]) => {
    if (feedbackData.length === 0) {
      setStats({ totalFeedback: 0, averageHelpful: 0, averageClear: 0, responseRate: 0 });
      return;
    }

    const totalFeedback = feedbackData.length;
    const averageHelpful = feedbackData.reduce((sum, item) => sum + item.helpful_rating, 0) / totalFeedback;
    const averageClear = feedbackData.reduce((sum, item) => sum + item.clear_rating, 0) / totalFeedback;
    
    setStats({
      totalFeedback,
      averageHelpful: Math.round(averageHelpful * 10) / 10,
      averageClear: Math.round(averageClear * 10) / 10,
      responseRate: 85 // This would be calculated based on actual training completions
    });
  };

  const getUniqueModules = () => {
    const modules = [...new Set(feedback.map(item => item.module_title))];
    return modules.sort();
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.module_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.comments?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModule === 'all' || item.module_title === selectedModule;
    return matchesSearch && matchesModule;
  });

  const exportFeedback = () => {
    const csvContent = [
      ['Date', 'Module', 'Helpful Rating', 'Clear Rating', 'Comments', 'Email'].join(','),
      ...filteredFeedback.map(item => [
        new Date(item.created_at).toLocaleDateString(),
        `"${item.module_title}"`,
        item.helpful_rating,
        item.clear_rating,
        `"${item.comments || ''}"`,
        item.user_email || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itm-feedback-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading feedback data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-zinc-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">ITM Feedback Dashboard</h1>
            <p className="text-zinc-400">Monitor training effectiveness and user satisfaction</p>
          </div>
          <Button onClick={exportFeedback} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Total Feedback</p>
                    <p className="text-2xl font-bold text-white">{stats.totalFeedback}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Avg Helpful</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-white">{stats.averageHelpful}</p>
                      <div className="flex">{renderStars(Math.round(stats.averageHelpful))}</div>
                    </div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Avg Clarity</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-white">{stats.averageClear}</p>
                      <div className="flex">{renderStars(Math.round(stats.averageClear))}</div>
                    </div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Response Rate</p>
                    <p className="text-2xl font-bold text-white">{stats.responseRate}%</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="bg-zinc-800 border-zinc-700 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
              <div className="w-full md:w-64">
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 text-white rounded-md px-3 py-2"
                >
                  <option value="all">All Modules</option>
                  {getUniqueModules().map(module => (
                    <option key={module} value={module}>{module}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="feedback" className="w-full">
          <TabsList className="bg-zinc-800 border-zinc-700">
            <TabsTrigger value="feedback" className="data-[state=active]:bg-zinc-700">
              Individual Feedback
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-zinc-700">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-4 mt-4">
            {filteredFeedback.length === 0 ? (
              <Card className="bg-zinc-800 border-zinc-700">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-300 mb-2">No feedback found</h3>
                  <p className="text-zinc-500">No feedback matches your current filters.</p>
                </CardContent>
              </Card>
            ) : (
              filteredFeedback.map((item) => (
                <Card key={item.id} className="bg-zinc-800 border-zinc-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white text-lg">{item.module_title}</CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                          {item.user_email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {item.user_email}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-green-600 text-white">
                          Helpful: {item.helpful_rating}/5
                        </Badge>
                        <Badge className="bg-blue-600 text-white">
                          Clear: {item.clear_rating}/5
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  {item.comments && (
                    <CardContent>
                      <div className="bg-zinc-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-zinc-400" />
                          <span className="text-sm font-medium text-zinc-300">Comments</span>
                        </div>
                        <p className="text-zinc-200">{item.comments}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-white mb-4">Coming Soon: Advanced Analytics</h3>
                <p className="text-zinc-400">
                  Advanced analytics including module performance trends, satisfaction over time, 
                  and detailed insights will be available in the next update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FeedbackViewer;
