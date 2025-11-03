import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Moon,
  Brain,
  Clock,
  Zap,
  Bluetooth,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import Footer from "../Footer";

interface SleepModuleProps {
  onBack: () => void;
}

const SleepModule = ({ onBack }: SleepModuleProps) => {
  const navigate = useNavigate();
  const [museConnected, setMuseConnected] = useState(true);

  const mockSleepData = {
    totalSleep: 7.5,
    sleepScore: 82,
    deepSleep: 1.8,
    remSleep: 2.1,
    lightSleep: 3.6,
    awakeTime: 0.4,
    sleepEfficiency: 89,
    bedtime: "10:30 PM",
    wakeTime: "6:15 AM",
  };

  const sleepStages = [
    { stage: "Deep Sleep", duration: mockSleepData.deepSleep, color: "bg-indigo-500", percentage: 24 },
    { stage: "REM Sleep", duration: mockSleepData.remSleep, color: "bg-purple-500", percentage: 28 },
    { stage: "Light Sleep", duration: mockSleepData.lightSleep, color: "bg-blue-400", percentage: 48 },
    { stage: "Awake", duration: mockSleepData.awakeTime, color: "bg-gray-400", percentage: 5 },
  ];

  const previousRecords = [
    { date: "Dec 25", score: 78, duration: 7.2, stages: "REM: 26%" },
    { date: "Dec 24", score: 85, duration: 8.1, stages: "Deep: 22%" },
    { date: "Dec 23", score: 72, duration: 6.8, stages: "REM: 24%" },
    { date: "Dec 22", score: 88, duration: 7.9, stages: "Deep: 28%" },
    { date: "Dec 21", score: 65, duration: 6.2, stages: "Light: 52%" },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 dark:text-green-400";
    if (score >= 60) return "text-yellow-500 dark:text-yellow-400";
    return "text-red-500 dark:text-red-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900 p-4 relative pb-20 transition-colors duration-500">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6 pt-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Moon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              SLEEP
            </h1>
          </div>
        </motion.div>

        {/* Device Connection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 border-purple-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bluetooth className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Muse Headband
                </span>
                <Badge
                  variant={museConnected ? "default" : "secondary"}
                  className={`${
                    museConnected
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {museConnected ? "Connected" : "Disconnected"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={museConnected ? "outline" : "default"}
                  onClick={() => setMuseConnected(!museConnected)}
                  className="flex-1"
                >
                  {museConnected ? "Disconnect" : "Connect Muse"}
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Device Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Last Night’s Sleep */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6 border-purple-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Last Night's Sleep
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div
                  className={`text-3xl font-bold ${getScoreColor(
                    mockSleepData.sleepScore
                  )} mb-1`}
                >
                  {mockSleepData.sleepScore}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Sleep Score
                </div>
                <div className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-2">
                  {mockSleepData.totalSleep}h total sleep
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <Clock className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                  <div className="font-bold">{mockSleepData.bedtime}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Bedtime
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <Zap className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                  <div className="font-bold">{mockSleepData.wakeTime}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Wake Time
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Sleep Efficiency
                </div>
                <div className="font-bold text-lg text-green-600 dark:text-green-400">
                  {mockSleepData.sleepEfficiency}%
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sleep Stages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Sleep Stages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sleepStages.map((stage) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                        <span className="text-sm font-medium">{stage.stage}</span>
                      </div>
                      <div className="text-sm font-bold">
                        {stage.duration}h ({stage.percentage}%)
                      </div>
                    </div>
                    <Progress value={stage.percentage} className="h-2" />
                  </div>
                ))}
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
          <Card className="mb-6 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Previous Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {previousRecords.map((record) => (
                  <div
                    key={record.date}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {record.date}
                      </div>
                      <div className="flex flex-col">
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Score:{" "}
                          </span>
                          <span
                            className={`font-bold ${getScoreColor(record.score)}`}
                          >
                            {record.score}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {record.stages}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-gray-800 dark:text-gray-200 font-bold">
                      {record.duration}h
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sleep Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="dark:bg-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Sleep Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Your sleep score is good at 82. Try going to bed 15 minutes
                  earlier to increase deep sleep duration.
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Consistent bedtime patterns detected. Keep up the good sleep
                  hygiene!
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 dark:border-gray-700"
                >
                  Sleep Tips
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 dark:border-gray-700"
                >
                  Set Bedtime
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

export default SleepModule;
