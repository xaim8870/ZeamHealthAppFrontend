import { ArrowLeft } from "lucide-react";

interface Props {
  onBack: () => void;
  eegStatus: string;
  frameCount: number;
}

const EEGHeader: React.FC<Props> = ({
  onBack,
  eegStatus,
  frameCount,
}) => {
  return (
    <div className="w-full flex justify-center mt-5">
      <div className="w-full max-w-md px-6 py-4 border border-gray-800 rounded-t-2xl flex justify-between items-center">
        <button onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h1 className="text-sm font-medium">
            EEG In Progress…
          </h1>
          <span className="text-[10px] text-cyan-400">
            EEG {eegStatus} • {frameCount} frames
          </span>
        </div>

        <div className="w-5" />
      </div>
    </div>
  );
};

export default EEGHeader;
