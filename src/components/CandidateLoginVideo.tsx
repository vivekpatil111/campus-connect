import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const CandidateLoginVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(isNaN(percentage) ? 0 : percentage);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const progressBar = e.currentTarget;
      const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
      const progressBarWidth = progressBar.clientWidth;
      const seekTime = (clickPosition / progressBarWidth) * videoRef.current.duration;
      videoRef.current.currentTime = seekTime;
    }
  };

  const handleTryNow = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Candidate Login Process</span>
            <span className="text-sm font-normal text-muted-foreground">Demo Video</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black">
            {/* Video placeholder with visual representation of login process */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="text-center">
                  <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="bg-indigo-700 w-10 h-10 rounded-lg"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">CampusPrep Login</h3>
                  <p className="text-gray-600 mb-6">Access your personalized interview preparation dashboard</p>

                  <div className="space-y-4">
                    <div className="text-left space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email Address</label>
                      <div className="h-10 bg-gray-100 rounded-md flex items-center px-3">
                        <span className="text-gray-500">candidate@example.com</span>
                      </div>
                    </div>

                    <div className="text-left space-y-2">
                      <label className="text-sm font-medium text-gray-700">Password</label>
                      <div className="h-10 bg-gray-100 rounded-md flex items-center px-3">
                        <span className="text-gray-500">••••••••</span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-indigo-700 hover:bg-indigo-800 text-white"
                      onClick={handleTryNow}
                    >
                      {user ? "Go to Dashboard" : "Try Now"}
                    </Button>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      New to CampusPrep? <a href="#" className="text-indigo-700 hover:underline">Create an account</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Play/Pause overlay button */}
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer group"
              onClick={togglePlay}
            >
              {!isPlaying && (
                <div className="bg-black/50 rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-12 w-12 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Video controls */}
          <div className="p-4 bg-gray-900">
            <div
              className="h-1.5 bg-gray-700 rounded-full cursor-pointer mb-3"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlay}
                  className="text-white hover:text-gray-300"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={restartVideo}
                  className="text-white hover:text-gray-300"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">0:00 / 2:30</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:text-gray-300"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          See how easy it is to access your personalized interview preparation tools
        </p>
      </div>
    </div>
  );
};

export default CandidateLoginVideo;