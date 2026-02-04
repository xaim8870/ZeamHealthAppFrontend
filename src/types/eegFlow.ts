export type EEGStep =
  | "questionnaire"
  | "getReady"
  | "eyes"
  | "alphaResting"
  | "breathing"
  | "alphaReactive"
  | "mentalSubtraction"
  | "postEEG";

export const STEP_ORDER: EEGStep[] = [
  "questionnaire",
  "getReady",
  "eyes",
  "alphaResting",
  "breathing",
  "alphaReactive",
  "mentalSubtraction",
  "postEEG",
];
