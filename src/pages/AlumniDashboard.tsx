"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { AlumniVerificationForm } from "@/components/alumni/AlumniVerificationForm";
import { MentorshipRequests } from "@/components/alumni/MentorshipRequests";
import { MentorProfileCard } from "@/components/alumni/MentorProfileCard";
import { AlumniStats } from "@/components/alumni/AlumniStats";
import { AlumniAvailability } from "@/components/alumni/AlumniAvailability";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, UserCheck, Handshake, CheckCircle, AlertCircle, Clock as ClockIcon } from "lucide-react";
import { SessionHistory } from "@/components/alumni/SessionHistory";

export default function AlumniDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <img
                src="/campusprep-logo.png"
                alt="CampusPrep Logo"
                className="h-10 w-10 object-contain mr-3"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">CampusPrep</h1>
                <p className="text-sm text-gray-600">From Campus to Career</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 hidden sm:block">Welcome, {user?.email}</span>
              <Button onClick={handleSignOut} variant="outline" className="text-sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Stats Overview */}
          <AlumniStats />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Summary */}
            <div className="lg:col-span-1 space-y-6">
              <MentorProfileCard />

              <AlumniAvailability />

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Mentorship Tips</h2>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>Share real-world experiences and challenges you've overcome</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>Provide actionable advice for career development</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>Be responsive to student requests for better engagement</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>Keep your profile updated with current information</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column - Profile Form and Mentorship Requests */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Information</h2>
                <p className="text-gray-600 mb-6">Complete your profile to help students find you for mentorship.</p>
                <AlumniVerificationForm />
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Mentorship Requests</h2>
                  <p className="text-gray-600">Manage requests from students seeking your guidance.</p>
                </div>
                <MentorshipRequests />
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Session History</h2>
                  <p className="text-gray-600">View your past mentorship sessions and feedback.</p>
                </div>
                <SessionHistory />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            Empowering students — CampusPrep
            <span className="mx-2">•</span>
            Built by Team Block Minds
          </p>
        </div>
      </footer>
    </div>
  );
}