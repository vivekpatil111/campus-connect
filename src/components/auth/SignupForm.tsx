import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check } from "lucide-react";

interface SignupFormProps {
  onSignupSuccess: () => void;
}

export function SignupForm({ onSignupSuccess }: SignupFormProps) {
  const [role, setRole] = useState<"student" | "alumni" | "admin" | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    collegeName: "",
    department: "",
    currentYear: "",
    targetRole: "",
    passingYear: "",
    currentCompany: "",
    currentRole: "",
    officialEmail: "",
    adminRole: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        role === "admin" ? formData.officialEmail : formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: formData.fullName,
        email: role === "admin" ? formData.officialEmail : formData.email,
        role,
        collegeName: formData.collegeName,
        department: formData.department,
        ...(role === "student" && {
          currentYear: formData.currentYear,
          targetRole: formData.targetRole
        }),
        ...(role === "alumni" && {
          passingYear: formData.passingYear,
          currentCompany: formData.currentCompany,
          currentRole: formData.currentRole
        }),
        ...(role === "admin" && {
          adminRole: formData.adminRole,
          officialEmail: formData.officialEmail
        }),
        createdAt: new Date(),
      });

      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
      onSignupSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSelection = () => (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <img 
            src="/campusprep-logo.png" 
            alt="CampusPrep Logo" 
            className="h-12 w-12 object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-600">
          Join CampusPrep to start your interview preparation journey
        </p>
      </div>
      
      <RadioGroup 
        className="grid grid-cols-3 gap-6" 
        value={role || undefined} 
        onValueChange={(value) => setRole(value as "student" | "alumni" | "admin")}
      >
        <Card className={`cursor-pointer transition-all duration-200 hover:border-indigo-300 ${
          role === "student" 
            ? "border-indigo-500 border-2" 
            : "border-gray-200"
        }`}>
          <CardContent className="p-5 h-40 overflow-hidden">
            <div className="flex items-center mb-3">
              <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-base">S</span>
              </div>
              <RadioGroupItem value="student" id="student" className="sr-only" />
              {role === "student" && (
                <Check className="w-5 h-5 text-indigo-600 ml-auto" />
              )}
            </div>
            <Label htmlFor="student" className="cursor-pointer">
              <h3 className="font-semibold text-lg mb-1">Student</h3>
              <p className="text-sm text-gray-600">
                Prepare for placements with AI practice and alumni mentorship
              </p>
            </Label>
          </CardContent>
        </Card>
        
        <Card className={`cursor-pointer transition-all duration-200 hover:border-indigo-300 ${
          role === "alumni" 
            ? "border-indigo-500 border-2" 
            : "border-gray-200"
        }`}>
          <CardContent className="p-5 h-40 overflow-hidden">
            <div className="flex items-center mb-3">
              <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-base">A</span>
              </div>
              <RadioGroupItem value="alumni" id="alumni" className="sr-only" />
              {role === "alumni" && (
                <Check className="w-5 h-5 text-indigo-600 ml-auto" />
              )}
            </div>
            <Label htmlFor="alumni" className="cursor-pointer">
              <h3 className="font-semibold text-lg mb-1">Alumni</h3>
              <p className="text-sm text-gray-600">
                Guide students through mentorship and mock interviews
              </p>
            </Label>
          </CardContent>
        </Card>
        
        <Card className={`cursor-pointer transition-all duration-200 hover:border-indigo-300 ${
          role === "admin" 
            ? "border-indigo-500 border-2" 
            : "border-gray-200"
        }`}>
          <CardContent className="p-5 h-40 overflow-hidden">
            <div className="flex items-center mb-3">
              <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-base">Ad</span>
              </div>
              <RadioGroupItem value="admin" id="admin" className="sr-only" />
              {role === "admin" && (
                <Check className="w-5 h-5 text-indigo-600 ml-auto" />
              )}
            </div>
            <Label htmlFor="admin" className="cursor-pointer">
              <h3 className="font-semibold text-lg mb-1">Admin</h3>
              <p className="text-sm text-gray-600">
                Manage alumni verification and platform quality
              </p>
            </Label>
          </CardContent>
        </Card>
      </RadioGroup>
      
      <div className="pt-4">
        <Button 
          className="w-full"
          disabled={loading || !role}
        >
          Continue
        </Button>
      </div>
      <p className="text-xs text-gray-500 text-center mt-4">
        Built by Team Block Minds
      </p>
    </div>
  );

  const renderStudentForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input 
          id="fullName" 
          value={formData.fullName} 
          onChange={(e) => handleInputChange("fullName", e.target.value)} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input 
          id="email" 
          type="email" 
          value={formData.email} 
          onChange={(e) => handleInputChange("email", e.target.value)} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <Input 
          id="password" 
          type="password" 
          value={formData.password} 
          onChange={(e) => handleInputChange("password", e.target.value)} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="collegeName">College Name *</Label>
        <Input 
          id="collegeName" 
          value={formData.collegeName} 
          onChange={(e) => handleInputChange("collegeName", e.target.value)} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="department">Department / Branch *</Label>
        <Input 
          id="department" 
          value={formData.department} 
          onChange={(e) => handleInputChange("department", e.target.value)} 
          required 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentYear">Current Year *</Label>
          <Select 
            value={formData.currentYear} 
            onValueChange={(value) => handleInputChange("currentYear", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1st">1st Year</SelectItem>
              <SelectItem value="2nd">2nd Year</SelectItem>
              <SelectItem value="3rd">3rd Year</SelectItem>
              <SelectItem value="Final">Final Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="targetRole">Target Role *</Label>
          <Select 
            value={formData.targetRole} 
            onValueChange={(value) => handleInputChange("targetRole", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frontend">Frontend Engineer</SelectItem>
              <SelectItem value="backend">Backend Engineer</SelectItem>
              <SelectItem value="ml">ML Engineer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderAlumniForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input 
          id="fullName" 
          value={formData.fullName} 
          onChange={(e) => handleInputChange("fullName", e.target.value)} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input 
          id="email" 
          type="email" 
          value={formData.email} 
          onChange={(e) => handleInputChange("email", e.target.value)} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <Input 
          id="password" 
          type="password" 
          value={formData.password} 
          onChange={(e) => handleInputChange("password", e.target.value)} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="collegeName">College Name *</Label>
        <Input 
          id="collegeName" 
          value={formData.collegeName} 
          onChange={(e) => handleInputChange("collegeName", e.target.value)} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="department">Department *</Label>
        <Input 
          id="department" 
          value={formData.department} 
          onChange={(e) => handleInputChange("department", e.target.value)} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="passingYear">Passing Year *</Label>
        <Select 
          value={formData.passingYear} 
          onValueChange={(value) => handleInputChange("passingYear", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 20 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="currentCompany">Current Company *</Label>
        <Input 
          id="currentCompany" 
          value={formData.currentCompany} 
          onChange={(e) => handleInputChange("currentCompany", e.target.value)} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="currentRole">Current Role / Designation *</Label>
        <Input 
          id="currentRole" 
          value={formData.currentRole} 
          onChange={(e) => handleInputChange("currentRole", e.target.value)} 
          required 
        />
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          Your profile will be visible to students only after admin verification.
        </p>
      </div>
    </div>
  );

  const renderAdminForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input 
          id="fullName" 
          value={formData.fullName} 
          onChange={(e) => handleInputChange("fullName", e.target.value)} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="officialEmail">Official College Email *</Label>
        <Input 
          id="officialEmail" 
          type="email" 
          value={formData.officialEmail} 
          onChange={(e) => handleInputChange("officialEmail", e.target.value)} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <Input 
          id="password" 
          type="password" 
          value={formData.password} 
          onChange={(e) => handleInputChange("password", e.target.value)} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="collegeName">College Name *</Label>
        <Input 
          id="collegeName" 
          value={formData.collegeName} 
          onChange={(e) => handleInputChange("collegeName", e.target.value)} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="adminRole">Admin Role *</Label>
        <Select 
          value={formData.adminRole} 
          onValueChange={(value) => handleInputChange("adminRole", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="placement">Placement Cell</SelectItem>
            <SelectItem value="faculty">Faculty</SelectItem>
            <SelectItem value="coordinator">Coordinator</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!role ? (
        renderRoleSelection()
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {role === "student" && "Student Signup"}
              {role === "alumni" && "Alumni Signup"}
              {role === "admin" && "Admin Signup"}
            </h2>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setRole(null)}
            >
              Change Role
            </Button>
          </div>
          
          {role === "student" && renderStudentForm()}
          {role === "alumni" && renderAlumniForm()}
          {role === "admin" && renderAdminForm()}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
          <p className="text-xs text-gray-500 text-center mt-4">
            Built by Team Block Minds
          </p>
        </>
      )}
    </form>
  );
}