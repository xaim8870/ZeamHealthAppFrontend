import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MuseHeadBand from '../../assets/images/S-Athena.webp';
import neurosityHeadband from '../../assets/images/neurosity-headband.png';

export interface HeadbandSelectionProps {
  onNext: (headband: string) => void;
}

const HeadbandSelection: React.FC<HeadbandSelectionProps> = ({ onNext }) => {
  const [selectedHeadband, setSelectedHeadband] = useState<'muse' | 'neurosity' | null>(null);

  const handleSelect = (headband: 'muse' | 'neurosity') => {
    setSelectedHeadband(headband);
  };

  const Card = ({ headband, title, image }: { headband: 'muse' | 'neurosity'; title: string; image: string }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleSelect(headband)}
      className={`cursor-pointer p-4 rounded-2xl shadow-md border-2 transition-all duration-300 flex flex-col items-center 
        ${selectedHeadband === headband ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 bg-white'}`}
    >
      <img src={image} alt={title} className="w-28 h-28 rounded-lg mb-3 object-contain" />
      <h3 className="font-semibold text-md text-gray-800">{title}</h3>
      <div
        className={`mt-2 w-5 h-5 rounded-full border-2 ${
          selectedHeadband === headband ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
        }`}
      ></div>
    </motion.div>
  );

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
      >
        <h2 className="text-lg font-semibold text-gray-800 text-center">Choose Your EEG Headband</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card headband="muse" title="Muse Headband" image={MuseHeadBand} />
          <Card headband="neurosity" title="Neurosity Headband" image={neurosityHeadband} />
        </div>

        {/* Next Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => selectedHeadband && onNext(selectedHeadband)}
          disabled={!selectedHeadband}
          className={`w-full py-3 rounded-xl text-white text-md font-semibold transition-all duration-300 
            ${selectedHeadband ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md hover:shadow-lg' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          Proceed to Assessment
        </motion.button>
      </motion.div>
    </div>
  );
};

export default HeadbandSelection;