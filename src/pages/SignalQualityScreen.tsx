import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useDevice } from "../context/DeviceContext";

import neurosityImg from "../assets/images/neurosity-headband.png";
import sAthenaImg from "../assets/images/S-Athena.webp";

const SignalQualityScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setConnection } = useDevice();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [signalQuality, setSignalQuality] = useState(0);

  useEffect(() => {
    if (selectedDevice) {
      const interval = setInterval(() => {
        setSignalQuality((prev) => {
          const next = prev + 10;
          if (next >= 85) {
            clearInterval(interval);
            setConnection(true, selectedDevice);
            setTimeout(() => navigate("/mind"), 1000);
          }
          return next;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [selectedDevice, setConnection, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-slate-900 px-4 py-8 transition-colors duration-300">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex items-center mb-6"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </button>
        <h1 className="flex-1 text-center text-xl font-semibold text-gray-800 dark:text-gray-100">
          Signal Quality Check
        </h1>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl shadow-2xl rounded-2xl transition-colors duration-300">
          <CardContent className="p-6 text-center">
            {!selectedDevice ? (
              <>
                <h2 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">
                  Choose Your Headband
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* Neurosity */}
                  <div
                    onClick={() => setSelectedDevice("neurosity")}
                    className="cursor-pointer border border-gray-300 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:border-indigo-500 transition-all duration-300"
                  >
                    <img
                      src={neurosityImg}
                      alt="Neurosity"
                      className="w-24 h-24 mx-auto mb-2 object-contain"
                    />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Neurosity
                    </p>
                  </div>

                  {/* S-Athena */}
                  <div
                    onClick={() => setSelectedDevice("s-athena")}
                    className="cursor-pointer border border-gray-300 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:border-indigo-500 transition-all duration-300"
                  >
                    <img
                      src={sAthenaImg}
                      alt="S-Athena"
                      className="w-24 h-24 mx-auto mb-2 object-contain"
                    />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Muse S Athena
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <motion.img
                  src={selectedDevice === "neurosity" ? neurosityImg : sAthenaImg}
                  alt={selectedDevice}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-32 mx-auto mb-4 object-contain"
                />
                <h2 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-100">
                  Checking Signal Quality...
                </h2>
                <Progress
                  value={signalQuality}
                  className="h-3 bg-gray-200 dark:bg-gray-700"
                />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {signalQuality}% Connected
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignalQualityScreen;
