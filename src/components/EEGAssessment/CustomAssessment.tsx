// CustomAssessment.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings2 } from 'lucide-react';

interface CustomAssessmentProps {
  onBack: () => void;
  onComplete: (data: any) => void;
}

const CustomAssessment: React.FC<CustomAssessmentProps> = ({ onBack, onComplete }) => {
  const [mood, setMood] = useState('');
  const [wakefulness, setWakefulness] = useState(5);
  const [medications, setMedications] = useState(false);
  const [focusLevel, setFocusLevel] = useState(5);
  const [otherFactors, setOtherFactors] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    const assessmentData = {
      mood,
      wakefulness,
      medications,
      focusLevel,
      otherFactors,
      sequence: [
        '2 Min Eyes Closed',
        '2 Min Eyes Open',
        'Alpha Resting State',
        'Alpha Reactive State',
        'ERP Assessment (Optional)',
        'Interactive Assessment for Focus (Optional)'
      ]
    };
    setIsSubmitted(true);
    onComplete(assessmentData);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-lg shadow mb-4 flex items-center"
        >
          <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <Settings2 className="ml-2 w-6 h-6" />
          <h1 className="ml-2 text-xl font-bold">Custom Assessment</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-sm text-gray-700">Mood</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              >
                <option value="">Select Mood</option>
                <option value="happy">Happy</option>
                <option value="sad">Sad</option>
                <option value="worried">Worried</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-sm text-gray-700">Wakefulness (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={wakefulness}
                onChange={(e) => setWakefulness(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-600">{wakefulness}</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={medications}
                  onChange={(e) => setMedications(e.target.checked)}
                />
                Took medications that impact EEG today
              </label>
            </div>

            <div>
              <label className="block font-medium text-sm text-gray-700">Subjective Focus Level (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={focusLevel}
                onChange={(e) => setFocusLevel(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-600">{focusLevel}</p>
            </div>

            <div>
              <label className="block font-medium text-sm text-gray-700">Other EEG-impacting factors</label>
              <textarea
                value={otherFactors}
                onChange={(e) => setOtherFactors(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Optional: e.g., caffeine, substance use, etc."
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
            >
              Submit Assessment
            </button>

            {isSubmitted && <p className="text-center text-purple-600 mt-4">Assessment submitted!</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomAssessment;
