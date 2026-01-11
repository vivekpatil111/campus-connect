import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Check, Clock, X, AlertTriangle, Play, Pause, User, Code } from "lucide-react";

interface InterviewRound {
  id: string;
  name: string;
  status: "not-started" | "in-progress" | "completed" | "failed";
  score?: number;
  date?: string;
}

interface InterviewStatusTrackerProps {
  company: string;
  role: string;
  rounds: InterviewRound[];
  onResumeRound: (roundId: string) => void;
}

export function InterviewStatusTracker({ company, role, rounds, onResumeRound }: InterviewStatusTrackerProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-600"><Check className="w-3 h-3 mr-1" /> Completed</Badge>;
      case "in-progress":
        return <Badge variant="secondary" className="bg-yellow-600"><Clock className="w-3 h-3 mr-1" /> In Progress</Badge>;
      case "failed":
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline"><AlertTriangle className="w-3 h-3 mr-1" /> Not Started</Badge>;
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case "completed": return 100;
      case "in-progress": return 50;
      case "failed": return 25;
      default: return 0;
    }
  };

  const calculateOverallProgress = () => {
    const total = rounds.length;
    const completed = rounds.filter(r => r.status === "completed").length;
    const inProgress = rounds.filter(r => r.status === "in-progress").length;
    return Math.round(((completed * 100) + (inProgress * 50)) / total);
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          {company} - {role} Interview Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="bg-indigo-50 rounded-lg p-4">
          <h3 className="font-medium text-indigo-800 mb-3">Overall Progress</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray={`${calculateOverallProgress() * 3.6}, 360`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{calculateOverallProgress()}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
              <p className="font-medium text-gray-900">
                {rounds.filter(r => r.status === "completed").length} of {rounds.length} rounds completed
              </p>
            </div>
          </div>
        </div>

        {/* Individual Round Status */}
        <div className="space-y-4">
          {rounds.map((round) => (
            <div key={round.id} className="border rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    {round.id === "hr" ? (
                      <User className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Code className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{round.name}</h3>
                    {round.date && (
                      <p className="text-sm text-gray-500">Last attempted: {round.date}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(round.status)}
                  {round.status === "in-progress" && (
                    <Button
                      onClick={() => onResumeRound(round.id)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Play className="w-4 h-4" />
                      Resume
                    </Button>
                  )}
                  {round.status === "failed" && (
                    <Button
                      onClick={() => onResumeRound(round.id)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Pause className="w-4 h-4" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{getProgressValue(round.status)}%</span>
                </div>
                <Progress value={getProgressValue(round.status)} className="h-2" />
              </div>

              {round.score && (
                <div className="mt-2 text-sm text-gray-600">
                  Score: <span className="font-medium">{round.score}%</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline">
            View All Interviews
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Start New Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}