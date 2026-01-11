"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Volume2, VolumeX, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { textToSpeech } from "@/utils/textToSpeech";

interface AIAvatarProps {
  company: string;
  isSpeaking: boolean;
  onSpeakingComplete: () => void;
}

export function AIAvatar({ company, isSpeaking, onSpeakingComplete }: AIAvatarProps) {
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Company-specific avatar configurations
  const companyConfig = {
    Google: {
      avatar: "/avatars/google-avatar.png",
      color: "bg-blue-600",
      name: "Google Interviewer"
    },
    Microsoft: {
      avatar: "/avatars/microsoft-avatar.png",
      color: "bg-red-600",
      name: "Microsoft Interviewer"
    },
    Amazon: {
      avatar: "/avatars/amazon-avatar.png",
      color: "bg-orange-600",
      name: "Amazon Interviewer"
    }
  };

  const config = companyConfig[company as keyof typeof companyConfig] || {
    avatar: "/avatars/default-avatar.png",
    color: "bg-indigo-600",
    name: "AI Interviewer"
  };

  // Timer effect for recording
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  // Handle speaking animation and voice
  useEffect(() => {
    if (isSpeaking && !isMuted) {
      setIsLoading(true);
      // Simulate speaking delay
      const timer = setTimeout(() => {
        setIsLoading(false);
        onSpeakingComplete();
      }, 2000); // Adjust based on actual speech duration

      return () => clearTimeout(timer);
    }
  }, [isSpeaking, isMuted, onSpeakingComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "AI Voice Enabled" : "AI Voice Muted",
      description: isMuted ? "AI interviewer will now speak" : "AI interviewer voice muted"
    });
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    toast({
      title: isCameraOn ? "Camera Off" : "Camera On",
      description: isCameraOn ? "Your video is now off" : "Your video is now on"
    });
  };

  const toggleMicrophone = () => {
    setIsMicrophoneOn(!isMicrophoneOn);
    toast({
      title: isMicrophoneOn ? "Microphone Off" : "Microphone On",
      description: isMicrophoneOn ? "Your microphone is now off" : "Your microphone is now on"
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* AI Avatar Video Frame */}
      <div className="relative">
        <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-indigo-200">
          <Avatar className="w-full h-full">
            <AvatarImage src={config.avatar} alt={config.name} />
            <AvatarFallback className={config.color}>
              {company.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        )}

        {/* Company badge */}
        <Badge className={`absolute -top-2 left-1/2 transform -translate-x-1/2 ${config.color} text-white`}>
          {company}
        </Badge>
      </div>

      {/* AI Name */}
      <div className="text-center">
        <h3 className="font-semibold text-gray-900">{config.name}</h3>
        <p className="text-sm text-gray-600">AI Interviewer</p>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMute}
          className="w-10 h-10"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
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

      {/* Recording indicator */}
      {isRecording && (
        <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Recording {formatTime(recordingTime)}</span>
          </div>
        </div>
      )}
    </div>
  );
}