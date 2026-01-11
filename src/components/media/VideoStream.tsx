import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import { PermissionGuard } from "@/components/media/PermissionGuard";
import { Mic, MicOff, Video, VideoOff, Play, X, Camera, Settings } from "lucide-react";

interface VideoStreamProps {
  sessionId: string;
  companyName: string;
  roleName: string;
  onEndSession: () => void;
}

export function VideoStream({ sessionId, companyName, roleName, onEndSession }: VideoStreamProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [sessionDuration, setSessionDuration] = useState(0);

  const {
    stream,
    isLoading,
    error,
    hasPermission,
    isSupported,
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
    },
    onSuccess: (stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isSessionActive]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const handleEndSession = () => {
    setIsSessionActive(false);
    stopStream();
    onEndSession();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <PermissionGuard
        type="both"
        isSupported={isSupported}
        isLoading={isLoading}
        error={error}
        hasPermission={hasPermission}
        onRequestPermission={requestPermission}
        onRetry={restartStream}
      >
        <div className="flex flex-col h-screen">
          {/* Header */}
          <header className="bg-gray-800 px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{companyName} - {roleName}</h1>
              <p className="text-sm text-gray-300">Session ID: {sessionId}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                LIVE
              </div>
              <span className="text-sm">Duration: {formatDuration(sessionDuration)}</span>
              <Button
                onClick={handleEndSession}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                End Session
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-grow flex">
            {/* Video Area */}
            <div className="flex-grow relative bg-gray-800">
              <div className="absolute inset-0 flex items-center justify-center">
                {stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <Camera className="w-16 h-16 mx-auto mb-4" />
                    <p>Camera feed will appear here</p>
                  </div>
                )}
              </div>

              {/* Controls Overlay */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-50 rounded-full p-2">
                <Button
                  onClick={toggleMicrophone}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  {isMicrophoneOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </Button>
                <Button
                  onClick={toggleCamera}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  {isCameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <Settings className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 bg-gray-800 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Session Info */}
                <Card className="bg-gray-700 border-none">
                  <CardHeader>
                    <CardTitle className="text-white">Session Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-400">Company</p>
                      <p className="text-white font-medium">{companyName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Role</p>
                      <p className="text-white font-medium">{roleName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Session ID</p>
                      <p className="text-white font-medium">{sessionId}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Duration</p>
                      <p className="text-white font-medium">{formatDuration(sessionDuration)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Device Status */}
                <Card className="bg-gray-700 border-none">
                  <CardHeader>
                    <CardTitle className="text-white">Device Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        <span className="text-sm">Microphone</span>
                      </div>
                      <span className={`text-sm ${isMicrophoneOn ? 'text-green-400' : 'text-red-400'}`}>
                        {isMicrophoneOn ? 'On' : 'Off'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        <span className="text-sm">Camera</span>
                      </div>
                      <span className={`text-sm ${isCameraOn ? 'text-green-400' : 'text-red-400'}`}>
                        {isCameraOn ? 'On' : 'Off'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Session Tips */}
                <Card className="bg-gray-700 border-none">
                  <CardHeader>
                    <CardTitle className="text-white">Session Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Speak clearly and at a moderate pace</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Maintain good eye contact</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Use professional body language</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Be prepared with your responses</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </PermissionGuard>
    </div>
  );
}