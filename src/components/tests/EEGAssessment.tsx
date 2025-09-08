// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { ArrowLeft, ClipboardList } from 'lucide-react';
// import HeadbandSelection from './HeadbandSelection';

// interface EEGAssessmentProps {
//   onBack: () => void;
//   onComplete: (data: any) => void;
// }

// const EEGAssessment: React.FC<EEGAssessmentProps> = ({ onBack, onComplete }) => {
//   const [mood, setMood] = useState<string[]>([]);
//   const [wakefulness, setWakefulness] = useState<number | null>(null);
//   const [medications, setMedications] = useState(false);
//   const [focusLevel, setFocusLevel] = useState<number | null>(null);
//   const [otherFactors, setOtherFactors] = useState('');
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [showMoodForm, setShowMoodForm] = useState(false);
//   const [moodDetails, setMoodDetails] = useState({
//     sadInterest: '',
//     sadDepressed: '',
//     depressedInterest: '',
//     depressedDepressed: '',
//     worriedNervous: '',
//     worriedControl: '',
//   });
//   const [showHeadbandSelection, setShowHeadbandSelection] = useState(false);
//   const [assessmentData, setAssessmentData] = useState<any>({});

//   const moodOptions = [
//     { value: 'happy 😊👍', label: 'Happy 😊👍', color: 'from-pink-400 to-pink-600' },
//     { value: 'content 😊🙏', label: 'Content 😊🙏', color: 'from-green-400 to-green-600' },
//     { value: 'neutral 😐', label: 'Neutral 😐', color: 'from-gray-400 to-gray-600' },
//     { value: 'worried 😟', label: 'Worried 😟', color: 'from-yellow-400 to-yellow-600' },
//     { value: 'sad 😢', label: 'Sad 😢', color: 'from-blue-400 to-blue-600' },
//     { value: 'depressed 😔', label: 'Depressed 😔', color: 'from-purple-400 to-purple-600' },
//   ];

//   const handleMoodChange = (value: string) => {
//     const updated = mood.includes(value) ? mood.filter((m) => m !== value) : [...mood, value];
//     setMood(updated);
//     setShowMoodForm(updated.some((m) => ['sad 😢', 'depressed 😔', 'worried 😟'].includes(m)));
//   };

//   const handleMoodDetailChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setMoodDetails((prev) => ({ ...prev, [name]: value }));
//   };

//   // Validation check: all required fields must be filled
//   const isFormValid = () => {
//     if (mood.length === 0) return false;
//     if (wakefulness === null || focusLevel === null) return false;
//     if (showMoodForm) {
//       const requiredFields = [];
//       if (mood.includes('sad 😢')) requiredFields.push(moodDetails.sadInterest, moodDetails.sadDepressed);
//       if (mood.includes('depressed 😔')) requiredFields.push(moodDetails.depressedInterest, moodDetails.depressedDepressed);
//       if (mood.includes('worried 😟')) requiredFields.push(moodDetails.worriedNervous, moodDetails.worriedControl);
//       if (requiredFields.some((val) => val === '')) return false;
//     }
//     if (!otherFactors.trim()) return false;
//     return true;
//   };

//   const handleSubmit = () => {
//     if (!isFormValid()) return;
//     const fullData = { mood, moodDetails, wakefulness, medications, focusLevel, otherFactors };
//     setAssessmentData(fullData);
//     setIsSubmitted(true);
//     setShowHeadbandSelection(true);
//   };

//   const renderMoodForm = () => {
//     if (!showMoodForm) return null;
//     const options = [
//       { value: '0', label: 'Not at all' },
//       { value: '1', label: 'Several days' },
//       { value: '2', label: 'More than half the days' },
//       { value: '3', label: 'Nearly every day' },
//     ];

