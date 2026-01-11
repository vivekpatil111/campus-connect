import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Mic, MicOff, Volume2, VolumeX, Video, VideoOff, Play, Pause, StopCircle, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VideoInterview() {
  const navigate = useNavigate();
  const { companyId, roleId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();

  // State for speech recognition
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'listening' | 'processing'>('idle');
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Check speech recognition support
  const checkSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechRecognitionSupported(!!SpeechRecognition);
  };

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome for best experience.",
        variant: "destructive"
      });
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update the current answer with the recognized speech
      if (finalTranscript || interimTranscript) {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = (newAnswers[currentQuestionIndex] || '') + finalTranscript;
        setAnswers(newAnswers);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use speech-to-text",
          variant: "destructive"
        });
      }
      setIsListening(false);
      setAiStatus('idle');
    };

    recognition.onend = () => {
      setIsListening(false);
      setAiStatus('idle');
    };

    return recognition;
  };

  // Use effect to check speech recognition on mount
  useEffect(() => {
    checkSpeechRecognition();
  }, []);

  // Mock questions for the interview
  const questions = [
    "Tell me about yourself",
    "What are your strengths and weaknesses?",
    "Why do you want to work at this company?",
    "Describe a challenging project you worked on",
    "Where do you see yourself in 5 years?"
  ];

  const handleStartInterview = () => {
    // Initialize with empty answers
    setAnswers(Array(questions.length).fill(''));
    setCurrentQuestionIndex(0);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = e.target.value;
    setAnswers(newAnswers);
  };

  const handleToggleListening = () => {
    if (isListening) {
      // Stop listening
      setIsListening(false);
      setAiStatus('idle');
    } else {
      // Start listening
      const recognition = initSpeechRecognition();
      if (recognition) {
        recognition.start();
        setIsListening(true);
        setAiStatus('listening');
      }
    }
  };

  const handleSubmitInterview = () => {
    // Submit the interview
    toast({
      title: "Interview Completed",
      description: "Your video interview has been submitted successfully."
    });
    navigate(`/student/${companyId}/${roleId}/interview`);
  };

  // Capitalize company and role names for display
  const companyName = companyId ? companyId.charAt(0).toUpperCase() + companyId.slice(1) : "Company";
  const roleName = roleId ?
    roleId === "frontend" ? "Frontend Engineer" :
    roleId === "backend" ? "Backend Engineer" :
    roleId === "ml" ? "ML Engineer" :
    roleId : "Role";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Video Interview</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.email}</span>
            <Button onClick={() => navigate("/student")} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {companyName} - {roleName}
            </CardTitle>
            <p className="text-gray-600">Video Interview Practice</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Video Preview Area */}
              <div className="lg:w-1/2">
                <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center mb-4">
                  <div className="text-center text-gray-500">
                    <Video className="w-16 h-16 mx-auto mb-2" />
                    <p>Video preview will appear here</p>
                    <p className="text-sm">Camera access required</p>
                  </div>
                </div>

                {/* Media Controls */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <Button variant="outline" size="icon">
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={handleToggleListening}
                    variant={isListening ? "default" : "outline"}
                    size="icon"
                    disabled={!speechRecognitionSupported}
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                </div>

                {/* Speech Recognition Status */}
                {!speechRecognitionSupported && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                    Speech recognition is not supported in your browser. Try Chrome for best experience.
                  </div>
                )}
              </div>

              {/* Interview Questions Area */}
              <div className="lg:w-1/2 space-y-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-800 mb-2">Current Question</h3>
                  <p className="text-indigo-700">
                    {questions[currentQuestionIndex]}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="answer" className="text-sm font-medium text-gray-700">
                    Your Answer
                  </label>
                  <textarea
                    id="answer"
                    value={answers[currentQuestionIndex] || ''}
                    onChange={handleAnswerChange}
                    className="w-full min-h-[150px] p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Type your answer or use speech-to-text..."
                  />

                  <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                    <span>
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>Speech-to-text:</span>
                      <Badge variant={speechRecognitionSupported ? "default" : "secondary"}>
                        {speechRecognitionSupported ? "Supported" : "Not supported"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* AI Status */}
                {aiStatus === 'listening' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-700">Listening to your answer...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation and Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
              <div className="flex gap-2">
                <Button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                  variant="outline"
                >
                  Next
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate(`/student/${companyId}/${roleId}/interview`)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitInterview}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Interview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}