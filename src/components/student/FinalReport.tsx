import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Mock PDF generation function (in a real app, you would use a library like jsPDF)
const generatePDF = (reportData: any) => {
  // This is a placeholder for actual PDF generation
  // In a real implementation, you would use a library like jsPDF
  console.log("Generating PDF with data:", reportData);
  alert("PDF would be generated here with the report data");
};

interface ReportData {
  studentProfile: any;
  company: string;
  role: string;
  rounds: any[];
  gdPerformance: any;
  behavioralAnalysis: any;
  strengths: string[];
  improvements: string[];
  readinessLevel: "Beginner" | "Intermediate" | "Job-Ready";
  date: Date;
}

interface InterviewHistoryItem {
  id: string;
  company: string;
  role: string;
  readinessLevel: "Beginner" | "Intermediate" | "Job-Ready";
  date: Date;
  reportData: ReportData;
}

export function FinalReport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [allRoundsCompleted, setAllRoundsCompleted] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState<InterviewHistoryItem[]>([]);

  // Check if all rounds are completed
  useEffect(() => {
    const checkCompletion = async () => {
      if (!user) return;
      
      try {
        // In a real implementation, you would check actual round completion
        // For this demo, we'll assume all rounds are completed
        setAllRoundsCompleted(true);
        
        // Mock report data
        const mockReportData: ReportData = {
          studentProfile: {
            name: user.email,
            email: user.email
          },
          company: "Google",
          role: "Frontend Engineer",
          rounds: [
            { name: "Video Interview", score: 85, status: "completed" },
            { name: "Fundamental Screening", score: 78, status: "completed" },
            { name: "Technical Interview", score: 92, status: "completed" },
            { name: "Coding / Problem Solving", score: 88, status: "completed" },
            { name: "HR / Behavioral", score: 80, status: "completed" },
            { name: "Group Discussion", score: 75, status: "completed" }
          ],
          gdPerformance: {
            communication: 82,
            participation: 78,
            leadership: 70,
            topicRelevance: 85
          },
          behavioralAnalysis: {
            eyeContact: "Good",
            stability: "Needs Improvement",
            engagement: "Excellent"
          },
          strengths: [
            "Strong technical knowledge",
            "Clear communication",
            "Good problem-solving skills"
          ],
          improvements: [
            "Work on maintaining consistent eye contact",
            "Reduce fidgeting during interviews",
            "Improve time management in coding challenges"
          ],
          readinessLevel: "Intermediate",
          date: new Date()
        };
        
        setReportData(mockReportData);
      } catch (error) {
        console.error("Error checking completion:", error);
        toast({
          title: "Error",
          description: "Failed to check round completion status",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkCompletion();
  }, [user, toast]);

  // Fetch interview history
  useEffect(() => {
    if (!user) return;
    
    // In a real implementation, you would fetch actual interview history from Firestore
    // For this demo, we'll create mock data
    const mockHistory: InterviewHistoryItem[] = [
      {
        id: "1",
        company: "Google",
        role: "Frontend Engineer",
        readinessLevel: "Intermediate",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        reportData: {} as ReportData // In a real app, this would contain the full report data
      },
      {
        id: "2",
        company: "Microsoft",
        role: "Backend Engineer",
        readinessLevel: "Job-Ready",
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        reportData: {} as ReportData
      },
      {
        id: "3",
        company: "Amazon",
        role: "ML Engineer",
        readinessLevel: "Beginner",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
        reportData: {} as ReportData
      }
    ];
    
    setInterviewHistory(mockHistory);
  }, [user]);

  const handleGenerateReport = (reportData: any) => {
    generatePDF(reportData);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!allRoundsCompleted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-xl font-semibold mb-2">Report Not Available</h3>
          <p className="text-gray-600">
            Complete all interview rounds to generate your final report
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Final Interview Report</h2>
        <p className="text-gray-600">
          Comprehensive analysis of your interview performance
        </p>
      </div>
      
      {reportData && (
        <div className="space-y-6">
          {/* Student Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Student Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{reportData.studentProfile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{reportData.studentProfile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{reportData.company}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{reportData.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Final Readiness Level */}
          <Card>
            <CardHeader>
              <CardTitle>Final Readiness Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6">
                <Badge 
                  variant={
                    reportData.readinessLevel === "Beginner" 
                      ? "destructive" 
                      : reportData.readinessLevel === "Intermediate" 
                        ? "secondary" 
                        : "default"
                  } 
                  className="text-lg py-2 px-6"
                >
                  {reportData.readinessLevel}
                </Badge>
                <p className="mt-4 text-center text-gray-600 max-w-md">
                  {reportData.readinessLevel === "Beginner" 
                    ? "Continue practicing fundamental skills and concepts" 
                    : reportData.readinessLevel === "Intermediate" 
                      ? "You're making good progress, focus on advanced topics and real-world scenarios" 
                      : "You're well-prepared for job interviews, keep refining your skills"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Interview History Section */}
      <Card>
        <CardHeader>
          <CardTitle>Interview History</CardTitle>
          <p className="text-gray-600 text-sm">
            View your past interviews and download detailed reports
          </p>
        </CardHeader>
        <CardContent>
          {interviewHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No interview history available
            </p>
          ) : (
            <div className="space-y-4">
              {interviewHistory.map((interview) => (
                <div 
                  key={interview.id} 
                  className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-medium">
                      {interview.company} - {interview.role}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {interview.date.toLocaleDateString()} • {interview.readinessLevel}
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleGenerateReport(interview.reportData)} 
                    className="whitespace-nowrap"
                  >
                    Download PDF Report
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* PDF Footer */}
      <div className="mt-12 pt-6 border-t text-center">
        <p className="text-sm text-gray-500">
          Generated by CampusPrep — From Campus to Career
          <span className="mx-2">•</span>
          Built by Team Block Minds
        </p>
      </div>
    </div>
  );
}