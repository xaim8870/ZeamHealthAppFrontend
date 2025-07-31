import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import HeadbandSelection from './HeadbandSelection';

interface EEGAssessmentProps {
  onBack: () => void;
  onComplete: (data: any) => void;
}

const EEGAssessment: React.FC<EEGAssessmentProps> = ({ onBack, onComplete }) => {
  const [mood, setMood] = useState<string[]>([]);
  const [wakefulness, setWakefulness] = useState(5);
  const [medications, setMedications] = useState(false);
  const [focusLevel, setFocusLevel] = useState(5);
  const [otherFactors, setOtherFactors] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [moodDetails, setMoodDetails] = useState({ sad: '', worried: '', happy: '' });
  const [showHeadbandSelection, setShowHeadbandSelection] = useState(false);
  const [assessmentData, setAssessmentData] = useState<any>({});

  const handleMoodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setMood((prev) => 
      checked ? [...prev, value] : prev.filter((m) => m !== value)
    );
    if (checked && (value === 'sad' || value === 'worried' || value === 'happy')) {
      setShowMoodForm(true);
    }
  };

  const handleMoodDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMoodDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const fullData = {
      mood,
      moodDetails,
      wakefulness,
      medications,
      focusLevel,
      otherFactors,
    };
    setAssessmentData(fullData);
    setIsSubmitted(true);
    setShowHeadbandSelection(true);
  };

  const renderMoodForm = () => {
    if (!showMoodForm) return null;
    return (
      <div className="space-y-4 mt-4">
        {mood.includes('sad') && (
          <div>
            <label className="block font-medium text-sm text-gray-700">Why are you sad?</label>
            <input
              type="text"
              name="sad"
              value={moodDetails.sad}
              onChange={handleMoodDetailChange}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
        )}
        {mood.includes('worried') && (
          <div>
            <label className="block font-medium text-sm text-gray-700">Why are you worried?</label>
            <input
              type="text"
              name="worried"
              value={moodDetails.worried}
              onChange={handleMoodDetailChange}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
        )}
        {mood.includes('happy') && (
          <div>
            <label className="block font-medium text-sm text-gray-700">Why are you happy?</label>
            <input
              type="text"
              name="happy"
              value={moodDetails.happy}
              onChange={handleMoodDetailChange}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
        )}
      </div>
    );
  };

  if (showHeadbandSelection) {
    return <HeadbandSelection onBack={onBack} onComplete={onComplete} assessmentData={assessmentData} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center mb-20">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg shadow mb-4 flex items-center"
        >
          <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <ClipboardList className="ml-2 w-6 h-6" />
          <h1 className="ml-2 text-xl font-bold">EEG Assessment</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
          style={{ minHeight: 'calc(100vh - 200px)' }}
        >
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-sm text-gray-700">Mood (Select all that apply)</label>
              <div className="mt-1 space-y-2">
                {['happy', 'sad', 'worried'].map((m) => (
                  <label key={m} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={m}
                      checked={mood.includes(m)}
                      onChange={handleMoodChange}
                    />
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </label>
                ))}
              </div>
              {renderMoodForm()}
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
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
              disabled={isSubmitted}
            >
              Submit Assessment
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EEGAssessment;