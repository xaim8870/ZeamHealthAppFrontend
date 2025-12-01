const BASE_URL = "http://localhost:3000";

export const saveEEGResults = async (results) => {
  const userId = localStorage.getItem("userId") || "guest";

  try {
    const res = await fetch(`${BASE_URL}/api/eeg/save-results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, results }),
    });

    return await res.json();
  } catch (err) {
    console.error("Error saving EEG results:", err);
    return { success: false };
  }
};
