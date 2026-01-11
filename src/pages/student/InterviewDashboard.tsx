"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mic, Video, Play, Star, Clock, Check } from "lucide-react";

interface InterviewRound {
  id: string;
  name: string;
  description: string;
  status: "not-started" | "in-progress" | "completed";
}

export default function InterviewDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { companyId, roleId } = useParams();
  const location = useLocation();
  const { toast } = useToast();

  // Initialize rounds with their status from location state or default
  const [rounds, setRounds] = useState<InterviewRound[]>(() => {
    const state = location.state as { rounds?: InterviewRound[] } | null;
    if (state?.rounds) {
      return state.rounds;
    }

    // Define ONLY the required rounds for all companies and roles
    return [
      { id: "technical", name: "Technical Interview", description: "In-depth technical questions related to your role", status: "not-started" },
      { id: "hr", name: "HR / Behavioral", description: "Personality and cultural fit assessment", status: "not-started" },
      { id: "gd", name: "Group Discussion (GD)", description: "Collaborative discussion with AI participants", status: "not-started" }
    ];
  });

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in-progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      default:
        return "Not Started";
    }
  };

  // Capitalize company and role names for display
  const companyName = companyId ? companyId.charAt(0).toUpperCase() + companyId.slice(1) : "Company";
  const roleName = roleId ? 
    roleId === "frontend" ? "Frontend Engineer" :
    roleId === "backend" ? "Backend Engineer" :
    roleId === "ml" ? "ML Engineer" :
    roleId : "Role";

  const handleStartRound = (roundId: string) => {
    // Update round status to in-progress
    setRounds(prev => prev.map(round =>
      round.id === roundId ? { ...round, status: "in-progress" } : round
    ));

    // Navigate to appropriate screen
    if (roundId === "gd") {
      navigate(`/student/${companyId}/${roleId}/group-discussion`, {
        state: {
          rounds: rounds.map(round =>
            round.id === roundId ? { ...round, status: "in-progress" } : round
          )
        }
      });
    } else {
      // For other rounds, navigate to video interview page
      navigate(`/student/${companyId}/${roleId}/video-interview`, {
        state: {
          rounds: rounds.map(round =>
            round.id === roundId ? { ...round, status: "in-progress" } : round
          ),
          currentRound: roundId
        }
      });
    }
  };

  // Handle round completion from child components
  useEffect(() => {
    const state = location.state as { completedRound?: string } | null;
    if (state?.completedRound) {
      setRounds(prev => prev.map(round =>
        round.id === state.completedRound ? { ...round, status: "completed" } : round
      ));
    }
  }, [location.state]);

  const handleStartAISimulation = () => {
    navigate("/student/interview-simulation");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Interview Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.email}</span>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {companyName} - {roleName}
            </h2>
            <p className="text-gray-600">
              Prepare for each round of your interview process
            </p>
          </div>

          {/* AI Interview Simulation Card */}
          <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-indigo-800 flex items-center gap-2">
                <Star className="w-6 h-6" />
                AI Interview Simulation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-indigo-700 mb-3">
                    Practice realistic interviews with voice responses, behavioral tracking, and detailed feedback.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary" className="flex items-center gap-1 bg-indigo-100 text-indigo-800">
                      <Mic className="w-3 h-3" />
                      Voice Responses
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1 bg-indigo-100 text-indigo-800">
                      <Video className="w-3 h-3" />
                      Video Tracking
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1 bg-indigo-100 text-indigo-800">
                      <Clock className="w-3 h-3" />
                      Real-time Feedback
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={handleStartAISimulation}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 flex items-center gap-2 whitespace-nowrap"
                >
                  <Play className="w-5 h-5" />
                  Start AI Simulation
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rounds.map((round) => (
              <Card key={round.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">{round.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-600 mb-4">{round.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant={getStatusVariant(round.status)}>
                      {getStatusText(round.status)}
                    </Badge>
                    {round.status === "completed" ? (
                      <span className="text-green-600 font-medium">Completed</span>
                    ) : (
                      <Button
                        onClick={() => handleStartRound(round.id)}
                        disabled={round.status === "in-progress"}
                      >
                        {round.id === "gd" ? "Start GD" : "Start Round"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}