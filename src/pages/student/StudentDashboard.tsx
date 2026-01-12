"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Code, Database, Brain, Target, User, Briefcase, Rocket, Play, Clock, Check, Star, AlertTriangle, Lightbulb, BarChart, LineChart, PieChart, Download, Filter, Calendar, TrendingUp, TrendingDown, Video, Mic, FileText } from "lucide-react";
import { AIResumeBot } from "@/components/student/AIResumeBot";
import { AIInterviewModal } from "@/components/student/AIInterviewModal";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Mock data for dashboard
  const interviewStats = {
    totalPracticed: 12,
    avgScore: 78,
    lastPractice: "2026-01-10",
    upcomingInterviews: 3
  };

  const skillAssessment = [
    { skill: "JavaScript", level: 85, change: 12 },
    { skill: "React", level: 78, change: 5 },
    { skill: "Node.js", level: 72, change: -3 },
    { skill: "Python", level: 65, change: 8 }
  ];

  const recentActivities = [
    { id: 1, type: "interview", company: "Google", role: "Frontend Engineer", date: "2026-01-08", score: 82 },
    { id: 2, type: "resume", action: "Updated resume", date: "2026-01-05" },
    { id: 3, type: "interview", company: "Microsoft", role: "Backend Engineer", date: "2026-01-03", score: 75 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.email}</span>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Stats Cards */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews Practiced</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interviewStats.totalPracticed}</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Interview Score</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interviewStats.avgScore}%</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interviewStats.upcomingInterviews}</div>
              <p className="text-xs text-muted-foreground">Scheduled this week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interview Practice Section */}
          <div className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-indigo-600" />
                  Interview Practice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-800 mb-2">AI-Powered Interview Practice</h3>
                  <p className="text-indigo-700 text-sm mb-4">
                    Practice with our advanced AI interviewer that simulates real interview scenarios with video and voice capabilities.
                  </p>
                  <AIInterviewModal />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => navigate("/student/alumni")}
                  >
                    <User className="h-4 w-4" />
                    Connect with Alumni
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => navigate("/student/mock-interviews")}
                  >
                    <Play className="h-4 w-4" />
                    Mock Interviews
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Skill Assessment */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Skill Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillAssessment.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.skill}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{item.level}%</span>
                          {item.change > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${item.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Resume Bot */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI Resume Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Upload your resume and get AI-powered analysis to find the best alumni mentors for you.
                </p>
                <AIResumeBot />
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      {activity.type === "interview" ? (
                        <Video className="h-5 w-5 text-blue-500 mt-0.5" />
                      ) : (
                        <FileText className="h-5 w-5 text-green-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        {activity.type === "interview" ? (
                          <>
                            <p className="font-medium">
                              {activity.company} - {activity.role}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                Score: {activity.score}%
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {activity.date}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-xs text-gray-500">{activity.date}</p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}