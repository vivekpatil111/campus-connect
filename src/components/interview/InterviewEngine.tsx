"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Video, VideoOff, Play, Pause, StopCircle, Check, X, Clock, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AIAvatar } from "@/components/interview/AIAvatar";
import { textToSpeech } from "@/utils/textToSpeech";

interface InterviewEngineProps {
  company: string;
  role: string;
  interviewType: string;
  questions: string[];
  onComplete: (answers: any[], metrics: any) => void;
  onClose: () => void;
}

export function InterviewEngine({
  company,
  role,
  interviewType,
  questions,
  onComplete,
  onClose
}: InterviewEngineProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [interviewStarted, setInterviewStarted] = useState(false);

  // Initialize camera and microphone
  useEffect(() => {
    const initMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast({
          title: "Media Access Error",
          description: "Could not access camera/microphone. Please check permissions.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    initMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const startInterview = () => {
    setInterviewStarted(true);
    setIsRecording(true);
    speakQuestion(questions[currentQuestionIndex]);
  };

  const speakQuestion = (question: string) => {
    setIsAiSpeaking(true);
    textToSpeech(question, () => {
      setIsAiSpeaking(false);
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      speakQuestion(questions[currentQuestionIndex + 1]);
    }
  };

  const endInterview = () => {
    setIsRecording(false);
    setInterviewStarted(false);

    // Collect metrics
    const metrics = {
      duration: recordingTime,
      questionsAnswered: currentQuestionIndex + 1,
      totalQuestions: questions.length
    };

    // Prepare answers data
    const answersData = answers.map((answer, index) => ({
      question: questions[index],
      answer: answer || "No answer provided",
      questionNumber: index + 1
    }));

    onComplete(answersData, metrics);
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = e.target.value;
    setAnswers(newAnswers);
  };

  // Capitalize company and role names for display
  const companyName = company.charAt(0).toUpperCase() + company.slice(1);
  const roleName = interviewType === "Technical" ? "Technical Interview" : "HR / Behavioral Interview";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{company.charAt(0)}</span>
            </div>
            <div>
              <CardTitle className="text-lg">{companyName} - {roleName}</CardTitle>
              <p className="text-sm text-gray-600">Live Interview</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow overflow-y-auto space-y-4 p-4">
            {!interviewStarted ? (
              <div className="text-center py-8 space-y-6">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-indigo-600 font-bold text-xl">{company.charAt(0)}</span>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready for your interview?</h3>
                  <p className="text-gray-600 mb-4">
                    You'll be interviewed by our AI interviewer. Speak naturally and answer each question clearly.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                  <Card className="bg-indigo-50">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Video className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h4 className="font-medium text-indigo-800">Live Video</h4>
                      <p className="text-sm text-indigo-600">Real-time video interview</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-indigo-50">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Mic className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h4 className="font-medium text-indigo-800">Voice Answers</h4>
                      <p className="text-sm text-indigo-600">Speak your responses</p>
                    </CardContent>
                  </Card>
                </div>

                <Button
                  onClick={startInterview}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Interview
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Student Video */}
                <div className="space-y-4">
                  <div className="relative">
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Recording indicator */}
                    {isRecording && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <span>REC {formatTime(recordingTime)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Student Controls */}
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleCamera}
                      className="w-10 h-10"
                    >
                      {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleMicrophone}
                      className="w-10 h-10"
                    >
                      {isMicrophoneOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                {/* AI Interviewer */}
                <div className="space-y-4">
                  <AIAvatar
                    company={company}
                    isSpeaking={isAiSpeaking}
                    onSpeakingComplete={() => {}}
                  />

                  {/* Current Question */}
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h3 className="font-semibold text-indigo-800 mb-2">Current Question</h3>
                    <p className="text-indigo-700 mb-4">
                      {questions[currentQuestionIndex]}
                    </p>
                    <div className="text-sm text-indigo-600">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </div>
                  </div>

                  {/* Answer Area */}
                  <div className="space-y-2">
                    <label htmlFor="answer" className="text-sm font-medium text-gray-700">
                      Your Answer (Voice)
                    </label>
                    <textarea
                      id="answer"
                      value={answers[currentQuestionIndex] || ''}
                      onChange={handleAnswerChange}
                      placeholder="Speak your answer using microphone..."
                      className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      disabled
                    />
                    <p className="text-xs text-gray-500">
                      Speak naturally into your microphone. Your voice will be recorded.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interview Controls */}
          {interviewStarted && (
            <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="flex gap-2">
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button
                    onClick={nextQuestion}
                    className="flex items-center gap-2"
                  >
                    Next Question
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={endInterview}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    End Interview
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}