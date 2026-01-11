"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Check, X, Video, MessageCircle, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  studentId: string;
  alumniId: string;
  type: "chat" | "video" | "in-person";
  status: "pending" | "accepted" | "rejected" | "completed";
  timestamp: Date;
  duration?: number;
  feedback?: string;
  rating?: number;
  studentName?: string;
  studentEmail?: string;
}

export function SessionHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch completed sessions for this alumni
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "sessions"),
      where("alumniId", "==", user.uid),
      where("status", "in", ["completed", "accepted"])
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sessionsList: Session[] = [];
      querySnapshot.forEach((doc) => {
        sessionsList.push({ id: doc.id, ...doc.data() } as Session);
      });
      setSessions(sessionsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load session history",
        variant: "destructive"
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "chat":
        return <MessageCircle className="w-4 h-4" />;
      case "in-person":
        return <Phone className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="flex items-center gap-1"><Check className="w-3 h-3" /> Completed</Badge>;
      case "accepted":
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Scheduled</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="flex items-center gap-1"><X className="w-3 h-3" /> Cancelled</Badge>;
      default:
        return null;
    }
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Session History</h2>
        <p className="text-gray-600">View your past mentorship sessions and feedback</p>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No completed sessions yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <Card key={session.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{session.studentName || "Student"}</CardTitle>
                      <CardDescription>{session.studentEmail || "student@college.edu"}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(session.status)}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getSessionTypeIcon(session.type)}
                    <span className="text-sm capitalize">{session.type} session</span>
                  </div>

                  <div className="text-sm text-gray-500">
                    Date: {session.timestamp.toLocaleDateString()}
                  </div>

                  {session.duration && (
                    <div className="text-sm text-gray-500">
                      Duration: {formatDuration(session.duration)}
                    </div>
                  )}

                  {session.rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Rating:</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`text-lg ${i < session.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {session.feedback && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Student Feedback:</p>
                      <p className="text-sm text-gray-600">"{session.feedback}"</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}