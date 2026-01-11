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

  // ... rest of the component code