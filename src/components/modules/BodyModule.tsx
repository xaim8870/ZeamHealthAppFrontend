
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, Heart, Droplets, Thermometer, Scale, Bluetooth, Calendar } from "lucide-react";
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
    bloodPressure: { systolic: 120, diastolic: 80 }
  };

  const recentNutrition = [
    { meal: "Breakfast", time: "8:00 AM", calories: 420, protein: 25, carbs: 45, fat: 15 },
    { meal: "Lunch", time: "12:30 PM", calories: 580, protein: 32, carbs: 52, fat: 22 },
    { meal: "Snack", time: "3:00 PM", calories: 150, protein: 8, carbs: 18, fat: 6 }
  ];

  const previousRecords = [
    { date: "Dec 25", weight: 165, glucose: 95, pain: 2 },
    { date: "Dec 24", weight: 164.5, glucose: 88, pain: 1 },
    { date: "Dec 23", weight: 165.2, glucose: 102, pain: 4 },
    { date: "Dec 22", weight: 164.8, glucose: 91, pain: 2 },
    { date: "Dec 21", weight: 165.5, glucose: 99, pain: 3 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6 pt-4"
        >
          <Button variant="ghost" size="sm" onClick={onBack} style={{ backgroundColor: "green" }}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-teal-600" />
            <h1 className="text-xl font-bold text-gray-800">BODY</h1>
          </div>
        </motion.div>

        {/* Device Connection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 border-teal-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bluetooth className="w-5 h-5 text-teal-600" />
                  Whoop Band & Devices
                </span>
                <Badge 
                  variant={whoopConnected ? "default" : "secondary"} 
                  className={whoopConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                >
                  {whoopConnected ? "Connected" : "Disconnected"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={whoopConnected ? "outline" : "default"}
                  onClick={() => setWhoopConnected(!whoopConnected)}
                  className="flex-1"
                >
                  {whoopConnected ? "Disconnect" : "Connect Devices"}
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Sync Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Vitals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6 border-teal-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-teal-600" />
                Current Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Heart className="w-5 h-5 mx-auto mb-1 text-red-500" />
                  <div className="font-bold text-lg">{mockVitals.heartRate}</div>
                  <div className="text-xs text-gray-600">BPM</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Droplets className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                  <div className="font-bold text-lg">{mockVitals.bloodOxygen}%</div>
                  <div className="text-xs text-gray-600">SpO2</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Thermometer className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                  <div className="font-bold text-lg">{mockVitals.temperature}°F</div>
                  <div className="text-xs text-gray-600">Temperature</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Scale className="w-5 h-5 mx-auto mb-1 text-green-500" />
                  <div className="font-bold text-lg">{mockVitals.glucose}</div>
                  <div className="text-xs text-gray-600">mg/dL Glucose</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Blood Pressure: </span>
                  <span className="font-bold text-green-600">
                    {mockVitals.bloodPressure.systolic}/{mockVitals.bloodPressure.diastolic} mmHg
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Symptom Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Symptom Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
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
                    <span className="w-8 text-center font-bold text-lg">
                      {painLevel}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Additional Symptoms
                  </label>
                  <Textarea
                    placeholder="Describe any symptoms, pain, or concerns..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                  Log Symptoms
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Previous Records */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                Previous Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {previousRecords.map((record, index) => (
                  <div key={record.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 text-sm font-medium text-gray-600">{record.date}</div>
                      <div className="flex flex-col">
                        <div className="text-sm">
                          <span className="text-gray-600">Weight: </span>
                          <span className="font-bold text-gray-800">{record.weight}lb</span>
                        </div>
                        <div className="text-xs text-gray-500">Pain: {record.pain}/10</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        <span className="text-gray-600">Glucose: </span>
                        <span className="font-bold text-gray-800">{record.glucose}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Nutrition Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                Nutrition Today
                <Button size="sm" variant="outline" className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Photo
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNutrition.map((meal, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-sm">{meal.meal}</div>
                        <div className="text-xs text-gray-600">{meal.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">{meal.calories} cal</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
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
              
              <Button variant="outline" className="w-full mt-4">
                Add Meal
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Health Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Health Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700 mb-2">
                  Your glucose levels are stable today. Consider adding more protein to your next meal for sustained energy.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  Heart rate variability indicates good recovery. Your body is ready for moderate activity.
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
