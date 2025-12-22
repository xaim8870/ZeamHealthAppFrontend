type EEGSource = "neurosity" | "muse" | null;

interface EEGContextType {
  source: EEGSource;
  start: () => Promise<void>;
  stop: () => void;
  onData: (cb: (data: EEGFrame) => void) => void;
}

export const EEGContext = createContext<EEGContextType>(null!);
