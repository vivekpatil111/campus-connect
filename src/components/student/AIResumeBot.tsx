"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Upload, X, Send, Check, AlertTriangle, Loader2, MessageCircle, Brain, FileText, GraduationCap, Linkedin, Star, ThumbsUp, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";

interface BotMessage {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
  type?: "text" | "loading" | "error" | "success" | "info";
}

interface AlumniProfile {
  uid: string;
  fullName?: string;
  college?: string;
  department?: string;
  branch?: string;
  passingYear?: number;
  company?: string;
  role?: string;
  skills?: string[];
  linkedin?: string;
  experience?: number;
}

interface ResumeAnalysisResult {
  domain: string;
  skills: string[];
  suggestedRoles: string[];
  alumniMatches: AlumniProfile[];
  confidenceScore: number;
  improvementTips: string[];
}

export function AIResumeBot() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Domain to skills mapping for RAG logic
  const domainMappings: Record<string, string[]> = {
    "Machine Learning": ["machine learning", "ML", "AI", "artificial intelligence", "data science", "neural networks"],
    "Web Development": ["web development", "frontend", "backend", "fullstack", "React", "Node.js", "JavaScript"],
    "Data Science": ["data science", "data analysis", "statistics", "Python", "R", "SQL"],
    "Cybersecurity": ["cybersecurity", "security", "network security", "ethical hacking", "penetration testing"],
    "Cloud Computing": ["cloud computing", "AWS", "Azure", "GCP", "DevOps", "cloud architecture"]
  };

  // Bot personality responses
  const botResponses = {
    greeting: "Hello! I'm your AI Resume Mentor. 🤖\n\nUpload your resume and I'll analyze it to find the perfect alumni mentors for you!",
    analyzing: "🤖 Analyzing your resume... 🧠\n\nPlease wait while I understand your skills and background...",
    success: "🤖 Perfect! Here's what I discovered about your profile:",
    noMatches: "🤖 Hmm, I couldn't find many mentors for your field yet. Try connecting with general career advisors!",
    error: "🤖 Oops! Something went wrong. Please try uploading your resume again.",
    tips: "💡 Here are some tips to improve your resume:",
    confidence: "📊 Your resume confidence score:",
    feedback: "👍 Great job! Your resume looks impressive."
  };

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize bot with greeting message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      sendBotMessage(botResponses.greeting, "info");
    }
  }, [isOpen]);

  const sendBotMessage = (text: string, type: "text" | "loading" | "error" | "success" | "info" = "text") => {
    const message: BotMessage = {
      id: Date.now().toString(),
      text,
      sender: "bot",
      timestamp: new Date(),
      type
    };
    setMessages(prev => [...prev, message]);
  };

  const sendUserMessage = (text: string) => {
    const message: BotMessage = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const simulateTyping = async (callback: () => void, delay: number = 1000) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    setIsTyping(false);
    callback();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setResumeFile(file);
        sendUserMessage(`📎 Uploaded: ${file.name}`);
        simulateTyping(() => {
          sendBotMessage("🤖 Ready to analyze your resume! Click 'Analyze Resume' to get started.", "success");
        });
      } else {
        sendBotMessage("🤖 Please upload a PDF file only.", "error");
      }
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    sendUserMessage("🗑️ Removed resume file");
    sendBotMessage("🤖 Please upload your resume to continue.");
  };

  const analyzeResume = async () => {
    if (!resumeFile) {
      sendBotMessage("🤖 Please upload a resume file first.", "error");
      return;
    }

    setIsProcessing(true);
    sendBotMessage(botResponses.analyzing, "loading");

    try {
      // Simulate resume processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract text from PDF (simulated)
      const resumeText = await simulatePdfTextExtraction(resumeFile);

      // Detect domain from resume text
      const detectedDomain = detectDomainFromText(resumeText);

      // Find matching alumni
      const matchingAlumni = await findMatchingAlumni(detectedDomain);

      // Generate improvement tips
      const improvementTips = generateImprovementTips(detectedDomain, resumeText);

      // Calculate confidence score
      const confidenceScore = calculateConfidenceScore(detectedDomain, resumeText);

      // Prepare analysis result
      const result: ResumeAnalysisResult = {
        domain: detectedDomain,
        skills: extractSkillsFromText(resumeText, detectedDomain),
        suggestedRoles: getSuggestedRoles(detectedDomain),
        alumniMatches: matchingAlumni,
        confidenceScore,
        improvementTips
      };

      setAnalysisResult(result);
      sendAnalysisResults(result);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      sendBotMessage(botResponses.error, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const simulatePdfTextExtraction = async (file: File): Promise<string> => {
    // Simulate PDF text extraction
    return new Promise(resolve => {
      setTimeout(() => {
        // Mock resume text based on filename or random content
        const mockText = `John Doe
Software Engineer | Machine Learning Enthusiast
john.doe@email.com | (123) 456-7890

EDUCATION
Bachelor of Technology in Computer Science
NMIMS University, 2020-2024

SKILLS
- Python, TensorFlow, PyTorch
- Machine Learning, Deep Learning
- Data Analysis, NLP
- Web Development (React, Node.js)

EXPERIENCE
ML Intern at TechCorp
- Developed machine learning models for predictive analytics
- Improved model accuracy by 15% through feature engineering
- Collaborated with data science team on NLP projects

PROJECTS
- Sentiment Analysis System using BERT
- Image Classification with CNN
- Chatbot using Transformers`;
        resolve(mockText);
      }, 1000);
    });
  };

  const detectDomainFromText = (text: string): string => {
    // Simple keyword-based domain detection
    const lowerText = text.toLowerCase();

    if (lowerText.includes("machine learning") || lowerText.includes("ml") || lowerText.includes("artificial intelligence")) {
      return "Machine Learning";
    } else if (lowerText.includes("web development") || lowerText.includes("frontend") || lowerText.includes("backend")) {
      return "Web Development";
    } else if (lowerText.includes("data science") || lowerText.includes("data analysis")) {
      return "Data Science";
    } else if (lowerText.includes("cybersecurity") || lowerText.includes("security")) {
      return "Cybersecurity";
    } else if (lowerText.includes("cloud") || lowerText.includes("aws") || lowerText.includes("azure")) {
      return "Cloud Computing";
    } else {
      return "General";
    }
  };

  const extractSkillsFromText = (text: string, domain: string): string[] => {
    // Extract skills based on domain
    const lowerText = text.toLowerCase();
    const skills: string[] = [];

    // Add domain-specific skills
    if (domain === "Machine Learning") {
      if (lowerText.includes("python")) skills.push("Python");
      if (lowerText.includes("tensorflow")) skills.push("TensorFlow");
      if (lowerText.includes("pytorch")) skills.push("PyTorch");
      if (lowerText.includes("nlp")) skills.push("NLP");
      if (lowerText.includes("deep learning")) skills.push("Deep Learning");
    } else if (domain === "Web Development") {
      if (lowerText.includes("javascript")) skills.push("JavaScript");
      if (lowerText.includes("react")) skills.push("React");
      if (lowerText.includes("node")) skills.push("Node.js");
      if (lowerText.includes("html")) skills.push("HTML/CSS");
    }

    // Add some generic skills
    if (lowerText.includes("teamwork")) skills.push("Teamwork");
    if (lowerText.includes("communication")) skills.push("Communication");

    return skills.length > 0 ? skills : ["Resume Analysis", "Career Development"];
  };

  const getSuggestedRoles = (domain: string): string[] => {
    // Suggest roles based on domain
    switch (domain) {
      case "Machine Learning":
        return ["ML Engineer", "Data Scientist", "AI Researcher"];
      case "Web Development":
        return ["Frontend Engineer", "Backend Engineer", "Fullstack Developer"];
      case "Data Science":
        return ["Data Scientist", "Data Analyst", "Business Intelligence Analyst"];
      case "Cybersecurity":
        return ["Security Engineer", "Penetration Tester", "Security Analyst"];
      case "Cloud Computing":
        return ["Cloud Engineer", "DevOps Engineer", "Cloud Architect"];
      default:
        return ["Software Engineer", "Technical Consultant", "IT Specialist"];
    }
  };

  const calculateConfidenceScore = (domain: string, text: string): number => {
    // Calculate a confidence score based on resume content
    const lowerText = text.toLowerCase();
    let score = 50; // Base score

    // Add points for relevant keywords
    if (domain === "Machine Learning") {
      if (lowerText.includes("python")) score += 10;
      if (lowerText.includes("tensorflow") || lowerText.includes("pytorch")) score += 15;
      if (lowerText.includes("machine learning")) score += 10;
      if (lowerText.includes("deep learning")) score += 10;
    } else if (domain === "Web Development") {
      if (lowerText.includes("javascript")) score += 10;
      if (lowerText.includes("react") || lowerText.includes("node")) score += 15;
      if (lowerText.includes("web development")) score += 10;
    }

    // Add points for experience and projects
    if (lowerText.includes("experience")) score += 10;
    if (lowerText.includes("projects")) score += 5;

    // Cap at 100
    return Math.min(score, 100);
  };

  const generateImprovementTips = (domain: string, text: string): string[] => {
    const lowerText = text.toLowerCase();
    const tips: string[] = [];

    // Domain-specific tips
    if (domain === "Machine Learning") {
      if (!lowerText.includes("github") && !lowerText.includes("portfolio")) {
        tips.push("Consider adding a GitHub portfolio link");
      }
      if (!lowerText.includes("projects")) {
        tips.push("Add specific ML projects with measurable outcomes");
      }
    } else if (domain === "Web Development") {
      if (!lowerText.includes("github") && !lowerText.includes("portfolio")) {
        tips.push("Include links to your GitHub or personal website");
      }
      if (!lowerText.includes("frameworks")) {
        tips.push("Highlight specific frameworks and libraries you've used");
      }
    }

    // General tips
    if (!lowerText.includes("achievements") && !lowerText.includes("impact")) {
      tips.push("Quantify your achievements with metrics");
    }
    if (!lowerText.includes("certifications")) {
      tips.push("Add relevant certifications if any");
    }

    return tips.length > 0 ? tips : [
      "Your resume looks good!",
      "Consider adding more specific achievements",
      "Highlight any relevant certifications"
    ];
  };

  const findMatchingAlumni = async (domain: string): Promise<AlumniProfile[]> => {
    try {
      // Get the skills for this domain
      const domainSkills = domainMappings[domain] || [];

      // Query Firebase for alumni with matching skills
      const alumniQuery = query(
        collection(db, "alumniProfiles"),
        where("status", "==", "approved"),
        limit(3)
      );

      const querySnapshot = await getDocs(alumniQuery);
      const alumniList: AlumniProfile[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as AlumniProfile;
        // Check if alumni has any of the domain skills
        const hasMatchingSkills = data.skills?.some(skill =>
          domainSkills.some(domainSkill =>
            skill.toLowerCase().includes(domainSkill.toLowerCase())
          )
        ) || false;

        if (hasMatchingSkills) {
          alumniList.push({ uid: doc.id, ...data });
        }
      });

      // If no matches found, return some random approved alumni
      if (alumniList.length === 0) {
        const fallbackQuery = query(
          collection(db, "alumniProfiles"),
          where("status", "==", "approved"),
          limit(3)
        );
        const fallbackSnapshot = await getDocs(fallbackQuery);
        fallbackSnapshot.forEach((doc) => {
          alumniList.push({ uid: doc.id, ...doc.data() } as AlumniProfile);
        });
      }

      return alumniList;
    } catch (error) {
      console.error("Error fetching alumni:", error);
      return [];
    }
  };

  const sendAnalysisResults = (result: ResumeAnalysisResult) => {
    sendBotMessage(`${botResponses.success}

🎯 **Detected Field:** ${result.domain}
💼 **Suggested Roles:** ${result.suggestedRoles.join(", ")}

${botResponses.confidence} **${result.confidenceScore}%**`, "success");

    // Send improvement tips
    simulateTyping(() => {
      sendBotMessage(`${botResponses.tips}
${result.improvementTips.map((tip, index) => `• ${tip}`).join('\n')}`, "info");
    }, 1500);

    // Send mentors message
    simulateTyping(() => {
      sendBotMessage("👥 Here are your recommended mentors:", "success");
    }, 2500);
  };

  const handleConnectWithMentor = (alumni: AlumniProfile) => {
    // Navigate to alumni connection page with this alumni pre-selected
    navigate("/student/alumni");
    toast({
      title: "Mentor Selected",
      description: `You can now connect with ${alumni.fullName || 'this mentor'} for mentorship.`,
    });
  };

  const resetBot = () => {
    setMessages([]);
    setResumeFile(null);
    setAnalysisResult(null);
    setIsProcessing(false);
    // Reinitialize with greeting
    sendBotMessage(botResponses.greeting, "info");
  };

  const toggleBot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset bot state when opening
      resetBot();
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Check className="w-4 h-4 text-green-600" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "info":
        return <Lightbulb className="w-4 h-4 text-blue-600" />;
      case "loading":
        return <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />;
      default:
        return <Bot className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <>
      {/* Floating Bot Icon with animation */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleBot}
          className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg animate-bounce"
          aria-label="AI Resume Mentor"
        >
          <Bot className="w-8 h-8 text-white" />
        </Button>
      </div>

      {/* AI Resume Bot Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/bot-icon.svg" alt="AI Mentor Bot" />
                  <AvatarFallback className="bg-indigo-600 text-white">
                    <Bot className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">AI Resume Mentor</CardTitle>
                  <CardDescription>Your personal career advisor</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleBot}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>

            <CardContent className="flex-grow overflow-hidden flex flex-col">
              {/* Chat Messages */}
              <div className="flex-grow overflow-y-auto space-y-4 p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "bot" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "bot"
                          ? "bg-indigo-50 text-gray-900 rounded-br-none"
                          : "bg-indigo-600 text-white rounded-bl-none"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.sender === "bot" && message.type && getMessageIcon(message.type)}
                        <div className="whitespace-pre-wrap">{message.text}</div>
                      </div>
                      <div className={`text-xs mt-1 ${
                        message.sender === "bot" ? "text-gray-500" : "text-indigo-100"
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-indigo-50 text-gray-900 rounded-lg p-3 max-w-[80%] rounded-br-none">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-indigo-600" />
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Results */}
                {analysisResult && (
                  <div className="mt-4 space-y-4">
                    {/* Domain and Skills */}
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Check className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-green-800">Analysis Complete!</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Detected Field</p>
                            <Badge variant="default" className="bg-green-600">
                              {analysisResult.domain}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Your Skills</p>
                            <div className="flex flex-wrap gap-1">
                              {analysisResult.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm text-gray-500 mb-1">Confidence Score</p>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">{analysisResult.confidenceScore}%</span>
                            <div className="flex-grow bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${analysisResult.confidenceScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Improvement Tips */}
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-blue-800">Improvement Tips</h3>
                        </div>
                        <ul className="space-y-2 text-sm">
                          {analysisResult.improvementTips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <ThumbsUp className="w-4 h-4 text-blue-600 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Recommended Mentors */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">👥 Recommended Mentors</h3>
                      {analysisResult.alumniMatches.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {analysisResult.alumniMatches.map((alumni) => (
                            <Card key={alumni.uid} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarFallback>{alumni.fullName?.charAt(0) || 'A'}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="font-medium text-gray-900">{alumni.fullName || 'Alumni Mentor'}</h4>
                                    <p className="text-sm text-gray-600">{alumni.company || 'Tech Company'}</p>
                                    <p className="text-sm text-gray-500">{alumni.role || 'Mentor'}</p>
                                  </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-1">
                                    <GraduationCap className="w-3 h-3 text-gray-500" />
                                    <span>{alumni.college || 'University'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Brain className="w-3 h-3 text-gray-500" />
                                    <span>{alumni.department || 'Department'}</span>
                                  </div>
                                  {alumni.experience && (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 text-gray-500" />
                                      <span>{alumni.experience}+ years experience</span>
                                    </div>
                                  )}
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {alumni.skills?.slice(0, 3).map((skill, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    onClick={() => handleConnectWithMentor(alumni)}
                                    className="flex-grow text-sm"
                                    size="sm"
                                  >
                                    Connect
                                  </Button>
                                  {alumni.linkedin && (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="text-sm"
                                      onClick={() => window.open(alumni.linkedin, '_blank')}
                                    >
                                      <Linkedin className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Card className="bg-yellow-50 border-yellow-200">
                          <CardContent className="p-4 text-center">
                            <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                            <p className="text-yellow-800">
                              No specific mentors found for your field. Try connecting with general career advisors!
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {isProcessing && !analysisResult && (
                  <div className="flex justify-center items-center py-8">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                      <span className="text-indigo-600">Processing your resume...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t p-4 bg-gray-50">
                {!analysisResult ? (
                  <div className="space-y-3">
                    {/* File Upload */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer text-indigo-600 hover:text-indigo-700">
                        <Upload className="w-5 h-5" />
                        <span className="text-sm font-medium">Upload Resume</span>
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      {resumeFile && (
                        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm text-indigo-800">{resumeFile.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveFile}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Analyze Button */}
                    <Button
                      onClick={analyzeResume}
                      disabled={!resumeFile || isProcessing}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Analyze Resume
                        </>
                      )}
                    </Button>

                    {/* Help Text */}
                    <p className="text-xs text-gray-500 text-center">
                      Upload your PDF resume and let me analyze it to find the best mentors for you!
                    </p>
                  </div>
                ) : (
                  <div className="flex justify-center gap-3">
                    <Button
                      onClick={resetBot}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      New Analysis
                    </Button>
                    <Button
                      onClick={toggleBot}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}