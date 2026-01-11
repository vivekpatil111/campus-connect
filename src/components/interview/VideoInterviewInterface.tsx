import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Video, VideoOff, Play, Pause, StopCircle, Check, X, AlertTriangle, Clock, Eye, Camera, ChevronRight, Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import { PermissionGuard } from "@/components/media/PermissionGuard";

interface Question {
  id: string;
  text: string;
  difficulty: "easy" | "medium" | "hard";
  expectedKeywords: string[];
  category: string;
}

interface InterviewAnswer {
  questionId: string;
  transcript: string;
  timeTaken: number;
  timestamp: Date;
  behavioralMetrics: {
    faceDetectedPercentage: number;
    eyeContactScore: number;
    headStability: number;
    cameraOnDuration: number;
    micActivity: number;
    speakingPercentage?: number;
  };
}

interface InterviewEngineProps {
  company: string;
  role: string;
  interviewType: string;
  questions: string[];
  onComplete: (answers: InterviewAnswer[], metrics: any) => void;
  onClose: () => void;
}

export function VideoInterviewInterface({ company, role, interviewType, questions, onComplete, onClose }: InterviewEngineProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(true);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [behavioralMetrics, setBehavioralMetrics] = useState({
    cameraOnDuration: 0,
    faceDetected: 0,
    speakingTime: 0,
    totalDuration: 0,
    eyeContactScore: 0,
    headStability: 0,
    micActivity: 0
  });
  const [faceDetected, setFaceDetected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showBehavioralWarning, setShowBehavioralWarning] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);

  // Media devices hook
  const {
    stream,
    isSupported,
    isLoading,
    error,
    hasPermission,
    requestPermission,
    stopStream,
    restartStream
  } = useMediaDevices({
    video: true,
    audio: true,
    onError: (error) => {
      toast({
        title: "Media Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Timer effect
  useEffect(() => {
    if (currentQuestionIndex < questions.length && !answerSubmitted) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentQuestionIndex, answerSubmitted, questions.length]);

  // Engagement tracking
  useEffect(() => {
    if (isCameraOn && videoRef.current) {
      const interval = setInterval(() => {
        // Simulate face detection
        const isFaceDetected = Math.random() > 0.1;
        setFaceDetected(isFaceDetected);

        // Update engagement metrics
        setBehavioralMetrics(prev => ({
          ...prev,
          totalDuration: prev.totalDuration + 1,
          cameraOnDuration: prev.cameraOnDuration + 1,
          faceDetected: prev.faceDetected + (isFaceDetected ? 1 : 0),
          speakingTime: prev.speakingTime + (isSpeaking ? 1 : 0),
          eyeContactScore: isFaceDetected ? 85 : 60,
          headStability: 75,
          micActivity: isMicrophoneOn ? 90 : 0
        }));

        // Show warning if face not detected
        if (!isFaceDetected && Math.random() > 0.7) {
          setShowBehavioralWarning(true);
          setTimeout(() => setShowBehavioralWarning(false), 3000);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isCameraOn, isSpeaking, isMicrophoneOn]);

  const handleTimeUp = () => {
    toast({
      title: "Time's Up!",
      description: "You've reached the time limit for this question. Please submit your answer.",
      variant: "destructive"
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      stopStream();
    } else {
      // Start recording
      try {
        await requestPermission();
        setIsRecording(true);
        setQuestionStartTime(Date.now());
      } catch (error) {
        console.error("Error starting recording:", error);
        toast({
          title: "Error",
          description: "Failed to start recording. Please check your microphone permissions.",
          variant: "destructive"
        });
      }
    }
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isCameraOn;
        setIsCameraOn(!isCameraOn);
      }
    }
  };

  const toggleMicrophone = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicrophoneOn;
        setIsMicrophoneOn(!isMicrophoneOn);
      }
    }
  };

  const handleTranscriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(e.target.value);
  };

  const submitAnswer = () => {
    if (!transcript.trim()) {
      toast({
        title: "Error",
        description: "Please provide an answer before submitting",
        variant: "destructive"
      });
      return;
    }

    const timeTaken = Date.now() - questionStartTime;

    const answer: InterviewAnswer = {
      questionId: questions[currentQuestionIndex],
      transcript,
      timeTaken,
      timestamp: new Date(),
      behavioralMetrics: {
        faceDetectedPercentage: Math.round(behavioralMetrics.faceDetected / behavioralMetrics.totalDuration * 100),
        eyeContactScore: behavioralMetrics.eyeContactScore,
        headStability: behavioralMetrics.headStability,
        cameraOnDuration: behavioralMetrics.cameraOnDuration,
        micActivity: behavioralMetrics.micActivity,
        speakingPercentage: Math.round(behavioralMetrics.speakingTime / behavioralMetrics.totalDuration * 100)
      }
    };

    setAnswers([...answers, answer]);
    setAnswerSubmitted(true);
    setTranscript("");
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswerSubmitted(false);
      setQuestionStartTime(Date.now());
      setTimeRemaining(300);
      setShowBehavioralWarning(false);
    } else {
      // Interview complete
      completeInterview();
    }
  };

  const completeInterview = () => {
    // Calculate final engagement score
    const finalEngagementScore = Math.round(
      (behavioralMetrics.cameraOnDuration + behavioralMetrics.faceDetected + behavioralMetrics.speakingTime) /
      (behavioralMetrics.totalDuration * 3) * 100
    );

    // Call onComplete with answers and metrics
    onComplete(answers, {
      ...behavioralMetrics,
      engagementScore: finalEngagementScore
    });
  };

  const getInterviewerName = (company: string) => {
    const interviewers = {
      Google: "Alex Thompson",
      Microsoft: "Sarah Johnson",
      Amazon: "Michael Chen"
    };
    return interviewers[company as keyof typeof interviewers] || "AI Interviewer";
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = (currentQuestionIndex / questions.length) * 100;

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading interview questions...</p>
      </div>
    );
  }

  return (
    <PermissionGuard
      type="both"
      isSupported={isSupported}
      isLoading={isLoading}
      error={error}
      hasPermission={hasPermission}
      onRequestPermission={requestPermission}
      onRetry={restartStream}
    >
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Video Interview</CardTitle>
                <CardDescription>{company} - {role} - {interviewType}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="flex-grow overflow-hidden flex flex-col">
            <div className="flex-grow overflow-y-auto p-4">
              <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Left Panel - AI Interviewer */}
                <div className="lg:w-1/2 space-y-4">
                  <Card className="bg-indigo-50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-600" />
                        AI Interviewer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 bg-white border rounded-lg flex items-center justify-center">
                          <span className="text-xl font-bold">
                            {company === 'Google' && 'G'}
                            {company === 'Microsoft' && 'M'}
                            {company === 'Amazon' && 'A'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-indigo-800">{getInterviewerName(company)}</h3>
                          <p className="text-sm text-indigo-600">{role} - {interviewType} Round</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Current Question</h4>
                        <p className="text-gray-800">{currentQuestion}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>⏱️ {formatTime(timeRemaining)} remaining</span>
                        <span>📊 Progress: {Math.round(progressPercentage)}%</span>
                      </div>

                      <div className="flex justify-center gap-3 mt-4">
                        <Button
                          onClick={toggleMicrophone}
                          variant={isMicrophoneOn ? "default" : "outline"}
                          size="icon"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isMicrophoneOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </Button>
                        <Button
                          onClick={toggleRecording}
                          variant={isRecording ? "destructive" : "default"}
                          size="icon"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isRecording ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </Button>
                        <Button
                          onClick={toggleCamera}
                          variant={isCameraOn ? "default" : "outline"}
                          size="icon"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Panel - Student Video + Transcript */}
                <div className="lg:w-1/2 space-y-4">
                  <Card className="bg-gray-900 text-white">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Your Video
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                        {stream ? (
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <Camera className="w-16 h-16" />
                            <p className="mt-2">Camera feed will appear here</p>
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-full px-3 py-1 text-sm">
                          {isRecording ? (
                            <span className="text-red-400">● Recording</span>
                          ) : (
                            <span className="text-gray-300">Ready</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-green-400" />
                          <span>Face: {faceDetected ? "Detected" : "Not detected"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mic className="w-4 h-4 text-green-400" />
                          <span>Mic: {isMicrophoneOn ? "Active" : "Muted"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-green-400" />
                          <span>Camera: {isCameraOn ? "On" : "Off"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-400" />
                          <span>Time: {formatTime(timeRemaining)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Your Answer</h3>
                      <Textarea
                        value={transcript}
                        onChange={handleTranscriptChange}
                        placeholder="Type your answer or use voice recording..."
                        className="min-h-[200px] mb-4"
                        disabled={answerSubmitted}
                      />
                      <div className="text-sm text-gray-500">
                        {transcript.split(/\s+/).length} words
                      </div>

                      {showBehavioralWarning && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 mt-4">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm text-yellow-800">
                            Please ensure your face is visible to the camera for better engagement tracking.
                          </span>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 mt-4">
                        {!answerSubmitted ? (
                          <Button
                            onClick={submitAnswer}
                            disabled={!transcript.trim()}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Submit Answer
                          </Button>
                        ) : (
                          <Button
                            onClick={nextQuestion}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            {currentQuestionIndex < questions.length - 1 ? (
                              <>
                                <ChevronRight className="w-4 h-4 mr-2" />
                                Next Question
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Complete Interview
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}