import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Rocket, Play, Clock, Check, Star, Code, Database, Brain, Target, User, Building, Briefcase, AlertTriangle, Lightbulb, BarChart, LineChart, PieChart, Download, Filter, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { InterviewStatusTracker } from "@/components/student/InterviewStatusTracker";
import { InterviewQuickStart } from "@/components/student/InterviewQuickStart";
import { InterviewTips } from "@/components/student/InterviewTips";
import { PerformanceAnalytics } from "@/components/student/PerformanceAnalytics";

interface InterviewRound {
  id: string;
  name: string;
  status: "not-started" | "in-progress" | "completed" | "failed";
  score?: number;
  date?: string;
}

export default function InterviewSimulation() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Update the interviewRounds state to match the InterviewRound type
  const [interviewRounds, setInterviewRounds] = useState<InterviewRound[]>(() => {
    const state = location.state as { rounds?: InterviewRound[] } | null;
    if (state?.rounds) {
      return state.rounds;
    }

    // Define ONLY the required rounds for all companies and roles with proper types
    return [
      { id: "technical", name: "Technical Interview", description: "In-depth technical questions related to your role", status: "not-started" },
      { id: "hr", name: "HR / Behavioral", description: "Personality and cultural fit assessment", status: "not-started" },
      { id: "gd", name: "Group Discussion (GD)", description: "Collaborative discussion with AI participants", status: "not-started" }
    ];
  });

  // Mock data for performance analytics
  const performanceMetrics = [
    { name: "Overall Score", value: 85, previous: 78 },
    { name: "Technical Skills", value: 90, previous: 85 },
    { name: "Communication", value: 80, previous: 75 },
    { name: "Problem Solving", value: 88, previous: 82 }
  ];

  // Mock data for interview reports
  const interviewReports = [
    {
      id: "1",
      company: "Google",
      role: "Frontend Engineer",
      score: 85,
      date: "2024-03-15",
      companyLogo: "G"
    },
    {
      id: "2",
      company: "Microsoft",
      role: "Backend Engineer",
      score: 90,
      date: "2024-03-10",
      companyLogo: "M"
    }
  ];

  const handleResumeRound = (roundId: string) => {
    console.log("Resume round:", roundId);
    // In a real implementation, this would navigate to the appropriate round
  };

  const handleDownloadReport = (reportId: string) => {
    console.log("Download report:", reportId);
    // In a real implementation, this would trigger a PDF download
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Interview Simulation</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.email}</span>
            <Button onClick={() => navigate("/student")} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Interview Status Tracker */}
          <InterviewStatusTracker
            company="Google"
            role="Frontend Engineer"
            rounds={interviewRounds}
            onResumeRound={handleResumeRound}
          />

          {/* Quick Start Section */}
          <InterviewQuickStart />

          {/* Interview Tips */}
          <InterviewTips />

          {/* Performance Analytics */}
          <PerformanceAnalytics
            metrics={performanceMetrics}
            reports={interviewReports}
            onDownloadReport={handleDownloadReport}
          />
        </div>
      </main>
    </div>
  );
}