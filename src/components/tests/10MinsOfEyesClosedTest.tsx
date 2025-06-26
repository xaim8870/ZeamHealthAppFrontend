import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

interface TenMinEyesClosedTestProps {
  onBack: () => void;
  onComplete: (data: any) => void;
}

const TenMinEyesClosedTest = ({ onBack, onComplete }: TenMinEyesClosedTestProps) => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [displayText, setDisplayText] = useState("");

  const handleStart = () => {
    setIsStarted(true);
    setDisplayText("Test started - Follow the instructions");
    
    // Simulate the test sequence
    setTimeout(() => {
      setDisplayText("Close your eyes when you hear the tone in 5 seconds");
      setTimeout(() => {
        setDisplayText("Eyes closed - 10 minutes recording in progress");
        setTimeout(() => {
          setDisplayText("Open your eyes - Test completed");
          setTimeout(() => {
            onComplete({
              duration: 600, // 10 minutes in seconds
              alphaPower: (Math.random() * 15 + 8).toFixed(1),
              testType: "10 Minutes Eyes Closed",
              timestamp: new Date().toISOString()
            });
          }, 2000);
        }, 10000); // Simulate 10 minutes with 10 seconds for demo
      }, 5000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-4xl mx-auto pb-6">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-10 px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                <EyeOff className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">10 Minutes of Eyes Closed</h1>
            </div>
          </div>
        </div>

        <div className="px-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Instructions */}
            <div className="space-y-6">
              {/* Main Content */}
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h1 className="text-2xl font-normal text-gray-900 mb-8">
                  10 Minutes of Eyes Closed
                </h1>
                
                <div className="space-y-6 text-gray-700">
                  <div className="flex gap-3">
                    <span className="font-medium">1)</span>
                    <p className="leading-relaxed">
                      Close your eyes when you hear the tone in 5 seconds. Open your eyes in 10 minutes after the second tone plays.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="font-medium">2)</span>
                    <p className="leading-relaxed">
                      Close your eyes
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="font-medium">3)</span>
                    <p className="leading-relaxed">
                      Open your eyes
                    </p>
                  </div>
                </div>
                
                <div className="mt-12">
                  <button
                    onClick={handleStart}
                    disabled={isStarted}
                    className="px-8 py-3 bg-white border-2 border-black text-black font-medium rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isStarted ? "Test Running..." : "Start"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Test Display */}
            <div>
              <div className="bg-white rounded-lg shadow-sm h-full">
                <div className="h-full border border-gray-200 rounded-lg flex items-center justify-center bg-white p-8 min-h-96">
                  {displayText ? (
                    <div className="text-center">
                      {displayText.includes("Eyes closed") ? (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <EyeOff className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-lg font-medium text-gray-700">
                            {displayText}
                          </p>
                          <div className="flex justify-center items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                          </div>
                        </div>
                      ) : displayText.includes("Open your eyes") ? (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                            <Eye className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-lg font-medium text-gray-700">
                            {displayText}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto">
                            <Eye className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-lg font-medium text-gray-700">
                            {displayText}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <EyeOff className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">Test status will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenMinEyesClosedTest; // Changed to default export