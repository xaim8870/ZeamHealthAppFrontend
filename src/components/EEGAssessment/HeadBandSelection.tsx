import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import MuseHeadBand from '../../assets/images/S-Athena.webp';
import neurosityHeadband from '../../assets/images/neurosity-headband.png';

export interface HeadbandSelectionProps {
  onBack: () => void;
  onNext: (headband: string) => void;
}

const HeadbandSelection: React.FC<HeadbandSelectionProps> = ({ onBack, onNext }) => {
  const [selectedHeadband, setSelectedHeadband] = useState<'muse' | 'neurosity' | null>(null);

  const handleSelect = (headband: 'muse' | 'neurosity') => {
    setSelectedHeadband(headband);
  };

  const Card = ({ headband, title, image }: { headband: 'muse' | 'neurosity'; title: string; image: string }) => (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleSelect(headband)}
      className={`cursor-pointer p-4 rounded-2xl shadow-md border-2 transition-all duration-300 flex flex-col items-center 
        ${selectedHeadband === headband ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' : 'border-gray-200 bg-white'}`}
    >
      <img src={image} alt={title} className="w-32 h-32 rounded-xl mb-3 object-cover" />
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <div
        className={`w-5 h-5 rounded-full border-2 ${
          selectedHeadband === headband ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
        }`}
      ></div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-xl shadow mb-4 flex items-center"
        >
          <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="ml-2 text-xl font-bold">EEG Assessment</h1>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow p-6 space-y-6"
        >
          <h2 className="text-xl font-bold text-center mb-4">Select Your Headband</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card headband="muse" title="Muse Headband" image={MuseHeadBand} />
            <Card headband="neurosity" title="Neurosity Headband" image={neurosityHeadband} />
          </div>

          {/* Next Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => selectedHeadband && onNext(selectedHeadband)}
            disabled={!selectedHeadband}
            className={`w-full py-3 rounded-xl text-white text-lg font-semibold transition-all duration-300 
              ${selectedHeadband ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:shadow-lg' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            Next
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default HeadbandSelection;
