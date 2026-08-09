import dotenv from "dotenv";
dotenv.config();

async function listGeminiModels() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return;

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url, { method: "GET" });
    const data = await response.json();
    
    if (data.models) {
      console.log("=== Available Gemini Models ===");
      data.models.forEach((m: any) => {
        if (m.name.includes("gemini")) {
          console.log(`- ${m.name} (${m.displayName})`);
        }
      });
    } else {
      console.log("No models returned:", data);
    }
  } catch (error) {
    console.error("Failed to fetch models:", error);
  }
}

listGeminiModels();
