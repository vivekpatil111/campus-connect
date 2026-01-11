import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Mic, MicOff, Users, MessageCircle, Check, X } from "lucide-react";

export default function GroupDiscussion() {
  const navigate = useNavigate();
  const { companyId, roleId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();

  // State for GD
  const [isRecording, setIsRecording] = useState(false);
  const [participants, setParticipants] = useState([
    { id: 1, name: "You", isSpeaking: false, avatar: "/avatars/user.png" },
    { id: 2, name: "AI Participant 1", isSpeaking: false, avatar: "/avatars/alumni1.png" },
    { id: 3, name: "AI Participant 2", isSpeaking: false, avatar: "/avatars/alumni2.png" },
    { id: 4, name: "AI Participant 3", isSpeaking: false, avatar: "/avatars/alumni3.png" }
  ]);
  const [discussionTopic, setDiscussionTopic] = useState("The impact of AI on future careers");
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [isActive, setIsActive] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
      toast({
        title: "Time's Up!",
        description: "The group discussion has ended."
      });
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartGD = () => {
    setIsActive(true);
    setIsRecording(true);
    toast({
      title: "Group Discussion Started",
      description: "The discussion has begun. Speak clearly and participate actively."
    });
  };

  const handleEndGD = () => {
    setIsActive(false);
    setIsRecording(false);
    navigate(`/student/${companyId}/${roleId}/interview`, {
      state: {
        completedRound: "gd"
      }
    });
  };

  const handleParticipantSpeak = (participantId: number) => {
    setParticipants(prev => prev.map(p =>
      p.id === participantId ? { ...p, isSpeaking: !p.isSpeaking } : p
    ));
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
          <h1 className="text-3xl font-bold text-gray-900">Group Discussion</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.email}</span>
            <Button onClick={() => navigate("/student")} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {companyName} - {roleName}
            </CardTitle>
            <p className="text-gray-600">Group Discussion Round</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Discussion Info */}
            <div className="bg-indigo-50 rounded-lg p-4">
              <h3 className="font-semibold text-indigo-800 mb-2">Discussion Topic</h3>
              <p className="text-indigo-700 mb-4">{discussionTopic}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>4 participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-indigo-600" />
                  <span>5 minutes duration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600" />
                  <span>AI-powered evaluation</span>
                </div>
              </div>
            </div>

            {/* Timer and Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2">
                  <span className="text-sm font-medium">Time Remaining:</span>
                  <span className="font-mono text-lg font-bold">{formatTime(timeRemaining)}</span>
                </div>

                <Button
                  onClick={() => setIsRecording(!isRecording)}
                  variant={isRecording ? "destructive" : "outline"}
                  className="flex items-center gap-2"
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>
              </div>

              <div className="flex gap-2">
                {!isActive ? (
                  <Button onClick={handleStartGD} className="bg-green-600 hover:bg-green-700">
                    Start Discussion
                  </Button>
                ) : (
                  <Button onClick={handleEndGD} variant="destructive">
                    End Discussion
                  </Button>
                )}
              </div>
            </div>

            {/* Participants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {participants.map((participant) => (
                <Card key={participant.id} className="relative">
                  <CardContent className="p-4 text-center">
                    <div className="relative mb-3">
                      <img
                        src={participant.avatar}
                        alt={participant.name}
                        className="w-20 h-20 rounded-full mx-auto object-cover"
                      />
                      {participant.isSpeaking && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 animate-pulse">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900">{participant.name}</h3>
                    <p className="text-sm text-gray-500">
                      {participant.id === 1 ? "You" : "AI Participant"}
                    </p>

                    {participant.id === 1 && (
                      <Button
                        onClick={() => handleParticipantSpeak(participant.id)}
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                      >
                        {participant.isSpeaking ? "Stop Speaking" : "Start Speaking"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Discussion Tips */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Group Discussion Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Speak clearly and confidently</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Listen actively to others before responding</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Maintain good eye contact and body language</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Contribute meaningful points to the discussion</span>
                </li>
              </ul>
            </div>

            {/* Navigation */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => navigate(`/student/${companyId}/${roleId}/interview`)}>
                Back to Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}