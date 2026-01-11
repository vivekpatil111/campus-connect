import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, Eye, EyeOff, X, Play, Pause, Square, Check } from "lucide-react";

interface MockInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Question {
  text: string;
  idealWordCount: string;
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

const MockInterviewModal = ({ isOpen, onClose }: MockInterviewModalProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Bank of 10 contextual interview questions with ideal word counts
  const questionBank: Question[] = [
    {
      text: "Can you tell me about yourself and your background?",
      idealWordCount: "150-200 words"
    },
    {
      text: "Based on what you've shared, what motivated you to pursue this career path?",
      idealWordCount: "100-150 words"
    },
    {
      text: "What skills from your previous experiences make you a good fit for this role?",
      idealWordCount: "100-150 words"
    },
    {
      text: "Can you describe a challenging project you worked on and how you overcame obstacles?",
      idealWordCount: "150-200 words"
    },
    {
      text: "How did you apply the skills from that project in your subsequent work?",
      idealWordCount: "100-150 words"
    },
    {
      text: "What do you consider your biggest professional achievement and why?",
      idealWordCount: "100-150 words"
    },
    {
      text: "How do you handle feedback and criticism in a professional setting?",
      idealWordCount: "100-150 words"
    },
    {
      text: "Where do you see yourself in 3-5 years, and how does this role align with your goals?",
      idealWordCount: "100-150 words"
    },
    {
      text: "What interests you most about our company and this position?",
      idealWordCount: "100-150 words"
    },
    {
      text: "Do you have any questions for me about the role or company?",
      idealWordCount: "50-100 words"
    }
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

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

  const startNewSession = () => {
    setQuestions([...questionBank]); // Create a new array instance
    setAnswers(Array(questionBank.length).fill(''));
    setCurrentQuestionIndex(0);
    setShowAllQuestions(false);
    setSessionActive(true);
    setTimer(0);
    setIsTimerRunning(true);
    setSubmitted(false);
  };

  const reshuffleQuestions = () => {
    setQuestions([...questionBank]); // Create a new array instance
    setAnswers(Array(questionBank.length).fill(''));
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

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setTimer(0);
    setIsTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    setIsTimerRunning(false);
    setSubmitted(true);
  };

  const getWordCount = (text: string) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };

  const getWordCountColor = (count: number, ideal: string) => {
    // Check if ideal is a valid string before processing
    if (!ideal || typeof ideal !== 'string') {
      return 'text-gray-500';
    }
    
    const parts = ideal.split('-');
    if (parts.length !== 2) {
      return 'text-gray-500';
    }
    
    const min = parseInt(parts[0]);
    const maxStr = parts[1].split(' ')[0]; // Remove "words" part
    const max = parseInt(maxStr);
    
    // Check if parsing was successful
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
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Mock Interview</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-hidden">
          {!sessionActive ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <h3 className="text-xl font-semibold mb-4">Ready to practice your interview skills?</h3>
              <p className="text-gray-600 mb-8 text-center max-w-md">
                You'll get 10 contextual questions to practice. Answer each question in the text area provided.
                Aim for the suggested word count to practice concise communication.
              </p>
              <Button onClick={startNewSession} className="px-8 py-3 text-lg">
                Start Mock Interview
              </Button>
            </div>
          ) : submitted ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="bg-green-100 rounded-full p-4 mb-6">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Interview Completed!</h3>
              <p className="text-gray-600 mb-2">Total time: {formatTime(timer)}</p>
              <p className="text-gray-600 mb-8 text-center max-w-md">
                Great job! You've completed the mock interview. Review your answers and consider areas for improvement.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={restartSession}>
                  Restart Interview
                </Button>
                <Button onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md">
                  <span className="text-sm font-medium">Timer:</span>
                  <span className="font-mono">{formatTime(timer)}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleTimer}
                    className="h-6 w-6"
                  >
                    {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={resetTimer}
                    className="h-6 w-6"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </div>
                
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

              {showAllQuestions ? (
                <ScrollArea className="h-[50vh] rounded-md border p-4">
                  <div className="grid grid-cols-1 gap-4">
                    {questions.map((question, index) => (
                      <Card 
                        key={index} 
                        className={`p-4 transition-all ${
                          index === currentQuestionIndex 
                            ? "border-blue-500 bg-blue-50" 
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        <div className="flex items-start">
                          <Badge variant="secondary" className="mr-2 mt-1">
                            {index + 1}
                          </Badge>
                          <div className="flex-grow">
                            <p className="text-gray-800 mb-2">{question.text}</p>
                            <div className="text-xs text-gray-500 mb-2">
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
                              rows={4}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col h-[50vh]">
                  <div className="flex-grow flex flex-col bg-gray-50 rounded-lg p-6 mb-4">
                    <Badge variant="secondary" className="mb-4 w-fit">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </Badge>
                    {currentQuestion ? (
                      <>
                        <p className="text-xl text-gray-800 mb-4">
                          {currentQuestion.text}
                        </p>
                        <div className="text-sm text-gray-600 mb-4">
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
                      rows={8}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MockInterviewModal;