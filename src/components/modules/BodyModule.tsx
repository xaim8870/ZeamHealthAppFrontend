import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Camera,
  Heart,
  Droplets,
  Thermometer,
  Scale,
  Bluetooth,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BodyModuleProps {
  onBack: () => void;
}

const BodyModule = ({ onBack }: BodyModuleProps) => {
  const [painLevel, setPainLevel] = useState(3);
  const [symptoms, setSymptoms] = useState("");
  const [whoopConnected, setWhoopConnected] = useState(true);

  const mockVitals = {
    heartRate: 68,
    bloodOxygen: 98,
    glucose: 95,
    temperature: 98.6,
    weight: 165,
    bloodPressure: { systolic: 120, diastolic: 80 },
  };

  const recentNutrition = [
    { meal: "Breakfast", time: "8:00 AM", calories: 420, protein: 25, carbs: 45, fat: 15 },
    { meal: "Lunch", time: "12:30 PM", calories: 580, protein: 32, carbs: 52, fat: 22 },
    { meal: "Snack", time: "3:00 PM", calories: 150, protein: 8, carbs: 18, fat: 6 },
  ];

  const previousRecords = [
    { date: "Dec 25", weight: 165, glucose: 95, pain: 2 },
    { date: "Dec 24", weight: 164.5, glucose: 88, pain: 1 },
    { date: "Dec 23", weight: 165.2, glucose: 102, pain: 4 },
    { date: "Dec 22", weight: 164.8, glucose: 91, pain: 2 },
    { date: "Dec 21", weight: 165.5, glucose: 99, pain: 3 },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
      <div className="relative z-10 max-w-md mx-auto pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6 pt-6 px-4 sticky top-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-20"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-teal-500 dark:text-teal-400" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">BODY</h1>
          </div>
        </motion.div>

        {/* Device Connection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mb-6 bg-white/70 dark:bg-gray-800/50 backdrop-blur-md border border-teal-300 dark:border-teal-700 shadow-md mx-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <Bluetooth className="w-5 h-5 text-teal-500" />
                  Whoop Band & Devices
                </span>
                <Badge
                  variant={whoopConnected ? "default" : "secondary"}
                  className={`rounded-full text-xs ${
                    whoopConnected
                      ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {whoopConnected ? "Connected" : "Disconnected"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button
                size="sm"
                variant={whoopConnected ? "outline" : "default"}
                onClick={() => setWhoopConnected(!whoopConnected)}
                className="flex-1 dark:border-gray-700 dark:text-gray-100"
              >
                {whoopConnected ? "Disconnect" : "Connect Devices"}
              </Button>
              <Button size="sm" variant="outline" className="flex-1 dark:border-gray-700 dark:text-gray-100">
                Sync Data
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Vitals */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="mb-6 bg-white/70 dark:bg-gray-800/50 backdrop-blur-md border border-teal-300 dark:border-teal-700 shadow-md mx-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Heart className="w-5 h-5 text-teal-500" />
                Current Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Heart, color: "text-red-500", label: "BPM", value: mockVitals.heartRate },
                  { icon: Droplets, color: "text-blue-500", label: "SpO2", value: `${mockVitals.bloodOxygen}%` },
                  { icon: Thermometer, color: "text-orange-500", label: "Temp °F", value: mockVitals.temperature },
                  { icon: Scale, color: "text-green-500", label: "Glucose", value: `${mockVitals.glucose} mg/dL` },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm transition-all"
                  >
                    <item.icon className={`w-5 h-5 mx-auto mb-1 ${item.color}`} />
                    <div className="font-bold text-lg text-gray-800 dark:text-white">{item.value}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/40 rounded-lg">
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  <span className="font-medium">Blood Pressure: </span>
                  <span className="font-bold text-green-600 dark:text-green-300">
                    {mockVitals.bloodPressure.systolic}/{mockVitals.bloodPressure.diastolic} mmHg
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Symptom Tracking */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="mb-6 bg-white/70 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-md mx-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-gray-900 dark:text-gray-100">Symptom Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Pain Level (0-10)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="range"
                    min="0"
                    max="10"
                    value={painLevel}
                    onChange={(e) => setPainLevel(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-8 text-center font-bold text-lg text-gray-800 dark:text-white">
                    {painLevel}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Additional Symptoms
                </label>
                <Textarea
                  placeholder="Describe any symptoms, pain, or concerns..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={3}
                  className="dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-md">
                Log Symptoms
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Previous Records */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="mb-6 bg-white/70 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-md mx-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Calendar className="w-5 h-5 text-teal-500" />
                Previous Records
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {previousRecords.map((record) => (
                <div
                  key={record.date}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-300">
                      {record.date}
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Weight: </span>
                        <span className="font-bold text-gray-800 dark:text-white">{record.weight} lb</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Pain: {record.pain}/10</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Glucose: </span>
                      <span className="font-bold text-gray-800 dark:text-white">{record.glucose}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Nutrition Tracking */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="mb-6 bg-white/70 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-md mx-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between text-gray-900 dark:text-gray-100">
                Nutrition Today
                <Button size="sm" variant="outline" className="flex items-center gap-2 dark:border-gray-700">
                  <Camera className="w-4 h-4" />
                  Photo
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNutrition.map((meal, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-sm text-gray-800 dark:text-gray-100">{meal.meal}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{meal.time}</div>
                      </div>
                      <div className="text-right text-gray-800 dark:text-gray-100 font-bold text-sm">
                        {meal.calories} cal
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <div className="text-center">
                        <div className="font-medium">Protein</div>
                        <div>{meal.protein}g</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Carbs</div>
                        <div>{meal.carbs}g</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Fat</div>
                        <div>{meal.fat}g</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 dark:border-gray-700 dark:text-gray-100">
                Add Meal
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Health Insights */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="mx-4 bg-white/70 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-gray-900 dark:text-gray-100">Health Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  Glucose levels are stable today. Add more protein to your next meal for sustained energy.
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  Heart rate variability indicates good recovery. You’re ready for moderate activity.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BodyModule;
