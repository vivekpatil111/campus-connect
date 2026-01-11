import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home } from "lucide-react";
import { InterviewSetup } from "@/components/interview/InterviewSetup";
import { InterviewEngine } from "@/components/interview/InterviewEngine";
import { InterviewReport } from "@/components/interview/InterviewReport";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function InterviewSimulation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviewState, setInterviewState] = useState<"setup" | "active" | "completed">("setup");
  const [interviewConfig, setInterviewConfig] = useState({
    company: "",
    role: "",
    type: ""
  });
  const [interviewResults, setInterviewResults] = useState({
    answers: [],
    scores: {
      technical: 0,
      communication: 0,
      engagement: 0,
      overall: 0,
      confidenceLevel: "Beginner"
    }
  });

  // Enhanced: Company-specific question banks
  const companyQuestions = {
    Google: {
      Technical: [
        "Explain how HashMap works internally in Java",
        "Design a URL shortening service like bit.ly",
        "Reverse a linked list iteratively and recursively",
        "Implement LRU Cache",
        "Find the median of two sorted arrays"
      ],
      HR: [
        "Tell me about a time you disagreed with your manager",
        "How do you handle tight deadlines?",
        "Describe your ideal work environment",
        "Why do you want to work at Google?",
        "How do you stay updated with technology trends?"
      ]
    },
    Microsoft: {
      Technical: [
        "Explain the concept of polymorphism in OOP",
        "Design a parking lot system",
        "Find the longest palindromic substring",
        "Implement a thread-safe singleton pattern",
        "Explain REST vs GraphQL"
      ],
      HR: [
        "Describe a project where you took leadership",
        "How do you handle failure?",
        "What motivates you to excel?",
        "Tell me about a time you influenced a team decision",
        "How do you prioritize tasks?"
      ]
    },
    Amazon: {
      Technical: [
        "Explain the difference between TCP and UDP",
        "Design a distributed cache system",
        "Implement binary search tree operations",
        "Find the longest consecutive sequence in array",
        "Explain microservices architecture"
      ],
      HR: [
        "Tell me about a time you solved a customer problem",
        "Describe when you went above and beyond for a project",
        "How do you handle conflicts in a team?",
        "Give an example of when you showed leadership",
        "Why Amazon specifically?"
      ]
    }
  };

  const handleStartInterview = (company: string, role: string, type: string) => {
    setInterviewConfig({ company, role, type });
    setInterviewState("active");
  };

  const handleCompleteInterview = (answers: any[], scores: any) => {
    setInterviewResults({ answers, scores });
    setInterviewState("completed");
  };

  const handleBackToSetup = () => {
    setInterviewState("setup");
  };

  const handleBackToDashboard = () => {
    navigate("/student");
  };

  // Enhanced: Get interviewer name based on company
  const getInterviewerName = (company: string) => {
    const interviewers = {
      Google: "Alex Thompson",
      Microsoft: "Sarah Johnson",
      Amazon: "Michael Chen"
    };
    return interviewers[company as keyof typeof interviewers] || "AI Interviewer";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBackToDashboard}
                variant="outline"
                size="icon"
                className="text-gray-600 hover:text-gray-900"
              >
                <Home className="w-5 h-5" />
              </Button>
              {interviewState !== "setup" && (
                <Button
                  onClick={handleBackToSetup}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Setup
                </Button>
              )}
            </div>
            <div className="text-sm text-gray-600">
              Welcome, {user?.email}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Interview Simulation</h1>
          <p className="text-gray-600">
            Practice realistic interviews with voice responses, behavioral tracking, and detailed feedback
          </p>
        </div>

        {/* Interview Setup */}
        {interviewState === "setup" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InterviewSetup onStartInterview={handleStartInterview} />

            {/* Enhanced: Company Selection Card */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Company-Specific Interviews
                </CardTitle>
                <p className="text-gray-600">
                  Choose from top tech companies for realistic interview experiences
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="text-center p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <span className="text-xl font-bold text-blue-600">G</span>
                    </div>
                    <h3 className="font-medium mb-1">Google</h3>
                    <p className="text-sm text-gray-600">Algorithms & System Design</p>
                  </Card>

                  <Card className="text-center p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <span className="text-xl font-bold text-red-600">M</span>
                    </div>
                    <h3 className="font-medium mb-1">Microsoft</h3>
                    <p className="text-sm text-gray-600">OOP & Cloud Focused</p>
                  </Card>

                  <Card className="text-center p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <span className="text-xl font-bold text-orange-600">A</span>
                    </div>
                    <h3 className="font-medium mb-1">Amazon</h3>
                    <p className="text-sm text-gray-600">Customer-Centric</p>
                  </Card>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="font-medium text-indigo-800 mb-2">Interview Types</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Technical</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>HR/Behavioral</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active Interview */}
        {interviewState === "active" && (
          <div className="flex flex-col h-[calc(100vh-200px)]">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {interviewConfig.company} - {interviewConfig.role} Interview
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {interviewConfig.type} • Realistic simulation with voice and video
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-indigo-800 mb-2">Interview Instructions</h3>
                  <ul className="space-y-1 text-sm text-indigo-700">
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Enable camera and microphone for full experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Answer each question completely before proceeding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Maintain good eye contact and professional presence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>You have 5 minutes per question</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <InterviewEngine
              company={interviewConfig.company}
              role={interviewConfig.role}
              interviewType={interviewConfig.type}
              questions={companyQuestions[interviewConfig.company as keyof typeof companyQuestions]?.[interviewConfig.type] || []}
              onComplete={handleCompleteInterview}
              onClose={handleBackToSetup}
            />
          </div>
        )}

        {/* Interview Report */}
        {interviewState === "completed" && (
          <InterviewReport
            company={interviewConfig.company}
            role={interviewConfig.role}
            type={interviewConfig.type}
            answers={interviewResults.answers}
            scores={interviewResults.scores}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            AI Interview Simulation • CampusPrep
            <span className="mx-2">•</span>
            Built by Team Block Minds
          </p>
        </div>
      </footer>
    </div>
  );
}