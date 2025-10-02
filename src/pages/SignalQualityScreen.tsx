import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import neurosityImg from "../assets/images/neurosity-headband.png";
import sAthenaImg from "../assets/images/S-Athena.webp";
import { useDevice } from "../context/DeviceContext";

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
            // ✅ Update global state and navigate
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="shadow-xl border-0">
          <CardContent className="p-6 text-center">
            {!selectedDevice ? (
              <>
                <h2 className="font-bold text-lg mb-4">Choose your Headband</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setSelectedDevice("neurosity")}
                    className="cursor-pointer border rounded-lg p-3 hover:shadow-lg transition"
                  >
                    <img src={neurosityImg} alt="Neurosity" className="w-24 h-24 mx-auto mb-2" />
                    <p className="text-sm font-medium">Neurosity</p>
                  </div>
                  <div
                    onClick={() => setSelectedDevice("s-athena")}
                    className="cursor-pointer border rounded-lg p-3 hover:shadow-lg transition"
                  >
                    <img src={sAthenaImg} alt="S-Athena" className="w-24 h-24 mx-auto mb-2" />
                    <p className="text-sm font-medium">Muse S Athena</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <img
                  src={selectedDevice === "neurosity" ? neurosityImg : sAthenaImg}
                  alt={selectedDevice}
                  className="w-28 mx-auto mb-4"
                />
                <h2 className="font-bold text-xl mb-2">Checking Signal Quality...</h2>
                <Progress value={signalQuality} className="h-3" />
                <p className="mt-2 text-sm text-gray-600">{signalQuality}%</p>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignalQualityScreen;
