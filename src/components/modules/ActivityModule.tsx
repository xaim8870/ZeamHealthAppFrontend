import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, Heart, Zap, TrendingUp, Bluetooth, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Footer from "../Footer"; // Import Footer

interface ActivityModuleProps {
  onBack: () => void;
  onModuleSelect: (module: string) => void; // Added for Footer navigation
}

const ActivityModule = ({ onBack, onModuleSelect }: ActivityModuleProps) => {
  const [whoopConnected, setWhoopConnected] = useState(true);

  const mockWhoopData = {
    strain: 12.4,
    recovery: 68,
    heartRate: 72,
    hrv: 42,
    calories: 2340,
    steps: 8742,
    activeMinutes: 87
  };

  const previousRecords = [
    { date: "Dec 25", strain: 8.2, recovery: 72, calories: 2100 },
    { date: "Dec 24", strain: 14.1, recovery: 65, calories: 2580 },
    { date: "Dec 23", strain: 11.3, recovery: 78, calories: 2240 },
    { date: "Dec 22", strain: 9.8, recovery: 81, calories: 2050 },
    { date: "Dec 21", strain: 16.2, recovery: 58, calories: 2890 }
  ];

  const getStrainColor = (strain: number) => {
    if (strain < 8) return "text-green-600";
    if (strain < 14) return "text-orange-500";
    return "text-red-500";
  };

  const getRecoveryColor = (recovery: number) => {
    if (recovery > 75) return "text-green-600";
    if (recovery > 50) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4 relative pb-20"> {/* Added pb-20 for footer space */}
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6 pt-4 "
        >
          <Button variant="ghost" size="sm" onClick={onBack} style={{ backgroundColor: "green" }}>
            <ArrowLeft className="w-4 h-4 " />
          </Button>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-orange-600" />
            <h1 className="text-xl font-bold text-gray-800">ACTIVITY</h1>
          </div>
        </motion.div>

        {/* Device Connection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bluetooth className="w-5 h-5 text-orange-600" />
                  Whoop Band
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
                  {whoopConnected ? "Disconnect" : "Connect Whoop"}
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Sync Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                Today's Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getStrainColor(mockWhoopData.strain)}`}>
                    {mockWhoopData.strain}
                  </div>
                  <div className="text-sm text-gray-600">Strain Score</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getRecoveryColor(mockWhoopData.recovery)}`}>
                    {mockWhoopData.recovery}%
                  </div>
                  <div className="text-sm text-gray-600">Recovery</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Heart className="w-4 h-4 mx-auto mb-1 text-red-500" />
                  <div className="font-bold">{mockWhoopData.heartRate}</div>
                  <div className="text-xs text-gray-600">BPM</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <TrendingUp className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                  <div className="font-bold">{mockWhoopData.hrv}</div>
                  <div className="text-xs text-gray-600">HRV</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Zap className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                  <div className="font-bold">{mockWhoopData.calories}</div>
                  <div className="text-xs text-gray-600">Calories</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Daily Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Steps</span>
                    <span>{mockWhoopData.steps.toLocaleString()} / 10,000</span>
                  </div>
                  <Progress value={(mockWhoopData.steps / 10000) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Active Minutes</span>
                    <span>{mockWhoopData.activeMinutes} / 120</span>
                  </div>
                  <Progress value={(mockWhoopData.activeMinutes / 120) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Calories Burned</span>
                    <span>{mockWhoopData.calories} / 2500</span>
                  </div>
                  <Progress value={(mockWhoopData.calories / 2500) * 100} className="h-2" />
                </div>
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
                <Calendar className="w-5 h-5 text-orange-600" />
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
                          <span className="text-gray-600">Strain: </span>
                          <span className={`font-bold ${getStrainColor(record.strain)}`}>
                            {record.strain}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{record.calories} cal</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        <span className="text-gray-600">Recovery: </span>
                        <span className={`font-bold ${getRecoveryColor(record.recovery)}`}>
                          {record.recovery}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Today's Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700 mb-2">
                  Your recovery is at 68%. Consider a moderate workout today and prioritize sleep tonight.
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View Workout Plan
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Sleep Tips
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ActivityModule;