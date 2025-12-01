// src/utils/neurosityClient.ts
import { Neurosity } from "@neurosity/sdk";

let neurosity: Neurosity | null = null;

export interface NeurosityAuth {
  email: string;
  password: string;
  deviceId: string;
}

const STORAGE_KEY = "neurosityAuth";

export const getNeurosity = () => neurosity;

export const saveNeurosityAuth = (auth: NeurosityAuth) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
};

export const loadNeurosityAuth = (): NeurosityAuth | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export async function loginNeurosity(auth: NeurosityAuth) {
  const { email, password, deviceId } = auth;

  // IMPORTANT: assign to global neurosity variable
  neurosity = new Neurosity({ deviceId });

  await neurosity.login({
    email,
    password,
  });

  return neurosity;
}

export const logoutNeurosity = async () => {
  if (neurosity && (neurosity as any).logout) {
    try {
      await (neurosity as any).logout();
    } catch (err) {
      console.warn("Neurosity logout error:", err);
    }
  }
  neurosity = null;
};
