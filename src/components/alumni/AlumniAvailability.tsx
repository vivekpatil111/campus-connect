"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Clock, Calendar, Save } from "lucide-react";

interface Availability {
  days: string[];
  times: string[];
  timezone: string;
}

export function AlumniAvailability() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availability, setAvailability] = useState<Availability>({
    days: [],
    times: [],
    timezone: "IST"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Days of the week
  const daysOfWeek = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" }
  ];

  // Time slots
  const timeSlots = [
    { id: "morning", label: "Morning (9 AM - 12 PM)" },
    { id: "afternoon", label: "Afternoon (12 PM - 3 PM)" },
    { id: "evening", label: "Evening (3 PM - 6 PM)" },
    { id: "night", label: "Night (6 PM - 9 PM)" }
  ];

  // Timezones
  const timezones = [
    { value: "IST", label: "IST (Indian Standard Time)" },
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "EST", label: "EST (Eastern Standard Time)" },
    { value: "PST", label: "PST (Pacific Standard Time)" }
  ];

  // Load availability from Firestore
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "alumniProfiles", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setAvailability({
            days: data.availability?.days || [],
            times: data.availability?.times || [],
            timezone: data.availability?.timezone || "IST"
          });
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
        toast({
          title: "Error",
          description: "Failed to load availability settings",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [user, toast]);

  const handleDayChange = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleTimeChange = (time: string) => {
    setAvailability(prev => ({
      ...prev,
      times: prev.times.includes(time)
        ? prev.times.filter(t => t !== time)
        : [...prev.times, time]
    }));
  };

  const handleTimezoneChange = (timezone: string) => {
    setAvailability(prev => ({
      ...prev,
      timezone
    }));
  };

  const handleSaveAvailability = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const docRef = doc(db, "alumniProfiles", user.uid);
      await updateDoc(docRef, {
        availability
      });

      toast({
        title: "Availability Updated",
        description: "Your availability has been successfully updated"
      });
    } catch (error) {
      console.error("Error saving availability:", error);
      toast({
        title: "Error",
        description: "Failed to save availability",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Availability Settings</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Availability Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Days Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Available Days</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {daysOfWeek.map((day) => (
              <div key={day.id} className="flex items-center space-x-2">
                <Checkbox
                  id={day.id}
                  checked={availability.days.includes(day.id)}
                  onCheckedChange={() => handleDayChange(day.id)}
                />
                <Label htmlFor={day.id} className="text-sm font-medium leading-none">
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Time Slots Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Available Time Slots</h3>
          <div className="space-y-3">
            {timeSlots.map((time) => (
              <div key={time.id} className="flex items-center space-x-2">
                <Checkbox
                  id={time.id}
                  checked={availability.times.includes(time.id)}
                  onCheckedChange={() => handleTimeChange(time.id)}
                />
                <Label htmlFor={time.id} className="text-sm font-medium leading-none">
                  {time.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Timezone Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Timezone</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {timezones.map((tz) => (
              <div key={tz.value} className="flex items-center space-x-2">
                <Checkbox
                  id={tz.value}
                  checked={availability.timezone === tz.value}
                  onCheckedChange={() => handleTimezoneChange(tz.value)}
                />
                <Label htmlFor={tz.value} className="text-sm font-medium leading-none">
                  {tz.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Current Availability Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Current Availability</h3>
          <p className="text-sm text-gray-600 mb-2">
            You're available on <span className="font-medium">{availability.days.length}</span> days,
            during <span className="font-medium">{availability.times.length}</span> time slots
            in <span className="font-medium">{timezones.find(tz => tz.value === availability.timezone)?.label}</span>.
          </p>
          <p className="text-xs text-gray-500">
            Students will see this availability when requesting mentorship sessions.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveAvailability}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Availability"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}