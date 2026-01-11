import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import StudentHome from "./pages/student/StudentHome";
import AlumniDashboard from "./pages/AlumniDashboard";
import AdminDashboardPage from "./pages/AdminDashboard";
import RoleSelection from "./pages/student/RoleSelection";
import InterviewDashboard from "./pages/student/InterviewDashboard";
import { VideoStream } from "@/components/media/VideoStream";
import GroupDiscussion from "./pages/student/GroupDiscussion";
import OneToOneSession from "./pages/student/OneToOneSession";
import SessionFeedback from "./pages/student/SessionFeedback";
import VerifiedAlumni from "./pages/student/VerifiedAlumni";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ChatWindow } from "@/components/chat/ChatWindow";
import InterviewSimulation from "./pages/student/InterviewSimulation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/student" element={<StudentHome />} />
          <Route path="/student/:companyId/roles" element={<RoleSelection />} />
          <Route path="/student/:companyId/:roleId/interview" element={<InterviewDashboard />} />
          <Route path="/student/:companyId/:roleId/video-interview" element={<VideoStream sessionId="test" companyName="Test" roleName="Test" onEndSession={() => {}} />} />
          <Route path="/student/:companyId/:roleId/group-discussion" element={<GroupDiscussion />} />
          <Route path="/student/session/:sessionId" element={<OneToOneSession />} />
          <Route path="/student/chat/:chatId" element={<ChatWindow />} />
          <Route path="/student/session/:sessionId/feedback" element={<SessionFeedback />} />
          <Route path="/student/alumni" element={<VerifiedAlumni />} />
          <Route path="/student/interview-simulation" element={<InterviewSimulation />} />
          <Route path="/alumni" element={<AlumniDashboard />} />
          <Route path="/alumni/chat/:chatId" element={<ChatWindow />} />
          <Route path="/admin" element={<AdminDashboardPage />} />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;