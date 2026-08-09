import dotenv from "dotenv";
dotenv.config();

async function listModels() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    console.error("No key found!");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const status = response.status;
    const body = await response.text();

    console.log(`Response Status: ${status}`);
    console.log(`Response Body: ${body}`);
  } catch (error) {
    console.error("Fetch request failed:", error);
  }
}

listModels();