//     return (
//       <AnimatePresence>
//         <motion.div
//           initial={{ opacity: 0, height: 0 }}
//           animate={{ opacity: 1, height: 'auto' }}
//           exit={{ opacity: 0, height: 0 }}
//           className="space-y-4 mt-4 bg-gray-50 p-4 rounded-lg shadow-inner max-h-[80vh] overflow-y-auto"
//         >
//           {(mood.includes('sad 😢') || mood.includes('depressed 😔')) && (
//             <>
//               <div>
//                 <label className="block font-medium text-sm">Little interest or pleasure in doing things?</label>
//                 <select
//                   name={mood.includes('sad 😢') ? 'sadInterest' : 'depressedInterest'}
//                   value={mood.includes('sad 😢') ? moodDetails.sadInterest : moodDetails.depressedInterest}
//                   onChange={handleMoodDetailChange}
//                   className="w-full mt-1 p-2 border rounded"
//                 >
//                   <option value="">Select</option>
//                   {options.map((opt) => (
//                     <option key={opt.value} value={opt.value}>{opt.label}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block font-medium text-sm">Feeling down, depressed, or hopeless?</label>
//                 <select
//                   name={mood.includes('sad 😢') ? 'sadDepressed' : 'depressedDepressed'}
//                   value={mood.includes('sad 😢') ? moodDetails.sadDepressed : moodDetails.depressedDepressed}
//                   onChange={handleMoodDetailChange}
//                   className="w-full mt-1 p-2 border rounded"
//                 >
//                   <option value="">Select</option>
//                   {options.map((opt) => (
//                     <option key={opt.value} value={opt.value}>{opt.label}</option>
//                   ))}
//                 </select>
//               </div>
//             </>
//           )}
//           {mood.includes('worried 😟') && (
//             <>
//               <div>
//                 <label className="block font-medium text-sm">Feeling nervous, anxious, or on edge?</label>
//                 <select
//                   name="worriedNervous"
//                   value={moodDetails.worriedNervous}
//                   onChange={handleMoodDetailChange}
//                   className="w-full mt-1 p-2 border rounded"
//                 >
//                   <option value="">Select</option>
//                   {options.map((opt) => (
//                     <option key={opt.value} value={opt.value}>{opt.label}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block font-medium text-sm">Not being able to stop worrying?</label>
//                 <select
//                   name="worriedControl"
//                   value={moodDetails.worriedControl}
//                   onChange={handleMoodDetailChange}
//                   className="w-full mt-1 p-2 border rounded"
//                 >
//                   <option value="">Select</option>
//                   {options.map((opt) => (
//                     <option key={opt.value} value={opt.value}>{opt.label}</option>
//                   ))}
//                 </select>
//               </div>
//             </>
//           )}
//         </motion.div>
//       </AnimatePresence>
//     );
//   };

//   if (showHeadbandSelection) {
//     return (
//       <HeadbandSelection
//         onBack={() => setShowHeadbandSelection(false)}
//         onComplete={(device) => {
//           onComplete({ ...assessmentData, device });
//           setShowHeadbandSelection(false);
//         }}
//         assessmentData={assessmentData}
//       />
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 flex items-center justify-center mb-20">
//       <div className="w-full max-w-lg">
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg shadow-lg mb-4 flex items-center"
//         >
//           <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full">
//             <ArrowLeft className="w-6 h-6 text-white" />
//           </button>
//           <ClipboardList className="ml-2 w-6 h-6" />
//           <h1 className="ml-2 text-xl font-bold">EEG Assessment</h1>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white rounded-xl shadow-xl p-6 space-y-6"
//         >
//           <div>
//             <label className="block font-medium mb-2">Select Mood</label>
//             <div className="grid grid-cols-2 gap-3">
//               {moodOptions.map((m) => (
//                 <motion.div
//                   key={m.value}
//                   onClick={() => handleMoodChange(m.value)}
//                   whileHover={{ scale: 1.05 }}
//                   className={`p-3 rounded-lg text-white text-center cursor-pointer bg-gradient-to-r ${m.color} shadow-md ${
//                     mood.includes(m.value) ? 'ring-4 ring-indigo-300' : ''
//                   }`}
//                 >
//                   {m.label}
//                 </motion.div>
//               ))}
//             </div>
//             {renderMoodForm()}
//           </div>

//           <div>
//             <label className="block font-medium">Wakefulness: {wakefulness ?? "Not Selected"}</label>
//             <input
//               type="range"
//               min="1"
//               max="10"
//               value={wakefulness ?? 5}
//               onChange={(e) => setWakefulness(Number(e.target.value))}
//               className="w-full accent-green-500"
//             />
//           </div>

//           <div>
//             <label className="flex items-center gap-2 font-medium">
//               <input
//                 type="checkbox"
//                 checked={medications}
//                 onChange={(e) => setMedications(e.target.checked)}
//                 className="accent-blue-500"
//               />
//               Took medications impacting EEG today
//             </label>
//           </div>

//           <div>
//             <label className="block font-medium">Focus Level: {focusLevel ?? "Not Selected"}</label>
//             <input
//               type="range"
//               min="1"
//               max="10"
//               value={focusLevel ?? 5}
//               onChange={(e) => setFocusLevel(Number(e.target.value))}
//               className="w-full accent-purple-500"
//             />
//           </div>

//           <div>
//             <label className="block font-medium">Other Factors</label>
//             <textarea
//               value={otherFactors}
//               onChange={(e) => setOtherFactors(e.target.value)}
//               placeholder="e.g., caffeine, stress, sleep..."
//               className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//           </div>

//           <button
//             onClick={handleSubmit}
//             className={`w-full py-2 rounded-lg shadow-lg transition ${
//               isFormValid() ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//             }`}
//             disabled={!isFormValid() || isSubmitted}
//           >
//             Start EEG Assessment
//           </button>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default EEGAssessment;
