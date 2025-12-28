import { ChevronDown, Check } from "lucide-react";
import { useState } from "react";

interface Option {
  label: string;
  value: string;
}

interface EEGDropdownProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: Option[];
}

const EEGDropdown: React.FC<EEGDropdownProps> = ({
  value,
  onChange,
  placeholder,
  options,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between
          bg-[#0b0e13] border border-gray-700 rounded-xl
          px-4 py-4 text-sm text-gray-200 hover:border-cyan-400 transition"
      >
        <span className={value ? "text-gray-200" : "text-gray-500"}>
          {value || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-2 w-full rounded-xl
          bg-[#05070b] border border-gray-700
          shadow-[0_0_25px_rgba(0,255,255,0.15)] overflow-hidden"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between
                px-4 py-3 text-sm transition
                ${
                  value === opt.value
                    ? "bg-cyan-500/10 text-cyan-300"
                    : "text-gray-300 hover:bg-white/5"
                }`}
            >
              {opt.label}
              {value === opt.value && (
                <Check className="w-4 h-4 text-cyan-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EEGDropdown;
