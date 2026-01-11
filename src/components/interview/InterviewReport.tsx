import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, X, AlertTriangle, Star, Download, Eye, Clock, MessageCircle, ThumbsUp, ThumbsDown, BarChart, TrendingUp, TrendingDown, Loader2, Users, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";

interface InterviewAnswer {
  questionId: string;
  transcript: string;
  timeTaken: number;
  timestamp: Date;
  behavioralMetrics: {
    faceDetectedPercentage: number;
    eyeContactScore: number;
    headStability: number;
    cameraOnDuration: number;
    micActivity: number;
  };
}

interface InterviewScores {
  technical: number;
  communication: number;
  engagement: number;
  overall: number;
  confidenceLevel: string;
}

interface InterviewReportProps {
  company: string;
  role: string;
  type: string;
  answers: InterviewAnswer[];
  scores: InterviewScores;
}

export function InterviewReport({ company, role, type, answers, scores }: InterviewReportProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [reportSaved, setReportSaved] = useState(false);

  // Enhanced: Get company-specific feedback
  const getCompanySpecificFeedback = (company: string, scores: InterviewScores) => {
    const feedback = {
      Google: {
        strengths: [
          "Strong problem-solving skills",
          "Good understanding of algorithms and data structures",
          "Clear communication of technical concepts"
        ],
        improvements: [
          "Practice more system design questions",
          "Work on optimizing time complexity",
          "Improve explanation of trade-offs"
        ],
        tips: [
          "Focus on Google's core values in behavioral questions",
          "Practice coding on a whiteboard",
          "Review Google's engineering principles"
        ]
      },
      Microsoft: {
        strengths: [
          "Good OOP knowledge",
          "Clear understanding of design patterns",
          "Strong debugging skills"
        ],
        improvements: [
          "Practice more cloud-related questions",
          "Work on Azure services knowledge",
          "Improve system design explanations"
        ],
        tips: [
          "Focus on Microsoft's leadership principles",
          "Practice coding in C#",
          "Review Microsoft's product ecosystem"
        ]
      },
      Amazon: {
        strengths: [
          "Good understanding of distributed systems",
          "Clear problem-solving approach",
          "Strong customer focus"
        ],
        improvements: [
          "Practice more scalability questions",
          "Work on AWS services knowledge",
          "Improve behavioral question responses"
        ],
        tips: [
          "Focus on Amazon's leadership principles",
          "Practice STAR method for behavioral questions",
          "Review Amazon's customer obsession culture"
        ]
      }
    };

    return feedback[company as keyof typeof feedback] || {
      strengths: ["Good technical knowledge", "Clear communication"],
      improvements: ["Practice more questions", "Work on time management"],
      tips: ["Review company values", "Practice regularly"]
    };
  };

  // Enhanced: Get company-specific interviewer name
  const getInterviewerName = (company: string) => {
    const interviewers = {
      Google: "Alex Thompson",
      Microsoft: "Sarah Johnson",
      Amazon: "Michael Chen"
    };
    return interviewers[company as keyof typeof interviewers] || "AI Interviewer";
  };

  // Save report to Firebase
  useEffect(() => {
    const saveReportToFirebase = async () => {
      if (!user || reportSaved) return;

      try {
        const reportData = {
          studentId: user.uid,
          studentName: user.email || "Anonymous",
          company,
          role,
          type,
          date: new Date(),
          duration: calculateTotalDuration(),
          scores,
          answers: answers.map(answer => ({
            questionId: answer.questionId,
            transcriptPreview: answer.transcript.substring(0, 100) + "...",
            timeTaken: answer.timeTaken,
            score: calculateAnswerScore(answer)
          })),
          companySpecific: getCompanySpecificFeedback(company, scores),
          createdAt: serverTimestamp()
        };

        // Save to interviewReports collection
        const reportRef = await addDoc(collection(db, "interviewReports"), reportData);

        // Also save to user's reports subcollection
        await setDoc(doc(db, "users", user.uid, "interviewReports", reportRef.id), {
          ...reportData,
          reportId: reportRef.id
        });

        setReportSaved(true);
        console.log("Report saved to Firebase:", reportRef.id);
      } catch (error) {
        console.error("Error saving report:", error);
        toast({
          title: "Error",
          description: "Failed to save report to database",
          variant: "destructive"
        });
      }
    };

    saveReportToFirebase();
  }, [user, company, role, type, answers, scores, reportSaved]);

  const calculateTotalDuration = () => {
    return answers.reduce((total, answer) => total + answer.timeTaken, 0);
  };

  const calculateAverageTime = () => {
    return answers.length > 0 ? Math.round(calculateTotalDuration() / answers.length / 1000) : 0;
  };

  const calculateAnswerScore = (answer: InterviewAnswer) => {
    // Simple scoring based on time and behavioral metrics
    const timeScore = Math.min(100, 100 - (answer.timeTaken / 300000) * 100); // 5 min max
    const behaviorScore = (
      answer.behavioralMetrics.faceDetectedPercentage * 0.3 +
      answer.behavioralMetrics.eyeContactScore * 0.3 +
      answer.behavioralMetrics.micActivity * 0.4
    );

    return Math.round((timeScore * 0.4 + behaviorScore * 0.6));
  };

  const getStrengths = () => {
    const companyFeedback = getCompanySpecificFeedback(company, scores);
    const strengths: string[] = [];

    if (scores.technical >= 80) {
      strengths.push("Strong technical knowledge and problem-solving skills");
    }

    if (scores.communication >= 80) {
      strengths.push("Excellent communication and clarity in responses");
    }

    if (scores.engagement >= 80) {
      strengths.push("Great engagement and professional presentation");
    }

    if (calculateAverageTime() <= 90) {
      strengths.push("Efficient response time management");
    }

    // Add company-specific strengths
    strengths.push(...companyFeedback.strengths);

    return strengths.length > 0 ? strengths : ["Good overall performance"];
  };

  const getImprovements = () => {
    const companyFeedback = getCompanySpecificFeedback(company, scores);
    const improvements: string[] = [];

    if (scores.technical < 60) {
      improvements.push("Work on technical depth and accuracy in answers");
    }

    if (scores.communication < 60) {
      improvements.push("Improve response structure and clarity");
    }

    if (scores.engagement < 60) {
      improvements.push("Enhance engagement with better camera presence and eye contact");
    }

    if (calculateAverageTime() > 150) {
      improvements.push("Practice more concise responses to improve time management");
    }

    // Add company-specific improvements
    improvements.push(...companyFeedback.improvements);

    return improvements.length > 0 ? improvements : ["Continue practicing to refine your skills"];
  };

  const getBehavioralFeedback = () => {
    const feedback: string[] = [];

    const avgBehavioral = answers.reduce((sum, answer) => {
      return sum +
        answer.behavioralMetrics.faceDetectedPercentage +
        answer.behavioralMetrics.eyeContactScore +
        answer.behavioralMetrics.micActivity;
    }, 0) / (answers.length * 3);

    if (avgBehavioral >= 80) {
      feedback.push("Excellent behavioral engagement throughout the interview");
    } else if (avgBehavioral >= 60) {
      feedback.push("Good behavioral engagement, could improve consistency");
    } else {
      feedback.push("Work on maintaining better engagement and professional presence");
    }

    return feedback;
  };

  const generatePDFReport = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPDF(true);

    try {
      // Simulate PDF generation since jsPDF is not available
      console.log("Generating PDF report...");

      // Create mock PDF content with company-specific information
      const pdfContent = `
        Interview Performance Report
        ============================

        Candidate: ${user.email || "Anonymous"}
        Company: ${company}
        Role: ${role}
        Interview Type: ${type}
        Interviewer: ${getInterviewerName(company)}
        Date: ${new Date().toLocaleDateString()}
        Duration: ${Math.round(calculateTotalDuration() / 1000)} seconds

        Performance Scores:
        - Technical: ${scores.technical}%
        - Communication: ${scores.communication}%
        - Engagement: ${scores.engagement}%
        - Overall: ${scores.overall}%
        - Confidence Level: ${scores.confidenceLevel}

        ${company}-Specific Feedback:
        ${getCompanySpecificFeedback(company, scores).tips.map((tip: string, index: number) => `• ${tip}`).join('\n')}

        Strengths:
        ${getStrengths().map(strength => `• ${strength}`).join('\n')}

        Areas for Improvement:
        ${getImprovements().map(improvement => `• ${improvement}`).join('\n')}

        Behavioral Feedback:
        ${getBehavioralFeedback().map(feedback => `• ${feedback}`).join('\n')}

        Generated by CampusPrep AI Interview System
        From Campus to Career • Built by Team Block Minds
      `;

      // Create a blob and download link
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Interview_Report_${company}_${role}_${type}_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Your interview report has been downloaded successfully",
        variant: "default"
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getScoreLevel = (score: number) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Improvement";
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-blue-100 text-blue-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <ThumbsUp className="w-5 h-5 text-green-600" />;
    if (score >= 70) return <Check className="w-5 h-5 text-blue-600" />;
    if (score >= 50) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <X className="w-5 h-5 text-red-600" />;
  };

  // Calculate average behavioral metrics
  const avgBehavioralMetrics = answers.length > 0 ? {
    faceDetectedPercentage: Math.round(answers.reduce((sum, answer) => sum + answer.behavioralMetrics.faceDetectedPercentage, 0) / answers.length),
    eyeContactScore: Math.round(answers.reduce((sum, answer) => sum + answer.behavioralMetrics.eyeContactScore, 0) / answers.length),
    micActivity: Math.round(answers.reduce((sum, answer) => sum + answer.behavioralMetrics.micActivity, 0) / answers.length),
    cameraOnDuration: Math.round(answers.reduce((sum, answer) => sum + answer.behavioralMetrics.cameraOnDuration, 0) / answers.length)
  } : {
    faceDetectedPercentage: 0,
    eyeContactScore: 0,
    micActivity: 0,
    cameraOnDuration: 0
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Complete!</h1>
        <p className="text-gray-600">
          Here's your comprehensive performance analysis
        </p>
      </div>

      {/* Enhanced: Company Header Card */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">
            {company} Interview Performance
          </CardTitle>
          <p className="text-center text-gray-600">
            {role} - {type} Interview • AI Interviewer: {getInterviewerName(company)}
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray={`${scores.overall * 3.6}, 360`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-3xl font-bold text-gray-900">{scores.overall}%</span>
                <p className="text-sm text-gray-600 mt-1">Overall Score</p>
              </div>
            </div>
          </div>

          <Badge variant="default" className="text-lg py-2 px-6 mb-4">
            {scores.confidenceLevel}
          </Badge>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Technical</p>
              <div className="flex items-center justify-center gap-1">
                {getScoreIcon(scores.technical)}
                <span className="font-medium">{scores.technical}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Communication</p>
              <div className="flex items-center justify-center gap-1">
                {getScoreIcon(scores.communication)}
                <span className="font-medium">{scores.communication}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Engagement</p>
              <div className="flex items-center justify-center gap-1">
                {getScoreIcon(scores.engagement)}
                <span className="font-medium">{scores.engagement}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Avg Time</p>
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{calculateAverageTime()}s</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Breakdown */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Technical Knowledge</span>
                <span className="text-sm font-medium">{scores.technical}%</span>
              </div>
              <Progress value={scores.technical} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Communication Skills</span>
                <span className="text-sm font-medium">{scores.communication}%</span>
              </div>
              <Progress value={scores.communication} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Engagement & Presence</span>
                <span className="text-sm font-medium">{scores.engagement}%</span>
              </div>
              <Progress value={scores.engagement} className="h-2" />
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium text-gray-900 mb-2">Overall Assessment</h3>
            <p className="text-gray-600">
              Based on your performance, you're at a <strong>{scores.confidenceLevel}</strong> level for {role} interviews at {company}.
              {scores.overall >= 85 ? " You're well-prepared for actual interviews!" :
               scores.overall >= 70 ? " With some more practice, you'll be job-ready." :
               " Continue practicing to improve your skills."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced: Company-Specific Feedback */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800">
            <Star className="w-5 h-5" />
            {company}-Specific Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-indigo-800 mb-2">Strengths</h3>
              <ul className="space-y-2 text-sm">
                {getStrengths().map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-indigo-800 mb-2">Areas for Improvement</h3>
              <ul className="space-y-2 text-sm">
                {getImprovements().map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-indigo-800 mb-2">Company-Specific Tips</h3>
            <ul className="space-y-2 text-sm">
              {getCompanySpecificFeedback(company, scores).tips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-indigo-600 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <ThumbsUp className="w-5 h-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {getStrengths().map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <TrendingUp className="w-5 h-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {getImprovements().map((improvement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Behavioral Analysis */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Behavioral Analysis</CardTitle>
          <CardDescription>
            Engagement metrics from your interview session
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Engagement Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Camera Active</span>
                <span className="text-sm font-medium">
                  {avgBehavioralMetrics.cameraOnDuration}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Eye Contact</span>
                <span className="text-sm font-medium">
                  {avgBehavioralMetrics.eyeContactScore}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Microphone Activity</span>
                <span className="text-sm font-medium">
                  {avgBehavioralMetrics.micActivity}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Behavioral Feedback</h3>
            <ul className="space-y-2 text-sm">
              {getBehavioralFeedback().map((feedback, index) => (
                <li key={index} className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-indigo-600 mt-0.5" />
                  <span>{feedback}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Question Performance */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Question Performance</CardTitle>
          <CardDescription>
            Detailed breakdown of your answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {answers.map((answer, index) => {
              const answerScore = calculateAnswerScore(answer);
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">
                      Question {index + 1}
                    </h3>
                    <Badge variant="secondary" className="text-sm">
                      {answerScore}%
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Time: {Math.round(answer.timeTaken / 1000)} seconds</span>
                    <span>Words: {answer.transcript.split(/\s+/).length}</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-sm text-gray-500">Behavioral Metrics</span>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {answer.behavioralMetrics.faceDetectedPercentage}%
                      </span>
                    </div>
                  </div>
                  <Progress value={answerScore} className="h-1 mb-3" />
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {answer.transcript}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
        <Button
          onClick={generatePDFReport}
          disabled={isGeneratingPDF}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Report
            </>
          )}
        </Button>

        <Button
          onClick={() => navigate("/student")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Dashboard
        </Button>

        <Button
          onClick={() => navigate("/student/alumni")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          Connect with Mentors
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t">
        <p>
          This report provides interview readiness analysis based on your performance.
          Behavioral metrics are for engagement tracking only and do not constitute psychological analysis.
        </p>
        <p className="mt-1">
          Built by Team Block Minds • CampusPrep Interview System
        </p>
      </div>
    </div>
  );
}