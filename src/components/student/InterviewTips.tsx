import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Check, AlertTriangle, Star, Clock, Mic, Eye, User, Code, Database } from "lucide-react";

export function InterviewTips() {
  const tips = [
    {
      title: "Research Thoroughly",
      description: "Understand the company culture, values, and recent news. Know the job description inside out.",
      icon: <Lightbulb className="w-6 h-6 text-indigo-600" />
    },
    {
      title: "Practice Out Loud",
      description: "Use our AI simulator to practice speaking clearly and confidently. Record yourself to identify areas for improvement.",
      icon: <Mic className="w-6 h-6 text-indigo-600" />
    },
    {
      title: "Use STAR Method",
      description: "Structure behavioral answers using Situation, Task, Action, Result format for maximum impact.",
      icon: <Star className="w-6 h-6 text-indigo-600" />
    },
    {
      title: "Time Management",
      description: "Practice concise responses. Most questions expect 1-2 minute answers with clear structure.",
      icon: <Clock className="w-6 h-6 text-indigo-600" />
    },
    {
      title: "Body Language",
      description: "Maintain good eye contact, sit up straight, and use natural gestures. Smile when appropriate.",
      icon: <Eye className="w-6 h-6 text-indigo-600" />
    },
    {
      title: "Ask Questions",
      description: "Prepare 3-5 thoughtful questions about the role, team, and company to show genuine interest.",
      icon: <User className="w-6 h-6 text-indigo-600" />
    }
  ];

  const technicalTips = [
    {
      title: "Algorithms Practice",
      description: "Focus on common patterns: two pointers, sliding window, DFS/BFS, dynamic programming.",
      icon: <Code className="w-6 h-6 text-indigo-600" />
    },
    {
      title: "System Design",
      description: "Understand scalability, reliability, and trade-offs. Practice with real-world examples.",
      icon: <Database className="w-6 h-6 text-indigo-600" />
    },
    {
      title: "Code Quality",
      description: "Write clean, readable code with proper naming, comments, and error handling.",
      icon: <Check className="w-6 h-6 text-indigo-600" />
    },
    {
      title: "Debugging",
      description: "Practice identifying and fixing bugs efficiently. Explain your thought process clearly.",
      icon: <AlertTriangle className="w-6 h-6 text-indigo-600" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* General Interview Tips */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Interview Success Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tips.map((tip, index) => (
              <div key={index} className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  {tip.icon}
                  <h3 className="font-medium text-indigo-800">{tip.title}</h3>
                </div>
                <p className="text-sm text-indigo-700">{tip.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Interview Tips */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Technical Interview Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technicalTips.map((tip, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  {tip.icon}
                  <h3 className="font-medium text-gray-900">{tip.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Common Mistakes to Avoid */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Common Mistakes to Avoid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
                <h3 className="font-medium text-red-800">Being Unprepared</h3>
              </div>
              <p className="text-sm text-red-700">
                Not researching the company or understanding the job requirements thoroughly.
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
                <h3 className="font-medium text-yellow-800">Rambling Answers</h3>
              </div>
              <p className="text-sm text-yellow-700">
                Giving overly long answers without clear structure or focus on what's important.
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
                <h3 className="font-medium text-red-800">Negative Attitude</h3>
              </div>
              <p className="text-sm text-red-700">
                Criticizing past employers or expressing negative views about work experiences.
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
                <h3 className="font-medium text-yellow-800">Poor Body Language</h3>
              </div>
              <p className="text-sm text-yellow-700">
                Avoiding eye contact, slouching, or appearing disinterested during the interview.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Preparation Checklist */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-green-800">Final Preparation Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-1" />
              <span className="text-sm text-green-800">Research company and role thoroughly</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-1" />
              <span className="text-sm text-green-800">Practice with our AI interview simulator</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-1" />
              <span className="text-sm text-green-800">Prepare questions for the interviewer</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-1" />
              <span className="text-sm text-green-800">Test your technology (camera, microphone, internet)</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-1" />
              <span className="text-sm text-green-800">Dress professionally and choose quiet location</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-1" />
              <span className="text-sm text-green-800">Get good night's sleep before the interview</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}