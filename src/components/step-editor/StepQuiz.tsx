import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GraduationCap, FileText } from "lucide-react";
import { SopStep, QuizQuestion } from "@/types/sop";

interface StepQuizProps {
  step: SopStep;
  onUpdateQuestions: (questions: QuizQuestion[]) => void;
}

const StepQuiz: React.FC<StepQuizProps> = ({ step, onUpdateQuestions }) => {
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [newItmOnly, setNewItmOnly] = useState(true); // Default to ITM-only

  const addQuestion = () => {
    if (!newQuestion.trim()) return;

    const filteredOptions = newOptions.filter(opt => opt.trim());
    
    const question: QuizQuestion = {
      id: Date.now().toString(),
      question: newQuestion,
      type: "multiple-choice",
      options: filteredOptions,
      correctAnswer: filteredOptions[correctAnswerIndex] || filteredOptions[0],
      explanation: "",
      itmOnly: newItmOnly
    };

    const updatedQuestions = [...(step.quizQuestions || []), question];
    onUpdateQuestions(updatedQuestions);

    // Reset form
    setNewQuestion("");
    setNewOptions(["", "", "", ""]);
    setCorrectAnswerIndex(0);
    setNewItmOnly(true);
  };

  const removeQuestion = (questionId: string) => {
    const updatedQuestions = (step.quizQuestions || []).filter(q => q.id !== questionId);
    onUpdateQuestions(updatedQuestions);
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...newOptions];
    updated[index] = value;
    setNewOptions(updated);
  };

  const getCorrectAnswerIndex = (question: QuizQuestion): number => {
    if (!question.options) return 0;
    return question.options.findIndex(option => option === question.correctAnswer);
  };

  const toggleQuestionItmOnly = (questionId: string) => {
    const updatedQuestions = (step.quizQuestions || []).map(question => 
      question.id === questionId 
        ? { ...question, itmOnly: !question.itmOnly }
        : question
    );
    onUpdateQuestions(updatedQuestions);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="h-5 w-5 text-purple-400" />
        <h4 className="font-semibold text-purple-400">Training Quiz</h4>
        <Badge className="bg-purple-600 text-white text-xs">
          Interactive Learning
        </Badge>
      </div>

      {/* Existing Questions */}
      {step.quizQuestions && step.quizQuestions.length > 0 && (
        <div className="space-y-3">
          {step.quizQuestions.map((question, index) => {
            const correctIndex = getCorrectAnswerIndex(question);
            return (
              <Card key={question.id} className="bg-zinc-800/50 border-zinc-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="text-sm font-medium text-zinc-200">
                          Question {index + 1}
                        </h5>
                        {question.itmOnly ? (
                          <Badge className="bg-purple-600 text-white text-xs">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            ITM-Only
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-600 text-white text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            PDF + ITM
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-zinc-300">{question.question}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-zinc-400">ITM-Only</Label>
                        <Switch
                          checked={question.itmOnly || false}
                          onCheckedChange={() => toggleQuestionItmOnly(question.id)}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {question.options?.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          optIndex === correctIndex ? 'bg-green-400' : 'bg-zinc-600'
                        }`} />
                        <span className="text-sm text-zinc-300">{option}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add New Question */}
      <Card className="bg-zinc-800/30 border-zinc-700">
        <CardHeader>
          <h5 className="text-sm font-medium text-zinc-300">Add New Question</h5>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-zinc-300">Question</Label>
            <Textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Enter your quiz question..."
              className="bg-zinc-800 border-zinc-700 text-white mt-1"
            />
          </div>

          <div>
            <Label className="text-zinc-300">Answer Options</Label>
            <div className="space-y-2 mt-1">
              {newOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectAnswerIndex(index)}
                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      correctAnswerIndex === index 
                        ? 'bg-green-400 border-green-400' 
                        : 'border-zinc-600 hover:border-zinc-500'
                    }`}
                  />
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Click the circle to mark the correct answer
            </p>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
            <div>
              <Label className="text-zinc-300">Content Destination</Label>
              <p className="text-xs text-zinc-500">
                {newItmOnly 
                  ? "Quiz will only appear in interactive training module" 
                  : "Quiz will appear in both PDF and interactive training"
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-zinc-400">ITM-Only</Label>
              <Switch
                checked={newItmOnly}
                onCheckedChange={setNewItmOnly}
              />
            </div>
          </div>

          <Button
            onClick={addQuestion}
            disabled={!newQuestion.trim() || newOptions.filter(opt => opt.trim()).length < 2}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepQuiz;
