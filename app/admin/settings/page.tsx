"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const timezones = Intl.supportedValuesOf("timeZone");
const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    timezone: "",
    language: "",
  });

  useEffect(() => {
    // Fetch current settings
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings({
          timezone:
            data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: data.language || "en",
        });
      })
      .catch((error) => {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      });
  }, []);

  const updateSetting = async (key: string, value: string) => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, value }),
      });

      if (!response.ok) throw new Error("Failed to update setting");

      setSettings((prev) => ({ ...prev, [key]: value }));
      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
    } catch (error) {
      console.error("Error updating setting:", error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">System Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Language</CardTitle>
            <CardDescription>
              Select the default system language
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={settings.language}
              onValueChange={(value) => updateSetting("language", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timezone</CardTitle>
            <CardDescription>
              Select the system timezone for displaying dates and times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={settings.timezone}
              onValueChange={(value) => updateSetting("timezone", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
