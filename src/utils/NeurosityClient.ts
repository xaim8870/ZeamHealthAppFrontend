// src/utils/neurosityClient.ts
import { Neurosity } from "@neurosity/sdk";

export interface NeurosityAuth {
  email: string;
  password: string;
  deviceId: string;
}

// GLOBAL shared instance (fixes missing variable error)
let neurosity: Neurosity | null = null;

// Storage key
const STORAGE_KEY = "neurosityAuth";

// Save credentials
export const saveNeurosityAuth = (auth: NeurosityAuth) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
};

// Load credentials
export const loadNeurosityAuth = (): NeurosityAuth | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Login and create SDK instance
export async function loginNeurosity(auth: NeurosityAuth) {
  const { email, password, deviceId } = auth;

  // Create a fresh instance
  neurosity = new Neurosity({
    deviceId,           // <-- only valid property
  });

  // Authenticate
  await neurosity.login({ email, password });

  // Allow device to initialize EEG sensors
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return neurosity;
}

// Logout
export const logoutNeurosity = async (instance?: Neurosity | null) => {
  try {
    const target = instance ?? neurosity;
    if (target && (target as any).logout) {
      await (target as any).logout();
    }
  } catch (err) {
    console.warn("Neurosity logout error:", err);
  }
};
