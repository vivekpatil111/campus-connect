import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Shuffle, 
  Eye, 
  EyeOff, 
  X, 
  Check,
  User,
  GraduationCap,
  Target,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface StudentProfile {
  name: string;
  field: string;
  educationLevel: string;
  interviewReadiness: number;
  strengths: string[];
  areasForImprovement: string[];
}

interface Question {
  id: string;
  text: string;
  category: 'icebreaker' | 'background' | 'motivation' | 'skills' | 'future' | 'behavioral';
  competency: string;
  idealWordCount: string;
  followUpTo?: string;
}

interface InterviewSession {
  questions: Question[];
  answers: string[];
  currentQuestionIndex: number;
  showAllQuestions: boolean;
  sessionActive: boolean;
  timestamp: number;
  submitted: boolean;
}

interface IntelligentMockInterviewProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: StudentProfile;
}

const IntelligentMockInterview = ({ isOpen, onClose, studentProfile }: IntelligentMockInterviewProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Bank of interview questions organized by category and competency
  const questionBank: Question[] = [
    // Icebreaker questions
    { id: 'q1', text: "Can you tell me about yourself and your background?", category: 'icebreaker', competency: 'Communication', idealWordCount: "150-200 words" },
    { id: 'q2', text: "Walk me through your resume.", category: 'icebreaker', competency: 'Communication', idealWordCount: "100-150 words" },

    // Background questions
    { id: 'q3', text: "What inspired you to pursue your field of study?", category: 'background', competency: 'Motivation', idealWordCount: "100-150 words" },
    { id: 'q4', text: "What aspects of your education have been most valuable to you?", category: 'background', competency: 'Self-awareness', idealWordCount: "100-150 words" },
    { id: 'q5', text: "Describe a project or assignment you're particularly proud of.", category: 'background', competency: 'Achievement', idealWordCount: "150-200 words" },

    // Motivation questions
    { id: 'q6', text: "What motivates you in your academic and professional pursuits?", category: 'motivation', competency: 'Drive', idealWordCount: "100-150 words" },
    { id: 'q7', text: "Tell me about a time when you overcame a significant challenge.", category: 'motivation', competency: 'Resilience', idealWordCount: "150-200 words" },
    { id: 'q8', text: "What do you consider your biggest strength?", category: 'motivation', competency: 'Self-awareness', idealWordCount: "100-150 words" },

    // Skills questions
    { id: 'q9', text: "How do you stay current with developments in your field?", category: 'skills', competency: 'Learning', idealWordCount: "100-150 words" },
    { id: 'q10', text: "Describe a situation where you had to work with a difficult team member.", category: 'skills', competency: 'Teamwork', idealWordCount: "150-200 words" },
    { id: 'q11', text: "Tell me about a time you had to solve a complex problem.", category: 'skills', competency: 'Problem-solving', idealWordCount: "150-200 words" },

    // Future questions
    { id: 'q12', text: "Where do you see yourself in 3-5 years?", category: 'future', competency: 'Goal-setting', idealWordCount: "100-150 words" },
    { id: 'q13', text: "How does this opportunity align with your career goals?", category: 'future', competency: 'Strategic thinking', idealWordCount: "100-150 words" },
    { id: 'q14', text: "What skills do you hope to develop in your next role?", category: 'future', competency: 'Growth mindset', idealWordCount: "100-150 words" },

    // Behavioral questions
    { id: 'q15', text: "Describe a time when you had to adapt to significant changes.", category: 'behavioral', competency: 'Adaptability', idealWordCount: "150-200 words" },
    { id: 'q16', text: "Tell me about a situation where you had to persuade someone.", category: 'behavioral', competency: 'Influence', idealWordCount: "150-200 words" },
    { id: 'q17', text: "How do you prioritize your work when dealing with multiple deadlines?", category: 'behavioral', competency: 'Time management', idealWordCount: "100-150 words" },

    // Follow-up questions
    { id: 'q18', text: "You mentioned overcoming a challenge. What would you do differently if faced with a similar situation?", category: 'behavioral', competency: 'Reflection', idealWordCount: "100-150 words", followUpTo: 'q7' },
    { id: 'q19', text: "How has your biggest strength helped you in your academic or professional life?", category: 'motivation', competency: 'Application', idealWordCount: "100-150 words", followUpTo: 'q8' },
    { id: 'q20', text: "Can you give me a specific example of how you stay current in your field?", category: 'skills', competency: 'Learning', idealWordCount: "100-150 words", followUpTo: 'q9' }
  ];

  // Initialize questions on component mount and when session starts
  useEffect(() => {
    if (isOpen && !sessionActive) {
      startNewSession();
    }
  }, [isOpen, sessionActive]);

  // Save session to localStorage
  useEffect(() => {
    if (questions.length > 0) {
      const sessionData: InterviewSession = {
        questions,
        answers,
        currentQuestionIndex,
        showAllQuestions,
        sessionActive,
        timestamp: new Date().getTime(),
        submitted
      };
      localStorage.setItem('mockInterviewSession', JSON.stringify(sessionData));
    }
  }, [questions, answers, currentQuestionIndex, showAllQuestions, sessionActive, submitted]);

  // Load session from localStorage on component mount
  useEffect(() => {
    const savedSession = localStorage.getItem('mockInterviewSession');
    if (savedSession) {
      try {
        const sessionData: InterviewSession = JSON.parse(savedSession);
        // Check if session is less than 24 hours old
        if (new Date().getTime() - sessionData.timestamp < 24 * 60 * 60 * 1000) {
          setQuestions(sessionData.questions);
          setAnswers(sessionData.answers || Array(sessionData.questions.length).fill(''));
          setCurrentQuestionIndex(sessionData.currentQuestionIndex);
          setShowAllQuestions(sessionData.showAllQuestions);
          setSessionActive(sessionData.sessionActive);
          setSubmitted(sessionData.submitted || false);
          return;
        }
      } catch (e) {
        console.error('Failed to parse session data', e);
      }
    }
    // If no valid session, start a new one when opened
    if (isOpen) {
      startNewSession();
    }
  }, [isOpen]);

  const selectIntelligentQuestions = (): Question[] => {
    // Select questions based on student's field and education level
    const selectedQuestions: Question[] = [];

    // Always include icebreaker questions
    const icebreakers = questionBank.filter(q => q.category === 'icebreaker');
    selectedQuestions.push(...icebreakers.slice(0, 1));

    // Select background questions (2-3)
    const backgrounds = questionBank.filter(q => q.category === 'background');
    selectedQuestions.push(...backgrounds.slice(0, 2));

    // Select motivation questions (3-4)
    const motivations = questionBank.filter(q => q.category === 'motivation');
    selectedQuestions.push(...motivations.slice(0, 3));

    // Select skills questions (3-4)
    const skills = questionBank.filter(q => q.category === 'skills');
    selectedQuestions.push(...skills.slice(0, 3));

    // Select future questions (2-3)
    const futures = questionBank.filter(q => q.category === 'future');
    selectedQuestions.push(...futures.slice(0, 2));

    // Select behavioral questions (2-3)
    const behaviorals = questionBank.filter(q => q.category === 'behavioral');
    selectedQuestions.push(...behaviorals.slice(0, 3));

    // Add relevant follow-up questions if their predecessors are selected
    questionBank
      .filter(q => q.followUpTo)
      .forEach(followUp => {
        if (selectedQuestions.some(q => q.id === followUp.followUpTo) && selectedQuestions.length < 15) {
          selectedQuestions.push(followUp);
        }
      });

    // If we still need more questions, fill with remaining
    if (selectedQuestions.length < 15) {
      const remaining = questionBank.filter(q => !selectedQuestions.some(sq => sq.id === q.id));
      const needed = 15 - selectedQuestions.length;
      selectedQuestions.push(...remaining.slice(0, needed));
    }

    // Shuffle the questions for variety
    return selectedQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 15);
  };

  const startNewSession = () => {
    const selectedQuestions = selectIntelligentQuestions();
    setQuestions(selectedQuestions);
    setAnswers(Array(selectedQuestions.length).fill(''));
    setCurrentQuestionIndex(0);
    setShowAllQuestions(false);
    setSessionActive(true);
    setSubmitted(false);
  };

  const reshuffleQuestions = () => {
    const selectedQuestions = selectIntelligentQuestions();
    setQuestions(selectedQuestions);
    setAnswers(Array(selectedQuestions.length).fill(''));
    setCurrentQuestionIndex(0);
  };

  const restartSession = () => {
    startNewSession();
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const toggleViewAll = () => {
    setShowAllQuestions(!showAllQuestions);
    if (!showAllQuestions) {
      setCurrentQuestionIndex(0);
    }
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleGoToDashboard = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const getWordCount = (text: string) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };

  const getWordCountColor = (count: number, ideal: string) => {
    if (!ideal || typeof ideal !== 'string') {
      return 'text-gray-500';
    }

    const parts = ideal.split('-');
    if (parts.length !== 2) {
      return 'text-gray-500';
    }

    const min = parseInt(parts[0]);
    const maxStr = parts[1].split(' ')[0];
    const max = parseInt(maxStr);

    if (isNaN(min) || isNaN(max)) {
      return 'text-gray-500';
    }

    if (count < min) return 'text-red-500';
    if (count > max) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (!isOpen) return null;

  // Get current question safely
  const currentQuestion = questions.length > 0 && currentQuestionIndex < questions.length
    ? questions[currentQuestionIndex]
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Intelligent Mock Interview</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-grow overflow-hidden">
          {!sessionActive ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <h3 className="text-xl font-semibold mb-4">Ready to practice your interview skills?</h3>
              <p className="text-gray-600 mb-8 text-center max-w-md">
                You'll get a personalized set of questions based on your profile. Answer each question in the text area provided.
                Aim for the suggested word count to practice concise communication.
              </p>
              <Button onClick={startNewSession} className="px-8 py-3 text-lg bg-indigo-700 hover:bg-indigo-800">
                Start Mock Interview
              </Button>
            </div>
          ) : submitted ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="bg-green-100 rounded-full p-4 mb-6">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Interview Completed!</h3>
              <p className="text-gray-600 mb-8 text-center max-w-md">
                Great job! You've completed the mock interview. Review your answers and consider areas for improvement.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={restartSession}>
                  Restart Interview
                </Button>
                <Button onClick={handleGoToDashboard} className="bg-indigo-700 hover:bg-indigo-800">
                  Go to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant="outline"
                  onClick={toggleViewAll}
                  className="flex items-center gap-2"
                >
                  {showAllQuestions ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showAllQuestions ? "Show One Question" : "View All Questions"}
                </Button>
                <Button
                  variant="outline"
                  onClick={reshuffleQuestions}
                  className="flex items-center gap-2"
                >
                  <Shuffle className="h-4 w-4" />
                  Reshuffle Questions
                </Button>
                <Button
                  variant="outline"
                  onClick={restartSession}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restart Session
                </Button>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 flex-grow overflow-hidden">
                {/* Student Overview Panel */}
                <Card className="lg:w-1/3 flex-shrink-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Student Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{studentProfile.name}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <GraduationCap className="h-4 w-4 mr-1" />
                        <span>{studentProfile.educationLevel} in {studentProfile.field}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Interview Readiness</span>
                        <span className="text-sm font-medium">{studentProfile.interviewReadiness}%</span>
                      </div>
                      <Progress value={studentProfile.interviewReadiness} className="h-2" />
                    </div>

                    <div>
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4" />
                        Strengths
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {studentProfile.strengths.map((strength, index) => (
                          <Badge key={index} variant="secondary">{strength}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4" />
                        Areas for Improvement
                      </h4>
                      <ul className="text-sm space-y-1">
                        {studentProfile.areasForImprovement.map((area, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Personalized Insights</h4>
                      <p className="text-sm text-gray-600">
                        Based on your profile, focus on providing specific examples that demonstrate your {studentProfile.strengths[0]?.toLowerCase() || 'skills'}.
                        Remember to connect your academic experiences to real-world applications.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Interview Questions Section */}
                <div className="lg:w-2/3 flex-grow flex flex-col">
                  {showAllQuestions ? (
                    <ScrollArea className="flex-grow rounded-md border p-4">
                      <div className="grid grid-cols-1 gap-4">
                        {questions.map((question, index) => (
                          <Card
                            key={index}
                            className={`p-4 transition-all ${
                              index === currentQuestionIndex
                                ? "border-indigo-700 bg-indigo-50"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => setCurrentQuestionIndex(index)}
                          >
                            <div className="flex items-start">
                              <Badge variant="secondary" className="mr-2 mt-1">
                                {index + 1}
                              </Badge>
                              <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium text-gray-800">{question.text}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {question.category}
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                  Assessing: <span className="font-medium">{question.competency}</span> |
                                  Ideal word count: {question.idealWordCount} |
                                  Your words: <span className={getWordCountColor(getWordCount(answers[index] || ''), question.idealWordCount)}>
                                    {getWordCount(answers[index] || '')}
                                  </span>
                                </div>
                                <Textarea
                                  value={answers[index] || ''}
                                  onChange={(e) => {
                                    const newAnswers = [...answers];
                                    newAnswers[index] = e.target.value;
                                    setAnswers(newAnswers);
                                  }}
                                  placeholder="Type your answer here..."
                                  className="mt-2"
                                  rows={3}
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className="flex-grow flex flex-col bg-gray-50 rounded-lg p-6 mb-4">
                        <Badge variant="secondary" className="mb-4 w-fit">
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </Badge>
                        {currentQuestion ? (
                          <>
                            <div className="flex items-center gap-2 mb-4">
                              <p className="text-xl text-gray-800">{currentQuestion.text}</p>
                              <Badge variant="outline" className="text-xs">
                                {currentQuestion.category}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-4">
                              Assessing: <span className="font-medium">{currentQuestion.competency}</span> |
                              Ideal word count: {currentQuestion.idealWordCount} |
                              Your words: <span className={getWordCountColor(getWordCount(answers[currentQuestionIndex] || ''), currentQuestion.idealWordCount)}>
                                {getWordCount(answers[currentQuestionIndex] || '')}
                              </span>
                            </div>
                          </>
                        ) : (
                          <p className="text-xl text-gray-800 mb-4">
                            Loading question...
                          </p>
                        )}
                        <Textarea
                          value={answers[currentQuestionIndex] || ''}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          placeholder="Type your answer here..."
                          className="flex-grow"
                          rows={6}
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={prevQuestion}
                            disabled={currentQuestionIndex === 0}
                            className="flex items-center gap-2"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          {currentQuestionIndex === questions.length - 1 ? (
                            <Button
                              onClick={handleSubmit}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            >
                              Submit Interview
                              <Check className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              onClick={nextQuestion}
                              disabled={currentQuestionIndex === questions.length - 1}
                              className="flex items-center gap-2"
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentMockInterview;