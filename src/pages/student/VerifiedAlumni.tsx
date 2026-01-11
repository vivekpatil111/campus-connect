import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Check } from "lucide-react";
import { AlumniConnection } from "@/components/student/AlumniConnection";

interface AlumniProfile {
  uid: string;
  fullName: string;
  college: string;
  department: string;
  passingYear: string;
  company: string;
  role: string;
  status: "pending" | "approved" | "rejected";
}

export default function VerifiedAlumni() {
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
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-indigo-600 text-white font-bold text-xl px-3 py-2 rounded-md">
              PW
            </div>
            <span className="ml-3 text-xl font-semibold text-gray-900">PrepWise</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 hidden sm:block">Welcome, {user?.email}</span>
            <Button onClick={handleSignOut} variant="outline" className="text-sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Verified Alumni Network
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-2">
            Connect with institution-verified alumni for mentorship, guidance, and real interview insights.
          </p>
          <p className="text-sm text-gray-500">
            All profiles below are approved by your college admin.
          </p>
        </div>

        {/* Alumni Connection Component */}
        <AlumniConnection />
      </main>
    </div>
  );
}