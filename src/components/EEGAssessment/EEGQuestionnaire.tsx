// src/components/EEGAssessment/EEGQuestionnaire.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ClipboardList } from 'lucide-react';

interface EEGQuestionnaireProps {
  onBack: () => void;
  onComplete: (data: any) => void;
}

const EEGQuestionnaire: React.FC<EEGQuestionnaireProps> = ({ onBack, onComplete }) => {
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
          className="space-y-4 mt-4 bg-gray-50 p-4 rounded-lg shadow-inner max-h-[60vh] overflow-y-auto sm:max-w-full"
        >
          {mood.includes('sad 😢') && (
            <>
              <div className="w-full">
                <label className="block text-sm font-medium">Little interest or pleasure in doing things?</label>
                <select
                  name="sadInterest"
                  value={moodDetails.sadInterest}
                  onChange={handleMoodDetailChange}
                  className="w-full mt-1 p-2 border rounded"
                >
                  <option value="">Select</option>
                  {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium">Feeling down, depressed, or hopeless?</label>
                <select
                  name="sadDepressed"
                  value={moodDetails.sadDepressed}
                  onChange={handleMoodDetailChange}
                  className="w-full mt-1 p-2 border rounded"
                >
                  <option value="">Select</option>
                  {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </>
          )}

          {mood.includes('depressed 😔') && (
            <>
              <div className="w-full">
                <label className="block text-sm font-medium">Loss of interest or pleasure in daily activities?</label>
                <select
                  name="depressedInterest"
                  value={moodDetails.depressedInterest}
                  onChange={handleMoodDetailChange}
                  className="w-full mt-1 p-2 border rounded"
                >
                  <option value="">Select</option>
                  {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium">Feeling hopeless or worthless?</label>
                <select
                  name="depressedDepressed"
                  value={moodDetails.depressedDepressed}
                  onChange={handleMoodDetailChange}
                  className="w-full mt-1 p-2 border rounded"
                >
                  <option value="">Select</option>
                  {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </>
          )}

          {mood.includes('worried 😟') && (
            <>
              <div className="w-full">
                <label className="block text-sm font-medium">Feeling nervous, anxious, or on edge?</label>
                <select
                  name="worriedNervous"
                  value={moodDetails.worriedNervous}
                  onChange={handleMoodDetailChange}
                  className="w-full mt-1 p-2 border rounded"
                >
                  <option value="">Select</option>
                  {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium">Not being able to stop worrying?</label>
                <select
                  name="worriedControl"
                  value={moodDetails.worriedControl}
                  onChange={handleMoodDetailChange}
                  className="w-full mt-1 p-2 border rounded"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg shadow-lg mb-4 flex items-center"
        >
          <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <ClipboardList className="ml-2 w-6 h-6" />
          <h1 className="ml-2 text-xl font-bold">EEG Questionnaire</h1>
        </motion.div>

        <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
          <div>
            <label className="block font-medium mb-2">Select Mood</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {moodOptions.map((m) => (
                <motion.div
                  key={m.value}
                  onClick={() => handleMoodChange(m.value)}
                  whileHover={{ scale: 1.05 }}
                  className={`p-3 rounded-lg text-white text-center cursor-pointer bg-gradient-to-r ${m.color} ${
                    mood.includes(m.value) ? 'ring-4 ring-indigo-300' : ''
                  }`}
                >
                  {m.label}
                </motion.div>
              ))}
            </div>
            {renderMoodForm()}
          </div>

          <div>
            <label className="block font-medium">Wakefulness: {wakefulness ?? "Not Selected"}</label>
            <input type="range" min="1" max="10" value={wakefulness ?? 5} onChange={(e) => setWakefulness(Number(e.target.value))} className="w-full" />
          </div>

          <div>
            <label className="flex items-center gap-2 font-medium">
              <input type="checkbox" checked={medications} onChange={(e) => setMedications(e.target.checked)} />
              Took medications impacting EEG today
            </label>
          </div>

          <div>
            <label className="block font-medium">Focus Level: {focusLevel ?? "Not Selected"}</label>
            <input type="range" min="1" max="10" value={focusLevel ?? 5} onChange={(e) => setFocusLevel(Number(e.target.value))} className="w-full" />
          </div>

          <div>
            <label className="block font-medium">Other Factors</label>
            <textarea value={otherFactors} onChange={(e) => setOtherFactors(e.target.value)} placeholder="e.g., caffeine, stress, sleep..." className="w-full p-2 border rounded" />
          </div>

          <button onClick={handleSubmit} disabled={!isFormValid()}
            className={`w-full py-2 rounded-lg transition ${isFormValid() ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
            Start EEG Process
          </button>
        </div>
      </div>
    </div>
  );
};

export default EEGQuestionnaire;
