import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, X, AlertTriangle, Star, Download, Eye, Clock, MessageCircle, ThumbsUp, ThumbsDown, BarChart, TrendingUp, TrendingDown, Loader2, Users, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { generateInterviewPDF } from "@/utils/pdfGenerator";

interface InterviewCompletionScreenProps {
  company: string;
  role: string;
  interviewType: string;
  answers: any[];
  engagementMetrics: any;
  onClose: () => void;
  onNextRound: () => void;
}

export function InterviewCompletionScreen({
  company,
  role,
  interviewType,
  answers,
  engagementMetrics,
  onClose,
  onNextRound
}: InterviewCompletionScreenProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [reportSaved, setReportSaved] = useState(false);

  // Calculate scores
  const calculateTechnicalScore = () => {
    if (answers.length === 0) return 0;

    let totalScore = 0;
    answers.forEach(answer => {
      // Simple scoring based on answer length and time
      const wordCount = answer.transcript.split(/\s+/).length;
      const timeScore = Math.min(100, 100 - (answer.timeTaken / 300000) * 100); // 5 min max
      const wordScore = Math.min(100, (wordCount / 200) * 100); // 200 words ideal

      totalScore += (timeScore * 0.4 + wordScore * 0.6);
    });

    return Math.round(totalScore / answers.length);
  };

  const calculateCommunicationScore = () => {
    if (answers.length === 0) return 0;

    let totalScore = 0;
    answers.forEach(answer => {
      const wordCount = answer.transcript.split(/\s+/).length;
      const sentenceCount = answer.transcript.split(/[.!?]+/).length;

      // Ideal word count range (100-300 words)
      const wordScore = Math.min(100, 100 - Math.abs(200 - wordCount));

      // Sentence structure (at least 3 sentences)
      const sentenceScore = Math.min(100, (sentenceCount / 3) * 100);

      totalScore += (wordScore * 0.6 + sentenceScore * 0.4);
    });

    return Math.round(totalScore / answers.length);
  };

  const calculateEngagementScore = () => {
    if (engagementMetrics.totalDuration === 0) return 0;

    const faceScore = Math.min(100, engagementMetrics.faceDetected / engagementMetrics.totalDuration * 100);
    const speakingScore = Math.min(100, engagementMetrics.speakingTime / engagementMetrics.totalDuration * 100);
    const cameraScore = Math.min(100, engagementMetrics.cameraOnDuration / engagementMetrics.totalDuration * 100);

    return Math.round((faceScore * 0.4 + speakingScore * 0.3 + cameraScore * 0.3));
  };

  const calculateOverallScore = () => {
    const technicalScore = calculateTechnicalScore();
    const communicationScore = calculateCommunicationScore();
    const engagementScore = calculateEngagementScore();

    return Math.round(technicalScore * 0.5 + communicationScore * 0.3 + engagementScore * 0.2);
  };

  const getConfidenceLevel = (score: number) => {
    if (score >= 85) return "Job-Ready";
    if (score >= 70) return "Intermediate";
    if (score >= 50) return "Beginner";
    return "Needs Improvement";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <ThumbsUp className="w-5 h-5 text-green-600" />;
    if (score >= 70) return <Check className="w-5 h-5 text-blue-600" />;
    if (score >= 50) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <X className="w-5 h-5 text-red-600" />;
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
      // Prepare interview result data
      const interviewResult = {
        company,
        role,
        interviewType,
        answers,
        metrics: engagementMetrics,
        technicalScore: calculateTechnicalScore(),
        hrScore: calculateCommunicationScore(),
        overallScore: calculateOverallScore(),
        candidateName: user.email || "Anonymous",
        candidateEmail: user.email || "",
        date: new Date()
      };

      // Generate PDF
      const pdfBlob = generateInterviewPDF(interviewResult);

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Interview_Report_${company}_${role}_${interviewType}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Save report to Firebase
      const reportData = {
        studentId: user.uid,
        studentName: user.email || "Anonymous",
        company,
        role,
        interviewType,
        date: new Date(),
        duration: answers.reduce((total, answer) => total + answer.timeTaken, 0),
        scores: {
          technical: calculateTechnicalScore(),
          communication: calculateCommunicationScore(),
          engagement: calculateEngagementScore(),
          overall: calculateOverallScore()
        },
        answers: answers.map(answer => ({
          question: answer.questionId,
          transcriptPreview: answer.transcript.substring(0, 100) + "...",
          timeTaken: answer.timeTaken,
          score: calculateAnswerScore(answer)
        })),
        engagement: engagementMetrics,
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

  const calculateAnswerScore = (answer: any) => {
    const wordCount = answer.transcript.split(/\s+/).length;
    const timeScore = Math.min(100, 100 - (answer.timeTaken / 300000) * 100);
    const wordScore = Math.min(100, (wordCount / 200) * 100);

    return Math.round((timeScore * 0.4 + wordScore * 0.6));
  };

  const getInterviewerName = (company: string) => {
    const interviewers = {
      Google: "Alex Thompson",
      Microsoft: "Sarah Johnson",
      Amazon: "Michael Chen"
    };
    return interviewers[company as keyof typeof interviewers] || "AI Interviewer";
  };

  const technicalScore = calculateTechnicalScore();
  const communicationScore = calculateCommunicationScore();
  const engagementScore = calculateEngagementScore();
  const overallScore = calculateOverallScore();
  const confidenceLevel = getConfidenceLevel(overallScore);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle className="text-xl">Interview Complete!</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow overflow-y-auto p-4 space-y-6">
            {/* Company Header */}
            <div className="bg-indigo-50 rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-indigo-800 mb-2">
                {company} Interview Complete!
              </h2>
              <p className="text-indigo-700 mb-4">
                {role} - {interviewType} Round
              </p>

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
                    strokeDasharray={`${overallScore * 3.6}, 360`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-gray-900">{overallScore}%</span>
                    <p className="text-sm text-gray-600 mt-1">Overall Score</p>
                  </div>
                </div>
              </div>

              <Badge variant="default" className="text-lg py-2 px-6 mb-4">
                {confidenceLevel}
              </Badge>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Technical</p>
                  <div className="flex items-center justify-center gap-1">
                    {getScoreIcon(technicalScore)}
                    <span className="font-medium">{technicalScore}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Communication</p>
                  <div className="flex items-center justify-center gap-1">
                    {getScoreIcon(communicationScore)}
                    <span className="font-medium">{communicationScore}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Engagement</p>
                  <div className="flex items-center justify-center gap-1">
                    {getScoreIcon(engagementScore)}
                    <span className="font-medium">{engagementScore}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Questions</p>
                  <div className="flex items-center justify-center gap-1">
                    <Check className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{answers.length}</span>
                  </div>
                </div>
              </div>
            </div>

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
                      <span className="text-sm font-medium">{technicalScore}%</span>
                    </div>
                    <Progress value={technicalScore} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Communication Skills</span>
                      <span className="text-sm font-medium">{communicationScore}%</span>
                    </div>
                    <Progress value={communicationScore} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Engagement & Presence</span>
                      <span className="text-sm font-medium">{engagementScore}%</span>
                    </div>
                    <Progress value={engagementScore} className="h-2" />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-900 mb-2">Overall Assessment</h3>
                  <p className="text-gray-600">
                    Based on your performance, you're at a <strong>{confidenceLevel}</strong> level for {role} interviews at {company}.
                    {overallScore >= 85 ? " You're well-prepared for actual interviews!" :
                     overallScore >= 70 ? " With some more practice, you'll be job-ready." :
                     " Continue practicing to improve your skills."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Engagement Metrics</CardTitle>
                <CardDescription>
                  Your engagement during the interview session
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Engagement Scores</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Camera Active</span>
                      <span className="text-sm font-medium">
                        {engagementMetrics.totalDuration > 0 ? Math.round(engagementMetrics.cameraOnDuration / engagementMetrics.totalDuration * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Face Present</span>
                      <span className="text-sm font-medium">
                        {engagementMetrics.totalDuration > 0 ? Math.round(engagementMetrics.faceDetected / engagementMetrics.totalDuration * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Speaking Time</span>
                      <span className="text-sm font-medium">
                        {engagementMetrics.totalDuration > 0 ? Math.round(engagementMetrics.speakingTime / engagementMetrics.totalDuration * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Behavioral Feedback</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <MessageCircle className="w-4 h-4 text-indigo-600 mt-0.5" />
                      <span>Maintained good camera presence throughout</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Eye className="w-4 h-4 text-indigo-600 mt-0.5" />
                      <span>Face was visible for most of the interview</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Mic className="w-4 h-4 text-indigo-600 mt-0.5" />
                      <span>Spoke clearly and confidently</span>
                    </li>
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
                  {answers.slice(0, 3).map((answer, index) => {
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
          </div>

          <div className="border-t p-4 bg-gray-50 flex justify-center gap-3">
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
              onClick={onNextRound}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Next Round
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}