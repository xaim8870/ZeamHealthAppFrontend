// src/components/EEGAssessment/EEGQuestionnaire.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList } from 'lucide-react';

interface EEGQuestionnaireProps {
  onComplete: (data: any) => void;
}

const EEGQuestionnaire: React.FC<EEGQuestionnaireProps> = ({ onComplete }) => {
  const [mood, setMood] = useState<string[]>([]);
  const [wakefulness, setWakefulness] = useState<number | null>(null);
  const [medications, setMedications] = useState(false);
  const [focusLevel, setFocusLevel] = useState<number | null>(null);
  const [otherFactors, setOtherFactors] = useState('');
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [moodDetails, setMoodDetails] = useState({
    sadInterest: '',
    sadDepressed: '',
    depressedInterest: '',
    depressedDepressed: '',
    worriedNervous: '',
    worriedControl: '',
  });

  const moodOptions = [
    { value: 'happy 😊👍', label: 'Happy 😊👍', color: 'from-pink-400 to-pink-600' },
    { value: 'content 😊🙏', label: 'Content 😊🙏', color: 'from-green-400 to-green-600' },
    { value: 'neutral 😐', label: 'Neutral 😐', color: 'from-gray-400 to-gray-600' },
    { value: 'worried 😟', label: 'Worried 😟', color: 'from-yellow-400 to-yellow-600' },
    { value: 'sad 😢', label: 'Sad 😢', color: 'from-blue-400 to-blue-600' },
    { value: 'depressed 😔', label: 'Depressed 😔', color: 'from-purple-400 to-purple-600' },
  ];

  const handleMoodChange = (value: string) => {
    const updated = mood.includes(value) ? mood.filter((m) => m !== value) : [...mood, value];
    setMood(updated);
    setShowMoodForm(updated.some((m) => ['sad 😢', 'depressed 😔', 'worried 😟'].includes(m)));
  };

  const handleMoodDetailChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMoodDetails((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    if (mood.length === 0) return false;
    if (wakefulness === null || focusLevel === null) return false;
    if (showMoodForm) {
      const requiredFields = [];
      if (mood.includes('sad 😢')) requiredFields.push(moodDetails.sadInterest, moodDetails.sadDepressed);
      if (mood.includes('depressed 😔')) requiredFields.push(moodDetails.depressedInterest, moodDetails.depressedDepressed);
      if (mood.includes('worried 😟')) requiredFields.push(moodDetails.worriedNervous, moodDetails.worriedControl);
      if (requiredFields.some((val) => val === '')) return false;
    }
    if (!otherFactors.trim()) return false;
    return true;
  };

  const handleSubmit = () => {
    if (!isFormValid()) return;
    onComplete({ mood, moodDetails, wakefulness, medications, focusLevel, otherFactors });
  };

  const renderMoodForm = () => {
    if (!showMoodForm) return null;
    const options = [
      { value: '0', label: 'Not at all' },
      { value: '1', label: 'Several days' },
      { value: '2', label: 'More than half the days' },
      { value: '3', label: 'Nearly every day' },
    ];

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 mt-4 bg-gray-50 p-4 rounded-xl shadow-inner overflow-y-auto"
        >
          {mood.includes('sad 😢') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Little interest or pleasure in doing things?</label>
                <select
                  name="sadInterest"
                  value={moodDetails.sadInterest}
                  onChange={handleMoodDetailChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Feeling down, depressed, or hopeless?</label>
                <select
                  name="sadDepressed"
                  value={moodDetails.sadDepressed}
                  onChange={handleMoodDetailChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </>
          )}

          {mood.includes('depressed 😔') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Loss of interest or pleasure in daily activities?</label>
                <select
                  name="depressedInterest"
                  value={moodDetails.depressedInterest}
                  onChange={handleMoodDetailChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Feeling hopeless or worthless?</label>
                <select
                  name="depressedDepressed"
                  value={moodDetails.depressedDepressed}
                  onChange={handleMoodDetailChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </>
          )}

          {mood.includes('worried 😟') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Feeling nervous, anxious, or on edge?</label>
                <select
                  name="worriedNervous"
                  value={moodDetails.worriedNervous}
                  onChange={handleMoodDetailChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Not being able to stop worrying?</label>
                <select
                  name="worriedControl"
                  value={moodDetails.worriedControl}
                  onChange={handleMoodDetailChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-4 overflow-y-auto">
      <div className="flex items-center justify-center mb-2">
        <ClipboardList className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">Tell us about your current state</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">How's your mood today?</label>
        <div className="grid grid-cols-2 gap-3">
          {moodOptions.map((m) => (
            <motion.div
              key={m.value}
              onClick={() => handleMoodChange(m.value)}
              whileHover={{ scale: 1.05 }}
              className={`p-3 rounded-xl text-white text-center cursor-pointer bg-gradient-to-r ${m.color} shadow-md ${
                mood.includes(m.value) ? 'ring-2 ring-offset-2 ring-blue-500' : ''
              }`}
            >
              {m.label}
            </motion.div>
          ))}
        </div>
        {renderMoodForm()}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Wakefulness Level: {wakefulness ?? "Select"}</label>
        <input type="range" min="1" max="10" value={wakefulness ?? 5} onChange={(e) => setWakefulness(Number(e.target.value))} className="w-full accent-blue-500" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Drowsy</span><span>Alert</span>
        </div>
      </div>

      <div className="flex items-center">
        <input type="checkbox" id="medications" checked={medications} onChange={(e) => setMedications(e.target.checked)} className="w-4 h-4 accent-blue-500" />
        <label htmlFor="medications" className="ml-2 text-sm text-gray-700">Took medications affecting EEG today</label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Focus Level: {focusLevel ?? "Select"}</label>
        <input type="range" min="1" max="10" value={focusLevel ?? 5} onChange={(e) => setFocusLevel(Number(e.target.value))} className="w-full accent-blue-500" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Scattered</span><span>Focused</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Other Factors (e.g., caffeine, stress)</label>
        <textarea value={otherFactors} onChange={(e) => setOtherFactors(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" rows={2} />
      </div>

      <button onClick={handleSubmit} disabled={!isFormValid()}
        className={`w-full py-3 rounded-xl transition duration-300 ${isFormValid() ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-md hover:shadow-lg' : 'bg-gray-300 text-gray-500'}`}>
        Proceed to Headband
      </button>
    </div>
  );
};

export default EEGQuestionnaire;