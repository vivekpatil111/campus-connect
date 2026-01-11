import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Play, Pause, StopCircle, Check, X, AlertTriangle, Clock, Eye, Camera, Volume2, VolumeX, CheckCircle, AlertCircle, Loader2, Video, Brain, ChevronRight, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CompanyInterviewSelection } from "@/components/interview/CompanyInterviewSelection";
import { InterviewEngine } from "@/components/interview/InterviewEngine";
import { InterviewCompletionScreen } from "@/components/interview/InterviewCompletionScreen";

export function AIInterviewModal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showCompanySelection, setShowCompanySelection] = useState(false);
  const [showVideoInterview, setShowVideoInterview] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedInterviewType, setSelectedInterviewType] = useState<string | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [interviewAnswers, setInterviewAnswers] = useState<any[]>([]);
  const [engagementMetrics, setEngagementMetrics] = useState<any>(null);

  // Company-specific question banks
  const companyQuestions = {
    Google: {
      Technical: [
        "Design a scalable web crawler system",
        "Implement LRU Cache with O(1) operations",
        "Find median of two sorted arrays",
        "Design YouTube video streaming system",
        "Explain how HashMap works internally"
      ],
      HR: [
        "Tell me about a time you disagreed with your manager",
        "How do you handle tight deadlines?",
        "Describe when you showed leadership",
        "Why do you want to work at Google?",
        "How do you stay updated with technology?"
      ]
    },
    Microsoft: {
      Technical: [
        "Design a parking lot management system",
        "Implement thread-safe singleton pattern",
        "Reverse linked list iteratively and recursively",
        "Find longest palindromic substring",
        "Explain REST vs GraphQL"
      ],
      HR: [
        "Describe a project where you took leadership",
        "How do you handle failure?",
        "What motivates you to excel?",
        "Tell me about influencing a team decision",
        "How do you prioritize tasks?"
      ]
    },
    Amazon: {
      Technical: [
        "Design distributed cache system",
        "Implement binary search tree operations",
        "Explain microservices architecture",
        "Design scalable e-commerce system",
        "Find longest consecutive sequence"
      ],
      HR: [
        "Tell me about going above and beyond",
        "How do you handle conflicts in team?",
        "Give example of customer problem solving",
        "Why Amazon specifically?",
        "Describe time you showed ownership"
      ]
    }
  };

  const toggleBot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset state when opening
      resetInterviewState();
    }
  };

  const resetInterviewState = () => {
    setShowCompanySelection(false);
    setShowVideoInterview(false);
    setShowCompletionScreen(false);
    setSelectedCompany(null);
    setSelectedRole(null);
    setSelectedInterviewType(null);
    setInterviewQuestions([]);
    setInterviewAnswers([]);
    setEngagementMetrics(null);
  };

  const handleStartInterview = (company: string, role: string, type: string) => {
    setSelectedCompany(company);
    setSelectedRole(role);
    setSelectedInterviewType(type);

    // Get questions for selected company and type
    const questions = companyQuestions[company as keyof typeof companyQuestions]?.[type] || [];
    setInterviewQuestions(questions);

    setShowCompanySelection(false);
    setShowVideoInterview(true);
  };

  const handleInterviewComplete = (answers: any[], metrics: any) => {
    setInterviewAnswers(answers);
    setEngagementMetrics(metrics);
    setShowVideoInterview(false);
    setShowCompletionScreen(true);
  };

  const handleNextRound = () => {
    // In a real implementation, this would start the next round
    // For now, just close the completion screen
    setShowCompletionScreen(false);
    setShowCompanySelection(true);
  };

  const handleCloseCompletion = () => {
    setShowCompletionScreen(false);
    setShowCompanySelection(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={toggleBot}
        className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg animate-bounce"
        aria-label="AI Interview Mentor"
      >
        <Brain className="w-8 h-8 text-white" />
      </Button>

      {/* AI Interview Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Interview Mentor</CardTitle>
                  <CardDescription>Your personal interview coach</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleBot}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>

            <CardContent className="flex-grow overflow-hidden flex flex-col">
              <div className="flex-grow overflow-y-auto space-y-4 p-4">
                {!showCompanySelection && !showVideoInterview && !showCompletionScreen && (
                  <div className="text-center py-8 space-y-6">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                      <Brain className="w-10 h-10 text-indigo-600" />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to AI Interview Mentor</h3>
                      <p className="text-gray-600 mb-4">
                        Practice realistic video interviews with AI-powered questions and feedback
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                      <Card className="bg-indigo-50">
                        <CardContent className="p-4 text-center">
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Building className="w-6 h-6 text-indigo-600" />
                          </div>
                          <h4 className="font-medium text-indigo-800">Company-Specific</h4>
                          <p className="text-sm text-indigo-600">Google, Microsoft, Amazon</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-indigo-50">
                        <CardContent className="p-4 text-center">
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Video className="w-6 h-6 text-indigo-600" />
                          </div>
                          <h4 className="font-medium text-indigo-800">Video Interviews</h4>
                          <p className="text-sm text-indigo-600">Real video call experience</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Button
                      onClick={() => setShowCompanySelection(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 flex items-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Start Interview Practice
                    </Button>
                  </div>
                )}
              </div>

              <div className="border-t p-4 bg-gray-50">
                <Button
                  onClick={toggleBot}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Company Selection Modal */}
      {showCompanySelection && (
        <CompanyInterviewSelection
          onStartInterview={handleStartInterview}
          onClose={() => setShowCompanySelection(false)}
        />
      )}

      {/* Video Interview Interface */}
      {showVideoInterview && selectedCompany && selectedRole && selectedInterviewType && (
        <InterviewEngine
          company={selectedCompany}
          role={selectedRole}
          interviewType={selectedInterviewType}
          questions={interviewQuestions}
          onComplete={handleInterviewComplete}
          onClose={() => {
            setShowVideoInterview(false);
            setShowCompanySelection(true);
          }}
        />
      )}

      {/* Completion Screen */}
      {showCompletionScreen && selectedCompany && selectedRole && selectedInterviewType && (
        <InterviewCompletionScreen
          company={selectedCompany}
          role={selectedRole}
          interviewType={selectedInterviewType}
          answers={interviewAnswers}
          engagementMetrics={engagementMetrics}
          onClose={handleCloseCompletion}
          onNextRound={handleNextRound}
        />
      )}
    </div>
  );
}